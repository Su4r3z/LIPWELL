export type LipedemaStage = '1' | '2' | '3' | '4' | 'nao_sei';
export type SubscriptionStatus = 'trial' | 'active' | 'canceled' | 'past_due' | 'expired';
export type SubscriptionPlan = 'trial' | 'basico' | 'premium' | 'comunidade';

export interface Profile {
  id: string; // UUID from auth.users
  full_name: string;
  birth_date: string | null;
  lipedema_stage: LipedemaStage | null;
  diagnosis_date: string | null;
  avatar_url: string | null;
  timezone: string;
  onboarding_completed: boolean;
  trial_start: string;
  trial_end: string;
  subscription_status: SubscriptionStatus;
  subscription_plan: SubscriptionPlan;
  mp_customer_id: string | null;
  mp_preapproval_id: string | null;
  ia_chat_count: number;
  ia_chat_month: string | null;
  dark_mode: boolean;
  notify_morning: boolean;
  notify_evening: boolean;
  notify_time_morning: string;
  notify_time_evening: string;
  created_at: string;
  updated_at: string;
}

export type EntryType = 'morning' | 'evening';
export type TouchSensitivity = 'normal' | 'sensivel' | 'muito_sensivel';
export type LegTemperature = 'normal' | 'quentes' | 'frias';
export type MoodType = 'otimo' | 'bom' | 'neutro' | 'ruim' | 'pessimo';
export type MenstrualPhase = 'menstruacao' | 'folicular' | 'ovulacao' | 'lutea' | 'menopausa' | 'nao_aplica';
export type PainComparison = 'melhorou' | 'igual' | 'piorou';
export type ExerciseIntensity = 'leve' | 'moderada' | 'intensa';
export type BowelType = 'normal' | 'solto' | 'preso';

export interface DiaryEntry {
  id: string;
  user_id: string;
  entry_date: string;
  entry_type: EntryType;
  
  // Morning
  wake_feeling?: number;
  sleep_quality?: number;
  sleep_hours?: number;
  woke_at_night?: boolean;
  woke_times?: number;
  pain_level?: number;
  pain_locations?: string[];
  swelling_legs?: number;
  swelling_arms?: number;
  leg_heaviness?: number;
  touch_sensitivity?: TouchSensitivity;
  weight?: number;
  fluid_retention?: boolean;
  leg_temperature?: LegTemperature;
  mood?: MoodType;
  anxiety?: number;
  self_esteem?: number;
  menstrual_phase?: MenstrualPhase;
  has_cramps?: boolean;
  cramp_intensity?: number;
  
  // Evening
  energy_level?: number;
  end_of_day?: number;
  stress_level?: number;
  had_emotional_trigger?: boolean;
  trigger_description?: string;
  pain_comparison?: PainComparison;
  water_intake_ml?: number;
  had_tea?: boolean;
  tea_types?: string[];
  had_juice?: boolean;
  exercised?: boolean;
  exercise_types?: string[];
  exercise_minutes?: number;
  exercise_intensity?: ExerciseIntensity;
  used_compression?: boolean;
  compression_hours?: number;
  did_massage?: boolean;
  did_dry_brushing?: boolean;
  elevated_legs?: boolean;
  bowel_worked?: boolean;
  bowel_type?: BowelType;
  notes?: string;
  
  created_at: string;
}

export type MealName = 'cafe_manha' | 'lanche_manha' | 'almoco' | 'lanche_tarde' | 'jantar' | 'ceia';
export type FoodCategory = 'proteinas' | 'carboidratos' | 'verduras_legumes' | 'frutas' | 'gorduras_boas' | 'liquidos' | 'extras';

export interface Meal {
  id: string;
  user_id: string;
  diary_entry_id: string | null;
  meal_date: string;
  meal_name: MealName;
  meal_order: number;
  created_at: string;
}

export interface MealItem {
  id: string;
  meal_id: string;
  user_id: string;
  food_name: string;
  category: FoodCategory;
  is_custom: boolean;
  created_at: string;
}

export interface FavoriteFood {
  id: string;
  user_id: string;
  food_name: string;
  category: FoodCategory;
  times_selected: number;
  last_selected_at: string;
}

export interface Supplement {
  id: string;
  user_id: string;
  name: string;
  time_of_day: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export type SupplementStatus = 'taken' | 'not_taken' | 'side_effect';
export type SkipReason = 'esqueci' | 'acabou' | 'mal_estar' | 'optei_nao' | 'outro';

export interface DailySupplement {
  id: string;
  user_id: string;
  supplement_id: string;
  log_date: string;
  status: SupplementStatus;
  skip_reason?: SkipReason;
  skip_reason_other?: string;
  side_effect_description?: string;
  created_at: string;
}

export interface Measurement {
  id: string;
  user_id: string;
  measurement_date: string;
  weight?: number;
  thigh_left?: number;
  thigh_right?: number;
  calf_left?: number;
  calf_right?: number;
  ankle_left?: number;
  ankle_right?: number;
  arm_left?: number;
  arm_right?: number;
  waist?: number;
  hip?: number;
  notes?: string;
  created_at: string;
}

export type InsightType = 'monthly' | 'weekly' | 'on_demand' | 'chat';

export interface AiInsight {
  id: string;
  user_id: string;
  insight_type: InsightType;
  period_start?: string;
  period_end?: string;
  prompt_sent?: string;
  response_text: string;
  tokens_used?: number;
  model: string;
  created_at: string;
}

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  user_id: string;
  role: ChatRole;
  content: string;
  month_year: string;
  created_at: string;
}
