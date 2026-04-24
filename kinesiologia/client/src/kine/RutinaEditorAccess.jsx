import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api } from './api.js'

export default function RutinaEditorAccess() {
  const location = useLocation()
  const navigate = useNavigate()
  const pacienteId = useMemo(() => {
    const match = location.pathname.match(/\/kine\/paciente\/(\d+)/)
    return match ? match[1] : null
  }, [location.pathname])

  const [open, setOpen] = useState(false)
  const [rutinas, setRutinas] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!pacienteId) return
    let alive = true
    async function cargar() {
      setLoading(true)
      try {
        const motivos = await api.getMotivos(pacienteId)
        const listas = await Promise.all(motivos.map(async m => {
          const rs = await api.getRutinas(m.id)
          return rs.map(r => ({ ...r, motivo_sintoma: m.sintoma }))
        }))
        if (alive) setRutinas(listas.flat())
      } catch {
        if (alive) setRutinas([])
      } finally {
        if (alive) setLoading(false)
      }
    }
    cargar()
    return () => { alive = false }
  }, [pacienteId])

  if (!pacienteId) return null

  const active = rutinas.filter(r => r.estado !== 'Archivada' && r.estado !== 'Inactiva')

  return (
    <div style={{ position:'fixed', right:18, bottom:92, zIndex:120 }}>
      {open && (
        <div style={{ width:320, maxWidth:'calc(100vw - 32px)', background:'rgba(255,255,255,0.96)', border:'1px solid rgba(91,184,204,0.28)', borderRadius:22, boxShadow:'0 18px 50px rgba(13,53,64,0.18)', overflow:'hidden', marginBottom:10, backdropFilter:'blur(18px)' }}>
          <div style={{ padding:'14px 16px', borderBottom:'1px solid rgba(91,184,204,0.18)' }}>
            <div style={{ fontSize:14, fontWeight:700, color:'#0D3540' }}>Planes terapéuticos</div>
            <div style={{ fontSize:11, color:'#7AAAB8', marginTop:2 }}>Editá bloques, cardio e intervalos</div>
          </div>
          <div style={{ maxHeight:300, overflow:'auto', padding:10 }}>
            {loading && <div style={{ padding:14, fontSize:12, color:'#7AAAB8' }}>Cargando rutinas...</div>}
            {!loading && active.length === 0 && (
              <div style={{ padding:14, fontSize:12, color:'#7AAAB8', lineHeight:1.45 }}>
                Todavía no hay rutinas para editar. Creá una rutina desde el motivo de consulta y después volvé acá.
              </div>
            )}
            {!loading && active.map(r => (
              <button key={r.id} onClick={() => navigate(`/kine/rutina/${r.id}/editor`)} style={{ width:'100%', textAlign:'left', border:'1px solid rgba(91,184,204,0.18)', background:'#F7FCFD', borderRadius:16, padding:12, marginBottom:8, cursor:'pointer', fontFamily:'inherit' }}>
                <div style={{ fontSize:13, fontWeight:700, color:'#0D3540' }}>{r.nombre}</div>
                <div style={{ fontSize:11, color:'#7AAAB8', marginTop:3 }}>{r.motivo_sintoma || 'Motivo de consulta'}</div>
                <div style={{ fontSize:11, color:'#3A96AE', marginTop:8, fontWeight:600 }}>Editar plan →</div>
              </button>
            ))}
          </div>
        </div>
      )}
      <button onClick={() => setOpen(v => !v)} style={{ border:'none', borderRadius:999, padding:'13px 16px', background:'linear-gradient(135deg,#5BB8CC,#3A96AE)', color:'#fff', boxShadow:'0 12px 28px rgba(47,141,164,0.28)', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
        {open ? 'Cerrar' : 'Editar plan terapéutico'}
      </button>
    </div>
  )
}
