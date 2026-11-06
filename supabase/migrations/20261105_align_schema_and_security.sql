-- ============================================================
-- LipWell — Alinha o schema ao código do app + endurece segurança
-- Requer apenas o 001_initial_schema.sql já aplicado (tabela profiles).
-- Não precisa do 20260415: as tabelas dele são criadas aqui se faltarem.
-- (Supabase → SQL Editor → cole tudo → Run). É idempotente: pode rodar de novo.
-- ============================================================

-- ------------------------------------------------------------
-- 1. PROFILES — colunas que o app usa e constraints compatíveis
-- ------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS lipedema_stage TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial',
  ADD COLUMN IF NOT EXISTS subscription_plan TEXT,
  ADD COLUMN IF NOT EXISTS trial_start DATE,
  ADD COLUMN IF NOT EXISTS trial_end DATE,
  ADD COLUMN IF NOT EXISTS mp_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS mp_preapproval_id TEXT,
  ADD COLUMN IF NOT EXISTS ia_chat_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ia_chat_month TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS dob DATE,
  ADD COLUMN IF NOT EXISTS pain_concentration TEXT,
  ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ DEFAULT NOW();

-- O onboarding grava textos livres ("Suspeita", "Estágio 2"...), não '1'..'4'
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_lipedema_stage_check;

-- O app usa trial | free | basic | standard | premium
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_subscription_status_check;
UPDATE public.profiles SET subscription_status = 'trial'
  WHERE subscription_status IS NULL
     OR subscription_status NOT IN ('trial','free','basic','standard','premium','canceled','expired');
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_subscription_status_check
  CHECK (subscription_status IN ('trial','free','basic','standard','premium','canceled','expired'));
ALTER TABLE public.profiles ALTER COLUMN subscription_status SET DEFAULT 'trial';

-- Usuária só pode LER e ATUALIZAR o próprio perfil.
-- (Antes era FOR ALL: dava pra apagar o perfil e recriar como 'premium'.)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own_profile" ON public.profiles;
DROP POLICY IF EXISTS "profile_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profile_update_own" ON public.profiles;
CREATE POLICY "profile_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profile_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Campos de cobrança NÃO podem ser alterados pelo navegador.
-- Antes, qualquer usuária podia rodar
--   supabase.from('profiles').update({ subscription_status: 'premium' })
-- e virar premium de graça.
CREATE OR REPLACE FUNCTION public.protect_billing_fields()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.role() IN ('authenticated', 'anon') THEN
    NEW.subscription_status := OLD.subscription_status;
    NEW.subscription_plan   := OLD.subscription_plan;
    NEW.trial_start         := OLD.trial_start;
    NEW.trial_end           := OLD.trial_end;
    NEW.trial_started_at    := OLD.trial_started_at;
    NEW.mp_customer_id      := OLD.mp_customer_id;
    NEW.mp_preapproval_id   := OLD.mp_preapproval_id;
    NEW.ia_chat_count       := OLD.ia_chat_count;
    NEW.ia_chat_month       := OLD.ia_chat_month;
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS profiles_protect_billing ON public.profiles;
CREATE TRIGGER profiles_protect_billing
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_billing_fields();

