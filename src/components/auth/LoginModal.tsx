'use client';

import React, { useState } from 'react';
import { useAppState } from '@/lib/state-context';
import { X, ShieldCheck, CheckCircle2, User, FileText, AlertCircle } from 'lucide-react';
import TermsModal from '@/components/legal/TermsModal';

interface LoginModalProps {
  onClose: () => void;
}

export default function LoginModal({ onClose }: LoginModalProps) {
  const { loginWithGoogle, siteSettings } = useAppState();
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Estados dos novos campos obrigatórios (+18 e Termos)
  const [cpf, setCpf] = useState('');
  const [isAdultConfirmed, setIsAdultConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  // Formatação de CPF no padrão 000.000.000-00
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.substring(0, 11);

    if (val.length <= 11) {
      val = val
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    setCpf(val);
  };

  const validateInputs = (): boolean => {
    const cleanCpf = cpf.replace(/\D/g, '');
    if (cleanCpf.length !== 11) {
      setErrorMsg('Informe um CPF válido com 11 dígitos para comprovar maioridade.');
      return false;
    }
    if (!isAdultConfirmed) {
      setErrorMsg('É necessário confirmar que possui 18 anos ou mais (ou autorização legal).');
      return false;
    }
    if (!termsAccepted) {
      setErrorMsg('Você precisa aceitar os Termos de Uso e Serviço da plataforma VISION.');
      return false;
    }
    setErrorMsg('');
    return true;
  };

  const handleGoogleSignIn = async () => {
    if (!validateInputs()) return;

    setIsLoading(true);
    const profileData = {
      cpf: cpf.trim(),
      isAdult: true,
      termsAccepted: true,
      termsAcceptedAt: new Date().toISOString(),
    };

    const res = await loginWithGoogle(profileData);
    setIsLoading(false);
    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
        <div className="relative w-full max-w-md bg-dark-900 border border-red-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
          {/* Header do Modal */}
          <div className="flex items-center justify-between border-b border-dark-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm text-dark-950 shadow-neon-red"
                style={{
                  background: `linear-gradient(135deg, ${siteSettings.primaryColor}, ${siteSettings.secondaryColor})`,
                }}
              >
                V
              </div>
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-wider">
                  {siteSettings.siteName}
                </h3>
                <span className="text-[10px] text-gray-200 font-mono -mt-1 block font-bold">
                  {siteSettings.siteDomain}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-dark-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {successMsg ? (
            <div className="text-center py-6 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
              <h4 className="text-lg font-bold text-white">Login Autorizado!</h4>
              <p className="text-xs text-gray-300">{successMsg}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <h4 className="text-xl font-black text-white uppercase tracking-tight text-glow-red">
                  Entrar com Google
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Para participar de torneios e receber premiações via PIX, confirme seus dados e aceite os termos oficiais.
                </p>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 p-3 bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs rounded-xl font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Campo de CPF */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300 uppercase flex items-center justify-between">
                  <span>CPF do Titular</span>
                  <span className="text-[10px] text-red-400 font-normal">Obrigatório (+18 / PIX)</span>
                </label>
                <input
                  type="text"
                  value={cpf}
                  onChange={handleCpfChange}
                  placeholder="000.000.000-00"
                  className="w-full bg-dark-850 border border-dark-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Checkboxes de Maioridade e Termos de Uso */}
              <div className="space-y-2.5 pt-1">
                <label className="flex items-start gap-2.5 text-xs text-gray-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isAdultConfirmed}
                    onChange={(e) => setIsAdultConfirmed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-dark-700 bg-dark-850 text-red-500 focus:ring-0 focus:ring-offset-0"
                  />
                  <span className="leading-tight">
                    Declaro ter <strong>18 anos ou mais</strong> (ou autorização de responsável) para disputar torneios e gerenciar a carteira financeira.
                  </span>
                </label>

                <label className="flex items-start gap-2.5 text-xs text-gray-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-dark-700 bg-dark-850 text-red-500 focus:ring-0 focus:ring-offset-0"
                  />
                  <span className="leading-tight">
                    Li e concordo com os{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsTermsModalOpen(true);
                      }}
                      className="text-red-400 underline font-bold hover:text-red-300"
                    >
                      Termos de Uso e Serviço da VISION
                    </button>.
                  </span>
                </label>
              </div>

              {/* Botões de Login Google */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => handleGoogleSignIn()}
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-white hover:bg-gray-100 text-gray-800 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 border border-gray-200 active:scale-95 disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{isLoading ? 'Autenticando...' : 'Conectar com Google'}</span>
                </button>
              </div>

              {/* Selo LGPD e Segurança */}
              <div className="pt-2 border-t border-dark-800 flex items-center justify-center gap-1.5 text-[10px] text-gray-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Dados protegidos pela LGPD • Pagamentos Asaas PIX</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal dos Termos */}
      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />
    </>
  );
}
