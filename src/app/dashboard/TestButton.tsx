'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TestButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleTest = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ensayo: 'Siempre he querido estudiar en el extranjero. Soy estudiante de ingeniería en Ecuador y quiero hacer una maestría en inteligencia artificial en Europa para mejorar mi país cuando regrese. Tengo buenas notas y creo que merezco esta oportunidad, ojalá me den la beca Erasmus Mundus porque me he esforzado muchísimo durante toda la carrera universitaria para lograr este sueño tan anhelado por mí y mi familia.',
          pais_destino: 'Alemania',
          beca_objetivo: 'DAAD'
        })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        alert('¡Éxito! El ensayo fue evaluado y guardado en la base de datos.')
        router.refresh() // Recarga el dashboard para que aparezca el ensayo
      } else {
        alert('Error: ' + (data.error || 'Algo salió mal'))
      }
    } catch (err) {
      alert('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleTest} 
      disabled={loading}
      className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 py-3 rounded-xl font-semibold transition mt-2"
    >
      {loading ? 'Analizando con IA...' : 'Simular Envío de Ensayo de Prueba'}
    </button>
  )
}
