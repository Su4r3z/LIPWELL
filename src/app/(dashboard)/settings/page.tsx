'use client';

import { useState, useEffect, Suspense } from 'react';
import { Loader2, User, Pill, Monitor, CreditCard, LogOut, Trash2, CheckCircle2, Sun, Moon, ShieldAlert } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { createClient } from '@/utils/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { SupplementsTab } from '@/components/supplements/SupplementsTab';
import { SubscriptionTab } from '@/components/subscription/SubscriptionTab';

type Tab = 'profile' | 'supplements' | 'appearance' | 'account';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'profile',     label: 'Perfil & Saúde',  icon: <User className="w-5 h-5" /> },
  { id: 'supplements', label: 'Suplementação',    icon: <Pill className="w-5 h-5" /> },
  { id: 'appearance',  label: 'Aparência',         icon: <Monitor className="w-5 h-5" /> },
  { id: 'account',     label: 'Assinatura',        icon: <CreditCard className="w-5 h-5" /> },
];

const STAGES = ['Suspeita', 'Estágio 1', 'Estágio 2', 'Estágio 3', 'Estágio 4 / Lipolinfedema'];
const PAIN_AREAS = ['Pernas Inteiras', 'Coxas/Culote', 'Panturrilhas/Tornozelo', 'Braços', 'Corpo Todo'];

