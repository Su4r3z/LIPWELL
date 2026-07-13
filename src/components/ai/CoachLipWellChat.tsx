'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircleHeart, X, Send, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

const SUGGESTIONS = [
  'O que piorou meu inchaço recentemente?',
  'Como foi minha hidratação na semana?',
  'Quais dias me senti melhor e por quê?',
  'Estou seguindo bem a dieta anti-inflamatória?',
];

// Limite diário por plano
function getDailyLimit(status: string): number | null {
  if (status === 'premium') return null; // ilimitado
  if (status === 'standard') return 20;
  return 3; // trial, free, basic
}

function getLimitMessage(status: string, limit: number): string {
  if (status === 'basic') {
    return `Limite de ${limit} mensagens por dia no Básico. Faça upgrade pro Standard pra ter 20 por dia! ⭐`;
  }
  if (status === 'standard') {
    return `Limite de ${limit} mensagens por dia no Standard. No Premium é ilimitado! 💎`;
  }
  return `Limite atingido. Assine um plano pra continuar conversando! 💬`;
}

async function buildUserContext(): Promise<string> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return '';

  const today = new Date();
  const sevenDaysAgo = format(subDays(today, 6), 'yyyy-MM-dd');
  const todayStr = format(today, 'yyyy-MM-dd');

  const [{ data: profile }, { data: logs }, { data: meals }] = await Promise.all([
    supabase.from('profiles').select('full_name, lipedema_stage, pain_concentration').eq('id', user.id).single(),
    supabase.from('daily_logs')
      .select('log_date, log_type, pain_level, energy_level, mood, wake_feeling, water_intake_ml, used_compression, exercised, swelling_legs')
      .eq('user_id', user.id)
      .gte('log_date', sevenDaysAgo)
      .lte('log_date', todayStr)
      .order('log_date', { ascending: false }),
    supabase.from('meal_logs')
      .select('log_date, meal_name, food_items')
      .eq('user_id', user.id)
      .gte('log_date', sevenDaysAgo)
      .limit(10),
  ]);

  const name = profile?.full_name ?? 'usuária';
  const stage = profile?.lipedema_stage ?? 'não informado';
  const painArea = profile?.pain_concentration ?? 'não informado';

  const logsText = logs?.map(l => {
    const date = format(new Date(l.log_date + 'T12:00:00'), "EEEE (dd/MM)", { locale: ptBR });
    if (l.log_type === 'morning') {
      return `${date} manhã: dor=${l.pain_level ?? '?'}/10, inchaço=${l.swelling_legs ?? '?'}, humor=${l.mood ?? '?'}, acordou sentindo=${l.wake_feeling ?? '?'}`;
    }
    return `${date} noite: energia=${l.energy_level ?? '?'}/10, água=${l.water_intake_ml ?? '?'}ml, compressão=${l.used_compression ? 'sim' : 'não'}, exercitou=${l.exercised ? 'sim' : 'não'}`;
  }).join('\n') ?? 'Sem registros.';

  const mealsText = meals?.map(m => {
    const items = Array.isArray(m.food_items)
      ? m.food_items.map((f: { name: string }) => f.name).join(', ')
      : '—';
    return `${m.log_date} - ${m.meal_name}: ${items}`;
  }).join('\n') ?? 'Sem refeições registradas.';

  return `Paciente: ${name} | Estágio: ${stage} | Área de dor: ${painArea}\n\nCheck-ins (últimos 7 dias):\n${logsText}\n\nRefeições recentes:\n${mealsText}`;
}

