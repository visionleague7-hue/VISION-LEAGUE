'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppState } from '@/lib/state-context';
import { formatBRL, formatDate } from '@/lib/utils';
import BracketViewer from '@/components/tournament/BracketViewer';
import RegisterModal from '@/components/tournament/RegisterModal';
import LolRoomCode from '@/components/tournament/LolRoomCode';
import {
  Trophy,
  Calendar,
  Users,
  Shield,
  FileText,
  Zap,
  ArrowLeft,
  Award,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function TournamentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { tournaments, brackets } = useAppState();
  const [activeTab, setActiveTab] = useState<'bracket' | 'rules' | 'teams'>('bracket');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  const tournamentId = params?.id as string;
  const tournament = tournaments.find((t) => t.id === tournamentId);

  if (!tournament) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-white">Campeonato não encontrado</h2>
        <button
          onClick={() => router.push('/tournaments')}
          className="px-6 py-2.5 bg-red-600 text-white font-bold rounded-xl text-xs uppercase"
        >
          Voltar aos Campeonatos
        </button>
      </div>
    );
  }

  const tournamentMatches = brackets[tournament.id] || [];

  // Mock de times inscritos
  const registeredTeams = [
    { name: 'Vision Alpha', tag: 'VSA', captain: 'ColdzeraBR', rank: 'Radiante' },
    { name: 'Sentinels BR', tag: 'SEN', captain: 'TenZ_BR', rank: 'Radiante' },
    { name: 'Los Grandes', tag: 'LOS', captain: 'Ranger_LoL', rank: 'Imortal' },
    { name: 'Vorax eSports', tag: 'VRX', captain: 'KhaZix_God', rank: 'Imortal' },
    { name: 'FURIA Feeder', tag: 'FUR', captain: 'FalleN_God', rank: 'Global Elite' },
    { name: 'MIBR Academy', tag: 'MIB', captain: 'brnz4n', rank: 'Global Elite' },
  ].slice(0, tournament.registeredTeamsCount);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Botão Voltar */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4 text-red-400\" />
        <span>Voltar para Torneios</span>
      </button>

      {/* Banner Principal & Header do Torneio */}
      <div className="relative rounded-3xl overflow-hidden border border-red-500/20 bg-dark-900 shadow-2xl">
        <div className="relative h-64 sm:h-80 w-full overflow-hidden">
          <img
            src={tournament.bannerUrl}
            alt={tournament.title}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-dark-950 via-dark-950/80 to-transparent" />

          {/* Badges Flutuantes */}
          <div className="absolute top-4 left-4 sm:left-8 flex gap-2">
            <span className="px-3 py-1 bg-red-950/80 border border-red-500/30 text-red-300 rounded-lg text-xs font-black uppercase">
              {tournament.game}
            </span>
            <span className="px-3 py-1 bg-red-950/80 border border-red-500/40 text-red-300 rounded-lg text-xs font-black uppercase">
              {tournament.format === 'single_elimination' ? 'Eliminação Simples' : 'Eliminação Dupla'}
            </span>
          </div>

          {/* Conteúdo Header */}
          <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 right-4 sm:right-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight uppercase text-glow-red">
                {tournament.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-300">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-red-400\" />
                  <span>Início: {formatDate(tournament.startDate)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-red-400" />
                  <span>
                    {tournament.registeredTeamsCount} / {tournament.maxTeams} Times Inscritos
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span>Premiação Automática via PIX</span>
                </div>
              </div>
            </div>

            {/* Ação de Inscrição */}
            <div className="shrink-0 flex items-center gap-3">
              {tournament.status === 'open' ? (
                <button
                  onClick={() => setIsRegisterOpen(true)}
                  className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-neon-red hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  <span>Inscrever Meu Time</span>
                </button>
              ) : tournament.status === 'ongoing' ? (
                <div className="px-6 py-3 bg-amber-950/80 border border-amber-500/40 text-amber-300 rounded-2xl text-xs font-black uppercase flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                  <span>Torneio em Andamento</span>
                </div>
              ) : (
                <div className="px-6 py-3 bg-dark-800 border border-dark-700 text-gray-400 rounded-2xl text-xs font-black uppercase">
                  Torneio Finalizado
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast Feedback */}
      {successToast && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 rounded-2xl flex items-center gap-3 shadow-lg">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <span className="font-bold text-sm">{successToast}</span>
        </div>
      )}

      {/* Card de Premiação & Informações Financeiras */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* 1º Lugar */}
        <div className="p-5 rounded-2xl bg-dark-900 border border-amber-500/40 flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Trophy className="w-4 h-4" /> 1º Colocado (Campeão)
            </span>
            <span className="text-2xl font-black text-white font-mono">
              {formatBRL(tournament.firstPlacePrize || tournament.prizePool)}
            </span>
          </div>
          <Award className="w-10 h-10 text-amber-400/30" />
        </div>

        {/* 2º Lugar */}
        <div className="p-5 rounded-2xl bg-dark-900 border border-dark-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <Award className="w-4 h-4" /> 2º Colocado (Vice)
            </span>
            <span className="text-2xl font-black text-gray-200 font-mono">
              {formatBRL(tournament.secondPlacePrize || 0)}
            </span>
          </div>
          <Award className="w-10 h-10 text-gray-600/30" />
        </div>

        {/* Taxa de Inscrição */}
        <div className="p-5 rounded-2xl bg-dark-900 border border-dark-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-red-400">
              Taxa por Time (Entry Fee)
            </span>
            <span className="text-2xl font-black text-white font-mono">
              {tournament.entryFee > 0 ? formatBRL(tournament.entryFee) : 'GRÁTIS'}
            </span>
          </div>
          <Zap className="w-10 h-10 text-red-400/20" />
        </div>
      </div>

      {/* ── Sala Customizada LoL (apenas para Duelo Direto de LoL) ───────── */}
      {tournament.game === 'League of Legends' && tournament.competitionMode === 'duelo_direto' && (
        <LolRoomCode
          tournamentId={tournament.id}
          teamAName={tournamentMatches[0]?.teamA?.name || 'Time A'}
          teamBName={tournamentMatches[0]?.teamB?.name || 'Time B'}
        />
      )}

      {/* Tabs de Navegação */}
      <div className="space-y-6">
        <div className="flex border-b border-dark-800 gap-2">
          <button
            onClick={() => setActiveTab('bracket')}
            className={`pb-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'bracket'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Chaveamento de Eliminação (Brackets)</span>
          </button>

          <button
            onClick={() => setActiveTab('teams')}
            className={`pb-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'teams'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Times Inscritos ({tournament.registeredTeamsCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`pb-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'rules'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Regras & Regulamento</span>
          </button>
        </div>

        {/* Conteúdo da Tab: Brackets */}
        {activeTab === 'bracket' && (
          <div className="bg-dark-900 rounded-2xl border border-dark-800 p-6">
            <BracketViewer matches={tournamentMatches} tournamentTitle={tournament.title} />
          </div>
        )}

        {/* Conteúdo da Tab: Times Inscritos */}
        {activeTab === 'teams' && (
          <div className="bg-dark-900 rounded-2xl border border-dark-800 p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {registeredTeams.map((tm, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-dark-850 border border-dark-750 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-dark-950 border border-dark-700 flex items-center justify-center font-bold text-xs text-gray-300 font-mono">
                      {tm.tag}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{tm.name}</h4>
                      <p className="text-[11px] text-gray-400">Capitão: {tm.captain}</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-red-950 text-red-300 px-2 py-0.5 rounded border border-red-800/50 uppercase font-bold">
                    {tm.rank}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conteúdo da Tab: Regras */}
        {activeTab === 'rules' && (
          <div className="bg-dark-900 rounded-2xl border border-dark-800 p-6 sm:p-8 space-y-4 leading-relaxed text-sm text-gray-300">
            <h3 className="text-base font-bold text-white uppercase">Regulamento Oficial</h3>
            <p className="whitespace-pre-line">{tournament.rules}</p>

            <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 space-y-2 mt-4 text-xs">
              <h4 className="font-bold text-red-300 uppercase">
                Informações de Pagamento e Premiação
              </h4>
              <p className="text-gray-300">
                • Todas as premiações são creditadas diretamente na Carteira Virtual do capitão do time vencedor no instante em que o administrador declara o encerramento do torneio.
              </p>
              <p className="text-gray-300">
                • O capitão pode solicitar o resgate via PIX a qualquer momento, sem taxas e com liquidação automática.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Inscrição */}
      {isRegisterOpen && (
        <RegisterModal
          tournament={tournament}
          onClose={() => setIsRegisterOpen(false)}
          onSuccess={() => {
            setSuccessToast('Inscrição confirmada com sucesso! Seu time foi adicionado à lista de participantes.');
          }}
        />
      )}
    </div>
  );
}
