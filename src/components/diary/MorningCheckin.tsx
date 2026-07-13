'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Slider } from '@/components/ui/Slider';
import { Chip } from '@/components/ui/Chip';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { isVisibleInShift } from '@/utils/supplements';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { SmilePlus, Smile, Minus, Frown, Meh, Settings } from 'lucide-react';

interface Supplement {
  id: string;
  name: string;
  dosage: string | null;
  schedule: string | null;
  is_active: boolean;
}

export function MorningCheckin({ logDate }: { logDate?: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const totalSteps = 5;

  const [formData, setFormData] = useState({
    wake_feeling: 5,
    sleep_quality: 5,
    pain_level: 0,
    pain_locations: [] as string[],
    swelling_legs: 0,
    mood: ''
  });

  // Suplementos
  const [morningSupplements, setMorningSupplements] = useState<Supplement[]>([]);
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
        const filtered = data.filter(s => isVisibleInShift(s.schedule, 'morning'));
        setMorningSupplements(filtered);
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

  const toggleLocation = (loc: string) => {
    setFormData(prev => ({
      ...prev,
      pain_locations: prev.pain_locations.includes(loc)
        ? prev.pain_locations.filter(l => l !== loc)
        : [...prev.pain_locations, loc]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const targetDate = logDate ?? new Date().toISOString().split('T')[0];

      // Check → update/insert (não depende de constraint UNIQUE)
      const { data: existing } = await supabase
        .from('daily_logs')
        .select('id')
        .eq('user_id', user.id)
        .eq('log_date', targetDate)
        .eq('log_type', 'morning')
        .maybeSingle();

      // Build taken_supplements array
      const takenSupplements = morningSupplements
        .filter(s => takenSupplementIds.has(s.id))
        .map(s => ({ supplement_id: s.id, name: s.name }));

      const payload = {
        user_id: user.id,
        log_date: targetDate,
        log_type: 'morning' as const,
        wake_feeling: formData.wake_feeling,
        sleep_quality: formData.sleep_quality,
        pain_level: formData.pain_level,
        pain_locations: formData.pain_locations,
        swelling_legs: formData.swelling_legs,
        mood: formData.mood,
        taken_supplements: takenSupplements,
      };

      let error;
      if (existing?.id) {
        ({ error } = await supabase.from('daily_logs').update(payload).eq('id', existing.id));
      } else {
        ({ error } = await supabase.from('daily_logs').insert(payload));
      }

      if (error) throw error;
      toast.success('Diário matinal salvo!');
      router.back();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card glass className="max-w-xl mx-auto mt-4 overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-teal dark:text-mint">Resumo Matinal</h2>
        <span className="text-sm text-sky font-semibold tracking-widest uppercase">Passo {step}/{totalSteps}</span>
      </div>

      <div className="h-2 w-full bg-gray-100 dark:bg-dark-border rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-sky dark:bg-mint transition-all duration-500 ease-out"
          style={{ width: `${(step / totalSteps) * 100}%` }}
        />
      </div>

      <div className="min-h-[300px]">
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
              <label className="block text-sm font-semibold mb-4 text-gray-700 dark:text-gray-200">Como você acordou se sentindo hoje?</label>
              <Slider
                value={formData.wake_feeling}
                onChange={(v) => setFormData({...formData, wake_feeling: v})}
                min={1} max={10}
                labelLeft="Péssima" labelRight="Excelente"
              />
            </div>
            <div className="pt-4">
              <label className="block text-sm font-semibold mb-4 text-gray-700 dark:text-gray-200">Qualidade do seu Sono</label>
              <Slider
                value={formData.sleep_quality}
                onChange={(v) => setFormData({...formData, sleep_quality: v})}
                min={1} max={10}
                labelLeft="Não dormi" labelRight="Dormi muito bem"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
              <label className="block text-sm font-semibold mb-4 text-gray-700 dark:text-gray-200">Nível GERAL de Dor no Corpo (Lipedema)</label>
              <Slider
                value={formData.pain_level}
                onChange={(v) => setFormData({...formData, pain_level: v})}
                min={0} max={10}
                labelLeft="Sem dor" labelRight="Intensa"
              />
            </div>
            <div className="pt-4">
              <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-200">Onde a dor está pior?</label>
              <div className="flex flex-wrap gap-2">
                {['Coxas', 'Joelhos', 'Panturrilhas', 'Tornozelos', 'Braços', 'Quadril'].map(loc => (
                  <Chip
                    key={loc}
                    selected={formData.pain_locations.includes(loc)}
                    onClick={() => toggleLocation(loc)}
                  >
                    {loc}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
              <label className="block text-sm font-semibold mb-4 text-gray-700 dark:text-gray-200">Volume de Inchaço das Pernas</label>
              <Slider
                value={formData.swelling_legs}
                onChange={(v) => setFormData({...formData, swelling_legs: v})}
                min={0} max={10}
                labelLeft="Normal" labelRight="Muito Inchada"
              />
            </div>
            <div className="p-4 bg-mint/10 rounded-lg border border-mint/20 mt-4">
              <p className="text-sm text-teal dark:text-mint leading-relaxed">
                <span className="font-bold">Dica LipWell:</span> Beba um copo de 300ml de água logo ao acordar para ajudar seu sistema linfático a drenar os fluidos acumulados à noite!
              </p>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-200">Qual seu Humor para essa Manhã?</label>
              <div className="flex flex-wrap gap-3">
                {[
                  { id: 'otimo', label: 'Ótimo', icon: <SmilePlus className="w-4 h-4" strokeWidth={1.5} /> },
                  { id: 'bom', label: 'Bom', icon: <Smile className="w-4 h-4" strokeWidth={1.5} /> },
                  { id: 'neutro', label: 'Neutro', icon: <Minus className="w-4 h-4" strokeWidth={1.5} /> },
                  { id: 'ruim', label: 'Ruim', icon: <Meh className="w-4 h-4" strokeWidth={1.5} /> },
                  { id: 'pessimo', label: 'Péssimo', icon: <Frown className="w-4 h-4" strokeWidth={1.5} /> },
                ].map(m => (
                  <Chip
                    key={m.id}
                    selected={formData.mood === m.id}
                    onClick={() => setFormData({...formData, mood: m.id})}
                    className="min-w-[100px] gap-1.5"
                  >
                    {m.icon}{m.label}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
              <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-1">Sua Suplementação</h3>
              <p className="text-sm text-gray-500 mb-5">Quais suplementos da manhã você já tomou?</p>
            </div>

            {loadingSupplements ? (
              <div className="text-center py-8 text-gray-400 text-sm">Carregando suplementos...</div>
            ) : morningSupplements.length === 0 ? (
              <div className="p-5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Nenhum suplemento cadastrado para a manhã.
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
                {morningSupplements.map(s => {
                  const taken = takenSupplementIds.has(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggleSupplement(s.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 active:scale-[0.98] ${
                        taken
                          ? 'border-teal bg-teal/10 dark:bg-teal/20'
                          : 'border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-teal/50'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        taken ? 'bg-teal border-teal' : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {taken && (
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`font-semibold ${taken ? 'text-teal dark:text-mint' : 'text-gray-800 dark:text-gray-100'}`}>
                          {s.name}
                        </p>
                        {s.dosage && (
                          <p className="text-xs text-gray-500 mt-0.5">{s.dosage}</p>
                        )}
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full shrink-0 ${
                        taken
                          ? 'bg-teal/20 text-teal dark:text-mint'
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
          <Button variant="primary" onClick={nextStep} className="w-32">Próximo</Button>
        ) : (
          <Button variant="primary" onClick={handleSave} disabled={saving} className="w-40 bg-teal text-white">
            {saving ? 'Salvando...' : 'Salvar Diário'}
          </Button>
        )}
      </div>
    </Card>
  );
}