-- Trigger de signup com search_path fixo (boa prática p/ SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Nova Usuária'))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Cria perfil para contas que já existiam antes do trigger
INSERT INTO public.profiles (id, full_name)
SELECT u.id, COALESCE(u.raw_user_meta_data->>'full_name', 'Nova Usuária')
FROM auth.users u
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- 2. SUPPLEMENTS — a tabela do 001 não tinha dosage/schedule
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.supplements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.supplements ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.supplements
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS dosage TEXT,
  ADD COLUMN IF NOT EXISTS schedule TEXT;

-- ------------------------------------------------------------
-- 3. DAILY_LOGS — check-ins manhã/noite (usado pelo app inteiro)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  log_type TEXT NOT NULL CHECK (log_type IN ('morning','evening')),

  -- manhã
  wake_feeling INT CHECK (wake_feeling BETWEEN 0 AND 10),
  sleep_quality INT CHECK (sleep_quality BETWEEN 0 AND 10),
  pain_level INT CHECK (pain_level BETWEEN 0 AND 10),
  pain_locations TEXT[] DEFAULT '{}',
  swelling_legs INT CHECK (swelling_legs BETWEEN 0 AND 10),
  mood TEXT,

  -- noite
  energy_level INT CHECK (energy_level BETWEEN 0 AND 10),
  stress_level INT CHECK (stress_level BETWEEN 0 AND 10),
  pain_comparison TEXT,
  had_emotional_trigger BOOLEAN,
  trigger_description TEXT CHECK (char_length(trigger_description) <= 2000),
  water_intake_ml INT CHECK (water_intake_ml BETWEEN 0 AND 20000),
  exercised BOOLEAN,
  exercise_type TEXT,
  exercise_minutes INT CHECK (exercise_minutes BETWEEN 0 AND 1440),
  exercise_intensity TEXT,
  used_compression BOOLEAN,
  compression_minutes INT CHECK (compression_minutes BETWEEN 0 AND 1440),
  did_massage BOOLEAN,
  massage_minutes INT CHECK (massage_minutes BETWEEN 0 AND 1440),
  elevated_legs BOOLEAN,
  elevated_legs_minutes INT CHECK (elevated_legs_minutes BETWEEN 0 AND 1440),

  taken_supplements JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, log_date, log_type)
);
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date ON public.daily_logs(user_id, log_date DESC);

-- ------------------------------------------------------------
-- 4. MEAL_LOGS — refeições do dia
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.meal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_name TEXT NOT NULL CHECK (char_length(meal_name) <= 100),
  food_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, log_date, meal_name)
);
CREATE INDEX IF NOT EXISTS idx_meal_logs_user_date ON public.meal_logs(user_id, log_date DESC);

-- ------------------------------------------------------------
-- 5. CUSTOM_FOODS — alimentos criados pela usuária
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.custom_foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  category TEXT NOT NULL DEFAULT 'extras',
  is_anti_inflammatory BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, name)
);

-- Garante as tabelas do script 20260415 caso ele não tenha sido rodado
CREATE TABLE IF NOT EXISTS public.ai_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  log_date DATE NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'weekly'
);
CREATE INDEX IF NOT EXISTS idx_ai_reports_user_date ON public.ai_reports(user_id, log_date);

CREATE TABLE IF NOT EXISTS public.ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  usage_date DATE DEFAULT CURRENT_DATE NOT NULL,
  coach_messages_count INTEGER DEFAULT 0,
  UNIQUE(user_id, usage_date)
);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_date ON public.ai_usage(user_id, usage_date);

-- Se alguma dessas tabelas já existia (criada à mão no painel), o CREATE TABLE
-- acima é ignorado. Garante aqui as colunas que o app usa.
ALTER TABLE public.daily_logs
  ADD COLUMN IF NOT EXISTS wake_feeling INT,
  ADD COLUMN IF NOT EXISTS sleep_quality INT,
  ADD COLUMN IF NOT EXISTS pain_level INT,
  ADD COLUMN IF NOT EXISTS pain_locations TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS swelling_legs INT,
  ADD COLUMN IF NOT EXISTS mood TEXT,
  ADD COLUMN IF NOT EXISTS energy_level INT,
  ADD COLUMN IF NOT EXISTS stress_level INT,
  ADD COLUMN IF NOT EXISTS pain_comparison TEXT,
  ADD COLUMN IF NOT EXISTS had_emotional_trigger BOOLEAN,
  ADD COLUMN IF NOT EXISTS trigger_description TEXT,
  ADD COLUMN IF NOT EXISTS water_intake_ml INT,
  ADD COLUMN IF NOT EXISTS exercised BOOLEAN,
  ADD COLUMN IF NOT EXISTS exercise_type TEXT,
  ADD COLUMN IF NOT EXISTS exercise_minutes INT,
  ADD COLUMN IF NOT EXISTS exercise_intensity TEXT,
  ADD COLUMN IF NOT EXISTS used_compression BOOLEAN,
  ADD COLUMN IF NOT EXISTS compression_minutes INT,
  ADD COLUMN IF NOT EXISTS did_massage BOOLEAN,
  ADD COLUMN IF NOT EXISTS massage_minutes INT,
  ADD COLUMN IF NOT EXISTS elevated_legs BOOLEAN,
  ADD COLUMN IF NOT EXISTS elevated_legs_minutes INT,
  ADD COLUMN IF NOT EXISTS taken_supplements JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.meal_logs
  ADD COLUMN IF NOT EXISTS food_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.custom_foods
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'extras',
  ADD COLUMN IF NOT EXISTS is_anti_inflammatory BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.ai_reports
  ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'weekly';

