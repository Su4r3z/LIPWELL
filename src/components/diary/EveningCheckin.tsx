'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Slider } from '@/components/ui/Slider';
import { Chip } from '@/components/ui/Chip';
import { Toggle } from '@/components/ui/Toggle';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { isVisibleInShift } from '@/utils/supplements';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Droplets, Settings } from 'lucide-react';

interface Supplement {
  id: string;
  name: string;
  dosage: string | null;
  schedule: string | null;
  is_active: boolean;
}

export function EveningCheckin({ logDate }: { logDate?: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const totalSteps = 5;

  const [formData, setFormData] = useState({
    energy_level: 5,
    stress_level: 5,
    pain_comparison: 'igual',

    had_emotional_trigger: false,
    trigger_description: '',
    trigger_custom: '',

    water_intake_ml: 1500,

    exercised: false,
    exercise_type: 'caminhada',
    exercise_type_custom: '',
    exercise_minutes: 30,
    exercise_intensity: 'leve',

    used_compression: false,
    compression_minutes: 480, // 8 horas padrão
    did_massage: false,
    massage_minutes: 15,
    elevated_legs: false,
    elevated_legs_minutes: 20,
  });

  // Suplementos
  const [eveningSupplements, setEveningSupplements] = useState<Supplement[]>([]);
  const [takenSupplementIds, setTakenSupplementIds] = useState<Set<string>>(new Set());
  const [loadingSupplements, setLoadingSupplements] = useState(false);

  useEffect(() => {
    const loadSupplements = async () => {
      setLoadingSupplements(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoadingSupplements(false); return; }

      const { data } = await supabase
        .from('supplements')
        .select('id, name, dosage, schedule, is_active')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (data) {
        const filtered = data.filter(s => isVisibleInShift(s.schedule, 'evening'));
        setEveningSupplements(filtered);
      }
      setLoadingSupplements(false);
    };
    loadSupplements();
  }, []);

  const toggleSupplement = (id: string) => {
    setTakenSupplementIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const nextStep = () => setStep(p => Math.min(p + 1, totalSteps));
  const prevStep = () => setStep(p => Math.max(p - 1, 1));
  const addWater = () => setFormData(p => ({ ...p, water_intake_ml: p.water_intake_ml + 250 }));
  const removeWater = () => setFormData(p => ({ ...p, water_intake_ml: Math.max(0, p.water_intake_ml - 250) }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const targetDate = logDate ?? new Date().toISOString().split('T')[0];

      const { data: existing } = await supabase
        .from('daily_logs')
        .select('id')
        .eq('user_id', user.id)
        .eq('log_date', targetDate)
        .eq('log_type', 'evening')
        .maybeSingle();

      // Build taken_supplements array
      const takenSupplements = eveningSupplements
        .filter(s => takenSupplementIds.has(s.id))
        .map(s => ({ supplement_id: s.id, name: s.name }));

      const payload = {
        user_id: user.id,
        log_date: targetDate,
        log_type: 'evening' as const,
        energy_level: formData.energy_level,
        stress_level: formData.stress_level,
        pain_comparison: formData.pain_comparison,
        had_emotional_trigger: formData.had_emotional_trigger,
        trigger_description: formData.trigger_description,
        water_intake_ml: formData.water_intake_ml,
        exercised: formData.exercised,
        exercise_type: formData.exercise_type,
        exercise_minutes: formData.exercise_minutes,
        exercise_intensity: formData.exercise_intensity,
        used_compression: formData.used_compression,
        compression_minutes: formData.compression_minutes,
        did_massage: formData.did_massage,
        massage_minutes: formData.massage_minutes,
        elevated_legs: formData.elevated_legs,
        elevated_legs_minutes: formData.elevated_legs_minutes,
        taken_supplements: takenSupplements,
      };

      let error;
      if (existing?.id) {
        ({ error } = await supabase.from('daily_logs').update(payload).eq('id', existing.id));
      } else {
        ({ error } = await supabase.from('daily_logs').insert(payload));
      }

      if (error) throw error;
      toast.success('Diário noturno salvo!');
      router.back();
    } catch (err) {
      console.error('Erro EveningCheckin:', err);
      toast.error('Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card glass className="max-w-xl mx-auto mt-4 overflow-hidden shadow-modal">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-teal dark:text-mint">Encerramento Noturno</h2>
        <span className="text-sm text-salmon font-semibold tracking-widest uppercase">Passo {step}/{totalSteps}</span>
      </div>

      <div className="h-2 w-full bg-gray-100 dark:bg-dark-border rounded-full mb-8 overflow-hidden relative">
        <div
          className="absolute top-0 left-0 h-full bg-salmon dark:bg-salmon transition-all duration-700 ease-out"
          style={{ width: `${(step / totalSteps) * 100}%` }}
        />
      </div>

      <div className="min-h-[300px]">
        {/* Passo 1 - Energia */}
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
              <label className="block text-sm font-semibold mb-4 text-gray-700 dark:text-gray-200">Qual foi seu nível de energia ao longo do dia?</label>
              <Slider
                value={formData.energy_level}
                onChange={(v) => setFormData({...formData, energy_level: v})}
                min={1} max={10}
                labelLeft="Exausta" labelRight="Com energia"
              />
            </div>
            <div className="pt-4">
              <label className="block text-sm font-semibold mb-4 text-gray-700 dark:text-gray-200">Como você avalia seu estresse geral?</label>
              <Slider
                value={formData.stress_level}
                onChange={(v) => setFormData({...formData, stress_level: v})}
                min={1} max={10}
                labelLeft="Calma" labelRight="Esgotada"
              />
            </div>
          </div>
        )}

        {/* Passo 2 - Dores e Gatilhos */}
        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
              <label className="block text-sm font-semibold mb-5 text-gray-700 dark:text-gray-200">Comparativamente, como a dor se comportou sendo noite vs manhã?</label>
              <div className="flex flex-col gap-3">
                {[
                  { id: 'melhorou', label: 'Melhorou ao longo do dia' },
                  { id: 'igual', label: 'Permaneceu Estável' },
                  { id: 'piorou', label: 'Piorou muito agora de noite' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    className={`p-4 rounded-xl text-left font-medium transition-all duration-200 border-2 active:scale-95 ${
                      formData.pain_comparison === opt.id
                        ? 'border-salmon bg-salmon/10 text-salmon'
                        : 'border-gray-200 dark:border-white/5 text-gray-500 dark:text-gray-400 hover:border-salmon/50'
                    }`}
                    onClick={() => setFormData({...formData, pain_comparison: opt.id})}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-card">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">Gatilho Emocional</p>
                  <p className="text-xs text-gray-500">Notou algum pico de estresse agudo hoje?</p>
                </div>
                <Toggle
                  checked={formData.had_emotional_trigger}
                  onChange={(v) => setFormData({...formData, had_emotional_trigger: v})}
                />
              </div>

              {formData.had_emotional_trigger && (
                <div className="mt-4 p-5 border border-salmon/20 bg-salmon/5 rounded-card animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-sm font-semibold mb-3 text-salmon dark:text-salmon">O que desencadeou esse pico?</label>
                  <div className="flex flex-wrap gap-2">
                    {['Trabalho', 'Família', 'Relacionamento', 'Autoimagem', 'Lipedema', 'Crise Financeira', 'Outro'].map(trigger => (
                      <Chip
                        key={trigger}
                        selected={formData.trigger_description === trigger}
                        onClick={() => setFormData({...formData, trigger_description: trigger})}
                      >
                        {trigger}
                      </Chip>
                    ))}
                  </div>

                  {formData.trigger_description === 'Outro' && (
                    <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <input
                        type="text"
                        placeholder="Quero relatar que o gatilho foi..."
                        value={formData.trigger_custom}
                        onChange={(e) => setFormData({...formData, trigger_custom: e.target.value})}
                        className="w-full bg-white dark:bg-dark p-3 rounded-lg border border-salmon/30 focus:border-salmon focus:outline-none focus:ring-2 focus:ring-salmon/20 text-salmon dark:text-gray-200 placeholder-salmon/50 transition-all font-medium text-sm"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Passo 3 - Água e Atividade Física */}
        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
              <label className="block text-sm font-semibold mb-4 text-gray-700 dark:text-gray-200">Hidratação Total do Dia</label>
              <div className="flex flex-col items-center justify-center p-6 bg-sky/10 dark:bg-sky/5 rounded-2xl border border-sky/20">
                <div className="w-12 h-12 mb-4 rounded-full bg-sky/20 flex items-center justify-center">
                  <Droplets className="w-6 h-6 text-sky" strokeWidth={1.5} />
                </div>
                <div className="flex items-center gap-6">
                  <button onClick={removeWater} className="w-14 h-14 rounded-full bg-white dark:bg-dark-card text-sky text-3xl font-bold shadow-card hover:shadow-card-hover active:scale-95 transition-all focus:outline-none">-</button>
                  <div className="text-center min-w-[120px]">
                    <span className="text-4xl font-bold text-sky">{formData.water_intake_ml}</span>
                    <span className="text-sm text-sky/70 block font-semibold uppercase tracking-widest mt-1">ml</span>
                  </div>
                  <button onClick={addWater} className="w-14 h-14 rounded-full bg-sky text-white text-3xl font-bold shadow-card hover:shadow-card-hover hover:bg-sky/90 active:scale-95 transition-all focus:outline-none">+</button>
                </div>
                <p className="text-xs text-sky mt-5 font-semibold bg-white/50 dark:bg-dark/50 px-3 py-1 rounded-full">+ 1 Copo Cheio (250ml)</p>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-card">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">Atividade Física</p>
                  <p className="text-xs text-gray-500 mt-1">Conseguiu movimentar o corpo hoje?</p>
                </div>
                <Toggle
                  checked={formData.exercised}
                  onChange={(v) => setFormData({...formData, exercised: v})}
                />
              </div>

              {formData.exercised && (
                <div className="mt-4 p-5 border border-teal/20 bg-teal/5 dark:bg-teal/10 rounded-card animate-in fade-in slide-in-from-top-2 duration-300 space-y-6">

                  <div>
                    <label className="block text-sm font-semibold mb-3 text-teal dark:text-mint">Qual atividade?</label>
                    <div className="flex flex-wrap gap-2">
                      {['Caminhada', 'Musculação', 'Pilates', 'Natação', 'Yoga', 'Outro'].map(type => (
                        <Chip
                          key={type}
                          selected={formData.exercise_type === type.toLowerCase()}
                          onClick={() => setFormData({...formData, exercise_type: type.toLowerCase()})}
                        >
                          {type}
                        </Chip>
                      ))}
                    </div>
                    {formData.exercise_type === 'outro' && (
                      <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <input
                          type="text"
                          placeholder="Ex: Dança de salão, Bicicleta..."
                          value={formData.exercise_type_custom}
                          onChange={(e) => setFormData({...formData, exercise_type_custom: e.target.value})}
                          className="w-full bg-white dark:bg-dark p-3 rounded-lg border border-teal/30 focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20 text-teal dark:text-gray-200 placeholder-teal/50 transition-all font-medium text-sm"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-4 text-teal dark:text-mint">Tempo (Em minutos)</label>
                    <Slider
                      value={formData.exercise_minutes}
                      onChange={(v) => setFormData({...formData, exercise_minutes: v})}
                      min={10} max={120} step={10}
                      labelLeft="10m" labelRight="2h"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-teal dark:text-mint mt-6">Intensidade do Treino</label>
                    <div className="flex gap-2">
                      {['Leve', 'Moderada', 'Intensa'].map(level => (
                        <Chip
                          key={level}
                          selected={formData.exercise_intensity === level.toLowerCase()}
                          onClick={() => setFormData({...formData, exercise_intensity: level.toLowerCase()})}
                        >
                          {level}
                        </Chip>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Passo 4 - Ações de Alívio com Tempos */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">Checklist de Cuidado (Ações para Alívio)</h3>

            <div className="space-y-4">
              {/* Compressão */}
              <div className="flex flex-col bg-gray-50 dark:bg-white/5 rounded-card p-4 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">Vestiu a Meia de Compressão?</p>
                  </div>
                  <Toggle
                    checked={formData.used_compression}
                    onChange={(v) => setFormData({...formData, used_compression: v})}
                  />
                </div>
                {formData.used_compression && (
                  <div className="pt-6 pb-2 animate-in fade-in slide-in-from-top-2 duration-300 border-t border-gray-200 dark:border-white/10 mt-4">
                    <label className="block text-xs font-semibold mb-4 text-salmon uppercase tracking-wider">Por quanto tempo? (Horas)</label>
                    <Slider
                      value={formData.compression_minutes / 60}
                      onChange={(v) => setFormData({...formData, compression_minutes: v * 60})}
                      min={1} max={16} step={1}
                      labelLeft="1h" labelRight="16h+"
                    />
                  </div>
                )}
              </div>

              {/* Drenagem / Escovação */}
              <div className="flex flex-col bg-gray-50 dark:bg-white/5 rounded-card p-4 transition-all">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-700 dark:text-gray-300">Fez Drenagem/Escovação a seco?</p>
                  <Toggle
                    checked={formData.did_massage}
                    onChange={(v) => setFormData({...formData, did_massage: v})}
                  />
                </div>
                {formData.did_massage && (
                  <div className="pt-6 pb-2 animate-in fade-in slide-in-from-top-2 duration-300 border-t border-gray-200 dark:border-white/10 mt-4">
                    <label className="block text-xs font-semibold mb-4 text-salmon uppercase tracking-wider">Por quantos minutos?</label>
                    <Slider
                      value={formData.massage_minutes}
                      onChange={(v) => setFormData({...formData, massage_minutes: v})}
                      min={5} max={60} step={5}
                      labelLeft="5m" labelRight="1h"
                    />
                  </div>
                )}
              </div>

              {/* Elevação de Pernas */}
              <div className="flex flex-col bg-gray-50 dark:bg-white/5 rounded-card p-4 transition-all">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-700 dark:text-gray-300">Elevou as pernas para desinchar?</p>
                  <Toggle
                    checked={formData.elevated_legs}
                    onChange={(v) => setFormData({...formData, elevated_legs: v})}
                  />
                </div>
                {formData.elevated_legs && (
                  <div className="pt-6 pb-2 animate-in fade-in slide-in-from-top-2 duration-300 border-t border-gray-200 dark:border-white/10 mt-4">
                    <label className="block text-xs font-semibold mb-4 text-salmon uppercase tracking-wider">Por quantos minutos?</label>
                    <Slider
                      value={formData.elevated_legs_minutes}
                      onChange={(v) => setFormData({...formData, elevated_legs_minutes: v})}
                      min={5} max={45} step={5}
                      labelLeft="5m" labelRight="45m"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Passo 5 — Suplementação */}
        {step === 5 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
              <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-1">Sua Suplementação</h3>
              <p className="text-sm text-gray-500 mb-5">Quais suplementos da noite você já tomou?</p>
            </div>

            {loadingSupplements ? (
              <div className="text-center py-8 text-gray-400 text-sm">Carregando suplementos...</div>
            ) : eveningSupplements.length === 0 ? (
              <div className="p-5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Nenhum suplemento cadastrado para a noite.
                </p>
                <Link
                  href="/settings?tab=supplements"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal dark:text-mint hover:underline underline-offset-2"
                >
                  <Settings className="w-3.5 h-3.5" strokeWidth={1.5} /> Adicione nas Configurações
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {eveningSupplements.map(s => {
                  const taken = takenSupplementIds.has(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggleSupplement(s.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 active:scale-[0.98] ${
                        taken
                          ? 'border-salmon bg-salmon/10 dark:bg-salmon/20'
                          : 'border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-salmon/50'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        taken ? 'bg-salmon border-salmon' : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {taken && (
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`font-semibold ${taken ? 'text-salmon' : 'text-gray-800 dark:text-gray-100'}`}>
                          {s.name}
                        </p>
                        {s.dosage && (
                          <p className="text-xs text-gray-500 mt-0.5">{s.dosage}</p>
                        )}
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full shrink-0 ${
                        taken
                          ? 'bg-salmon/20 text-salmon'
                          : 'bg-gray-100 dark:bg-white/10 text-gray-400'
                      }`}>
                        {taken ? 'Tomei' : 'Marcar'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between mt-10 pt-6 border-t border-gray-100 dark:border-white/5">
        <Button variant="ghost" onClick={prevStep} disabled={step === 1}>
          Voltar
        </Button>
        {step < totalSteps ? (
          <Button variant="primary" onClick={nextStep} className="w-32 bg-salmon hover:bg-[#ff9a9e] text-white shadow-card-hover border-0">Próximo</Button>
        ) : (
          <Button variant="primary" onClick={handleSave} disabled={saving} className="w-auto px-8 bg-salmon text-white hover:bg-[#ff9a9e] border-0">
            {saving ? 'Salvando...' : 'Salvar e Encerrar'}
          </Button>
        )}
      </div>
    </Card>
  );
}
