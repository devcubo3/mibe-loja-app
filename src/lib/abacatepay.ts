/**
 * AbacatePay Payment Gateway Client (Server-side only)
 *
 * Cliente para comunicação com a API do AbacatePay.
 * Deve ser utilizado apenas em rotas API (server-side).
 *
 * Docs: https://docs.abacatepay.com
 * Base URL: https://api.abacatepay.com/v1
 */

const ABACATEPAY_API_KEY = process.env.ABACATEPAY_API_KEY;
const ABACATEPAY_BASE_URL = 'https://api.abacatepay.com/v1';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AbacatePayStatus = 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED' | 'REFUNDED';

export interface AbacatePixQrCode {
    id: string;
    amount: number;
    status: AbacatePayStatus;
    brCode: string;       // código copia e cola
    brCodeBase64: string; // imagem QR em Base64
    platformFee: number;
    devMode: boolean;
    createdAt: string;
    updatedAt: string;
    expiresAt: string;
}

export interface AbacateBilling {
    id: string;
    url: string;          // URL do checkout
    status: AbacatePayStatus;
    devMode: boolean;
    methods: string[];
    products: AbacateBillingProduct[];
    frequency: string;
    customer?: AbacateCustomer;
    allowCoupons: boolean;
    coupons: string[];
}

export interface AbacateBillingProduct {
    externalId: string;
    name: string;
    quantity: number;
    price: number;
    description?: string;
}

export interface AbacateCustomer {
    id: string;
    metadata: {
        name: string;
        cellphone: string;
        email: string;
        taxId: string;
    };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getHeaders(): HeadersInit {
    if (!ABACATEPAY_API_KEY) {
        throw new Error('ABACATEPAY_API_KEY não configurada');
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ABACATEPAY_API_KEY}`,
    };
}

// ─── PIX QR Code ──────────────────────────────────────────────────────────────

/**
 * Cria um QR Code PIX para cobrança.
 * Retorna brCode (copia-e-cola) e brCodeBase64 (imagem) em uma única chamada.
 *
 * @param amount - Valor em centavos (ex: R$100,00 = 10000)
 */
export async function createPixQrCode(params: {
    amount: number;       // centavos
    expiresIn?: number;   // segundos (ex: 3600 = 1h)
    description?: string; // max 37 chars
    customer?: {
        name: string;
        cellphone: string;
        email: string;
        taxId: string; // CPF ou CNPJ
    };
    metadata?: Record<string, string>;
}): Promise<{ success: true; data: AbacatePixQrCode } | { success: false; error: string }> {
    try {
        const response = await fetch(`${ABACATEPAY_BASE_URL}/pixQrCode/create`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(params),
        });

        const json = await response.json();

        if (!response.ok || json.error) {
            console.error('Erro AbacatePay (createPixQrCode):', json);
            return { success: false, error: json.error || 'Erro ao criar QR Code PIX' };
        }

        return { success: true, data: json.data };
    } catch (error) {
        console.error('Erro de conexão com AbacatePay (createPixQrCode):', error);
        return { success: false, error: 'Erro ao comunicar com o gateway de pagamentos' };
    }
}

/**
 * Verifica o status de um QR Code PIX.
 */
export async function checkPixStatus(
    id: string
): Promise<{ status: AbacatePayStatus; expiresAt: string } | null> {
    try {
        const response = await fetch(
            `${ABACATEPAY_BASE_URL}/pixQrCode/check?id=${encodeURIComponent(id)}`,
            { method: 'GET', headers: getHeaders() }
        );

        if (!response.ok) return null;

        const json = await response.json();
        return json.data ?? null;
    } catch (error) {
        console.error('Erro ao checar status PIX:', error);
        return null;
    }
}

// ─── Billing Checkout (Cartão) ────────────────────────────────────────────────

/**
 * Cria um checkout de cobrança com cartão de crédito.
 * Retorna uma URL para redirecionar o cliente.
 *
 * @param amount - Valor em centavos (ex: R$100,00 = 10000)
 */
export async function createCardCheckout(params: {
    amount: number;         // centavos
    description?: string;
    externalId?: string;    // referência interna
    returnUrl?: string;     // URL se cliente clicar em voltar
    completionUrl?: string; // URL após pagamento confirmado
    customer?: {
        name: string;
        cellphone: string;
        email: string;
        taxId: string;
    };
    metadata?: Record<string, string>;
}): Promise<{ success: true; data: AbacateBilling } | { success: false; error: string }> {
    try {
        const body = {
            frequency: 'ONE_TIME',
            methods: ['CARD'],
            products: [
                {
                    externalId: params.externalId || 'invoice',
                    name: params.description || 'Fatura MIBE',
                    quantity: 1,
                    price: params.amount,
                },
            ],
            returnUrl: params.returnUrl,
            completionUrl: params.completionUrl,
            customer: params.customer,
            metadata: params.metadata,
        };

        const response = await fetch(`${ABACATEPAY_BASE_URL}/billing/create`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(body),
        });

        const json = await response.json();

        if (!response.ok || json.error) {
            console.error('Erro AbacatePay (createCardCheckout):', json);
            return { success: false, error: json.error || 'Erro ao criar checkout' };
        }

        return { success: true, data: json.data };
    } catch (error) {
        console.error('Erro de conexão com AbacatePay (createCardCheckout):', error);
        return { success: false, error: 'Erro ao comunicar com o gateway de pagamentos' };
    }
}
