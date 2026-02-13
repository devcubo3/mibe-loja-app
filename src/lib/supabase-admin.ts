import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

let _supabaseAdmin: SupabaseClient<Database> | null = null;

// Cliente com service role key - usar APENAS em API routes (server-side)
// Bypassa RLS para operações administrativas
// Inicialização lazy para evitar erro durante build
export function getSupabaseAdmin(): SupabaseClient<Database> {
  if (!_supabaseAdmin) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    _supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceRoleKey);
  }
  return _supabaseAdmin;
}
