'use client';

import React, { useState } from 'react';
import { useAppState } from '@/lib/state-context';
import { PixKeyType } from '@/lib/types';
import { formatBRL, validatePixKey } from '@/lib/utils';
import { X, ArrowUpRight, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';

interface WithdrawModalProps {
  onClose: () => void;
}

export default function WithdrawModal({ onClose }: WithdrawModalProps) {
  const { wallet, siteSettings, requestWithdrawal, user } = useAppState();
  const [pixKeyType, setPixKeyType] = useState<PixKeyType>('cpf');
  const [pixKey, setPixKey] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{
    message: string;
    requiresApproval: boolean;
  } | null>(null);

  const parsedAmount = parseFloat(amount) || 0;
  const isAboveAntiFraud = parsedAmount >= siteSettings.antiFraudThreshold;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (parsedAmount < siteSettings.minWithdrawalAmount) {
      setErrorMsg(`O valor mínimo para saque é de ${formatBRL(siteSettings.minWithdrawalAmount)}.`);
      return;
    }

    if (parsedAmount > wallet.availableBalance) {
      setErrorMsg(`Saldo disponível insuficiente. Seu saldo é de ${formatBRL(wallet.availableBalance)}.`);
      return;
    }

    const keyValidation = validatePixKey(pixKeyType, pixKey);
    if (!keyValidation.valid) {
      setErrorMsg(keyValidation.message || 'Chave PIX inválida.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Chamada à API de Saque Asaas v3
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          amount: parsedAmount,
          pixKey: pixKey.trim(),
          pixKeyType,
          description: `Saque Vision League - ${user.username}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Falha ao processar saque via Asaas.');
        setIsSubmitting(false);
        return;
      }

      // 2. Atualiza estado local da carteira
      const result = requestWithdrawal(parsedAmount, pixKeyType, pixKey.trim());
      setSuccessInfo({
        message: data.message || result.message,
        requiresApproval: result.requiresApproval,
      });
    } catch {
      const result = requestWithdrawal(parsedAmount, pixKeyType, pixKey.trim());
      setSuccessInfo({
        message: result.message,
        requiresApproval: result.requiresApproval,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-dark-900 border border-red-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-dark-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-red-950 border border-red-500/30 text-red-400">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase">Solicitar Saque (PIX)</h3>
              <p className="text-xs text-gray-400">Transferência rápida para sua conta bancária</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-dark-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 p-3 bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs rounded-xl font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successInfo ? (
          <div className="space-y-4 text-center py-2">
            <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h4 className="text-lg font-black text-white">Solicitação Concluída!</h4>
            <p className="text-xs text-gray-300 leading-relaxed max-w-sm mx-auto">
              {successInfo.message}
            </p>

            <button
              onClick={onClose}
              className="w-full mt-4 py-3 bg-dark-800 hover:bg-dark-750 text-white font-bold text-xs uppercase rounded-xl border border-dark-700 transition-all"
            >
              Fechar e Voltar à Carteira
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Saldo Disponível Box */}
            <div className="p-3.5 bg-dark-850 rounded-xl border border-dark-750 flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium">Saldo Disponível:</span>
              <span className="text-base font-black text-emerald-400 font-mono">
                {formatBRL(wallet.availableBalance)}
              </span>
            </div>

            {/* Tipo de Chave PIX */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300 uppercase">
                Tipo de Chave PIX:
              </label>
              <select
                value={pixKeyType}
                onChange={(e) => setPixKeyType(e.target.value as PixKeyType)}
                className="w-full bg-dark-850 border border-dark-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
              >
                <option value="cpf">CPF</option>
                <option value="email">E-mail</option>
                <option value="phone">Telefone (Celular com DDD)</option>
                <option value="random">Chave Aleatória (EVP)</option>
                <option value="cnpj">CNPJ</option>
              </select>
            </div>

            {/* Chave PIX Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300 uppercase">
                Digite sua Chave PIX:
              </label>
              <input
                type="text"
                required
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                placeholder={
                  pixKeyType === 'cpf'
                    ? '000.000.000-00'
                    : pixKeyType === 'email'
                    ? 'seu@email.com'
                    : pixKeyType === 'phone'
                    ? '(11) 99999-9999'
                    : 'Chave aleatória UUID'
                }
                className="w-full bg-dark-850 border border-dark-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
              />
            </div>

            {/* Valor do Saque */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-300 uppercase">
                  Valor a Sacar (R$):
                </label>
                <button
                  type="button"
                  onClick={() => setAmount(wallet.availableBalance.toString())}
                  className="text-[11px] text-red-400 hover:text-red-300 font-bold underline"
                >
                  Sacar Tudo
                </button>
              </div>
              <input
                type="number"
                step="0.01"
                min={siteSettings.minWithdrawalAmount}
                max={wallet.availableBalance}
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Mínimo: ${formatBRL(siteSettings.minWithdrawalAmount)}`}
                className="w-full bg-dark-850 border border-dark-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white font-mono focus:outline-none focus:border-red-500"
              />
            </div>

            {/* Alerta Antifraude se ultrapassar o limite */}
            {isAboveAntiFraud && (
              <div className="p-3 bg-amber-950/40 border border-amber-600/40 rounded-xl flex items-start gap-2 text-xs text-amber-300">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Trava de Segurança Antifraude:</strong> Saques a partir de{' '}
                  {formatBRL(siteSettings.antiFraudThreshold)} passam por verificação manual da moderação antes da liquidação bancária.
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || parsedAmount <= 0 || parsedAmount > wallet.availableBalance}
              className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                isSubmitting || parsedAmount <= 0 || parsedAmount > wallet.availableBalance
                  ? 'bg-dark-800 text-gray-500 cursor-not-allowed border border-dark-700'
                  : 'bg-red-600 hover:bg-red-500 text-white shadow-neon-red hover:scale-[1.02]'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>{isSubmitting ? 'Processando Transferência Asaas PIX...' : 'Confirmar Solicitação de Saque'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
