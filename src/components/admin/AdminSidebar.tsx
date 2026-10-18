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
  ArrowLeft,
  Shield,
  Zap,
  Users,
} from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const { siteSettings, withdrawalRequests } = useAppState();

  const pendingWithdrawalsCount = withdrawalRequests.filter(
    (r) => r.status === 'pending'
  ).length;

  const links = [
    { href: '/admin', label: 'Dashboard Geral', icon: LayoutDashboard },
    { href: '/admin/banners', label: 'Banners & Mídia (CMS)', icon: ImageIcon },
    { href: '/admin/tournaments', label: 'Torneios & Chaves', icon: Trophy },
    {
      href: '/admin/finance',
      label: 'Financeiro & Saques PIX',
      icon: DollarSign,
      badge: pendingWithdrawalsCount > 0 ? pendingWithdrawalsCount : undefined,
    },
    { href: '/admin/settings', label: 'Personalização do Site', icon: Palette },
  ];

  const isActive = (href: string) => {
    if (href === '/admin' && pathname === '/admin') return true;
    if (href !== '/admin' && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <aside className="w-64 bg-dark-900 border-r border-dark-800 flex flex-col justify-between p-4 shrink-0 min-h-screen">
      <div className="space-y-6">
        {/* Header do CMS */}
        <div className="px-3 pt-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-900/60 border border-red-500/40 text-red-300">
              <Shield className="w-5 h-5 text-red-400\" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider">
                Admin CMS
              </h2>
              <span className="text-[10px] text-red-300 font-mono block -mt-0.5 font-bold">
                {siteSettings.siteDomain || 'visionleague.gg'}
              </span>
              <span className="text-[9px] text-gray-500 font-mono block">
                @{siteSettings.ownerUsername || 'vision.group.adm'}
              </span>
            </div>
          </div>
        </div>

        {/* Links do Menu */}
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  active
                    ? 'bg-red-900/50 text-white border border-red-500/40 shadow-neon-red'
                    : 'text-gray-400 hover:text-white hover:bg-dark-850'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      active ? 'text-red-400' : 'text-gray-500'
                    }`}
                  />
                  <span>{link.label}</span>
                </div>
                {link.badge !== undefined && (
                  <span className="bg-amber-500 text-dark-950 font-black px-2 py-0.5 rounded-full text-[10px] animate-pulse">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Botão de Retorno ao Site Público */}
      <div className="pt-4 border-t border-dark-800">
        <Link
          href="/"
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-dark-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-red-400\" />
          <span>Voltar ao Site Público</span>
        </Link>
      </div>
    </aside>
  );
}
