'use client';

import React from 'react';
import { useAppState } from '@/lib/state-context';
import { formatBRL } from '@/lib/utils';
import { Trophy, Award, Zap, Sparkles } from 'lucide-react';

export default function ChampionsHallSection() {
  const { tournaments } = useAppState();
  const finishedTournaments = tournaments.filter(
    (t) => t.status === 'finished' && t.winnerTeamName
  );

  const champions = finishedTournaments.length > 0 ? finishedTournaments : [
    {
      id: 'mock-c1',
      title: 'LoL Rift Championship 2026',
      winnerTeamName: 'LOUD Academy',
      prizePool: 1500.0,
      game: 'League of Legends',
      bannerUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'mock-c2',
      title: 'Deadlock Winter Open Cup',
      winnerTeamName: 'FURIA Prospects',
      prizePool: 4000.0,
      game: 'Deadlock',
      bannerUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'mock-c3',
      title: 'Valorant Lockdown Series',
      winnerTeamName: 'Sentinels BR',
      prizePool: 6000.0,
      game: 'Valorant',
      bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80',
    },
  ];

  const gameColor = (game: string) => {
    if (game === 'Valorant')          return 'bg-rose-950/60 text-rose-300 border-rose-800/40';
    if (game === 'League of Legends') return 'bg-blue-950/60 text-blue-300 border-blue-800/40';
    if (game === 'Deadlock')          return 'bg-amber-950/60 text-amber-300 border-amber-800/40';
    return 'bg-dark-800 text-gray-300 border-dark-700';
  };

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-dark-900 to-dark-950 border border-dark-800 p-6 sm:p-10">
      {/* Luzes ambiente */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-red-900/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-black tracking-widest uppercase mb-1">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Hall da Fama</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Últimos Campeões
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Times que conquistaram a glória e receberam as premiações via PIX.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 bg-dark-850 px-3.5 py-2 rounded-xl border border-dark-700">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Premiação 100% via PIX</span>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        {champions.slice(0, 3).map((item) => (
          <div
            key={item.id}
            className="group bg-dark-850/80 rounded-2xl border border-dark-700/80 hover:border-amber-500/40 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-950/30 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded border uppercase ${gameColor(item.game)}`}>
                  {item.game}
                </span>
                <div className="flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-lg text-xs font-black">
                  <Award className="w-3.5 h-3.5" />
                  <span>1º LUGAR</span>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-white group-hover:text-amber-400 transition-colors uppercase">
                  {item.winnerTeamName}
                </h3>
                <p className="text-xs text-gray-400 font-medium">{item.title}</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-dark-700/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-500 uppercase font-bold block">Prêmio Pago</span>
                <span className="text-base font-black text-emerald-400 font-mono">{formatBRL(item.prizePool)}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400/90 bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-500/30">
                <Zap className="w-3 h-3 text-emerald-400" />
                <span>Pago via PIX</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
