'use client';

import React from 'react';
import Link from 'next/link';
import { useAppState } from '@/lib/state-context';
import { formatBRL } from '@/lib/utils';
import {
  DollarSign,
  Trophy,
  Users,
  Image as ImageIcon,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  Zap,
  Settings,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { tournaments, withdrawalRequests, banners, transactions } = useAppState();

  const pendingWithdrawals = withdrawalRequests.filter((r) => r.status === 'pending');
  const activeTournaments = tournaments.filter((t) => t.status === 'open' || t.status === 'ongoing');

  const totalVolume = transactions
    .filter((t) => t.status === 'completed' && t.amount > 0)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalPlatformRake = totalVolume * 0.1;

  const totalPaidOut = transactions
    .filter((t) => t.type === 'withdrawal_pix' && t.status === 'completed')
    .reduce((acc, curr) => acc + Math.abs(curr.amount), 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-red-400 bg-red-950/60 px-3 py-1 rounded-full border border-red-500/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Painel do Proprietário CMS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Dashboard Administrativo
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm">
            Gerencie banners, campeonatos, premiações automáticas e aprove solicitações de saque via PIX.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/tournaments"
            className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase rounded-xl transition-all shadow-lg shadow-red-900/40"
          >
            Novo Campeonato
          </Link>
          <Link
            href="/admin/banners"
            className="px-4 py-2.5 bg-dark-850 hover:bg-dark-800 text-gray-200 border border-dark-700 font-bold text-xs uppercase rounded-xl transition-all"
          >
            Editar Banners
          </Link>
        </div>
      </div>

      {/* Alerta de Saques Pendentes */}
      {pendingWithdrawals.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-600/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-900/60 text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                {pendingWithdrawals.length} solicitação(ões) de saque aguardando revisão!
              </h4>
              <p className="text-xs text-amber-300/80">
                Saques acima da trava antifraude exigem aprovação manual antes da transferência PIX.
              </p>
            </div>
          </div>
          <Link href="/admin/finance"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-dark-950 font-black text-xs uppercase rounded-xl transition-all shrink-0">
            Revisar Saques
          </Link>
        </div>
      )}

      {/* Grid de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-2xl bg-dark-900 border border-dark-800 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-gray-400 text-xs font-bold uppercase">
            <span>Volume Total (GMV)</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{formatBRL(totalVolume)}</div>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" /> Entradas e Premiações
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-dark-900 border border-red-500/30 shadow-lg shadow-red-950/20 space-y-2">
          <div className="flex items-center justify-between text-red-300 text-xs font-bold uppercase">
            <span>Comissões Retidas (Rake)</span>
            <Sparkles className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black text-red-300 font-mono">{formatBRL(totalPlatformRake)}</div>
          <p className="text-[11px] text-gray-400">Receita operacional da VISION</p>
        </div>

        <div className="p-6 rounded-2xl bg-dark-900 border border-dark-800 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-gray-400 text-xs font-bold uppercase">
            <span>Total Resgatado (PIX)</span>
            <ArrowUpRight className="w-4 h-4 text-gray-300" />
          </div>
          <div className="text-2xl font-black text-gray-100 font-mono">{formatBRL(totalPaidOut)}</div>
          <p className="text-[11px] text-gray-400">Liquidado na conta dos jogadores</p>
        </div>

        <div className="p-6 rounded-2xl bg-dark-900 border border-dark-800 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-gray-400 text-xs font-bold uppercase">
            <span>Torneios em Disputa</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{activeTournaments.length}</div>
          <p className="text-[11px] text-gray-400">Total cadastrados: {tournaments.length}</p>
        </div>
      </div>

      {/* Módulos de Atalho Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <Link href="/admin/banners"
          className="p-6 rounded-2xl bg-dark-900 border border-dark-800 hover:border-red-500/40 transition-all group shadow-md">
          <div className="p-3 w-12 h-12 rounded-xl bg-red-950/60 border border-red-500/30 text-red-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <ImageIcon className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-sm uppercase">Banners</h3>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
            Upload de banners para a home, chamadas e links.
          </p>
          <span className="inline-block mt-4 text-xs font-black text-red-400 uppercase tracking-wider group-hover:underline">
            {banners.length} Ativos →
          </span>
        </Link>

        <Link href="/admin/tournaments"
          className="p-6 rounded-2xl bg-dark-900 border border-dark-800 hover:border-amber-500/40 transition-all group shadow-md">
          <div className="p-3 w-12 h-12 rounded-xl bg-amber-950/60 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <Trophy className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-sm uppercase">Torneios</h3>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
            Crie campeonatos, declare vencedores e pague via PIX.
          </p>
          <span className="inline-block mt-4 text-xs font-black text-amber-400 uppercase tracking-wider group-hover:underline">
            Gerenciar →
          </span>
        </Link>

        <Link href="/admin/finance"
          className="p-6 rounded-2xl bg-dark-900 border border-dark-800 hover:border-emerald-500/40 transition-all group shadow-md">
          <div className="p-3 w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <DollarSign className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-sm uppercase">Finanças</h3>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
            Saques PIX, ledger auditável e controle antifraude.
          </p>
          <span className="inline-block mt-4 text-xs font-black text-emerald-400 uppercase tracking-wider group-hover:underline">
            Auditar →
          </span>
        </Link>

        <Link href="/admin/settings"
          className="p-6 rounded-2xl bg-dark-900 border border-dark-800 hover:border-gray-500/40 transition-all group shadow-md">
          <div className="p-3 w-12 h-12 rounded-xl bg-gray-900/60 border border-gray-700/50 text-gray-300 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <Settings className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-sm uppercase">Configurações</h3>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
            Identidade visual, cores, templates automáticos e redes sociais.
          </p>
          <span className="inline-block mt-4 text-xs font-black text-gray-300 uppercase tracking-wider group-hover:underline">
            Ajustar →
          </span>
        </Link>
      </div>
    </div>
  );
}
