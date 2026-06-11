import { Suspense } from 'react'
import { createClient } from '@/utils/supabase/server'
import EmailsTab from '@/components/admin/EmailsTab'

export default async function CorreosPage() {
  // 1. Crear cliente de Supabase
  const supabase = await createClient()

  // 2. Cargar ensayos y leads
  const { data: ensayosRaw } = await supabase
    .from('ensayos_enviados')
    .select('*, feedback_generado (*)')
    .order('created_at', { ascending: false })

  const { data: leadsRaw } = await supabase
    .from('leads_mentoria')
    .select('*')
    .order('created_at', { ascending: false })

  const safeEnsayos = ensayosRaw || []
  const safeLeads = leadsRaw || []

  // 3. Renderizar el componente modular con Suspense (requerido para useSearchParams)
  return (
    <Suspense fallback={<div className="text-xs font-semibold text-slate-400 py-8 text-center">Cargando consola de correos...</div>}>
      <EmailsTab ensayos={safeEnsayos} leads={safeLeads} />
    </Suspense>
  )
}
