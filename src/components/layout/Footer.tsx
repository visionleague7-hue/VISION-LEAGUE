'use client';

import React from 'react';
import Link from 'next/link';
import { useAppState } from '@/lib/state-context';
import { ShieldCheck, Zap, Disc as Discord, Tv, Twitter, Instagram, Heart } from 'lucide-react';

export default function Footer() {
  const { siteSettings } = useAppState();

  return (
    <footer className="border-t border-dark-800 bg-dark-950/90 text-gray-400 text-sm mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">

          {/* Coluna 1: Marca & Bio */}
          <div className="md:col-span-2 space-y-4">
            {/* Logo ícone + texto */}
            <div className="flex items-center gap-3 select-none">
              <img
                src="/logo.jpg"
                alt="VL"
                className="h-10 w-auto object-contain"
              />
              <div className="flex flex-col leading-none">
                <span className="font-black text-xl text-white uppercase tracking-widest" style={{ letterSpacing: '0.15em' }}>
                  VISION
                </span>
                <span className="font-black text-[15px] text-red-500 uppercase tracking-widest" style={{ letterSpacing: '0.15em', marginTop: '-1px' }}>
                  LEAGUE
                </span>
              </div>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
              {siteSettings.footerBio}
            </p>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex items-center gap-1.5 bg-dark-900 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-semibold">
                <Zap className="w-3.5 h-3.5" />
                <span>PIX Instantâneo Bacen</span>
              </div>
              <div className="flex items-center gap-1.5 bg-dark-900 border border-gray-600/30 text-gray-300 px-3 py-1.5 rounded-lg text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Anti-Cheat & Fair Play</span>
              </div>
            </div>
          </div>

          {/* Coluna 2: Navegação Rápida */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4 text-red-400">
              Navegação
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: '/tournaments', label: 'Torneios Ativos' },
                { href: '/tournaments', label: 'Tabelas de Chaves' },
                { href: '/dashboard/wallet', label: 'Carteira & Saques' },
                { href: '/news', label: 'Notícias' },
                { href: '/terms', label: 'Termos de Uso' },
              ].map(({ href, label }) => (
                <li key={label}>
                  <Link href={href} className="hover:text-red-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Coluna 3: Comunidade */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4 text-gray-300">
              Suporte & Comunidade
            </h4>
            <div className="flex flex-col space-y-3">
              <a
                href={siteSettings.discordUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 text-gray-300 hover:text-indigo-400 transition-colors p-2 rounded-xl bg-dark-900 border border-dark-800 hover:border-indigo-500/40"
              >
                <div className="p-2 rounded-lg bg-indigo-950/60 text-indigo-400">
                  <Discord className="w-4 h-4" />
                </div>
                <div>
                  <span className="block font-bold text-white text-xs">Discord Oficial</span>
                  <span className="text-[10px] text-emerald-400 font-bold">Suporte pelo Discord</span>
                </div>
              </a>

              <a href={siteSettings.twitchUrl} target="_blank" rel="noreferrer"
                className="flex items-center gap-2.5 text-gray-400 hover:text-red-400 transition-colors">
                <div className="p-2 rounded-lg bg-dark-900 border border-dark-800">
                  <Tv className="w-4 h-4 text-red-400\" />
                </div>
                <span>Transmissão Twitch</span>
              </a>

              <a href={siteSettings.twitterUrl} target="_blank" rel="noreferrer"
                className="flex items-center gap-2.5 text-gray-400 hover:text-gray-200 transition-colors">
                <div className="p-2 rounded-lg bg-dark-900 border border-dark-800">
                  <Twitter className="w-4 h-4 text-gray-300" />
                </div>
                <span>Twitter / X</span>
              </a>

              <a href={siteSettings.instagramUrl} target="_blank" rel="noreferrer"
                className="flex items-center gap-2.5 text-gray-400 hover:text-pink-400 transition-colors">
                <div className="p-2 rounded-lg bg-dark-900 border border-dark-800">
                  <Instagram className="w-4 h-4 text-pink-400" />
                </div>
                <span>Instagram</span>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-dark-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>
            © 2026 {siteSettings.siteName} (<span className="text-red-500 font-mono">{siteSettings.siteDomain || 'visionleague.gg'}</span>) • Todos os direitos reservados.
          </p>
          <p className="flex items-center gap-1">
            Desenvolvido para eSports com <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> e Next.js
          </p>
        </div>
      </div>
    </footer>
  );
}
