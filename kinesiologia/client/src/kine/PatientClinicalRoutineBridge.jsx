import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PatientMotivoDashboard from './PatientMotivoDashboard.jsx'

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

function hasOldRoutineModal() {
  const text = normalize(document.body?.innerText || '')
  return (
    text.includes('nueva rutina') &&
    text.includes('rutina domiciliaria') &&
    text.includes('biblioteca de ejercicios') &&
    text.includes('resumen de la rutina')
  )
}

function ClinicalRoutineClickInterceptor() {
  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    let redirected = false
    function goToNewEditor() {
      if (redirected) return
      redirected = true
      navigate(`/kine/rutinas-clinicas/${id}`)
    }

    function onClick(event) {
      const target = event.target
      const button = target?.closest?.('button, a, [role="button"]')
      if (!button) return

      const text = button.textContent || button.getAttribute('aria-label') || ''
      if (!isRoutineAddText(text)) return

      event.preventDefault()
      event.stopPropagation()
      goToNewEditor()
    }

    function checkOldModal() {
      if (hasOldRoutineModal()) goToNewEditor()
    }

    document.addEventListener('click', onClick, true)
    const observer = new MutationObserver(checkOldModal)
    observer.observe(document.body, { childList: true, subtree: true })
    const interval = window.setInterval(checkOldModal, 350)

    return () => {
      document.removeEventListener('click', onClick, true)
      observer.disconnect()
      window.clearInterval(interval)
    }
  }, [id, navigate])

  return null
}

export default function PatientClinicalRoutineBridge() {
  return (
    <>
      <ClinicalRoutineClickInterceptor />
      <PatientMotivoDashboard />
    </>
  )
}
