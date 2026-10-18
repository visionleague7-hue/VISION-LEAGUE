/**
 * =========================================================================
 * VISION LEAGUE - CLIENTE OFICIAL ASAAS API V3 (PESSOA JURÍDICA / CNPJ)
 * =========================================================================
 * 
 * Documentação Oficial Asaas: https://docs.asaas.com
 * Suporte a Sandbox e Produção, Pay-In PIX dinâmico, Pay-Out PJ e Webhooks.
 */

export interface AsaasCustomer {
  id: string;
  name: string;
  cpfCnpj: string;
  email?: string;
  phone?: string;
  mobilePhone?: string;
}

export interface AsaasPaymentInput {
  customerName: string;
  customerCpf?: string;
  customerCpfCnpj?: string;
  customerEmail?: string;
  customerPhone?: string;
  value: number;
  description: string;
  dueDate?: string; // YYYY-MM-DD
  externalReference?: string; // ID interno de inscrição ou carteira
}

export interface AsaasPaymentResponse {
  id: string;
  customer: string;
  value: number;
  netValue: number;
  billingType: string;
  status: string;
  dueDate: string;
  invoiceUrl: string;
  externalReference?: string;
}

export interface AsaasPixQrCodeResponse {
  success: boolean;
  encodedImage: string; // Base64 da imagem do QR Code
  payload: string;      // Código Copia e Cola padrão Banco Central
  expirationDate: string;
}

export type AsaasPixKeyType = 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'EVP';

export interface AsaasTransferInput {
  value: number;
  pixAddressKey: string;
  pixAddressKeyType: AsaasPixKeyType;
  description?: string;
  scheduleDate?: string;
}

export interface AsaasTransferResponse {
  id: string;
  status: 'PENDING' | 'BANK_PROCESSING' | 'DONE' | 'CANCELLED' | 'FAILED';
  value: number;
  netValue: number;
  transferFee: number;
  effectiveDate?: string;
  endToEndIdentifier?: string;
  failReason?: string;
  authorized: boolean;
}

export interface AsaasWebhookEvent {
  event: 
    | 'PAYMENT_CREATED'
    | 'PAYMENT_RECEIVED'
    | 'PAYMENT_CONFIRMED'
    | 'PAYMENT_OVERDUE'
    | 'TRANSFER_DONE'
    | 'TRANSFER_FAILED'
    | 'TRANSFER_CANCELLED';
  payment?: {
    id: string;
    customer: string;
    value: number;
    netValue: number;
    billingType: string;
    status: string;
    externalReference?: string;
    paymentDate?: string;
    clientPaymentDate?: string;
    pixTransaction?: {
      endToEndIdentifier: string;
    };
  };
  transfer?: {
    id: string;
    value: number;
    status: string;
    failReason?: string;
    endToEndIdentifier?: string;
  };
}

export class AsaasService {
  private static apiKey = process.env.ASAAS_API_KEY || '';
  private static environment = process.env.ASAAS_ENVIRONMENT || 'sandbox';
  private static webhookSecret = process.env.ASAAS_WEBHOOK_SECRET || 'vision_webhook_secret_2026';

  private static getApiKey(): string {
    return (process.env.ASAAS_API_KEY || this.apiKey || '').trim();
  }

  /**
   * Retorna a URL base de acordo com o ambiente configurado ou chave
   * Se a chave começar com $aact_prod_, roteia automaticamente para a API oficial de produção.
   */
  public static getBaseUrl(): string {
    const key = this.getApiKey();
    const env = (process.env.ASAAS_ENVIRONMENT || this.environment || 'sandbox').trim().toLowerCase();

    if (key.includes('_prod_') || env === 'production') {
      return 'https://www.asaas.com/api/v3';
    }
    return 'https://sandbox.asaas.com/api/v3';
  }

