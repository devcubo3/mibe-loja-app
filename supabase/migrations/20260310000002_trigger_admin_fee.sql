-- Migration 002: Trigger que calcula admin_fee_amount antes de inserir uma transação
-- Busca global_fee_percent em app_configs e aplica sobre total_amount
-- Resolve o bug onde admin_fee_amount nunca era calculado

CREATE OR REPLACE FUNCTION fn_calc_admin_fee()
RETURNS TRIGGER
LANGUAGE plpgsql
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

DROP TRIGGER IF EXISTS trg_calc_admin_fee ON transactions;
CREATE TRIGGER trg_calc_admin_fee
BEFORE INSERT ON transactions
FOR EACH ROW
EXECUTE FUNCTION fn_calc_admin_fee();
