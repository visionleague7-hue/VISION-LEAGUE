import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/riot/tournament/create
 *
 * Cria um código de sala customizada do LoL via Riot Tournament (Stub) API.
 * Quando a chave de produção chegar, basta trocar RIOT_USE_STUB=false no .env
 *
 * Body esperado:
 * {
 *   tournamentId: string,   // ID interno da partida no VisionLeague
 *   teamAName: string,
 *   teamBName: string,
 *   region?: string          // padrão: 'BR1'
 * }
 *
 * Retorna:
 * {
 *   code: string,            // ex: "BR1-456-AAAA-BB"
 *   providerTournamentId: number,
 *   riotTournamentId: number
 * }
 */

const RIOT_API_KEY  = process.env.RIOT_API_KEY || '';
const USE_STUB      = process.env.RIOT_USE_STUB !== 'false'; // Stub por padrão
const CALLBACK_URL  = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/riot/webhook`
  : 'https://visionleague.gg/api/riot/webhook';

const BASE = USE_STUB
  ? 'https://americas.api.riotgames.com/lol/tournament-stub/v5'
  : 'https://americas.api.riotgames.com/lol/tournament/v5';

const riotHeaders = {
  'X-Riot-Token': RIOT_API_KEY,
  'Content-Type': 'application/json',
};

// ── Helpers ────────────────────────────────────────────────────────────────

async function registerProvider(region: string): Promise<number> {
  const res = await fetch(`${BASE}/providers`, {
    method: 'POST',
    headers: riotHeaders,
    body: JSON.stringify({ region, url: CALLBACK_URL }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Riot registerProvider falhou (${res.status}): ${err}`);
  }
  return res.json(); // retorna o providerId (número)
}

async function createTournament(providerId: number, name: string): Promise<number> {
  const res = await fetch(`${BASE}/tournaments`, {
    method: 'POST',
    headers: riotHeaders,
    body: JSON.stringify({ providerId, name }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Riot createTournament falhou (${res.status}): ${err}`);
  }
  return res.json(); // retorna o tournamentId (número)
}

async function generateCode(tournamentId: number, metadata: string): Promise<string> {
  const res = await fetch(`${BASE}/codes?count=1&tournamentId=${tournamentId}`, {
    method: 'POST',
    headers: riotHeaders,
    body: JSON.stringify({
      mapType: 'SUMMONERS_RIFT',
      pickType: 'TOURNAMENT_DRAFT',
      spectatorType: 'ALL',
      teamSize: 5,
      metadata, // JSON string com dados da partida VisionLeague
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Riot generateCode falhou (${res.status}): ${err}`);
  }
  const codes: string[] = await res.json();
  return codes[0];
}

// ── Handler ────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    if (!RIOT_API_KEY) {
      return NextResponse.json(
        { error: 'RIOT_API_KEY não configurada no .env.local' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { tournamentId, teamAName, teamBName, region = 'BR1' } = body;

    if (!tournamentId || !teamAName || !teamBName) {
      return NextResponse.json(
        { error: 'tournamentId, teamAName e teamBName são obrigatórios' },
        { status: 400 }
      );
    }

    // 1. Registrar Provider
    const providerId = await registerProvider(region);

    // 2. Criar Torneio na Riot
    const tournamentName = `VisionLeague | ${teamAName} vs ${teamBName}`;
    const riotTournamentId = await createTournament(providerId, tournamentName);

    // 3. Gerar código de sala
    const metadata = JSON.stringify({ visionTournamentId: tournamentId, teamAName, teamBName });
    const code = await generateCode(riotTournamentId, metadata);

    console.log(`[Riot] Código gerado para ${tournamentName}: ${code} (stub=${USE_STUB})`);

    return NextResponse.json({
      code,
      providerId,
      riotTournamentId,
      stub: USE_STUB,
    });
  } catch (err: any) {
    console.error('[Riot] Erro ao criar sala:', err);
    return NextResponse.json({ error: err.message || 'Erro interno' }, { status: 500 });
  }
}
