import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'
import { createClient } from '@/utils/supabase/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

// --- RATE LIMITING BÁSICO EN MEMORIA ---
const ipRequests = new Map<string, { count: number, resetTime: number }>()
const MAX_REQUESTS_PER_HOUR = 5
const ONE_HOUR = 60 * 60 * 1000

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = ipRequests.get(ip)

  if (!record || now > record.resetTime) {
    ipRequests.set(ip, { count: 1, resetTime: now + ONE_HOUR })
    return true
  }

  if (record.count >= MAX_REQUESTS_PER_HOUR) return false

  record.count++
  return true
}


export async function POST(req: Request) {
  // 1. Verificación de Rate Limit
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1'
  if (!checkRateLimit(ip)) {
    console.error(`[SEGURIDAD] Bloqueo por Rate Limit a la IP: ${ip}`)
    return NextResponse.json({ error: 'Has superado el límite de intentos por hora. Intenta más tarde.' }, { status: 429 })
  }
  try {
    const supabase = await createClient()

    // 0. Autenticación y Límites
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autorizado. Inicia sesión.' }, { status: 401 })
    }

    // Verificar límite de 2 ensayos gratis
    const { count } = await supabase
      .from('ensayos_enviados')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (count !== null && count >= 2) {
      return NextResponse.json(
        { error: 'Has alcanzado el límite de 2 ensayos gratuitos. Por favor adquiere una mentoría premium para continuar.' },
        { status: 403 }
      )
    }

    // 1. Recibir los datos
    const body = await req.json()
    const { ensayo, pais_destino, beca_objetivo } = body

    if (!ensayo || ensayo.trim().length < 50) {
      return NextResponse.json({ error: 'El ensayo es muy corto.' }, { status: 400 })
    }
    if (ensayo.length > 15000) {
      return NextResponse.json({ error: 'El ensayo es demasiado largo.' }, { status: 400 })
    }

    // 2. Leer tu archivo de prompt
    const promptPath = path.join(process.cwd(), 'prompt_v1.md')
    const systemPrompt = fs.readFileSync(promptPath, 'utf-8')

    const userMessage = `País de destino: ${pais_destino}\nBeca objetivo: ${beca_objetivo}\n\nEnsayo:\n${ensayo}`

    // 3. Enviar a Claude
    let claudeResponse = ''
    try {
      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-latest', // Modelo válido de Anthropic
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      })
      claudeResponse = message.content[0].type === 'text' ? message.content[0].text : ''
    } catch (apiError: any) {
      console.warn("Anthropic API falló.", apiError.message)
      claudeResponse = `
📊 PUNTUACIÓN GENERAL: 0/10

✅ NOTA IMPORTANTE:
Hubo un inconveniente técnico al procesar el análisis detallado. Esto puede deberse a un problema temporal de conexión o mantenimiento del sistema.

🔧 PRÓXIMOS PASOS:
1. Reintenta enviar tu ensayo en unos minutos.
2. Si el problema persiste, contacta al soporte técnico.

💡 RECOMENDACIÓN:
Para no perder tiempo, puedes agendar una sesión directamente con un mentor para una revisión humana mientras restablecemos el servicio automático.`
    }

    // Extraer el puntaje dinámicamente de la respuesta de Claude usando Regex
    // Busca patrones como "PUNTUACIÓN GENERAL: 7/10" o "PUNTUACION GENERAL: 9/10"
    const scoreMatch = claudeResponse.match(/PUNTUACI(?:O|Ó)N GENERAL:\s*(\d+)\/10/i)
    const puntajeReal = scoreMatch ? parseInt(scoreMatch[1], 10) : 8 // Si no lo encuentra, por defecto 8

    // 4. Guardar en Base de Datos
    // Insertar ensayo (con nombre y email del usuario para trazabilidad)
    const nombreUsuario = user.user_metadata?.full_name
      || user.user_metadata?.name
      || user.email?.split('@')[0]
      || 'Desconocido'

    const { data: ensayoData, error: ensayoError } = await supabase
      .from('ensayos_enviados')
      .insert({
        user_id: user.id,
        contenido: ensayo,
        pais_destino,
        beca_objetivo,
        nombre_usuario: nombreUsuario,
        email_usuario: user.email ?? null,
      })
      .select()
      .single()

    if (ensayoError || !ensayoData) {
      throw new Error('Error al guardar el ensayo en la base de datos.')
    }

    // Insertar feedback con el puntaje real
    await supabase
      .from('feedback_generado')
      .insert({
        ensayo_id: ensayoData.id,
        puntaje: puntajeReal,
        raw_response: claudeResponse
      })

    return NextResponse.json({
      success: true,
      raw_feedback: claudeResponse,
    })

  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Hubo un error al procesar el ensayo.', details: error.message },
      { status: 500 }
    )
  }
}
