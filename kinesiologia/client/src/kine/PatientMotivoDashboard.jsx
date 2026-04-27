import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from './api.js'
import PacienteDetalle from './PacienteDetalle.jsx'

const c = {
  ink: '#082B34', ink2: '#315F68', muted: '#789FAA', border: 'rgba(83,151,166,.30)',
  white: '#FFFFFF', sky: '#2F9FB2', skyDark: '#176F82', soft: '#EAF6F8', mint: '#E5F8F3', mintDark: '#16855F',
  redSoft: '#FEF2F2', red: '#B91C1C', cream: '#F8F1E7', line: '#D7EBF0',
}

const s = {
  shell: { display: 'grid', gap: 14, maxWidth: 920, margin: '0 auto' },
  card: { background: 'rgba(255,255,255,.96)', border: `1px solid ${c.border}`, borderRadius: 28, boxShadow: '0 14px 38px rgba(13,53,64,.07)' },
  btn: { border: `1px solid ${c.border}`, background: c.white, color: c.skyDark, borderRadius: 16, padding: '10px 13px', fontWeight: 950, cursor: 'pointer', fontFamily: 'inherit' },
  primary: { border: 0, background: `linear-gradient(135deg, ${c.sky}, ${c.skyDark})`, color: '#fff', borderRadius: 18, padding: '12px 16px', fontWeight: 950, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 14px 28px rgba(23,111,130,.22)' },
  input: { width: '100%', border: `1px solid ${c.border}`, borderRadius: 15, padding: '12px 13px', color: c.ink, outline: 'none', fontFamily: 'inherit', fontSize: 14, boxSizing: 'border-box' },
}

function initials(p = {}) {
  const text = [p.nombre, p.apellido].filter(Boolean).join(' ') || p.nombre || 'Paciente'
  return text.split(' ').filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase()
}

function patientName(p = {}) {
  return [p.nombre, p.apellido].filter(Boolean).join(' ') || p.nombre || 'Paciente'
}

function parseJsonList(value) {
  if (!value) return []
  if (Array.isArray(value)) return value
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch { return [] }
}

function formatDate(value) {
  if (!value) return 'Sin fecha'
  try { return new Date(`${value}T12:00`).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' }) } catch { return value }
}

function SectionTitle({ eyebrow, title, children }) {
  return <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-end', marginBottom: 10 }}>
    <div>
      {eyebrow && <div style={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: c.muted, fontWeight: 950 }}>{eyebrow}</div>}
      <div style={{ marginTop: 3, fontSize: 20, fontWeight: 950, color: c.ink, letterSpacing: '-.04em' }}>{title}</div>
    </div>
    {children}
  </div>
}

function PatientHero({ paciente, saldo, onBack, onNewMotivo, onLegacy }) {
  const pendiente = Number(saldo?.saldo_pendiente || 0)
  return <section style={{ ...s.card, padding: 16, background: 'linear-gradient(135deg,#FFFFFF 0%,#ECF8FA 100%)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', marginBottom: 14 }}>
      <button type="button" onClick={onBack} style={s.btn}>← Volver</button>
      <button type="button" onClick={onLegacy} style={{ ...s.btn, color: c.muted }}>Vista completa</button>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 14, alignItems: 'center' }}>
      <div style={{ width: 74, height: 74, borderRadius: 26, display: 'grid', placeItems: 'center', background: `linear-gradient(135deg, ${c.sky}, ${c.skyDark})`, color: '#fff', fontSize: 24, fontWeight: 950, boxShadow: '0 16px 34px rgba(23,111,130,.22)' }}>{initials(paciente)}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 27, fontWeight: 950, color: c.ink, letterSpacing: '-.06em', lineHeight: 1.05 }}>{patientName(paciente)}</div>
        <div style={{ marginTop: 7, display: 'flex', gap: 10, flexWrap: 'wrap', color: c.ink2, fontSize: 14 }}>
          {paciente?.edad && <span>{paciente.edad} años</span>}
          {paciente?.email && <span>{paciente.email}</span>}
          {paciente?.telefono && <span>{paciente.telefono}</span>}
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: 9, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ borderRadius: 999, padding: '8px 12px', background: pendiente > 0 ? c.redSoft : c.mint, color: pendiente > 0 ? c.red : c.mintDark, fontWeight: 950, fontSize: 13 }}>{pendiente > 0 ? `Debe $${pendiente.toLocaleString('es-AR')}` : 'Sin deuda'}</span>
          <button type="button" onClick={onNewMotivo} style={s.primary}>+ Motivo de consulta</button>
        </div>
      </div>
    </div>
  </section>
}

