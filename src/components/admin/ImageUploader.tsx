'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, Link as LinkIcon, Check } from 'lucide-react';

interface ImageUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  aspectRatio?: 'video' | 'banner' | 'square';
  helperText?: string;
}

export default function ImageUploader({
  label,
  value,
  onChange,
  aspectRatio = 'banner',
  helperText = 'Recomendado: 1920x1080 (16:9) em JPG, PNG ou WebP até 5MB',
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isUrlMode, setIsUrlMode] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido.');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        onChange(data.url);
      } else {
        // Fallback FileReader local
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) onChange(e.target.result as string);
        };
        reader.readAsDataURL(file);
      }
    } catch {
      // Fallback FileReader
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) onChange(e.target.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput('');
      setIsUrlMode(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase text-gray-300 tracking-wider">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setIsUrlMode(!isUrlMode)}
          className="text-[11px] font-bold text-red-400 hover:text-red-300 flex items-center gap-1"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{isUrlMode ? 'Fazer Upload de Arquivo' : 'Colar Link de Imagem Web'}</span>
        </button>
      </div>

      {isUrlMode ? (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://exemplo.com/banner-game.jpg"
            className="flex-1 bg-dark-850 border border-dark-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all"
          >
            Aplicar URL
          </button>
        </div>
      ) : value ? (
        <div className="relative rounded-xl overflow-hidden border border-red-500/20 group bg-dark-900">
          <div
            className={`w-full overflow-hidden ${
              aspectRatio === 'banner'
                ? 'h-48 sm:h-56'
                : aspectRatio === 'video'
                ? 'aspect-video'
                : 'h-32 w-32'
            }`}
          >
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
            />
          </div>

          <div className="absolute inset-0 bg-dark-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 bg-red-600 text-white text-xs font-bold rounded-lg shadow-lg hover:scale-105 transition-all"
            >
              Trocar Imagem
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-2 bg-rose-600 text-white rounded-lg hover:scale-105 transition-all"
              title="Remover"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-red-500 bg-red-950/20'
              : 'border-dark-700 bg-dark-850/60 hover:border-red-500/30 hover:bg-dark-850'
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-dark-800 border border-dark-700 flex items-center justify-center mx-auto text-red-400 mb-3 shadow-inner">
            <UploadCloud className="w-6 h-6" />
          </div>

          <h5 className="text-sm font-bold text-white mb-1">
            {isUploading ? 'Fazendo upload...' : 'Clique para enviar ou arraste a imagem aqui'}
          </h5>
          <p className="text-[11px] text-gray-500">{helperText}</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
        className="hidden"
      />
    </div>
  );
}
