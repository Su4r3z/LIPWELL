import { NextRequest, NextResponse } from 'next/server';
import groq from '@/lib/groq';

export async function POST(req: NextRequest) {
  try {
    const { foodName, category } = await req.json();

    if (!foodName) {
      return NextResponse.json({ error: 'Nome do alimento é obrigatório' }, { status: 400 });
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: 'Você é uma nutricionista especialista em lipedema. Responda APENAS com um JSON válido, sem nenhum texto adicional. O formato é: {"is_anti_inflammatory": true ou false, "reason": "explicação curta em português de no máximo 30 palavras"}'
        },
        {
          role: 'user',
          content: `O alimento "${foodName}" (categoria: ${category || 'geral'}) é anti-inflamatório e adequado para uma dieta de controle de lipedema?`
        }
      ],
      max_tokens: 150,
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    return NextResponse.json({
      is_anti_inflammatory: parsed.is_anti_inflammatory ?? false,
      reason: parsed.reason ?? 'Não foi possível classificar.',
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
