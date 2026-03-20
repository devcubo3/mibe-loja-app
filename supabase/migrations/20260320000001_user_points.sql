  -- Migration: Sistema de Pontuação Universal
  -- 1 ponto por R$1 de net_amount_paid (universal, não por loja)

  -- ============================================
  -- 1. Tabela user_points (saldo acumulado)
  -- ============================================

  CREATE TABLE user_points (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    total_points INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- RLS
  ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "Users can view own points"
    ON user_points FOR SELECT
    USING (auth.uid() = user_id);

  CREATE POLICY "Admins can view all points"
    ON user_points FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'super_admin'
      )
    );

  -- Realtime
  ALTER PUBLICATION supabase_realtime ADD TABLE user_points;

  -- ============================================
  -- 2. Tabela points_history (audit trail)
  -- ============================================

  CREATE TABLE points_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    points INTEGER NOT NULL,
    type TEXT NOT NULL DEFAULT 'earn',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE INDEX idx_points_history_user_id ON points_history(user_id);
  CREATE INDEX idx_points_history_created_at ON points_history(created_at DESC);

  -- RLS
  ALTER TABLE points_history ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "Users can view own points history"
    ON points_history FOR SELECT
    USING (auth.uid() = user_id);

  CREATE POLICY "Admins can view all points history"
    ON points_history FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'super_admin'
      )
    );

  -- Realtime
  ALTER PUBLICATION supabase_realtime ADD TABLE points_history;

  -- ============================================
  -- 3. Trigger: acumula pontos ao inserir transação
  -- ============================================

  CREATE OR REPLACE FUNCTION handle_points_on_transaction()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
  AS $$
  DECLARE
    earned_points INTEGER;
  BEGIN
    -- Ignora transações de expiração
    IF NEW.payment_method = 'expirado' THEN
      RETURN NEW;
    END IF;

    -- 1 ponto por R$1 de net_amount_paid (arredondado para baixo)
    earned_points := FLOOR(NEW.net_amount_paid);

    -- Skip se 0 pontos
    IF earned_points <= 0 THEN
      RETURN NEW;
    END IF;

    -- Upsert: cria ou soma pontos
    INSERT INTO user_points (user_id, total_points, updated_at)
    VALUES (NEW.user_id, earned_points, NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      total_points = user_points.total_points + earned_points,
      updated_at = NOW();

    -- Registra no histórico
    INSERT INTO points_history (user_id, transaction_id, points, type)
    VALUES (NEW.user_id, NEW.id, earned_points, 'earn');

    RETURN NEW;
  END;
  $$;

  CREATE TRIGGER trg_points_on_transaction
    AFTER INSERT ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION handle_points_on_transaction();

  -- ============================================
  -- 4. Backfill: popula pontos de transações existentes
  -- ============================================

  -- 4a. Popula user_points com totais
  INSERT INTO user_points (user_id, total_points, updated_at)
  SELECT
    user_id,
    SUM(FLOOR(net_amount_paid))::INTEGER,
    MAX(created_at)
  FROM transactions
  WHERE payment_method != 'expirado'
    AND user_id IS NOT NULL
    AND net_amount_paid > 0
  GROUP BY user_id
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = EXCLUDED.total_points,
    updated_at = EXCLUDED.updated_at;

  -- 4b. Popula points_history com registros individuais
  INSERT INTO points_history (user_id, transaction_id, points, type, created_at)
  SELECT
    user_id,
    id,
    FLOOR(net_amount_paid)::INTEGER,
    'earn',
    created_at
  FROM transactions
  WHERE payment_method != 'expirado'
    AND user_id IS NOT NULL
    AND net_amount_paid > 0
    AND FLOOR(net_amount_paid) > 0;
