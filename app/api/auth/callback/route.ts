import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

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
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    // Troca o code pela sessão e salva nos cookies
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Redireciona pra page.tsx do auth-callback que faz a lógica de dashboard/onboarding
      return NextResponse.redirect(`${origin}/auth-callback`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}