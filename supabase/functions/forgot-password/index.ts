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

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return toHex(bytes.buffer);
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "E-mail é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const normalizedEmail = email.toLowerCase().trim();
    let userId: string | null = null;
    let userEmail = normalizedEmail;

    // Todos os usuários agora estão em auth.users (unificado)
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const authUser = users?.find(
      (u: { email?: string }) => u.email?.toLowerCase() === normalizedEmail
    );

    if (authUser) {
      userId = authUser.id;
      userEmail = authUser.email || normalizedEmail;
    }

    // Sempre retorna sucesso (não revela se email existe)
    if (!userId) {
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Invalidar tokens anteriores
    await supabase
      .from("password_reset_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("user_id", userId)
      .is("used_at", null);

    // Gerar token seguro
    const token = generateToken();
    const tokenHash = await sha256(token);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const { error: insertError } = await supabase
      .from("password_reset_tokens")
      .insert({
        user_id: userId,
        user_type: "profile",
        token_hash: tokenHash,
        expires_at: expiresAt,
      });

    if (insertError) {
      console.error("Erro ao salvar token de reset:", insertError);
      return new Response(
        JSON.stringify({ error: "Erro interno do servidor" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const baseUrl = Deno.env.get("APP_URL") || "https://mibeloja.devaocubo.com.br";
    const resetLink = `${baseUrl}/redefinir-senha?token=${token}&type=profile`;

    console.log("========================================");
    console.log(`[RESET] Solicitação de reset para: ${userEmail}`);
    console.log(`[RESET] Link: ${resetLink}`);
    console.log("========================================");

    return new Response(
      JSON.stringify({ success: true, resetLink }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erro ao processar esqueci senha:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
