import { createClient } from '@/utils/supabase/server'
import UsersTab from '@/components/admin/UsersTab'

export default async function UsuariosPage({
  searchParams
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const search = (await searchParams).search || ''

  // 1. Crear cliente de Supabase
  const supabase = await createClient()

  // 2. Cargar perfiles, ensayos y leads
  const { data: profilesRaw } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: ensayosRaw } = await supabase
    .from('ensayos_enviados')
    .select('*, feedback_generado (*)')
    .order('created_at', { ascending: false })

  const { data: leadsRaw } = await supabase
    .from('leads_mentoria')
    .select('*')
    .order('created_at', { ascending: false })

  const safeProfiles = profilesRaw || []
  const safeEnsayos = ensayosRaw || []
  const safeLeads = leadsRaw || []

  // 3. Renderizar vista de usuarios
  return (
    <div className="flex flex-col pt-7">
      <UsersTab profiles={safeProfiles} ensayos={safeEnsayos} leads={safeLeads} initialSearch={search} />
    </div>
  )
}
