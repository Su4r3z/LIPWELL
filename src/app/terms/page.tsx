import { FileText } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Termos de Uso | LipWell',
  description: 'Leia os Termos de Uso do LipWell antes de utilizar nosso aplicativo de saúde para lipedema.',
};

export default function TermsPage() {
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
          <div className="w-10 h-10 rounded-2xl bg-salmon/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-[#FFB6B9]" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Termos de Uso</h1>
        </div>
        <p className="text-sm text-gray-400 mb-10">Última atualização: {lastUpdated}</p>

        {/* Aviso médico em destaque */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-2xl p-5 mb-10">
          <p className="text-sm text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
            ⚕️ <strong>Aviso Importante:</strong> O LipWell é um aplicativo de apoio ao bem-estar e não substitui o acompanhamento médico profissional. As informações e sugestões geradas pela nossa IA têm caráter educativo e de suporte. Sempre consulte um médico ou especialista para diagnóstico e tratamento.
          </p>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">

          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">1. Aceitação dos Termos</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Ao criar uma conta e utilizar o LipWell, você concorda com estes Termos de Uso e com nossa{' '}
              <Link href="/privacy" className="text-teal dark:text-[#A8E6CF] hover:underline">Política de Privacidade</Link>.
              Se você não concordar com qualquer parte destes termos, não utilize o aplicativo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">2. Descrição do Serviço</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              O LipWell oferece um diário de saúde pessoal, análise de dados via inteligência artificial, sugestões nutricionais anti-inflamatórias e acompanhamento de métricas de bem-estar para mulheres com lipedema. O serviço é disponibilizado mediante assinatura, com período de teste gratuito.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">3. Limitações de Responsabilidade Médica</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
              <li>O LipWell <strong>não é um dispositivo médico</strong> e não foi avaliado por nenhum órgão regulador de saúde.</li>
              <li>As sugestões da Coach IA são baseadas em informações gerais e no que você registra — podendo ser imprecisas ou incompletas.</li>
              <li>Não nos responsabilizamos por decisões de saúde tomadas com base exclusiva nas informações do app.</li>
              <li>Em caso de emergência médica, entre em contato com serviços de emergência (SAMU 192).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">4. Elegibilidade</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              O LipWell é destinado a pessoas com 18 anos ou mais. Ao se cadastrar, você confirma que tem idade mínima para firmar este contrato e que as informações fornecidas são verdadeiras.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">5. Assinatura e Pagamento</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
              <li>O período de teste gratuito dura 7 dias. Após esse período, é necessário assinar um dos planos disponíveis para continuar utilizando os recursos premium.</li>
              <li>O faturamento é automático e recorrente (mensal, trimestral, semestral ou anual, conforme o plano escolhido).</li>
              <li>Você pode cancelar sua assinatura a qualquer momento, sem multa. O acesso se mantém até o fim do período já pago.</li>
              <li>Não realizamos reembolsos proporcionais por períodos não utilizados.</li>
              <li>Os pagamentos são processados pelo Mercado Pago, sujeito aos termos e condições dessa plataforma.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">6. Uso Adequado</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">É proibido:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
              <li>Usar o app para fins ilegais ou prejudiciais a terceiros.</li>
              <li>Tentar acessar dados de outras usuárias.</li>
              <li>Compartilhar suas credenciais de acesso com outras pessoas.</li>
              <li>Realizar engenharia reversa ou reproduzir o serviço sem autorização.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">7. Propriedade Intelectual</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Todo o conteúdo do LipWell — incluindo design, código, textos e a Coach IA — é propriedade exclusiva do LipWell. Os dados de saúde inseridos por você permanecem de sua propriedade e podem ser exportados ou excluídos a qualquer momento.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">8. Modificações</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Podemos atualizar estes Termos periodicamente. Mudanças significativas serão comunicadas via e-mail ou notificação no app com pelo menos 15 dias de antecedência. O uso continuado do app após as mudanças constitui aceitação dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">9. Encerramento de Conta</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Você pode encerrar sua conta a qualquer momento em Configurações → Conta e Dados. Reservamo-nos o direito de suspender contas que violem estes termos, com aviso prévio sempre que possível.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">10. Lei Aplicável</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Estes termos são regidos pela legislação brasileira, em especial a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018) e o Código de Defesa do Consumidor. O foro eleito é o da comarca de São Paulo/SP.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">11. Contato</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Em caso de dúvidas sobre estes termos, entre em contato:{' '}
              <a href="mailto:suporte@lipwell.app" className="text-teal dark:text-[#A8E6CF] hover:underline font-medium">
                suporte@lipwell.app
              </a>
            </p>
          </section>

        </div>

        {/* Footer da página */}
        <div className="mt-12 pt-8 border-t border-gray-100 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <p>© {new Date().getFullYear()} LipWell. Todos os direitos reservados.</p>
          <Link href="/privacy" className="hover:text-teal dark:hover:text-[#A8E6CF] transition-colors">
            Política de Privacidade →
          </Link>
        </div>
      </div>
    </div>
  );
}
