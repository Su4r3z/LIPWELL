import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getGroq } from '@/lib/groq';
import { requireAiQuota } from '@/lib/ai-guard';

const FoodSchema = z.object({
  foodName: z.string().trim().min(1).max(120),
  category: z.string().trim().max(40).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const input = FoodSchema.safeParse(await req.json().catch(() => null));
    if (!input.success) {
      return NextResponse.json({ error: 'Nome do alimento inválido' }, { status: 400 });
    }
    const { foodName, category } = input.data;

    const guard = await requireAiQuota('food');
    if (guard.response) return guard.response;

    const completion = await getGroq().chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: 'Você é uma nutricionista especialista em lipedema. Responda APENAS com um JSON válido, sem nenhum texto adicional. O formato é: {"is_anti_inflammatory": true ou false, "reason": "explicação curta em português de no máximo 30 palavras"}'
        },
        {
          role: 'user',
          content: `O alimento ${JSON.stringify(foodName)} (categoria: ${category || 'geral'}) é anti-inflamatório e adequado para uma dieta de controle de lipedema?`
        }
      ],
      max_tokens: 150,
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    return NextResponse.json({
      is_anti_inflammatory: parsed.is_anti_inflammatory === true,
      reason: typeof parsed.reason === 'string' ? parsed.reason.slice(0, 300) : 'Não foi possível classificar.',
    });

  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error('[Food Check Error]', err?.message || error);
    return NextResponse.json(
      { is_anti_inflammatory: false, reason: 'Erro ao classificar. Consulte seu nutricionista.' },
      { status: 502 }
    );
  }
}
