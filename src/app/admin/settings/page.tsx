'use client';

import React, { useState } from 'react';
import { useAppState } from '@/lib/state-context';
import ImageUploader from '@/components/admin/ImageUploader';
import {
  Palette,
  Check,
  Save,
  Globe,
  MessageSquare,
  ShieldAlert,
  Sparkles,
  Zap,
  Clock,
  ToggleLeft,
  ToggleRight,
  DollarSign,
} from 'lucide-react';

export default function SettingsAdminPage() {
  const { siteSettings, updateSiteSettings, templates, updateTemplate } = useAppState();

  const [siteName, setSiteName] = useState(siteSettings.siteName);
  const [siteDomain, setSiteDomain] = useState(siteSettings.siteDomain || 'visionleague.gg');
  const [ownerUsername, setOwnerUsername] = useState(siteSettings.ownerUsername || 'vision.group.adm');
  const [logoUrl, setLogoUrl] = useState(siteSettings.logoUrl || '');
  const [primaryColor, setPrimaryColor] = useState(siteSettings.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(siteSettings.secondaryColor);
  const [headerAnnouncement, setHeaderAnnouncement] = useState(siteSettings.headerAnnouncement);
  const [footerBio, setFooterBio] = useState(siteSettings.footerBio);
  const [discordUrl, setDiscordUrl] = useState(siteSettings.discordUrl);
  const [twitchUrl, setTwitchUrl] = useState(siteSettings.twitchUrl);
  const [twitterUrl, setTwitterUrl] = useState(siteSettings.twitterUrl);
  const [instagramUrl, setInstagramUrl] = useState(siteSettings.instagramUrl);
  const [minDepositAmount, setMinDepositAmount] = useState(
    (siteSettings.minDepositAmount || 10).toString()
  );
  const [minWithdrawalAmount, setMinWithdrawalAmount] = useState(
    siteSettings.minWithdrawalAmount.toString()
  );
  const [antiFraudThreshold, setAntiFraudThreshold] = useState(
    siteSettings.antiFraudThreshold.toString()
  );
  const [isSaved, setIsSaved] = useState(false);

  const colorPresets = [
    { name: 'Vision Red & Silver (Padrão)', primary: '#e8000d', secondary: '#b0b8c4' },
    { name: 'Dourado Campeão & Vermelho', primary: '#f59e0b', secondary: '#e8000d' },
    { name: 'Esmeralda & Prata', primary: '#10b981', secondary: '#b0b8c4' },
    { name: 'Rosa Choque & Prata', primary: '#ff007f', secondary: '#b0b8c4' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteSettings({
      siteName,
      siteDomain,
      ownerUsername,
      logoUrl,
      primaryColor,
      secondaryColor,
      headerAnnouncement,
      footerBio,
      discordUrl,
      twitchUrl,
      twitterUrl,
      instagramUrl,
      minDepositAmount: parseFloat(minDepositAmount) || 10,
      minWithdrawalAmount: parseFloat(minWithdrawalAmount) || 10,
      antiFraudThreshold: parseFloat(antiFraudThreshold) || 500,
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const GAME_ICON: Record<string, string> = {
    'Valorant': '🔫',
    'League of Legends': '⚔️',
    'Deadlock': '🔒',
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-red-400 bg-red-950/60 px-3 py-1 rounded-full border border-red-500/30 mb-2">
            <Palette className="w-3.5 h-3.5" />
            <span>Design System & Identidade</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Personalização & Configurações
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm">
            Gerencie identidade visual, torneios automáticos, anúncios e limites financeiros.
          </p>
        </div>
      </div>

      {isSaved && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 rounded-2xl flex items-center gap-2 text-xs font-bold">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Configurações salvas e aplicadas com sucesso!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Bloco 1: Paleta de Cores */}
        <div className="bg-dark-900 rounded-2xl border border-dark-800 p-6 sm:p-8 space-y-6">
          <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-red-400" />
            <span>Paleta de Cores (Tema da Plataforma)</span>
          </h3>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-400">
              Temas Pré-definidos:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {colorPresets.map((pr, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => { setPrimaryColor(pr.primary); setSecondaryColor(pr.secondary); }}
                  className="p-3 rounded-xl bg-dark-850 border border-dark-750 hover:border-red-500/50 flex items-center justify-between transition-all text-left"
                >
                  <span className="text-xs font-bold text-gray-200">{pr.name}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full border border-white/20" style={{ background: pr.primary }} />
                    <span className="w-4 h-4 rounded-full border border-white/20" style={{ background: pr.secondary }} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-red-400">
                Cor Primária (Botões, Destaques)
              </label>
              <div className="flex items-center gap-3">
                <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-12 h-10 rounded-lg cursor-pointer bg-transparent border-0" />
                <input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-full bg-dark-850 border border-dark-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-red-500" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-gray-300">
                Cor Secundária (Gradientes, Badges)
              </label>
              <div className="flex items-center gap-3">
                <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-12 h-10 rounded-lg cursor-pointer bg-transparent border-0" />
                <input type="text" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-full bg-dark-850 border border-dark-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-red-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Bloco 2: Identidade e Conteúdos */}
        <div className="bg-dark-900 rounded-2xl border border-dark-800 p-6 sm:p-8 space-y-6">
          <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-5 h-5 text-gray-300" />
            <span>Identidade, Logotipo e Conteúdos</span>
          </h3>

          <div className="space-y-5">
            <div className="p-4 bg-dark-850 rounded-2xl border border-dark-750 space-y-3">
              <div>
                <label className="text-xs font-bold uppercase text-white block">Logotipo Oficial da Plataforma</label>
                <p className="text-[11px] text-gray-400">Substitui o ícone padrão no cabeçalho e na barra lateral.</p>
              </div>
              <ImageUploader label="Imagem do Logotipo (PNG ou JPG)" value={logoUrl} onChange={setLogoUrl} aspectRatio="square" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-gray-300">Nome da Plataforma</label>
                <input type="text" required value={siteName} onChange={(e) => setSiteName(e.target.value)}
                  placeholder="Ex: Vision League"
                  className="w-full bg-dark-850 border border-dark-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-bold" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-gray-400">Domínio Oficial</label>
                <input type="text" required value={siteDomain} onChange={(e) => setSiteDomain(e.target.value)}
                  placeholder="Ex: visionleague.gg"
                  className="w-full bg-dark-850 border border-dark-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono font-bold" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-gray-400">Usuário Administrador</label>
                <input type="text" required value={ownerUsername} onChange={(e) => setOwnerUsername(e.target.value)}
                  placeholder="Ex: vision.group.adm"
                  className="w-full bg-dark-850 border border-dark-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono font-bold" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-gray-300">Banner Superior (Announcement Bar)</label>
              <input type="text" value={headerAnnouncement} onChange={(e) => setHeaderAnnouncement(e.target.value)}
                placeholder="Ex: ⚡ Temporada 2026 Aberta! Mais de R$ 50.000 em premiações automáticas via PIX."
                className="w-full bg-dark-850 border border-dark-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-gray-300">Biografia / Rodapé</label>
              <textarea rows={2} value={footerBio} onChange={(e) => setFooterBio(e.target.value)}
                className="w-full bg-dark-850 border border-dark-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500" />
            </div>
          </div>
        </div>

        {/* Bloco 3: Redes Sociais */}
        <div className="bg-dark-900 rounded-2xl border border-dark-800 p-6 sm:p-8 space-y-6">
          <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            <span>Redes Sociais & Transmissões</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Discord', value: discordUrl, set: setDiscordUrl, color: 'text-indigo-400' },
              { label: 'Twitch (Live)', value: twitchUrl, set: setTwitchUrl, color: 'text-red-400' },
              { label: 'Twitter / X', value: twitterUrl, set: setTwitterUrl, color: 'text-sky-400' },
              { label: 'Instagram', value: instagramUrl, set: setInstagramUrl, color: 'text-pink-400' },
            ].map((field) => (
              <div key={field.label} className="space-y-1.5">
                <label className={`text-xs font-bold uppercase ${field.color}`}>{field.label}</label>
                <input type="url" value={field.value} onChange={(e) => field.set(e.target.value)}
                  className="w-full bg-dark-850 border border-dark-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500" />
              </div>
            ))}
          </div>
        </div>

        {/* Bloco 4: Financeiro */}
        <div className="bg-dark-900 rounded-2xl border border-dark-800 p-6 sm:p-8 space-y-6">
          <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <span>Parâmetros de Segurança Financeira & Antifraude PIX</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-emerald-400">Depósito Mínimo PIX (R$)</label>
              <input type="number" step="5" min="5" value={minDepositAmount} onChange={(e) => setMinDepositAmount(e.target.value)}
                className="w-full bg-dark-850 border border-dark-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-red-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-gray-300">Saque Mínimo (R$)</label>
              <input type="number" step="5" min="5" value={minWithdrawalAmount} onChange={(e) => setMinWithdrawalAmount(e.target.value)}
                className="w-full bg-dark-850 border border-dark-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-red-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-amber-400">Teto Antifraude (R$)</label>
              <input type="number" step="50" min="100" value={antiFraudThreshold} onChange={(e) => setAntiFraudThreshold(e.target.value)}
                className="w-full bg-dark-850 border border-dark-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-red-500" />
              <span className="text-[10px] text-gray-500 block">Saques acima deste valor requerem aprovação manual.</span>
            </div>
          </div>
        </div>

        <button type="submit"
          className="px-8 py-3.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-red-900/40 flex items-center gap-2 hover:scale-105">
          <Save className="w-4 h-4" />
          <span>Salvar Todas as Configurações</span>
        </button>
      </form>

      {/* Torneios Automáticos */}
      <div className="bg-dark-900 rounded-2xl border border-dark-800 p-6 sm:p-8 space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-red-400 bg-red-950/60 px-3 py-1 rounded-full border border-red-500/30 mb-3">
            <Zap className="w-3.5 h-3.5" />
            <span>Torneios Automáticos</span>
          </div>
          <h3 className="text-base font-black text-white uppercase tracking-wider">
            Templates de Duelos Automáticos
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Quando um duelo é finalizado, um novo é criado automaticamente com base no template do jogo correspondente.
            Somente duelos com taxa de entrada pequena (R$5–R$20) são gerados.
          </p>
        </div>

        <div className="space-y-4">
          {templates.map((tpl) => (
            <div key={tpl.id} className={`rounded-2xl border p-5 space-y-4 transition-all ${tpl.isActive ? 'border-red-500/30 bg-gradient-to-br from-red-950/20 to-dark-900' : 'border-dark-700 bg-dark-850'}`}>
              {/* Template Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{GAME_ICON[tpl.game] || '🎮'}</span>
                  <div>
                    <h4 className="font-bold text-white text-sm">{tpl.name}</h4>
                    <p className="text-[11px] text-gray-400">{tpl.game} · Duelo Direto · Inscrição Aberta</p>
                  </div>
                </div>
                {/* Toggle Ativo/Inativo */}
                <button
                  type="button"
                  onClick={() => updateTemplate(tpl.id, { isActive: !tpl.isActive })}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all ${
                    tpl.isActive
                      ? 'bg-red-600/20 text-red-400 border border-red-500/40 hover:bg-red-600/30'
                      : 'bg-dark-750 text-gray-500 border border-dark-600 hover:bg-dark-700'
                  }`}
                >
                  {tpl.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  {tpl.isActive ? 'Ativo' : 'Inativo'}
                </button>
              </div>

              {/* Editable Fields */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Taxa de Entrada */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> Taxa (R$)
                  </label>
                  <input
                    type="number"
                    min="5" max="20" step="5"
                    value={tpl.entryFee}
                    onChange={(e) => {
                      const fee = parseFloat(e.target.value) || 10;
                      updateTemplate(tpl.id, { entryFee: fee, prizePool: fee * 2 * 0.9, firstPlacePrize: fee * 2 * 0.9 });
                    }}
                    className="w-full bg-dark-800 border border-dark-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                  />
                  <p className="text-[10px] text-gray-600">Máx. R$20</p>
                </div>

                {/* Premiação */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-amber-400 flex items-center gap-1">
                    🏆 Premiação (R$)
                  </label>
                  <input
                    type="number"
                    min="0" step="5"
                    value={tpl.firstPlacePrize}
                    onChange={(e) => {
                      const prize = parseFloat(e.target.value) || 0;
                      updateTemplate(tpl.id, { firstPlacePrize: prize, prizePool: prize });
                    }}
                    className="w-full bg-dark-800 border border-dark-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                  />
                </div>

                {/* Horário */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Horário
                  </label>
                  <input
                    type="time"
                    value={tpl.autoStartTime}
                    onChange={(e) => updateTemplate(tpl.id, { autoStartTime: e.target.value })}
                    className="w-full bg-dark-800 border border-dark-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                  />
                </div>

                {/* Dias de offset */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400 flex items-center gap-1">
                    📅 Início (dias)
                  </label>
                  <input
                    type="number"
                    min="0" max="30" step="1"
                    value={tpl.autoStartDaysOffset}
                    onChange={(e) => updateTemplate(tpl.id, { autoStartDaysOffset: parseInt(e.target.value) || 1 })}
                    className="w-full bg-dark-800 border border-dark-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                  />
                  <p className="text-[10px] text-gray-600">Dias após criação</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
