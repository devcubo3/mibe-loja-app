-- Migration 006: pg_cron — Job diário de inadimplência (substitui Vercel Cron)
--
-- Executa todo dia às 05:00 UTC (02:00 BRT).
-- Lógica:
--   1. Faturas pending com due_date < hoje-3 dias → status = 'overdue'
--   2. Empresas com faturas overdue vencidas há +3 dias → is_active = false
--   3. Assinaturas correspondentes → status = 'overdue'
--
-- A função também é chamável manualmente via:
--   SELECT fn_check_overdue_invoices();
-- ou via API route /api/cron/check-overdue como fallback.

CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE OR REPLACE FUNCTION fn_check_overdue_invoices()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_cutoff DATE := CURRENT_DATE - INTERVAL '3 days';
BEGIN
  -- Passo 1: Marcar faturas vencidas há mais de 3 dias como 'overdue'
  UPDATE payment_history
  SET status = 'overdue'
  WHERE status  = 'pending'
    AND due_date < v_cutoff;

  -- Passo 2: Desativar empresas com faturas overdue vencidas há +3 dias
  UPDATE companies c
  SET is_active  = false,
      updated_at = NOW()
  FROM subscriptions s
  JOIN payment_history ph ON ph.subscription_id = s.id
  WHERE s.company_id   = c.id
    AND ph.status      = 'overdue'
    AND ph.due_date    < v_cutoff
    AND c.is_active    = true;

  -- Passo 3: Marcar assinaturas das empresas afetadas como overdue
  UPDATE subscriptions s
  SET status     = 'overdue',
      updated_at = NOW()
  FROM payment_history ph
  WHERE ph.subscription_id = s.id
    AND ph.status           = 'overdue'
    AND ph.due_date         < v_cutoff
    AND s.status            = 'active';
END;
$$;

-- Agendar job: todo dia às 05:00 UTC
-- Remove job anterior se existir, depois recria
SELECT cron.unschedule('check-overdue-invoices') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'check-overdue-invoices'
);

SELECT cron.schedule(
  'check-overdue-invoices',
  '0 5 * * *',
  'SELECT fn_check_overdue_invoices()'
);
