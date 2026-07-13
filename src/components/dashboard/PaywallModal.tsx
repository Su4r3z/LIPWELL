'use client';
import { Crown, Lock, Sparkles } from 'lucide-react';

interface PaywallModalProps {
  daysOverdue?: number;
}

export function PaywallModal({ daysOverdue = 0 }: PaywallModalProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop com blur */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      
      <div className="relative max-w-md w-full bg-white dark:bg-dark-card rounded-3xl p-8 shadow-2xl text-center animate-in zoom-in-95 fade-in duration-500">
        
        {/* Ícone Premium */}
        <div className="relative inline-flex mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-salmon/20 to-salmon/5 border-2 border-salmon/30 flex items-center justify-center">
            <Crown className="w-12 h-12 text-salmon" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
            <Lock className="w-4 h-4 text-white" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Seu período gratuito encerrou
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">
          {daysOverdue > 0
            ? `Há ${daysOverdue} ${daysOverdue === 1 ? 'dia' : 'dias'} seus dados estão esperando por você.`
            : 'Seus 5 dias de teste chegaram ao fim.'
          }{' '}
          Continue sua jornada de bem‑estar e não perca o histórico que já construiu.
        </p>

        {/* Benefícios do plano */}
        <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 mb-8 text-left space-y-2">
          {[
            'Diário ilimitado de sintomas',
            'Análise de IA personalizada',
            'Histórico completo de progressos',
            'Sugestões anti-inflamatórias diárias',
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <Sparkles className="w-4 h-4 text-salmon shrink-0" />
              {item}
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => window.open('https://lipwell.com.br/planos', '_blank')}
          className="w-full py-4 px-6 bg-gradient-to-r from-salmon to-[#ff9a9e] text-white font-bold rounded-2xl text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all active:scale-95"
        >
          Assinar Agora ✨
        </button>
        <p className="text-xs text-gray-400 mt-3">
          Cancele quando quiser · Sem fidelidade
        </p>
      </div>
    </div>
  );
}
