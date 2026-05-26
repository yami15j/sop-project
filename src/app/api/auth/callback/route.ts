import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Por defecto, redirigimos a la pantalla de éxito estático
  const next = searchParams.get('next') ?? '/signup/verified-static'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Si el token ya fue consumido (por ejemplo, porque el polling de la computadora inició sesión primero),
  // redirigimos de todas formas a la pantalla de éxito estático para evitar confundir al usuario con el login.
  return NextResponse.redirect(`${origin}/signup/verified-static`)
}
