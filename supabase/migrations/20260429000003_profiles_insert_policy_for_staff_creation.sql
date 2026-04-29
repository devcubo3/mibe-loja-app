-- ============================================================
-- Adiciona policies de INSERT em profiles para suportar criação
-- de company_staff via owner (na Loja) e via super_admin (no ADM).
-- ============================================================
-- Garante que mesmo se o bypass de service_role não estiver
-- funcionando (env var, client config, etc), a insert ainda
-- passa pela policy do JWT do usuário autenticado.

DROP POLICY IF EXISTS "owner_can_insert_company_staff" ON profiles;
CREATE POLICY "owner_can_insert_company_staff"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    role = 'company_staff'
    AND EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = profiles.company_id
        AND companies.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "super_admin_can_insert_any_profile" ON profiles;
CREATE POLICY "super_admin_can_insert_any_profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT is_super_admin()));
