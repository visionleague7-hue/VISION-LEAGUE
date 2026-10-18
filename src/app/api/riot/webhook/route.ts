import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/riot/webhook
 *
 * Endpoint que a Riot chama quando uma partida criada via Tournament Code termina.
 * A Riot envia um JSON com o resultado, incluindo quem ganhou.
 *
 * A Riot NÃO tem autenticação por padrão no webhook — usamos o campo "metadata"
 * que colocamos na criação do código para identificar o torneio interno.
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    /*
      Payload da Riot (resumido):
      {
        gameId: number,
        tournamentCode: string,       // "BR1-456-AAAA-BB"
        metaData: string,             // JSON que colocamos na criação (visionTournamentId, etc.)
        winningTeam: [{ summonerId, ... }],
        losingTeam:  [{ summonerId, ... }],
        startTime: number,
        shortCode: string,
      }
    */

    console.log('[Riot Webhook] Partida finalizada:', JSON.stringify(body, null, 2));

    const { tournamentCode, metaData, winningTeam, losingTeam } = body;

    // Parse do metadata que criamos
    let parsedMeta: { visionTournamentId?: string; teamAName?: string; teamBName?: string } = {};
    try {
      parsedMeta = JSON.parse(metaData || '{}');
    } catch {
      console.warn('[Riot Webhook] Não foi possível parsear metaData:', metaData);
    }

    const { visionTournamentId, teamAName, teamBName } = parsedMeta;

    // Aqui você pode: 
    // 1. Buscar a partida no banco pelo visionTournamentId
    // 2. Identificar qual time ganhou (comparar summonerIds com os do time A ou B)
    // 3. Chamar setMatchWinner automaticamente
    //
    // Por enquanto, apenas logamos e retornamos 200 (Riot exige 200 para confirmar recebimento)

    console.log(`[Riot Webhook] Torneio VisionLeague: ${visionTournamentId}`);
    console.log(`[Riot Webhook] Código: ${tournamentCode}`);
    console.log(`[Riot Webhook] Vencedores (summonerIds):`, winningTeam?.map((p: any) => p.summonerId));

    // TODO: quando integrar com Supabase/DB, buscar o match por visionTournamentId
    // e chamar automaticamente a lógica de setMatchWinner

    return NextResponse.json({ received: true, visionTournamentId }, { status: 200 });
  } catch (err: any) {
    console.error('[Riot Webhook] Erro:', err);
    // Retorna 200 mesmo em erro para evitar que a Riot fique reenviando
    return NextResponse.json({ received: false, error: err.message }, { status: 200 });
  }
}

// GET para testar se o endpoint está ativo
export async function GET() {
  return NextResponse.json({
    status: 'online',
    endpoint: 'Vision League — Riot Webhook',
    info: 'A Riot chama este endpoint via POST quando uma partida de torneio termina.',
  });
}
