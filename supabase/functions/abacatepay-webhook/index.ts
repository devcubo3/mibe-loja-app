import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Edge Function: abacatepay-webhook
 *
 * Recebe eventos do AbacatePay e atualiza o status das faturas em payment_history.
 * A reativação de empresa e bloqueio por inadimplência são tratados por triggers no banco:
 * - fn_check_company_reactivation (AFTER UPDATE em payment_history quando status = 'paid')
 * - fn_check_overdue_invoices (pg_cron diário às 05:00 UTC)
 *
 * Segurança: query param ?secret=ABACATEPAY_WEBHOOK_SECRET
 *
 * URL de produção:
 *   https://uipvhxgjaungdetwojou.supabase.co/functions/v1/abacatepay-webhook?secret=<secret>
 */

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  // ── Validar secret ───────────────────────────────────────────────────────────
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");
  const expectedSecret = Deno.env.get("ABACATEPAY_WEBHOOK_SECRET");

  if (!expectedSecret || secret !== expectedSecret) {
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
  if (event === "billing.paid" || event === "pix.paid" || event === "pixQrCode.paid") {
    const { error, count } = await supabase
      .from("payment_history")
      .update({
        status: "paid",
        payment_date: new Date().toISOString(),
      }, { count: "exact" })
      .eq("gateway_reference", gatewayId);

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
    const { error } = await supabase
      .from("payment_history")
      .update({ status: "refunded" })
      .eq("gateway_reference", gatewayId);

    if (error) {
      console.error("Erro ao atualizar fatura (billing.refunded):", error);
    }
  }

  if (event === "billing.failed") {
    const { error } = await supabase
      .from("payment_history")
      .update({ status: "overdue" })
      .eq("gateway_reference", gatewayId);

    if (error) {
      console.error("Erro ao atualizar fatura (billing.failed):", error);
    }
    // Bloqueio de empresa por inadimplência é responsabilidade do pg_cron fn_check_overdue_invoices
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
