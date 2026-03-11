-- Migration 004: Trigger que reativa empresa automaticamente ao pagar faturas
--
-- Dispara AFTER UPDATE em payment_history quando status muda para 'paid'.
-- Verifica se ainda há faturas pendentes/vencidas na mesma assinatura.
-- Se não houver: companies.is_active = true e subscriptions.status = 'active'.
--
-- Substitui a lógica de reativação do webhook billing.paid na API route.

CREATE OR REPLACE FUNCTION fn_check_company_reactivation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_company_id  UUID;
  v_pending_cnt INTEGER;
BEGIN
  -- Só agir quando status muda para 'paid'
  IF NEW.status <> 'paid' OR OLD.status = 'paid' THEN
    RETURN NEW;
  END IF;

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

    -- Ativar assinatura se estava overdue OU pending_payment
    UPDATE subscriptions
    SET status = 'active', updated_at = NOW()
    WHERE id = NEW.subscription_id
      AND status IN ('overdue', 'pending_payment');
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_company_reactivation ON payment_history;
CREATE TRIGGER trg_check_company_reactivation
AFTER UPDATE OF status ON payment_history
FOR EACH ROW
EXECUTE FUNCTION fn_check_company_reactivation();
