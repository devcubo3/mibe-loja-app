import { NextRequest, NextResponse } from 'next/server';
import { validateAuth, AuthError } from '@/lib/auth-helpers';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { createPayment, getPixQrCode, findCustomerByCnpj } from '@/lib/asaas';
import type { CreatePaymentRequest, CreatePaymentResponse } from '@/types/payment';

/**
 * POST /api/payment/create
 *
 * Cria uma cobrança no Asaas para pagamento de plano.
 * Suporta PIX (retorna QR Code) e Cartão (retorna URL de checkout).
 */
export async function POST(request: NextRequest) {
    try {
        const auth = await validateAuth(request);
        if (auth instanceof AuthError) return auth.toResponse();

        const { companyId } = auth;
        const supabaseAdmin = getSupabaseAdmin();

        // Parse body
        const body: CreatePaymentRequest = await request.json();
        const { plan_id, billing_type } = body;

        if (!plan_id) {
            return NextResponse.json({ error: 'ID do plano é obrigatório' }, { status: 400 });
        }

        if (!billing_type || !['PIX', 'CREDIT_CARD'].includes(billing_type)) {
            return NextResponse.json({ error: 'Método de pagamento inválido' }, { status: 400 });
        }

        // Buscar plano
        const { data: plan, error: planError } = await supabaseAdmin
            .from('plans')
            .select('*')
            .eq('id', plan_id)
            .eq('is_active', true)
            .single();

        if (planError || !plan) {
            return NextResponse.json(
                { error: 'Plano não encontrado ou inativo' },
                { status: 404 }
            );
        }

        // Buscar empresa
        const { data: company, error: companyError } = await supabaseAdmin
            .from('companies')
            .select('id, business_name, cnpj, asaas_customer_id')
            .eq('id', companyId)
            .single();

        if (companyError || !company) {
            return NextResponse.json(
                { error: 'Empresa não encontrada' },
                { status: 404 }
            );
        }

        // Resolver asaas_customer_id
        let asaasCustomerId = company.asaas_customer_id;

        if (!asaasCustomerId) {
            if (!company.cnpj) {
                return NextResponse.json(
                    { error: 'CNPJ da empresa não cadastrado. Entre em contato com o suporte.' },
                    { status: 400 }
                );
            }

            const asaasCustomer = await findCustomerByCnpj(company.cnpj);

            if (!asaasCustomer) {
                return NextResponse.json(
                    { error: 'Empresa não cadastrada no sistema de pagamentos. Entre em contato com o suporte.' },
                    { status: 400 }
                );
            }

            asaasCustomerId = asaasCustomer.id;
            await supabaseAdmin
                .from('companies')
                .update({ asaas_customer_id: asaasCustomerId })
                .eq('id', companyId);
        }

        // Criar cobrança no Asaas
        const paymentResult = await createPayment({
            customerId: asaasCustomerId,
            billingType: billing_type,
            value: Number(plan.monthly_price),
            description: `Assinatura do plano ${plan.name}`,
            externalReference: `company_${companyId}_plan_${plan_id}`,
            metadata: {
                plan_id,
                company_id: companyId,
            },
        });

        if (!paymentResult.success) {
            console.error('Erro Asaas:', paymentResult.error);
            return NextResponse.json(
                { error: 'Erro ao comunicar com o sistema de pagamentos. Tente novamente.' },
                { status: 502 }
            );
        }

        const payment = paymentResult.payment;

        // Montar resposta
        const response: CreatePaymentResponse = {
            payment_id: payment.id,
            status: payment.status,
            invoice_url: payment.invoiceUrl,
            value: payment.value,
        };

        // Se for PIX, buscar QR Code
        if (billing_type === 'PIX') {
            const pixData = await getPixQrCode(payment.id);

            if (pixData) {
                response.pix = {
                    qrCodeImage: pixData.encodedImage,
                    qrCodeText: pixData.payload,
                    expirationDate: pixData.expirationDate,
                };
            }
        }

        return NextResponse.json(response);
    } catch (error) {
        console.error('Erro interno:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
