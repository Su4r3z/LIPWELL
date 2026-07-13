import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  // Grace callback caso o ambiente ainda não possua chaves reais de dev
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sua-url-dummy.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sua-chave-anon-dummy';

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.warn("⚠️ MODO DEV VISUAL: Chaves do Supabase não encontradas. O Cliente Front-end iniciou no Modo Mockado.");
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
