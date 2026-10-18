'use client';

import React from 'react';
import { initialNews } from '@/lib/store';
import { formatDate } from '@/lib/utils';
import { Newspaper, Calendar, User, ArrowRight } from 'lucide-react';

export default function NewsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-dark-900 via-dark-850 to-dark-900 border border-dark-800 rounded-3xl p-6 sm:p-10">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-red-400 bg-red-950/60 px-3 py-1 rounded-full border border-red-500/30">
            <Newspaper className="w-3.5 h-3.5" />
            <span>Central de Anúncios</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
            Notícias & Atualizações
          </h1>
          <p className="text-gray-400 text-sm">
            Fique por dentro das últimas novidades da plataforma, premiações, notas de atualização e anúncios oficiais.
          </p>
        </div>
      </div>

      {/* Grid de Artigos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {initialNews.map((article) => (
          <article
            key={article.id}
            className="group bg-dark-900 rounded-2xl border border-dark-800 hover:border-red-500/30 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between"
          >
            <div className="relative h-56 w-full overflow-hidden">
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent" />
              <span className="absolute top-3 left-3 bg-dark-900/90 text-red-300 border border-red-500/30 px-2.5 py-1 rounded text-xs font-bold uppercase backdrop-blur-md">
                {article.category}
              </span>
            </div>

            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-red-400" />
                    {formatDate(article.publishedAt)}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-gray-400\" />
                    {article.authorName}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors line-clamp-2">
                  {article.title}
                </h2>

                <p className="mt-2 text-xs text-gray-400 leading-relaxed line-clamp-3">
                  {article.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-dark-800 flex items-center justify-between">
                <span className="text-xs font-bold text-red-400 group-hover:underline flex items-center gap-1.5">
                  Ler artigo completo <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
