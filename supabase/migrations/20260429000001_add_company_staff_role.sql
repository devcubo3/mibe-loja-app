-- ============================================================
-- Adiciona role 'company_staff' ao enum user_role.
-- ============================================================
-- Precisa estar em migration separada porque novos valores de
-- enum só ficam visíveis após o commit do ALTER TYPE.

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'company_staff';
