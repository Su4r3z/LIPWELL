'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, BookOpen, Settings, LogOut, Sparkles } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { differenceInDays, parseISO } from 'date-fns';


export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [trialStartedAt, setTrialStartedAt] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('subscription_status, trial_started_at')
        .eq('id', user.id)
        .single();
      if (data) {
        setSubscriptionStatus(data.subscription_status ?? 'trial');
        setTrialStartedAt(data.trial_started_at ?? null);
      }
    })();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Diário', href: '/diary', icon: BookOpen },
    { label: 'Configurações', href: '/settings', icon: Settings },
  ];

  // Calcula dias restantes do trial
  const trialDaysLeft = trialStartedAt
    ? Math.max(0, 7 - differenceInDays(new Date(), parseISO(trialStartedAt)))
    : null;

  // Decide o que mostrar no banner inferior
  const showBanner = subscriptionStatus === 'trial' || subscriptionStatus === 'free' || subscriptionStatus === 'basic';

  let bannerTitle = '';
  let bannerText = '';
  let bannerBtn = '';
  let bannerBg = 'from-salmon/10 to-orange-400/10 dark:from-salmon/5 dark:to-orange-400/5';
  let bannerBtnClass = 'bg-gradient-to-r from-salmon to-orange-400';
  let bannerBorder = 'border-salmon/20';

  if (subscriptionStatus === 'trial' || subscriptionStatus === 'free') {
    const daysText = trialDaysLeft !== null ? `Seu teste gratuito acaba em ${trialDaysLeft} ${trialDaysLeft === 1 ? 'dia' : 'dias'}.` : 'Seu período gratuito está ativo.';
    bannerTitle = 'LipWell Gratuito';
    bannerText = `${daysText} Faça upgrade e continue sem limites!`;
    bannerBtn = 'Fazer Upgrade';
  } else if (subscriptionStatus === 'basic') {
    bannerBg = 'from-sky/10 to-teal/5 dark:from-sky/5 dark:to-teal/5';
    bannerBtnClass = 'bg-gradient-to-r from-sky to-teal';
    bannerBorder = 'border-sky/20';
    bannerTitle = 'Plano Básico';
    bannerText = 'Quer mais da sua coach IA? Conheça nossos planos!';
    bannerBtn = 'Ver Planos';
  }

  return (
    <aside className="hidden md:flex flex-col fixed top-0 left-0 w-64 h-screen bg-white dark:bg-dark-card border-r border-gray-200 dark:border-white/5 z-50 transition-all duration-300">
      <div className="h-14 flex items-center px-5 mb-8 mt-4">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <Image src="/icon-192.png" alt="LipWell" width={32} height={32} className="rounded-xl" />
          <span className="text-2xl font-bold font-sans text-teal dark:text-mint tracking-tight">LipWell</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-card transition-all duration-200 ${
                isActive 
                  ? 'bg-mint/20 text-teal dark:bg-white/5 dark:text-mint border-l-4 border-teal dark:border-mint font-medium' 
                  : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-teal dark:hover:text-mint border-l-4 border-transparent'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="font-sans">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 space-y-4">
        {/* Banner condicional de upgrade */}
        {showBanner && subscriptionStatus !== null && (
          <Link
            href="/plans"
            className={`flex flex-col gap-2 bg-gradient-to-br ${bannerBg} rounded-2xl p-4 border ${bannerBorder} hover:opacity-90 transition-opacity group`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-salmon" />
              <p className="text-xs text-salmon font-bold">{bannerTitle}</p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{bannerText}</p>
            <span className={`block text-center text-xs ${bannerBtnClass} text-white font-bold py-2 rounded-xl mt-1 group-hover:opacity-90 transition-opacity`}>
              {bannerBtn}
            </span>
          </Link>
        )}
        
        <button 
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 text-sm font-medium text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sair da Conta
        </button>
      </div>
    </aside>
  );
}
