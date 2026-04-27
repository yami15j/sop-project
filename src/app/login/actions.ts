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
    redirect('/login?error=No se pudo iniciar sesión, verifica tus credenciales')
  }

  // Si todo va bien, mandamos al usuario al dashboard (que crearemos luego)
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    console.error("Supabase SignUp Error:", error)
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  // Después del registro, igual los mandamos al dashboard
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
