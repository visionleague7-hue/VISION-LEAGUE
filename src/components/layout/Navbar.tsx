'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppState } from '@/lib/state-context';
import { formatBRL } from '@/lib/utils';
import {
  Trophy,
  Wallet,
  Shield,
  User,
  PlusCircle,
  Menu,
  X,
  Zap,
  Newspaper,
  Sliders,
  Scale,
  LogOut,
} from 'lucide-react';
import DepositModal from '../wallet/DepositModal';

export default function Navbar() {
  const pathname = usePathname();
  const { siteSettings, wallet, user, isLoggedIn, logout } = useAppState();
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const isAdmin = isLoggedIn && (user.role === 'admin' || user.role === 'moderator');
  const isReferee = isLoggedIn && (user.role === 'referee' || user.role === 'admin' || user.role === 'moderator');

  const navLinks = [
    { href: '/', label: 'Início', icon: Zap },
    { href: '/tournaments', label: 'Campeonatos', icon: Trophy },
    { href: '/news', label: 'Notícias', icon: Newspaper },
    { href: '/dashboard/wallet', label: 'Carteira', icon: Wallet },
  ];

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  const roleBadge = () => {
    if (user.role === 'admin')     return { label: 'Admin',     color: 'bg-red-950 text-red-300 border-red-700/50' };
    if (user.role === 'moderator') return { label: 'Moderador', color: 'bg-orange-950 text-orange-300 border-orange-700/50' };
    if (user.role === 'referee')   return { label: 'Árbitro',   color: 'bg-amber-950 text-amber-300 border-amber-700/50' };
    return { label: user.rankTier, color: 'bg-dark-800 text-gray-400 border-dark-700' };
  };

  const badge = roleBadge();

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-dark-800 cyber-glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">

          {/* Logo & Links */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group select-none">
              {/* Ícone VL */}
              <img
                src="/logo.jpg"
                alt="VL"
                className="h-10 sm:h-11 w-auto object-contain"
              />
              {/* Texto igual à logo */}
              <div className="flex flex-col leading-none">
                <span className="font-black text-lg sm:text-xl tracking-widest text-white uppercase group-hover:opacity-90 transition-opacity" style={{ letterSpacing: '0.15em' }}>
                  VISION
                </span>
                <span className="font-black text-sm sm:text-[15px] tracking-widest text-red-500 uppercase" style={{ letterSpacing: '0.15em', marginTop: '-1px' }}>
                  LEAGUE
                </span>
              </div>
            </Link>

            {/* Links desktop */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                      active
                        ? 'text-red-400 bg-red-950/40 border border-red-700/30'
                        : 'text-gray-300 hover:text-white hover:bg-dark-800/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-red-400' : 'text-gray-500'}`} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              {isReferee && (
                <Link
                  href="/arbitros"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive('/arbitros')
                      ? 'text-amber-400 bg-amber-950/40 border border-amber-500/30'
                      : 'text-amber-300/70 hover:text-amber-300 hover:bg-amber-950/20'
                  }`}
                >
                  <Scale className="w-4 h-4" />
                  <span>Árbitro</span>
                </Link>
              )}
            </nav>
          </div>

          {/* Direita: saldo + usuário */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Saldo rápido */}
            <div className="flex items-center bg-dark-850 border border-red-700/30 rounded-xl p-1 sm:p-1.5">
              <Link
                href="/dashboard/wallet"
                className="flex items-center gap-2 px-2.5 py-1 text-xs sm:text-sm font-bold text-gray-200 hover:text-red-300 transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-gray-400 hidden sm:inline text-xs font-normal">Saldo:</span>
                <span className="text-emerald-400 font-mono">{formatBRL(wallet.availableBalance)}</span>
              </Link>
              <button
                onClick={() => setIsDepositOpen(true)}
                className="flex items-center gap-1 bg-red-700 hover:bg-red-600 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all hover:scale-105 active:scale-95"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">PIX</span>
              </button>
            </div>

            {/* Admin badge */}
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden lg:flex items-center gap-1.5 bg-red-900/30 hover:bg-red-800/50 text-red-300 border border-red-700/30 text-xs font-bold px-3 py-2 rounded-xl transition-all hover:scale-105"
              >
                <Sliders className="w-3.5 h-3.5 text-red-400" />
                <span>Painel Admin</span>
              </Link>
            )}

            {/* Árbitro badge */}
            {isReferee && !isAdmin && (
              <Link
                href="/arbitros"
                className="hidden lg:flex items-center gap-1.5 bg-amber-900/30 hover:bg-amber-800/40 text-amber-300 border border-amber-500/30 text-xs font-bold px-3 py-2 rounded-xl transition-all hover:scale-105"
              >
                <Scale className="w-3.5 h-3.5 text-amber-400" />
                <span>Árbitro</span>
              </Link>
            )}

            {/* Dropdown usuário */}
            <div className="relative">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-xl border border-dark-700 bg-dark-850 hover:border-red-700/40 transition-all"
              >
                <img src={user.avatarUrl} alt={user.username} className="w-8 h-8 rounded-lg object-cover border border-dark-600" />
                <span className="text-xs font-bold text-gray-200 hidden xl:inline pr-1">{user.username}</span>
              </button>

              {isUserDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-60 bg-dark-900 border border-dark-700 rounded-xl shadow-2xl py-2 z-50 text-sm"
                  onClick={() => setIsUserDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-dark-800">
                    <p className="font-bold text-white text-sm">{user.fullName}</p>
                    <p className="text-xs text-gray-400 font-mono">{user.riotId || user.email}</p>
                    <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded border uppercase font-bold ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>

                  <Link href="/dashboard/profile"
                    className="flex items-center gap-2.5 px-4 py-2 text-gray-300 hover:text-white hover:bg-dark-800 transition-colors">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>Meu Perfil</span>
                  </Link>

                  <Link href="/dashboard/wallet"
                    className="flex items-center gap-2.5 px-4 py-2 text-gray-300 hover:text-white hover:bg-dark-800 transition-colors">
                    <Wallet className="w-4 h-4 text-emerald-400" />
                    <span>Carteira & Saques</span>
                  </Link>

                  {isReferee && (
                    <>
                      <div className="my-1 border-t border-dark-800" />
                      <Link href="/arbitros"
                        className="flex items-center gap-2.5 px-4 py-2 text-amber-300 hover:text-amber-100 hover:bg-amber-950/40 transition-colors">
                        <Scale className="w-4 h-4 text-amber-400" />
                        <span>Painel do Árbitro</span>
                      </Link>
                    </>
                  )}

                  {isAdmin && (
                    <Link href="/admin"
                      className="flex items-center gap-2.5 px-4 py-2 text-red-300 hover:text-red-100 hover:bg-red-950/40 transition-colors">
                      <Shield className="w-4 h-4 text-red-500" />
                      <span>Painel Admin</span>
                    </Link>
                  )}

                  <div className="my-1 border-t border-dark-800" />
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair da Conta</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-dark-800"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-dark-800 bg-dark-950/95 px-4 pt-2 pb-4 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-300 hover:text-white hover:bg-dark-800">
                  <Icon className="w-4 h-4 text-red-500" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            {isReferee && (
              <Link href="/arbitros" onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-amber-300 hover:bg-amber-950/40">
                <Scale className="w-4 h-4 text-amber-400" />
                <span>Painel do Árbitro</span>
              </Link>
            )}
            {isAdmin && (
              <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-300 hover:bg-red-950/40">
                <Sliders className="w-4 h-4 text-red-400" />
                <span>Painel Admin</span>
              </Link>
            )}
          </div>
        )}
      </header>

      {isDepositOpen && <DepositModal onClose={() => setIsDepositOpen(false)} />}
    </>
  );
}
