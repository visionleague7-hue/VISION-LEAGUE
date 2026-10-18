'use client';

import React from 'react';
import Link from 'next/link';
import { useAppState } from '@/lib/state-context';
import { Swords, Zap, Clock, Trophy, Users, ChevronRight, Radio } from 'lucide-react';

const GAME_COLORS: Record<string, string> = {
  'Valorant': 'from-red-900/40 to-rose-950/20 border-red-500/40',
  'League of Legends': 'from-amber-900/30 to-yellow-950/20 border-amber-500/30',
  'Deadlock': 'from-slate-800/50 to-gray-950/20 border-slate-500/30',
};

const GAME_BADGE: Record<string, string> = {
  'Valorant': 'bg-red-600 text-white',
  'League of Legends': 'bg-amber-500 text-black',
  'Deadlock': 'bg-slate-600 text-white',
};

export default function FeaturedDuels() {
  const { tournaments } = useAppState();

  const duels = tournaments.filter(
    (t) => t.competitionMode === 'duelo_direto' && (t.status === 'open' || t.status === 'ongoing')
  );

  if (duels.length === 0) return null;

  return (
    <section>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-600/20 border border-red-500/30">
            <Swords className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
              Duelos em Destaque
            </h2>
            <p className="text-[11px] text-gray-400 font-semibold">
              Equipe x Equipe — apostas diretas com premiação instantânea
            </p>
          </div>
        </div>
        <Link
          href="/tournaments"
          className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 transition-colors uppercase tracking-wide"
        >
          Ver Todos <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Duels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {duels.map((duel) => {
          const isLive = duel.status === 'ongoing';
          const spotsLeft = duel.maxTeams - duel.registeredTeamsCount;
          const isFull = spotsLeft <= 0;
          const colorClass = GAME_COLORS[duel.game] || GAME_COLORS['Valorant'];
          const gameBadge = GAME_BADGE[duel.game] || GAME_BADGE['Valorant'];

          return (
            <Link
              key={duel.id}
              href={`/tournaments/${duel.slug}`}
              className={`group relative flex flex-col rounded-2xl border bg-gradient-to-br ${colorClass} p-5 hover:scale-[1.02] transition-all duration-200 overflow-hidden card-hover-glow`}
            >
              {/* Glow overlay on hover */}
              <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/5 transition-colors duration-300 rounded-2xl" />

              {/* Top Row: Game Badge + Status */}
              <div className="relative flex items-center justify-between mb-4">
                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-widest ${gameBadge}`}>
                  {duel.game === 'League of Legends' ? 'LoL' : duel.game}
                </span>
                {isLive ? (
                  <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-red-400 bg-red-950/70 border border-red-500/40 px-2.5 py-1 rounded-full animate-pulse">
                    <Radio className="w-3 h-3" />
                    AO VIVO
                  </span>
                ) : isFull ? (
                  <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2.5 py-1 rounded-full">
                    LOTADO
                  </span>
                ) : (
                  <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                    INSCRIÇÕES ABERTAS
                  </span>
                )}
              </div>

              {/* VS Layout */}
              <div className="relative flex items-center justify-center gap-3 py-3 mb-4">
                {/* Team A */}
                <div className="flex-1 text-center">
                  <div className="w-12 h-12 rounded-full bg-dark-900/80 border-2 border-red-500/50 flex items-center justify-center mx-auto mb-2 text-lg font-black text-red-400">
                    {duel.registeredTeamsCount >= 1 ? '🎮' : '?'}
                  </div>
                  <p className="text-xs font-bold text-gray-200 truncate">
                    {duel.registeredTeamsCount >= 1 ? 'Time Inscrito' : 'Aguardando...'}
                  </p>
                </div>

                {/* VS Divider */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-red-600/30 border-2 border-red-500/60 flex items-center justify-center vs-pulse">
                    <Swords className="w-4 h-4 text-red-400" />
                  </div>
                  <span className="text-[10px] font-black text-red-400 mt-1">VS</span>
                </div>

                {/* Team B */}
                <div className="flex-1 text-center">
                  <div className="w-12 h-12 rounded-full bg-dark-900/80 border-2 border-gray-600/50 flex items-center justify-center mx-auto mb-2 text-lg font-black text-gray-400">
                    {duel.registeredTeamsCount >= 2 ? '🎮' : '?'}
                  </div>
                  <p className="text-xs font-bold text-gray-200 truncate">
                    {duel.registeredTeamsCount >= 2 ? 'Adversário' : 'Vaga Aberta'}
                  </p>
                </div>
              </div>

              {/* Title */}
              <h3 className="relative text-sm font-black text-white leading-tight mb-3 line-clamp-2">
                {duel.title}
              </h3>

              {/* Stats Row */}
              <div className="relative flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-bold">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>R$ {duel.firstPlacePrize.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-semibold">
                  <Users className="w-3.5 h-3.5" />
                  <span>{duel.registeredTeamsCount}/{duel.maxTeams} times</span>
                </div>
                {duel.startTime && (
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-semibold ml-auto">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{duel.startTime}</span>
                  </div>
                )}
              </div>

              {/* Entry Fee + CTA */}
              <div className="relative flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Taxa de Entrada</p>
                  <p className="text-base font-black text-white">
                    {duel.entryFee === 0 ? 'GRATUITO' : `R$ ${duel.entryFee.toFixed(2)}`}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-black text-red-400 group-hover:text-red-300 transition-colors uppercase tracking-wide">
                  {isLive ? (
                    <>
                      <Zap className="w-3.5 h-3.5" />
                      Ver Duelo
                    </>
                  ) : (
                    <>
                      Inscrever
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
