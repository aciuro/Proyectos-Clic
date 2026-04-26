import { useEffect, useMemo, useState } from 'react'
import { api } from './api.js'

const c = {
  ink: '#0D3540', muted: '#7AAAB8', border: '#C0DDE5', white: '#FFFFFF',
  sky: '#5BB8CC', skyDark: '#3A96AE', aqua: '#7EC8B8', aquaDark: '#4FA898', aquaLight: '#D8F0EA',
}

function activeRoutine(r) {
  return !r.estado || r.estado === 'Activa' || r.estado === 'activa' || r.activa
}

function itemText(item = {}) {
  const parts = []
  if (item.series) parts.push(`${item.series} series`)
  if (item.repeticiones || item.reps) parts.push(`${item.repeticiones || item.reps} reps`)
  if (item.segundos) parts.push(`${item.segundos} seg`)
  if (item.pausa) parts.push(`pausa ${item.pausa}`)
  const dose = parts.join(' · ')
  const extra = item.indicacion || item.detalle || item.descripcion || ''
  return [dose, extra].filter(Boolean).join(' · ')
}

function ProgressBar({ value, max }) {
  const pct = max ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div style={{ height: 9, background: '#EAF6F8', borderRadius: 999, overflow: 'hidden', border: `1px solid ${c.border}` }}>
      <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${c.aqua}, ${c.sky})`, borderRadius: 999 }} />
    </div>
  )
}

function RoutineCard({ rutina, progress, onToggle, onReset }) {
  const items = progress?.items || (Array.isArray(rutina.ejercicios) ? rutina.ejercicios : []).map((it, i) => ({ ...it, index: i, nombre: it.nombre || it.name || it.titulo || it.texto || `Ejercicio ${i + 1}`, hecho: false }))
  const hechos = progress?.hechos ?? items.filter(i => i.hecho).length
  const total = progress?.total_items ?? items.length
  const completadas = progress?.completadas ?? 0
  const objetivo = progress?.objetivo || Number(rutina.veces || 1) || 1
  const intento = progress?.intento_numero || 1
  const completa = total > 0 && hechos >= total

  return (
    <div style={{ background: c.white, border: `1px solid ${c.border}`, borderRadius: 18, padding: 14, marginBottom: 14, boxShadow: '0 8px 28px rgba(13,53,64,.06)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: c.muted, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 800 }}>{rutina.motivo_sintoma || 'Rutina clínica'}</div>
          <div style={{ marginTop: 4, fontSize: 18, color: c.ink, fontWeight: 900 }}>{rutina.nombre || 'Rutina'}</div>
          <div style={{ marginTop: 6, fontSize: 12, color: c.muted }}>Vuelta actual {intento} · {hechos}/{total} ejercicios</div>
        </div>
        <div style={{ textAlign: 'right', minWidth: 82 }}>
          <div style={{ fontSize: 20, color: completa ? c.aquaDark : c.skyDark, fontWeight: 900 }}>{completadas}/{objetivo}</div>
          <div style={{ fontSize: 10, color: c.muted, textTransform: 'uppercase', fontWeight: 800 }}>completadas</div>
        </div>
      </div>
      <div style={{ marginTop: 12 }}><ProgressBar value={hechos} max={total || 1} /></div>
      {completa && (
        <>
          <div style={{ marginTop: 10, background: c.aquaLight, color: c.aquaDark, border: '1px solid #BDE8DC', borderRadius: 12, padding: '9px 10px', fontSize: 12, fontWeight: 800 }}>✅ Vuelta completada. Ya quedó guardada.</div>
          <button type="button" onClick={() => onReset(rutina.id)} style={{ marginTop: 10, width: '100%', border: `1px solid ${c.border}`, background: '#fff', color: c.skyDark, borderRadius: 13, padding: 10, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>Empezar otra vuelta</button>
        </>
      )}
      {items.map(item => {
        const done = !!item.hecho
        return (
          <div key={`${rutina.id}-${item.index}`} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: 11, border: `1px solid ${done ? '#BFE8DB' : c.border}`, background: done ? '#F1FBF7' : c.white, borderRadius: 14, marginTop: 8 }}>
            <button type="button" onClick={() => onToggle(rutina.id, item.index, !done)} style={{ width: 30, height: 30, minWidth: 30, borderRadius: 10, border: `1.5px solid ${done ? c.aquaDark : c.border}`, background: done ? c.aquaDark : c.white, color: '#fff', fontWeight: 900, cursor: 'pointer', fontSize: 16 }}>{done ? '✓' : ''}</button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: done ? c.aquaDark : c.ink, textDecoration: done ? 'line-through' : 'none' }}>{item.nombre || item.name || `Ejercicio ${item.index + 1}`}</div>
              {itemText(item) && <div style={{ marginTop: 4, fontSize: 12, color: c.muted, lineHeight: 1.35 }}>{itemText(item)}</div>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function PatientRoutineProgressMini({ pacienteId, rutinas = [] }) {
  const active = useMemo(() => rutinas.filter(activeRoutine), [rutinas])
  const [progress, setProgress] = useState({})
  const [loading, setLoading] = useState(false)

  async function load() {
    if (!pacienteId || active.length === 0) return
    setLoading(true)
    try {
      const pairs = await Promise.all(active.map(async r => [r.id, await api.getRutinaProgreso(r.id).catch(() => null)]))
      setProgress(Object.fromEntries(pairs.filter(([, p]) => p)))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [pacienteId, active.map(r => r.id).join(',')])

  async function toggle(rutinaId, itemIndex, hecho) {
    const next = await api.marcarRutinaItem(rutinaId, itemIndex, hecho)
    setProgress(prev => ({ ...prev, [rutinaId]: next }))
  }

  async function reset(rutinaId) {
    const next = await api.reiniciarRutinaIntento(rutinaId)
    setProgress(prev => ({ ...prev, [rutinaId]: next }))
  }

  if (!active.length) return <div className="pp-card" style={{ textAlign: 'center', fontSize: 13, color: c.muted }}>Tu kinesiólogo aún no asignó rutinas</div>

  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 10, margin: '0 0 12px' }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: c.muted, fontWeight: 800 }}>Rutina con progreso</div>
          <div style={{ marginTop: 4, fontSize: 20, color: c.ink, fontWeight: 900 }}>Tu rutina semanal</div>
        </div>
        <button type="button" onClick={load} disabled={loading} style={{ border: `1px solid ${c.border}`, background: c.white, color: c.skyDark, borderRadius: 12, padding: '8px 10px', fontWeight: 800, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', opacity: loading ? .55 : 1 }}>Actualizar</button>
      </div>
      {active.map(r => <RoutineCard key={r.id} rutina={r} progress={progress[r.id]} onToggle={toggle} onReset={reset} />)}
    </section>
  )
}
