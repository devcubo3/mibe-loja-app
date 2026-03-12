-- Migration: Ciclo de 30 dias para assinaturas
--
-- 1. Atualiza fn_check_company_reactivation para setar expires_at = NOW() + 30 dias
-- 2. Cria fn_generate_monthly_invoices (pg_cron diário) para gerar próxima mensalidade 7 dias antes de expirar
-- 3. Atualiza fn_check_overdue_invoices para bloquear assinaturas expiradas

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. ATUALIZAR TRIGGER DE REATIVAÇÃO — adicionar expires_at
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION fn_check_company_reactivation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_company_id  UUID;
  v_pending_cnt INTEGER;
  v_is_mensalidade BOOLEAN;
BEGIN
  -- Só agir quando status muda para 'paid'
  IF NEW.status <> 'paid' OR OLD.status = 'paid' THEN
    RETURN NEW;
  END IF;

  -- Verificar se é uma mensalidade (para setar expires_at)
  v_is_mensalidade := (NEW.type = 'MENSALIDADE');

  -- Buscar company_id via subscription
  SELECT company_id INTO v_company_id
  FROM subscriptions
  WHERE id = NEW.subscription_id
  LIMIT 1;

  IF v_company_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Contar faturas ainda pendentes/vencidas nesta assinatura (excluindo a atual)
  SELECT COUNT(*) INTO v_pending_cnt
  FROM payment_history
  WHERE subscription_id = NEW.subscription_id
    AND status IN ('pending', 'overdue')
    AND id <> NEW.id;

  IF v_pending_cnt = 0 THEN
    -- Reativar empresa se estava desativada
    UPDATE companies
    SET is_active = true, updated_at = NOW()
    WHERE id = v_company_id
      AND is_active = false;

    -- Ativar assinatura e setar validade de 30 dias (se mensalidade)
    IF v_is_mensalidade THEN
      UPDATE subscriptions
      SET status = 'active',
          expires_at = NOW() + INTERVAL '30 days',
          updated_at = NOW()
      WHERE id = NEW.subscription_id
        AND status IN ('overdue', 'pending_payment');
    ELSE
      UPDATE subscriptions
      SET status = 'active', updated_at = NOW()
      WHERE id = NEW.subscription_id
        AND status IN ('overdue', 'pending_payment');
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. GERAR PRÓXIMA MENSALIDADE AUTOMATICAMENTE (7 dias antes de expirar)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION fn_generate_monthly_invoices()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_sub RECORD;
  v_existing_cnt INTEGER;
BEGIN
  -- Buscar assinaturas ativas que expiram nos próximos 7 dias
  FOR v_sub IN
    SELECT s.id AS subscription_id, s.expires_at, p.monthly_price
    FROM subscriptions s
    JOIN plans p ON p.id = s.plan_id
    WHERE s.status = 'active'
      AND s.expires_at IS NOT NULL
      AND s.expires_at <= NOW() + INTERVAL '7 days'
      AND s.expires_at > NOW()
  LOOP
    -- Verificar se já existe fatura MENSALIDADE pendente para esta assinatura
    SELECT COUNT(*) INTO v_existing_cnt
    FROM payment_history
    WHERE subscription_id = v_sub.subscription_id
      AND type = 'MENSALIDADE'
      AND status = 'pending';

    -- Se não existir, gerar nova fatura
    IF v_existing_cnt = 0 THEN
      INSERT INTO payment_history (subscription_id, type, amount, status, due_date)
      VALUES (
        v_sub.subscription_id,
        'MENSALIDADE',
        v_sub.monthly_price,
        'pending',
        v_sub.expires_at::date
      );

      RAISE NOTICE 'Fatura MENSALIDADE gerada para subscription_id=%, due_date=%',
        v_sub.subscription_id, v_sub.expires_at::date;
    END IF;
  END LOOP;
END;
$$;

-- Agendar pg_cron: todo dia às 06:00 UTC (03:00 BRT)
SELECT cron.unschedule('generate-monthly-invoices') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'generate-monthly-invoices'
);

SELECT cron.schedule(
  'generate-monthly-invoices',
  '0 6 * * *',
  'SELECT fn_generate_monthly_invoices()'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. ATUALIZAR fn_check_overdue_invoices — bloquear assinaturas expiradas
-- ═══════════════════════════════════════════════════════════════════════════════

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

  -- Passo 4 (NOVO): Marcar assinaturas expiradas (expires_at passado) como overdue
  -- Isso cobre o caso onde a fatura foi gerada mas não paga e a assinatura expirou
  UPDATE subscriptions
  SET status     = 'overdue',
      updated_at = NOW()
  WHERE status     = 'active'
    AND expires_at IS NOT NULL
    AND expires_at < NOW();

  -- Passo 5 (NOVO): Desativar empresas com assinatura expirada
  UPDATE companies c
  SET is_active  = false,
      updated_at = NOW()
  FROM subscriptions s
  WHERE s.company_id = c.id
    AND s.status     = 'overdue'
    AND s.expires_at IS NOT NULL
    AND s.expires_at < NOW()
    AND c.is_active  = true;
END;
$$;
