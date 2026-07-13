-- ============================================================
-- LipWell — SQL Migration
-- Execute este script no Supabase SQL Editor
-- ============================================================

-- 1.1 MODIFICAR tabela profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial',
  ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ DEFAULT NOW();

-- 1.2 CRIAR tabela ai_reports
CREATE TABLE IF NOT EXISTS public.ai_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  log_date DATE NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'weekly'
);

ALTER TABLE public.ai_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own reports" ON public.ai_reports
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_ai_reports_user_date
  ON public.ai_reports(user_id, log_date);

-- 1.3 CRIAR tabela supplements
CREATE TABLE IF NOT EXISTS public.supplements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT,
  schedule TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.supplements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own supplements" ON public.supplements
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_supplements_user_active
  ON public.supplements(user_id, is_active);

-- 1.4 CRIAR tabela ai_usage
CREATE TABLE IF NOT EXISTS public.ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  usage_date DATE DEFAULT CURRENT_DATE NOT NULL,
  coach_messages_count INTEGER DEFAULT 0,
  UNIQUE(user_id, usage_date)
);

ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own usage" ON public.ai_usage
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_ai_usage_user_date
  ON public.ai_usage(user_id, usage_date);
