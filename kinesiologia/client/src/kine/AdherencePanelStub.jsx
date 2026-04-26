import { useEffect, useState } from 'react'
import { api } from './api.js'

const c = {
  ink: '#082B34',
  muted: '#789FAA',
  border: 'rgba(83,151,166,.30)',
  skyDark: '#176F82',
  aquaDark: '#13795B',
}

export default function AdherencePanelStub({ pacienteId }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  async function load() {
    if (!pacienteId) return
    setLoading(true)
    try {
      setData(await api.getAdherenciaRutinas(pacienteId))
    } catch (err) {
      console.warn('No se pudo cargar adherencia', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [pacienteId])

  if (!pacienteId || !data) return null

  const pct = data.porcentaje || 0

  return (
    <section style={{ background: 'linear-gradient(135deg,#FFFFFF 0%,#ECF8FA 100%)', border: `1px solid ${c.border}`, borderRadius: 24, padding: 16, marginBottom: 16, boxShadow: '0 14px 38px rgba(13,53,64,.07)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 11, color: c.muted, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '.1em' }}>Adherencia semanal</div>
          <div style={{ marginTop: 4, fontSize: 22, color: c.ink, fontWeight: 950 }}>{data.completadas || 0}/{data.objetivo || 0} vueltas completadas</div>
          <div style={{ marginTop: 5, fontSize: 12, color: c.muted }}>Período {data.periodo_key || 'actual'} · {data.rutinas_activas || 0} rutina/s activa/s</div>
        </div>
        <button type="button" onClick={load} disabled={loading} style={{ border: `1px solid ${c.border}`, background: '#fff', color: c.skyDark, borderRadius: 14, padding: '9px 11px', fontSize: 12, fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit', opacity: loading ? .55 : 1 }}>Actualizar</button>
      </div>
      <div style={{ marginTop: 12, height: 10, background: '#EAF6F8', borderRadius: 999, overflow: 'hidden', border: `1px solid ${c.border}` }}>
        <div style={{ height: '100%', width: `${Math.max(0, Math.min(100, pct))}%`, background: 'linear-gradient(90deg,#72CDB8,#2F9FB2)' }} />
      </div>
      <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ background: pct >= 70 ? '#EAFBF5' : '#FFF7ED', color: pct >= 70 ? c.aquaDark : '#B45309', borderRadius: 999, padding: '4px 8px', fontSize: 10, fontWeight: 900 }}>{pct}% total</span>
        <span style={{ background: '#EAFBF5', color: c.aquaDark, borderRadius: 999, padding: '4px 8px', fontSize: 10, fontWeight: 900 }}>Guardado en base de datos</span>
      </div>
      {Array.isArray(data.detalle) && data.detalle.slice(0, 3).map(r => (
        <div key={r.rutina_id} style={{ marginTop: 10, background: '#fff', border: `1px solid ${c.border}`, borderRadius: 16, padding: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: c.ink }}>{r.nombre || 'Rutina'}</div>
              <div style={{ fontSize: 11, color: c.muted, marginTop: 3 }}>{r.ejercicios_hechos || 0}/{r.ejercicios_total || 0} ejercicios hechos</div>
            </div>
            <div style={{ fontSize: 16, fontWeight: 950, color: c.skyDark }}>{r.completadas || 0}/{r.objetivo || 0}</div>
          </div>
        </div>
      ))}
    </section>
  )
}
