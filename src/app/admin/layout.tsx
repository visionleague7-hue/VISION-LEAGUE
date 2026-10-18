'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppState } from '@/lib/state-context';
import {
  LayoutDashboard,
  Image as ImageIcon,
  Trophy,
  DollarSign,
  Palette,
  Shield,
  ArrowLeft,
  Users,
} from 'lucide-react';
import AdminAuthGate from '@/components/admin/AdminAuthGate';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { siteSettings, withdrawalRequests } = useAppState();

  const pendingWithdrawalsCount = withdrawalRequests.filter(
    (r) => r.status === 'pending'
  ).length;

  const adminTabs = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/banners', label: 'Banners & Mídia', icon: ImageIcon },
    { href: '/admin/tournaments', label: 'Torneios & Premiação', icon: Trophy },
    {
      href: '/admin/finance',
      label: 'Financeiro & Saques PIX',
      icon: DollarSign,
      badge: pendingWithdrawalsCount > 0 ? pendingWithdrawalsCount : undefined,
    },
    { href: '/admin/users', label: 'Usuários & Árbitros', icon: Users },
    { href: '/admin/settings', label: 'Personalização do Site', icon: Palette },
  ];

  const isActive = (href: string) => {
    if (href === '/admin' && pathname === '/admin') return true;
    if (href !== '/admin' && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <AdminAuthGate>
      <div className="space-y-6 max-w-7xl mx-auto py-4">
      {/* Barra de Subnavegação das Abas do CMS */}
      <div className="bg-dark-900 border border-dark-800 rounded-2xl p-2.5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2 px-3 py-1">
          <div className="p-1.5 rounded-lg bg-red-950 border border-red-500/40 text-red-300">
            <Shield className="w-4 h-4 text-red-400\" />
          </div>
          <div>
            <span className="text-xs font-black text-white uppercase tracking-wider block leading-none">
              Painel Admin CMS
            </span>
            <span className="text-[10px] text-red-400 font-mono">
              @{siteSettings.ownerUsername || 'vision.group.adm'}
            </span>
          </div>
        </div>

        {/* Abas de Navegação */}
        <div className="flex flex-wrap items-center gap-1.5">
          {adminTabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  active
                    ? 'bg-red-900/60 text-white border border-red-500/50 shadow-neon-red'
                    : 'text-gray-400 hover:text-white hover:bg-dark-850'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-red-300' : 'text-gray-500'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className="bg-amber-500 text-dark-950 font-black px-1.5 py-0.2 rounded-full text-[9px] animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Link Rápido de Retorno */}
        <Link
          href="/"
          className="text-xs font-bold text-gray-400 hover:text-red-400 px-3 py-1.5 flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao Site</span>
        </Link>
      </div>

      {/* Conteúdo da Página do CMS */}
      <div>{children}</div>
    </div>
    </AdminAuthGate>
  );
}
