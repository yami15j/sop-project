import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // El parámetro 'next' nos dirá a dónde ir (en este caso, /dashboard)
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // El host puede variar en producción, así que usamos el origin de la petición
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Si algo falla, lo mandamos al login con un error
  return NextResponse.redirect(`${origin}/login?error=No se pudo verificar el correo`)
}
