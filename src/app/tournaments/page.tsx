'use client';

import React from 'react';
import TournamentListSection from '@/components/home/TournamentListSection';
import { Trophy } from 'lucide-react';

export default function TournamentsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-dark-900 via-dark-850 to-dark-900 border border-dark-800 rounded-3xl p-6 sm:p-10 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-red-400 bg-red-950/60 px-3 py-1 rounded-full border border-red-500/30">
            <Trophy className="w-3.5 h-3.5" />
            <span>Circuito de Competições</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
            Campeonatos & Ligas
          </h1>
          <p className="text-gray-400 text-sm">
            Escolha seu jogo favorito, inscreva sua lineup e dispute premiações pagas instantaneamente via PIX.
          </p>
        </div>
      </div>

      {/* Lista com Filtros */}
      <TournamentListSection />
    </div>
  );
}
