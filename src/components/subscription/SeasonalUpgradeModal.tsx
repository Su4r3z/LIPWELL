'use client';

import { useEffect, useState } from 'react';
import { X, Sparkles, Zap, MessageCircleHeart, BarChart3, Star, Gem } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

const STORAGE_KEY = 'lipwell_upgrade_modal_last_shown';
const INTERVAL_MS = 3 * 60 * 60 * 1000; // 3 horas

interface ModalConfig {
  gradient: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  benefits: string[];
  ctaLabel: string;
  ctaHref: string;
  dismissLabel: string;
}

function getModalConfig(status: string): ModalConfig | null {
  if (status === 'trial' || status === 'free') {
    return {
      gradient: 'from-salmon via-orange-400 to-pink-400',
      icon: <Sparkles className="w-7 h-7 fill-current" />,
      title: 'Teste grátis ativo!',
      subtitle: 'Conheça todo o potencial do LipWell',
      benefits: [
        'Coach IA sem limite de mensagens',
        'Relatórios semanais ilimitados',
        'Acompanhamento completo do lipedema',
      ],
      ctaLabel: 'Ver Planos',
      ctaHref: '/plans',
      dismissLabel: 'Continuar no plano gratuito',
    };
  }
  if (status === 'basic') {
    return {
      gradient: 'from-sky to-teal',
      icon: <Star className="w-7 h-7 fill-current" />,
      title: 'Você está no Básico',
      subtitle: 'No Standard, muito mais poder!',
      benefits: [
        '20 mensagens por dia para o Coach IA',
        '4 relatórios de saúde por mês',
        'Frase motivacional personalizada',
      ],
      ctaLabel: 'Ver Planos',
      ctaHref: '/plans',
      dismissLabel: 'Continuar no Básico',
    };
  }
  if (status === 'standard') {
    return {
      gradient: 'from-teal to-mint',
      icon: <Gem className="w-7 h-7 fill-current" />,
      title: 'Quase lá!',
      subtitle: 'No Premium, experiência completa',
      benefits: [
        'Coach IA e relatórios ilimitados',
        'Suporte prioritário',
        'Acesso antecipado a novos recursos',
      ],
      ctaLabel: 'Conhecer Premium',
      ctaHref: '/plans',
      dismissLabel: 'Continuar no Standard',
    };
  }
  return null; // premium → nunca exibir
}

export function SeasonalUpgradeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<ModalConfig | null>(null);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_status')
        .eq('id', user.id)
        .single();

      const status = profile?.subscription_status ?? 'trial';
      const modalConfig = getModalConfig(status);

      if (!modalConfig) return; // premium → sair

      const lastShown = localStorage.getItem(STORAGE_KEY);
      const now = Date.now();

      if (!lastShown || now - parseInt(lastShown) >= INTERVAL_MS) {
        setConfig(modalConfig);
        setTimeout(() => setIsOpen(true), 2500);
      }
    })();
  }, []);

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
    setIsOpen(false);
  };

  if (!isOpen || !config) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-dark-card max-w-sm w-full rounded-3xl shadow-modal overflow-hidden animate-in zoom-in-95 duration-300">

        {/* Gradient header */}
        <div className={`relative bg-gradient-to-r ${config.gradient} p-6 text-white text-center`}>
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
            {config.icon}
          </div>
          <h2 className="text-xl font-bold">{config.title}</h2>
          <p className="text-white/80 text-sm mt-1">{config.subtitle}</p>
        </div>

        {/* Benefits */}
        <div className="p-6 space-y-4">
          <div className="space-y-3">
            {config.benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-mint/20 flex items-center justify-center shrink-0">
                  <Zap className="w-3.5 h-3.5 text-teal dark:text-mint" />
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">{benefit}</p>
              </div>
            ))}
          </div>

          <Link
            href={config.ctaHref}
            onClick={handleClose}
            className={`block w-full text-center bg-gradient-to-r ${config.gradient} text-white font-bold rounded-2xl py-4 mt-2 shadow-md hover:opacity-90 transition-opacity`}
          >
            {config.ctaLabel}
          </Link>

          <button
            onClick={handleClose}
            className="block w-full text-center text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 py-1 transition-colors"
          >
            {config.dismissLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
