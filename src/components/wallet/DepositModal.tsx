'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAppState } from '@/lib/state-context';
import { formatBRL } from '@/lib/utils';
import { X, Zap, Copy, Check, QrCode, ArrowRight, ShieldCheck } from 'lucide-react';

interface DepositModalProps {
  onClose: () => void;
}

export default function DepositModal({ onClose }: DepositModalProps) {
  const { depositPix } = useAppState();
  const [amount, setAmount] = useState<number>(10);
  const [customAmount, setCustomAmount] = useState<string>('10');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [pixData, setPixData] = useState<{
    txid: string;
    copiaECola: string;
    amount: number;
  } | null>(null);

  const presets = [10, 25, 50, 100, 200];

  const handleSelectPreset = (val: number) => {
    setAmount(val);
    setCustomAmount(val.toString());
  };

  const handleGeneratePix = async () => {
    const num = parseFloat(customAmount);
    if (isNaN(num) || num < 10) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/pix/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: num, description: 'Depósito Carteira VISION eSports' }),
      });

      const data = await res.json();
      if (res.ok && data.charge) {
        setPixData({
          txid: data.charge.txid,
          copiaECola: data.charge.copiaECola,
          amount: num,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!pixData) return;
    navigator.clipboard.writeText(pixData.copiaECola);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleConfirmSimulation = () => {
    if (!pixData) return;
    depositPix(pixData.amount, pixData.txid);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-dark-900 border border-red-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-dark-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-red-950 border border-red-500/30 text-red-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase">Depósito via PIX</h3>
              <p className="text-xs text-gray-400">Crédito instantâneo na sua carteira virtual</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-dark-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!pixData ? (
          <div className="space-y-5">
            {/* Presets */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">
                Escolha um valor rápido:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {presets.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className={`py-2.5 rounded-xl text-xs font-black transition-all ${
                      amount === p && customAmount === p.toString()
                        ? 'bg-red-600 text-white shadow-neon-red'
                        : 'bg-dark-850 text-gray-300 border border-dark-700 hover:border-dark-600'
                    }`}
                  >
                    R$ {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase">
                Ou digite outro valor (Mínimo R$ 10,00):
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                  R$
                </span>
                <input
                  type="number"
                  min="10"
                  step="5"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setAmount(parseFloat(e.target.value) || 0);
                  }}
                  className="w-full bg-dark-850 border border-dark-700 rounded-xl pl-10 pr-4 py-3 text-white font-mono text-base font-bold focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="p-3 bg-dark-850 rounded-xl border border-dark-700/60 flex items-center gap-2 text-xs text-gray-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Sem taxas de intermediação. Saldo liberado em até 10 segundos.</span>
            </div>

            <button
              onClick={handleGeneratePix}
              disabled={isLoading || parseFloat(customAmount) < 5}
              className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-neon-red flex items-center justify-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              <span>{isLoading ? 'Gerando Cobrança...' : 'Gerar QR Code PIX'}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-5 text-center">
            {/* Valor gerado */}
            <div className="inline-block px-4 py-1.5 rounded-full bg-dark-850 border border-dark-700 text-gray-200 font-mono text-sm font-bold">
              Total: {formatBRL(pixData.amount)}
            </div>

            {/* Render do QR Code */}
            <div className="flex justify-center">
              <div className="p-3 bg-white rounded-2xl shadow-xl">
                <QRCodeSVG value={pixData.copiaECola} size={180} />
              </div>
            </div>

            <p className="text-xs text-gray-400">
              Aponte a câmera do seu aplicativo bancário ou copie a chave PIX abaixo:
            </p>

            {/* Copia e Cola */}
            <button
              onClick={handleCopy}
              className="w-full py-3 px-4 bg-dark-850 border border-dark-700 hover:border-red-500/50 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all"
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Código PIX Copiado com Sucesso!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-red-400" />
                  <span>Copiar Código Copia e Cola</span>
                </>
              )}
            </button>

            {/* Simulação rápida para desenvolvedor e testes imediatos */}
            <div className="pt-2">
              <button
                onClick={handleConfirmSimulation}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-dark-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Simular Confirmação do Pagamento PIX</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
