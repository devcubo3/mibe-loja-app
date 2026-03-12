import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Edge Function: abacatepay-pay
 *
 * Cria uma cobrança no AbacatePay para pagamento de faturas selecionadas.
 * - PIX: retorna QR Code (brCodeBase64 + brCode)
 * - CREDIT_CARD: retorna URL de checkout
 *
 * Autenticação: Supabase Auth JWT (validado via supabase.auth.getUser)
 *
 * URL:
 *   https://uipvhxgjaungdetwojou.supabase.co/functions/v1/abacatepay-pay
 */

const ABACATEPAY_BASE_URL = "https://api.abacatepay.com/v1";

// ── AbacatePay helpers ────────────────────────────────────────────────────────

function abacateHeaders(apiKey: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
}

async function createPixQrCode(apiKey: string, params: {
  amount: number;
  expiresIn?: number;
  description?: string;
  metadata?: Record<string, string>;
}) {
  const res = await fetch(`${ABACATEPAY_BASE_URL}/pixQrCode/create`, {
    method: "POST",
    headers: abacateHeaders(apiKey),
    body: JSON.stringify(params),
  });
  const json = await res.json();
  if (!res.ok || json.error) throw new Error(json.error || "Erro ao criar QR Code PIX");
  return json.data as {
    id: string;
    brCode: string;
    brCodeBase64: string;
    expiresAt: string;
    status: string;
  };
}

