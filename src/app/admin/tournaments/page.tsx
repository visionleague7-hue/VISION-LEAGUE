'use client';

import React, { useState } from 'react';
import { useAppState } from '@/lib/state-context';
import { Tournament, GameType, TournamentFormat, TournamentTier, CompetitionMode } from '@/lib/types';
import { formatBRL, formatDate } from '@/lib/utils';
import ImageUploader from '@/components/admin/ImageUploader';
import {
  Trophy,
  PlusCircle,
  Edit2,
  Trash2,
  Sparkles,
  Users,
  DollarSign,
  X,
  CheckCircle2,
  AlertCircle,
  Swords,
  Ban,
  Clock,
  ShieldCheck,
  RotateCcw,
  GitBranch,
  Flame,
} from 'lucide-react';

export default function TournamentsAdminPage() {
  const {
    tournaments,
    addTournament,
    updateTournament,
    deleteTournament,
    cancelTournament,
    declareTournamentWinner,
  } = useAppState();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTourn, setEditingTourn] = useState<Tournament | null>(null);

  // Feedback de cancelamento / ações
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Winner declaration modal states
  const [winnerModalTourn, setWinnerModalTourn] = useState<Tournament | null>(null);
  const [winnerTeamName, setWinnerTeamName] = useState('');
  const [winnerFeedback, setWinnerFeedback] = useState<{ success: boolean; message: string } | null>(
    null
  );

  // Form states
  const [title, setTitle] = useState('');
  const [game, setGame] = useState<GameType>('Valorant');
  const [tier, setTier] = useState<TournamentTier>('Vision');
  const [competitionMode, setCompetitionMode] = useState<CompetitionMode>('bracket');
  const [rankLimit, setRankLimit] = useState('Open (Sem Limite)');
  const [bannerUrl, setBannerUrl] = useState('');
  const [entryFee, setEntryFee] = useState<string>('50');
  const [prizePool, setPrizePool] = useState<string>('5000');
  const [firstPlacePrize, setFirstPlacePrize] = useState<string>('3500');
  const [maxTeams, setMaxTeams] = useState<number>(8);
  const [format, setFormat] = useState<TournamentFormat>('single_elimination');
  const [rules, setRules] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('20:00');

  const handleGameChange = (selectedGame: GameType) => {
    setGame(selectedGame);
    // REGRA DEADLOCK: Desativa e fixa rank em Open
    if (selectedGame === 'Deadlock') {
      setRankLimit('Open (Sem Limite de Elo)');
    } else if (rankLimit === 'Open (Sem Limite de Elo)') {
      setRankLimit('Open (Sem Limite)');
    }
  };

  const handleOpenCreate = () => {
    setEditingTourn(null);
    setTitle('');
    setGame('Valorant');
    setTier('Vision');
    setCompetitionMode('bracket');
    setRankLimit('Diamante+');
    setBannerUrl('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1000&q=80');
    setEntryFee('50');
    setPrizePool('5000');
    setFirstPlacePrize('3500');
    setMaxTeams(8);
    setFormat('single_elimination');
    setRules('Formato 5v5 Competitivo oficial. Map pool padrão de torneio.');
    setStartDate(new Date().toISOString().split('T')[0]);
    setStartTime('20:00');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tourn: Tournament) => {
    setEditingTourn(tourn);
    setTitle(tourn.title);
    setGame(tourn.game);
    setTier(tourn.tier || 'Vision');
    setCompetitionMode(tourn.competitionMode || 'bracket');
    setRankLimit(tourn.game === 'Deadlock' ? 'Open (Sem Limite de Elo)' : tourn.rankLimit || 'Open (Sem Limite)');
    setBannerUrl(tourn.bannerUrl);
    setEntryFee(tourn.entryFee.toString());
    setPrizePool(tourn.prizePool.toString());
    setFirstPlacePrize((tourn.firstPlacePrize || tourn.prizePool).toString());
    setMaxTeams(tourn.maxTeams);
    setFormat(tourn.format);
    setRules(tourn.rules);
    setStartDate(tourn.startDate.split('T')[0]);
    setStartTime(tourn.startTime || '20:00');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !bannerUrl) {
      alert('Preencha o título e a imagem do campeonato.');
      return;
    }

    const feeNum = parseFloat(entryFee) || 0;
    const prizeNum = parseFloat(prizePool) || 0;
    const firstPrizeNum = parseFloat(firstPlacePrize) || prizeNum;
    const isDeadlock = game === 'Deadlock';

    if (editingTourn) {
      updateTournament(editingTourn.id, {
        title,
        game,
        tier,
        competitionMode,
        rankLimit: isDeadlock ? 'Open (Sem Limite de Elo)' : rankLimit,
        isOpenRank: isDeadlock || rankLimit.toLowerCase().includes('open'),
        bannerUrl,
        entryFee: feeNum,
        prizePool: prizeNum,
        firstPlacePrize: firstPrizeNum,
        maxTeams,
        format,
        rules,
        startDate: new Date(startDate).toISOString().split('T')[0],
        startTime,
      });
    } else {
      addTournament({
        title,
        slug: title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
        game,
        tier,
        competitionMode,
        rankLimit: isDeadlock ? 'Open (Sem Limite de Elo)' : rankLimit,
        isOpenRank: isDeadlock || rankLimit.toLowerCase().includes('open'),
        bannerUrl,
        entryFee: feeNum,
        prizePool: prizeNum,
        firstPlacePrize: firstPrizeNum,
        platformFeePercent: 10,
        maxTeams,
        format,
        status: 'open',
        rules,
        startDate: new Date(startDate).toISOString().split('T')[0],
        startTime,
      });
    }

    setIsModalOpen(false);
  };

  const handleCancelTournamentWithRefund = (tourn: Tournament) => {
    const confirmCancel = confirm(
      `ATENÇÃO: Deseja realmente cancelar o campeonato "${tourn.title}"?\n\nO valor das inscrições será ESTORNADO AUTOMATICAMENTE para a Carteira Virtual de todos os times inscritos para que possam se inscrever em outro campeonato!`
    );

    if (confirmCancel) {
      const res = cancelTournament(tourn.id, 'Cancelado pelo Administrador da Plataforma');
      setActionFeedback(res.message);
      setTimeout(() => setActionFeedback(null), 5000);
    }
  };

  const handleConfirmWinner = async () => {
    if (!winnerModalTourn || !winnerTeamName.trim()) return;

    const res = await declareTournamentWinner(
      winnerModalTourn.id,
      `team-${Date.now()}`,
      winnerTeamName.trim()
    );

    setWinnerFeedback(res);
    if (res.success) {
      setTimeout(() => {
        setWinnerModalTourn(null);
        setWinnerFeedback(null);
        setWinnerTeamName('');
      }, 3000);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-amber-400 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-500/30 mb-2">
            <Trophy className="w-3.5 h-3.5" />
            <span>Gestão de Torneios & CMS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Gerenciador de Campeonatos & Chaves
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm">
            Configure torneios por jogo (Valorant, LoL, Deadlock) e categoria (Amador, Vision, Profissional), defina horários, estorne cancelamentos e pague premiações automáticas.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-3 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-red-900/40 flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Criar Campeonato</span>
        </button>
      </div>

      {actionFeedback && (
        <div className="p-4 bg-emerald-950 border border-emerald-500/40 text-emerald-300 rounded-2xl flex items-center gap-2 text-xs font-bold animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Grid de Campeonatos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.map((tourn) => {
          const isDeadlock = tourn.game === 'Deadlock';
          const isCancelled = tourn.status === 'cancelled';

          return (
            <div
              key={tourn.id}
              className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition-all shadow-lg ${
                isCancelled
                  ? 'border-rose-900/60 bg-dark-900/60 opacity-80'
                  : 'border-dark-800 bg-dark-900 hover:border-amber-500/40'
              }`}
            >
              {/* Header com Banner */}
              <div className="relative h-40 w-full overflow-hidden bg-dark-950">
                <img
                  src={tourn.bannerUrl}
                  alt={tourn.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/40 to-transparent" />

                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-dark-900/90 text-red-300 border border-red-500/30">
                    {tourn.game}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-dark-900/80 text-gray-300 border border-gray-700/40">
                    {tourn.tier || 'Vision'}
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                      tourn.status === 'open'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        : tourn.status === 'ongoing'
                        ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                        : tourn.status === 'finished'
                        ? 'bg-dark-800 text-gray-400'
                        : 'bg-rose-950 text-rose-300 border border-rose-600/40'
                    }`}
                  >
                    {tourn.status === 'open'
                      ? 'Inscrições Abertas'
                      : tourn.status === 'ongoing'
                      ? 'Em Andamento'
                      : tourn.status === 'finished'
                      ? 'Finalizado'
                      : 'Cancelado (Reembolsado)'}
                  </span>
                </div>
              </div>

              {/* Informações */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-extrabold text-white text-base uppercase tracking-tight line-clamp-1">
                    {tourn.title}
                  </h3>

                  {/* Detalhe de Elo / Rank */}
                  <div className="mt-2">
                    {isDeadlock ? (
                      <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Deadlock: Sem Limite de Elo (Open)
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-gray-300 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Elo: {tourn.rankLimit || 'Open (Sem Restrição)'}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-dark-850 border border-dark-750">
                      <span className="text-[10px] text-gray-500 block uppercase font-bold">
                        Premiação
                      </span>
                      <span className="font-bold text-amber-400 font-mono">
                        {formatBRL(tourn.prizePool)}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-dark-850 border border-dark-750">
                      <span className="text-[10px] text-gray-500 block uppercase font-bold">
                        Taxa Inscrição
                      </span>
                      <span className="font-bold text-white font-mono">
                        {tourn.entryFee > 0 ? formatBRL(tourn.entryFee) : 'Grátis'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-gray-400 flex items-center justify-between">
                    <span>Vagas: {tourn.registeredTeamsCount} / {tourn.maxTeams}</span>
                    <span className="flex items-center gap-1 font-mono text-gray-300">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDate(tourn.startDate)} {tourn.startTime ? `às ${tourn.startTime}` : ''}
                    </span>
                  </div>

                  {tourn.winnerTeamName && (
                    <div className="mt-3 p-2 rounded-lg bg-amber-950/40 border border-amber-600/30 text-amber-300 text-xs font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Campeão: {tourn.winnerTeamName}</span>
                    </div>
                  )}
                </div>

                {/* Botões de Ação */}
                <div className="space-y-2 pt-2 border-t border-dark-800">
                  {/* Declarar Vencedor (se aberto ou em andamento) */}
                  {!isCancelled && tourn.status !== 'finished' && (
                    <button
                      onClick={() => {
                        setWinnerModalTourn(tourn);
                        setWinnerTeamName('');
                        setWinnerFeedback(null);
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-dark-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md"
                    >
                      <Trophy className="w-3.5 h-3.5" />
                      <span>Declarar Vencedor & Pagar PIX</span>
                    </button>
                  )}

                  {/* Cancelar Torneio com Reembolso Automático */}
                  {!isCancelled && tourn.status !== 'finished' && (
                    <button
                      onClick={() => handleCancelTournamentWithRefund(tourn)}
                      className="w-full py-2 px-3 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-500/40 text-rose-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                      <span>Cancelar Campeonato & Reembolsar Carteiras</span>
                    </button>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleOpenEdit(tourn)}
                      className="px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-gray-300 text-xs font-bold flex items-center gap-1 transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-gray-400" />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Excluir campeonato "${tourn.title}"?`)) {
                          deleteTournament(tourn.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-dark-800 hover:bg-rose-950 text-gray-400 hover:text-rose-400 transition-all"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Declarar Vencedor */}
      {winnerModalTourn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-dark-900 border border-amber-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-dark-800 pb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black text-white uppercase">
                  Declarar Time Vencedor
                </h3>
              </div>
              <button
                onClick={() => setWinnerModalTourn(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-dark-850 rounded-xl border border-dark-750 text-xs text-gray-300">
              <p className="font-bold text-white mb-1">{winnerModalTourn.title}</p>
              <p>
                Premiação do 1º Lugar:{' '}
                <strong className="text-amber-400 font-mono">
                  {formatBRL(winnerModalTourn.firstPlacePrize || winnerModalTourn.prizePool)}
                </strong>
              </p>
            </div>

            {winnerFeedback ? (
              <div className="p-4 bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs rounded-xl font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{winnerFeedback.message}</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-300 uppercase">
                    Nome do Time Campeão
                  </label>
                  <input
                    type="text"
                    required
                    value={winnerTeamName}
                    onChange={(e) => setWinnerTeamName(e.target.value)}
                    placeholder="Ex: Vision Alpha"
                    className="w-full bg-dark-850 border border-dark-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleConfirmWinner}
                  disabled={!winnerTeamName.trim()}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-dark-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-500/20"
                >
                  Confirmar Campeão e Pagar Premiação
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Criar/Editar Campeonato */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-dark-900 border border-red-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5 custom-scrollbar">
            <div className="flex items-center justify-between border-b border-dark-800 pb-4">
              <h3 className="text-lg font-black text-white uppercase">
                {editingTourn ? 'Editar Campeonato' : 'Novo Campeonato'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <ImageUploader
                label="Banner do Campeonato"
                value={bannerUrl}
                onChange={setBannerUrl}
                aspectRatio="banner"
              />

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-gray-300">
                  Título do Torneio
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: VALORANT Masters Vision League"
                  className="w-full bg-dark-850 border border-dark-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Formato de Competição: Chaves vs Duelo Direto */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-gray-300">
                  Formato de Competição
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCompetitionMode('bracket')}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold border transition-all ${
                      competitionMode === 'bracket'
                        ? 'bg-red-950 text-red-300 border-red-500'
                        : 'bg-dark-850 text-gray-400 border-dark-700'
                    }`}
                  >
                    <GitBranch className="w-4 h-4 text-red-400" />
                    <span>Chaveamento (Brackets)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCompetitionMode('duelo_direto');
                      setMaxTeams(2);
                    }}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold border transition-all ${
                      competitionMode === 'duelo_direto'
                        ? 'bg-amber-950 text-amber-300 border-amber-500'
                        : 'bg-dark-850 text-gray-400 border-dark-700'
                    }`}
                  >
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span>Equipe x Equipe (Duelo)</span>
                  </button>
                </div>
              </div>

              {/* Jogo, Nível (Tier) e Restrição de Elo */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-gray-300">Jogo</label>
                  <select
                    value={game}
                    onChange={(e) => handleGameChange(e.target.value as GameType)}
                    className="w-full bg-dark-850 border border-dark-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Valorant">Valorant</option>
                    <option value="League of Legends">League of Legends</option>
                    <option value="Deadlock">Deadlock (Valve)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-gray-300">Nível / Categoria</label>
                  <select
                    value={tier}
                    onChange={(e) => setTier(e.target.value as TournamentTier)}
                    className="w-full bg-dark-850 border border-dark-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Amador">Amador</option>
                    <option value="Vision">Vision (Oficial)</option>
                    <option value="Profissional">Profissional (PRO)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-gray-300">
                    Restrição de Elo / Rank
                  </label>
                  {game === 'Deadlock' ? (
                    <input
                      type="text"
                      disabled
                      value="Open (Sem Limite de Elo)"
                      className="w-full bg-dark-950 border border-amber-500/50 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold opacity-80 cursor-not-allowed"
                    />
                  ) : (
                    <select
                      value={rankLimit}
                      onChange={(e) => setRankLimit(e.target.value)}
                      className="w-full bg-dark-850 border border-dark-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="Open (Sem Limite)">Open (Sem Restrição de Rank)</option>
                      <option value="Até Ouro">Até Ouro</option>
                      <option value="Até Platina">Até Platina</option>
                      <option value="Diamante+">Diamante+</option>
                      <option value="Imortal+">Imortal / Mestre+</option>
                    </select>
                  )}
                </div>
              </div>

              {game === 'Deadlock' && (
                <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>
                    <strong>Regra Deadlock:</strong> Os campeonatos de Deadlock são sempre Inscrição Aberta (Open / Sem Limite de Elo).
                  </span>
                </div>
              )}

              {/* Valores Financeiros */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-gray-300">Taxa Inscrição (R$)</label>
                  <input
                    type="number"
                    step="5"
                    value={entryFee}
                    onChange={(e) => setEntryFee(e.target.value)}
                    className="w-full bg-dark-850 border border-dark-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-amber-400">Prêmio Total (R$)</label>
                  <input
                    type="number"
                    step="50"
                    value={prizePool}
                    onChange={(e) => setPrizePool(e.target.value)}
                    className="w-full bg-dark-850 border border-dark-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-amber-300">1º Lugar (R$)</label>
                  <input
                    type="number"
                    step="50"
                    value={firstPlacePrize}
                    onChange={(e) => setFirstPlacePrize(e.target.value)}
                    className="w-full bg-dark-850 border border-dark-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Data, Horário e Vagas */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-gray-300">Máx. Times</label>
                  <select
                    value={maxTeams}
                    onChange={(e) => setMaxTeams(parseInt(e.target.value))}
                    className="w-full bg-dark-850 border border-dark-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value={2}>2 Times (Duelo Direto)</option>
                    <option value={4}>4 Times</option>
                    <option value={8}>8 Times</option>
                    <option value={16}>16 Times</option>
                    <option value={32}>32 Times</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-gray-300">Formato</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as TournamentFormat)}
                    className="w-full bg-dark-850 border border-dark-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="single_elimination">Eliminação Simples</option>
                    <option value="double_elimination">Eliminação Dupla</option>
                    <option value="round_robin">Pontos Corridos</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-gray-300">Data de Início</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-dark-850 border border-dark-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-gray-300">Horário</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-dark-850 border border-dark-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-gray-300">
                  Regras e Regulamento
                </label>
                <textarea
                  rows={3}
                  value={rules}
                  onChange={(e) => setRules(e.target.value)}
                  className="w-full bg-dark-850 border border-dark-700 rounded-xl px-3.5 py-2 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-dark-800 text-gray-300 text-xs font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-red-900/40 transition-all"
                >
                  Salvar Campeonato
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
