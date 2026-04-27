import { useEffect, useMemo, useState } from 'react'
import { api } from './api.js'

const c = {
  ink: '#082B34', muted: '#789FAA', border: 'rgba(83,151,166,.30)', white: '#FFFFFF',
  sky: '#2F9FB2', skyDark: '#176F82', aqua: '#72CDB8', aquaDark: '#4FA898', aquaLight: '#E5F8F3',
  cream: '#F8F1E7', warn: '#B8860B', red: '#B91C1C', redSoft: '#FEF2F2', line: '#EAF6F8',
}

function activeRoutine(r) {
  return !r.estado || r.estado === 'Activa' || r.estado === 'activa' || r.activa
}

function itemTitle(item = {}, index = 0) {
  return item.nombre || item.name || item.titulo || item.texto || `Ejercicio ${index + 1}`
}

function itemText(item = {}) {
  const parts = []
  if (item.series) parts.push(`${item.series} series`)
  if (item.repeticiones || item.reps) parts.push(`${item.repeticiones || item.reps} reps`)
  if (item.segundos) parts.push(`${item.segundos} seg`)
  if (item.duracion) parts.push(item.duracion)
  if (item.pausa) parts.push(`pausa ${item.pausa}`)
  const dose = parts.join(' · ')
  const extra = item.indicacion || item.detalle || item.descripcion || ''
  return [dose, extra].filter(Boolean).join(' · ')
}

function blockLabel(item = {}) {
  const tipo = String(item.tipo || item.bloque || 'ejercicio').toLowerCase()
  if (tipo.includes('movilidad')) return 'Movilidad'
  if (tipo.includes('campo')) return 'Campo'
  if (tipo.includes('agente') || tipo.includes('post')) return 'Agente físico'
  if (tipo.includes('indicacion')) return 'Indicación'
  if (tipo.includes('cardio')) return 'Cardio'
  return 'Ejercicio'
}

