import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Usar client separado com anon key para não corromper o singleton admin compartilhado.
    const authClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: authData, error: authError } = await authClient.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.session) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    const userId = authData.user.id;
    const supabase = getSupabaseAdmin();

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, role, company_id, is_active, onboarding_completed, created_at')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Perfil não encontrado' },
        { status: 404 }
      );
    }

    if (profile.role !== 'company_owner' && profile.role !== 'company_staff') {
      return NextResponse.json(
        { error: 'Este login é exclusivo para lojistas e funcionários' },
        { status: 403 }
      );
    }

    if (!profile.is_active) {
      return NextResponse.json(
        { error: 'Usuário desativado. Entre em contato com o lojista.' },
        { status: 403 }
      );
    }

    let companyId: string | null = null;
    if (profile.role === 'company_owner') {
      const { data: ownedCompany } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', userId)
        .single();
      companyId = ownedCompany?.id ?? null;
    } else {
      companyId = profile.company_id;
    }

    if (!companyId) {
      return NextResponse.json(
        { error: 'Empresa não vinculada a este usuário' },
        { status: 404 }
      );
    }

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
        created_at,
        address,
        latitude,
        longitude
      `)
      .eq('id', companyId)
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

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

    const { data: gallery } = await supabase
      .from('company_gallery')
      .select('photo_url')
      .eq('company_id', company.id);

    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('rating')
      .eq('company_id', company.id);

    const totalReviews = reviewsData?.length || 0;
    const avgRating = totalReviews > 0
      ? reviewsData!.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews
      : 0;

    return NextResponse.json({
      success: true,
      token: authData.session.access_token,
      refresh_token: authData.session.refresh_token,
      user: {
        id: profile.id,
        name: profile.full_name,
        email: authData.user.email,
        company_id: company.id,
        role: profile.role,
        onboarding_completed: profile.onboarding_completed || false,
        created_at: profile.created_at,
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
        address: company.address || null,
        latitude: company.latitude || null,
        longitude: company.longitude || null,
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
