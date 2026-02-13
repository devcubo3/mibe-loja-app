import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar usuário pelo email
    const { data: companyUser, error: userError } = await supabase
      .from('company_users')
      .select(`
        id,
        company_id,
        name,
        email,
        password_hash,
        is_active,
        onboarding_completed,
        created_at,
        updated_at
      `)
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (userError || !companyUser) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, companyUser.password_hash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Buscar dados da empresa
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select(`
        id,
        business_name,
        cnpj,
        email,
        description,
        logo_url,
        cover_url,
        status,
        cashback_percent,
        min_purchase_value,
        has_expiration,
        expiration_days,
        category_id,
        created_at
      `)
      .eq('id', companyUser.company_id)
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    // Buscar categoria da empresa
    let categoryName = 'Outros';
    if (company.category_id) {
      const { data: category } = await supabase
        .from('categories')
        .select('name')
        .eq('id', company.category_id)
        .single();

      if (category) {
        categoryName = category.name;
      }
    }

    // Buscar fotos da galeria
    const { data: gallery } = await supabase
      .from('company_gallery')
      .select('photo_url')
      .eq('company_id', company.id);

    // Buscar média de avaliações
    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('rating')
      .eq('company_id', company.id);

    const totalReviews = reviewsData?.length || 0;
    const avgRating = totalReviews > 0
      ? reviewsData!.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews
      : 0;

    // Gerar token simples (em produção, usar JWT)
    const sessionToken = Buffer.from(
      JSON.stringify({
        userId: companyUser.id,
        companyId: companyUser.company_id,
        exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 dias
      })
    ).toString('base64');

    // Retornar dados do usuário e empresa (sem o password_hash)
    return NextResponse.json({
      success: true,
      token: sessionToken,
      user: {
        id: companyUser.id,
        name: companyUser.name,
        email: companyUser.email,
        company_id: companyUser.company_id,
        onboarding_completed: companyUser.onboarding_completed || false,
        created_at: companyUser.created_at,
        updated_at: companyUser.updated_at,
      },
      company: {
        id: company.id,
        business_name: company.business_name,
        cnpj: company.cnpj,
        email: company.email,
        description: company.description,
        logo_url: company.logo_url,
        cover_url: company.cover_url,
        status: company.status,
        cashback_percent: company.cashback_percent || 0,
        min_purchase_value: company.min_purchase_value || 0,
        has_expiration: company.has_expiration || false,
        expiration_days: company.expiration_days || 30,
        category: categoryName,
        photos: gallery?.map(g => g.photo_url) || [],
        rating: Math.round(avgRating * 10) / 10,
        total_reviews: totalReviews,
        created_at: company.created_at,
      },
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
