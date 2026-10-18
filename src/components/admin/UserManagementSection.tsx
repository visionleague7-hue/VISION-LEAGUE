'use client';

import React, { useState } from 'react';
import { useAppState } from '@/lib/state-context';
import {
  Users,
  Shield,
  Scale,
  UserCheck,
  UserX,
  CheckCircle2,
  AlertCircle,
  Search,
  Crown,
} from 'lucide-react';

export default function UserManagementSection() {
  const { allUsers, user: currentUser, promoteToReferee, demoteToPlayer } = useAppState();
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handlePromote = (userId: string) => {
    const result = promoteToReferee(userId);
    showFeedback(result.success ? 'success' : 'error', result.message);
  };

  const handleDemote = (userId: string) => {
    const result = demoteToPlayer(userId);
    showFeedback(result.success ? 'success' : 'error', result.message);
  };

  const filteredUsers = allUsers.filter(
    (u) =>
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-300 border border-red-700/50">
            <Crown className="w-2.5 h-2.5" />
            Admin
          </span>
        );
      case 'referee':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-700/50">
            <Scale className="w-2.5 h-2.5" />
            Árbitro
          </span>
        );
      case 'moderator':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-700/50">
            <Shield className="w-2.5 h-2.5" />
            Moderador
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-dark-800 text-gray-400 border border-dark-700">
            <Users className="w-2.5 h-2.5" />
            Jogador
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-amber-400 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-500/30 mb-2">
            <Scale className="w-3.5 h-3.5" />
            <span>RBAC — Controle de Acesso</span>
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight">
            Gerenciamento de Usuários
          </h2>
          <p className="text-gray-400 text-xs mt-0.5">
            Promova jogadores a Árbitros para que possam definir vencedores das partidas. Árbitros NÃO têm acesso ao Painel Admin.
          </p>
        </div>

        {/* Contador de usuários */}
        <div className="flex gap-3">
          <div className="text-center p-3 bg-dark-900 border border-dark-800 rounded-xl min-w-[70px]">
            <span className="text-xl font-black text-white block">{allUsers.length}</span>
            <span className="text-[10px] text-gray-400 uppercase font-bold">Total</span>
          </div>
          <div className="text-center p-3 bg-dark-900 border border-amber-500/30 rounded-xl min-w-[70px]">
            <span className="text-xl font-black text-amber-300 block">
              {allUsers.filter((u) => u.role === 'referee').length}
            </span>
            <span className="text-[10px] text-gray-400 uppercase font-bold">Árbitros</span>
          </div>
        </div>
      </div>

      {/* Aviso sobre RBAC */}
      <div className="p-3 rounded-xl bg-dark-900 border border-red-500/20 text-xs text-gray-400 flex items-start gap-2">
        <Shield className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-gray-300 block">Como funciona o sistema de permissões:</span>
          <p>
            <code className="bg-dark-800 px-1 rounded text-gray-300">admin</code> — Acesso total ao Painel Admin e ao Painel do Árbitro.{' '}
            <code className="bg-dark-800 px-1 rounded text-amber-300">referee</code> — Acesso apenas ao Painel do Árbitro para definir vencedores.{' '}
            <code className="bg-dark-800 px-1 rounded text-gray-400">player</code> — Acesso apenas às páginas públicas.
          </p>
        </div>
      </div>

      {/* Feedback message */}
      {feedback && (
        <div
          className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3 pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar usuário por nome, username ou e-mail..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-dark-900 border border-dark-750 text-gray-200 text-xs rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-red-500 transition-colors"
        />
      </div>

      {/* User Table */}
      <div className="rounded-2xl border border-dark-800 overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-400">
              {searchQuery ? 'Nenhum usuário encontrado para esta busca.' : 'Nenhum usuário registrado ainda.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-dark-800">
            {/* Header da tabela */}
            <div className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_auto_auto_auto] gap-3 px-4 py-2.5 bg-dark-850 text-[10px] font-black uppercase text-gray-500 tracking-wider">
              <span>Usuário</span>
              <span className="hidden sm:block text-center">Registrado em</span>
              <span className="text-center">Nível</span>
              <span className="text-center">Ações</span>
            </div>

            {filteredUsers.map((u) => {
              const isCurrentUser = u.id === currentUser.id;
              const isProtected = u.role === 'admin' || u.role === 'moderator';

              return (
                <div
                  key={u.id}
                  className={`grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_auto_auto_auto] gap-3 px-4 py-3.5 items-center hover:bg-dark-850/50 transition-colors ${
                    isCurrentUser ? 'bg-red-950/10' : ''
                  }`}
                >
                  {/* User Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={u.avatarUrl || `https://ui-avatars.com/api/?name=${u.username}&background=1a1a2e&color=00f0ff&bold=true`}
                      alt={u.username}
                      className="w-8 h-8 rounded-lg border border-dark-700 object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">
                        {u.fullName || u.username}
                        {isCurrentUser && (
                          <span className="ml-1.5 text-[9px] text-red-400 font-black">(você)</span>
                        )}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate font-mono">@{u.username}</p>
                    </div>
                  </div>

                  {/* Date (desktop) */}
                  <span className="hidden sm:block text-[10px] text-gray-500 text-center whitespace-nowrap">
                    {new Date(u.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                  </span>

                  {/* Role Badge */}
                  <div className="flex justify-center">{getRoleBadge(u.role)}</div>

                  {/* Actions */}
                  <div className="flex items-center justify-center gap-1.5">
                    {isProtected || isCurrentUser ? (
                      <span className="text-[10px] text-gray-600 font-medium px-2 py-1">—</span>
                    ) : u.role === 'referee' ? (
                      <button
                        onClick={() => handleDemote(u.id)}
                        title="Remover cargo de Árbitro"
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-700/40 text-[10px] font-bold transition-all"
                      >
                        <UserX className="w-3 h-3" />
                        <span>Remover</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePromote(u.id)}
                        title="Promover a Árbitro"
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-700/40 text-[10px] font-bold transition-all"
                      >
                        <UserCheck className="w-3 h-3" />
                        <span>Árbitro</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-[11px] text-gray-600 text-center">
        As alterações de permissão são salvas imediatamente e persistem mesmo após o re-login do usuário.
      </p>
    </div>
  );
}
