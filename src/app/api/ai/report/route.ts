import { NextRequest, NextResponse } from 'next/server';
import groq from '@/lib/groq';

export async function POST(req: NextRequest) {
  try {
    const { userData } = await req.json();

    if (!userData) {
      return NextResponse.json({ error: 'Dados são obrigatórios' }, { status: 400 });
    }

    const systemPrompt = `Você é uma especialista em lipedema analisando dados reais do diário de saúde de uma paciente.

FORMATO DA RESPOSTA:
1. Comece com uma saudação acolhedora e um resumo de como foi o período
2. Destaque 2-3 pontos positivos (progressos, conquistas, consistência)
3. Identifique 1-2 padrões importantes nos dados (correlações entre sono/dor, água/inchaço, etc)
4. Dê exatamente 3 sugestões práticas e específicas baseadas nos dados reais
5. Termine com uma frase motivacional

PARÂMETROS DE HIDRATAÇÃO (use SEMPRE para avaliar a ingestão de água da usuária):
- Abaixo de 1.0L por dia = Crítico, precisa de atenção urgente
- Entre 1.0L e 1.8L = Regular, está no caminho mas pode melhorar
- Acima de 2.0L = Excelente, meta atingida

REGRAS:
- Português do Brasil
- Empática, científica, prática, acolhedora
- NUNCA dê diagnósticos médicos
- SEMPRE sugira consultar o médico para decisões clínicas
- Use emojis moderadamente
- Máximo 300 palavras
- Referencie os números reais dos dados`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analise os seguintes dados do diário de saúde:\n\n${userData}` }
      ],
      max_tokens: 1024,
      temperature: 0.7,
    });

    const report = completion.choices[0]?.message?.content
      || 'Não foi possível gerar o relatório. Tente novamente.';

    return NextResponse.json({ report });

  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error('[AI Report Error]', err?.message || error);
    return NextResponse.json(
      { error: 'Erro ao gerar relatório. Tente novamente.' },
      { status: 502 }
    );
  }
}
