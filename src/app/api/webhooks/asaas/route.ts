import { NextRequest, NextResponse } from 'next/server';
import { AsaasService, AsaasWebhookEvent } from '@/lib/asaas';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    // 1. Verificação de Segurança do Token do Asaas (Header: asaas-access-token)
    const receivedToken =
      req.headers.get('asaas-access-token') ||
      req.headers.get('x-webhook-token') ||
      req.headers.get('webhook-token');

    if (!AsaasService.verifyWebhookToken(receivedToken)) {
      console.warn('[Webhook Asaas] Token de acesso não autorizado.');
      return NextResponse.json(
        { error: 'Acesso não autorizado: token de webhook inválido' },
        { status: 401 }
      );
    }

    const payload: AsaasWebhookEvent = await req.json();
    console.log('[Webhook Asaas] Evento recebido:', payload.event);

    const event = payload.event;
    const payment = payload.payment;
    const transfer = payload.transfer;

    // 2. Evento PAYMENT_RECEIVED ou PAYMENT_CONFIRMED: Atualiza status para 'Inscrito / Confirmado'
    if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
      if (payment) {
        const paymentId = payment.id;
        const value = payment.value;
        const externalReference = payment.externalReference || '';
        const endToEndId = payment.pixTransaction?.endToEndIdentifier;

        console.log(`[Webhook Asaas] Pagamento confirmado! ID: ${paymentId}, Valor: R$ ${value}, Ref: ${externalReference}`);

        // Se Supabase estiver conectado
        if (isSupabaseConfigured() && supabase) {
          // A. Se for pagamento de inscrição de torneio (Prefixo REG-)
          if (externalReference.startsWith('REG-')) {
            const { error: regError } = await supabase
              .from('tournament_registrations')
              .update({
                payment_status: 'paid',
                payment_status_label: 'Inscrito / Confirmado',
                pix_e2e_id: endToEndId,
                updated_at: new Date().toISOString(),
              })
              .eq('pix_charge_id', paymentId);

            if (regError) {
              console.error('[Webhook Asaas] Erro ao atualizar status de inscrição:', regError);
            } else {
              console.log(`[Webhook Asaas] Time/Jogador atualizado para 'Inscrito / Confirmado'!`);
            }
          }

          // B. Se for depósito direto na carteira virtual
          if (externalReference.startsWith('DEP-') || externalReference.startsWith('USER-')) {
            const userId = externalReference.replace(/^(DEP|USER)-/, '');
            await supabase.rpc('credit_pix_deposit', {
              p_user_id: userId,
              p_amount: value,
              p_pix_txid: paymentId,
              p_pix_e2e_id: endToEndId || null,
              p_description: `Depósito PIX confirmado via Asaas (${paymentId})`,
            });
          }
        }
      }
    }

    // 3. Evento TRANSFER_FAILED: Caso uma transferência Pix falhe no banco central
    if (event === 'TRANSFER_FAILED') {
      if (transfer) {
        const transferId = transfer.id;
        const failReason = transfer.failReason || 'Falha no processamento bancário da chave PIX';
        console.warn(`[Webhook Asaas] Transferência ${transferId} falhou. Motivo: ${failReason}`);

        // Estorno automático no banco de dados
        if (isSupabaseConfigured() && supabase) {
          // Busca solicitação de saque vinculada
          const { data: wdRequest } = await supabase
            .from('withdrawal_requests')
            .select('*')
            .eq('gateway_transfer_id', transferId)
            .single();

          if (wdRequest && wdRequest.status !== 'rejected') {
            // Estorna o valor de volta para o saldo disponível do jogador
            await supabase.rpc('reject_withdrawal_atomic', {
              p_request_id: wdRequest.id,
              p_reason: `Estorno automático: ${failReason}`,
            });
            console.log(`[Webhook Asaas] Saldo de R$ ${wdRequest.amount} estornado para o jogador.`);
          }
        }
      }
    }

    // 4. Retorna HTTP 200 rápido para acusar recebimento ao Asaas
    return NextResponse.json({
      received: true,
      event: payload.event,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Webhook Asaas] Erro interno:', error);
    return NextResponse.json(
      { error: error?.message || 'Erro interno no processamento do webhook' },
      { status: 500 }
    );
  }
}