function SettingsInner() {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const tab = searchParams.get('tab') as Tab | null;
    if (tab && TABS.some(t => t.id === tab)) setActiveTab(tab);
  }, [searchParams]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // ── Profile state ──────────────────────────────────────────────────────────
  const [profile, setProfile] = useState({ name: '', dob: '', lipedemaStage: '', mainPainArea: '' });
  const [subscriptionStatus, setSubscriptionStatus] = useState('trial');
  const [trialStartedAt, setTrialStartedAt] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('full_name, dob, lipedema_stage, pain_concentration, subscription_status, trial_started_at')
        .eq('id', user.id)
        .single();
      if (data) {
        setProfile({ name: data.full_name ?? '', dob: data.dob ?? '', lipedemaStage: data.lipedema_stage ?? '', mainPainArea: data.pain_concentration ?? '' });
        setSubscriptionStatus(data.subscription_status ?? 'trial');
        setTrialStartedAt(data.trial_started_at ?? null);
      }
      setProfileLoading(false);
    })();
  }, []);

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('profiles').update({
      full_name: profile.name,
      dob: profile.dob || null,
      lipedema_stage: profile.lipedemaStage,
      pain_concentration: profile.mainPainArea,
    }).eq('id', user.id);
    setProfileSaving(false);
    if (error) toast.error('Erro ao salvar. Tente novamente.');
    else toast.success('Perfil atualizado com sucesso!');
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-teal dark:text-mint mb-1">Configurações</h1>
        <p className="text-gray-500 dark:text-gray-400">Gerencie sua conta, saúde e preferências.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <nav className="w-full md:w-56 shrink-0">
          {/* Mobile: grade 2x2 */}
          <div className="grid grid-cols-2 md:hidden gap-2 mb-4">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl font-medium text-xs transition-all ${
                  activeTab === tab.id
                    ? 'bg-salmon text-white shadow-md shadow-salmon/20'
                    : 'bg-white dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
          {/* Desktop: lista vertical */}
          <div className="hidden md:flex flex-col gap-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-sm transition-all text-left ${
                  activeTab === tab.id
                    ? 'bg-salmon text-white shadow-md shadow-salmon/20'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {/* ── Content ─────────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">

          {/* ── ABA: PERFIL ──────────────────────────────────────────────── */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Dados Pessoais */}
              <Card className="p-6 sm:p-8">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-5 pb-3 border-b border-gray-100 dark:border-white/10">
                  Dados Pessoais
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Nome Completo</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-salmon/50 focus:border-salmon transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Data de Nascimento</label>
                    <input
                      type="date"
                      value={profile.dob}
                      onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-salmon/50 focus:border-salmon transition-colors"
                    />
                  </div>
                </div>
              </Card>

              {/* Perfil de Saúde */}
              <Card className="p-6 sm:p-8">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-5 pb-3 border-b border-gray-100 dark:border-white/10">
                  Perfil de Saúde
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Estágio do Lipedema</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {STAGES.map(s => (
                        <button
                          key={s}
                          onClick={() => setProfile({ ...profile, lipedemaStage: s })}
                          className={`text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                            profile.lipedemaStage === s
                              ? 'border-teal bg-teal/5 dark:bg-teal/10 text-teal dark:text-mint'
                              : 'border-gray-100 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-teal/30'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Principal Área de Dor/Inchaço</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {PAIN_AREAS.map(area => (
                        <button
                          key={area}
                          onClick={() => setProfile({ ...profile, mainPainArea: area })}
                          className={`text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                            profile.mainPainArea === area
                              ? 'border-salmon bg-salmon/5 dark:bg-salmon/10 text-salmon'
                              : 'border-gray-100 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-salmon/30'
                          }`}
                        >
                          {area}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={profileSaving || profileLoading}
                    className="bg-teal hover:bg-teal/90 text-white gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    {profileSaving ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* ── ABA: SUPLEMENTOS ─────────────────────────────────────────── */}
          {activeTab === 'supplements' && (
            <div className="animate-in fade-in duration-300">
              <Card className="p-6 sm:p-8">
                <SupplementsTab />
              </Card>
            </div>
          )}

          {/* ── ABA: APARÊNCIA ───────────────────────────────────────────── */}
          {activeTab === 'appearance' && (
            <div className="animate-in fade-in duration-300">
              <Card className="p-6 sm:p-8">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">Tema do Aplicativo</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  O modo noturno é ideal para o diário da noite, para descansar a vista.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { id: 'light', label: 'Claro', icon: <Sun className="w-8 h-8 mb-3" /> },
                    { id: 'dark',  label: 'Escuro', icon: <Moon className="w-8 h-8 mb-3" /> },
                    { id: 'system', label: 'Sistema', icon: <Monitor className="w-8 h-8 mb-3" /> },
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`flex flex-col items-center justify-center p-6 border-2 rounded-2xl transition-all ${
                        theme === t.id
                          ? 'border-salmon bg-salmon/5 text-salmon'
                          : 'border-gray-200 dark:border-white/10 text-gray-400 hover:border-salmon/50'
                      }`}
                    >
                      {t.icon}
                      <span className={`font-semibold ${theme === t.id ? 'text-salmon' : 'text-gray-600 dark:text-gray-400'}`}>{t.label}</span>
                    </button>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* ── ABA: ASSINATURA ──────────────────────────────────────────── */}
          {activeTab === 'account' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <SubscriptionTab
                status={subscriptionStatus}
                trialStartedAt={trialStartedAt}
              />

              {/* Zona de Perigo */}
              <Card className="p-6 sm:p-8 border border-red-100 dark:border-red-900/30">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-5 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-400" />
                  Zona de Perigo
                </h2>
                <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-500/10 rounded-xl">
                  <div>
                    <h3 className="font-semibold text-red-700 dark:text-red-400">Excluir minha conta</h3>
                    <p className="text-xs text-red-600/70 dark:text-red-300/70 mt-0.5">Apaga permanentemente todos os seus registros.</p>
                  </div>
                  <Button variant="ghost" className="text-red-600 hover:bg-red-100 dark:hover:bg-red-500/20 shrink-0">
                    <Trash2 className="w-4 h-4 mr-2" /> Excluir
                  </Button>
                </div>

                <div className="mt-6 flex justify-center">
                  <Button onClick={handleLogout} variant="outline" className="text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
                    <LogOut className="w-5 h-5 mr-2" /> Encerrar Sessão
                  </Button>
                </div>
              </Card>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-teal" /></div>}>
      <SettingsInner />
    </Suspense>
  );
}
