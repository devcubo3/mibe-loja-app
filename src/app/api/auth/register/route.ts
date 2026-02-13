import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const { company, user } = await request.json();

    // Validar dados da empresa
    if (!company?.business_name) {
      return NextResponse.json(
        { error: 'Nome da empresa é obrigatório' },
        { status: 400 }
      );
    }

    if (!company?.cnpj) {
      return NextResponse.json(
        { error: 'CNPJ é obrigatório' },
        { status: 400 }
      );
    }

    // Validar dados do usuário
    if (!user?.name || !user?.email || !user?.password) {
      return NextResponse.json(
        { error: 'Nome, e-mail e senha são obrigatórios' },
        { status: 400 }
      );
    }

    if (user.password.length < 8) {
      return NextResponse.json(
        { error: 'Senha deve ter no mínimo 8 caracteres' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Verificar se já existe usuário com esse email
    const { data: existingUser } = await supabase
      .from('company_users')
      .select('id')
      .eq('email', user.email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Já existe uma conta com este e-mail' },
        { status: 409 }
      );
    }

    // Verificar se já existe empresa com esse CNPJ
    const cnpjClean = company.cnpj.replace(/\D/g, '');
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('id')
      .eq('cnpj', cnpjClean)
      .single();

    if (existingCompany) {
      return NextResponse.json(
        { error: 'Já existe uma empresa cadastrada com este CNPJ' },
        { status: 409 }
      );
    }

    // Criar a empresa
    const { data: newCompany, error: companyError } = await supabase
      .from('companies')
      .insert({
        business_name: company.business_name.trim(),
        cnpj: cnpjClean,
        email: user.email.trim().toLowerCase(),
        category_id: company.category_id || null,
        status: 'pending',
        cashback_percent: 0,
        min_purchase_value: 0,
        has_expiration: false,
        expiration_days: 30,
      })
      .select('id')
      .single();

    if (companyError || !newCompany) {
      console.error('Erro ao criar empresa:', companyError);
      return NextResponse.json(
        { error: 'Erro ao criar empresa. Tente novamente.' },
        { status: 500 }
      );
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(user.password, 10);

    // Criar o usuário vinculado à empresa
    const { data: newUser, error: userError } = await supabase
      .from('company_users')
      .insert({
        company_id: newCompany.id,
        name: user.name.trim(),
        email: user.email.trim().toLowerCase(),
        password_hash: passwordHash,
        is_active: true,
      })
      .select('id, name, email, company_id, created_at, updated_at')
      .single();

    if (userError || !newUser) {
      console.error('Erro ao criar usuário:', userError);
      // Rollback: remover empresa criada
      await supabase.from('companies').delete().eq('id', newCompany.id);
      return NextResponse.json(
        { error: 'Erro ao criar conta. Tente novamente.' },
        { status: 500 }
      );
    }

    // Buscar categoria
    let categoryName = 'Outros';
    if (company.category_id) {
      const { data: category } = await supabase
        .from('categories')
        .select('name')
        .eq('id', company.category_id)
        .single();
      if (category) categoryName = category.name;
    }

    // Gerar token
    const sessionToken = Buffer.from(
      JSON.stringify({
        userId: newUser.id,
        companyId: newCompany.id,
        exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 dias
      })
    ).toString('base64');

    return NextResponse.json({
      success: true,
      token: sessionToken,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        company_id: newUser.company_id,
        onboarding_completed: false,
        created_at: newUser.created_at,
        updated_at: newUser.updated_at,
      },
      company: {
        id: newCompany.id,
        business_name: company.business_name.trim(),
        cnpj: cnpjClean,
        email: user.email.trim().toLowerCase(),
        description: null,
        logo_url: null,
        cover_url: null,
        status: 'pending',
        cashback_percent: 0,
        min_purchase_value: 0,
        has_expiration: false,
        expiration_days: 30,
        category: categoryName,
        photos: [],
        rating: 0,
        total_reviews: 0,
        created_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
