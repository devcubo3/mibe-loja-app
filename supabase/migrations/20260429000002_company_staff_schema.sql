-- ============================================================
-- Schema para suportar company_staff:
--   - profiles.company_id e profiles.is_active
--   - RLS para owner gerenciar staff da própria empresa
--   - Drop da tabela company_users (legado, vazia)
-- ============================================================

-- 1. Adicionar colunas a profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON profiles(company_id);

-- 2. RLS: cada profile vê o próprio + owner vê staff da sua empresa
DROP POLICY IF EXISTS "owner_can_view_company_staff" ON profiles;
CREATE POLICY "owner_can_view_company_staff"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = profiles.company_id
        AND companies.owner_id = auth.uid()
    )
  );

-- 3. RLS: owner pode atualizar profiles de staff da própria empresa
DROP POLICY IF EXISTS "owner_can_update_company_staff" ON profiles;
CREATE POLICY "owner_can_update_company_staff"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    profiles.role = 'company_staff'
    AND EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = profiles.company_id
        AND companies.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    profiles.role = 'company_staff'
    AND EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = profiles.company_id
        AND companies.owner_id = auth.uid()
    )
  );

-- 4. Dropar tabela company_users (vazia em produção)
DROP TABLE IF EXISTS company_users CASCADE;
