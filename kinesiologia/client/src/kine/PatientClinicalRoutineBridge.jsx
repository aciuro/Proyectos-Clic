import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PatientCleanDashboard from './PatientCleanDashboard.jsx'

function normalize(text = '') {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function isRoutineAddText(text = '') {
  const normalized = normalize(text)
  return (
    normalized.includes('agregar rutina') ||
    normalized.includes('nueva rutina') ||
    normalized.includes('crear rutina') ||
    normalized.includes('+ rutina') ||
    normalized.includes('rutina nueva') ||
    normalized.includes('rutina domiciliaria')
  )
}

function ClinicalRoutineClickInterceptor() {
  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    function onClick(event) {
      const target = event.target
      const button = target?.closest?.('button, a, [role="button"]')
      if (!button) return
      const text = button.textContent || button.getAttribute('aria-label') || ''
      if (!isRoutineAddText(text)) return
      event.preventDefault()
      event.stopPropagation()
      navigate(`/kine/rutinas-clinicas/${id}`)
    }

    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [id, navigate])

  return null
}

export default function PatientClinicalRoutineBridge() {
  return (
    <>
      <ClinicalRoutineClickInterceptor />
      <PatientCleanDashboard />
    </>
  )
}
