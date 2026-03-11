-- Migration 003: RLS Policies para plans, subscriptions e payment_history
--
-- IMPORTANTE: API routes usam service_role (getSupabaseAdmin) que bypassa RLS.
-- Estas policies protegem acesso DIRETO via anon key + JWT do usuário.
--
-- Resultado: usuário só vê dados da própria empresa; service_role vê tudo.

-- ── plans: leitura pública para qualquer usuário autenticado ─────────────────

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "plans_read" ON plans;
CREATE POLICY "plans_read"
  ON plans FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "plans_admin" ON plans;
CREATE POLICY "plans_admin"
  ON plans FOR ALL
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- ── subscriptions: owner da empresa ou super_admin ───────────────────────────

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "subscriptions_owner" ON subscriptions;
CREATE POLICY "subscriptions_owner"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
    )
    OR is_super_admin()
  );

DROP POLICY IF EXISTS "subscriptions_admin" ON subscriptions;
CREATE POLICY "subscriptions_admin"
  ON subscriptions FOR ALL
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- ── payment_history: via subscription → company → owner_id ──────────────────

ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payment_history_owner" ON payment_history;
CREATE POLICY "payment_history_owner"
  ON payment_history FOR SELECT
  TO authenticated
  USING (
    subscription_id IN (
      SELECT s.id
      FROM subscriptions s
      JOIN companies c ON c.id = s.company_id
      WHERE c.owner_id = auth.uid()
    )
    OR is_super_admin()
  );

DROP POLICY IF EXISTS "payment_history_admin" ON payment_history;
CREATE POLICY "payment_history_admin"
  ON payment_history FOR ALL
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());
