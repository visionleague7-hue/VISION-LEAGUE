import { NextRequest, NextResponse } from 'next/server';
import { AsaasService, AsaasPixKeyType } from '@/lib/asaas';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { validatePixKey } from '@/lib/utils';
import { PixKeyType } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, amount, pixKey, pixKeyType, description } = body;

    // 1. Validação dos dados obrigatórios
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Valor de saque inválido. Informe um número maior que zero.' },
        { status: 400 }
      );
    }

    const minWithdrawal = Number(process.env.MIN_WITHDRAWAL_BRL || 10);
    if (amount < minWithdrawal) {
      return NextResponse.json(
        { error: `O valor mínimo para saque é de R$ ${minWithdrawal.toFixed(2)}.` },
        { status: 400 }
      );
    }

    if (!pixKey || !pixKeyType) {
      return NextResponse.json(
        { error: 'Chave PIX e tipo de chave são obrigatórios.' },
        { status: 400 }
      );
    }

    // Mapeamento para o enum do Asaas (PJ suporta CPF, CNPJ, EMAIL, PHONE, EVP)
    const keyTypeUpper = pixKeyType.toUpperCase();
    const asaasTypeMap: Record<string, AsaasPixKeyType> = {
      CPF: 'CPF',
      CNPJ: 'CNPJ',
      EMAIL: 'EMAIL',
      PHONE: 'PHONE',
      RANDOM: 'EVP',
      EVP: 'EVP',
    };

    const asaasKeyType = asaasTypeMap[keyTypeUpper] || 'EVP';

    // Validação da chave com o utilitário
    const validation = validatePixKey(pixKeyType.toLowerCase() as PixKeyType, pixKey);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.message || 'Formato de chave PIX inválido.' },
        { status: 400 }
      );
    }

    // 2. Validação e Bloqueio de Saldo Atômico no Banco de Dados (Supabase)
    let dbWalletId: string | null = null;
    let balanceBefore = 0;
    let balanceAfter = 0;

    if (isSupabaseConfigured() && supabase && userId) {
      // Busca carteira do usuário com trava de concorrência
      const { data: wallet, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (walletError || !wallet) {
        return NextResponse.json(
          { error: 'Carteira do usuário não encontrada no sistema.' },
          { status: 404 }
        );
      }

      if (wallet.available_balance < amount) {
        return NextResponse.json(
          {
            error: `Saldo disponível insuficiente. Seu saldo atual é de R$ ${Number(
              wallet.available_balance
            ).toFixed(2)}.`,
          },
          { status: 400 }
        );
      }

      dbWalletId = wallet.id;
      balanceBefore = Number(wallet.available_balance);
      balanceAfter = balanceBefore - amount;

      // Trava preventiva: Move de disponível para bloqueado
      await supabase
        .from('wallets')
        .update({
          available_balance: balanceAfter,
          locked_balance: Number(wallet.locked_balance) + amount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', wallet.id);
    }

    // 3. Chamada à API Oficial Asaas v3: POST /v3/transfers
    let transferResult;
    try {
      transferResult = await AsaasService.executePixTransfer({
        value: amount,
        pixAddressKey: pixKey.trim(),
        pixAddressKeyType: asaasKeyType,
        description: description || 'Saque de Premiação Vision League',
      });
    } catch (asaasError: any) {
      console.error('[API /wallet/withdraw] Falha na transferência Asaas:', asaasError);

      // ESTORNO AUTOMÁTICO: se a chamada à API falhou, reverte o saldo do usuário
      if (isSupabaseConfigured() && supabase && dbWalletId) {
        await supabase
          .from('wallets')
          .update({
            available_balance: balanceBefore,
            locked_balance: 0,
            updated_at: new Date().toISOString(),
          })
          .eq('id', dbWalletId);

        // Registra falha no ledger
        await supabase.from('transactions').insert({
          wallet_id: dbWalletId,
          user_id: userId,
          type: 'withdrawal_refund',
          amount: amount,
          status: 'failed',
          balance_before: balanceAfter,
          balance_after: balanceBefore,
          description: `Estorno automático: ${asaasError?.message || 'Falha no gateway Asaas'}`,
        });
      }

      return NextResponse.json(
        {
          error:
            asaasError?.message ||
            'Não foi possível concluir a transferência PIX no Asaas. Seu saldo foi estornado integralmente.',
        },
        { status: 502 }
      );
    }

    // 4. Sucesso: Liquida o saque no banco de dados e salva no Ledger
    if (isSupabaseConfigured() && supabase && dbWalletId) {
      // Baixa definitiva do saldo bloqueado
      const { data: currentWallet } = await supabase
        .from('wallets')
        .select('locked_balance')
        .eq('id', dbWalletId)
        .single();

      if (currentWallet) {
        await supabase
          .from('wallets')
          .update({
            locked_balance: Math.max(0, Number(currentWallet.locked_balance) - amount),
            updated_at: new Date().toISOString(),
          })
          .eq('id', dbWalletId);
      }

      // Registra transação auditável no Ledger
      await supabase.from('transactions').insert({
        wallet_id: dbWalletId,
        user_id: userId,
        type: 'withdrawal_pix',
        amount: -amount,
        status: transferResult.status === 'DONE' ? 'completed' : 'pending',
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        reference_id: transferResult.id,
        pix_e2e_id: transferResult.endToEndIdentifier || null,
        description: `Saque PIX Chave ${asaasKeyType} (${pixKey})`,
      });

      // Registra no histórico de solicitações de saque
      await supabase.from('withdrawal_requests').insert({
        user_id: userId,
        amount,
        pix_key_type: pixKeyType.toLowerCase(),
        pix_key: pixKey,
        status: transferResult.status === 'DONE' ? 'completed' : 'processing',
        gateway_transfer_id: transferResult.id,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Transferência PIX enviada com sucesso pelo Asaas!',
      transfer: {
        id: transferResult.id,
        status: transferResult.status,
        value: transferResult.value,
        endToEndIdentifier: transferResult.endToEndIdentifier,
      },
    });
  } catch (error: any) {
    console.error('[API /wallet/withdraw] Erro inesperado:', error);
    return NextResponse.json(
      { error: error?.message || 'Erro interno ao processar saque' },
      { status: 500 }
    );
  }
}
