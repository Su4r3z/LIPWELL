'use client';

import { useState } from 'react';
import { Check, X as XIcon, Shield, Zap, Clock, Leaf, Star, Gem } from 'lucide-react';
import toast from 'react-hot-toast';

type Period = 'monthly' | 'quarterly' | 'semiannual' | 'annual';

interface PeriodOption {
  id: Period;
  label: string;
  price: number;
  monthly: number;
  badge?: string;
  badgeClass?: string;
}

const PREMIUM_PERIODS: PeriodOption[] = [
  { id: 'monthly',    label: 'Mensal',     price: 67.90,  monthly: 67.90 },
  { id: 'quarterly',  label: 'Trimestral', price: 179.00, monthly: 59.67, badge: '15% OFF',   badgeClass: 'bg-sky/90 text-white' },
  { id: 'semiannual', label: 'Semestral',  price: 299.00, monthly: 49.83, badge: '30% OFF',   badgeClass: 'bg-teal text-white' },
  { id: 'annual',     label: 'Anual',      price: 479.00, monthly: 39.92, badge: '45% OFF 🔥', badgeClass: 'bg-[#FFB6B9] text-[#1a1a2e]' },
];

const FAQ = [
  { q: 'Posso cancelar quando quiser?',      a: 'Sim, sem multa e sem burocracia. O cancelamento é feito direto no app e acontece na hora.' },
  { q: 'O trial gratuito dá acesso a quê?',  a: 'Acesso completo ao app por 7 dias com limite de 3 mensagens de IA por dia e 1 relatório de saúde.' },
  { q: 'Meus dados são seguros?',             a: 'Sim. Seus dados são criptografados e apenas você tem acesso. Nunca vendemos informações de saúde.' },
  { q: 'Como funciona o ciclo de faturamento?', a: 'O faturamento é automático via Mercado Pago. Você recebe um aviso 3 dias antes da renovação.' },
];

function fmt(n: number) {
  return n.toFixed(2).replace('.', ',');
}

function FeatureRow({ included, children }: { included: boolean; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-sm min-h-[28px]">
      {included
        ? <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
        : <XIcon className="w-4 h-4 text-gray-300 dark:text-gray-600 mt-0.5 shrink-0" />}
      <span className={included
        ? 'text-gray-700 dark:text-gray-200 leading-snug'
        : 'text-gray-400 dark:text-gray-500 line-through leading-snug'}>
        {children}
      </span>
    </li>
  );
}

function handleSubscribe(_plan: string) {
  toast.success('Em breve! Estamos finalizando a integração de pagamento. 🚀', {
    duration: 4000,
    style: { fontWeight: '600' },
  });
}

