import { NextRequest, NextResponse } from 'next/server';
import { PixGatewayService } from '@/lib/pix-gateway';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, description } = body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Valor de depósito inválido. Informe um número maior que zero.' },
        { status: 400 }
      );
    }

    const pixCharge = await PixGatewayService.createPayInCharge({
      amount,
      description: description || 'Depósito Carteira VISION eSports',
      expiresInMinutes: 30,
    });

    return NextResponse.json({
      success: true,
      charge: pixCharge,
    });
  } catch (error: any) {
    console.error('Erro na rota /api/pix/deposit:', error);
    return NextResponse.json(
      { error: error?.message || 'Falha interna ao gerar PIX' },
      { status: 500 }
    );
  }
}
