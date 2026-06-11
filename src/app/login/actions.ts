'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email    = formData.get('email') as string
  const password = formData.get('password') as string

  // 1. Autenticar con Supabase Auth
  const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !authData.user) {
    redirect(`/login?error=${encodeURIComponent('No se pudo iniciar sesión. Verifica tus credenciales.')}`)
  }

  // 2. Consultar el rol del usuario en la tabla profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('rol')
    .eq('user_id', authData.user.id)
    .single()

  revalidatePath('/', 'layout')

  // 3. Redirigir según el rol
  if (profile?.rol === 'admin' || profile?.rol === 'mentor') {
    redirect('/admin')
  }

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
    console.info(`ℹ️ Intento de registro denegado: ${error.message}`)
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  // El trigger en Supabase crea el perfil automáticamente con rol='student'
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
