import { NextRequest, NextResponse } from 'next/server';
import { PixGatewayService } from '@/lib/pix-gateway';
import { validatePixKey } from '@/lib/utils';
import { PixKeyType } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, pixKeyType, pixKey } = body;

    const minAmount = Number(process.env.MIN_WITHDRAWAL_BRL || 10);
    const antiFraudThreshold = Number(process.env.ANTI_FRAUD_MANUAL_APPROVAL_THRESHOLD_BRL || 500);

    if (!amount || typeof amount !== 'number' || amount < minAmount) {
      return NextResponse.json(
        { error: `O valor mínimo para solicitação de saque é de R$ ${minAmount.toFixed(2)}` },
        { status: 400 }
      );
    }

    if (!pixKeyType || !pixKey) {
      return NextResponse.json(
        { error: 'Tipo e chave PIX são obrigatórios' },
        { status: 400 }
      );
    }

    const keyValidation = validatePixKey(pixKeyType as PixKeyType, pixKey);
    if (!keyValidation.valid) {
      return NextResponse.json(
        { error: keyValidation.message || 'Chave PIX inválida' },
        { status: 400 }
      );
    }

    // Checagem de trava antifraude
    const requiresManualApproval = amount >= antiFraudThreshold;

    if (requiresManualApproval) {
      return NextResponse.json({
        success: true,
        requiresManualApproval: true,
        status: 'pending',
        message: `Solicitação registrada. Saques acima de R$ ${antiFraudThreshold.toFixed(2)} necessitam de aprovação manual do administrador por segurança.`,
      });
    }

    // Saque automático via Gateway
    const payoutResult = await PixGatewayService.executePayout({
      amount,
      pixKeyType: pixKeyType as PixKeyType,
      pixKey,
      description: 'Saque VISION eSports',
    });

    if (!payoutResult.success) {
      return NextResponse.json(
        { error: payoutResult.error || 'Falha ao transferir via gateway PIX' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      requiresManualApproval: false,
      status: 'completed',
      transferId: payoutResult.transferId,
      pixE2eId: payoutResult.pixE2eId,
      message: 'Transferência PIX concluída com sucesso!',
    });
  } catch (error: any) {
    console.error('Erro na rota /api/pix/withdraw:', error);
    return NextResponse.json(
      { error: error?.message || 'Falha interna ao processar saque' },
      { status: 500 }
    );
  }
}
