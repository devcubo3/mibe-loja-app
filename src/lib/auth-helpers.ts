import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from './supabase-admin';

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export interface AuthResult {
  userId: string;
  companyId: string;
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
 * Valida o JWT do Supabase Auth e retorna userId + companyId.
 * Substitui o antigo padrão de decodificar token Base64 em cada route.
 *
 * Uso:
 *   const auth = await validateAuth(request);
 *   if (auth instanceof AuthError) return auth.toResponse();
 *   const { userId, companyId } = auth;
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

  // Validar JWT via Supabase Auth
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return new AuthError('Token inválido ou expirado', 401);
  }

  // Buscar empresa vinculada ao owner
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  if (companyError || !company) {
    return new AuthError('Empresa não encontrada para este usuário', 404);
  }

  // Create an authenticated client scoped to this request
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
    companyId: company.id,
    supabase: authClient,
  };
}
