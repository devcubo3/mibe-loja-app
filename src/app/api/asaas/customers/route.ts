import { NextRequest, NextResponse } from 'next/server';
import { validateAuth, AuthError } from '@/lib/auth-helpers';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { createCustomer } from '@/lib/asaas';

/**
 * POST /api/asaas/customers
 *
 * Cria um cliente no Asaas e vincula à empresa autenticada.
 * Se a empresa já possuir asaas_customer_id, retorna o existente.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await validateAuth(request);
    if (auth instanceof AuthError) return auth.toResponse();

    const { companyId } = auth;

    // Parse body
    const body = await request.json();
    const { name, cpfCnpj, email, phone, mobilePhone, externalReference } = body;

    // Validar campos obrigatórios
    if (!name || !cpfCnpj) {
      return NextResponse.json(
        { error: 'Nome e CPF/CNPJ são obrigatórios' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Verificar se empresa já tem asaas_customer_id (idempotência)
    const { data: company } = await supabase
      .from('companies')
      .select('id, asaas_customer_id')
      .eq('id', companyId)
      .single();

    if (company?.asaas_customer_id) {
      return NextResponse.json({
        customer: { id: company.asaas_customer_id },
        message: 'Cliente Asaas já existe para esta empresa',
      });
    }

    // Criar cliente no Asaas
    const result = await createCustomer({
      name,
      cpfCnpj,
      email,
      phone,
      mobilePhone,
      externalReference: externalReference || companyId,
      notificationDisabled: true,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 502 }
      );
    }

    // Salvar asaas_customer_id na empresa
    await supabase
      .from('companies')
      .update({ asaas_customer_id: result.customer.id })
      .eq('id', companyId);

    return NextResponse.json({ customer: result.customer });
  } catch (error) {
    console.error('Erro em /api/asaas/customers:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
