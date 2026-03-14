-- Migration: Corrige bug de timezone no trigger de comissão diária.
--
-- CURRENT_DATE usa UTC (timezone do Supabase), mas os lojistas operam em BRT (UTC-3).
-- Uma venda às 22:58 BRT do dia 13 era registrada como dia 14 (01:58 UTC),
-- fazendo o trigger acumular comissões de dias diferentes na mesma fatura.
--
-- Correção: usar (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')::DATE
-- para que o "dia" da comissão reflita o horário de Brasília.

CREATE OR REPLACE FUNCTION fn_upsert_daily_commission()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_sub_id        UUID;
  v_pct           NUMERIC;
  v_commission    NUMERIC;
  v_today         DATE    := (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')::DATE;
  v_due_date      DATE    := (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')::DATE + INTERVAL '7 days';
  v_existing_id   UUID;
  v_existing_amt  NUMERIC;
BEGIN
  -- Buscar assinatura ativa e percentual de comissão do plano
  SELECT s.id, p.commission_percent
  INTO v_sub_id, v_pct
  FROM subscriptions s
  JOIN plans p ON p.id = s.plan_id
  WHERE s.company_id = NEW.company_id
    AND s.status = 'active'
  LIMIT 1;

  -- Sem assinatura ativa ou sem comissão configurada: nada a fazer
  IF v_sub_id IS NULL OR COALESCE(v_pct, 0) = 0 THEN
    RETURN NEW;
  END IF;

  v_commission := NEW.total_amount * (v_pct / 100);

  -- Verificar se já existe fatura COMISSAO_DIARIA pendente para hoje (BRT)
  SELECT id, amount
  INTO v_existing_id, v_existing_amt
  FROM payment_history
  WHERE subscription_id = v_sub_id
    AND type          = 'COMISSAO_DIARIA'
    AND commission_date = v_today
    AND status        = 'pending'
  LIMIT 1;

  IF v_existing_id IS NOT NULL THEN
    -- Acumular no registro existente
    UPDATE payment_history
    SET amount = v_existing_amt + v_commission
    WHERE id = v_existing_id;
  ELSE
    -- Criar nova fatura do dia
    INSERT INTO payment_history (
      subscription_id,
      type,
      amount,
      status,
      commission_date,
      due_date
    ) VALUES (
      v_sub_id,
      'COMISSAO_DIARIA',
      v_commission,
      'pending',
      v_today,
      v_due_date
    );
  END IF;

  RETURN NEW;
END;
$$;