function ProgressBar({ value, max }) {
  const pct = max ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div style={{ height: 10, background: '#EAF6F8', borderRadius: 999, overflow: 'hidden', border: `1px solid ${c.border}` }}>
      <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${c.aqua}, ${c.sky})`, borderRadius: 999, transition: 'width .25s ease' }} />
    </div>
  )
}

function PainScale({ value, onChange }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 7 }}>
      {[0,1,2,3,4,5,6,7,8,9,10].map(n => {
        const active = Number(value) === n
        return <button key={n} type="button" onClick={() => onChange(n)} style={{ height: 34, borderRadius: 12, border: `1px solid ${active ? c.sky : c.border}`, background: active ? `linear-gradient(135deg, ${c.sky}, ${c.skyDark})` : c.white, color: active ? '#fff' : c.ink, fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit' }}>{n}</button>
      })}
    </div>
  )
}

function FeedbackBox({ rutinaId, progress, onSaved }) {
  const [open, setOpen] = useState(false)
  const [dolor, setDolor] = useState(progress?.feedback?.dolor ?? '')
  const [dificultad, setDificultad] = useState(progress?.feedback?.dificultad || 'normal')
  const [comentario, setComentario] = useState(progress?.feedback?.comentario || '')
  const [saving, setSaving] = useState(false)
  const saved = !!progress?.feedback?.created_at

  useEffect(() => {
    setDolor(progress?.feedback?.dolor ?? '')
    setDificultad(progress?.feedback?.dificultad || 'normal')
    setComentario(progress?.feedback?.comentario || '')
  }, [progress?.intento_id])

  async function save() {
    setSaving(true)
    try {
      const next = await api.guardarRutinaFeedback(rutinaId, {
        intento_id: progress?.intento_id,
        dolor: dolor === '' ? null : Number(dolor),
        dificultad,
        comentario,
      })
      onSaved(next)
      setOpen(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ marginTop: 12, border: `1px solid ${saved ? '#BDE8DC' : c.border}`, background: saved ? '#F1FBF7' : c.white, borderRadius: 16, padding: 12 }}>
      <button type="button" onClick={() => setOpen(v => !v)} style={{ width: '100%', border: 0, background: 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, cursor: 'pointer', padding: 0, fontFamily: 'inherit', textAlign: 'left' }}>
        <div>
          <div style={{ fontSize: 13, color: saved ? c.aquaDark : c.ink, fontWeight: 950 }}>{saved ? 'Feedback guardado' : 'Contanos cómo te fue'}</div>
          <div style={{ marginTop: 3, fontSize: 11, color: c.muted }}>{saved ? `Dolor ${progress.feedback.dolor ?? '-'} / 10 · ${progress.feedback.dificultad || 'normal'}` : 'Dolor, dificultad y comentario opcional'}</div>
        </div>
        <div style={{ color: c.skyDark, fontWeight: 950 }}>{open ? '−' : '+'}</div>
      </button>
      {open && (
        <div style={{ marginTop: 12, display: 'grid', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: c.muted, fontWeight: 950, marginBottom: 7, textTransform: 'uppercase', letterSpacing: '.08em' }}>Dolor durante la rutina</div>
            <PainScale value={dolor} onChange={setDolor} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: c.muted, fontWeight: 950, marginBottom: 7, textTransform: 'uppercase', letterSpacing: '.08em' }}>Dificultad</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 7 }}>
              {['facil','normal','dificil'].map(x => <button key={x} type="button" onClick={() => setDificultad(x)} style={{ border: `1px solid ${dificultad === x ? c.sky : c.border}`, background: dificultad === x ? '#E9F7FA' : c.white, color: dificultad === x ? c.skyDark : c.ink, borderRadius: 13, padding: '10px 6px', fontSize: 12, fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize' }}>{x}</button>)}
            </div>
          </div>
          <textarea value={comentario} onChange={e => setComentario(e.target.value)} placeholder="Comentario opcional: qué molestó, qué fue fácil, qué no pudiste hacer..." style={{ width: '100%', minHeight: 82, border: `1px solid ${c.border}`, borderRadius: 15, padding: 12, resize: 'vertical', color: c.ink, fontFamily: 'inherit', fontSize: 13, outline: 'none' }} />
          <button type="button" onClick={save} disabled={saving} style={{ border: 0, borderRadius: 15, padding: 12, background: `linear-gradient(135deg, ${c.sky}, ${c.skyDark})`, color: '#fff', fontWeight: 950, cursor: saving ? 'default' : 'pointer', fontFamily: 'inherit', opacity: saving ? .65 : 1 }}>{saving ? 'Guardando...' : 'Guardar feedback'}</button>
        </div>
      )}
    </div>
  )
}

function RoutineItem({ item, rutinaId, onToggle }) {
  const [open, setOpen] = useState(false)
  const done = !!item.hecho
  const text = itemText(item)
  const hasMedia = !!(item.imagen || item.image || item.imagen_url || item.foto || item.video_url || item.video)

  return (
    <div style={{ border: `1px solid ${done ? '#BFE8DB' : c.border}`, background: done ? '#F1FBF7' : c.white, borderRadius: 17, marginTop: 9, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: 12 }}>
        <button type="button" onClick={() => onToggle(rutinaId, item.index, !done)} style={{ width: 34, height: 34, minWidth: 34, borderRadius: 12, border: `1.5px solid ${done ? c.aquaDark : c.border}`, background: done ? c.aquaDark : c.white, color: '#fff', fontWeight: 950, cursor: 'pointer', fontSize: 17 }}>{done ? '✓' : ''}</button>
        <button type="button" onClick={() => setOpen(v => !v)} style={{ flex: 1, minWidth: 0, border: 0, background: 'transparent', textAlign: 'left', padding: 0, cursor: 'pointer', fontFamily: 'inherit' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10, color: done ? c.aquaDark : c.skyDark, background: done ? c.aquaLight : '#E9F7FA', borderRadius: 999, padding: '3px 7px', fontWeight: 950 }}>{blockLabel(item)}</span>
            {hasMedia && <span style={{ fontSize: 10, color: c.muted, background: '#F6FBFC', borderRadius: 999, padding: '3px 7px', fontWeight: 850 }}>ver detalle</span>}
          </div>
          <div style={{ marginTop: 6, fontSize: 15, fontWeight: 950, color: done ? c.aquaDark : c.ink, textDecoration: done ? 'line-through' : 'none' }}>{itemTitle(item, item.index)}</div>
          {text && <div style={{ marginTop: 4, fontSize: 12, color: c.muted, lineHeight: 1.35 }}>{text}</div>}
        </button>
        <button type="button" onClick={() => setOpen(v => !v)} style={{ width: 30, height: 30, minWidth: 30, border: `1px solid ${c.border}`, background: c.white, color: c.skyDark, borderRadius: 11, fontWeight: 950, cursor: 'pointer' }}>{open ? '−' : '+'}</button>
      </div>
      {open && (
        <div style={{ borderTop: `1px solid ${c.border}`, padding: 12, background: '#FBFEFE' }}>
          {text ? <div style={{ fontSize: 13, color: c.ink, lineHeight: 1.45 }}>{text}</div> : <div style={{ fontSize: 13, color: c.muted }}>Sin indicaciones extra.</div>}
          {(item.video_url || item.video) && <a href={item.video_url || item.video} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', marginTop: 10, color: c.skyDark, fontSize: 13, fontWeight: 900, textDecoration: 'none' }}>Ver video ↗</a>}
          {(item.imagen || item.image || item.imagen_url || item.foto) && <img src={item.imagen || item.image || item.imagen_url || item.foto} alt={itemTitle(item, item.index)} style={{ marginTop: 10, width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 14, border: `1px solid ${c.border}` }} />}
        </div>
      )}
    </div>
  )
}

function RoutineCard({ rutina, progress, onToggle, onReset, onFeedbackSaved }) {
  const fallbackItems = (Array.isArray(rutina.ejercicios) ? rutina.ejercicios : []).map((it, i) => ({ ...it, index: i, nombre: itemTitle(it, i), hecho: false }))
  const items = progress?.items || fallbackItems
  const hechos = progress?.hechos ?? items.filter(i => i.hecho).length
  const total = progress?.total_items ?? items.length
  const completadas = progress?.completadas ?? 0
  const objetivo = progress?.objetivo || Number(rutina.veces || 1) || 1
  const intento = progress?.intento_numero || 1
  const completa = total > 0 && hechos >= total
  const weeklyPct = objetivo ? Math.min(100, Math.round((completadas / objetivo) * 100)) : 0

  return (
    <div style={{ background: 'rgba(255,255,255,.96)', border: `1px solid ${c.border}`, borderRadius: 24, padding: 15, marginBottom: 14, boxShadow: '0 12px 34px rgba(13,53,64,.07)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, color: c.muted, textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 950 }}>{rutina.motivo_sintoma || 'Rutina clínica'}</div>
          <div style={{ marginTop: 4, fontSize: 19, color: c.ink, fontWeight: 950, letterSpacing: '-.03em' }}>{rutina.nombre || 'Rutina semanal'}</div>
          <div style={{ marginTop: 6, fontSize: 12, color: c.muted, lineHeight: 1.35 }}>Vuelta actual {intento} · {hechos}/{total} ítems hechos</div>
        </div>
        <div style={{ textAlign: 'center', minWidth: 88, background: completa ? c.aquaLight : '#E9F7FA', border: `1px solid ${completa ? '#BDE8DC' : c.border}`, borderRadius: 18, padding: '10px 8px' }}>
          <div style={{ fontSize: 22, color: completa ? c.aquaDark : c.skyDark, fontWeight: 950 }}>{completadas}/{objetivo}</div>
          <div style={{ fontSize: 9, color: c.muted, textTransform: 'uppercase', fontWeight: 950 }}>semana</div>
        </div>
      </div>

      <div style={{ marginTop: 13 }}><ProgressBar value={hechos} max={total || 1} /></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 7, fontSize: 11, color: c.muted, fontWeight: 850 }}><span>Progreso de esta vuelta</span><span>{Math.round((hechos / (total || 1)) * 100)}%</span></div>
      <div style={{ marginTop: 9 }}><ProgressBar value={completadas} max={objetivo || 1} /></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 7, fontSize: 11, color: c.muted, fontWeight: 850 }}><span>Objetivo semanal</span><span>{weeklyPct}%</span></div>

      {completa && (
        <div style={{ marginTop: 12, background: c.aquaLight, color: c.aquaDark, border: '1px solid #BDE8DC', borderRadius: 16, padding: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 950 }}>✅ Vuelta completada</div>
          <div style={{ marginTop: 4, fontSize: 12, lineHeight: 1.35 }}>Ya quedó guardada. Podés dejar feedback o empezar otra vuelta.</div>
        </div>
      )}

      {items.map(item => <RoutineItem key={`${rutina.id}-${item.index}`} item={item} rutinaId={rutina.id} onToggle={onToggle} />)}

      {completa && progress && <FeedbackBox rutinaId={rutina.id} progress={progress} onSaved={(next) => onFeedbackSaved(rutina.id, next)} />}

      {completa && (
        <button type="button" onClick={() => onReset(rutina.id)} style={{ marginTop: 10, width: '100%', border: `1px solid ${c.border}`, background: '#fff', color: c.skyDark, borderRadius: 15, padding: 12, fontWeight: 950, cursor: 'pointer', fontFamily: 'inherit' }}>Empezar otra vuelta</button>
      )}
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

  function feedbackSaved(rutinaId, next) {
    setProgress(prev => ({ ...prev, [rutinaId]: next }))
  }

  if (!active.length) return <div className="pp-card" style={{ textAlign: 'center', fontSize: 13, color: c.muted }}>Tu kinesiólogo aún no asignó rutinas</div>

  return (
    <section>
      <div style={{ background: 'linear-gradient(135deg,#FFFFFF 0%,#ECF8FA 100%)', border: `1px solid ${c.border}`, borderRadius: 24, padding: 15, margin: '0 0 12px', boxShadow: '0 12px 34px rgba(13,53,64,.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 10 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: c.muted, fontWeight: 950 }}>Rutina con progreso</div>
            <div style={{ marginTop: 4, fontSize: 22, color: c.ink, fontWeight: 950, letterSpacing: '-.04em' }}>Tu rutina semanal</div>
            <div style={{ marginTop: 5, fontSize: 12, color: c.muted }}>Marcá cada ítem cuando lo termines.</div>
          </div>
          <button type="button" onClick={load} disabled={loading} style={{ border: `1px solid ${c.border}`, background: c.white, color: c.skyDark, borderRadius: 14, padding: '9px 11px', fontWeight: 950, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', opacity: loading ? .55 : 1 }}>Actualizar</button>
        </div>
      </div>
      {active.map(r => <RoutineCard key={r.id} rutina={r} progress={progress[r.id]} onToggle={toggle} onReset={reset} onFeedbackSaved={feedbackSaved} />)}
    </section>
  )
}
