import { Shield } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidade | LipWell',
  description: 'Saiba como o LipWell coleta, usa e protege seus dados de saúde com total transparência e segurança.',
};

export default function PrivacyPage() {
  const lastUpdated = '26 de abril de 2026';

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#1a1a2e]">
      {/* Header */}
      <div className="bg-white dark:bg-[#2a2a3e] border-b border-gray-100 dark:border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-6 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-teal dark:text-[#A8E6CF]">
            LipWell
          </Link>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-teal transition-colors">
            ← Voltar ao App
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Título */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-teal/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-teal dark:text-[#A8E6CF]" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Política de Privacidade</h1>
        </div>
        <p className="text-sm text-gray-400 mb-10">Última atualização: {lastUpdated}</p>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">

          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">1. Quem somos</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              O <strong>LipWell</strong> é um aplicativo de saúde pessoal desenvolvido para apoiar mulheres no acompanhamento do lipedema. Não somos uma empresa médica e não fornecemos diagnósticos ou prescrições. Todas as informações geradas pela nossa IA têm caráter informativo e de suporte, e não substituem a orientação de um profissional de saúde.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">2. Quais dados coletamos</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">Coletamos apenas os dados necessários para personalizar sua experiência:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
              <li><strong>Dados de cadastro:</strong> nome, e-mail, data de nascimento e telefone.</li>
              <li><strong>Dados de saúde:</strong> estágio do lipedema, área de concentração de dor, nível de dor diário, energia, humor, hidratação, uso de compressão e exercícios.</li>
              <li><strong>Dados de alimentação:</strong> refeições registradas voluntariamente por você.</li>
              <li><strong>Dados de uso:</strong> frequência de uso do app e interações com a Coach IA (sem armazenar o conteúdo das conversas).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">3. Como usamos seus dados</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
              <li>Personalizar os relatórios e as respostas da Coach IA.</li>
              <li>Calcular métricas de saúde (média de dor, hidratação, streak).</li>
              <li>Melhorar nosso serviço de forma agregada e anonimizada.</li>
              <li>Processar pagamentos de assinatura via Mercado Pago.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">4. Compartilhamento de dados</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              <strong>Nunca vendemos seus dados.</strong> Compartilhamos informações apenas com os provedores de infraestrutura essenciais ao funcionamento do app:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 mt-3">
              <li><strong>Supabase</strong> (armazenamento seguro de dados, com criptografia em trânsito e em repouso).</li>
              <li><strong>Groq / Anthropic</strong> (processamento de IA para gerar respostas e relatórios — apenas o contexto necessário é enviado, sem identificação pessoal).</li>
              <li><strong>Mercado Pago</strong> (processamento de pagamentos de assinatura).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">5. Segurança</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Seus dados são protegidos por Row Level Security (RLS) no banco de dados, o que garante que apenas você tenha acesso às suas próprias informações. Toda comunicação entre o app e nossos servidores é feita via HTTPS com criptografia TLS.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">6. Seus direitos</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
              <li><strong>Acesso:</strong> você pode ver todos os seus dados no próprio app.</li>
              <li><strong>Correção:</strong> edite seus dados a qualquer momento em Configurações → Perfil.</li>
              <li><strong>Exclusão:</strong> você pode excluir sua conta e todos os dados em Configurações → Conta e Dados.</li>
              <li><strong>Portabilidade:</strong> entre em contato para solicitar uma exportação dos seus dados.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">7. Retenção de dados</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Seus dados são mantidos enquanto sua conta estiver ativa. Após a exclusão da conta, todos os dados são permanentemente removidos em até 30 dias.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">8. Contato</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Para dúvidas sobre privacidade, entre em contato pelo e-mail:{' '}
              <a href="mailto:privacidade@lipwell.app" className="text-teal dark:text-[#A8E6CF] hover:underline font-medium">
                privacidade@lipwell.app
              </a>
            </p>
          </section>

        </div>

        {/* Footer da página */}
        <div className="mt-12 pt-8 border-t border-gray-100 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <p>© {new Date().getFullYear()} LipWell. Todos os direitos reservados.</p>
          <Link href="/terms" className="hover:text-teal dark:hover:text-[#A8E6CF] transition-colors">
            Termos de Uso →
          </Link>
        </div>
      </div>
    </div>
  );
}
