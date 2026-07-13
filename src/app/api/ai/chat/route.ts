import { NextRequest, NextResponse } from 'next/server';
import groq from '@/lib/groq';

export async function POST(req: NextRequest) {
  try {
    const { message, context, history } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Mensagem é obrigatória' }, { status: 400 });
    }

    const systemPrompt = `Você é a LipWell, uma coach virtual especializada em lipedema. Você tem acesso aos dados reais do diário de saúde da usuária.

REGRAS IMPORTANTES:
- Responda SEMPRE em português do Brasil
- Seja empática, acolhedora, prática e científica
- NUNCA dê diagnósticos médicos
- NUNCA prescreva medicamentos
- Se a pergunta for sobre medicação, SEMPRE diga para consultar o médico
- Use emojis moderadamente pra ser amigável (máximo 3 por resposta)
- Seja concisa: máximo 150 palavras por resposta
- Quando falar de dados, referencie os números reais da usuária
- Lipedema se controla com estratégia, não com proibições
- Cada mulher é diferente, o que funciona pra uma pode não funcionar pra outra
- Foque em: hidratação, alimentação anti-inflamatória, sono, exercício adequado, autocuidado, saúde emocional

DIRETRIZES DE ALIMENTAÇÃO E SUPLEMENTAÇÃO:
- Quando sugerir alimentos ou cardápios, priorize opções acessíveis e de bom custo-benefício. Exemplos: ovo, frango, sardinha, banana, batata doce, aveia, feijão. Evite sugerir alimentos caros ou difíceis de encontrar.
- SEMPRE inclua pelo menos uma fonte de proteína em qualquer sugestão de refeição ou cardápio.
- Não sugira suplementos caros sem necessidade clara. Priorize mudanças na alimentação e estilo de vida antes de recomendar suplementação.
- Fale como uma companheira de jornada, uma amiga que entende o que a usuária passa. Nada de tom formal de IA ou poético. Seja direta, prática e acolhedora.

Se a usuária perguntar algo fora do tema de saúde/lipedema, redirecione gentilmente pro foco do app.`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const messages: any[] = [
      { role: 'system', content: systemPrompt },
    ];

    // Injeta contexto dos dados reais da usuária
    if (context) {
      messages.push({
        role: 'user',
        content: `[CONTEXTO - DADOS DO DIÁRIO DA USUÁRIA - USE PARA PERSONALIZAR RESPOSTAS]\n${context}`
      });
      messages.push({
        role: 'assistant',
        content: 'Entendi os dados. Estou pronta para ajudar com base no seu histórico. Como posso te ajudar hoje? 🌸'
      });
    }

    // Histórico das últimas mensagens (max 10)
    if (history && Array.isArray(history)) {
      messages.push(...history.slice(-10));
    }

    // Mensagem atual
    messages.push({ role: 'user', content: message });

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages,
      max_tokens: 512,
      temperature: 0.7,
      top_p: 0.9,
    });

    const reply = completion.choices[0]?.message?.content
      || 'Desculpe, não consegui processar sua pergunta. Pode tentar de novo? 🌸';

    return NextResponse.json({ reply });

  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    console.error('[AI Chat Error]', err?.message || error);

    if (err?.status === 429) {
      return NextResponse.json(
        { error: 'A IA está sobrecarregada. Tente novamente em alguns segundos.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao processar mensagem. Tente novamente.' },
      { status: 502 }
    );
  }
}