async function createCardCheckout(apiKey: string, params: {
  amount: number;
  description: string;
  externalId: string;
  returnUrl: string;
  completionUrl: string;
  customer?: { name: string; email: string; taxId: string; cellphone: string };
  metadata?: Record<string, string>;
}) {
  const body: Record<string, unknown> = {
    frequency: "ONE_TIME",
    methods: ["CARD"],
    products: [{
      externalId: params.externalId,
      name: params.description,
      quantity: 1,
      price: params.amount,
    }],
    returnUrl: params.returnUrl,
    completionUrl: params.completionUrl,
    metadata: params.metadata,
  };
  if (params.customer) {
    body.customer = params.customer;
  }
  const res = await fetch(`${ABACATEPAY_BASE_URL}/billing/create`, {
    method: "POST",
    headers: abacateHeaders(apiKey),
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok || json.error) {
    console.error("AbacatePay billing/create error:", JSON.stringify(json));
    throw new Error(json.error || "Erro ao criar checkout");
  }
  return json.data as { id: string; url: string; status: string };
}

// ── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  // ── Auth via Supabase JWT ────────────────────────────────────────────────────
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Não autenticado" }), {
      status: 401,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  const token = authHeader.slice(7);
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Token inválido ou expirado" }), {
      status: 401,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  const { data: companyData, error: companyAuthError } = await supabaseAdmin
    .from("companies")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (companyAuthError || !companyData) {
    return new Response(JSON.stringify({ error: "Empresa não encontrada para este usuário" }), {
      status: 404,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  const companyId = companyData.id;

  // ── Body ──────────────────────────────────────────────────────────────────────
  let body: { payment_history_ids?: string[]; billing_type?: string; app_url?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "JSON inválido" }), {
      status: 400,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  const { payment_history_ids, billing_type } = body;

  if (!payment_history_ids || payment_history_ids.length === 0) {
    return new Response(JSON.stringify({ error: "Selecione ao menos uma fatura para pagar" }), {
      status: 400,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  if (!billing_type || !["PIX", "CREDIT_CARD"].includes(billing_type)) {
    return new Response(JSON.stringify({ error: "Método de pagamento inválido" }), {
      status: 400,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  const apiKey = Deno.env.get("ABACATEPAY_API_KEY");
  if (!apiKey) {
    console.error("ABACATEPAY_API_KEY não configurada");
    return new Response(JSON.stringify({ error: "Configuração de pagamento ausente" }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  // ── Buscar e validar faturas ──────────────────────────────────────────────────
  const { data: invoices, error: invoicesError } = await supabaseAdmin
    .from("payment_history")
    .select("*, subscriptions!inner(company_id)")
    .in("id", payment_history_ids);

  if (invoicesError || !invoices || invoices.length === 0) {
    return new Response(JSON.stringify({ error: "Faturas não encontradas" }), {
      status: 404,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  const unauthorized = invoices.some((inv: any) => inv.subscriptions.company_id !== companyId);
  if (unauthorized) {
    return new Response(JSON.stringify({ error: "Acesso não autorizado a estas faturas" }), {
      status: 403,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  const invalid = invoices.some((inv: any) => !["pending", "overdue"].includes(inv.status));
  if (invalid) {
    return new Response(JSON.stringify({ error: "Apenas faturas pendentes podem ser pagas" }), {
      status: 400,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  // ── Calcular total ────────────────────────────────────────────────────────────
  const totalReais = invoices.reduce((sum: number, inv: any) => sum + Number(inv.amount), 0);
  const totalCentavos = Math.round(totalReais * 100);

  // ── Buscar empresa ────────────────────────────────────────────────────────────
  const { data: company, error: companyError } = await supabaseAdmin
    .from("companies")
    .select("id, business_name")
    .eq("id", companyId)
    .single();

  if (companyError || !company) {
    return new Response(JSON.stringify({ error: "Empresa não encontrada" }), {
      status: 404,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  // ── Buscar dados do owner para customer do billing ─────────────────────────
  const { data: ownerProfile } = await supabaseAdmin
    .from("profiles")
    .select("full_name, cpf, phone")
    .eq("id", user.id)
    .single();

  const invoiceCount = invoices.length;
  const description = `${invoiceCount} fatura${invoiceCount > 1 ? "s" : ""} - ${company.business_name}`;
  const externalId = `company_${companyId}_invoices_${payment_history_ids.join("_")}`;

  const responseHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };

  try {
    // ── PIX ────────────────────────────────────────────────────────────────────
    if (billing_type === "PIX") {
      const pix = await createPixQrCode(apiKey, {
        amount: totalCentavos,
        expiresIn: 3600,
        description: description.slice(0, 37),
        metadata: {
          company_id: companyId,
          invoice_ids: payment_history_ids.join(","),
          external_id: externalId,
        },
      });

      await supabaseAdmin
        .from("payment_history")
        .update({ gateway_reference: pix.id })
        .in("id", payment_history_ids);

      return new Response(
        JSON.stringify({
          payment_id: pix.id,
          status: pix.status,
          invoice_url: "",
          value: totalReais,
          pix: {
            qrCodeImage: pix.brCodeBase64,
            qrCodeText: pix.brCode,
            expirationDate: pix.expiresAt,
          },
        }),
        { headers: responseHeaders }
      );
    }

    // ── CARTÃO ─────────────────────────────────────────────────────────────────
    const ALLOWED_ORIGINS = [
      "https://app.mibeapp.com.br",
      "https://app.mibeapp.com",
      "http://localhost:3000",
    ];
    const appUrl = (body.app_url && ALLOWED_ORIGINS.includes(body.app_url))
      ? body.app_url
      : Deno.env.get("APP_URL") || "";
    const billing = await createCardCheckout(apiKey, {
      amount: totalCentavos,
      description,
      externalId,
      returnUrl: `${appUrl}/planos`,
      completionUrl: `${appUrl}/planos?payment=success`,
      customer: {
        name: ownerProfile?.full_name || company.business_name,
        email: user.email || "",
        taxId: ownerProfile?.cpf || "",
        cellphone: ownerProfile?.phone || "",
      },
      metadata: {
        company_id: companyId,
        invoice_ids: payment_history_ids.join(","),
      },
    });

    await supabaseAdmin
      .from("payment_history")
      .update({ gateway_reference: billing.id })
      .in("id", payment_history_ids);

    return new Response(
      JSON.stringify({
        payment_id: billing.id,
        status: billing.status,
        invoice_url: billing.url,
        value: totalReais,
      }),
      { headers: responseHeaders }
    );
  } catch (err: any) {
    console.error("Erro AbacatePay:", err);
    return new Response(
      JSON.stringify({ error: "Erro ao comunicar com o sistema de pagamentos. Tente novamente." }),
      { status: 502, headers: responseHeaders }
    );
  }
});
