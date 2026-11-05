'use client';
import { ReactNode, useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Sidebar } from '@/components/layout/Sidebar';
import { CoachLipWellChat } from '@/components/ai/CoachLipWellChat';
import { PaywallModal } from '@/components/dashboard/PaywallModal';

interface Profile {
  full_name: string | null;
  subscription_status: string | null;
  trial_started_at: string | null;
}

// Mesma regra do banco (effective_plan): trial dura 7 dias
const TRIAL_DAYS = 7;
function trialEndFrom(startedAt: string): Date {
  return new Date(new Date(startedAt).getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isTrialExpired, setIsTrialExpired] = useState(false);
  const [daysOverdue, setDaysOverdue] = useState(0);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('full_name, subscription_status, trial_started_at')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile(data);

        // Checa se o trial expirou
        if (data.subscription_status === 'trial' && data.trial_started_at) {
          const trialEnd = trialEndFrom(data.trial_started_at);
          const now = new Date();
          if (now > trialEnd) {
            setIsTrialExpired(true);
            const diffMs = now.getTime() - trialEnd.getTime();
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            setDaysOverdue(diffDays);
          }
        }
      }
    };

    loadProfile();
  }, [supabase]);

  // Calcula dias restantes de trial
  const trialDaysLeft = (() => {
    if (!profile?.trial_started_at || profile.subscription_status !== 'trial') return null;
    const trialEnd = trialEndFrom(profile.trial_started_at);
    const now = new Date();
    const diff = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  })();

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-dark transition-colors duration-300 relative">
      {/* Paywall - bloqueia toda a tela se o trial expirou */}
      {isTrialExpired && <PaywallModal daysOverdue={daysOverdue} />}

      <Sidebar />
      <Header userName={profile?.full_name ?? undefined} trialDaysLeft={trialDaysLeft ?? undefined} />
      
      <main className="pt-14 pb-20 md:pb-6 md:pl-64 min-h-screen">
        <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
          {children}
        </div>
      </main>

      <BottomNav />
      
      {/* Camada Global de IA */}
      <CoachLipWellChat />

      {/* Footer legal */}
      <footer className="hidden md:block md:pl-64 py-4 border-t border-gray-100 dark:border-white/5">
        <div className="max-w-5xl mx-auto px-8 flex items-center justify-between gap-4">
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} LipWell. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <a href="/terms" className="hover:text-teal dark:hover:text-[#A8E6CF] transition-colors">Termos de Uso</a>
            <span>·</span>
            <a href="/privacy" className="hover:text-teal dark:hover:text-[#A8E6CF] transition-colors">Privacidade</a>
          </div>
        </div>
      </footer>
    </div>

  );
}
