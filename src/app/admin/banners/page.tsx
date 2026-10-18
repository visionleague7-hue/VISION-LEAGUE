'use client';

import React, { useState } from 'react';
import { useAppState } from '@/lib/state-context';
import { Banner } from '@/lib/types';
import ImageUploader from '@/components/admin/ImageUploader';
import {
  PlusCircle,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';

export default function BannersManagerPage() {
  const { banners, addBanner, updateBanner, deleteBanner } = useAppState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [badgeText, setBadgeText] = useState('DESTAQUE');
  const [ctaText, setCtaText] = useState('INSCREVA-SE AGORA');
  const [ctaLink, setCtaLink] = useState('/tournaments');
  const [targetPage, setTargetPage] = useState<'home' | 'tournaments'>('home');
  const [isActive, setIsActive] = useState(true);

  const handleOpenCreate = () => {
    setEditingBanner(null);
    setTitle('');
    setSubtitle('');
    setImageUrl('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1600&q=80');
    setBadgeText('DESTAQUE');
    setCtaText('INSCREVA-SE AGORA');
    setCtaLink('/tournaments');
    setTargetPage('home');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setTitle(banner.title);
    setSubtitle(banner.subtitle);
    setImageUrl(banner.imageUrl);
    setBadgeText(banner.badgeText);
    setCtaText(banner.ctaText);
    setCtaLink(banner.ctaLink);
    setTargetPage(banner.targetPage);
    setIsActive(banner.isActive);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) {
      alert('Preencha pelo menos o tÃ­tulo e selecione uma imagem para o banner.');
      return;
    }

    if (editingBanner) {
      updateBanner(editingBanner.id, {
        title,
        subtitle,
        imageUrl,
        badgeText,
        ctaText,
        ctaLink,
        targetPage,
        isActive,
      });
    } else {
      addBanner({
        title,
        subtitle,
        imageUrl,
        badgeText,
        ctaText,
        ctaLink,
        targetPage,
        orderIndex: banners.length,
        isActive,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-red-400 bg-red-950/60 px-3 py-1 rounded-full border border-red-500/30 mb-2">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>MÃ­dia & CarrossÃ©is</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Gerenciador de Banners (CMS)
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm">
            Altere, adicione e faÃ§a upload das imagens dos banners da Home Page sem mexer em cÃ³digo.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-3 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-red-900/40 flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Criar Novo Banner</span>
        </button>
      </div>

      {/* Lista de Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className={`group rounded-2xl border overflow-hidden transition-all bg-dark-900 flex flex-col justify-between ${
              banner.isActive ? 'border-dark-700 hover:border-red-500/50' : 'border-dark-800 opacity-60'
            }`}
          >
            {/* Preview da Imagem */}
            <div className="relative h-44 w-full overflow-hidden bg-dark-950">
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent" />

              <div className="absolute top-3 left-3 flex gap-2">
                {banner.badgeText && (
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-red-950 text-red-300 border border-red-400/40">
                    {banner.badgeText}
                  </span>
                )}
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-dark-900/90 text-gray-300 border border-dark-700">
                  {banner.targetPage === 'home' ? 'Home Page' : 'Torneios'}
                </span>
              </div>

              {/* BotÃ£o de Toggle Ativo/Inativo */}
              <button
                onClick={() => updateBanner(banner.id, { isActive: !banner.isActive })}
                className={`absolute top-3 right-3 p-1.5 rounded-lg border text-xs font-bold transition-all ${
                  banner.isActive
                    ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40'
                    : 'bg-dark-900/90 text-gray-400 border-dark-700'
                }`}
                title={banner.isActive ? 'Desativar Banner' : 'Ativar Banner'}
              >
                {banner.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>

            {/* ConteÃºdo e AÃ§Ãµes */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-bold text-white text-base tracking-tight uppercase line-clamp-1">
                  {banner.title}
                </h3>
                <p className="text-xs text-gray-400 line-clamp-2 mt-1">{banner.subtitle}</p>

                <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-gray-400 bg-dark-850 p-2 rounded-lg border border-dark-750">
                  <span>BotÃ£o: {banner.ctaText}</span>
                  <span className="text-gray-300 truncate max-w-[120px]">{banner.ctaLink}</span>
                </div>
              </div>

              {/* Barra de AÃ§Ãµes: Editar e Deletar */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-dark-800">
                <button
                  onClick={() => handleOpenEdit(banner)}
                  className="px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-gray-200 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Edit2 className="w-3.5 h-3.5 text-gray-400\" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm('Tem certeza que deseja excluir este banner?')) {
                      deleteBanner(banner.id);
                    }
                  }}
                  className="p-1.5 rounded-lg bg-dark-800 hover:bg-rose-950 text-gray-400 hover:text-rose-400 border border-transparent hover:border-rose-800 transition-all"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de CriaÃ§Ã£o / EdiÃ§Ã£o de Banner */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-dark-900 border border-red-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-dark-800 pb-4">
              <h3 className="text-lg font-black text-white uppercase">
                {editingBanner ? 'Editar Banner' : 'Novo Banner da Plataforma'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Componente de Upload de Imagem */}
              <ImageUploader
                label="Imagem de Fundo do Banner"
                value={imageUrl}
                onChange={setImageUrl}
                aspectRatio="banner"
                helperText="Arraste uma imagem do seu computador ou cole um link web (Unsplash, Imgur, CDN)"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-gray-300">
                    TÃ­tulo Principal
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: VALORANT MASTERS VISION"
                    className="w-full bg-dark-850 border border-dark-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-gray-300">
                    Badge de Destaque
                  </label>
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    placeholder="Ex: INSCRIÃ‡Ã•ES ABERTAS"
                    className="w-full bg-dark-850 border border-dark-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-gray-300">
                  SubtÃ­tulo / InformaÃ§Ãµes de PremiaÃ§Ã£o
                </label>
                <textarea
                  rows={2}
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Ex: R$ 15.000 EM PREMIAÃ‡ÃƒO â€¢ VAGAS LIMITADAS â€¢ ELIMINAÃ‡ÃƒO DUPLA"
                  className="w-full bg-dark-850 border border-dark-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-gray-300">
                    Texto do BotÃ£o (CTA)
                  </label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="Ex: INSCREVER MEU TIME"
                    className="w-full bg-dark-850 border border-dark-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-gray-300">
                    Link de Destino
                  </label>
                  <input
                    type="text"
                    value={ctaLink}
                    onChange={(e) => setCtaLink(e.target.value)}
                    placeholder="/tournaments ou https://..."
                    className="w-full bg-dark-850 border border-dark-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-300">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-red-500 bg-dark-800 border-dark-700"
                  />
                  <span>Banner Ativo e VisÃ­vel na Plataforma</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-dark-800 hover:bg-dark-750 text-gray-300 text-xs font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-red-900/40 transition-all"
                >
                  Salvar Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