-- Índices únicos que o app precisa (o upsert de custom_foods usa
-- onConflict 'user_id,name'; sem isso ele falha). Se já houver linhas
-- duplicadas, avisa em vez de abortar o script inteiro.
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT * FROM (VALUES
    ('uq_daily_logs_user_date_type', 'daily_logs',   'user_id, log_date, log_type'),
    ('uq_meal_logs_user_date_meal',  'meal_logs',    'user_id, log_date, meal_name'),
    ('uq_custom_foods_user_name',    'custom_foods', 'user_id, name'),
    ('uq_ai_usage_user_date',        'ai_usage',     'user_id, usage_date')
  ) AS v(idx, tbl, cols) LOOP
    BEGIN
      EXECUTE format('CREATE UNIQUE INDEX IF NOT EXISTS %I ON public.%I (%s)', r.idx, r.tbl, r.cols);
    EXCEPTION WHEN unique_violation THEN
      RAISE NOTICE 'Duplicatas em %, índice % não criado — limpe e rode de novo.', r.tbl, r.idx;
    END;
  END LOOP;
END $$;

-- RLS + policy "só os próprios dados" para as tabelas novas
ALTER TABLE public.daily_logs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_logs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_reports   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage     ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['daily_logs','meal_logs','custom_foods'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "own_data_%s" ON public.%I', t, t);
    EXECUTE format(
      'CREATE POLICY "own_data_%s" ON public.%I FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)',
      t, t);
  END LOOP;
END $$;

-- As policies do 2º script não tinham WITH CHECK
DROP POLICY IF EXISTS "Users see own reports" ON public.ai_reports;
CREATE POLICY "Users see own reports" ON public.ai_reports
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users see own supplements" ON public.supplements;
DROP POLICY IF EXISTS "own_data_supplements" ON public.supplements;
CREATE POLICY "own_data_supplements" ON public.supplements
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 6. COTA DE IA — controlada no servidor, não no navegador
-- Antes o contador ficava em ai_usage e o próprio navegador fazia
-- UPDATE nele: bastava zerar o contador para ter IA ilimitada.
-- Agora a usuária só LÊ ai_usage; quem incrementa é consume_ai_quota().
-- ------------------------------------------------------------
ALTER TABLE public.ai_usage
  ADD COLUMN IF NOT EXISTS report_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS food_check_count INTEGER DEFAULT 0;

DROP POLICY IF EXISTS "Users see own usage" ON public.ai_usage;
DROP POLICY IF EXISTS "usage_select_own" ON public.ai_usage;
CREATE POLICY "usage_select_own" ON public.ai_usage
  FOR SELECT USING (auth.uid() = user_id);

-- Plano efetivo: trial vence 7 dias após trial_started_at
CREATE OR REPLACE FUNCTION public.effective_plan(p_user UUID)
RETURNS TEXT AS $$
  SELECT CASE
    WHEN p.subscription_status = 'trial'
         AND COALESCE(p.trial_started_at, p.created_at) + INTERVAL '7 days' < NOW()
      THEN 'expired'
    ELSE COALESCE(p.subscription_status, 'trial')
  END
  FROM public.profiles p WHERE p.id = p_user;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Consome 1 unidade de cota. Retorna json { allowed, used, limit, plan }.
-- kind: 'coach' (por dia) | 'report' (por mês; trial = 1 no total) | 'food' (por dia)
CREATE OR REPLACE FUNCTION public.consume_ai_quota(kind TEXT)
RETURNS JSON AS $$
DECLARE
  uid UUID := auth.uid();
  plan TEXT;
  lim INT;
  used INT;
BEGIN
  IF uid IS NULL THEN
    RETURN json_build_object('allowed', false, 'reason', 'unauthenticated');
  END IF;

  plan := public.effective_plan(uid);

  IF kind = 'coach' THEN
    lim := CASE plan WHEN 'premium' THEN NULL WHEN 'standard' THEN 20
                     WHEN 'expired' THEN 0 WHEN 'canceled' THEN 0 ELSE 3 END;
    INSERT INTO public.ai_usage (user_id, usage_date) VALUES (uid, CURRENT_DATE)
      ON CONFLICT (user_id, usage_date) DO NOTHING;
    SELECT coach_messages_count INTO used FROM public.ai_usage
      WHERE user_id = uid AND usage_date = CURRENT_DATE FOR UPDATE;
    IF lim IS NOT NULL AND used >= lim THEN
      RETURN json_build_object('allowed', false, 'used', used, 'limit', lim, 'plan', plan);
    END IF;
    UPDATE public.ai_usage SET coach_messages_count = coach_messages_count + 1
      WHERE user_id = uid AND usage_date = CURRENT_DATE;
    RETURN json_build_object('allowed', true, 'used', used + 1, 'limit', lim, 'plan', plan);

  ELSIF kind = 'report' THEN
    lim := CASE plan WHEN 'premium' THEN NULL WHEN 'standard' THEN 4
                     WHEN 'expired' THEN 0 WHEN 'canceled' THEN 0 ELSE 1 END;
    PERFORM pg_advisory_xact_lock(hashtext('report:' || uid::text));
    SELECT COALESCE(SUM(report_count), 0) INTO used FROM public.ai_usage
      WHERE user_id = uid
        AND (plan IN ('trial','free')
             OR usage_date >= date_trunc('month', CURRENT_DATE)::date);
    IF lim IS NOT NULL AND used >= lim THEN
      RETURN json_build_object('allowed', false, 'used', used, 'limit', lim, 'plan', plan);
    END IF;
    INSERT INTO public.ai_usage (user_id, usage_date, report_count) VALUES (uid, CURRENT_DATE, 1)
      ON CONFLICT (user_id, usage_date) DO UPDATE SET report_count = public.ai_usage.report_count + 1;
    RETURN json_build_object('allowed', true, 'used', used + 1, 'limit', lim, 'plan', plan);

  ELSIF kind = 'food' THEN
    lim := CASE WHEN plan IN ('expired','canceled') THEN 0 ELSE 50 END;
    INSERT INTO public.ai_usage (user_id, usage_date) VALUES (uid, CURRENT_DATE)
      ON CONFLICT (user_id, usage_date) DO NOTHING;
    SELECT food_check_count INTO used FROM public.ai_usage
      WHERE user_id = uid AND usage_date = CURRENT_DATE FOR UPDATE;
    IF used >= lim THEN
      RETURN json_build_object('allowed', false, 'used', used, 'limit', lim, 'plan', plan);
    END IF;
    UPDATE public.ai_usage SET food_check_count = food_check_count + 1
      WHERE user_id = uid AND usage_date = CURRENT_DATE;
    RETURN json_build_object('allowed', true, 'used', used + 1, 'limit', lim, 'plan', plan);
  END IF;

  RETURN json_build_object('allowed', false, 'reason', 'invalid_kind');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION public.consume_ai_quota(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.consume_ai_quota(TEXT) TO authenticated;
REVOKE ALL ON FUNCTION public.effective_plan(UUID) FROM PUBLIC, anon, authenticated;
