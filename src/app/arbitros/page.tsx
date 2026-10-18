'use client';

import React, { useState } from 'react';
import { useAppState } from '@/lib/state-context';
import RoleGuard from '@/components/auth/RoleGuard';
import {
  ShieldAlert,
  Scale,
  MessageSquare,
  Clock,
  CheckCircle2,
  Trophy,
  ExternalLink,
  ShieldCheck,
  Swords,
  Crown,
} from 'lucide-react';
import Link from 'next/link';

function ArbitrosContent() {
  const { tournaments, brackets, setMatchWinner, siteSettings } = useAppState();
  const discordUrl = siteSettings.discordUrl || 'https://discord.gg/QynktSWuK';

  const [selectedTournamentId, setSelectedTournamentId] = useState(
    tournaments.length > 0 ? tournaments[0].id : ''
  );
  const [confirmingMatch, setConfirmingMatch] = useState<{
    matchId: string;
    winnerId: string;
    winnerName: string;
  } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const selectedTourn = tournaments.find((t) => t.id === selectedTournamentId);
  const currentMatches = selectedTournamentId ? brackets[selectedTournamentId] || [] : [];

  const handleMarkWinner = (
    matchId: string,
    winnerId: string,
    winnerName: string
  ) => {
    // Primeiro clique → abre confirmação; segundo clique → confirma
    if (
      confirmingMatch?.matchId === matchId &&
      confirmingMatch?.winnerId === winnerId
    ) {
      setMatchWinner(selectedTournamentId, matchId, winnerId, winnerName);
      setSuccessMessage(`✔ Vencedor confirmado: ${winnerName}`);
      setConfirmingMatch(null);
      setTimeout(() => setSuccessMessage(null), 5000);
    } else {
      setConfirmingMatch({ matchId, winnerId, winnerName });
    }
  };

  const cancelConfirm = () => setConfirmingMatch(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner do Painel */}
      <div className="bg-gradient-to-r from-amber-950/40 via-dark-900 to-dark-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Scale className="w-3.5 h-3.5" />
            <span>Painel Oficial de Árbitros</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Gestão de Partidas
          </h1>
          <p className="text-gray-300 text-sm leading-relaxed">
            Selecione o confronto, escolha o time vencedor e confirme o resultado. A chave do torneio será atualizada automaticamente.
          </p>
        </div>

        <a
          href={discordUrl}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#5865F2]/20 hover:bg-[#5865F2]/30 text-[#9AA6FF] font-black text-xs uppercase tracking-wider transition-all border border-[#5865F2]/40"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Discord Árbitros</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Feedback */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Área Operacional */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna Principal: Partidas */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-dark-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Swords className="w-5 h-5 text-gray-400\" />
                <span>Confrontos do Torneio</span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Clique em "Marcar Vencedor" e confirme para homologar o resultado.
              </p>
            </div>

            {/* Seletor de Torneio */}
            <select
              value={selectedTournamentId}
              onChange={(e) => {
                setSelectedTournamentId(e.target.value);
                setConfirmingMatch(null);
              }}
              className="bg-dark-900 border border-dark-750 text-gray-200 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-red-500"
            >
              {tournaments.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.game} • {t.title}
                </option>
              ))}
            </select>
          </div>

          {/* Lista de Partidas */}
          {currentMatches.length === 0 ? (
            <div className="p-8 text-center bg-dark-900 rounded-2xl border border-dark-800 space-y-2">
              <Clock className="w-8 h-8 text-gray-600 mx-auto" />
              <p className="text-sm font-bold text-gray-400">Nenhum confronto ativo neste torneio.</p>
              <p className="text-xs text-gray-500">
                Os confrontos aparecerão aqui após as inscrições encerrarem e a chave ser gerada.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentMatches.map((match) => {
                const isConfirmingThis = confirmingMatch?.matchId === match.id;
                const isCompleted = match.status === 'completed';

                return (
                  <div
                    key={match.id}
                    className={`p-5 rounded-2xl border space-y-4 transition-colors ${
                      isCompleted
                        ? 'bg-dark-900/60 border-emerald-800/30'
                        : 'bg-dark-900 border-dark-800 hover:border-dark-750'
                    }`}
                  >
                    {/* Cabeçalho da partida */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-dark-800 text-gray-300 border border-dark-750">
                          {match.roundName}
                        </span>
                        <span className="text-xs text-gray-400">Partida #{match.matchIndex}</span>
                      </div>

                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          isCompleted
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                            : 'bg-amber-950 text-amber-400 border border-amber-800/40'
                        }`}
                      >
                        {isCompleted ? '✔ Homologada' : 'Aguardando Árbitro'}
                      </span>
                    </div>

                    {/* Times */}
                    <div className="grid grid-cols-3 items-center gap-2 text-center py-3 bg-dark-950/60 rounded-xl px-4 border border-dark-850">
                      {/* Time A */}
                      <div className="text-left space-y-1">
                        <span className="text-sm font-black text-white block">
                          {match.teamA?.name || 'Time A'}
                        </span>
                        {match.winnerId === match.teamA?.id && (
                          <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                            <Crown className="w-3 h-3" /> Vencedor
                          </span>
                        )}
                      </div>

                      <div className="text-center">
                        <span className="text-gray-500 font-black text-base">VS</span>
                      </div>

                      {/* Time B */}
                      <div className="text-right space-y-1">
                        <span className="text-sm font-black text-white block">
                          {match.teamB?.name || 'Time B'}
                        </span>
                        {match.winnerId === match.teamB?.id && (
                          <span className="text-[10px] text-amber-400 font-bold flex items-center justify-end gap-1">
                            <Crown className="w-3 h-3" /> Vencedor
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Ações do Árbitro */}
                    {isCompleted ? (
                      <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-bold">
                        <ShieldCheck className="w-4 h-4" />
                        <span>
                          Resultado homologado — Vencedor:{' '}
                          <strong>{match.winnerName || '–'}</strong>
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Confirmação pendente */}
                        {isConfirmingThis ? (
                          <div className="p-3 bg-amber-950/30 rounded-xl border border-amber-500/40 space-y-3">
                            <p className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                              <ShieldAlert className="w-4 h-4" />
                              Confirmar vencedor:{' '}
                              <span className="text-white">{confirmingMatch.winnerName}</span>?
                            </p>
                            <p className="text-[11px] text-gray-400">
                              Esta ação não pode ser desfeita. Certifique-se de ter o comprovante de resultado (screenshot).
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  handleMarkWinner(
                                    confirmingMatch.matchId,
                                    confirmingMatch.winnerId,
                                    confirmingMatch.winnerName
                                  )
                                }
                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase transition-all"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Confirmar e Homologar
                              </button>
                              <button
                                onClick={cancelConfirm}
                                className="px-3 py-2 text-xs text-gray-400 hover:text-white transition-colors"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <span className="text-[11px] text-gray-500 mr-auto flex items-center gap-1">
                              <Scale className="w-3.5 h-3.5 text-amber-400/60" />
                              Selecione o time vencedor:
                            </span>

                            {/* Botão Time A */}
                            {match.teamA && (
                              <button
                                onClick={() =>
                                  handleMarkWinner(
                                    match.id,
                                    match.teamA!.id,
                                    match.teamA!.name
                                  )
                                }
                                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-dark-800 hover:bg-red-900/30 border border-dark-700 hover:border-red-500/40 text-xs font-bold text-gray-200 hover:text-red-300 transition-all"
                              >
                                <Trophy className="w-3.5 h-3.5 text-gray-400\" />
                                {match.teamA.name}
                              </button>
                            )}

                            {/* Botão Time B */}
                            {match.teamB && (
                              <button
                                onClick={() =>
                                  handleMarkWinner(
                                    match.id,
                                    match.teamB!.id,
                                    match.teamB!.name
                                  )
                                }
                                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-dark-800 hover:bg-red-900/30 border border-dark-700 hover:border-red-500/40 text-xs font-bold text-gray-200 hover:text-red-300 transition-all"
                              >
                                <Trophy className="w-3.5 h-3.5 text-gray-400\" />
                                {match.teamB.name}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Coluna 3: Regulamento */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-dark-900 border border-dark-800 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Regulamento da Arbitragem</span>
            </h3>

            <div className="space-y-3 text-xs text-gray-300 leading-relaxed">
              {[
                {
                  title: '1. Regra de W.O. (15 min)',
                  body: 'Se uma equipe não comparecer completa ao lobby em até 15 min após o horário marcado, declare W.O. em favor do time presente.',
                },
                {
                  title: '2. Comprovação de Resultado',
                  body: 'Exija sempre screenshot da tela final enviada pelo capitão vencedor no canal #tickets-arbitros no Discord antes de homologar.',
                },
                {
                  title: '3. Deadlock — Lobby Privado',
                  body: 'Para Deadlock, confirme que os capitães trocaram Friend Code da Steam antes de iniciar a partida.',
                },
                {
                  title: '4. Fair Play & Anti-cheat',
                  body: 'Suspeita de cheat, smurf ou conduta antidesportiva: escale imediatamente para o Admin com prints. Não homologue o resultado.',
                },
              ].map((rule) => (
                <div key={rule.title} className="p-3 rounded-xl bg-dark-850 border border-dark-750 space-y-1">
                  <span className="font-bold text-white block">{rule.title}</span>
                  <p className="text-gray-400 text-[11px]">{rule.body}</p>
                </div>
              ))}
            </div>

            <a
              href={discordUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 px-3 rounded-xl bg-[#5865F2]/20 hover:bg-[#5865F2]/30 text-[#9AA6FF] font-bold text-xs uppercase flex items-center justify-center gap-2 border border-[#5865F2]/40 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Canal #arbitragem no Discord</span>
            </a>
          </div>

          {/* Link para o Admin promover árbitros */}
          <div className="p-4 rounded-2xl bg-dark-900 border border-red-500/20 text-xs text-gray-400 space-y-2">
            <p className="font-bold text-gray-300">Gerenciar árbitros</p>
            <p>Apenas o Admin pode promover jogadores a árbitros via Painel Admin → Usuários & Árbitros.</p>
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-1.5 text-red-400 hover:text-red-300 font-bold transition-colors"
            >
              <Scale className="w-3 h-3" />
              Ir para Gerenciamento de Usuários →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Página protegida por RoleGuard — apenas referee e admin têm acesso
export default function ArbitrosPage() {
  return (
    <RoleGuard allowedRoles={['referee']} redirectTo="/">
      <ArbitrosContent />
    </RoleGuard>
  );
}
