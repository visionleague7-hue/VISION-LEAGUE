'use client';

import React, { useState } from 'react';
import { useAppState } from '@/lib/state-context';
import { GameType, Team, TeamMember } from '@/lib/types';
import {
  Users,
  PlusCircle,
  Copy,
  Check,
  Trash2,
  UserPlus,
  Shield,
  Trophy,
  ExternalLink,
  Crown,
  Share2,
  Gamepad2,
  Sparkles,
  Info,
} from 'lucide-react';
import Link from 'next/link';

export default function TeamsPage() {
  const { teams, user, createTeam, addTeamMember, removeTeamMember, deleteTeam, joinTeamByInviteCode } =
    useAppState();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameType>('Valorant');
  const [teamName, setTeamName] = useState('');
  const [teamTag, setTeamTag] = useState('');

  // Join by code state
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [gameNickInput, setGameNickInput] = useState('');
  const [joinFeedback, setJoinFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  // Add member directly state
  const [activeAddTeamId, setActiveAddTeamId] = useState<string | null>(null);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberNick, setNewMemberNick] = useState('');
  const [newMemberGameId, setNewMemberGameId] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'titular' | 'reserva'>('titular');

  // Copy code feedback
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyInvite = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleCreateTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim() || !teamTag.trim()) return;

    createTeam({
      name: teamName.trim(),
      tag: teamTag.trim().toUpperCase(),
      game: selectedGame,
      captainId: user.id,
      captainName: user.username,
      minMembers: selectedGame === 'Deadlock' ? 6 : 5,
      maxMembers: selectedGame === 'Deadlock' ? 8 : 7,
    });

    setTeamName('');
    setTeamTag('');
    setIsCreateModalOpen(false);
  };

  const handleJoinTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCodeInput.trim()) return;

    const res = joinTeamByInviteCode(
      inviteCodeInput.trim(),
      gameNickInput.trim() || user.username,
      selectedGame === 'Deadlock' ? user.steamId : user.riotId
    );

    if (res.success) {
      setJoinFeedback({ type: 'success', message: res.message });
      setInviteCodeInput('');
      setGameNickInput('');
      setTimeout(() => {
        setJoinFeedback(null);
        setIsJoinModalOpen(false);
      }, 2000);
    } else {
      setJoinFeedback({ type: 'error', message: res.message });
    }
  };

  const handleAddMemberSubmit = (teamId: string) => {
    if (!newMemberName.trim()) return;

    addTeamMember(teamId, {
      name: newMemberName.trim(),
      gameNick: newMemberNick.trim() || newMemberName.trim(),
      gameId: newMemberGameId.trim(),
      role: newMemberRole,
    });

    setNewMemberName('');
    setNewMemberNick('');
    setNewMemberGameId('');
    setActiveAddTeamId(null);
  };

  const gameRequirements: Record<GameType, { min: number; max: number; desc: string }> = {
    Valorant: {
      min: 5,
      max: 7,
      desc: '5 Titulares + até 2 Reservas. Verificação por Riot ID (Nick#TAG).',
    },
    'League of Legends': {
      min: 5,
      max: 7,
      desc: '5 Titulares + até 2 Reservas (Summoner Rift). Verificação por Riot ID.',
    },
    Deadlock: {
      min: 6,
      max: 8,
      desc: '6 Titulares + até 2 Reservas (Valve 6v6). Conexão via Steam ID / Friend Code.',
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-dark-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase bg-red-950/60 text-red-400 border border-red-500/30 mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Gestão de Lineups Oficiais</span>
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">
            Meus Times & Equipes
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1 max-w-2xl">
            Crie sua equipe para cada modalidade, compartilhe o código de convite com seus amigos e dispute os campeonatos com premiação instantânea no PIX.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsJoinModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-dark-850 hover:bg-dark-800 text-gray-200 hover:text-white border border-dark-700 text-xs font-bold uppercase tracking-wider transition-all"
          >
            Entrar com Código
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Criar Novo Time</span>
          </button>
        </div>
      </div>

      {/* Requisitos por jogo em formato compacto */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(['Valorant', 'League of Legends', 'Deadlock'] as GameType[]).map((game) => (
          <div key={game} className="p-4 rounded-2xl bg-dark-900 border border-dark-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">{game}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-dark-800 text-red-400 border border-dark-750">
                {gameRequirements[game].min}v{gameRequirements[game].min}
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-snug">{gameRequirements[game].desc}</p>
          </div>
        ))}
      </div>

      {/* Lista de Equipes do Usuário */}
      {teams.length === 0 ? (
        <div className="p-12 text-center bg-dark-900 rounded-3xl border border-dark-800 space-y-3">
          <Gamepad2 className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">Nenhum time cadastrado</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            Você ainda não criou um time. Crie uma equipe agora para poder participar dos torneios por chaveamento ou duelos diretos.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider transition-all"
          >
            Criar Minha Primeira Equipe
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {teams.map((team) => {
            const isFull = team.members.length >= team.minMembers;
            const isAddingMember = activeAddTeamId === team.id;

            return (
              <div
                key={team.id}
                className="bg-dark-900 border border-dark-800 rounded-3xl p-6 space-y-5 hover:border-dark-750 transition-colors shadow-sm"
              >
                {/* Header do Time */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-dark-800 border border-dark-700 flex items-center justify-center font-black text-lg text-white">
                      [{team.tag}]
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-black text-white uppercase">{team.name}</h2>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-dark-800 text-red-400 border border-dark-750">
                          {team.game}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        Capitão: <strong className="text-gray-200">{team.captainName}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Status de Vagas */}
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        isFull
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/40'
                          : 'bg-amber-950 text-amber-300 border border-amber-700/40'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isFull ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                        }`}
                      />
                      {team.members.length} / {team.maxMembers} Jogadores
                    </span>
                  </div>
                </div>

                {/* Código de Convite com Cópia Rápida */}
                <div className="p-3 bg-dark-950 rounded-2xl border border-dark-850 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-red-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-bold block">
                        Código de Convite da Equipe
                      </span>
                      <span className="text-xs font-mono font-bold text-white tracking-wider">
                        {team.inviteCode}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopyInvite(team.inviteCode)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dark-850 hover:bg-dark-800 text-xs font-bold text-gray-200 border border-dark-750 transition-all"
                  >
                    {copiedCode === team.inviteCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Roster de Jogadores (Lineup) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
                    <span>Membros da Lineup ({team.members.length})</span>
                    <span>Função / ID</span>
                  </div>

                  <div className="space-y-1.5">
                    {team.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-dark-850/60 border border-dark-800 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          {member.role === 'capitao' ? (
                            <Crown className="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <Users className="w-3.5 h-3.5 text-gray-500" />
                          )}
                          <span className="font-bold text-white">{member.name}</span>
                          {member.gameNick && member.gameNick !== member.name && (
                            <span className="text-[11px] text-gray-400 font-mono">
                              ({member.gameNick})
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                              member.role === 'capitao'
                                ? 'bg-amber-950/80 text-amber-300 border border-amber-700/40'
                                : member.role === 'titular'
                                ? 'bg-dark-900 text-gray-300 border border-dark-700'
                                : 'bg-dark-800 text-gray-400'
                            }`}
                          >
                            {member.role}
                          </span>

                          {member.role !== 'capitao' && (
                            <button
                              onClick={() => removeTeamMember(team.id, member.id)}
                              className="text-gray-500 hover:text-rose-400 p-1"
                              title="Remover jogador"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Formulário Em Linha para Adicionar Jogador Manualmente */}
                {isAddingMember ? (
                  <div className="p-3 bg-dark-850 rounded-2xl border border-dark-700 space-y-3">
                    <span className="text-xs font-bold text-white block">Adicionar Jogador Manualmente:</span>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Nome do Jogador"
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        className="bg-dark-900 border border-dark-750 text-white rounded-xl px-3 py-1.5 text-xs outline-none focus:border-red-500"
                      />
                      <input
                        type="text"
                        placeholder={team.game === 'Deadlock' ? 'Steam ID / Friend Code' : 'Riot ID (Nick#TAG)'}
                        value={newMemberGameId}
                        onChange={(e) => setNewMemberGameId(e.target.value)}
                        className="bg-dark-900 border border-dark-750 text-white rounded-xl px-3 py-1.5 text-xs outline-none focus:border-red-500"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <select
                        value={newMemberRole}
                        onChange={(e) => setNewMemberRole(e.target.value as any)}
                        className="bg-dark-900 border border-dark-750 text-gray-300 text-xs rounded-xl px-2.5 py-1.5 outline-none"
                      >
                        <option value="titular">Titular</option>
                        <option value="reserva">Reserva</option>
                      </select>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setActiveAddTeamId(null)}
                          className="px-3 py-1 text-xs text-gray-400 hover:text-white"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleAddMemberSubmit(team.id)}
                          className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase"
                        >
                          Salvar
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-2 border-t border-dark-800">
                    {team.members.length < team.maxMembers ? (
                      <button
                        onClick={() => setActiveAddTeamId(team.id)}
                        className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-bold"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Adicionar Membro</span>
                      </button>
                    ) : (
                      <span className="text-xs text-gray-500">Capacidade máxima atingida</span>
                    )}

                    <div className="flex items-center gap-3">
                      <Link
                        href="/tournaments"
                        className="flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        <span>Inscrever em Torneio</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>

                      <button
                        onClick={() => {
                          if (confirm(`Tem certeza que deseja excluir o time ${team.name}?`)) {
                            deleteTeam(team.id);
                          }
                        }}
                        className="text-gray-500 hover:text-rose-400 p-1"
                        title="Excluir equipe"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Criação de Time */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-900 border border-dark-750 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-red-400" />
                <span>Montar Nova Equipe</span>
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Configure os dados da sua equipe para convidar seus amigos.
              </p>
            </div>

            <form onSubmit={handleCreateTeamSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-300 uppercase block mb-1.5">
                  Modalidade / Jogo:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Valorant', 'League of Legends', 'Deadlock'] as GameType[]).map((game) => (
                    <button
                      type="button"
                      key={game}
                      onClick={() => setSelectedGame(game)}
                      className={`p-2.5 rounded-xl text-xs font-bold text-center border transition-all ${
                        selectedGame === game
                          ? 'bg-red-900/30 text-gray-300 border-red-500/30 shadow-sm'
                          : 'bg-dark-850 text-gray-400 border-dark-750 hover:text-white'
                      }`}
                    >
                      {game === 'League of Legends' ? 'LoL' : game}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 uppercase block mb-1.5">
                  Nome do Time:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Sentinelas Masters"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full bg-dark-950 border border-dark-750 text-white rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 uppercase block mb-1.5">
                  TAG da Equipe (2 a 5 letras):
                </label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  placeholder="Ex: SNT"
                  value={teamTag}
                  onChange={(e) => setTeamTag(e.target.value.toUpperCase())}
                  className="w-full bg-dark-950 border border-dark-750 text-white font-mono uppercase font-bold rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-red-500"
                />
              </div>

              <div className="p-3 bg-dark-950 rounded-xl border border-dark-800 text-[11px] text-gray-400 flex items-start gap-2">
                <Info className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>
                  Você será registrado como o <strong>Capitão</strong> do time. O código de convite será gerado automaticamente para você enviar aos amigos.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs text-gray-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Confirmar & Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Entrar em Time com Código */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-900 border border-dark-750 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Share2 className="w-5 h-5 text-indigo-400" />
                <span>Entrar em Time com Convite</span>
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Insira o código que o capitão do seu time compartilhou com você.
              </p>
            </div>

            {joinFeedback && (
              <div
                className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  joinFeedback.type === 'success'
                    ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/80 border border-rose-500/40 text-rose-300'
                }`}
              >
                <span>{joinFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleJoinTeamSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-300 uppercase block mb-1.5">
                  Código de Convite:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: VAL-ALPHA-2026"
                  value={inviteCodeInput}
                  onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                  className="w-full bg-dark-950 border border-dark-750 text-white font-mono uppercase font-bold rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 uppercase block mb-1.5">
                  Seu Nick no Jogo:
                </label>
                <input
                  type="text"
                  placeholder="Ex: ProPlayer#BR1"
                  value={gameNickInput}
                  onChange={(e) => setGameNickInput(e.target.value)}
                  className="w-full bg-dark-950 border border-dark-750 text-white rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsJoinModalOpen(false)}
                  className="px-4 py-2 text-xs text-gray-400 hover:text-white"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Entrar no Time
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
