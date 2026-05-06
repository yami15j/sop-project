'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    // Para simplificar, redirigimos con un error en la URL
    redirect(`/login?error=${encodeURIComponent('No se pudo iniciar sesión. Verifica tus credenciales.')}`)
  }

  // Si todo va bien, mostramos bienvenida en el dashboard
  revalidatePath('/', 'layout')
  redirect('/dashboard?bienvenido=1')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    // Ya no imprimimos el error gigante en consola para mantenerla limpia
    console.info(`ℹ️ Intento de registro denegado: ${error.message}`)
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  // Después del registro, igual los mandamos al dashboard
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
