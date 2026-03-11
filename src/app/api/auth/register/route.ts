import { NextRequest, NextResponse } from 'next/server';
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

    // Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email.trim().toLowerCase(),
      password: user.password,
      email_confirm: true,
      user_metadata: {
        full_name: user.name.trim(),
      },
    });

    if (authError || !authData.user) {
      console.error('Erro ao criar usuário no auth:', authError);
      // Verificar se é email duplicado
      if (authError?.message?.includes('already been registered') || authError?.message?.includes('duplicate')) {
        return NextResponse.json(
          { error: 'Já existe uma conta com este e-mail' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: 'Erro ao criar conta. Tente novamente.' },
        { status: 500 }
      );
    }

    const userId = authData.user.id;

    // Criar profile com role company_owner
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        full_name: user.name.trim(),
        cpf: null,
        role: 'company_owner',
        onboarding_completed: false,
      });

    if (profileError) {
      console.error('Erro ao criar profile:', profileError);
      await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: 'Erro ao criar conta. Tente novamente.' },
        { status: 500 }
      );
    }

    // Criar a empresa com owner_id
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
        owner_id: userId,
      })
      .select('id')
      .single();

    if (companyError || !newCompany) {
      console.error('Erro ao criar empresa:', companyError);
      // Rollback
      await supabase.from('profiles').delete().eq('id', userId);
      await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: 'Erro ao criar empresa. Tente novamente.' },
        { status: 500 }
      );
    }

    // Fazer login para obter session tokens
    const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
      email: user.email.trim().toLowerCase(),
      password: user.password,
    });

    if (sessionError || !sessionData.session) {
      console.error('Erro ao criar sessão após registro:', sessionError);
      return NextResponse.json(
        { error: 'Conta criada, mas erro ao fazer login. Tente fazer login manualmente.' },
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

    return NextResponse.json({
      success: true,
      token: sessionData.session.access_token,
      refresh_token: sessionData.session.refresh_token,
      user: {
        id: userId,
        name: user.name.trim(),
        email: user.email.trim().toLowerCase(),
        company_id: newCompany.id,
        onboarding_completed: false,
        created_at: new Date().toISOString(),
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
        address: null,
        latitude: null,
        longitude: null,
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
