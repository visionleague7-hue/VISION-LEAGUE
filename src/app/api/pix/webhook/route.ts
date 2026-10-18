import { NextRequest, NextResponse } from 'next/server';
import { PixGatewayService } from '@/lib/pix-gateway';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    // 1. Validação de Assinatura e Autenticidade do Gateway
    const authToken = req.headers.get('asaas-access-token') || req.headers.get('x-webhook-token');
    if (!PixGatewayService.verifyWebhookSignature(authToken)) {
      console.warn('[Webhook] Assinatura/token inválido recebido.');
      return NextResponse.json({ error: 'Token de webhook inválido ou não autorizado' }, { status: 401 });
    }

    const payload = await req.json();
    console.log('[Webhook] Evento financeiro recebido do Gateway:', payload?.event || 'pix_received');

    // 2. Tratamento para formato ASAAS
    // Eventos possíveis: PAYMENT_RECEIVED, PAYMENT_CONFIRMED, TRANSFER_DONE, TRANSFER_FAILED
    if (payload.event) {
      const eventType = payload.event;
      const paymentData = payload.payment;

      if (eventType === 'PAYMENT_RECEIVED' || eventType === 'PAYMENT_CONFIRMED') {
        const txid = paymentData?.id;
        const amount = paymentData?.value;
        const clientUserId = paymentData?.externalReference || paymentData?.customer;

        console.log(`[Webhook] Pagamento PIX confirmado! TxID: ${txid}, Valor: R$ ${amount}`);

        // Se Supabase estiver conectado, executa a Stored Procedure atômica
        if (isSupabaseConfigured() && supabase && clientUserId) {
          const { error } = await supabase.rpc('credit_pix_deposit', {
            p_user_id: clientUserId,
            p_amount: amount,
            p_pix_txid: txid,
            p_pix_e2e_id: paymentData?.pixTransaction?.endToEndIdentifier || null,
            p_description: `Depósito PIX confirmado via Webhook (${txid})`,
          });

          if (error) {
            console.error('[Webhook] Erro ao creditar no Supabase:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
          }
        }
      }

      if (eventType === 'TRANSFER_FAILED') {
        console.warn(`[Webhook] Transferência de saque falhou no gateway: ${payload.transfer?.id}`);
      }
    }

    // 3. Tratamento para formato EFÍ BANK / GERENCIANET
    // Efí envia: { pix: [ { endToEndId, txid, valor, horario, ... } ] }
    if (payload.pix && Array.isArray(payload.pix)) {
      for (const item of payload.pix) {
        console.log(`[Webhook Efí] PIX Recebido: TxID ${item.txid}, E2E: ${item.endToEndId}, Valor: R$ ${item.valor}`);
      }
    }

    // Responde 200 OK imediatamente para confirmar o recebimento
    return NextResponse.json({
      received: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Webhook] Falha ao processar webhook:', error);
    return NextResponse.json(
      { error: error?.message || 'Erro interno no processamento do webhook' },
      { status: 500 }
    );
  }
}