function MotivoCard({ motivo, metrics, active, onClick }) {
  const sesiones = metrics?.sesiones || 0
  const rutinas = metrics?.rutinas || 0
  const lastPain = metrics?.ultimoDolor
  return <button type="button" onClick={onClick} style={{ ...s.card, padding: 15, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', borderColor: active ? 'rgba(47,159,178,.75)' : c.border, background: active ? 'linear-gradient(135deg,#FFFFFF 0%,#EAF8FB 100%)' : 'rgba(255,255,255,.96)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, letterSpacing: '.11em', textTransform: 'uppercase', color: c.muted, fontWeight: 950 }}>{motivo.estado || 'activo'}</div>
        <div style={{ marginTop: 5, color: c.ink, fontSize: 18, fontWeight: 950, letterSpacing: '-.03em' }}>{motivo.lesion || motivo.sintoma || 'Motivo de consulta'}</div>
        {motivo.diagnostico && <div style={{ marginTop: 5, color: c.ink2, fontSize: 13, lineHeight: 1.35 }}>{motivo.diagnostico}</div>}
      </div>
      <span style={{ borderRadius: 999, background: active ? '#DDF4F7' : '#F6FBFC', color: c.skyDark, padding: '7px 9px', fontSize: 12, fontWeight: 950 }}>Ver</span>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: 13 }}>
      <MiniStat label="Sesiones" value={sesiones} />
      <MiniStat label="Rutinas" value={rutinas} />
      <MiniStat label="Dolor" value={lastPain ?? '—'} />
    </div>
  </button>
}

function MiniStat({ label, value }) {
  return <div style={{ background: '#F6FBFC', border: `1px solid ${c.border}`, borderRadius: 16, padding: '9px 7px', textAlign: 'center' }}>
    <div style={{ fontSize: 18, fontWeight: 950, color: c.ink }}>{value}</div>
    <div style={{ fontSize: 10, color: c.muted, fontWeight: 900, textTransform: 'uppercase' }}>{label}</div>
  </div>
}

function MotivoModal({ onClose, onSave }) {
  const [form, setForm] = useState({ lesion: '', diagnostico: '', grado: 'No aplica', monto_sesion: '', estado: 'activo' })
  const [saving, setSaving] = useState(false)
  async function submit(e) {
    e.preventDefault(); setSaving(true)
    try { await onSave(form); onClose() } finally { setSaving(false) }
  }
  return <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(8,43,52,.44)', zIndex: 200, display: 'grid', placeItems: 'center', padding: 16 }}>
    <form onSubmit={submit} onClick={e => e.stopPropagation()} style={{ ...s.card, width: '100%', maxWidth: 440, padding: 18, display: 'grid', gap: 11 }}>
      <SectionTitle eyebrow="Nuevo" title="Motivo de consulta" />
      <input style={s.input} value={form.lesion} onChange={e => setForm(f => ({ ...f, lesion: e.target.value }))} placeholder="Ej: Tendinopatía rotuliana" required />
      <input style={s.input} value={form.diagnostico} onChange={e => setForm(f => ({ ...f, diagnostico: e.target.value }))} placeholder="Diagnóstico / detalle" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
        <input style={s.input} value={form.grado} onChange={e => setForm(f => ({ ...f, grado: e.target.value }))} placeholder="Grado" />
        <input style={s.input} value={form.monto_sesion} onChange={e => setForm(f => ({ ...f, monto_sesion: e.target.value }))} placeholder="Monto sesión" />
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
        <button type="button" onClick={onClose} style={s.btn}>Cancelar</button>
        <button type="submit" disabled={saving} style={{ ...s.primary, opacity: saving ? .65 : 1 }}>{saving ? 'Guardando...' : 'Guardar'}</button>
      </div>
    </form>
  </div>
}

function MotivoDetail({ motivo, evoluciones, rutinas, onBack, onRoutine, onLegacy }) {
  const [tab, setTab] = useState('sesiones')
  return <section style={{ ...s.card, padding: 15 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
      <div>
        <button type="button" onClick={onBack} style={{ ...s.btn, marginBottom: 11 }}>← Motivos</button>
        <div style={{ fontSize: 11, color: c.muted, letterSpacing: '.11em', textTransform: 'uppercase', fontWeight: 950 }}>Lesión seleccionada</div>
        <div style={{ marginTop: 4, fontSize: 23, fontWeight: 950, color: c.ink, letterSpacing: '-.05em' }}>{motivo.lesion || motivo.sintoma || 'Motivo de consulta'}</div>
        {motivo.diagnostico && <div style={{ marginTop: 5, color: c.ink2, fontSize: 13 }}>{motivo.diagnostico}</div>}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" onClick={onLegacy} style={s.btn}>+ Sesión</button>
        <button type="button" onClick={onRoutine} style={s.primary}>+ Rutina</button>
      </div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14 }}>
      <button type="button" onClick={() => setTab('sesiones')} style={{ ...tabBtn(tab === 'sesiones') }}>Sesiones ({evoluciones.length})</button>
      <button type="button" onClick={() => setTab('rutinas')} style={{ ...tabBtn(tab === 'rutinas') }}>Rutinas ({rutinas.length})</button>
    </div>
    <div style={{ marginTop: 12 }}>
      {tab === 'sesiones' ? <SessionsList items={evoluciones} onLegacy={onLegacy} /> : <RutinasList items={rutinas} onRoutine={onRoutine} />}
    </div>
  </section>
}

function tabBtn(active) {
  return { border: `1px solid ${active ? c.sky : c.border}`, background: active ? '#E9F7FA' : c.white, color: active ? c.skyDark : c.ink2, borderRadius: 16, padding: '11px 12px', fontWeight: 950, cursor: 'pointer', fontFamily: 'inherit' }
}

function SessionsList({ items, onLegacy }) {
  if (!items.length) return <Empty title="Sin sesiones cargadas" text="Cuando termines de atender, cargá la sesión dentro de este motivo." action="Cargar sesión" onAction={onLegacy} />
  return <div style={{ display: 'grid', gap: 9 }}>{items.map((e, idx) => {
    const tecnicas = parseJsonList(e.tecnicas_sesion)
    return <div key={e.id || idx} style={{ border: `1px solid ${c.border}`, borderRadius: 18, background: '#fff', padding: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <div><div style={{ fontSize: 15, fontWeight: 950, color: c.ink }}>Sesión {items.length - idx}</div><div style={{ marginTop: 3, color: c.muted, fontSize: 12 }}>{formatDate(e.fecha)}</div></div>
        <span style={{ borderRadius: 999, background: '#F6FBFC', color: c.skyDark, padding: '6px 9px', height: 30, fontWeight: 950, fontSize: 12 }}>{e.dolor !== '' && e.dolor != null ? `Dolor ${e.dolor}/10` : 'Sin dolor'}</span>
      </div>
      {tecnicas.length > 0 && <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 9 }}>{tecnicas.map(t => <span key={t} style={{ background: c.soft, color: c.ink2, borderRadius: 999, padding: '4px 8px', fontSize: 11, fontWeight: 850 }}>{t}</span>)}</div>}
      {e.notas && <div style={{ marginTop: 9, fontSize: 13, color: c.ink2, lineHeight: 1.4 }}>{e.notas}</div>}
    </div>
  })}</div>
}

function RutinasList({ items, onRoutine }) {
  if (!items.length) return <Empty title="Sin rutinas para esta lesión" text="Creá una rutina específica para este motivo." action="Crear rutina" onAction={onRoutine} />
  return <div style={{ display: 'grid', gap: 9 }}>{items.map((r) => {
    const count = Array.isArray(r.ejercicios) ? r.ejercicios.length : Number(r.ejercicios_count || 0)
    return <div key={r.id} style={{ border: `1px solid ${c.border}`, borderRadius: 18, background: '#fff', padding: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <div><div style={{ fontSize: 15, fontWeight: 950, color: c.ink }}>{r.nombre || 'Rutina'}</div><div style={{ marginTop: 3, color: c.muted, fontSize: 12 }}>{count} ítems · {r.frecuencia || 'Frecuencia semanal'}</div></div>
        <span style={{ borderRadius: 999, background: c.mint, color: c.mintDark, padding: '6px 9px', height: 30, fontWeight: 950, fontSize: 12 }}>{r.estado || 'Activa'}</span>
      </div>
    </div>
  })}</div>
}

function Empty({ title, text, action, onAction }) {
  return <div style={{ border: `1px dashed ${c.border}`, background: '#FBFEFE', borderRadius: 20, padding: 20, textAlign: 'center' }}>
    <div style={{ fontWeight: 950, color: c.ink }}>{title}</div>
    <div style={{ marginTop: 5, color: c.muted, fontSize: 13, lineHeight: 1.4 }}>{text}</div>
    {action && <button type="button" onClick={onAction} style={{ ...s.btn, marginTop: 12 }}>{action}</button>}
  </div>
}

export default function PatientMotivoDashboard() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [paciente, setPaciente] = useState(null)
  const [saldo, setSaldo] = useState(null)
  const [motivos, setMotivos] = useState([])
  const [metrics, setMetrics] = useState({})
  const [selectedId, setSelectedId] = useState(null)
  const [evoluciones, setEvoluciones] = useState([])
  const [rutinas, setRutinas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showLegacy, setShowLegacy] = useState(false)
  const [showMotivoModal, setShowMotivoModal] = useState(false)

  const selected = useMemo(() => motivos.find(m => String(m.id) === String(selectedId)), [motivos, selectedId])

  async function loadBase() {
    setLoading(true)
    try {
      const [p, sld, mot] = await Promise.all([
        api.getPaciente(id),
        api.getSaldo(id).catch(() => null),
        api.getMotivos(id),
      ])
      setPaciente(p); setSaldo(sld); setMotivos(Array.isArray(mot) ? mot : [])
      const metricPairs = await Promise.all((Array.isArray(mot) ? mot : []).map(async m => {
        const [ev, ru] = await Promise.all([api.getEvoluciones(m.id).catch(() => []), api.getRutinas(m.id).catch(() => [])])
        return [m.id, { sesiones: ev.length, rutinas: ru.length, ultimoDolor: ev?.[0]?.dolor }]
      }))
      setMetrics(Object.fromEntries(metricPairs))
    } finally { setLoading(false) }
  }

  async function loadSelected(motivoId) {
    if (!motivoId) return
    const [ev, ru] = await Promise.all([api.getEvoluciones(motivoId).catch(() => []), api.getRutinas(motivoId).catch(() => [])])
    setEvoluciones(Array.isArray(ev) ? ev : [])
    setRutinas(Array.isArray(ru) ? ru : [])
  }

  useEffect(() => { loadBase() }, [id])
  useEffect(() => { loadSelected(selectedId) }, [selectedId])

  async function createMotivo(data) {
    await api.createMotivo(id, data)
    await loadBase()
  }

  if (showLegacy) return <div style={s.shell}><button type="button" onClick={() => setShowLegacy(false)} style={{ ...s.btn, justifySelf: 'start' }}>← Volver a vista por lesión</button><PacienteDetalle /></div>
  if (loading || !paciente) return <div style={{ ...s.card, padding: 22, textAlign: 'center', color: c.muted }}>Cargando paciente...</div>

  return <div style={s.shell}>
    <PatientHero paciente={paciente} saldo={saldo} onBack={() => navigate('/kine/pacientes')} onNewMotivo={() => setShowMotivoModal(true)} onLegacy={() => setShowLegacy(true)} />

    {!selected ? <section style={{ ...s.card, padding: 15 }}>
      <SectionTitle eyebrow="Motivos de consulta" title="Elegí una lesión para trabajar">
        <button type="button" onClick={() => setShowMotivoModal(true)} style={s.btn}>+ Agregar</button>
      </SectionTitle>
      {motivos.length === 0 ? <Empty title="Todavía no hay motivos" text="Agregá el primer motivo de consulta para empezar a cargar sesiones y rutinas." action="Agregar motivo" onAction={() => setShowMotivoModal(true)} /> : <div style={{ display: 'grid', gap: 10 }}>{motivos.map(m => <MotivoCard key={m.id} motivo={m} metrics={metrics[m.id]} active={String(m.id) === String(selectedId)} onClick={() => setSelectedId(m.id)} />)}</div>}
    </section> : <MotivoDetail motivo={selected} evoluciones={evoluciones} rutinas={rutinas} onBack={() => setSelectedId(null)} onRoutine={() => navigate(`/kine/rutinas-clinicas/${id}`)} onLegacy={() => setShowLegacy(true)} />}

    {showMotivoModal && <MotivoModal onClose={() => setShowMotivoModal(false)} onSave={createMotivo} />}
  </div>
}