export default function PlansPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('annual');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const premiumOption = PREMIUM_PERIODS.find(p => p.id === selectedPeriod)!;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-24 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="text-center mb-10 space-y-2">
        <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
          Escolha o plano ideal pra você
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Invista no seu bem-estar. Cancele quando quiser.
        </p>
      </div>

      {/* Grid de cards — empilhado no mobile, lado a lado no desktop */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:items-stretch">

        {/* ══ BÁSICO ══ */}
        <div className="flex flex-col rounded-3xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-md hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-dark-card">

          {/* Header */}
          <div className="flex flex-col items-center justify-center p-6 text-center" style={{ backgroundColor: '#A8E6CF', minHeight: '160px' }}>
            <Leaf className="w-8 h-8 mb-1 mx-auto" style={{ color: '#1a4a2e' }} strokeWidth={1.5} />
            <h2 className="text-base font-semibold" style={{ color: '#1a4a2e' }}>Básico</h2>
            <div className="mt-2 flex items-baseline gap-0.5">
              <span className="text-4xl font-bold" style={{ color: '#1a4a2e' }}>R$ 17</span>
              <span className="text-xl font-bold" style={{ color: '#1a4a2e' }}>,90</span>
              <span className="text-sm ml-1" style={{ color: '#1a4a2e', opacity: 0.7 }}>/mês</span>
            </div>
          </div>

          {/* Features */}
          <div className="flex-grow p-5 sm:p-6">
            <ul className="space-y-3">
              <FeatureRow included>Diário completo (manhã e noite)</FeatureRow>
              <FeatureRow included>Dashboard com gráficos</FeatureRow>
              <FeatureRow included>Registro de alimentação</FeatureRow>
              <FeatureRow included>Controle de suplementação</FeatureRow>
              <FeatureRow included>Coach IA: 3 mensagens por dia</FeatureRow>
              <FeatureRow included>1 relatório de IA por mês</FeatureRow>
              <FeatureRow included={false}>Relatórios semanais ilimitados</FeatureRow>
            </ul>
          </div>

          {/* Botão — verde escuro vibrante pra garantir contraste */}
          <div className="p-5 sm:p-6 pt-0">
            <button
              onClick={() => handleSubscribe('basic')}
              className="w-full py-3.5 rounded-2xl font-bold text-sm text-white transition-opacity hover:opacity-90 active:scale-[0.98] shadow-sm"
              style={{ backgroundColor: '#2D8B5A' }}
            >
              Assinar Básico
            </button>
          </div>
        </div>

        {/* ══ STANDARD ══ */}
        <div className="flex flex-col rounded-3xl overflow-hidden border-[3px] border-[#7FDBDA] shadow-[0_8px_32px_rgba(127,219,218,0.25)] hover:shadow-[0_12px_40px_rgba(127,219,218,0.35)] transition-shadow duration-300 bg-white dark:bg-dark-card relative">

          {/* Badge */}
          <div
            className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow z-10"
            style={{ backgroundColor: '#FFB6B9', color: '#1a1a2e' }}
          >
            Mais Popular
          </div>

          {/* Header */}
          <div className="flex flex-col items-center justify-center p-6 text-center" style={{ backgroundColor: '#7FDBDA', minHeight: '160px' }}>
            <Star className="w-8 h-8 mb-1 mx-auto" style={{ color: '#1a3a3a' }} strokeWidth={1.5} />
            <h2 className="text-base font-semibold" style={{ color: '#1a3a3a' }}>Standard</h2>
            <div className="mt-2 flex items-baseline gap-0.5">
              <span className="text-4xl font-bold" style={{ color: '#1a3a3a' }}>R$ 37</span>
              <span className="text-xl font-bold" style={{ color: '#1a3a3a' }}>,90</span>
              <span className="text-sm ml-1" style={{ color: '#1a3a3a', opacity: 0.7 }}>/mês</span>
            </div>
          </div>

          {/* Features */}
          <div className="flex-grow p-5 sm:p-6">
            <ul className="space-y-3">
              <FeatureRow included>Tudo do Básico</FeatureRow>
              <FeatureRow included>Coach IA: 20 mensagens por dia</FeatureRow>
              <FeatureRow included>4 relatórios de IA por mês</FeatureRow>
              <FeatureRow included>Frase motivacional personalizada</FeatureRow>
              <FeatureRow included={false}>Relatórios ilimitados</FeatureRow>
            </ul>
          </div>

          {/* Botão */}
          <div className="p-5 sm:p-6 pt-0">
            <button
              onClick={() => handleSubscribe('standard')}
              className="w-full py-3.5 rounded-2xl font-bold text-sm text-white transition-opacity hover:opacity-90 active:scale-[0.98] shadow-sm"
              style={{ backgroundColor: '#5bbfbd' }}
            >
              Assinar Standard
            </button>
          </div>
        </div>

        {/* ══ PREMIUM ══ */}
        <div className="flex flex-col rounded-3xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-md hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-dark-card">

          {/* Header — teal escuro + texto branco */}
          <div className="flex flex-col items-center justify-center p-6 text-center relative" style={{ backgroundColor: '#2D6A6A', minHeight: '160px' }}>
            <div
              className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
              style={{ backgroundColor: '#FFB6B9', color: '#1a1a2e' }}
            >
              Completo
            </div>
            <Gem className="w-8 h-8 mb-1 mx-auto text-white" strokeWidth={1.5} />
            <h2 className="text-base font-semibold text-white">Premium</h2>
            <div className="mt-2 flex flex-col items-center">
              <div className="flex items-baseline gap-0.5">
                <span className="text-4xl font-bold text-white">R$ {fmt(premiumOption.monthly)}</span>
                <span className="text-sm text-white/70 ml-1">/mês</span>
              </div>
              {selectedPeriod !== 'monthly' && (
                <p className="text-xs text-white/60 mt-0.5">
                  R$ {fmt(premiumOption.price)} cobrado {premiumOption.label.toLowerCase()}
                </p>
              )}
            </div>
          </div>

          {/* Seletor de período — lista vertical, sem preço/mês repetido nas linhas */}
          <div className="px-4 sm:px-5 pt-4 pb-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Período de cobrança</p>
            <div className="space-y-2">
              {PREMIUM_PERIODS.map(opt => {
                const isSelected = selectedPeriod === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedPeriod(opt.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 min-h-[48px] transition-all duration-200 active:scale-[0.99] text-left ${
                      isSelected
                        ? 'border-teal bg-teal/10 dark:bg-teal/20'
                        : 'border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:border-teal/40'
                    }`}
                  >
                    {/* Radio indicator */}
                    <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                      isSelected ? 'border-teal' : 'border-gray-300 dark:border-white/30'
                    }`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-teal" />}
                    </div>

                    {/* Nome do período */}
                    <span className={`text-sm font-semibold flex-1 ${
                      isSelected ? 'text-teal dark:text-mint' : 'text-gray-600 dark:text-gray-300'
                    }`}>
                      {opt.label}
                    </span>

                    {/* Preço total (apenas para não-mensal) */}
                    {opt.id !== 'monthly' && (
                      <span className={`text-xs shrink-0 ${
                        isSelected ? 'text-teal/80 dark:text-mint/80' : 'text-gray-400 dark:text-gray-500'
                      }`}>
                        R$ {fmt(opt.price)}
                      </span>
                    )}

                    {/* Badge de desconto */}
                    {opt.badge && (
                      <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${opt.badgeClass}`}>
                        {opt.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Features */}
          <div className="flex-grow p-5 sm:p-6 pt-3">
            <ul className="space-y-3">
              <FeatureRow included>Tudo do Standard</FeatureRow>
              <FeatureRow included>Coach IA: ilimitado</FeatureRow>
              <FeatureRow included>Relatórios de IA: ilimitados</FeatureRow>
              <FeatureRow included>Suporte prioritário</FeatureRow>
              <FeatureRow included>Acesso antecipado a novos recursos</FeatureRow>
            </ul>
          </div>

          {/* Botão */}
          <div className="p-5 sm:p-6 pt-0">
            <button
              onClick={() => handleSubscribe('premium')}
              className="w-full py-3.5 rounded-2xl font-bold text-sm text-white transition-opacity hover:opacity-90 active:scale-[0.98] shadow-sm"
              style={{ backgroundColor: '#2D6A6A' }}
            >
              Assinar Premium
            </button>
          </div>
        </div>

      </div>{/* fim grid */}

      {/* Selos de confiança */}
      <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mt-10 text-sm text-gray-400">
        <div className="flex items-center gap-2"><Shield className="w-4 h-4" />Pagamento seguro</div>
        <div className="flex items-center gap-2"><Zap className="w-4 h-4" />Acesso imediato</div>
        <div className="flex items-center gap-2"><Clock className="w-4 h-4" />Cancele quando quiser</div>
      </div>

      {/* FAQ */}
      <div className="mt-14 max-w-2xl mx-auto">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-5 text-center">Dúvidas frequentes</h2>
        <div className="space-y-3">
          {FAQ.map((item, i) => (
            <div key={i} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left gap-4"
              >
                <span className="font-semibold text-gray-700 dark:text-gray-200 text-sm">{item.q}</span>
                <span className={`text-gray-400 text-xs shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {openFaq === i && (
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-sm text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-white/5 pt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
