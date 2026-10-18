'use client';

import React from 'react';
import { useAppState } from '@/lib/state-context';
import { Trophy, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AnnouncementBar() {
  const { siteSettings } = useAppState();

  const announcement =
    siteSettings.headerAnnouncement && !siteSettings.headerAnnouncement.includes('50.000')
      ? siteSettings.headerAnnouncement
      : '⚡ VISION LEAGUE — O melhor lugar para você competir e evoluir no cenário gamer!';

  return (
    <div className="bg-dark-900/90 border-b border-dark-800 text-xs py-2 px-4 text-center text-gray-300 flex items-center justify-center gap-2.5">
      <span className="flex items-center gap-1.5 font-bold text-white uppercase tracking-wider text-[11px] bg-red-900/50 border border-red-700/40 px-2 py-0.5 rounded-md">
        <Trophy className="w-3 h-3 text-red-400" />
        Competitivo
      </span>
      <span className="font-medium text-gray-200">
        {announcement}
      </span>
      <Link
        href="/tournaments"
        className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-red-400 hover:text-red-300 transition-colors ml-1"
      >
        <span>Ver Campeonatos</span>
        <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}
