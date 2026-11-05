import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Após clicar no link do e-mail, enviaremos por padrão para o Onboarding
  // Só aceita caminhos internos: "?next=@evil.com" ou "//evil.com" virariam redirect externo
  const rawNext = searchParams.get('next') ?? '/onboarding'
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') && !rawNext.includes('\\') ? rawNext : '/onboarding'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
            } catch (error) {}
          },
        },
      }
    )
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Deu sucesso ao converter o clique do email em Sessão. Vamos jogar pro Onboarding!
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Se der erro, manda avisando
  return NextResponse.redirect(`${origin}/login?error=LinkInvalidoOuExpirado`)
}