export function CoachLipWellChat() {
  const supabase = createClient();

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [context, setContext] = useState('');

  // Controle de assinatura
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('trial');
  const [usageCount, setUsageCount] = useState(0);
  const [usageId, setUsageId] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      role: 'assistant',
      content: 'Oi! Sou a sua Coach LipWell. 💖 Analisei seu diário e estou pronta para cruzar seus dados de dor, dieta e rotina. O que vamos explorar hoje?',
    }
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];

      const [{ data: profile }, contextStr] = await Promise.all([
        supabase.from('profiles').select('subscription_status').eq('id', user.id).single(),
        buildUserContext(),
      ]);

      const status = profile?.subscription_status ?? 'trial';
      setSubscriptionStatus(status);
      setContext(contextStr);

      // Só busca usage se não for premium
      if (status !== 'premium') {
        const { data: usageData } = await supabase
          .from('ai_usage')
          .select('id, coach_messages_count')
          .eq('user_id', user.id)
          .eq('usage_date', today)
          .maybeSingle();

        if (usageData) {
          setUsageId(usageData.id);
          setUsageCount(usageData.coach_messages_count ?? 0);
        } else {
          const { data: newUsage } = await supabase
            .from('ai_usage')
            .insert({ user_id: user.id, usage_date: today, coach_messages_count: 0 })
            .select('id')
            .single();
          if (newUsage) setUsageId(newUsage.id);
          setUsageCount(0);
        }
      }
    })();
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isTyping]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  const dailyLimit = getDailyLimit(subscriptionStatus);
  const isPremium = dailyLimit === null;
  const isLimitReached = !isPremium && usageCount >= (dailyLimit ?? 3);
  const limitMessage = getLimitMessage(subscriptionStatus, dailyLimit ?? 3);

  const handleSend = async (text: string) => {
    if (!text.trim() || isTyping || isLimitReached) return;

    const userMsg: Message = { id: `msg-${Date.now()}`, role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];

    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);
    setError(null);

    try {
      const history = updatedMessages.slice(1).map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context,
          history: history.slice(0, -1),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Status ${res.status}`);

      setMessages(prev => [
        ...prev,
        { id: `msg-${Date.now() + 1}`, role: 'assistant', content: data.reply },
      ]);

      // Incrementa uso no banco (não-premium)
      if (!isPremium && usageId) {
        const newCount = usageCount + 1;
        setUsageCount(newCount);
        await supabase
          .from('ai_usage')
          .update({ coach_messages_count: newCount })
          .eq('id', usageId);
      }
    } catch (err) {
      const msg = (err as Error).message || 'Erro desconhecido';
      setError(msg);
      setMessages(prev => [
        ...prev,
        { id: `msg-err-${Date.now()}`, role: 'assistant', content: 'Ops, tive um problema técnico. Tente novamente em instantes. 🙏' },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Botão Flutuante */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed z-50 md:bottom-8 md:right-8 bottom-20 right-4 w-14 h-14 bg-gradient-to-tr from-salmon to-orange-400 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(255,154,158,0.4)] text-white hover:scale-105 active:scale-95 transition-all duration-300 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
        aria-label="Falar com Coach LipWell"
      >
        <MessageCircleHeart className="w-7 h-7" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-mint rounded-full border-2 border-[#F8F9FA] dark:border-dark animate-pulse" />
      </button>

      {/* Painel do Chat */}
      {isOpen && (
        <div className="fixed z-50 md:bottom-8 md:right-8 md:w-[400px] w-full h-[100dvh] md:h-[640px] inset-0 md:inset-auto bg-white dark:bg-dark-card md:rounded-3xl shadow-modal flex flex-col overflow-hidden animate-in md:slide-in-from-bottom-5 slide-in-from-bottom-full duration-300 border border-gray-100 dark:border-white/5">

          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-salmon/10 to-orange-400/10 border-b border-salmon/20 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-salmon to-orange-400 flex items-center justify-center text-white shrink-0 shadow-md">
                <Sparkles className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 dark:text-gray-100 leading-tight">Coach LipWell</h3>
                <p className="text-xs text-salmon font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-mint rounded-full animate-pulse" />
                  {context ? 'Dados carregados ✓' : 'Carregando...'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Contador de mensagens (não-premium) */}
              {!isPremium && (
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  isLimitReached
                    ? 'bg-red-100 text-red-500 dark:bg-red-900/30'
                    : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400'
                }`}>
                  💬 {usageCount}/{dailyLimit} hoje
                </span>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-500 hover:bg-white/50 dark:hover:bg-black/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Aviso de erro */}
          {error && (
            <div className="mx-4 mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-xl flex items-start gap-2 shrink-0">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-black/10">
            {messages.map((m) => (
              <div key={m.id} className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-salmon to-orange-400 flex items-center justify-center shrink-0 mr-2 mt-1 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-white fill-current" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-salmon text-white rounded-tr-sm shadow-sm'
                    : 'bg-white dark:bg-white/5 text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-white/5 rounded-tl-sm shadow-sm'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex w-full justify-start items-end gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-salmon to-orange-400 flex items-center justify-center shrink-0 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-white fill-current" />
                </div>
                <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-salmon/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-salmon/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-salmon/60 rounded-full animate-bounce" />
                </div>
              </div>
            )}

            <div ref={bottomRef} className="h-1" />
          </div>

          {/* Sugestões iniciais */}
          {messages.length === 1 && !isTyping && !isLimitReached && (
            <div className="px-4 py-3 bg-white dark:bg-dark-card flex gap-2 overflow-x-auto shrink-0 border-t border-gray-100 dark:border-white/5 scrollbar-none">
              {SUGGESTIONS.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(sug)}
                  className="shrink-0 text-xs py-1.5 px-3 bg-mint/20 text-teal dark:text-mint rounded-full border border-mint/30 hover:bg-mint/30 transition-colors font-medium"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}

          {/* CTA de limite atingido OU Input normal */}
          <div className="p-4 bg-white dark:bg-dark-card border-t border-gray-100 dark:border-white/5 shrink-0">
            {isLimitReached ? (
              <div className="text-center space-y-3">
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {limitMessage}
                </p>
                <Link
                  href="/plans"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-salmon to-orange-400 text-white font-bold rounded-2xl py-3 shadow-sm hover:opacity-90 transition-opacity"
                >
                  Ver Planos <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <form
                onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
                className="relative flex items-center"
              >
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Pergunte sobre seus dados..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isTyping}
                  className="w-full bg-gray-100 dark:bg-white/5 border-transparent focus:bg-white dark:focus:bg-dark focus:border-salmon dark:focus:border-salmon/50 rounded-full py-3 pl-4 pr-12 text-sm text-gray-800 dark:text-white outline-none transition-all shadow-inner dark:shadow-none disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="absolute right-1.5 w-9 h-9 flex items-center justify-center bg-salmon text-white rounded-full hover:bg-[#ff9a9e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
            )}
          </div>

        </div>
      )}

      {/* Overlay mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
        />
      )}
    </>
  );
}
