'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppState } from '@/lib/state-context';
import { ChevronLeft, ChevronRight, Zap, Trophy, ArrowRight } from 'lucide-react';

export default function HeroBannerSlider() {
  const { banners } = useAppState();
  const activeBanners = banners.filter((b) => b.isActive);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (activeBanners.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeBanners.length, isPaused]);

  if (activeBanners.length === 0) return null;

  const currentBanner = activeBanners[currentIndex];

  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % activeBanners.length);

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl md:rounded-3xl border border-red-700/20 shadow-2xl group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{ minHeight: '440px', maxHeight: '580px' }}
    >
      {/* Imagem de fundo */}
      <div className="absolute inset-0 z-0">
        <img
          src={currentBanner.imageUrl}
          alt={currentBanner.title}
          loading="lazy"
          className="w-full h-full object-cover object-center transform transition-transform duration-1000 ease-out group-hover:scale-105 will-change-transform"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-950 via-dark-950/80 to-transparent" />
        <div className="absolute inset-0 bg-red-950/10 mix-blend-overlay" />
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 flex flex-col justify-end h-full p-6 sm:p-10 md:p-16 max-w-4xl">
        {currentBanner.badgeText && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase mb-4 bg-red-500/20 text-red-300 border border-red-500/40 w-fit">
            <Zap className="w-3.5 h-3.5 text-red-400" />
            <span>{currentBanner.badgeText}</span>
          </div>
        )}

        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase leading-none drop-shadow-lg text-glow-red">
          {currentBanner.title}
        </h1>

        {currentBanner.subtitle && (
          <p className="mt-3 text-sm sm:text-base md:text-lg text-gray-300 font-medium max-w-2xl leading-relaxed drop-shadow">
            {currentBanner.subtitle}
          </p>
        )}

        <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-4">
          <Link
            href={currentBanner.ctaLink || '/tournaments'}
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3.5 rounded-xl font-black text-sm sm:text-base tracking-wider text-white uppercase bg-gradient-to-r from-red-700 via-red-600 to-red-500 hover:from-red-600 hover:to-red-400 shadow-neon-red hover:shadow-neon-glow transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>{currentBanner.ctaText || 'INSCREVA-SE AGORA'}</span>
            <ArrowRight className="w-5 h-5" />
          </Link>

          <Link
            href="/tournaments"
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm text-gray-300 hover:text-white bg-dark-900/80 hover:bg-dark-800 border border-dark-700/80 transition-all"
          >
            <Trophy className="w-4 h-4 text-red-400" />
            <span>Ver Todos os Torneios</span>
          </Link>
        </div>
      </div>

      {/* Botões Prev / Next */}
      {activeBanners.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3 rounded-full bg-dark-900/60 hover:bg-red-700 text-white border border-white/10 hover:border-red-500 transition-all shadow-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3 rounded-full bg-dark-900/60 hover:bg-red-700 text-white border border-white/10 hover:border-red-500 transition-all shadow-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-5 right-6 sm:right-10 z-20 flex items-center gap-2">
            {activeBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentIndex
                    ? 'w-8 h-2 bg-red-500'
                    : 'w-2 h-2 bg-gray-600/60 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
