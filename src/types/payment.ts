/**
 * Tipos para o sistema de pagamentos
 */

// Métodos de pagamento suportados
export type PaymentMethod = 'PIX' | 'CREDIT_CARD';

// Etapas do modal de pagamento (máquina de estados)
export type PaymentStep =
    | 'select-method'    // Escolha do método (PIX ou Cartão)
    | 'processing'       // Gerando cobrança
    | 'pix-display'      // Exibindo QR Code PIX
    | 'redirect-card'    // Redirecionando para checkout
    | 'error';           // Erro

// Dados do PIX para exibição
export interface PixData {
    qrCodeImage: string;  // Base64 da imagem
    qrCodeText: string;   // Texto copia e cola
    expirationDate: string;
}

// Request para criar pagamento
export interface CreatePaymentRequest {
    plan_id: string;
    billing_type: PaymentMethod;
}

// Response da criação de pagamento
export interface CreatePaymentResponse {
    payment_id: string;
    status: string;
    invoice_url: string;
    value: number;
    pix?: PixData;
}

// Response de erro
export interface PaymentErrorResponse {
    error: string;
    code?: string;
}
