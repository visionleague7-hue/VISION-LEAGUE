'use client';

import React from 'react';
import { BracketMatch } from '@/lib/types';
import { Trophy, Swords, Zap, CheckCircle2 } from 'lucide-react';

interface BracketViewerProps {
  matches: BracketMatch[];
  tournamentTitle: string;
}

export default function BracketViewer({ matches, tournamentTitle }: BracketViewerProps) {
  if (!matches || matches.length === 0) {
    return (
      <div className="p-8 text-center bg-dark-900 rounded-2xl border border-dark-800">
        <Swords className="w-10 h-10 text-gray-600 mx-auto mb-2" />
        <h4 className="font-bold text-gray-300">Chaveamento em fase de sorteio</h4>
        <p className="text-xs text-gray-500 mt-1">
          As chaves de eliminação serão geradas automaticamente após o encerramento do período de inscrições.
        </p>
      </div>
    );
  }

  // Agrupa partidas por RoundNumber
  const rounds = [
    { number: 1, name: 'Quartas de Final', matches: matches.filter((m) => m.roundNumber === 1) },
    { number: 2, name: 'Semifinais', matches: matches.filter((m) => m.roundNumber === 2) },
    { number: 3, name: 'Grande Final', matches: matches.filter((m) => m.roundNumber === 3) },
  ].filter((r) => r.matches.length > 0);

  return (
    <div className="w-full overflow-x-auto pb-6">
      <div className="min-w-[850px] flex items-center justify-between gap-8 px-2">
        {rounds.map((round) => (
          <div key={round.number} className="flex-1 flex flex-col space-y-6">
            {/* Título da Fase */}
            <div className="text-center pb-2 border-b border-dark-700">
              <span className="text-xs font-black uppercase tracking-wider text-red-400">
                {round.name}
              </span>
            </div>

            {/* Lista de Partidas do Round */}
            <div className="flex flex-col justify-around gap-6 h-full">
              {round.matches.map((match) => {
                const isFinal = round.number === 3;
                const isLive = match.status === 'live';
                const isCompleted = match.status === 'completed';

                return (
                  <div
                    key={match.id}
                    className={`relative rounded-xl border p-3.5 transition-all duration-200 ${
                      isFinal
                        ? 'bg-gradient-to-br from-dark-900 to-red-950/30 border-red-500/40 shadow-neon-red'
                        : isLive
                        ? 'bg-dark-900 border-amber-500/60 shadow-lg'
                        : 'bg-dark-900/90 border-dark-700 hover:border-red-500/40'
                    }`}
                  >
                    {/* Badge de status da partida */}
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase mb-2">
                      <span className="text-gray-400">{match.roundName}</span>
                      {isLive && (
                        <span className="flex items-center gap-1 text-amber-400 font-extrabold animate-pulse">
                          <Zap className="w-3 h-3" /> AO VIVO
                        </span>
                      )}
                      {isCompleted && (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" /> FINALIZADO
                        </span>
                      )}
                      {match.status === 'scheduled' && (
                        <span className="text-gray-500">Agendado</span>
                      )}
                    </div>

                    {/* Confronto: Time A */}
                    <div
                      className={`flex items-center justify-between p-2 rounded-lg text-xs font-bold transition-colors ${
                        match.winnerId && match.teamA?.id === match.winnerId
                          ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/40'
                          : 'bg-dark-850 text-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-5 h-5 rounded bg-dark-750 flex items-center justify-center text-[10px] text-gray-400 font-mono">
                          A
                        </span>
                        <span className="truncate">{match.teamA?.name || 'A definir'}</span>
                      </div>
                      <span className="font-mono text-sm px-2 py-0.5 rounded bg-dark-900 text-white">
                        {match.teamA?.score ?? 0}
                      </span>
                    </div>

                    {/* Divisor VS */}
                    <div className="my-1.5 text-center text-[9px] font-black text-gray-600 uppercase">
                      VS
                    </div>

                    {/* Confronto: Time B */}
                    <div
                      className={`flex items-center justify-between p-2 rounded-lg text-xs font-bold transition-colors ${
                        match.winnerId && match.teamB?.id === match.winnerId
                          ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/40'
                          : 'bg-dark-850 text-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-5 h-5 rounded bg-dark-750 flex items-center justify-center text-[10px] text-gray-400 font-mono">
                          B
                        </span>
                        <span className="truncate">{match.teamB?.name || 'A definir'}</span>
                      </div>
                      <span className="font-mono text-sm px-2 py-0.5 rounded bg-dark-900 text-white">
                        {match.teamB?.score ?? 0}
                      </span>
                    </div>

                    {/* Indicação de Vencedor para Grande Final */}
                    {isFinal && match.winnerName && (
                      <div className="mt-3 pt-2 border-t border-red-500/20 flex items-center justify-center gap-1.5 text-xs font-black text-amber-300">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        <span>CAMPEÃO: {match.winnerName}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
