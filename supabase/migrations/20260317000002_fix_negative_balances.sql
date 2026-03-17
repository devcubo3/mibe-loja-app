-- Migration: Corrige saldos negativos e altera trigger para ignorar data em expiração

-- 1. Corrige os saldos negativos atuais no banco de dados.
UPDATE cashback_balances
SET current_balance = 0
WHERE current_balance < 0;

-- 2. Atualiza o trigger `handle_new_transaction`
CREATE OR REPLACE FUNCTION handle_new_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Se for expiração, apenas desconta o saldo sem atualizar a data de última compra
    IF NEW.payment_method = 'expirado' THEN
      UPDATE cashback_balances
      SET current_balance = GREATEST(0, cashback_balances.current_balance - NEW.cashback_redeemed)
      WHERE user_id = NEW.user_id AND company_id = NEW.company_id;
      
      RETURN NEW;
    END IF;

    -- Para compras normais: Atualiza ou Cria o saldo do cliente na empresa
    INSERT INTO cashback_balances (user_id, company_id, current_balance, last_purchase_date)
    VALUES (NEW.user_id, NEW.company_id, NEW.cashback_earned, NOW())
    ON CONFLICT (user_id, company_id) DO UPDATE SET
        current_balance = GREATEST(0, cashback_balances.current_balance - NEW.cashback_redeemed) + NEW.cashback_earned,
        last_purchase_date = NOW();

    RETURN NEW;
END;
$$;
