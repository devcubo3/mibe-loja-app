-- Fix: adiciona 'overdue' ao CHECK constraint de payment_history.status
-- O cron fn_check_overdue_invoices estava falhando desde 24/03/2026 porque
-- o constraint antigo não incluia 'overdue' como valor válido.

ALTER TABLE payment_history
  DROP CONSTRAINT payment_history_status_check;

ALTER TABLE payment_history
  ADD CONSTRAINT payment_history_status_check
  CHECK (status IN ('pending', 'paid', 'failed', 'refunded', 'overdue'));
