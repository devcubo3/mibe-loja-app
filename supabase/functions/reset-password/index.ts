import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sha256(message: string): Promise<string> {
  const data = new TextEncoder().encode(message);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return toHex(hash);
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { token, new_password } = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Token é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!new_password || new_password.length < 8) {
      return new Response(
        JSON.stringify({ error: "Nova senha deve ter no mínimo 8 caracteres" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Calcular hash do token recebido
    const tokenHash = await sha256(token);

    // Buscar token válido (todos são type "profile" agora)
    const { data: resetToken, error: tokenError } = await supabase
      .from("password_reset_tokens")
      .select("id, user_id, expires_at")
      .eq("token_hash", tokenHash)
      .is("used_at", null)
      .single();

    if (tokenError || !resetToken) {
      return new Response(
        JSON.stringify({ error: "Link inválido ou expirado" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verificar expiração
    if (new Date(resetToken.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "Link expirado. Solicite um novo link de redefinição." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Atualizar senha via Supabase Auth (unificado, sem bcrypt)
    const { error: authError } = await supabase.auth.admin.updateUserById(
      resetToken.user_id,
      { password: new_password }
    );

    if (authError) {
      console.error("Erro ao atualizar senha:", authError);
      return new Response(
        JSON.stringify({ error: "Erro ao atualizar senha" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Marcar token como usado
    await supabase
      .from("password_reset_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("id", resetToken.id);

    return new Response(
      JSON.stringify({ success: true, message: "Senha redefinida com sucesso" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erro ao redefinir senha:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
