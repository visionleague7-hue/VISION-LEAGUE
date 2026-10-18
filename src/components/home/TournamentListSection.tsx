'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAppState } from '@/lib/state-context';
import { TournamentStatus, CompetitionMode } from '@/lib/types';
import { formatBRL, formatDate } from '@/lib/utils';
import {
  Trophy,
  Users,
  Calendar,
  ArrowRight,
  Shield,
  Swords,
  Sparkles,
  Clock,
  ShieldCheck,
  GitBranch,
  Flame,
} from 'lucide-react';

// Abas dos jogos
const GAME_TABS = [
  { key: 'Valorant',          label: 'VALORANT',         emoji: '🔴', accent: 'text-rose-400',   border: 'border-rose-500',   bg: 'bg-rose-500',   bgLight: 'bg-rose-500/10'  },
  { key: 'League of Legends', label: 'LEAGUE OF LEGENDS', emoji: '🔵', accent: 'text-blue-400',   border: 'border-blue-500',   bg: 'bg-blue-500',   bgLight: 'bg-blue-500/10'  },
  { key: 'Deadlock',          label: 'DEADLOCK',          emoji: '🟡', accent: 'text-amber-400',  border: 'border-amber-500',  bg: 'bg-amber-500',  bgLight: 'bg-amber-500/10' },
] as const;

type GameKey = typeof GAME_TABS[number]['key'];

