import { createClient } from '@/utils/supabase/server'
import MetricsTab from '@/components/admin/MetricsTab'

export default async function MetricasPage({
  searchParams
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const search = (await searchParams).search || ''

  // 1. Crear el cliente de Supabase
  const supabase = await createClient()

  // 2. Cargar ensayos con su respectivo feedback
  const { data: ensayosRaw, error } = await supabase
    .from('ensayos_enviados')
    .select('*, feedback_generado (*)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[MetricasPage] Error al obtener ensayos:', error)
  }

  const safeEnsayos = ensayosRaw || []

  return (
    <MetricsTab ensayos={safeEnsayos} initialSearch={search} />
  )
}
