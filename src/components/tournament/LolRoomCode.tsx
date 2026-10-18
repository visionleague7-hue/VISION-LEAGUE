'use client';

import React, { useState } from 'react';
import { Copy, CheckCircle2, Loader2, Gamepad2, AlertCircle, ExternalLink } from 'lucide-react';

interface LolRoomCodeProps {
  tournamentId: string;  // ID interno do VisionLeague
  teamAName: string;
  teamBName: string;
}

export default function LolRoomCode({ tournamentId, teamAName, teamBName }: LolRoomCodeProps) {
  const [code, setCode]       = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied]   = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const generateCode = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/riot/tournament/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournamentId, teamAName, teamBName, region: 'BR1' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar código');
      setCode(data.code);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async () => {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-950/40 to-dark-900 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <Gamepad2 className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white">Sala Customizada — League of Legends</h4>
          <p className="text-xs text-gray-400">
            {teamAName} <span className="text-gray-600">vs</span> {teamBName}
          </p>
        </div>
      </div>

      {/* Código gerado */}
      {code ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 bg-dark-950 rounded-xl border border-blue-500/30">
            <span className="flex-1 font-mono text-lg font-black text-blue-300 tracking-widest text-center">
              {code}
            </span>
            <button
              onClick={copyCode}
              className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 transition-all"
              title="Copiar código"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Instruções */}
          <div className="text-xs text-gray-400 space-y-1.5 bg-dark-900/60 p-3 rounded-xl border border-dark-800">
            <p className="font-bold text-gray-300 mb-1">Como entrar na sala:</p>
            <p>1. Abra o <strong className="text-white">League of Legends</strong></p>
            <p>2. Clique em <strong className="text-white">Jogar → Custom → Inserir Código</strong></p>
            <p>3. Cole o código acima e entre na sala</p>
            <p>4. O árbitro confirma o vencedor após a partida</p>
          </div>

          <a
            href="https://www.leagueoflegends.com/pt-br/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Abrir League of Legends
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <p className="text-xs text-gray-400">
            Clique no botão abaixo para gerar o código da sala customizada. Os dois times devem inserir o código no jogo para entrar na mesma partida.
          </p>

          <button
            onClick={generateCode}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-wait text-white flex items-center justify-center gap-2 transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Gerando sala...
              </>
            ) : (
              <>
                <Gamepad2 className="w-4 h-4" />
                Gerar Código da Sala
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
