'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { StatCard } from '@/components/dashboard/StatCard';
import { PainTrendChart } from '@/components/dashboard/PainTrendChart';
import { SymptomRadar } from '@/components/dashboard/SymptomRadar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Flame, Droplets, Activity, CheckCircle2, Loader2, Sparkles, X, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { MotivationalBanner } from '@/components/ai/MotivationalBanner';
import { TrialStatusBanner } from '@/components/subscription/TrialStatusBanner';
import { SeasonalUpgradeModal } from '@/components/subscription/SeasonalUpgradeModal';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { format, subDays, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DashboardStats {
  streak: number;
  avgWater: string;
  avgPain: number;
  compressionPct: number;
  todayMorningDone: boolean;
  todayEveningDone: boolean;
  chartData: { day: string; dor: number; energia: number }[];
}

export default function DashboardPage() {
  const supabase = createClient();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Relatório
  const [report, setReport] = useState<string | null>(null);
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportHistory, setReportHistory] = useState<{ id: string; log_date: string; content: string }[]>([]);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('trial');
  const [showTrialLimitModal, setShowTrialLimitModal] = useState(false);
  const [showConfirmGenerate, setShowConfirmGenerate] = useState(false);

  useEffect(() => {
    async function loadDashboardData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsLoading(false); return; }

      // Busca logs dos últimos 7 dias
      const today = new Date();
      const sevenDaysAgo = format(subDays(today, 6), 'yyyy-MM-dd');
      const todayStr = format(today, 'yyyy-MM-dd');

      const { data: logs } = await supabase
        .from('daily_logs')
        .select('log_date, log_type, pain_level, energy_level, water_intake_ml, used_compression, wake_feeling')
        .eq('user_id', user.id)
        .gte('log_date', sevenDaysAgo)
        .lte('log_date', todayStr)
        .order('log_date', { ascending: true });

      if (!logs) { setIsLoading(false); return; }

      // --- Streak: dias consecutivos com pelo menos 1 log ---
      let streak = 0;
      for (let i = 0; i <= 30; i++) {
        const d = format(subDays(today, i), 'yyyy-MM-dd');
        if (logs.some(l => l.log_date === d)) streak++;
        else break;
      }

      // --- Média de água semanal (logs noturnos) ---
      const eveningLogs = logs.filter(l => l.log_type === 'evening' && l.water_intake_ml != null);
      const avgWaterMl = eveningLogs.length
        ? eveningLogs.reduce((sum, l) => sum + (l.water_intake_ml || 0), 0) / eveningLogs.length
        : 0;
      const avgWater = avgWaterMl >= 1000 ? `${(avgWaterMl / 1000).toFixed(1)}L` : `${Math.round(avgWaterMl)}ml`;

      // --- Média de dor semanal (logs matinais) ---
      const morningLogs = logs.filter(l => l.log_type === 'morning');
      const avgPain = morningLogs.length
        ? Math.round(morningLogs.reduce((sum, l) => sum + (l.pain_level || 0), 0) / morningLogs.length)
        : 0;

      // --- % de uso de compressão ---
      const compressionUsed = eveningLogs.filter(l => l.used_compression).length;
      const compressionPct = eveningLogs.length
        ? Math.round((compressionUsed / eveningLogs.length) * 100)
        : 0;

      // --- Status de hoje ---
      const todayMorningDone = logs.some(l => l.log_date === todayStr && l.log_type === 'morning');
      const todayEveningDone = logs.some(l => l.log_date === todayStr && l.log_type === 'evening');

      // --- Dados do gráfico (últimos 7 dias) ---
      const chartData = Array.from({ length: 7 }, (_, i) => {
        const date = format(subDays(today, 6 - i), 'yyyy-MM-dd');
        const dayLabel = format(subDays(today, 6 - i), 'EEE', { locale: ptBR });
        const dayMorning = logs.find(l => l.log_date === date && l.log_type === 'morning');
        const dayEvening = logs.find(l => l.log_date === date && l.log_type === 'evening');
        return {
          day: dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1, 3),
          dor: dayMorning?.pain_level ?? 0,
          energia: dayMorning?.wake_feeling ?? dayEvening?.energy_level ?? 0,
        };
      });

      setStats({ streak, avgWater, avgPain, compressionPct, todayMorningDone, todayEveningDone, chartData });

      // Carregar subscription + histórico de relatórios
      const [{ data: profileData }, { data: pastReports }] = await Promise.all([
        supabase.from('profiles').select('subscription_status').eq('id', user.id).single(),
        supabase.from('ai_reports').select('id, log_date, content').eq('user_id', user.id).order('log_date', { ascending: false }).limit(10),
      ]);
      setSubscriptionStatus(profileData?.subscription_status ?? 'trial');
      setReportHistory(pastReports ?? []);
      setIsLoading(false);
    }

    loadDashboardData();
  }, []);

  // Retorna o máximo de relatórios por mês por plano (null = ilimitado)
  function getMonthlyReportLimit(status: string): number | null {
    if (status === 'premium') return null;
    if (status === 'standard') return 4;
    if (status === 'basic') return 1;
    return 1; // trial/free
  }

  // Clique no botão de relatório — verifica cache primeiro
  const handleGenerateReport = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
    const isPremium = subscriptionStatus === 'premium';
    const monthlyLimit = getMonthlyReportLimit(subscriptionStatus);

    // 1. Verificar se já existe relatório para esta semana no banco
    const { data: existing } = await supabase
      .from('ai_reports')
      .select('id, content')
      .eq('user_id', user.id)
      .eq('log_date', weekStart)
      .maybeSingle();

    if (existing) {
      setReport(existing.content);
      setShowReport(true);
      return;
    }

    // 2. Premium — gerar direto
    if (isPremium) {
      await generateAndSaveReport(user.id, weekStart);
      return;
    }

    // 3. Planos limitados — verifica contagem mensal (ou total para trial)
    const monthStart = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd');
    const { data: monthlyReports } = subscriptionStatus === 'trial' || subscriptionStatus === 'free'
      ? await supabase.from('ai_reports').select('id').eq('user_id', user.id).limit(2) // trial: verifica qualquer relatório
      : await supabase.from('ai_reports').select('id').eq('user_id', user.id).gte('log_date', monthStart);

    const usedCount = monthlyReports?.length ?? 0;

    if (usedCount >= (monthlyLimit ?? 1)) {
      setShowTrialLimitModal(true);
      return;
    }

    // Primeira vez no plano — pedir confirmação
    setShowConfirmGenerate(true);
  };

  const generateAndSaveReport = async (userId: string, weekStart: string) => {
    setShowConfirmGenerate(false);
    setIsReportLoading(true);

    const today = new Date();
    const sevenDaysAgo = format(subDays(today, 6), 'yyyy-MM-dd');
    const todayStr = format(today, 'yyyy-MM-dd');

    const [{ data: profile }, { data: logs }, { data: meals }] = await Promise.all([
      supabase.from('profiles').select('full_name, lipedema_stage, pain_concentration').eq('id', userId).single(),
      supabase.from('daily_logs').select('log_date, log_type, pain_level, energy_level, mood, water_intake_ml, used_compression, exercised').eq('user_id', userId).gte('log_date', sevenDaysAgo).lte('log_date', todayStr),
      supabase.from('meal_logs').select('log_date, meal_name, food_items').eq('user_id', userId).gte('log_date', sevenDaysAgo).limit(20),
    ]);

    const morningLogs = logs?.filter(l => l.log_type === 'morning') ?? [];
    const eveningLogs = logs?.filter(l => l.log_type === 'evening') ?? [];
    const avgPain = morningLogs.length ? (morningLogs.reduce((s, l) => s + (l.pain_level ?? 0), 0) / morningLogs.length).toFixed(1) : 'sem dados';
    const avgEnergy = eveningLogs.length ? (eveningLogs.reduce((s, l) => s + (l.energy_level ?? 0), 0) / eveningLogs.length).toFixed(1) : 'sem dados';
    const avgWater = eveningLogs.length ? Math.round(eveningLogs.reduce((s, l) => s + (l.water_intake_ml ?? 0), 0) / eveningLogs.length) : 0;
    const compressionDays = eveningLogs.filter(l => l.used_compression).length;
    const exerciseDays = eveningLogs.filter(l => l.exercised).length;

    const mealsSummary = meals?.map(m => {
      const items = Array.isArray(m.food_items) ? m.food_items.map((f: { name: string }) => f.name).join(', ') : '—';
      return `${m.log_date} - ${m.meal_name}: ${items}`;
    }).join('\n') ?? 'Sem refeições.';

    const userData = `Paciente: ${profile?.full_name ?? 'usuária'} | Estágio: ${profile?.lipedema_stage ?? '?'} | Área de dor: ${profile?.pain_concentration ?? '?'}
Período: ${sevenDaysAgo} a ${todayStr}
Dor média: ${avgPain}/10 | Energia: ${avgEnergy}/10 | Água: ${avgWater}ml/dia
Compressão: ${compressionDays}/${eveningLogs.length} dias | Exercício: ${exerciseDays}/${eveningLogs.length} dias
Refeições:\n${mealsSummary}`;

    const res = await fetch('/api/ai/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userData }),
    });

    if (res.ok) {
      const data = await res.json();
      // Salvar no banco
      const { data: saved } = await supabase.from('ai_reports').insert({
        user_id: userId,
        log_date: weekStart,
        content: data.report,
        type: 'weekly',
      }).select('id, log_date, content').single();

      setReport(data.report);
      setShowReport(true);
      if (saved) setReportHistory(prev => [saved, ...prev]);
    }
    setIsReportLoading(false);
  };

  // Tendência da dor
  const painTrend = stats
    ? stats.avgPain <= 3 ? 'down' : stats.avgPain <= 6 ? 'neutral' : 'up'
    : 'neutral';

  const painLabel = stats
    ? stats.avgPain <= 3 ? 'Baixa' : stats.avgPain <= 6 ? 'Moderada' : 'Alta'
    : '--';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-teal animate-spin mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Carregando seu painel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">

      {/* Modais de Upgrade */}
      <SeasonalUpgradeModal />

      {/* Banner de Trial */}
      <TrialStatusBanner />

      {/* Frase do dia — Groq */}
      <MotivationalBanner />

      {/* Header com Botões de Check-in do Dia */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-teal/10 via-mint/5 to-transparent p-6 rounded-3xl border border-teal/10">
        <div>
          <h1 className="text-3xl font-bold text-teal dark:text-mint tracking-tight">Visão Geral</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
            {stats?.todayMorningDone && stats?.todayEveningDone
              ? 'Todos os registros de hoje completos!'
              : 'Continue o rastreamento de hoje.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={`/diary/${format(new Date(), 'yyyy-MM-dd')}`}>
            <Button
              variant="primary"
              className={`shadow-[0_4px_16px_rgba(168,230,207,0.4)] ${
                stats?.todayMorningDone
                  ? 'bg-gray-200 text-gray-500 dark:bg-white/10 dark:text-gray-400'
                  : 'bg-mint text-teal hover:bg-mint/80'
              }`}
            >
              {stats?.todayMorningDone ? 'Manhã Feita' : 'Diário Manhã'}
            </Button>
          </Link>
          <Link href={`/diary/${format(new Date(), 'yyyy-MM-dd')}`}>
            <Button
              variant="primary"
              className={`border-0 ${
                stats?.todayEveningDone
                  ? 'bg-gray-200 text-gray-500 dark:bg-white/10 dark:text-gray-400 shadow-none'
                  : 'bg-salmon text-white hover:bg-[#ff9a9e] shadow-[0_4px_16px_rgba(255,182,185,0.4)]'
              }`}
            >
              {stats?.todayEveningDone ? 'Noite Feita' : 'Diário Noite'}
            </Button>
          </Link>
        </div>
      </div>

      {/* Widgets de Saúde — Dados Reais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Fogo no Foco"
          value={stats ? `${stats.streak} ${stats.streak === 1 ? 'Dia' : 'Dias'}` : '--'}
          subtitle="Seguidos rastreando"
          icon={<Flame size={20} />}
          trend={stats && stats.streak >= 3 ? 'up' : 'neutral'}
          trendValue={stats && stats.streak >= 3 ? 'Incrível!' : 'Continue!'}
          colorClass="text-salmon"
        />
        <StatCard
          title="Média Água"
          value={stats ? stats.avgWater : '--'}
          subtitle="Na última semana"
          icon={<Droplets size={20} />}
          trend={stats ? (
            avgWaterMlFromStr(stats.avgWater) >= 2000 ? 'down' :
            avgWaterMlFromStr(stats.avgWater) >= 1500 ? 'neutral' :
            'up'
          ) : 'neutral'}
          trendValue={stats ? (
            avgWaterMlFromStr(stats.avgWater) >= 2000 ? 'Excelente!' :
            avgWaterMlFromStr(stats.avgWater) >= 1500 ? 'Bom trabalho!' :
            avgWaterMlFromStr(stats.avgWater) >= 1000 ? 'Pode melhorar' :
            'Atenção! Beba mais água'
          ) : undefined}
          colorClass={
            stats && avgWaterMlFromStr(stats.avgWater) >= 2000 ? 'text-sky' :
            stats && avgWaterMlFromStr(stats.avgWater) >= 1500 ? 'text-teal dark:text-mint' :
            stats && avgWaterMlFromStr(stats.avgWater) >= 1000 ? 'text-amber-500' :
            'text-salmon'
          }
        />
        <StatCard
          title="Dor Média"
          value={stats ? `${stats.avgPain}/10` : '--'}
          subtitle="Últimos 7 dias"
          icon={<Activity size={20} />}
          trend={painTrend}
          trendValue={painLabel}
          colorClass="text-teal"
        />
        <StatCard
          title="Compressão"
          value={stats ? `${stats.compressionPct}%` : '--'}
          subtitle="Uso de meia/faixa"
          icon={<CheckCircle2 size={20} />}
          trend={stats && stats.compressionPct >= 70 ? 'down' : 'neutral'}
          trendValue={stats && stats.compressionPct >= 70 ? 'Consistente' : 'Aumentar uso'}
          colorClass="text-mint dark:text-teal"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card glass className="md:col-span-2 p-6 overflow-hidden">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <Activity className="text-salmon" size={24} />
              Balanço: Dor vs Energia
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Seus dados reais da semana (<span className="text-salmon font-bold">Dor</span> vs{' '}
              <span className="text-sky font-bold">Disposição</span>).
              {!stats?.chartData.some(d => d.dor > 0) && (
                <span className="text-teal ml-1">— Comece preenchendo seus check-ins!</span>
              )}
            </p>
          </div>
          <PainTrendChart data={stats?.chartData} />
        </Card>

        <Card glass className="p-6 overflow-hidden">
          <div className="mb-2">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <Activity className="text-teal" size={20} />
              Mapa Sistêmico
            </h2>
            <p className="text-xs text-gray-500 mt-1">Distribuição das suas incertezas.</p>
          </div>
          <SymptomRadar />
        </Card>
      </div>

      {/* Relatórios Semanais IA */}
      <Card glass className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <Sparkles className="text-salmon w-5 h-5" /> Relatório Semanal com IA
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {subscriptionStatus === 'premium'
                ? 'A Coach LipWell analisa sua semana e gera insights personalizados.'
                : subscriptionStatus === 'standard'
                ? 'No Standard você tem 4 relatórios por mês. Faça upgrade para ilimitado!'
                : subscriptionStatus === 'basic'
                ? 'No Básico você tem 1 relatório por mês. Faça upgrade para mais!'
                : 'No plano gratuito você tem direito a 1 relatório. Faça upgrade para relatórios semanais ilimitados.'}
            </p>
          </div>
          <Button
            onClick={handleGenerateReport}
            disabled={isReportLoading}
            className="bg-gradient-to-r from-salmon to-orange-400 text-white border-0 shadow-[0_4px_16px_rgba(255,154,158,0.4)] hover:opacity-90 shrink-0 gap-2"
          >
            {isReportLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isReportLoading ? 'Analisando...' : 'Ver Relatório desta Semana'}
          </Button>
        </div>

        {/* Histórico de relatórios */}
        {reportHistory.length > 0 && (
          <div className="border-t border-gray-100 dark:border-white/5 pt-4 space-y-2">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Relatórios Anteriores</h3>
            {reportHistory.map((r) => (
              <div key={r.id} className="rounded-xl border border-gray-100 dark:border-white/5 overflow-hidden">
                <button
                  onClick={() => setExpandedHistoryId(expandedHistoryId === r.id ? null : r.id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Semana de {format(new Date(r.log_date + 'T12:00:00'), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                  {expandedHistoryId === r.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
                {expandedHistoryId === r.id && (
                  <div className="px-4 pb-4 prose prose-base dark:prose-invert max-w-none text-gray-700 dark:text-gray-200 leading-relaxed">
                    <ReactMarkdown components={{
                      h2: ({children}) => <h2 style={{color: '#2D6A6A'}}>{children}</h2>,
                      h3: ({children}) => <h3 style={{color: '#2D6A6A'}}>{children}</h3>,
                    }}>{r.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modal: Ver Relatório */}
      {showReport && report && (
        <ReportModal report={report} onClose={() => setShowReport(false)} />
      )}

      {/* Modal: Confirmação para gerar o primeiro relatório (trial) */}
      {showConfirmGenerate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-dark-card max-w-sm w-full rounded-3xl p-8 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-salmon/10 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6 text-salmon" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white text-center">Gerar Relatório Semanal</h3>
            <p className="text-sm text-gray-500 text-center leading-relaxed">
              No plano gratuito você tem <strong>1 relatório</strong> durante o período de teste. Recomendamos esperar ter pelo menos 5 dias de registros para um relatório mais completo.
            </p>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowConfirmGenerate(false)} className="flex-1 py-3 rounded-2xl border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                Esperar mais
              </button>
              <button
                onClick={async () => {
                  const { data: { user } } = await supabase.auth.getUser();
                  if (user) await generateAndSaveReport(user.id, format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'));
                }}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-salmon to-orange-400 text-white text-sm font-bold shadow-sm hover:opacity-90 transition-opacity"
              >
                Gerar agora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Limite de relatório atingido (trial) */}
      {showTrialLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowTrialLimitModal(false)}>
          <div className="bg-white dark:bg-dark-card max-w-sm w-full rounded-3xl p-8 space-y-4 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowTrialLimitModal(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400"><X className="w-5 h-5"/></button>
            <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white text-center">Relatório já utilizado</h3>
            <p className="text-sm text-gray-500 text-center leading-relaxed">
              Você já utilizou seu relatório gratuito. Faça upgrade para gerar relatórios semanais ilimitados!
            </p>
            <Link
              href="/plans"
              onClick={() => setShowTrialLimitModal(false)}
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-salmon to-orange-400 text-white font-bold rounded-2xl py-3 shadow-sm hover:opacity-90 transition-opacity"
            >
              Ver Planos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}

/* ── Modais ── */

// Modal: Relatório completo (com ReactMarkdown)
function ReportModal({ report, onClose }: { report: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-dark-card max-w-xl w-full rounded-3xl shadow-modal p-8 relative max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400"><X className="w-5 h-5"/></button>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-salmon to-orange-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white fill-current" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 dark:text-white">Relatório Semanal</h3>
            <p className="text-xs text-salmon">Gerado pela Coach LipWell</p>
          </div>
        </div>
        <div className="prose prose-base dark:prose-invert max-w-none text-gray-700 dark:text-gray-200 leading-relaxed">
          <ReactMarkdown components={{
            h2: ({children}) => <h2 style={{color: '#2D6A6A'}}>{children}</h2>,
            h3: ({children}) => <h3 style={{color: '#2D6A6A'}}>{children}</h3>,
          }}>{report}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

// Utilitário
function avgWaterMlFromStr(s: string): number {
  if (s.includes('L')) return parseFloat(s) * 1000;
  return parseFloat(s) || 0;
}
