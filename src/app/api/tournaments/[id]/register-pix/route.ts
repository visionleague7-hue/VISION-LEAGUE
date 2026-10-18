import { NextRequest, NextResponse } from 'next/server';
import { AsaasService } from '@/lib/asaas';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tournamentId = params.id;
    const body = await req.json();
    const {
      teamName,
      teamTag,
      playerName,
      playerCpf,
      playerEmail,
      playerPhone,
      tournamentTitle,
      entryFee,
    } = body;

    // 1. Validações dos parâmetros
    const rawDoc = body.playerCpfCnpj || body.playerCpf || '';
    if (!playerName || !rawDoc) {
      return NextResponse.json(
        { error: 'Nome completo e CPF/CNPJ do pagador são obrigatórios para emissão do PIX Asaas.' },
        { status: 400 }
      );
    }

    const cleanDoc = rawDoc.replace(/\D/g, '');
    if (cleanDoc.length !== 11 && cleanDoc.length !== 14) {
      return NextResponse.json(
        { error: 'Documento inválido. Deve conter 11 dígitos (CPF) ou 14 dígitos (CNPJ).' },
        { status: 400 }
      );
    }

    if (!teamName) {
      return NextResponse.json(
        { error: 'Nome do time é obrigatório para inscrição no campeonato.' },
        { status: 400 }
      );
    }

    const feeAmount = typeof entryFee === 'number' ? entryFee : 50;

    // 2. Chamada à API Oficial Asaas v3: POST /v3/payments & GET /v3/payments/{id}/pixQrCode
    const externalRef = `REG-${tournamentId}-${Date.now()}`;
    const description = `Inscrição Torneio: ${tournamentTitle || 'Vision League'} | Time: ${teamName}`;

    const { payment, qrCode } = await AsaasService.createPixPayment({
      customerName: playerName,
      customerCpfCnpj: cleanDoc,
      customerEmail: playerEmail || 'jogador@visionleague.gg',
      customerPhone: playerPhone,
      value: feeAmount,
      description,
      externalReference: externalRef,
    });

    // 3. Se Supabase estiver conectado, registra pré-inscrição pendente
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('tournament_registrations').insert({
        tournament_id: tournamentId,
        team_id: body.teamId || null,
        captain_id: body.userId || null,
        payment_method: 'pix_direct',
        payment_status: 'pending',
        pix_charge_id: payment.id,
      });
    }

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      status: payment.status,
      value: payment.value,
      dueDate: payment.dueDate,
      qrCodeBase64: qrCode.encodedImage, // Base64 da imagem QR Code
      copiaECola: qrCode.payload,        // String Copia e Cola Bacen
      expirationDate: qrCode.expirationDate,
      externalReference: externalRef,
    });
  } catch (error: any) {
    console.error('[API /register-pix] Erro ao gerar cobrança PIX no Asaas:', error);
    return NextResponse.json(
      { error: error?.message || 'Falha ao processar cobrança PIX no Asaas' },
      { status: 500 }
    );
  }
}
