import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PacienteDetalle from './PacienteDetalle.jsx'

function isRoutineAddText(text = '') {
  const normalized = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return (
    normalized.includes('agregar rutina') ||
    normalized.includes('nueva rutina') ||
    normalized.includes('crear rutina') ||
    normalized.includes('+ rutina') ||
    normalized.includes('rutina nueva')
  )
}

function ClinicalRoutineClickInterceptor() {
  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    function onClick(event) {
      const target = event.target
      const button = target?.closest?.('button, a')
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
  const { id } = useParams()
  const navigate = useNavigate()

  return (
    <>
      <ClinicalRoutineClickInterceptor />
      <div style={{ marginBottom: 14, border: '1px solid rgba(91,184,204,.24)', borderRadius: 22, background: 'linear-gradient(135deg,#FFFFFF 0%,#F1FBFD 100%)', padding: 14, display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap', boxShadow: '0 10px 28px rgba(13,53,64,.05)' }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: '.08em', textTransform: 'uppercase', color: '#7AAAB8' }}>Rutinas clínicas</div>
          <div style={{ fontSize: 15, fontWeight: 900, color: '#0D3540', marginTop: 2 }}>Usá el editor nuevo para crear rutinas del paciente</div>
          <div style={{ fontSize: 12, color: '#7AAAB8', marginTop: 3 }}>Ejercicios, cardio, campo e indicaciones en una sola rutina.</div>
        </div>
        <button type="button" onClick={() => navigate(`/kine/rutinas-clinicas/${id}`)} style={{ border: 'none', borderRadius: 16, padding: '11px 15px', background: 'linear-gradient(135deg,#5BB8CC 0%,#3A96AE 100%)', color: '#fff', fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 10px 24px rgba(58,150,174,.22)' }}>
          + Nueva rutina clínica
        </button>
      </div>
      <PacienteDetalle />
    </>
  )
}
