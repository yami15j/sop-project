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
    const { data: ensayosPrevios, error: countError } = await supabase
      .from('ensayos_enviados')
      .select('id')
      .eq('user_id', user.id)

    if (countError) {
      console.error('[API] Error al contar ensayos:', countError)
    }

    const count = ensayosPrevios?.length || 0
    console.log(`[API] Usuario: ${user.email} (ID: ${user.id}), Ensayos encontrados: ${count}`)

    // Límite aumentado temporalmente para pruebas a 10
    if (count >= 10) {
      return NextResponse.json(
        { error: `Has alcanzado el límite de 10 ensayos de prueba. Por favor adquiere una mentoría premium para continuar.` },
        { status: 403 }
      )
    }

    // 1. Recibir los datos
    const body = await req.json()
    const { ensayo, pais_destino, beca_objetivo, pdf_url } = body

    if (!ensayo || ensayo.trim().length < 50) {
      return NextResponse.json({ error: 'El ensayo es muy corto.' }, { status: 400 })
    }
    if (ensayo.length > 15000) {
      return NextResponse.json({ error: 'El ensayo es demasiado largo.' }, { status: 400 })
    }

    // 2. Leer y preparar el prompt del archivo externo
    const promptPath = path.join(process.cwd(), 'prompt_v1.md')
    let systemPrompt = fs.readFileSync(promptPath, 'utf-8')

    // Rellenamos los placeholders en el system prompt tal como lo pide tu snippet
    systemPrompt = systemPrompt
      .replace('{beca}', beca_objetivo || 'General')
      .replace('{pais}', pais_destino || 'No especificado')
      .replace('{area}', 'No especificada') // Podríamos añadir este campo al form luego
      .replace('{ensayo}', ensayo)

    // 3. Enviar a Claude con la nueva configuración Opus 4.7 + Adaptive Thinking
    let claudeResponse = ''
    try {
      const message = await anthropic.messages.create({
        model: 'claude-opus-4-7',
        max_tokens: 20000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: [{ type: 'text', text: "Por favor, realiza la evaluación de mi ensayo según las instrucciones proporcionadas." }]
          }
        ],
        thinking: {
          type: 'adaptive'
        }
      })
      
      // Extraemos el texto de la respuesta
      claudeResponse = message.content.find((c: any) => c.type === 'text')?.text || ''
      
      if (!claudeResponse) {
        throw new Error('La IA no devolvió contenido de texto.')
      }

    } catch (apiError: any) {
      console.error("Error crítico en la API de Anthropic:", apiError)
      throw new Error(`Error de comunicación con la IA: ${apiError.message}`)
    }

    // Extraer el puntaje dinámicamente de la respuesta de Claude usando Regex
    // Busca patrones como "PUNTUACIÓN GENERAL: 7/10" o "9.3/10"
    const scoreMatch = claudeResponse.match(/PUNTUACI(?:O|Ó)N GENERAL:\s*([\d.]+)\/10/i)
    const puntajeReal = scoreMatch ? Math.round(parseFloat(scoreMatch[1])) : 8

    // 4. Guardar en Base de Datos
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
        pdf_url: pdf_url ?? null,
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
