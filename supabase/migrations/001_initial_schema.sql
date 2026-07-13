-- PROFILES
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  birth_date DATE,
  lipedema_stage TEXT CHECK (lipedema_stage IN ('1','2','3','4','nao_sei')),
  diagnosis_date DATE,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  trial_start DATE DEFAULT CURRENT_DATE,
  trial_end DATE DEFAULT (CURRENT_DATE + INTERVAL '5 days'),
  subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial','active','canceled','past_due','expired')),
  subscription_plan TEXT DEFAULT 'trial' CHECK (subscription_plan IN ('trial','basico','premium','comunidade')),
  mp_customer_id TEXT,
  mp_preapproval_id TEXT,
  ia_chat_count INT DEFAULT 0,
  ia_chat_month TEXT,
  dark_mode BOOLEAN DEFAULT FALSE,
  notify_morning BOOLEAN DEFAULT TRUE,
  notify_evening BOOLEAN DEFAULT TRUE,
  notify_time_morning TIME DEFAULT '08:00',
  notify_time_evening TIME DEFAULT '20:00',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DIARY_ENTRIES
CREATE TABLE public.diary_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('morning','evening')),
  
  -- Morning fields
  wake_feeling INT CHECK (wake_feeling BETWEEN 1 AND 10),
  sleep_quality INT CHECK (sleep_quality BETWEEN 1 AND 10),
  sleep_hours NUMERIC(3,1),
  woke_at_night BOOLEAN,
  woke_times INT,
  pain_level INT CHECK (pain_level BETWEEN 0 AND 10),
  pain_locations TEXT[],
  swelling_legs INT CHECK (swelling_legs BETWEEN 0 AND 10),
  swelling_arms INT CHECK (swelling_arms BETWEEN 0 AND 10),
  leg_heaviness INT CHECK (leg_heaviness BETWEEN 0 AND 10),
  touch_sensitivity TEXT CHECK (touch_sensitivity IN ('normal','sensivel','muito_sensivel')),
  weight NUMERIC(5,2),
  fluid_retention BOOLEAN,
  leg_temperature TEXT CHECK (leg_temperature IN ('normal','quentes','frias')),
  mood TEXT CHECK (mood IN ('otimo','bom','neutro','ruim','pessimo')),
  anxiety INT CHECK (anxiety BETWEEN 0 AND 10),
  self_esteem INT CHECK (self_esteem BETWEEN 1 AND 10),
  menstrual_phase TEXT CHECK (menstrual_phase IN ('menstruacao','folicular','ovulacao','lutea','menopausa','nao_aplica')),
  has_cramps BOOLEAN,
  cramp_intensity INT CHECK (cramp_intensity BETWEEN 1 AND 10),
  
  -- Evening fields
  energy_level INT CHECK (energy_level BETWEEN 1 AND 10),
  end_of_day INT CHECK (end_of_day BETWEEN 1 AND 10),
  stress_level INT CHECK (stress_level BETWEEN 1 AND 10),
  had_emotional_trigger BOOLEAN,
  trigger_description TEXT,
  pain_comparison TEXT CHECK (pain_comparison IN ('melhorou','igual','piorou')),
  water_intake_ml INT DEFAULT 0,
  had_tea BOOLEAN,
  tea_types TEXT[],
  had_juice BOOLEAN,
  exercised BOOLEAN,
  exercise_types TEXT[],
  exercise_minutes INT,
  exercise_intensity TEXT CHECK (exercise_intensity IN ('leve','moderada','intensa')),
  used_compression BOOLEAN,
  compression_hours INT,
  did_massage BOOLEAN,
  did_dry_brushing BOOLEAN,
  elevated_legs BOOLEAN,
  bowel_worked BOOLEAN,
  bowel_type TEXT CHECK (bowel_type IN ('normal','solto','preso')),
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, entry_date, entry_type)
);

-- MEALS
CREATE TABLE public.meals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  diary_entry_id UUID REFERENCES public.diary_entries(id) ON DELETE CASCADE,
  meal_date DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_name TEXT NOT NULL CHECK (meal_name IN ('cafe_manha','lanche_manha','almoco','lanche_tarde','jantar','ceia')),
  meal_order INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MEAL_ITEMS
CREATE TABLE public.meal_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_id UUID REFERENCES public.meals(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  food_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('proteinas','carboidratos','verduras_legumes','frutas','gorduras_boas','liquidos','extras')),
  is_custom BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FAVORITE_FOODS
CREATE TABLE public.favorite_foods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  food_name TEXT NOT NULL,
  category TEXT NOT NULL,
  times_selected INT DEFAULT 1,
  last_selected_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, food_name, category)
);

-- SUPPLEMENTS
CREATE TABLE public.supplements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  time_of_day TIME,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DAILY_SUPPLEMENTS
CREATE TABLE public.daily_supplements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  supplement_id UUID REFERENCES public.supplements(id) ON DELETE CASCADE NOT NULL,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status IN ('taken','not_taken','side_effect')),
  skip_reason TEXT CHECK (skip_reason IN ('esqueci','acabou','mal_estar','optei_nao','outro')),
  skip_reason_other TEXT,
  side_effect_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, supplement_id, log_date)
);

-- MEASUREMENTS
CREATE TABLE public.measurements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  measurement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  weight NUMERIC(5,2),
  thigh_left NUMERIC(5,2),
  thigh_right NUMERIC(5,2),
  calf_left NUMERIC(5,2),
  calf_right NUMERIC(5,2),
  ankle_left NUMERIC(5,2),
  ankle_right NUMERIC(5,2),
  arm_left NUMERIC(5,2),
  arm_right NUMERIC(5,2),
  waist NUMERIC(5,2),
  hip NUMERIC(5,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI_INSIGHTS
CREATE TABLE public.ai_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('monthly','weekly','on_demand','chat')),
  period_start DATE,
  period_end DATE,
  prompt_sent TEXT,
  response_text TEXT NOT NULL,
  tokens_used INT,
  model TEXT DEFAULT 'claude-sonnet-4-5-20250929',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CHAT_MESSAGES
CREATE TABLE public.chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content TEXT NOT NULL,
  month_year TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_diary_user_date ON diary_entries(user_id, entry_date DESC);
CREATE INDEX idx_meals_user_date ON meals(user_id, meal_date DESC);
CREATE INDEX idx_meal_items_meal ON meal_items(meal_id);
CREATE INDEX idx_favorites_user ON favorite_foods(user_id, times_selected DESC);
CREATE INDEX idx_supplements_user ON supplements(user_id, is_active);
CREATE INDEX idx_daily_supps_user ON daily_supplements(user_id, log_date);
CREATE INDEX idx_measurements_user ON measurements(user_id, measurement_date DESC);
CREATE INDEX idx_insights_user ON ai_insights(user_id, insight_type);
CREATE INDEX idx_chat_user_month ON chat_messages(user_id, month_year);

-- RLS (Row Level Security - Habilitar para todas as tabelas)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplements ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_supplements ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies (Padrão Rigoroso: usuário acessa somente seus dados)
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'diary_entries','meals','meal_items','favorite_foods',
    'supplements','daily_supplements','measurements',
    'ai_insights','chat_messages'
  ]) LOOP
    EXECUTE format('CREATE POLICY "own_data_%s" ON %I FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)', t, t);
  END LOOP;
END $$;

-- Policy Profile
CREATE POLICY "own_profile" ON profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Trigger: criar profile no signup (Automação Segura do Supabase Auth)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Nova Usuária'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
