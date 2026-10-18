'use client';

import React, { useState } from 'react';
import { useAppState } from '@/lib/state-context';
import { formatBRL, formatDateTime } from '@/lib/utils';
import { TransactionType } from '@/lib/types';
import DepositModal from '@/components/wallet/DepositModal';
import WithdrawModal from '@/components/wallet/WithdrawModal';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Trophy,
  Zap,
  Lock,
  Filter,
  Receipt,
  CheckCircle2,
  Clock,
  PlusCircle,
} from 'lucide-react';

export default function WalletPage() {
  const { wallet, transactions, user } = useAppState();
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');

  const filteredTransactions = transactions.filter((tx) => {
    if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
    return true;
  });

  const totalPrizesWon = transactions
    .filter((tx) => tx.type === 'prize_payout' && tx.status === 'completed')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const getTransactionBadge = (type: TransactionType) => {
    switch (type) {
      case 'deposit_pix':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-500/30">
            <ArrowDownLeft className="w-3 h-3" /> Depósito PIX
          </span>
        );
      case 'prize_payout':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded border border-amber-500/30">
            <Trophy className="w-3 h-3" /> Premiação Torneio
          </span>
        );
      case 'tournament_entry':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-400 bg-red-950/60 px-2.5 py-0.5 rounded border border-red-500/30">
            <Zap className="w-3 h-3" /> Inscrição
          </span>
        );
      case 'withdrawal_pix':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-400 bg-red-950/60 px-2.5 py-0.5 rounded border border-red-500/30">
            <ArrowUpRight className="w-3 h-3" /> Saque PIX
          </span>
        );
      case 'withdrawal_refund':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-950/60 px-2.5 py-0.5 rounded border border-rose-500/30">
            Estorno
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header com Saldo Principal e Botões de Ação */}
      <div className="bg-gradient-to-r from-dark-900 via-dark-850 to-dark-900 border border-red-500/20 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase text-red-400 bg-red-950/60 px-3 py-1 rounded-full border border-red-500/30">
              <Wallet className="w-3.5 h-3.5" />
              <span>Carteira Virtual • Ledger Auditável</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
              Minha Carteira & Premiações
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm">
              Jogador: <strong className="text-white">{user.username}</strong> • Riot ID:{' '}
              <strong className="text-gray-200 font-mono">{user.riotId || 'N/A'}</strong>
            </p>
          </div>

          {/* Botões de Ação PIX */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsDepositOpen(true)}
              className="px-6 py-3.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-neon-red flex items-center gap-2 hover:scale-105"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Depositar via PIX</span>
            </button>

            <button
              onClick={() => setIsWithdrawOpen(true)}
              className="px-6 py-3.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-neon-red flex items-center gap-2 hover:scale-105"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Solicitar Saque (PIX)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cards de Saldo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Saldo Disponível */}
        <div className="p-6 rounded-2xl bg-dark-900 border border-emerald-500/40 shadow-lg relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Zap className="w-4 h-4" /> Saldo Disponível
            </span>
            <div className="text-3xl font-black text-white font-mono">
              {formatBRL(wallet.availableBalance)}
            </div>
            <p className="text-[11px] text-gray-400 pt-1">
              Pronto para inscrições imediatas ou resgate via PIX.
            </p>
          </div>
        </div>

        {/* Saldo Bloqueado em Saque */}
        <div className="p-6 rounded-2xl bg-dark-900 border border-dark-800 relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Lock className="w-4 h-4" /> Saldo Bloqueado
            </span>
            <div className="text-3xl font-black text-gray-300 font-mono">
              {formatBRL(wallet.lockedBalance)}
            </div>
            <p className="text-[11px] text-gray-500 pt-1">
              Em processamento de saque ou confirmação bancária.
            </p>
          </div>
        </div>

        {/* Total de Premiações Recebidas */}
        <div className="p-6 rounded-2xl bg-dark-900 border border-dark-800 relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <Trophy className="w-4 h-4" /> Total Ganho em Prêmios
            </span>
            <div className="text-3xl font-black text-amber-400 font-mono">
              {formatBRL(totalPrizesWon)}
            </div>
            <p className="text-[11px] text-gray-500 pt-1">
              Acumulado em vitórias em campeonatos VISION.
            </p>
          </div>
        </div>
      </div>

      {/* Extrato e Histórico do Ledger */}
      <div className="bg-dark-900 rounded-2xl border border-dark-800 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-800 pb-4">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-red-400" />
            <h3 className="text-lg font-black text-white uppercase tracking-tight">
              Extrato Financeiro do Ledger
            </h3>
          </div>

          {/* Filtros de Tipo */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                typeFilter === 'all'
                  ? 'bg-red-600 text-white font-black'
                  : 'bg-dark-850 text-gray-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setTypeFilter('deposit_pix')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                typeFilter === 'deposit_pix'
                  ? 'bg-emerald-500 text-dark-950 font-black'
                  : 'bg-dark-850 text-gray-400 hover:text-emerald-400'
              }`}
            >
              Depósitos
            </button>
            <button
              onClick={() => setTypeFilter('prize_payout')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                typeFilter === 'prize_payout'
                  ? 'bg-amber-500 text-dark-950 font-black'
                  : 'bg-dark-850 text-gray-400 hover:text-amber-400'
              }`}
            >
              Premiações
            </button>
            <button
              onClick={() => setTypeFilter('tournament_entry')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                typeFilter === 'tournament_entry'
                  ? 'bg-red-600 text-white font-black'
                  : 'bg-dark-850 text-gray-400 hover:text-red-400'
              }`}
            >
              Inscrições
            </button>
            <button
              onClick={() => setTypeFilter('withdrawal_pix')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                typeFilter === 'withdrawal_pix'
                  ? 'bg-red-600 text-white font-black'
                  : 'bg-dark-850 text-gray-400 hover:text-red-400'
              }`}
            >
              Saques
            </button>
          </div>
        </div>

        {/* Tabela de Transações */}
        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm">
            Nenhuma transação encontrada para este filtro.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-dark-800 text-gray-400 uppercase font-mono tracking-wider">
                  <th className="pb-3 font-semibold">Tipo</th>
                  <th className="pb-3 font-semibold">Descrição</th>
                  <th className="pb-3 font-semibold">Data / Hora</th>
                  <th className="pb-3 font-semibold">Referência / PIX ID</th>
                  <th className="pb-3 font-semibold text-right">Valor</th>
                  <th className="pb-3 font-semibold text-right">Saldo Final</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800/60 font-mono">
                {filteredTransactions.map((tx) => {
                  const isPositive = tx.amount > 0;
                  return (
                    <tr key={tx.id} className="hover:bg-dark-850/50 transition-colors">
                      <td className="py-3.5 pr-3">{getTransactionBadge(tx.type)}</td>
                      <td className="py-3.5 pr-3 font-sans text-gray-200 font-medium">
                        {tx.description}
                      </td>
                      <td className="py-3.5 pr-3 text-gray-400 font-sans">
                        {formatDateTime(tx.createdAt)}
                      </td>
                      <td className="py-3.5 pr-3 text-gray-500 text-[11px] truncate max-w-[140px]">
                        {tx.pixE2eId || tx.referenceId || tx.id}
                      </td>
                      <td
                        className={`py-3.5 pr-3 text-right font-bold text-sm ${
                          isPositive ? 'text-emerald-400' : 'text-gray-200'
                        }`}
                      >
                        {isPositive ? `+${formatBRL(tx.amount)}` : formatBRL(tx.amount)}
                      </td>
                      <td className="py-3.5 text-right text-gray-400 font-semibold">
                        {formatBRL(tx.balanceAfter)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modais */}
      {isDepositOpen && <DepositModal onClose={() => setIsDepositOpen(false)} />}
      {isWithdrawOpen && <WithdrawModal onClose={() => setIsWithdrawOpen(false)} />}
    </div>
  );
}
