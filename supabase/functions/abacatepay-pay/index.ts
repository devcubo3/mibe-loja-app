import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Edge Function: abacatepay-pay
 * 
 * Versão 26: Resiliência Total na v1 com fallbacks garantidos para Cartão.
 */

const ABACATE_BASE_URL = "https://api.abacatepay.com/v1";

function abacateHeaders(apiKey: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
}

function onlyDigits(value: unknown): string | undefined {
  if (typeof value !== "string" && typeof value !== "number") return undefined;
  const digits = String(value).replace(/\D/g, "");
  return digits.length > 0 ? digits : undefined;
}

function formatPhone(value: unknown): string | undefined {
  const digits = onlyDigits(value);
  if (!digits) return undefined;
  const clean = digits.startsWith("55") && digits.length > 11 ? digits.slice(2) : digits;
  if (clean.length === 11) return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
  if (clean.length === 10) return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
  return undefined;
}

async function getOrCreateCustomer(apiKey: string, customerData: any) {
  const res = await fetch(`${ABACATE_BASE_URL}/customer/create`, {
    method: "POST",
    headers: abacateHeaders(apiKey),
    body: JSON.stringify(customerData),
  });
  const json = await res.json();

  if (res.ok && json.data?.id) {
    return json.data.id;
  }

  console.error("[AbacatePay v1] Erro customer/create payload:", JSON.stringify(customerData));
  console.error("[AbacatePay v1] Erro customer/create response:", JSON.stringify(json));
  throw new Error(json.error || "Erro ao identificar cliente no gateway.");
}

async function createBilling(apiKey: string, params: any) {
  const res = await fetch(`${ABACATE_BASE_URL}/billing/create`, {
    method: "POST",
    headers: abacateHeaders(apiKey),
    body: JSON.stringify(params),
  });
  const json = await res.json();
  if (!res.ok || json.error) {
    console.error("[AbacatePay v1] Erro billing/create response:", JSON.stringify(json));
    throw new Error(json.error || "Erro ao gerar link de pagamento.");
  }
  return json.data;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" } });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) throw new Error("Não autenticado");

    const token = authHeader.slice(7);
    const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) throw new Error("Token inválido");

    const body = await req.json();
    const { payment_history_ids, billing_type } = body;
    const apiKey = Deno.env.get("ABACATEPAY_API_KEY")!;

    const { data: company } = await supabaseAdmin.from("companies").select("*").eq("owner_id", user.id).single();
    if (!company) throw new Error("Empresa não encontrada");

    const { data: invoices } = await supabaseAdmin.from("payment_history").select("*").in("id", payment_history_ids);
    if (!invoices || invoices.length === 0) throw new Error("Faturas não encontradas");

    const totalReais = invoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
    const totalCentavos = Math.round(totalReais * 100);
    const description = `${invoices.length} fatura(s) - ${company.business_name}`;
    const externalId = `txn_${company.id.slice(0, 8)}_${Date.now()}`;

    // ── Fluxo PIX ──
    if (billing_type === "PIX") {
      const pix = await fetch(`${ABACATE_BASE_URL}/pixQrCode/create`, {
        method: "POST",
        headers: abacateHeaders(apiKey),
        body: JSON.stringify({ amount: totalCentavos, description, metadata: { company_id: company.id } }),
      }).then(r => r.json());

      if (pix.error) throw new Error(pix.error);

      await supabaseAdmin.from("payment_history").update({ gateway_reference: pix.data.id }).in("id", payment_history_ids);
      return new Response(JSON.stringify({ payment_id: pix.data.id, status: pix.data.status, pix: { qrCodeImage: pix.data.brCodeBase64, qrCodeText: pix.data.brCode } }), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
    }

    // ── Fluxo CARTÃO ──
    if (billing_type === "CREDIT_CARD") {
      let customerId: string;

      if (company.abacate_customer_id) {
        customerId = company.abacate_customer_id;
        console.log("[AbacatePay v1] Usando customer ID existente:", customerId);
      } else {
        const { data: profile } = await supabaseAdmin.from("profiles").select("*").eq("id", user.id).single();

        // Corrente de Fallbacks (Usuário -> Empresa -> Placeholder)
        const name = profile?.full_name || company.business_name || "Assinante Mibe";
        const email = user.email || company.email || "contato@mibeapp.com.br";
        const taxId = onlyDigits(profile?.cpf || company.cnpj) || "00000000000";
        const rawPhone = profile?.phone || company.phone || "11999999999";
        const cellphone = formatPhone(rawPhone) || "(11) 99999-9999";

        const customerPayload = { name, email, taxId, cellphone };

        console.log("[AbacatePay v1] Criando novo customer para cartão...");
        customerId = await getOrCreateCustomer(apiKey, customerPayload);
        console.log("[AbacatePay v1] Customer criado:", customerId);

        // Salvar para uso futuro
        await supabaseAdmin.from("companies").update({ abacate_customer_id: customerId }).eq("id", company.id);
      }

      const checkout = await createBilling(apiKey, {
        frequency: "ONE_TIME",
        methods: ["CARD"],
        products: [{ externalId, name: description, quantity: 1, price: totalCentavos }],
        customerId, // Agora sempre presente
        returnUrl: `${Deno.env.get("APP_URL") || "https://app.mibeapp.com.br"}/planos`,
        completionUrl: `${Deno.env.get("APP_URL") || "https://app.mibeapp.com.br"}/planos?payment=success`,
        metadata: { company_id: company.id, invoice_ids: payment_history_ids.join(",") }
      });

      await supabaseAdmin.from("payment_history").update({ gateway_reference: checkout.id }).in("id", payment_history_ids);
      return new Response(JSON.stringify({ payment_id: checkout.id, status: checkout.status, invoice_url: checkout.url }), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
    }

  } catch (err: any) {
    console.error("[AbacatePay v1] ERRO FATAL:", err.message);
    return new Response(JSON.stringify({ error: "Erro no gateway", detail: err.message }), { status: 502, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
  }
});
