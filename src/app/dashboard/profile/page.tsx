'use client';

import React, { useState } from 'react';
import { useAppState } from '@/lib/state-context';
import {
  User,
  Shield,
  Gamepad2,
  Trophy,
  Check,
  Save,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Camera,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { validateDeadlockSteamId } from '@/lib/rank-verification';

export default function ProfilePage() {
  const { user, updateUserProfile } = useAppState();
  const [username, setUsername] = useState(user.username);
  const [fullName, setFullName] = useState(user.fullName);
  const [avatarUrl, setAvatarUrl] = useState(
    user.avatarUrl || 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=400&q=80'
  );
  const [cpf, setCpf] = useState(user.cpf || '');
  const [riotId, setRiotId] = useState(user.riotId || '');
  const [steamFriendCode, setSteamFriendCode] = useState(user.steamFriendCode || user.steamId || '');
  const [rankTier, setRankTier] = useState(user.rankTier || 'Diamante');
  const [currentTeam, setCurrentTeam] = useState(user.currentTeam || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [deadlockFeedback, setDeadlockFeedback] = useState<string>('');

  const defaultAvatars = [
    { name: 'Cyber Hunter', url: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=400&q=80' },
    { name: 'Valorant Duelist', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
    { name: 'Deadlock Mystic', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
    { name: 'LoL Tactician', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80' },
    { name: 'Neon Assassin', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80' },
    { name: 'Specter Pro', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80' },
  ];

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

  const handleDeadlockCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSteamFriendCode(val);
    if (val.trim()) {
      const check = validateDeadlockSteamId(val);
      setDeadlockFeedback(check.valid ? '✓ Formato de Friend Code / Steam ID válido' : check.message);
    } else {
      setDeadlockFeedback('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        alert('A foto deve ter no máximo 4MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      username,
      fullName,
      avatarUrl,
      cpf,
      isAdult: true,
      riotId,
      steamId: steamFriendCode,
      steamFriendCode,
      rankTier,
      currentTeam,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header Perfil */}
      <div className="bg-gradient-to-r from-dark-900 via-dark-850 to-dark-900 border border-dark-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
        <div className="relative group">
          <img
            src={avatarUrl}
            alt={user.username}
            className="w-24 h-24 rounded-2xl object-cover border border-dark-700 bg-dark-950 shadow-md"
          />
          <label className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-white text-[10px] font-bold">
            <Camera className="w-5 h-5 mb-1" />
            <span>Trocar Foto</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        <div className="space-y-1.5 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white">{username}</h1>
            <span className="bg-dark-800 text-gray-300 border border-dark-700 px-2.5 py-0.5 rounded text-xs font-bold uppercase">
              {user.role === 'admin' ? 'Administrador' : 'Jogador'}
            </span>
            <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Maioridade +18 Verificada
            </span>
          </div>
          <p className="text-sm text-gray-400 font-mono">{user.email}</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
            <span className="text-xs bg-dark-850 text-gray-300 font-mono px-2.5 py-1 rounded-lg border border-dark-750">
              Riot: {riotId || 'Não vinculado'}
            </span>
            <span className="text-xs bg-dark-850 text-amber-300 font-mono px-2.5 py-1 rounded-lg border border-dark-750">
              Deadlock Steam: {steamFriendCode || 'Não informado'}
            </span>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 rounded-2xl flex items-center gap-2 text-xs font-bold animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Perfil e foto de jogador atualizados com sucesso!</span>
        </div>
      )}

      {/* Formulário de Edição */}
      <form onSubmit={handleSubmit} className="bg-dark-900 rounded-2xl border border-dark-800 p-6 sm:p-8 space-y-6">
        {/* Seção 1: Escolha da Foto de Perfil */}
        <div className="space-y-3 pb-6 border-b border-dark-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-white uppercase flex items-center gap-2">
              <Camera className="w-4 h-4 text-red-400" />
              <span>Escolha sua Foto de Perfil</span>
            </label>
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dark-800 hover:bg-dark-750 text-xs font-bold text-gray-200 border border-dark-700 transition-all">
              <Upload className="w-3.5 h-3.5" />
              <span>Enviar Imagem do Computador</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 pt-1">
            {defaultAvatars.map((av) => (
              <button
                type="button"
                key={av.name}
                onClick={() => setAvatarUrl(av.url)}
                className={`relative rounded-xl overflow-hidden border-2 transition-all p-0.5 group ${
                  avatarUrl === av.url
                    ? 'border-red-500 scale-105 shadow-md'
                    : 'border-dark-750 hover:border-gray-500 opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={av.url}
                  alt={av.name}
                  className="w-full h-16 sm:h-18 object-cover rounded-lg"
                />
                <span className="absolute inset-x-0 bottom-0 bg-black/80 text-[9px] text-white py-0.5 text-center font-bold truncate px-1">
                  {av.name}
                </span>
              </button>
            ))}
          </div>

          <div className="pt-2">
            <label className="text-[11px] text-gray-400 block mb-1">Ou cole a URL direta de uma imagem:</label>
            <input
              type="url"
              placeholder="https://..."
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full bg-dark-850 border border-dark-750 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-red-500 font-mono"
            />
          </div>
        </div>

        <h3 className="text-sm font-bold text-white uppercase tracking-tight flex items-center gap-2">
          <User className="w-4 h-4 text-red-400" />
          <span>Dados Pessoais & IDs de Jogos</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300 uppercase">Nick no Site</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-dark-850 border border-dark-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300 uppercase">Nome Completo</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-dark-850 border border-dark-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
            />
          </div>

          {/* CPF do Titular (+18 e PIX) */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-bold text-red-400 uppercase flex items-center justify-between">
              <span>CPF do Titular (Comprovação +18 e Saques PIX)</span>
              <span className="text-[10px] text-gray-400 font-normal">Conforme Cláusula 2 dos Termos</span>
            </label>
            <input
              type="text"
              value={cpf}
              onChange={handleCpfChange}
              placeholder="000.000.000-00"
              className="w-full bg-dark-850 border border-dark-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        {/* SEÇÃO DEADLOCK (VALVE) */}
        <div className="p-4 bg-dark-850 rounded-2xl border border-amber-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider text-amber-400">
                Deadlock (Valve) — Formato Aberto (Open)
              </h4>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-950 text-amber-300 border border-amber-600/30">
              Sem Limite de Elo
            </span>
          </div>

          <p className="text-xs text-gray-300 leading-relaxed">
            No <strong>Deadlock</strong>, os campeonatos são sempre <strong>Open (Sem Limite de Rank)</strong>. 
            Cadastre seu <strong>Steam ID ou Friend Code da Steam</strong> para que os capitães consigam se adicionar na Steam e criar o lobby privado dentro do jogo.
          </p>

          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-bold text-gray-200 uppercase">
              Steam ID / Friend Code do Deadlock
            </label>
            <input
              type="text"
              value={steamFriendCode}
              onChange={handleDeadlockCodeChange}
              placeholder="Ex: 123456789 ou 76561198000000000"
              className="w-full bg-dark-900 border border-dark-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
            />
            {deadlockFeedback && (
              <p className={`text-[11px] ${deadlockFeedback.startsWith('✓') ? 'text-emerald-400' : 'text-amber-400'}`}>
                {deadlockFeedback}
              </p>
            )}
          </div>
        </div>

        {/* SEÇÃO LEAGUE OF LEGENDS E VALORANT (RIOT GAMES) */}
        <div className="p-4 bg-dark-850 rounded-2xl border border-red-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider text-red-400">
                Valorant & League of Legends (Riot Games)
              </h4>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-950 text-red-300 border border-red-600/30">
              Verificação por Nick#TAG
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300 uppercase">Riot ID (Nick#TAG)</label>
              <input
                type="text"
                value={riotId}
                onChange={(e) => setRiotId(e.target.value)}
                placeholder="Ex: FalleN#BR1"
                className="w-full bg-dark-900 border border-dark-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300 uppercase">Elo / Rank Atual</label>
              <input
                type="text"
                value={rankTier}
                onChange={(e) => setRankTier(e.target.value)}
                placeholder="Ex: Diamante, Imortal, Platina"
                className="w-full bg-dark-900 border border-dark-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
        </div>

        {/* Time Atual */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-300 uppercase">Time Atual / Clã</label>
          <input
            type="text"
            value={currentTeam}
            onChange={(e) => setCurrentTeam(e.target.value)}
            placeholder="Ex: Vision Alpha"
            className="w-full bg-dark-850 border border-dark-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
          />
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>Salvar Alterações do Perfil</span>
        </button>
      </form>
    </div>
  );
}
