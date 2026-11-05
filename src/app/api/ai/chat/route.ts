import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getGroq } from '@/lib/groq';
import { requireAiQuota } from '@/lib/ai-guard';

const ChatSchema = z.object({
  message: z.string().trim().min(1).max(2000),
  context: z.string().max(8000).optional(),
  // Só aceita user/assistant: impede injetar mensagens 'system' pelo navegador
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().max(4000),
  })).max(20).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const parsed = ChatSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: 'Mensagem inválida' }, { status: 400 });
    }
    const { message, context, history } = parsed.data;

    const guard = await requireAiQuota('coach');
    if (guard.response) return guard.response;

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

    const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
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
    if (history) {
      messages.push(...history.slice(-10));
    }

    // Mensagem atual
    messages.push({ role: 'user', content: message });

    const completion = await getGroq().chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages,
      max_tokens: 512,
      temperature: 0.7,
      top_p: 0.9,
    });

    const reply = completion.choices[0]?.message?.content
      || 'Desculpe, não consegui processar sua pergunta. Pode tentar de novo? 🌸';

    return NextResponse.json({ reply, usage: { used: guard.quota.used, limit: guard.quota.limit } });

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
