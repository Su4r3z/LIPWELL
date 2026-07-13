'use client';

import { useEffect, useState } from 'react';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { differenceInDays } from 'date-fns';
import Link from 'next/link';

export function TrialStatusBanner() {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [status, setStatus] = useState<string>('trial');
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_status, trial_started_at')
        .eq('id', user.id)
        .single();

      if (!profile) return;
      setStatus(profile.subscription_status ?? 'trial');

      if (profile.subscription_status === 'trial' && profile.trial_started_at) {
        const started = new Date(profile.trial_started_at);
        const today = new Date();
        const elapsed = differenceInDays(today, started);
        setDaysLeft(Math.max(0, 7 - elapsed));
      }
    })();
  }, []);

  // Só mostrar para trial
  if (status === 'premium' || dismissed || daysLeft === null) return null;

  const isExpired = daysLeft === 0;

  return (
    <div className={`relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl px-5 py-4 mb-6 animate-in fade-in slide-in-from-top-3 duration-500 ${
      isExpired
        ? 'bg-salmon/10 border border-salmon/30 dark:bg-salmon/5'
        : 'bg-mint/10 border border-mint/30 dark:bg-teal/10'
    }`}>
      <div className="flex items-start sm:items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isExpired ? 'bg-salmon/20' : 'bg-mint/20'}`}>
          <Sparkles className={`w-4 h-4 ${isExpired ? 'text-salmon' : 'text-teal dark:text-mint'}`} />
        </div>
        <p className={`text-sm font-medium ${isExpired ? 'text-salmon' : 'text-teal dark:text-mint'}`}>
          {isExpired
            ? 'Seu período de teste acabou. Faça upgrade para continuar usando todos os recursos.'
            : `Você tem ${daysLeft} dia${daysLeft !== 1 ? 's' : ''} restante${daysLeft !== 1 ? 's' : ''} de teste gratuito.`
          }
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Link
          href="/settings?tab=account"
          className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full transition-all shrink-0 ${
            isExpired
              ? 'bg-salmon text-white hover:bg-salmon/90 shadow-sm'
              : 'bg-teal text-white dark:bg-mint dark:text-dark hover:opacity-90 shadow-sm'
          }`}
        >
          Fazer Upgrade <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        {!isExpired && (
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-black/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
