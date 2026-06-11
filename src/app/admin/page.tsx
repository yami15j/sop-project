import { createClient } from '@/utils/supabase/server'
import InicioDashboard from '@/components/admin/InicioDashboard'

export default async function AdminPage() {
  const supabase = await createClient()

  // Cargar perfiles ordenados por fecha
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  // Cargar ensayos ordenados por fecha con su feedback
  const { data: essays } = await supabase
    .from('ensayos_enviados')
    .select('*, feedback_generado (*)')
    .order('created_at', { ascending: false })

  // Cargar leads ordenados por fecha
  const { data: leads } = await supabase
    .from('leads_mentoria')
    .select('*')
    .order('created_at', { ascending: false })

  // Extraer correos de usuarios únicos
  const emailsSet = new Set<string>()
  profiles?.forEach(p => {
    if (p.rol !== 'admin' && p.rol !== 'mentor' && p.email) {
      emailsSet.add(p.email)
    }
  })
  essays?.forEach(e => {
    if (e.email_usuario) emailsSet.add(e.email_usuario)
  })
  leads?.forEach(l => {
    if (l.email) emailsSet.add(l.email)
  })

  const totalUsers = emailsSet.size
  const totalEssays = essays?.length || 0
  const totalLeads = leads?.length || 0

  // Tomar los últimos 5 para las tablas rápidas
  const recentEssays = essays?.slice(0, 5).map(e => ({
    id: e.id,
    nombre: e.nombre_usuario || e.email_usuario || 'Anónimo',
    email: e.email_usuario || 'Anónimo',
    estado: e.evaluacion ? 'Evaluado' : 'Pendiente', // Asumimos Evaluado si hay algo, sino Pendiente
    fecha: e.created_at
  })) || []

  const recentLeads = leads?.slice(0, 5).map(l => ({
    id: l.id,
    nombre: l.nombre || l.email || 'Anónimo',
    estado: l.estado ? (l.estado === 'nuevo' ? 'Pendiente' : l.estado) : 'Pendiente',
    fecha: l.created_at
  })) || []

  // Extraer ensayos de los últimos 6 meses para el gráfico
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const chartData: { month: string; val: number; year: number; monthNum: number }[] = []
  const today = new Date()

  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
    chartData.push({ month: monthNames[d.getMonth()], val: 0, year: d.getFullYear(), monthNum: d.getMonth() })
  }

  essays?.forEach(e => {
    const d = new Date(e.created_at)
    const m = chartData.find(c => c.monthNum === d.getMonth() && c.year === d.getFullYear())
    if (m) {
      m.val += 1
    }
  })

  // Limpiar prop para el dashboard
  const finalChartData = chartData.map(c => ({ month: c.month, val: c.val }))

  // Combinar actividad para la Línea de Vida (máx 15 recientes)
  const activities: {
    id: string
    text: string
    time: number
    dateStr: string
    email: string
    name: string
    type: string
  }[] = []

  // 1. Registros de usuarios
  profiles?.forEach(p => {
    if (p.rol === 'admin' || p.rol === 'mentor') return
    if (!p.email) return
    activities.push({
      id: p.id,
      text: `Nuevo registro: ${p.nombre || p.email}`,
      time: p.created_at ? new Date(p.created_at).getTime() : 0,
      dateStr: p.created_at || '',
      email: p.email,
      name: p.nombre || p.email,
      type: 'register'
    })
  })

  // 2. Ensayos subidos
  essays?.forEach(e => {
    activities.push({
      id: e.id,
      text: `${e.nombre_usuario || e.email_usuario || 'Alguien'} subió un ensayo`,
      time: new Date(e.created_at).getTime(),
      dateStr: e.created_at,
      email: e.email_usuario || '',
      name: e.nombre_usuario || e.email_usuario || 'Alguien',
      type: 'essay'
    })
  })

  // 3. Leads de mentoría (solicitudes)
  leads?.forEach(l => {
    activities.push({
      id: l.id,
      text: `Solicitud de Mentoría: ${l.nombre || l.email || 'Alguien'}`,
      time: new Date(l.created_at).getTime(),
      dateStr: l.created_at,
      email: l.email || '',
      name: l.nombre || l.email || 'Alguien',
      type: 'lead'
    })
  })

  // Ordenar de más reciente a más antiguo y tomar los top 6
  activities.sort((a, b) => b.time - a.time)

  const recentActivities = activities.slice(0, 50).map(act => {
    // Calcular "Hace X minutos/horas/días"
    const diffMs = today.getTime() - act.time
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    let timeStr = 'Hace un momento'
    if (diffDays > 0) timeStr = `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`
    else if (diffHours > 0) timeStr = `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`
    else if (diffMins > 0) timeStr = `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`

    return {
      text: act.text,
      time: timeStr,
      email: act.email,
      name: act.name,
      type: act.type
    }
  })

  // Calcular puntaje promedio real de la IA
  const rawScores = essays?.map(e => e.feedback_generado?.[0]?.puntaje).filter((s): s is number => s !== undefined && s !== null) || []
  const avgScore = rawScores.length > 0
    ? (rawScores.reduce((a, b) => a + b, 0) / rawScores.length).toFixed(1)
    : "7.0"
  const averageScore = `${avgScore}/10`

  return (
    <InicioDashboard
      totalUsers={totalUsers}
      totalEssays={totalEssays}
      totalLeads={totalLeads}
      averageScore={averageScore}
      recentEssays={recentEssays}
      recentLeads={recentLeads}
      chartData={finalChartData}
      initialActivities={recentActivities}
    />
  )
}
