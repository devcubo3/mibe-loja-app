/**
 * Asaas Payment Gateway Client (Server-side only)
 * 
 * Cliente para comunicação com a API do Asaas.
 * Deve ser utilizado apenas em rotas API (server-side).
 */

const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
const ASAAS_BASE_URL = process.env.ASAAS_BASE_URL || 'https://sandbox.asaas.com/api/v3';

// Types
interface AsaasCustomer {
    id: string;
    name: string;
    email: string;
    cpfCnpj: string;
    phone?: string;
    mobilePhone?: string;
}

interface AsaasPayment {
    id: string;
    customer: string;
    value: number;
    netValue: number;
    billingType: 'BOLETO' | 'PIX' | 'CREDIT_CARD' | 'UNDEFINED';
    status: string;
    dueDate: string;
    invoiceUrl: string;
    invoiceNumber: string;
    externalReference?: string;
    description?: string;
}

interface AsaasPixQrCode {
    encodedImage: string;
    payload: string;
    expirationDate: string;
}

interface AsaasError {
    errors: Array<{
        code: string;
        description: string;
    }>;
}

type AsaasResponse<T> = T | AsaasError;

// Helper para verificar se é erro
function isAsaasError(response: any): response is AsaasError {
    return response && Array.isArray(response.errors);
}

// Headers padrão para todas as requisições
function getHeaders(): HeadersInit {
    if (!ASAAS_API_KEY) {
        throw new Error('ASAAS_API_KEY não configurada');
    }

    // Sanitização: garante que se começar com aact_ mas sem o prefixo $, ele seja adicionado
    let sanitizedKey = ASAAS_API_KEY;
    if (sanitizedKey.startsWith('aact_') && !sanitizedKey.startsWith('$')) {
        sanitizedKey = '$' + sanitizedKey;
    }

    return {
        'Content-Type': 'application/json',
        'access_token': sanitizedKey,
        'User-Agent': 'mibe-loja-app/1.0',
    };
}

/**
 * Busca cliente no Asaas por CNPJ ou CPF
 */
export async function findCustomerByCnpj(cnpj: string): Promise<AsaasCustomer | null> {
    // Remove caracteres não numéricos
    const cleanCnpj = cnpj.replace(/\D/g, '');

    const response = await fetch(
        `${ASAAS_BASE_URL}/customers?cpfCnpj=${cleanCnpj}`,
        {
            method: 'GET',
            headers: getHeaders(),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        console.error('Erro ao buscar cliente no Asaas:', data);
        return null;
    }

    // Retorna o primeiro cliente encontrado
    if (data.data && data.data.length > 0) {
        return data.data[0] as AsaasCustomer;
    }

    return null;
}

/**
 * Cria uma nova cobrança no Asaas
 */
export async function createPayment(params: {
    customerId: string;
    billingType: 'PIX' | 'CREDIT_CARD';
    value: number;
    description?: string;
    externalReference?: string;
    dueDate?: string;
    metadata?: Record<string, string>;
}): Promise<{ success: true; payment: AsaasPayment } | { success: false; error: string }> {
    // Data de vencimento: amanhã se não especificada
    const dueDate = params.dueDate || getNextBusinessDay();

    const body = {
        customer: params.customerId,
        billingType: params.billingType,
        value: params.value,
        dueDate,
        description: params.description,
        externalReference: params.externalReference,
        metadata: params.metadata,
    };

    try {
        const response = await fetch(`${ASAAS_BASE_URL}/payments`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(body),
        });

        const data: AsaasResponse<AsaasPayment> = await response.json();

        if (!response.ok || isAsaasError(data)) {
            const errorMessage = isAsaasError(data)
                ? data.errors.map(e => e.description).join(', ')
                : 'Erro desconhecido ao criar cobrança';
            console.error('Erro ao criar cobrança no Asaas:', data);
            return { success: false, error: errorMessage };
        }

        return { success: true, payment: data };
    } catch (error) {
        console.error('Erro de conexão com Asaas:', error);
        return { success: false, error: 'Erro ao comunicar com o sistema de pagamentos' };
    }
}

/**
 * Obtém o QR Code PIX de uma cobrança
 */
export async function getPixQrCode(paymentId: string): Promise<AsaasPixQrCode | null> {
    try {
        const response = await fetch(`${ASAAS_BASE_URL}/payments/${paymentId}/pixQrCode`, {
            method: 'GET',
            headers: getHeaders(),
        });

        if (!response.ok) {
            console.error('Erro ao obter QR Code PIX');
            return null;
        }

        const data = await response.json();
        return data as AsaasPixQrCode;
    } catch (error) {
        console.error('Erro ao obter QR Code:', error);
        return null;
    }
}

/**
 * Retorna a próxima data útil (formato YYYY-MM-DD)
 */
function getNextBusinessDay(): string {
    const date = new Date();
    date.setDate(date.getDate() + 1); // Amanhã

    // Se for sábado, pula para segunda
    if (date.getDay() === 6) {
        date.setDate(date.getDate() + 2);
    }
    // Se for domingo, pula para segunda
    else if (date.getDay() === 0) {
        date.setDate(date.getDate() + 1);
    }

    return date.toISOString().split('T')[0];
}