  /**
   * Headers padrão exigidos pelo Asaas v3
   */
  private static getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      access_token: this.getApiKey(),
      'User-Agent': 'VisionLeague-Platform/1.0',
    };
  }

  /**
   * Verifica se as credenciais reais do Asaas estão configuradas
   */
  public static isConfigured(): boolean {
    const key = this.getApiKey();
    return Boolean(key && !key.startsWith('mock_'));
  }

  /**
   * 1. CLIENTE: Busca por CPF ou CNPJ ou cadastra novo cliente no Asaas
   * Evita duplicidade de clientes para o mesmo documento.
   */
  public static async getOrCreateCustomer(params: {
    name: string;
    cpf?: string;
    cpfCnpj?: string;
    email?: string;
    phone?: string;
  }): Promise<string> {
    const rawDoc = params.cpfCnpj || params.cpf || '';
    const cleanDoc = rawDoc.replace(/\D/g, '');

    // Se estiver em modo real com chave do Asaas
    if (this.isConfigured()) {
      try {
        // Busca cliente existente pelo CPF ou CNPJ
        const searchRes = await fetch(
          `${this.getBaseUrl()}/customers?cpfCnpj=${cleanDoc}`,
          { headers: this.getHeaders() }
        );

        if (searchRes.ok) {
          const searchData = await searchRes.json();
          if (searchData.data && searchData.data.length > 0) {
            return searchData.data[0].id; // Retorna ID existente
          }
        }

        // Se não existir, cadastra novo cliente
        const createRes = await fetch(`${this.getBaseUrl()}/customers`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({
            name: params.name,
            cpfCnpj: cleanDoc,
            email: params.email || 'jogador@visionleague.gg',
            mobilePhone: params.phone?.replace(/\D/g, '') || undefined,
          }),
        });

        if (!createRes.ok) {
          const errData = await createRes.json();
          throw new Error(
            errData.errors?.[0]?.description || 'Erro ao cadastrar cliente no Asaas'
          );
        }

        const newCustomer = await createRes.json();
        return newCustomer.id;
      } catch (err: any) {
        console.error('[AsaasService] Erro ao obter/criar cliente:', err);
        throw err;
      }
    }

    // Modo Sandbox Mock local para testes imediatos sem internet/chave
    return `cus_mock_${cleanDoc.substring(0, 6) || 'generic'}`;
  }

  /**
   * 2. COBRANÇA PIX (PAY-IN): Cria cobrança no Asaas (POST /v3/payments)
   */
  public static async createPixPayment(
    input: AsaasPaymentInput
  ): Promise<{ payment: AsaasPaymentResponse; qrCode: AsaasPixQrCodeResponse }> {
    const doc = input.customerCpfCnpj || input.customerCpf || '';
    const customerId = await this.getOrCreateCustomer({
      name: input.customerName,
      cpfCnpj: doc,
      email: input.customerEmail,
      phone: input.customerPhone,
    });

    // Vencimento padrão: hoje + 1 dia
    const defaultDueDate = new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const paymentPayload = {
      customer: customerId,
      billingType: 'PIX',
      value: input.value,
      dueDate: input.dueDate || defaultDueDate,
      description: input.description,
      externalReference: input.externalReference,
      postalService: false,
    };

    if (this.isConfigured()) {
      // 1. Cria cobrança
      const res = await fetch(`${this.getBaseUrl()}/payments`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(paymentPayload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.errors?.[0]?.description || 'Falha ao criar cobrança PIX no Asaas'
        );
      }

      const payment: AsaasPaymentResponse = await res.json();

      // 2. Busca QR Code Pix da cobrança gerada
      const qrRes = await fetch(`${this.getBaseUrl()}/payments/${payment.id}/pixQrCode`, {
        headers: this.getHeaders(),
      });

      if (!qrRes.ok) {
        const qrErr = await qrRes.json();
        throw new Error(
          qrErr.errors?.[0]?.description || 'Falha ao gerar QR Code PIX no Asaas'
        );
      }

      const qrCode: AsaasPixQrCodeResponse = await qrRes.json();

      return { payment, qrCode };
    }

    // Modo Mock Fallback para desenvolvimento
    const mockPaymentId = `pay_mock_${Date.now()}`;
    const mockTxid = `VIS${Date.now()}`;
    const mockCopiaECola = `00020101021226580014br.gov.bcb.pix0136${mockTxid}520400005303986540${input.value.toFixed(
      2
    )}5802BR5915VISION LEAGUE6009SAO PAULO62070503***6304B71A`;

    return {
      payment: {
        id: mockPaymentId,
        customer: customerId,
        value: input.value,
        netValue: input.value,
        billingType: 'PIX',
        status: 'PENDING',
        dueDate: input.dueDate || defaultDueDate,
        invoiceUrl: `https://sandbox.asaas.com/i/${mockPaymentId}`,
        externalReference: input.externalReference,
      },
      qrCode: {
        success: true,
        encodedImage: '', // Front-end gera via QRCodeSVG caso Base64 venha vazio
        payload: mockCopiaECola,
        expirationDate: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      },
    };
  }

  /**
   * 3. BUSCA QR CODE PIX ESPECÍFICO (GET /v3/payments/{id}/pixQrCode)
   */
  public static async getPixQrCode(paymentId: string): Promise<AsaasPixQrCodeResponse> {
    if (this.isConfigured()) {
      const res = await fetch(`${this.getBaseUrl()}/payments/${paymentId}/pixQrCode`, {
        headers: this.getHeaders(),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.errors?.[0]?.description || 'Erro ao buscar QR Code PIX');
      }

      return await res.json();
    }

    return {
      success: true,
      encodedImage: '',
      payload: `00020101021226580014br.gov.bcb.pix0136${paymentId}5204000053039865802BR5915VISION LEAGUE6009SAO PAULO6304A1B2`,
      expirationDate: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    };
  }

  /**
   * 4. SAQUE / PREMIAÇÃO (PAY-OUT VIA PIX): Transfere valor para chave PIX do jogador
   * POST /v3/transfers
   */
  public static async executePixTransfer(
    input: AsaasTransferInput
  ): Promise<AsaasTransferResponse> {
    const payload = {
      value: input.value,
      operationType: 'PIX',
      pixAddressKey: input.pixAddressKey.trim(),
      pixAddressKeyType: input.pixAddressKeyType,
      description: input.description || 'Premiação / Saque Vision League',
      scheduleDate: input.scheduleDate || undefined,
    };

    if (this.isConfigured()) {
      const res = await fetch(`${this.getBaseUrl()}/transfers`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorDesc = data.errors?.[0]?.description || 'Erro ao executar transferência PIX no Asaas';
        throw new Error(errorDesc);
      }

      return data as AsaasTransferResponse;
    }

    // Modo Mock Fallback (Simulação de sucesso para testes de fluxo contábil)
    const mockTransferId = `trf_mock_${Date.now()}`;
    const mockE2e = `E90400888${Date.now()}B17A609001`;

    return {
      id: mockTransferId,
      status: 'DONE',
      value: input.value,
      netValue: input.value,
      transferFee: 0.0,
      effectiveDate: new Date().toISOString(),
      endToEndIdentifier: mockE2e,
      authorized: true,
    };
  }

  /**
   * 5. VALIDAÇÃO DE SEGURANÇA DO WEBHOOK
   */
  public static verifyWebhookToken(receivedToken?: string | null): boolean {
    const secret = (process.env.ASAAS_WEBHOOK_SECRET || this.webhookSecret || '').trim();
    if (!secret) return true;
    return (receivedToken || '').trim() === secret;
  }
}
