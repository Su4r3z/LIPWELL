'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { format, parseISO, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2, ArrowLeft, Sun, Moon, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { MorningCheckin } from '@/components/diary/MorningCheckin';
import { EveningCheckin } from '@/components/diary/EveningCheckin';
import { MealModal } from '@/components/meals/MealModal';
import { FoodItem } from '@/lib/constants/foods';

interface TakenSupplement {
  supplement_id: string;
  name: string;
}

export default function DailySummaryPage() {
  const params = useParams();
  const router = useRouter();
  const dateParam = params.date as string;

  const supabase = createClient();
  const dateObj = parseISO(dateParam || new Date().toISOString());

  const [isLoading, setIsLoading] = useState(true);
  const [morningEntry, setMorningEntry] = useState<Record<string, unknown> | null>(null);
  const [eveningEntry, setEveningEntry] = useState<Record<string, unknown> | null>(null);
  const [view, setView] = useState<'summary' | 'fill-morning' | 'fill-evening'>('summary');

  // Alimentação
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [activeMealTitle, setActiveMealTitle] = useState('Café da Manhã');
  const [dailyMeals, setDailyMeals] = useState<{ name: string; items: FoodItem[] }[]>([]);

  // Suplementos (para exibir na página de resumo)
  const [supplementsMap, setSupplementsMap] = useState<Record<string, { name: string; dosage: string | null }>>({});

  const handleOpenMeal = (mealName: string) => {
    setActiveMealTitle(mealName);
    setIsMealModalOpen(true);
  };

  const handleSaveMeal = async (selectedItems: FoodItem[]) => {
    setDailyMeals(prev => {
      const filtered = prev.filter(m => m.name !== activeMealTitle);
      return [...filtered, { name: activeMealTitle, items: selectedItems }];
    });
    setIsMealModalOpen(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: existing } = await supabase
        .from('meal_logs')
        .select('id')
        .eq('user_id', user.id)
        .eq('log_date', dateParam)
        .eq('meal_name', activeMealTitle)
        .maybeSingle();

      if (existing?.id) {
        await supabase.from('meal_logs')
          .update({ food_items: selectedItems })
          .eq('id', existing.id);
      } else {
        await supabase.from('meal_logs').insert({
          user_id: user.id,
          log_date: dateParam,
          meal_name: activeMealTitle,
          food_items: selectedItems,
        });
      }
    } catch (e) {
      console.error('Erro ao salvar refeição:', e);
    }
  };

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (user && dateParam) {
        // Busca check-ins (daily_logs)
        const { data: logs } = await supabase
          .from('daily_logs')
          .select('*')
          .eq('user_id', user.id)
          .eq('log_date', dateParam);

        if (logs) {
          setMorningEntry(logs.find(e => e.log_type === 'morning') ?? null);
          setEveningEntry(logs.find(e => e.log_type === 'evening') ?? null);
        }

        // Busca refeições (meal_logs)
        const { data: meals } = await supabase
          .from('meal_logs')
          .select('meal_name, food_items')
          .eq('user_id', user.id)
          .eq('log_date', dateParam);

        if (meals) {
          setDailyMeals(meals.map(m => ({ name: m.meal_name, items: m.food_items as FoodItem[] })));
        }

        // Busca suplementos do usuário para enriquecer os dados (dosage)
        const { data: supplements } = await supabase
          .from('supplements')
          .select('id, name, dosage')
          .eq('user_id', user.id);

        if (supplements) {
          const map: Record<string, { name: string; dosage: string | null }> = {};
          supplements.forEach(s => { map[s.id] = { name: s.name, dosage: s.dosage }; });
          setSupplementsMap(map);
        }
      }
      setIsLoading(false);
    }
    if (dateParam) loadData();
  }, [dateParam]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 text-teal animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Consultando seus dados do dia...</p>
      </div>
    );
  }

  // Redirecionadores Internos
  if (view === 'fill-morning') {
    return (
      <div className="pt-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <button onClick={() => setView('summary')} className="flex items-center text-gray-500 hover:text-teal mb-6 font-semibold px-4 sm:px-0">
          <ArrowLeft className="w-5 h-5 mr-2" /> Voltar ao resumo
        </button>
        <MorningCheckin logDate={dateParam} />
      </div>
    );
  }

  if (view === 'fill-evening') {
    return (
      <div className="pt-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <button onClick={() => setView('summary')} className="flex items-center text-gray-500 hover:text-teal mb-6 font-semibold px-4 sm:px-0">
          <ArrowLeft className="w-5 h-5 mr-2" /> Voltar ao resumo
        </button>
        <EveningCheckin logDate={dateParam} />
      </div>
    );
  }

  const isDateToday = isToday(dateObj);

  // Helper: extrai suplementos tomados enriquecidos com dosagem
  const getTakenSupplements = (entry: Record<string, unknown> | null): TakenSupplement[] => {
    if (!entry) return [];
    const raw = entry.taken_supplements;
    if (!Array.isArray(raw)) return [];
    return raw as TakenSupplement[];
  };

  const morningTaken = getTakenSupplements(morningEntry);
  const eveningTaken = getTakenSupplements(eveningEntry);

  return (
    <div className="max-w-2xl mx-auto space-y-6 px-4 sm:px-0 pb-24 animate-in fade-in duration-500">
      <div className="flex items-center mb-8">
        <button onClick={() => router.push('/diary')} className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-full transition-colors mr-4">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-dark dark:text-white capitalize">
            {format(dateObj, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
            {isDateToday ? 'Como você se sentiu hoje?' : 'Revendo o passado.'}
          </p>
        </div>
      </div>

      {/* Cartão da Manhã */}
      <Card className="p-5 sm:p-6 transition-all border-l-4 border-l-orange-400 dark:border-l-orange-500 shadow-sm hover:shadow-card">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center shrink-0">
            <Sun className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-0.5">Check-in da Manhã</h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Tudo que você sentiu ao acordar.</p>
          </div>
        </div>
        <div className="w-full">
          {morningEntry ? (
            <div className="space-y-4 mt-3">
              <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-white/5 p-4 rounded-xl leading-relaxed">
                Você registrou que acordou com dor nível <b>{String(morningEntry.pain_level ?? 0)}</b>/10 e humor <b>{String(morningEntry.mood ?? 'não relatado')}</b>. Inchaço nas pernas: <b>{String(morningEntry.swelling_legs ?? 0)}</b>/10.
              </p>

              {/* Suplementos da manhã */}
              <div className="pt-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">💊 Suplementos da Manhã</p>
                {morningTaken.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Nenhum suplemento registrado</p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {morningTaken.map(ts => {
                      const sup = supplementsMap[ts.supplement_id];
                      const dosage = sup?.dosage ?? '';
                      return (
                        <p key={ts.supplement_id} className="text-sm text-teal dark:text-mint font-medium">
                          ✅ {ts.name}{dosage ? ` - ${dosage}` : ''}
                        </p>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="inline-flex items-center rounded-full bg-mint/40 px-3 py-1 text-xs font-semibold text-teal dark:text-mint ring-1 ring-inset ring-teal/20">Preenchido com Sucesso ✅</span>
                <button className="text-sm font-semibold text-teal hover:text-teal-light underline underline-offset-2" onClick={() => setView('fill-morning')}>
                  Revisar ou Editar
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 mt-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Você ainda não nos contou como acordou neste dia. O registro da manhã ajuda a prever inchaços à tarde.</p>
              <div className="pt-2">
                <Button onClick={() => setView('fill-morning')} className="w-full sm:w-auto bg-orange-400 hover:bg-orange-500 text-white shadow-none border-0">
                  📝 Preencher Manhã Agora
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Cartão de Alimentação */}
      <Card className="p-5 sm:p-6 transition-all border-l-4 border-l-emerald-500 shadow-sm hover:shadow-card">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
            <Utensils className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-0.5">Rastreador de Alimentação</h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-2">Mantenha seu diário de dietas para identificar gatilhos de dores e inchaços.</p>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {['Café da Manhã', 'Lanche da Manhã', 'Almoço', 'Lanche da Tarde', 'Jantar', 'Ceia'].map(meal => {
            const filledMeal = dailyMeals.find(m => m.name === meal);
            const hasItems = filledMeal && filledMeal.items.length > 0;
            return (
              <div key={meal} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10">
                <div className="mb-2 sm:mb-0">
                  <p className="font-semibold text-gray-700 dark:text-gray-200">{meal}</p>
                  {hasItems ? (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 line-clamp-1">
                      {filledMeal.items.map(i => i.name).join(', ')}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-1">Nenhum registro</p>
                  )}
                </div>
                <Button
                  onClick={() => handleOpenMeal(meal)}
                  variant={hasItems ? 'outline' : 'secondary'}
                  className={hasItems ? "border-emerald-200 text-emerald-600 hover:bg-emerald-50 text-xs py-1 h-9 ml-auto" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 text-xs py-1 h-9 shadow-none ml-auto"}
                >
                  {hasItems ? 'Editar Prato' : '+ Adicionar'}
                </Button>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Cartão da Noite */}
      <Card className="p-5 sm:p-6 transition-all border-l-4 border-l-indigo-500 shadow-sm hover:shadow-card">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center shrink-0">
            <Moon className="w-6 h-6 text-indigo-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-0.5">Encerramento Noturno</h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Resumo do dia, hidratação e sono.</p>
          </div>
        </div>
        <div className="w-full">
          {eveningEntry ? (
            <div className="space-y-4 mt-3">
              <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-white/5 p-4 rounded-xl leading-relaxed">
                Estresse: <b>{String(eveningEntry.stress_level ?? '-')}/10</b>, Água: <b>{String(eveningEntry.water_intake_ml ?? '-')}ml</b>. Meia de compressão: <b>{eveningEntry.used_compression ? 'Sim' : 'Não'}</b>.
              </p>

              {/* Suplementos da noite */}
              <div className="pt-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">💊 Suplementos da Noite</p>
                {eveningTaken.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Nenhum suplemento registrado</p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {eveningTaken.map(ts => {
                      const sup = supplementsMap[ts.supplement_id];
                      const dosage = sup?.dosage ?? '';
                      return (
                        <p key={ts.supplement_id} className="text-sm text-indigo-500 dark:text-indigo-400 font-medium">
                          ✅ {ts.name}{dosage ? ` - ${dosage}` : ''}
                        </p>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="inline-flex items-center rounded-full bg-mint/40 px-3 py-1 text-xs font-semibold text-teal dark:text-mint ring-1 ring-inset ring-teal/20">Preenchido com Sucesso ✅</span>
                <button className="text-sm font-semibold text-indigo-500 hover:text-indigo-400 underline underline-offset-2" onClick={() => setView('fill-evening')}>
                  Revisar ou Editar
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 mt-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Como foi o seu fim de dia? O fechamento noturno molda os relatórios de dor.</p>
              <div className="pt-2">
                <Button onClick={() => setView('fill-evening')} className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-600 text-white shadow-none border-0">
                  📝 Fazer o Check-in da Noite
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      <MealModal
        isOpen={isMealModalOpen}
        onClose={() => setIsMealModalOpen(false)}
        title={activeMealTitle}
        onSave={handleSaveMeal}
        initialItems={dailyMeals.find(m => m.name === activeMealTitle)?.items || []}
      />
    </div>
  );
}