export default function TournamentListSection() {
  const { tournaments } = useAppState();
  const [activeGame, setActiveGame] = useState<GameKey>('Valorant');
  const [statusFilter, setStatusFilter] = useState<'all' | TournamentStatus>('all');
  const [modeFilter, setModeFilter] = useState<'all' | CompetitionMode>('all');

  const activeTab = GAME_TABS.find(t => t.key === activeGame)!;

  // Conta torneios por jogo
  const countByGame = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of tournaments) {
      map[t.game] = (map[t.game] || 0) + 1;
    }
    return map;
  }, [tournaments]);

  const filteredTournaments = useMemo(() => tournaments.filter((tourn) => {
    if (tourn.game !== activeGame) return false;
    if (statusFilter !== 'all' && tourn.status !== statusFilter) return false;
    if (modeFilter !== 'all') {
      const tournMode = tourn.competitionMode || 'bracket';
      if (tournMode !== modeFilter) return false;
    }
    return true;
  }), [tournaments, activeGame, statusFilter, modeFilter]);

  const getStatusBadge = (status: TournamentStatus) => {
    switch (status) {
      case 'open':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-red-950/90 text-red-300 border border-red-600/40">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            Inscrições Abertas
          </span>
        );
      case 'ongoing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-amber-950/90 text-amber-300 border border-amber-600/40">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Em Andamento
          </span>
        );
      case 'finished':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-dark-800 text-gray-400 border border-dark-700">
            Finalizado
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-rose-950 text-rose-400 border border-rose-600/40">
            Cancelado
          </span>
        );
      default:
        return null;
    }
  };

  const getTierBadge = (tier?: string) => {
    switch (tier) {
      case 'Amador':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-700/40">Amador</span>;
      case 'Vision':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-950 text-red-300 border border-red-700/40">Circuito VISION</span>;
      case 'Profissional':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-950 text-amber-300 border border-amber-700/40">PRO Series</span>;
      default:
        return null;
    }
  };

  return (
    <section className="space-y-0">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-red-400 text-xs font-bold tracking-wider uppercase mb-1">
            <Swords className="w-4 h-4" />
            <span>Circuito Competitivo Oficial</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Campeonatos & Confrontos
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Selecione o jogo e encontre seu torneio.
          </p>
        </div>
      </div>

      {/* ── ABAS POR JOGO ───────────────────────────────────── */}
      <div className="flex items-stretch gap-0 rounded-2xl overflow-hidden border border-dark-700 mb-6">
        {GAME_TABS.map((tab) => {
          const isActive = activeGame === tab.key;
          const count = countByGame[tab.key] || 0;
          return (
            <button
              key={tab.key}
              onClick={() => { setActiveGame(tab.key); setStatusFilter('all'); setModeFilter('all'); }}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-4 px-2 text-xs font-black uppercase tracking-wider transition-all duration-200 relative ${
                isActive
                  ? 'bg-dark-800 text-white'
                  : 'bg-dark-950 text-gray-500 hover:text-gray-300 hover:bg-dark-900'
              }`}
            >
              {/* linha colorida embaixo quando ativo */}
              {isActive && (
                <span className={`absolute bottom-0 left-0 right-0 h-[3px] ${tab.bg}`} />
              )}
              <span className="text-lg leading-none">{tab.emoji}</span>
              <span className={`leading-tight text-center ${isActive ? tab.accent : ''}`}>
                {tab.label}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? `${tab.bgLight} ${tab.accent}` : 'bg-dark-800 text-gray-600'}`}>
                {count} torneios
              </span>
            </button>
          );
        })}
      </div>

      {/* ── FILTROS SECUNDÁRIOS ─────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 mb-5 rounded-xl border border-dark-800 bg-dark-900/60 p-3">
        {/* Formato */}
        <div className="flex items-center gap-1 mr-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Formato:</span>
        </div>
        {([
          { value: 'all',          label: 'Todos',        icon: null },
          { value: 'bracket',      label: 'Brackets',     icon: <GitBranch className="w-3.5 h-3.5" /> },
          { value: 'duelo_direto', label: 'Duelo Direto', icon: <Flame className="w-3.5 h-3.5" /> },
        ] as const).map(({ value, label, icon }) => {
          const active = modeFilter === value;
          return (
            <button
              key={value}
              onClick={() => setModeFilter(value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${
                active ? 'bg-red-700 text-white' : 'text-gray-400 hover:text-white hover:bg-dark-800'
              }`}
            >
              {icon && <span>{icon}</span>}
              {label}
            </button>
          );
        })}

        <div className="w-px h-5 bg-dark-700 mx-1" />

        {/* Status */}
        <div className="flex items-center gap-1 mr-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Status:</span>
        </div>
        {(['all', 'open', 'ongoing', 'finished'] as const).map((s) => {
          const active = statusFilter === s;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                active ? 'bg-red-700 text-white' : 'text-gray-400 hover:text-white hover:bg-dark-800'
              }`}
            >
              {s === 'all' ? 'Todos' : s === 'open' ? 'Abertos' : s === 'ongoing' ? 'Em Andamento' : 'Finalizados'}
            </button>
          );
        })}
      </div>

      {/* ── GRID DE TORNEIOS ─────────────────────────────────── */}
      {filteredTournaments.length === 0 ? (
        <div className="p-12 text-center bg-dark-900 rounded-2xl border border-dark-800 space-y-2">
          <Trophy className="w-12 h-12 text-gray-700 mx-auto mb-2" />
          <h3 className="text-lg font-bold text-gray-400">Nenhum campeonato encontrado</h3>
          <p className="text-xs text-gray-600">
            Tente selecionar outro formato ou status acima.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTournaments.map((tourn) => {
            const percentFilled = Math.min(100, Math.round((tourn.registeredTeamsCount / tourn.maxTeams) * 100));
            const isDuelo = tourn.competitionMode === 'duelo_direto';

            return (
              <div
                key={tourn.id}
                className="group relative flex flex-col bg-dark-900 rounded-2xl border border-dark-800 hover:border-red-700/40 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-lg hover:shadow-red-950/20 hover:-translate-y-0.5"
              >
                {/* Imagem */}
                <div className="relative h-44 w-full overflow-hidden bg-dark-950">
                  <img
                    src={tourn.bannerUrl}
                    alt={tourn.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 will-change-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/40 to-transparent" />

                  {/* Badges topo esquerda */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {getTierBadge(tourn.tier)}
                    {isDuelo ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-dark-900/80 text-gray-300 border border-dark-700">
                        Equipe x Equipe
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-dark-900/80 text-gray-400 border border-dark-700">
                        Chaveamento
                      </span>
                    )}
                  </div>

                  {/* Status topo direita */}
                  <div className="absolute top-3 right-3">{getStatusBadge(tourn.status)}</div>

                  {/* Premiação e inscrição */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">Premiação</span>
                      <span className="text-lg font-black text-amber-400">{formatBRL(tourn.prizePool)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">Inscrição</span>
                      <span className="text-sm font-bold text-white font-mono">
                        {tourn.entryFee > 0 ? formatBRL(tourn.entryFee) : 'GRÁTIS'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Corpo do card */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-bold text-white text-base tracking-tight group-hover:text-red-400 transition-colors line-clamp-1">
                      {tourn.title}
                    </h3>

                    <div className="mt-2">
                      {tourn.game === 'Deadlock' || tourn.isOpenRank ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-medium bg-amber-950/40 border border-amber-700/40 text-amber-300">
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          Inscrição Aberta (Open)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-medium bg-dark-850 border border-dark-700 text-gray-300">
                          <Shield className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          Elo: {tourn.rankLimit || 'Sem Restrição'}
                        </span>
                      )}
                    </div>

                    {tourn.winnerTeamName && tourn.status === 'finished' && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-300 font-bold bg-amber-950/40 px-2 py-1 rounded border border-amber-600/30">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Campeão: {tourn.winnerTeamName}</span>
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(tourn.startDate)}</span>
                      </div>
                      {tourn.startTime && (
                        <div className="flex items-center gap-1.5 font-mono text-gray-300">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{tourn.startTime}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Vagas */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        Vagas
                      </span>
                      <span className="text-white font-mono text-xs">
                        {tourn.registeredTeamsCount} / {tourn.maxTeams} times
                      </span>
                    </div>
                    <div className="w-full bg-dark-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-red-600 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${percentFilled}%` }}
                      />
                    </div>
                  </div>

                  {/* Botão */}
                  <Link
                    href={`/tournaments/${tourn.id}`}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 bg-dark-800 hover:bg-red-700 text-gray-200 hover:text-white border border-dark-700 hover:border-red-600 transition-all duration-200 group/btn"
                  >
                    <span>Ver Detalhes & Inscrição</span>
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
