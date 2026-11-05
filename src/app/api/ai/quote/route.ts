import { NextResponse } from 'next/server';
import { getGroq } from '@/lib/groq';

const CACHE_HEADERS = { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' };

// Cache em memória simples (reseta se o servidor reiniciar)
let cachedQuote: { text: string; generatedAt: string } | null = null;

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Se já gerou hoje, retorna do cache
    if (cachedQuote && cachedQuote.generatedAt === today) {
      return NextResponse.json({ quote: cachedQuote.text, cached: true }, { headers: CACHE_HEADERS });
    }

    const completion = await getGroq().chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content:
            'Você é uma amiga encorajadora que entende as dores do lipedema e caminha junto com a usuária nessa jornada. Gere UMA frase motivacional curta (máximo 15 palavras) em português do Brasil. Foco em empoderamento, autocuidado e força feminina. Sem religião. Use no máximo 1 emoji. NUNCA use aspas na resposta. NUNCA comece com aspas. Apenas a frase direta, como se estivesse falando com uma amiga. Responda APENAS com a frase, nada mais.',
        },
        { role: 'user', content: 'Gere a frase do dia.' },
      ],
      max_tokens: 60,
      temperature: 0.7,
    });

    const text = completion.choices[0]?.message?.content?.trim()
      ?? 'Seu corpo merece cuidado e amor todos os dias. 💜';

    cachedQuote = { text, generatedAt: today };

    return NextResponse.json({ quote: text, cached: false }, { headers: CACHE_HEADERS });
  } catch (err) {
    console.error('[Quote API]', err);
    // Fallback gracioso
    return NextResponse.json({
      quote: 'Cada passo no autocuidado é uma vitória. 🌸',
      cached: false,
    });
  }
}
