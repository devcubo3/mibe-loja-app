-- Migration 005: Trigger que cria/acumula fatura COMISSAO_DIARIA ao registrar venda
--
-- Dispara AFTER INSERT em transactions.
-- Busca a assinatura ativa da empresa e o commission_percent do plano.
-- Cria nova fatura COMISSAO_DIARIA ou acumula no registro pendente do dia.
--
-- IMPORTANTE: Após aplicar esta migration, remover o bloco de comissão diária
-- da API route src/app/api/sales/create/route.ts (linhas 107-138) para evitar
-- dupla contagem.

CREATE OR REPLACE FUNCTION fn_upsert_daily_commission()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_sub_id        UUID;
  v_pct           NUMERIC;
  v_commission    NUMERIC;
  v_today         DATE    := CURRENT_DATE;
  v_due_date      DATE    := CURRENT_DATE + INTERVAL '7 days';
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

  -- Verificar se já existe fatura COMISSAO_DIARIA pendente para hoje
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

DROP TRIGGER IF EXISTS trg_upsert_daily_commission ON transactions;
CREATE TRIGGER trg_upsert_daily_commission
AFTER INSERT ON transactions
FOR EACH ROW
EXECUTE FUNCTION fn_upsert_daily_commission();
