import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { api } from './api.js'
import PatientRoutineProgressMini from './PatientRoutineProgressMini.jsx'

function isRutinasVisible() {
  const text = (document.querySelector('.pac-content')?.innerText || '').toLowerCase()
  if (!text) return false
  if (text.includes('rutina de hoy') || text.includes('próximo turno') || text.includes('registro de dolor')) return false
  return text.includes('rutinas') || text.includes('activas') || text.includes('pendientes') || text.includes('hechos')
}

export default function PatientRoutineProgressMount({ pacienteId }) {
  const [target, setTarget] = useState(null)
  const [visible, setVisible] = useState(false)
  const [rutinas, setRutinas] = useState([])

  async function loadRutinas() {
    if (!pacienteId) return
    try {
      const data = await api.getRutinasPaciente(pacienteId)
      setRutinas(Array.isArray(data) ? data : [])
    } catch (err) {
      console.warn('No se pudieron cargar rutinas del paciente', err)
    }
  }

  function refreshMount() {
    const content = document.querySelector('.pac-content')
    setTarget(content)
    setVisible(!!content && isRutinasVisible())
  }

  useEffect(() => {
    loadRutinas()
  }, [pacienteId])

  useEffect(() => {
    refreshMount()
    const observer = new MutationObserver(refreshMount)
    observer.observe(document.body, { childList: true, subtree: true })
    const interval = window.setInterval(() => {
      refreshMount()
      if (isRutinasVisible()) loadRutinas()
    }, 25000)
    return () => {
      observer.disconnect()
      window.clearInterval(interval)
    }
  }, [pacienteId])

  if (!target || !visible) return null

  return createPortal(
    <div id="rp-react-patient-routine" style={{ marginBottom: 14 }}>
      <PatientRoutineProgressMini pacienteId={pacienteId} rutinas={rutinas} />
    </div>,
    target
  )
}
