'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Tournament } from '@/lib/types';
import { useAppState } from '@/lib/state-context';
import { formatBRL } from '@/lib/utils';
import { X, Wallet, Zap, Copy, Check, ShieldCheck, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { verifyPlayerRankEligibility, validateDeadlockSteamId } from '@/lib/rank-verification';

interface RegisterModalProps {
  tournament: Tournament;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RegisterModal({ tournament, onClose, onSuccess }: RegisterModalProps) {
  const { wallet, user, registerTeamInTournament } = useAppState();
  const [teamName, setTeamName] = useState(user.currentTeam || '');
  const [teamTag, setTeamTag] = useState('VIS');
  const [captainSteamCode, setCaptainSteamCode] = useState(user.steamFriendCode || user.steamId || '');
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'pix_direct'>('wallet');
  const [payerName, setPayerName] = useState(user.fullName || user.username);
  const [payerCpf, setPayerCpf] = useState(user.cpf || '123.456.789-00');
  const [isCopied, setIsCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isVerifyingRank, setIsVerifyingRank] = useState(false);
  const [isPixGenerating, setIsPixGenerating] = useState(false);
  const [pixPayload, setPixPayload] = useState<{
    txid: string;
    copiaECola: string;
    qrCodeBase64?: string;
  } | null>(null);

  const isFree = tournament.entryFee === 0;
  const isDeadlock = tournament.game === 'Deadlock';

  const validateTeamAndRank = async (): Promise<boolean> => {
    if (!teamName.trim()) {
      setErrorMessage('Por favor, informe o nome do seu time.');
      return false;
    }

    // 1. DEADLOCK: Apenas valida Friend Code / Steam ID (SEM validação de Elo)
    if (isDeadlock) {
      const steamCheck = validateDeadlockSteamId(captainSteamCode);
      if (!steamCheck.valid) {
        setErrorMessage(steamCheck.message);
        return false;
      }
      return true;
    }

    // 2. VALORANT / LEAGUE OF LEGENDS: Validação de Elo se houver rankLimit
    if (tournament.rankLimit && !tournament.isOpenRank) {
      setIsVerifyingRank(true);
      const nick = tournament.game === 'League of Legends' || tournament.game === 'Valorant'
        ? (user.riotId || user.username)
        : user.username;

      const rankCheck = await verifyPlayerRankEligibility({
        game: tournament.game,
        playerNick: nick,
        rankLimit: tournament.rankLimit,
        currentRankTier: user.rankTier,
      });
      setIsVerifyingRank(false);

      if (!rankCheck.eligible) {
        setErrorMessage(rankCheck.message);
        return false;
      }
    }

    return true;
  };

  const handleRegisterWithWallet = async () => {
    setErrorMessage('');
    const isValid = await validateTeamAndRank();
    if (!isValid) return;

    const result = registerTeamInTournament(tournament.id, teamName.trim(), 'wallet');
    if (result.success) {
      onSuccess();
      onClose();
    } else {
      setErrorMessage(result.message);
    }
  };

  const handleGenerateDirectPix = async () => {
    setErrorMessage('');
    const isValid = await validateTeamAndRank();
    if (!isValid) return;

    if (!payerName.trim() || !payerCpf.trim()) {
      setErrorMessage('Nome completo e CPF do titular são obrigatórios para emissão do PIX Asaas.');
      return;
    }

    setIsPixGenerating(true);
    try {
      const res = await fetch(`/api/tournaments/${tournament.id}/register-pix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamName: teamName.trim(),
          teamTag: teamTag.trim(),
          playerName: payerName.trim(),
          playerCpf: payerCpf.trim(),
          tournamentTitle: tournament.title,
          entryFee: tournament.entryFee,
          userId: user.id,
        }),
      });

      const data = await res.json();
      if (res.ok && (data.copiaECola || data.paymentId)) {
        setPixPayload({
          txid: data.paymentId || data.externalReference,
          copiaECola: data.copiaECola,
          qrCodeBase64: data.qrCodeBase64,
        });
      } else {
        setErrorMessage(data.error || 'Erro ao gerar cobrança PIX no Asaas');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro de conexão com o servidor');
    } finally {
      setIsPixGenerating(false);
    }
  };

  const handleCopyPix = () => {
    if (!pixPayload) return;
    navigator.clipboard.writeText(pixPayload.copiaECola);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSimulatePixPaid = () => {
    const result = registerTeamInTournament(tournament.id, teamName.trim(), 'pix_direct');
    if (result.success) {
      onSuccess();
      onClose();
    } else {
      setErrorMessage(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-dark-900 border border-red-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header do Modal */}
        <div className="flex items-center justify-between border-b border-dark-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-red-400 bg-red-950 px-2 py-0.5 rounded border border-red-500/30">
                {tournament.game} • {tournament.tier || 'Vision'}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white mt-1">{tournament.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-dark-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="flex items-center gap-2 p-3 bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs rounded-xl font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* REGRA DEADLOCK: EXIBIÇÃO DE INSCRIÇÃO ABERTA */}
        {isDeadlock ? (
          <div className="p-3.5 bg-amber-950/40 border border-amber-500/30 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Deadlock: Inscrição 100% Aberta (Sem Limite de Elo)</span>
            </div>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              Não há restrição de rank para o Deadlock. Informe abaixo seu <strong>Friend Code da Steam</strong> para que o capitão adversário consiga adicioná-lo e convidar para o lobby privado no jogo.
            </p>
            <div className="pt-1">
              <label className="text-[10px] font-bold text-gray-300 uppercase block mb-1">
                Friend Code / Steam ID do Capitão (Obrigatório)
              </label>
              <input
                type="text"
                required
                value={captainSteamCode}
                onChange={(e) => setCaptainSteamCode(e.target.value)}
                placeholder="Ex: 123456789 ou 76561198000000000"
                className="w-full bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        ) : (
          /* REGRA VALORANT / LOL: EXIBIÇÃO DE RESTRIÇÃO DE ELO */
          tournament.rankLimit && (
            <div className="p-3 bg-dark-850 rounded-xl border border-gray-700/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-gray-300 font-medium">
                <ShieldCheck className="w-4 h-4 text-red-400" />
                <span>Restrição de Rank: <strong>{tournament.rankLimit}</strong></span>
              </div>
              <span className="text-[10px] text-gray-400 font-mono">
                Seu Rank: <strong className="text-white">{user.rankTier}</strong>
              </span>
            </div>
          )
        )}

        {/* Formulário de Identificação do Time */}
        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-3 space-y-1">
              <label className="text-xs font-bold text-gray-300 uppercase">Nome do Time</label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Ex: Vision Wolves eSports"
                className="w-full bg-dark-850 border border-dark-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div className="col-span-1 space-y-1">
              <label className="text-xs font-bold text-gray-300 uppercase">Tag</label>
              <input
                type="text"
                value={teamTag}
                maxLength={4}
                onChange={(e) => setTeamTag(e.target.value.toUpperCase())}
                placeholder="TAG"
                className="w-full bg-dark-850 border border-dark-700 rounded-xl px-3.5 py-2 text-sm text-white uppercase text-center font-bold focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="p-3 bg-dark-850 rounded-xl border border-dark-750 flex items-center justify-between text-xs">
            <span className="text-gray-400 font-medium">Capitão Inscrito:</span>
            <span className="text-gray-200 font-bold font-mono">
              {user.username} ({user.riotId || user.email})
            </span>
          </div>
        </div>

        {/* Resumo da Taxa de Inscrição */}
        <div className="p-4 bg-dark-850 rounded-xl border border-dark-700/80 flex items-center justify-between">
          <span className="text-xs font-bold text-gray-400 uppercase">Taxa de Inscrição:</span>
          <span className="text-xl font-black text-white">
            {isFree ? (
              <span className="text-emerald-400">GRÁTIS</span>
            ) : (
              formatBRL(tournament.entryFee)
            )}
          </span>
        </div>

        {/* Seleção de Pagamento */}
        {!isFree && !pixPayload && (
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-400 uppercase">
              Forma de Pagamento:
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Carteira */}
              <button
                type="button"
                onClick={() => setPaymentMethod('wallet')}
                className={`p-3 rounded-xl border flex flex-col items-start gap-1 text-left transition-all ${
                  paymentMethod === 'wallet'
                    ? 'border-red-500 bg-red-950/30 shadow-neon-red'
                    : 'border-dark-700 bg-dark-850 hover:border-dark-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-red-400" />
                  <span className="text-xs font-bold text-white">Saldo Carteira</span>
                </div>
                <span className="text-[11px] text-gray-400">
                  Disp: {formatBRL(wallet.availableBalance)}
                </span>
              </button>

              {/* PIX Imediato */}
              <button
                type="button"
                onClick={() => setPaymentMethod('pix_direct')}
                className={`p-3 rounded-xl border flex flex-col items-start gap-1 text-left transition-all ${
                  paymentMethod === 'pix_direct'
                    ? 'border-red-500 bg-red-950/30 shadow-neon-red'
                    : 'border-dark-700 bg-dark-850 hover:border-dark-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">PIX Imediato</span>
                </div>
                <span className="text-[11px] text-gray-400">QR Code na Tela</span>
              </button>
            </div>

            {/* Dados do Titular do PIX Asaas */}
            {paymentMethod === 'pix_direct' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 p-3 bg-dark-850 rounded-xl border border-dark-750">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-300 uppercase">
                    Nome Completo do Titular
                  </label>
                  <input
                    type="text"
                    required
                    value={payerName}
                    onChange={(e) => setPayerName(e.target.value)}
                    placeholder="Nome do pagador"
                    className="w-full bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-red-400 uppercase">
                    CPF ou CNPJ do Titular
                  </label>
                  <input
                    type="text"
                    required
                    value={payerCpf}
                    onChange={(e) => setPayerCpf(e.target.value)}
                    placeholder="CPF/CNPJ do titular"
                    className="w-full bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* QR Code Gerado via PIX */}
        {pixPayload && (
          <div className="p-4 bg-dark-850 rounded-2xl border border-red-500/30 space-y-4 text-center animate-fadeIn">
            <span className="text-xs font-bold uppercase text-emerald-400">
              Pagamento PIX Gerado com Sucesso
            </span>

            <div className="bg-white p-3 rounded-2xl inline-block shadow-lg mx-auto">
              {pixPayload.qrCodeBase64 ? (
                <img
                  src={`data:image/png;base64,${pixPayload.qrCodeBase64}`}
                  alt="QR Code Asaas PIX"
                  className="w-44 h-44 object-contain"
                />
              ) : (
                <QRCodeSVG value={pixPayload.copiaECola} size={176} />
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase block">
                Pix Copia e Cola:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={pixPayload.copiaECola}
                  className="w-full bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-[11px] font-mono text-gray-300 select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyPix}
                  className="p-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg shrink-0 flex items-center gap-1 text-xs"
                >
                  {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Simulação rápida para testes */}
            <div className="pt-2 border-t border-dark-750">
              <button
                type="button"
                onClick={handleSimulatePixPaid}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase rounded-xl transition-all"
              >
                Simular Pagamento Confirmado (Testes)
              </button>
            </div>
          </div>
        )}

        {/* Botão de Envio */}
        {!pixPayload && (
          <div className="pt-2">
            {isFree || paymentMethod === 'wallet' ? (
              <button
                type="button"
                onClick={handleRegisterWithWallet}
                disabled={isVerifyingRank}
                className="w-full py-3.5 px-4 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-neon-red flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isVerifyingRank ? (
                  <span>Verificando Elo via API...</span>
                ) : (
                  <span>Confirmar Inscrição {isFree ? 'Gratuita' : 'com Saldo da Carteira'}</span>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleGenerateDirectPix}
                disabled={isPixGenerating || isVerifyingRank}
                className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-dark-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                <span>{isPixGenerating ? 'Gerando PIX no Asaas...' : 'Gerar Cobrança PIX Oficial'}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
