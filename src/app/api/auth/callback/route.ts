import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  // Obtener el User-Agent para distinguir entre móvil y computadora (web)
  const userAgent = request.headers.get('user-agent') || ''
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)

  // Destino exitoso:
  // - En móvil: se queda en la pantalla de éxito estático para invitarlo a volver a la computadora.
  // - En computadora: se le redirige directamente al Dashboard con flags de bienvenida.
  const successRedirect = isMobile 
    ? `${origin}/signup/verified-static` 
    : `${origin}/dashboard?bienvenido=1&nuevo=1&verificado=1`

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(successRedirect)
    }
  }

  // Si el código no está presente o el token ya fue consumido (ej. por el polling automático):
  if (!isMobile) {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    // Si ya existe sesión en este navegador de computadora, lo mandamos directo al dashboard
    if (session) {
      return NextResponse.redirect(`${origin}/dashboard?bienvenido=1&nuevo=1&verificado=1`)
    }
    // Si no hay sesión, igual intentamos mandarlo a /dashboard (el middleware/página se encargará de login si no está logueado)
    return NextResponse.redirect(`${origin}/dashboard`)
  }

  // En móvil, si falló o el token ya fue consumido, lo dejamos en la pantalla estática de confirmación para evitar confusión.
  return NextResponse.redirect(`${origin}/signup/verified-static`)
}

