-- Migration: Corrige triggers que impedem comissão diária de acumular
--
-- PROBLEMA: handle_new_transaction() fazia UPDATE na mesma tabela transactions
-- dentro de um AFTER INSERT trigger, interferindo com trg_upsert_daily_commission.
-- Além disso, o cálculo de admin_fee era DUPLICADO entre fn_calc_admin_fee (BEFORE)
-- e handle_new_transaction (AFTER).
--
-- CORREÇÕES:
-- 1. Remover UPDATE redundante de admin_fee de handle_new_transaction
-- 2. Tornar todas as funções de trigger SECURITY DEFINER (bypass RLS)
-- 3. Adicionar política RLS de leitura em app_configs

-- ============================================================
-- 1. Reescrever handle_new_transaction: apenas cashback, sem admin_fee
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Atualiza ou Cria o saldo do cliente na empresa
    INSERT INTO cashback_balances (user_id, company_id, current_balance, last_purchase_date)
    VALUES (NEW.user_id, NEW.company_id, NEW.cashback_earned, NOW())
    ON CONFLICT (user_id, company_id) DO UPDATE SET
        current_balance = cashback_balances.current_balance - NEW.cashback_redeemed + NEW.cashback_earned,
        last_purchase_date = NOW();

    -- Admin fee agora é calculado EXCLUSIVAMENTE pelo BEFORE trigger fn_calc_admin_fee()
    -- Remover o UPDATE duplicado elimina o conflito com trg_upsert_daily_commission

    RETURN NEW;
END;
$$;

-- ============================================================
-- 2. fn_calc_admin_fee: SECURITY DEFINER para acessar app_configs com RLS
-- ============================================================
CREATE OR REPLACE FUNCTION fn_calc_admin_fee()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_fee_percent NUMERIC;
BEGIN
  SELECT global_fee_percent INTO v_fee_percent
  FROM app_configs
  LIMIT 1;

  NEW.admin_fee_amount := NEW.total_amount * COALESCE(v_fee_percent, 0) / 100;
  RETURN NEW;
END;
$$;

-- ============================================================
-- 3. fn_upsert_daily_commission: SECURITY DEFINER para INSERT/UPDATE em payment_history
-- ============================================================
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

-- ============================================================
-- 4. Garantir política RLS de leitura pública em app_configs
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'app_configs' AND policyname = 'allow_read_app_configs'
  ) THEN
    EXECUTE 'CREATE POLICY allow_read_app_configs ON app_configs FOR SELECT USING (true)';
  END IF;
END $$;
