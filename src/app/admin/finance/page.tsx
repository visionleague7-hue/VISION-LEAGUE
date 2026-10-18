'use client';

import React, { useState } from 'react';
import { useAppState } from '@/lib/state-context';
import { formatBRL, formatDateTime } from '@/lib/utils';
import { WithdrawalStatus, PixKeyType } from '@/lib/types';
import {
  DollarSign,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Receipt,
  Search,
  AlertTriangle,
} from 'lucide-react';

export default function FinanceAdminPage() {
  const {
    withdrawalRequests,
    transactions,
    siteSettings,
    approveWithdrawal,
    rejectWithdrawal,
  } = useAppState();

  const [statusFilter, setStatusFilter] = useState<'all' | WithdrawalStatus>('all');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Cálculos financeiros
  const totalPayIn = transactions
    .filter((t) => (t.type === 'deposit_pix' || t.type === 'tournament_entry') && t.status === 'completed')
    .reduce((acc, curr) => acc + (curr.amount > 0 ? curr.amount : 0), 0);

  const totalPayOut = transactions
    .filter((t) => t.type === 'withdrawal_pix' && t.status === 'completed')
    .reduce((acc, curr) => acc + Math.abs(curr.amount), 0);

  const totalRake = totalPayIn * 0.1;

  const filteredRequests = withdrawalRequests.filter((req) => {
    if (statusFilter !== 'all' && req.status !== statusFilter) return false;
    return true;
  });

  const handleConfirmReject = () => {
    if (!rejectingId) return;
    rejectWithdrawal(rejectingId, rejectReason.trim() || 'Dados da chave PIX inconsistentes');
    setRejectingId(null);
    setRejectReason('');
  };

  const getStatusBadge = (status: WithdrawalStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded border border-amber-500/40">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            Pendente de Aprovação
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> Liquidado via PIX
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-950/60 px-2.5 py-0.5 rounded border border-rose-500/30">
            <XCircle className="w-3 h-3" /> Rejeitado / Estornado
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-bold text-gray-400 bg-dark-800 px-2.5 py-0.5 rounded">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-red-400 bg-red-950/60 px-3 py-1 rounded-full border border-red-500/30 mb-2">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Auditoria & Gateway PIX</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Controle Financeiro & Saques PIX
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm">
            Monitore o fluxo de caixa, aprove saques de alta quantia com trava de segurança antifraude e consulte o ledger auditável.
          </p>
        </div>
      </div>

      {/* Cards de Métricas Financeiras */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-dark-900 border border-dark-800 space-y-1">
          <span className="text-xs font-bold uppercase text-emerald-400 flex items-center gap-1.5">
            <ArrowDownLeft className="w-4 h-4" /> Entradas (Pay-In PIX)
          </span>
          <div className="text-3xl font-black text-white font-mono">
            {formatBRL(totalPayIn)}
          </div>
          <p className="text-[11px] text-gray-500">Depósitos e taxas de inscrição</p>
        </div>

        <div className="p-6 rounded-2xl bg-dark-900 border border-dark-800 space-y-1">
          <span className="text-xs font-bold uppercase text-red-400 flex items-center gap-1.5">
            <ArrowUpRight className="w-4 h-4" /> Saídas (Pay-Out PIX)
          </span>
          <div className="text-3xl font-black text-white font-mono">
            {formatBRL(totalPayOut)}
          </div>
          <p className="text-[11px] text-gray-500">Saques e transferências liquidadas</p>
        </div>

        <div className="p-6 rounded-2xl bg-dark-900 border border-red-500/30 shadow-neon-red space-y-1">
          <span className="text-xs font-bold uppercase text-gray-300 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-red-400\" /> Rake / Lucro Retido
          </span>
          <div className="text-3xl font-black text-red-300 font-mono">
            {formatBRL(totalRake)}
          </div>
          <p className="text-[11px] text-gray-400">10% de comissão operacional retida</p>
        </div>
      </div>

      {/* Relatório de Solicitações de Saque */}
      <div className="bg-dark-900 rounded-2xl border border-dark-800 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-800 pb-4">
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight">
              Solicitações de Saque (PIX Pay-Out)
            </h3>
            <p className="text-xs text-gray-400">
              Trava de segurança: Saques acima de {formatBRL(siteSettings.antiFraudThreshold)} exigem autorização manual.
            </p>
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === 'all'
                  ? 'bg-red-600 text-white font-black'
                  : 'bg-dark-850 text-gray-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === 'pending'
                  ? 'bg-amber-500 text-dark-950 font-black'
                  : 'bg-dark-850 text-gray-400 hover:text-amber-400'
              }`}
            >
              Pendentes
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === 'completed'
                  ? 'bg-emerald-500 text-dark-950 font-black'
                  : 'bg-dark-850 text-gray-400 hover:text-emerald-400'
              }`}
            >
              Liquidados
            </button>
          </div>
        </div>

        {/* Tabela de Saques */}
        {filteredRequests.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm">
            Nenhuma solicitação de saque encontrada.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-dark-800 text-gray-400 uppercase font-mono tracking-wider">
                  <th className="pb-3 font-semibold">Jogador</th>
                  <th className="pb-3 font-semibold">Chave PIX</th>
                  <th className="pb-3 font-semibold">Valor</th>
                  <th className="pb-3 font-semibold">Data</th>
                  <th className="pb-3 font-semibold">Status / Antifraude</th>
                  <th className="pb-3 font-semibold text-right">Ações de Moderação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800/60 font-mono">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-dark-850/50 transition-colors">
                    <td className="py-4 pr-3 font-sans font-bold text-white">
                      {req.userName || req.userId}
                    </td>
                    <td className="py-4 pr-3 text-gray-300">
                      <span className="text-[10px] text-gray-500 block uppercase font-bold font-sans">
                        {req.pixKeyType}
                      </span>
                      {req.pixKey}
                    </td>
                    <td className="py-4 pr-3 font-black text-sm text-white">
                      {formatBRL(req.amount)}
                    </td>
                    <td className="py-4 pr-3 text-gray-400 font-sans">
                      {formatDateTime(req.createdAt)}
                    </td>
                    <td className="py-4 pr-3">
                      <div className="space-y-1">
                        {getStatusBadge(req.status)}
                        {req.antiFraudFlagged && req.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-300 font-bold bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-600/50 block w-fit">
                            <ShieldAlert className="w-3 h-3" /> Trava Antifraude
                          </span>
                        )}
                        {req.rejectionReason && (
                          <span className="text-[10px] text-rose-400 block font-sans">
                            Motivo: {req.rejectionReason}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      {req.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => approveWithdrawal(req.id)}
                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-dark-950 font-black text-xs uppercase rounded-lg transition-all shadow-sm"
                          >
                            Aprovar via PIX
                          </button>
                          <button
                            onClick={() => {
                              setRejectingId(req.id);
                              setRejectReason('');
                            }}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase rounded-lg transition-all"
                          >
                            Rejeitar
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-gray-500 font-sans font-semibold">
                          Processado
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Rejeição de Saque com Estorno */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-dark-900 border border-rose-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold text-white uppercase">Rejeitar Solicitação de Saque</h3>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              O valor do saque será estornado integralmente do saldo bloqueado de volta para o saldo disponível do jogador no ledger.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase">Motivo da Rejeição:</label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ex: Chave PIX informada não corresponde ao CPF cadastrado ou conta com restrição."
                className="w-full bg-dark-850 border border-dark-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-rose-400"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingId(null)}
                className="px-4 py-2 bg-dark-800 text-gray-300 text-xs font-bold rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase rounded-xl transition-all"
              >
                Confirmar Estorno
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
