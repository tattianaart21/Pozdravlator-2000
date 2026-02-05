-- Таблицы для синхронизации контактов и сохранённых поздравлений между устройствами.
-- Выполнить в Supabase: SQL Editor → New query → вставить и Run.

-- Контакты пользователя (досье)
CREATE TABLE IF NOT EXISTS pozdrav_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pozdrav_contacts_user ON pozdrav_contacts(user_id);

ALTER TABLE pozdrav_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own contacts" ON pozdrav_contacts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contacts" ON pozdrav_contacts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contacts" ON pozdrav_contacts
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own contacts" ON pozdrav_contacts
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Сохранённые поздравления
CREATE TABLE IF NOT EXISTS pozdrav_congratulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pozdrav_congratulations_user ON pozdrav_congratulations(user_id);

ALTER TABLE pozdrav_congratulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own congratulations" ON pozdrav_congratulations
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own congratulations" ON pozdrav_congratulations
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own congratulations" ON pozdrav_congratulations
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own congratulations" ON pozdrav_congratulations
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
