-- Migration: Corrige criação de faturas diárias de R$ 0,00
--
-- PROBLEMA: A Edge Function 'expire-wallets' insere transações com total_amount = 0
-- para registrar a expiração de saldo. Isso dispara o trigger fn_upsert_daily_commission,
-- que ao ver um transaction com valor 0, criava uma fatura zerada no payment_history.
--
-- CORREÇÕES:
-- 1. Se v_commission <= 0, ignorar a inserção no payment_history.
-- 2. Limpar todas as faturas de 0.00 pendentes (erro do sistema).

CREATE OR REPLACE FUNCTION fn_upsert_daily_commission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

  -- Se a transação não gerou comissão, não criamos uma fatura zerada e não precisamos atualizar
  IF COALESCE(v_commission, 0) <= 0 THEN
    RETURN NEW;
  END IF;

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

-- Remove faturas indevidas de comissão diária com valor zerado.
DELETE FROM payment_history
WHERE amount = 0 
  AND status = 'pending' 
  AND type = 'COMISSAO_DIARIA';
