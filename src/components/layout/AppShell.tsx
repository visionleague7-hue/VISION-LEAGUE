'use client';

import React from 'react';
import Sidebar from './Sidebar';
import AnnouncementBar from './AnnouncementBar';
import Footer from './Footer';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-dark-950 text-gray-100 selection:bg-red-600 selection:text-white">
      {/* 1. Barra Lateral Gamer Fixa na Esquerda */}
      <Sidebar />

      {/* 2. Conteúdo Principal à Direita da Barra Lateral */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen lg:pl-72">
        {/* Barra Superior de Avisos & Destaques */}
        <AnnouncementBar />

        {/* Conteúdo Dinâmico das Páginas */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">{children}</main>

        {/* Rodapé Oficial da Plataforma */}
        <Footer />
      </div>
    </div>
  );
}
