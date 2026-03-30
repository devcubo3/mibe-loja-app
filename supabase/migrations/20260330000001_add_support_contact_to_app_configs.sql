-- Adicionar colunas de contato de suporte
ALTER TABLE app_configs
  ADD COLUMN IF NOT EXISTS support_whatsapp TEXT,
  ADD COLUMN IF NOT EXISTS support_email TEXT;

-- Política RLS para admin atualizar app_configs
CREATE POLICY "allow_admin_update_app_configs"
  ON app_configs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );
