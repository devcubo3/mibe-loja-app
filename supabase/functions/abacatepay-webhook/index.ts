import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Edge Function: abacatepay-webhook
 *
 * Recebe eventos do AbacatePay e atualiza o status das faturas em payment_history.
 * A reativação de empresa e bloqueio por inadimplência são tratados por triggers no banco:
 * - fn_check_company_reactivation (AFTER UPDATE em payment_history quando status = 'paid')
 * - fn_check_overdue_invoices (pg_cron diário às 05:00 UTC)
 *
 * Autenticação do segredo (em ordem de preferência):
 *   1) Header `Authorization: Bearer <ABACATEPAY_WEBHOOK_SECRET>`
 *   2) Header `X-Webhook-Secret: <ABACATEPAY_WEBHOOK_SECRET>`
 *   3) Query param `?secret=<ABACATEPAY_WEBHOOK_SECRET>` (legado)
 *
 * Idempotência: cada UPDATE filtra pelo status atual via .neq()/.in() para que
 * webhooks duplicados não atualizem a linha duas vezes (count=0 no replay), o
 * que evita re-disparar o trigger fn_check_company_reactivation.
 *
 * URL de produção:
 *   https://uipvhxgjaungdetwojou.supabase.co/functions/v1/abacatepay-webhook
 */

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  // ── Validar secret (header preferido, query param legado) ────────────────────
  const expectedSecret = Deno.env.get("ABACATEPAY_WEBHOOK_SECRET");
  if (!expectedSecret) {
    return new Response(JSON.stringify({ error: "Webhook secret not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("authorization") ?? "";
  const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i);
  const headerSecret = bearerMatch?.[1] ?? req.headers.get("x-webhook-secret") ?? "";
  const querySecret = new URL(req.url).searchParams.get("secret") ?? "";
  const providedSecret = headerSecret || querySecret;

  if (!providedSecret || !timingSafeEqual(providedSecret, expectedSecret)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // ── Parsear body ─────────────────────────────────────────────────────────────
  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { event, data } = body;

  // ── Log completo do payload para diagnóstico ─────────────────────────────────
  console.log("AbacatePay webhook PAYLOAD COMPLETO:", JSON.stringify(body));

  // AbacatePay envia o ID em diferentes locais dependendo do tipo de evento:
  // - billing: data.billing.id ou data.id
  // - pixQrCode: data.pixQrCode.id ou data.id
  const gatewayId = data?.billing?.id || data?.pixQrCode?.id || data?.id;

  console.log("AbacatePay webhook parsed:", JSON.stringify({ event, gatewayId }));

  if (!event || !gatewayId) {
    console.log("Webhook ignorado: event ou gatewayId ausente");
    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // ── Cliente Supabase (service role para bypass de RLS) ───────────────────────
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // ── Processar evento ─────────────────────────────────────────────────────────
  // Cada update filtra pelo status atual para garantir idempotência: replays
  // do mesmo webhook não geram UPDATE real e não re-disparam triggers.
  if (event === "billing.paid" || event === "pix.paid" || event === "pixQrCode.paid") {
    const { error, count } = await supabase
      .from("payment_history")
      .update({
        status: "paid",
        payment_date: new Date().toISOString(),
      }, { count: "exact" })
      .eq("gateway_reference", gatewayId)
      .neq("status", "paid");

    console.log(`Evento ${event}: gateway_reference=${gatewayId}, linhas atualizadas=${count}, erro=${JSON.stringify(error)}`);

    if (error) {
      console.error(`Erro ao atualizar fatura (${event}):`, error);
      return new Response(JSON.stringify({ error: "Erro interno" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    // Trigger fn_check_company_reactivation cuida da reativação da empresa/assinatura
  }

  if (event === "billing.refunded") {
    const { error, count } = await supabase
      .from("payment_history")
      .update({ status: "refunded" }, { count: "exact" })
      .eq("gateway_reference", gatewayId)
      .neq("status", "refunded");

    console.log(`Evento ${event}: gateway_reference=${gatewayId}, linhas atualizadas=${count}, erro=${JSON.stringify(error)}`);

    if (error) {
      console.error("Erro ao atualizar fatura (billing.refunded):", error);
    }
  }

  if (event === "billing.failed") {
    // Só rebaixa para overdue se a fatura ainda estiver pending — evita
    // sobrescrever uma fatura paga/refundida caso o gateway envie eventos fora
    // de ordem.
    const { error, count } = await supabase
      .from("payment_history")
      .update({ status: "overdue" }, { count: "exact" })
      .eq("gateway_reference", gatewayId)
      .eq("status", "pending");

    console.log(`Evento ${event}: gateway_reference=${gatewayId}, linhas atualizadas=${count}, erro=${JSON.stringify(error)}`);

    if (error) {
      console.error("Erro ao atualizar fatura (billing.failed):", error);
    }
    // Bloqueio de empresa por inadimplência é responsabilidade do pg_cron fn_check_overdue_invoices
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
