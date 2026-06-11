import { createClient } from '@/utils/supabase/server'
import LeadsTab from '@/components/admin/LeadsTab'

export default async function LeadsPage({
  searchParams
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const search = (await searchParams).search || ''

  // 1. Crear el cliente de Supabase
  const supabase = await createClient()

  // 2. Cargar leads de Supabase
  const { data: leadsRaw, error } = await supabase
    .from('leads_mentoria')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[LeadsPage] Error al obtener leads:', error)
  }

  const safeLeads = leadsRaw || []

  // 2.5 Cargar ensayos asociados a estos leads de forma eficiente
  let leadsWithEssays = safeLeads
  if (safeLeads.length > 0) {
    const userIds = safeLeads.map(l => l.user_id).filter(Boolean)
    const emails = safeLeads.map(l => l.email).filter(Boolean)

    const query = supabase
      .from('ensayos_enviados')
      .select('*')
      .order('created_at', { ascending: false })

    const orFilters = []
    if (userIds.length > 0) {
      orFilters.push(`user_id.in.(${userIds.join(',')})`)
    }
    if (emails.length > 0) {
      orFilters.push(`email_usuario.in.(${emails.map(e => `"${e}"`).join(',')})`)
    }

    if (orFilters.length > 0) {
      const { data: essaysRaw, error: essaysError } = await query.or(orFilters.join(','))
      if (essaysError) {
        console.error('[LeadsPage] Error al obtener ensayos para leads:', essaysError)
      } else {
        const essays = essaysRaw || []
        leadsWithEssays = safeLeads.map(lead => {
          const matchedEssay = essays.find(e =>
            (lead.user_id && e.user_id === lead.user_id) ||
            (lead.email && e.email_usuario?.toLowerCase() === lead.email.toLowerCase())
          )
          return {
            ...lead,
            ensayo_contenido: matchedEssay?.contenido || null,
            ensayo_pdf_url: matchedEssay?.pdf_url || null,
            ensayo_fecha: matchedEssay?.created_at || null
          }
        })
      }
    }
  }

  // 3. Renderizar el componente modular
  return (
    <div className="flex flex-col pt-7">
      <LeadsTab leads={leadsWithEssays} initialSearch={search} />
    </div>
  )
}
