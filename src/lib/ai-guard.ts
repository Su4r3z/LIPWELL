import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export type QuotaKind = 'coach' | 'report' | 'food';

interface QuotaResult {
  allowed: boolean;
  used?: number;
  limit?: number | null;
  plan?: string;
  reason?: string;
}

/**
 * Exige usuária logada e consome 1 unidade da cota de IA no banco
 * (função consume_ai_quota, que o navegador não consegue burlar).
 * Retorna { quota } em caso de sucesso ou { response } com o erro pronto.
 */
export async function requireAiQuota(kind: QuotaKind):
  Promise<{ quota: QuotaResult; response?: never } | { response: NextResponse; quota?: never }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { response: NextResponse.json({ error: 'Não autenticado' }, { status: 401 }) };
  }

  const { data, error } = await supabase.rpc('consume_ai_quota', { kind });
  if (error) {
    console.error('[AI Quota]', error.message);
    return { response: NextResponse.json({ error: 'Erro ao verificar seu plano.' }, { status: 500 }) };
  }

  const quota = data as QuotaResult;
  if (!quota?.allowed) {
    return {
      response: NextResponse.json(
        { error: 'Limite do seu plano atingido.', code: 'LIMIT_REACHED', ...quota },
        { status: 429 },
      ),
    };
  }

  return { quota };
}
