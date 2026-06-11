export interface FeedbackReal {
  id: string
  puntaje: number
  raw_response: string
}

export interface EnsayoReal {
  id: string
  user_id: string
  contenido: string
  pais_destino: string | null
  beca_objetivo: string | null
  created_at: string
  nombre_usuario: string | null
  email_usuario: string | null
  pdf_url: string | null
  feedback_generado?: FeedbackReal[]
}

export interface LeadReal {
  id: string
  user_id: string
  nombre: string
  email: string
  telefono: string | null
  beca_objetivo: string | null
  deadline: string | null
  created_at: string
  pais_destino: string | null
  estado: string | null
  ensayo_contenido?: string | null
  ensayo_pdf_url?: string | null
  ensayo_fecha?: string | null
}
