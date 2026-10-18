import React from 'react';
import { Sparkles } from 'lucide-react';

export default function SponsorsSection() {
  const sponsors = [
    { name: 'RAZER',       role: 'Hardware Oficial',          logo: '🐍' },
    { name: 'RED BULL',    role: 'Energy Partner Oficial',    logo: '⚡' },
    { name: 'ALIENWARE',   role: 'PCs & Monitores',           logo: '👽' },
    { name: 'STEELSERIES', role: 'Headsets Competitivos',     logo: '🎧' },
    { name: 'TWITCH',      role: 'Transmissão Oficial',       logo: '📺' },
    { name: 'HYPERX',      role: 'Memórias & Áudio Pro',      logo: '🔥' },
  ];

  return (
    <section className="py-8 border-y border-dark-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 text-red-400 text-xs font-black tracking-widest uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ecossistema eSports</span>
          </div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">
            Parceiros & Patrocinadores Oficiais
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {sponsors.map((sp) => (
            <div
              key={sp.name}
              className="flex flex-col items-center justify-center p-4 rounded-xl bg-dark-900/60 border border-dark-800 hover:border-red-700/40 hover:bg-dark-850 transition-all duration-300 group"
            >
              <span className="text-2xl mb-1 filter grayscale group-hover:grayscale-0 transition-all">
                {sp.logo}
              </span>
              <span className="font-black text-sm text-gray-300 group-hover:text-red-400 tracking-wider transition-colors">
                {sp.name}
              </span>
              <span className="text-[10px] text-gray-500 text-center mt-1 line-clamp-1">
                {sp.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
