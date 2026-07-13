'use client';

import { useState } from 'react';
import {
  CreditCard, Sparkles, ArrowRight, Crown, Leaf, Star, Gem,
  AlertTriangle, X, CheckCircle2, ChevronRight, Calendar,
  Shield, MessageCircle, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { differenceInDays, addDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CANCEL_REASONS = [
  'Está caro para mim agora',
  'Não estou usando o suficiente',
  'Encontrei uma alternativa melhor',
  'Não atendeu minhas expectativas',
  'Problemas técnicos',
  'Outro motivo',
];

const PLAN_CONFIG: Record<string, {
  label: string; color: string; bg: string; border: string;
  icon: React.ReactNode; price: string; period: string;
}> = {
  trial: {
    label: 'Período de Teste', color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800/40',
    icon: <Sparkles className="w-5 h-5" />, price: 'Gratuito', period: '7 dias',
  },
  free: {
    label: 'Plano Gratuito', color: 'text-gray-600 dark:text-gray-400',
    bg: 'bg-gray-50 dark:bg-white/5', border: 'border-gray-200 dark:border-white/10',
    icon: <Leaf className="w-5 h-5" />, price: 'R$ 0', period: '/mês',
  },
  basic: {
    label: 'Plano Básico', color: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800/40',
    icon: <Leaf className="w-5 h-5" />, price: 'R$ 17,90', period: '/mês',
  },
  standard: {
    label: 'Plano Standard', color: 'text-teal dark:text-mint',
    bg: 'bg-teal/5 dark:bg-teal/10', border: 'border-teal/20 dark:border-teal/30',
    icon: <Star className="w-5 h-5" />, price: 'R$ 37,90', period: '/mês',
  },
  premium: {
    label: 'Plano Premium', color: 'text-[#2D6A6A] dark:text-mint',
    bg: 'bg-gradient-to-r from-teal/10 to-mint/10', border: 'border-teal/30',
    icon: <Gem className="w-5 h-5" />, price: 'R$ 67,90', period: '/mês',
  },
};

interface Props {
  status: string;
  trialStartedAt: string | null;
}

export function SubscriptionTab({ status, trialStartedAt }: Props) {
  const [cancelStep, setCancelStep] = useState<0 | 1 | 2>(0); // 0=fechado, 1=motivo, 2=confirmação
  const [selectedReason, setSelectedReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const plan = PLAN_CONFIG[status] ?? PLAN_CONFIG['free'];
  const isPaid = ['basic', 'standard', 'premium'].includes(status);
  const isTrial = status === 'trial';

  // Calcular dias restantes do trial
  const trialDaysLeft = trialStartedAt
    ? Math.max(0, 7 - differenceInDays(new Date(), new Date(trialStartedAt)))
    : 7;

  // Data simulada de renovação (próximo mês)
  const nextRenewal = format(addDays(new Date(), 28), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  const handleCancelConfirm = async () => {
    setCancelling(true);
    // Placeholder — aqui chamaria a API do Mercado Pago para cancelar
    await new Promise(r => setTimeout(r, 1500));
    setCancelling(false);
    setCancelStep(0);
    // toast.success('Assinatura cancelada. Você mantém o acesso até o fim do período.');
  };

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-300">

        {/* ── Card do Plano Atual ─────────────────────────────────── */}
        <Card className="p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-6">
            <CreditCard className="w-5 h-5 text-teal" />
            Minha Assinatura
          </h2>

          {/* Badge do plano */}
          <div className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border ${plan.bg} ${plan.border} ${plan.color} mb-5`}>
            {plan.icon}
            <span className="font-bold text-sm">{plan.label}</span>
            {status === 'premium' && <Crown className="w-4 h-4 text-amber-500" />}
          </div>

          {/* Detalhes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4">
              <p className="text-xs text-gray-400 mb-1">Valor</p>
              <p className="font-bold text-gray-800 dark:text-white">{plan.price}</p>
              <p className="text-xs text-gray-400">{plan.period}</p>
            </div>

            <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4">
              <p className="text-xs text-gray-400 mb-1">
                {isTrial ? 'Dias Restantes' : 'Próxima Cobrança'}
              </p>
              {isTrial ? (
                <>
                  <p className="font-bold text-orange-500 text-lg">{trialDaysLeft}</p>
                  <p className="text-xs text-gray-400">dias</p>
                </>
              ) : isPaid ? (
                <>
                  <p className="font-bold text-gray-800 dark:text-white text-sm">{nextRenewal}</p>
                </>
              ) : (
                <p className="text-xs text-gray-500 mt-1">—</p>
              )}
            </div>

            {isPaid && (
              <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4">
                <p className="text-xs text-gray-400 mb-1">Método</p>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-4 rounded bg-blue-600 flex items-center justify-center">
                    <span className="text-white text-[7px] font-bold leading-none">VISA</span>
                  </div>
                  <p className="font-bold text-gray-800 dark:text-white text-sm">•••• 4242</p>
                </div>
              </div>
            )}
          </div>

          {/* Ações */}
          <div className="flex flex-wrap gap-3">
            {!isPaid && (
              <Link
                href="/plans"
                className="flex items-center gap-2 bg-gradient-to-r from-salmon to-orange-400 text-white font-bold px-5 py-3 rounded-2xl shadow-md hover:opacity-90 transition-opacity text-sm"
              >
                <Sparkles className="w-4 h-4" />
                {isTrial ? 'Assinar Agora' : 'Ver Planos'}
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            {isPaid && (
              <>
                <Link
                  href="/plans"
                  className="flex items-center gap-2 border-2 border-teal text-teal dark:text-mint dark:border-mint font-bold px-5 py-3 rounded-2xl hover:bg-teal hover:text-white dark:hover:bg-mint dark:hover:text-teal transition-all text-sm"
                >
                  Alterar Plano <ChevronRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => setCancelStep(1)}
                  className="px-5 py-3 rounded-2xl border border-red-200 dark:border-red-900/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium text-sm transition-colors"
                >
                  Cancelar Assinatura
                </button>
              </>
            )}
          </div>
        </Card>

        {/* ── Benefícios do plano / CTA para upgrade ──────────────── */}
        {!isPaid && (
          <Card className="p-6 bg-gradient-to-br from-teal/5 to-mint/5 border border-teal/10">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-teal flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 dark:text-white mb-1">Desbloqueie o potencial completo</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Coach IA ilimitada, relatórios semanais e muito mais.</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
                  {[
                    { icon: <MessageCircle className="w-4 h-4" />, text: 'IA Ilimitada' },
                    { icon: <Calendar className="w-4 h-4" />, text: 'Relatórios semanais' },
                    { icon: <Shield className="w-4 h-4" />, text: 'Suporte prioritário' },
                  ].map((b, i) => (
                    <div key={i} className="flex items-center gap-2 text-teal dark:text-mint text-xs font-medium">
                      {b.icon} {b.text}
                    </div>
                  ))}
                </div>
                <Link
                  href="/plans"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-salmon to-orange-400 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity"
                >
                  Ver todos os planos <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </Card>
        )}

        {/* ── Histórico de Faturas (apenas paid) ───────────────────── */}
        {isPaid && (
          <Card className="p-6">
            <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              Histórico de Faturas
            </h3>
            <div className="space-y-2">
              {[
                { date: '01/04/2026', value: 'R$ 37,90', status: 'Pago' },
                { date: '01/03/2026', value: 'R$ 37,90', status: 'Pago' },
                { date: '01/02/2026', value: 'R$ 37,90', status: 'Pago' },
              ].map((fatura, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-white/5 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{fatura.date}</p>
                    <p className="text-xs text-gray-400">{plan.label}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-800 dark:text-white">{fatura.value}</p>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 justify-end">
                      <CheckCircle2 className="w-3 h-3" /> {fatura.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">Faturas via Mercado Pago</p>
          </Card>
        )}
      </div>

      {/* ── Modal de Cancelamento ─────────────────────────────────── */}
      {cancelStep > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setCancelStep(0)}
        >
          <div
            className="bg-white dark:bg-dark-card max-w-md w-full rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Passo 1: Selecionar motivo */}
            {cancelStep === 1 && (
              <div className="p-8 space-y-5">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                  </div>
                  <button onClick={() => setCancelStep(0)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">Sentiremos sua falta 💙</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Antes de cancelar, nos conte o motivo para podermos melhorar.</p>
                </div>

                <div className="space-y-2">
                  {CANCEL_REASONS.map(reason => (
                    <button
                      key={reason}
                      onClick={() => setSelectedReason(reason)}
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        selectedReason === reason
                          ? 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                          : 'border-gray-100 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-gray-200 dark:hover:border-white/20'
                      }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="ghost" onClick={() => setCancelStep(0)} className="flex-1">
                    Manter Assinatura
                  </Button>
                  <Button
                    onClick={() => { if (selectedReason) setCancelStep(2); }}
                    disabled={!selectedReason}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white border-0"
                  >
                    Continuar
                  </Button>
                </div>
              </div>
            )}

            {/* Passo 2: Confirmação final */}
            {cancelStep === 2 && (
              <div className="p-8 space-y-5">
                <button onClick={() => setCancelStep(0)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400">
                  <X className="w-5 h-5" />
                </button>

                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">Tem certeza?</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Ao cancelar, você perderá acesso à Coach IA ilimitada, relatórios semanais e suporte prioritário ao fim do período atual ({nextRenewal}).
                  </p>
                </div>

                {/* O que você vai perder */}
                <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl p-4 space-y-2">
                  {['Coach IA ilimitada', 'Relatórios semanais personalizados', 'Histórico completo de saúde'].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
                      <X className="w-4 h-4 shrink-0" /> {item}
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => setCancelStep(0)}
                    className="w-full border-2 border-teal text-teal dark:text-mint hover:bg-teal hover:text-white font-bold"
                  >
                    Manter Minha Assinatura
                  </Button>
                  <button
                    onClick={handleCancelConfirm}
                    disabled={cancelling}
                    className="w-full py-3 rounded-2xl text-red-500 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2"
                  >
                    {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {cancelling ? 'Cancelando...' : 'Confirmar Cancelamento'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
