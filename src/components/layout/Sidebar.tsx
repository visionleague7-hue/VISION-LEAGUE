'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppState } from '@/lib/state-context';
import { formatBRL } from '@/lib/utils';
import {
  Zap,
  Trophy,
  Newspaper,
  Wallet,
  Shield,
  Sliders,
  PlusCircle,
  ArrowUpRight,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Users,
  ShieldAlert,
  MessageSquare,
  Scale,
} from 'lucide-react';
import DepositModal from '../wallet/DepositModal';
import WithdrawModal from '../wallet/WithdrawModal';
import LoginModal from '../auth/LoginModal';

export default function Sidebar() {
  const pathname = usePathname();
  const { siteSettings, wallet, user, isLoggedIn, logout } = useAppState();

  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const discordUrl = siteSettings.discordUrl || 'https://discord.gg/QynktSWuK';
  const isAdmin = isLoggedIn && (user.role === 'admin' || user.role === 'moderator');

  const navLinks = [
    { href: '/', label: 'Início', icon: Zap },
    { href: '/tournaments', label: 'Campeonatos', icon: Trophy },
    { href: '/teams', label: 'Times & Lineups', icon: Users },
    { href: '/arbitros', label: 'Área dos Árbitros', icon: ShieldAlert },
    { href: '/dashboard/wallet', label: 'Minha Carteira', icon: Wallet },
    { href: '/news', label: 'Notícias & Regras', icon: Newspaper },
  ];

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  const isCurrentAdmin = pathname.startsWith('/admin');

  // Logo como texto estilizado
  const LogoText = () => (
    <div className="flex flex-col leading-none select-none">
      <span className="font-black text-base tracking-[0.15em] text-white uppercase">VISION</span>
      <span className="font-black text-[11px] tracking-[0.3em] text-red-500 uppercase -mt-0.5">LEAGUE</span>
    </div>
  );

  return (
    <>
      {/* Barra Mobile Top */}
      <div className="lg:hidden sticky top-0 z-40 w-full bg-dark-950/95 border-b border-dark-800 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          {siteSettings.logoUrl ? (
            <img src={siteSettings.logoUrl} alt="Vision League" className="w-8 h-8 rounded-lg object-contain border border-dark-700 bg-dark-900" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-dark-800 border border-red-700/40 flex items-center justify-center font-black text-sm text-red-500">V</div>
          )}
          <LogoText />
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDepositOpen(true)}
            className="flex items-center gap-1.5 bg-dark-900 border border-dark-700 hover:border-red-500/50 px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-emerald-400 transition-colors"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>{formatBRL(wallet.availableBalance)}</span>
          </button>
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 text-gray-300 hover:text-white bg-dark-900 rounded-lg border border-dark-800"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Backdrop mobile */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/80 lg:hidden" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Sidebar principal */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-dark-950 border-r border-dark-800 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 will-change-transform ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto p-4 space-y-5">

          {/* Logo */}
          <div className="flex items-center justify-between pb-3 border-b border-dark-800">
            <Link href="/" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-3 group">
              {siteSettings.logoUrl ? (
                <img
                  src={siteSettings.logoUrl}
                  alt="Vision League"
                  className="w-11 h-11 object-contain rounded-xl border border-dark-700 bg-dark-900 group-hover:border-red-700/60 transition-colors"
                />
              ) : (
                <div className="w-11 h-11 rounded-xl bg-dark-800 border border-red-700/40 flex items-center justify-center font-black text-xl text-red-500 group-hover:border-red-500 transition-colors">
                  V
                </div>
              )}
              <LogoText />
            </Link>
            <button onClick={() => setIsMobileOpen(false)} className="lg:hidden p-1.5 text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navegação */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600 px-3 block mb-1.5">Navegação</span>
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'text-white bg-dark-850 border border-red-700/40'
                      : 'text-gray-400 hover:text-white hover:bg-dark-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-red-500' : 'text-gray-600'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {/* Painel Admin — só para admin/moderator */}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all mt-1.5 ${
                  isCurrentAdmin
                    ? 'bg-red-950/60 text-red-200 border border-red-700/50'
                    : 'bg-dark-900/60 text-gray-400 hover:text-red-300 border border-dark-800 hover:border-red-800/40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sliders className="w-4 h-4 text-red-500" />
                  <span>Painel Admin</span>
                </div>
                <span className="text-[9px] bg-red-900/80 text-red-300 px-1.5 py-0.5 rounded font-mono font-bold">ADMIN</span>
              </Link>
            )}
          </div>

          {/* Comunidade */}
          <div className="space-y-2 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600 px-3 block">Comunidade</span>

            <a
              href={discordUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 transition-all"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <span>Nossa Comunidade</span>
              </div>
              <span className="text-[10px] font-mono text-indigo-400 font-extrabold">DISCORD</span>
            </a>

            <a
              href={discordUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 transition-all"
            >
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-400" />
                <span>Vire Árbitro</span>
              </div>
              <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded uppercase font-semibold">Vagas</span>
            </a>
          </div>

          {/* Carteira */}
          <div className="p-3.5 rounded-2xl bg-dark-900 border border-dark-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-red-500" />
                Minha Carteira
              </span>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                PIX Ativo
              </div>
            </div>

            <div>
              <span className="text-[10px] text-gray-500 block uppercase font-medium">Saldo Disponível</span>
              <div className="text-xl font-black text-emerald-400 font-mono tracking-tight">
                {formatBRL(wallet.availableBalance)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => setIsDepositOpen(true)}
                className="py-2 px-2 rounded-xl bg-red-700 hover:bg-red-600 text-white font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1 transition-all active:scale-95"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ PIX</span>
              </button>
              <button
                type="button"
                onClick={() => setIsWithdrawOpen(true)}
                className="py-2 px-2 rounded-xl bg-dark-800 hover:bg-dark-700 text-gray-200 font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1 border border-dark-700 transition-all active:scale-95"
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-gray-400" />
                <span>Sacar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Rodapé: perfil do usuário */}
        <div className="p-3.5 border-t border-dark-800 bg-dark-900/60">
          {isLoggedIn ? (
            <div className="relative">
              <div
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-dark-850 cursor-pointer transition-colors border border-transparent hover:border-dark-700"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <img src={user.avatarUrl} alt={user.username} className="w-8 h-8 rounded-lg object-cover border border-dark-700" />
                  <div className="truncate text-left">
                    <p className="text-xs font-bold text-white truncate">{user.username}</p>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {user.role === 'admin' ? 'Administrador' : user.rankTier}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
              </div>

              {isUserMenuOpen && (
                <div className="absolute bottom-14 left-0 right-0 bg-dark-900 border border-dark-700 rounded-xl shadow-2xl p-1.5 z-50 text-xs space-y-1">
                  <div className="px-3 py-2 border-b border-dark-800">
                    <p className="font-bold text-white text-xs">{user.fullName}</p>
                    <p className="text-[10px] text-gray-400 font-mono truncate">{user.email}</p>
                  </div>

                  <Link href="/dashboard/profile" onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-dark-800 rounded-lg">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span>Meu Perfil</span>
                  </Link>

                  <Link href="/teams" onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-dark-800 rounded-lg">
                    <Users className="w-3.5 h-3.5 text-gray-400" />
                    <span>Meus Times</span>
                  </Link>

                  <Link href="/dashboard/wallet" onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-dark-800 rounded-lg">
                    <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Minha Carteira</span>
                  </Link>

                  {isAdmin && (
                    <Link href="/admin" onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-red-300 hover:text-red-100 hover:bg-red-950/40 rounded-lg">
                      <Shield className="w-3.5 h-3.5 text-red-500" />
                      <span>Painel Admin</span>
                    </Link>
                  )}

                  <button
                    onClick={() => { setIsUserMenuOpen(false); logout(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-rose-400 hover:bg-rose-950/40 rounded-lg text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sair da Conta</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsLoginOpen(true)}
              className="w-full py-2.5 px-3 bg-white hover:bg-gray-100 text-gray-900 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2.5 active:scale-95"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Entrar com Google</span>
            </button>
          )}
        </div>
      </aside>

      {isDepositOpen && <DepositModal onClose={() => setIsDepositOpen(false)} />}
      {isWithdrawOpen && <WithdrawModal onClose={() => setIsWithdrawOpen(false)} />}
      {isLoginOpen && <LoginModal onClose={() => setIsLoginOpen(false)} />}
    </>
  );
}
