'use client';

import React from 'react';
import HeroBannerSlider from '@/components/home/HeroBannerSlider';
import FeaturedDuels from '@/components/home/FeaturedDuels';
import TournamentListSection from '@/components/home/TournamentListSection';
import ChampionsHallSection from '@/components/home/ChampionsHallSection';
import SponsorsSection from '@/components/home/SponsorsSection';
import { Zap, Trophy, ShieldCheck, Users } from 'lucide-react';

export default function HomePage() {
  const stats = [
    {
      label: 'Premiações Pagas',
      value: 'R$ 150K+',
      icon: Trophy,
      color: 'text-amber-400',
      bg: 'from-amber-500/10 to-amber-500/0',
      border: 'border-amber-500/20',
    },
    {
      label: 'Pagamentos via PIX',
      value: 'Instantâneo',
      icon: Zap,
      color: 'text-emerald-400',
      bg: 'from-emerald-500/10 to-emerald-500/0',
      border: 'border-emerald-500/20',
    },
    {
      label: 'Jogadores',
      value: '12.400+',
      icon: Users,
      color: 'text-red-400',
      bg: 'from-red-500/10 to-red-500/0',
      border: 'border-red-500/20',
    },
    {
      label: 'Integridade',
      value: 'Anti-Cheat',
      icon: ShieldCheck,
      color: 'text-gray-300',
      bg: 'from-gray-500/10 to-gray-500/0',
      border: 'border-gray-500/20',
    },
  ];

  return (
    <div className="space-y-12 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* 1. Hero Banner */}
        <HeroBannerSlider />

        {/* 2. Barra de Métricas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className={`relative flex items-center gap-3 p-4 rounded-xl border ${s.border} bg-gradient-to-br ${s.bg} overflow-hidden`}
              >
                <div className={`absolute -top-4 -left-4 w-20 h-20 rounded-full blur-2xl opacity-20 bg-current ${s.color}`} />
                <div className={`relative z-10 p-2.5 rounded-xl bg-dark-900/80 border border-white/5 ${s.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="relative z-10 min-w-0">
                  <p className="text-[11px] text-gray-400 font-semibold leading-tight truncate">{s.label}</p>
                  <p className={`text-base sm:text-lg font-black tracking-tight ${s.color}`}>{s.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. Duelos em Destaque (Equipe x Equipe) */}
        <div className="animate-fadeIn">
          <hr className="section-divider mb-8" />
          <FeaturedDuels />
        </div>

        {/* 4. Campeonatos por Jogo (Abas) */}
        <div>
          <hr className="section-divider mb-8" />
          <TournamentListSection />
        </div>

        {/* 5. Hall da Fama */}
        <div>
          <hr className="section-divider mb-8" />
          <ChampionsHallSection />
        </div>
      </div>

      {/* 6. Patrocinadores */}
      <SponsorsSection />
    </div>
  );
}
