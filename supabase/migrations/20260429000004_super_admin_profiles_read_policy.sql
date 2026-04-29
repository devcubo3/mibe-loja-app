-- Permite que super_admin leia qualquer profile via browser client (MIBE-ADM)
-- Sem essa policy, o painel admin não consegue carregar detalhes de clientes,
-- usuários em transações, ou wallets, pois o browser client respeita RLS.
CREATE POLICY "super_admin_can_read_all_profiles"
  ON profiles FOR SELECT TO authenticated
  USING ((SELECT is_super_admin()));
