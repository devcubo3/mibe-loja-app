import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from './supabase-admin';

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type { CompanyRole } from '@/types/auth';

export interface AuthResult {
  userId: string;
  companyId: string;
  role: CompanyRole;
  supabase: ReturnType<typeof createClient<Database>>;
}

export class AuthError {
  constructor(
    public message: string,
    public status: number
  ) { }

  toResponse() {
    return NextResponse.json({ error: this.message }, { status: this.status });
  }
}

/**
 * Valida o JWT do Supabase Auth e retorna userId, companyId e role.
 * Owner: company_id resolvido via companies.owner_id.
 * Staff: company_id está em profiles.company_id.
 */
export async function validateAuth(
  request: NextRequest
): Promise<AuthResult | AuthError> {
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new AuthError('Não autorizado', 401);
  }

  const token = authHeader.replace('Bearer ', '');
  const supabase = getSupabaseAdmin();

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return new AuthError('Token inválido ou expirado', 401);
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, company_id, is_active')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return new AuthError('Perfil não encontrado', 404);
  }

  if (profile.role !== 'company_owner' && profile.role !== 'company_staff') {
    return new AuthError('Acesso negado', 403);
  }

  if (!profile.is_active) {
    return new AuthError('Usuário desativado', 403);
  }

  let companyId: string | null = null;
  if (profile.role === 'company_owner') {
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('owner_id', user.id)
      .single();
    companyId = company?.id ?? null;
  } else {
    companyId = profile.company_id;
  }

  if (!companyId) {
    return new AuthError('Empresa não encontrada para este usuário', 404);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const authClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });

  return {
    userId: user.id,
    companyId,
    role: profile.role as CompanyRole,
    supabase: authClient,
  };
}

/**
 * Garante que o usuário autenticado é o owner da empresa.
 * Use em rotas que apenas o dono pode chamar (editar empresa, gerenciar staff, etc.).
 */
export function requireOwner(auth: AuthResult): AuthError | null {
  if (auth.role !== 'company_owner') {
    return new AuthError('Apenas o proprietário da loja pode realizar essa ação', 403);
  }
  return null;
}
