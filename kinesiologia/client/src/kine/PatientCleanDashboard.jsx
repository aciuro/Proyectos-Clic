import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from './api.js'

const c = {
  ink: '#082B34', ink2: '#315F68', muted: '#789FAA', border: 'rgba(83,151,166,.30)',
  white: '#FFFFFF', sky: '#2F9FB2', skyDark: '#176F82', soft: '#EAF6F8', mint: '#E5F8F3', mintDark: '#16855F',
  redSoft: '#FEF2F2', red: '#B91C1C', line: '#D7EBF0', bg: '#F6FBFC'
}

const s = {
  shell: { display: 'grid', gap: 14, maxWidth: 920, margin: '0 auto' },
  card: { background: 'rgba(255,255,255,.96)', border: `1px solid ${c.border}`, borderRadius: 28, boxShadow: '0 14px 38px rgba(13,53,64,.07)' },
  btn: { border: `1px solid ${c.border}`, background: c.white, color: c.skyDark, borderRadius: 16, padding: '10px 13px', fontWeight: 950, cursor: 'pointer', fontFamily: 'inherit' },
  primary: { border: 0, background: `linear-gradient(135deg, ${c.sky}, ${c.skyDark})`, color: '#fff', borderRadius: 18, padding: '12px 16px', fontWeight: 950, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 14px 28px rgba(23,111,130,.22)' },
  input: { width: '100%', border: `1px solid ${c.border}`, borderRadius: 18, padding: '14px 15px', color: c.ink, background: '#FFFFFF', outline: 'none', fontFamily: 'inherit', fontSize: 16, boxSizing: 'border-box' },
  label: { fontSize: 14, color: c.ink2, fontWeight: 950, marginBottom: 7, textAlign: 'center' },
}

const GRADO_OPTIONS = ['I', 'II', 'III', 'IV', 'NO APLICA']
const painLabels = ['sin dolor', 'leve', 'leve', 'leve', 'moderado', 'moderado', 'moderado', 'intenso', 'intenso', 'intenso', 'máximo']

function initials(p = {}) {
  const text = [p.nombre, p.apellido].filter(Boolean).join(' ') || p.nombre || 'Paciente'
  return text.split(' ').filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase()
}

function patientName(p = {}) {
  return [p.nombre, p.apellido].filter(Boolean).join(' ') || p.nombre || 'Paciente'
}

function SectionTitle({ eyebrow, title, children, centered = false }) {
  return <div style={{ display: 'flex', justifyContent: centered ? 'center' : 'space-between', gap: 12, alignItems: 'flex-end', marginBottom: 10, textAlign: centered ? 'center' : 'left' }}>
    <div>
      {eyebrow && <div style={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: c.muted, fontWeight: 950 }}>{eyebrow}</div>}
      <div style={{ marginTop: 3, fontSize: centered ? 28 : 20, fontWeight: 950, color: c.ink, letterSpacing: '-.04em', lineHeight: 1.05 }}>{title}</div>
    </div>
    {children}
  </div>
}

function Field({ label, children }) {
  return <label style={{ display: 'block' }}><div style={s.label}>{label}</div>{children}</label>
}

function FormSection({ number, title, text, children }) {
  return <section style={{ borderTop: `1px solid ${c.line}`, paddingTop: 18, display: 'grid', gap: 12 }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 21, fontWeight: 950, color: c.ink, letterSpacing: '-.03em' }}>{number}. {title}</div>
      {text && <div style={{ margin: '6px auto 0', maxWidth: 310, color: c.muted, fontSize: 15, lineHeight: 1.25, fontWeight: 850 }}>{text}</div>}
    </div>
    {children}
  </section>
}

function PatientHero({ paciente, saldo, onBack, onNewMotivo }) {
  const pendiente = Number(saldo?.saldo_pendiente || 0)
  return <section style={{ ...s.card, padding: 16, background: 'linear-gradient(135deg,#FFFFFF 0%,#ECF8FA 100%)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', marginBottom: 14 }}>
      <button type="button" onClick={onBack} style={s.btn}>← Volver</button>
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

function MiniStat({ label, value }) {
  return <div style={{ background: '#F6FBFC', border: `1px solid ${c.border}`, borderRadius: 16, padding: '9px 7px', textAlign: 'center' }}>
    <div style={{ fontSize: 18, fontWeight: 950, color: c.ink }}>{value}</div>
    <div style={{ fontSize: 10, color: c.muted, fontWeight: 900, textTransform: 'uppercase' }}>{label}</div>
  </div>
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

function MotivoModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    sintoma: '', diagnostico: '', grado: 'NO APLICA', signos_sintomas: '', dolor: '', monto_sesion: '', estado: 'activo'
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    setError('')
    const sintoma = form.sintoma.trim()
    if (!sintoma) { setError('Escribí el motivo de consulta.'); return }
    setSaving(true)
    try {
      await onSave({
        ...form,
        sintoma,
        lesion: sintoma,
        diagnostico: form.diagnostico.trim(),
        signos_sintomas: form.signos_sintomas.trim(),
        dolor: form.dolor === '' ? null : Number(form.dolor),
        monto_sesion: form.monto_sesion || null,
      })
      onClose()
    } catch (err) {
      setError(err?.message || 'No se pudo guardar el motivo de consulta.')
    } finally { setSaving(false) }
  }

  return <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(8,43,52,.44)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 'max(14px, env(safe-area-inset-top)) 12px max(18px, env(safe-area-inset-bottom))', boxSizing: 'border-box', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
    <form onSubmit={submit} onClick={e => e.stopPropagation()} style={{ ...s.card, width: '100%', maxWidth: 460, maxHeight: 'calc(100dvh - 24px)', overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '20px 18px 0', display: 'grid', gap: 16, background: '#FFFFFF', boxSizing: 'border-box', textAlign: 'center' }}>
      <SectionTitle eyebrow="Nuevo" title="Motivo de consulta" centered />

      <FormSection number="1" title="Motivo de consulta" text="Qué trae al paciente a consulta.">
        <Field label="Motivo de consulta"><input style={s.input} value={form.sintoma} onChange={e => setForm(f => ({ ...f, sintoma: e.target.value }))} placeholder="Ej: Dolor rodilla derecha" required /></Field>
      </FormSection>

      <FormSection number="2" title="Diagnóstico médico" text="Diagnóstico informado o presuntivo, con grado si corresponde.">
        <Field label="Diagnóstico médico"><input style={s.input} value={form.diagnostico} onChange={e => setForm(f => ({ ...f, diagnostico: e.target.value }))} placeholder="Ej: Tendinopatía rotuliana" /></Field>
        <Field label="Grado"><select style={s.input} value={form.grado} onChange={e => setForm(f => ({ ...f, grado: e.target.value }))}>{GRADO_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></Field>
      </FormSection>

      <FormSection number="3" title="Signos, síntomas y dolor" text="Registro clínico rápido para seguir la evolución.">
        <Field label="Signos y síntomas"><textarea style={{ ...s.input, minHeight: 104, resize: 'vertical' }} value={form.signos_sintomas} onChange={e => setForm(f => ({ ...f, signos_sintomas: e.target.value }))} placeholder="Ej: dolor al bajar escaleras, edema leve, dolor a la palpación, rigidez matinal..." /></Field>
        <div>
          <div style={s.label}>Dolor actual</div>
          <div style={{ marginTop: -2, marginBottom: 9, color: c.muted, fontSize: 12, fontWeight: 800 }}>Escala 0 a 10: 0 sin dolor, 10 peor dolor imaginable.</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 6 }}>
            {Array.from({ length: 11 }, (_, i) => <button key={i} type="button" onClick={() => setForm(f => ({ ...f, dolor: i }))} style={{ border: `1px solid ${form.dolor === i ? c.sky : c.border}`, background: form.dolor === i ? c.sky : '#fff', color: form.dolor === i ? '#fff' : c.ink, borderRadius: 12, padding: '9px 0', fontWeight: 950, fontFamily: 'inherit', cursor: 'pointer' }}>{i}</button>)}
          </div>
          <div style={{ marginTop: 8, color: c.ink2, fontSize: 12, fontWeight: 900 }}>{form.dolor === '' ? 'Sin seleccionar' : `${form.dolor}/10 · ${painLabels[form.dolor]}`}</div>
        </div>
      </FormSection>

      <FormSection number="4" title="Monto de sesión" text="Dato administrativo para cobros y saldo.">
        <Field label="Monto sesión"><input style={s.input} value={form.monto_sesion} onChange={e => setForm(f => ({ ...f, monto_sesion: e.target.value }))} placeholder="$" inputMode="numeric" /></Field>
      </FormSection>

      {error && <div style={{ border: `1px solid #F5A897`, background: c.redSoft, color: c.red, borderRadius: 16, padding: '11px 12px', fontSize: 13, fontWeight: 850 }}>{error}</div>}
      <div style={{ display: 'flex', gap: 9, justifyContent: 'center', flexWrap: 'wrap', position: 'sticky', bottom: 0, background: '#FFFFFF', padding: '13px 0 16px', borderTop: `1px solid ${c.line}`, zIndex: 2 }}>
        <button type="button" onClick={onClose} style={s.btn}>Cancelar</button>
        <button type="submit" disabled={saving} style={{ ...s.primary, opacity: saving ? .65 : 1 }}>{saving ? 'Guardando...' : 'Guardar'}</button>
      </div>
    </form>
  </div>
}

function Empty({ title, text, action, onAction }) {
  return <div style={{ border: `1px dashed ${c.border}`, background: '#FBFEFE', borderRadius: 20, padding: 20, textAlign: 'center' }}>
    <div style={{ fontWeight: 950, color: c.ink }}>{title}</div>
    <div style={{ marginTop: 5, color: c.muted, fontSize: 13, lineHeight: 1.4 }}>{text}</div>
    {action && <button type="button" onClick={onAction} style={{ ...s.btn, marginTop: 12 }}>{action}</button>}
  </div>
}

function MotivoDetail({ motivo, evoluciones, rutinas, onBack, onRoutine }) {
  return <section style={{ ...s.card, padding: 15 }}>
    <button type="button" onClick={onBack} style={{ ...s.btn, marginBottom: 11 }}>← Motivos</button>
    <div style={{ fontSize: 11, color: c.muted, letterSpacing: '.11em', textTransform: 'uppercase', fontWeight: 950 }}>Motivo seleccionado</div>
    <div style={{ marginTop: 4, fontSize: 23, fontWeight: 950, color: c.ink, letterSpacing: '-.05em' }}>{motivo.lesion || motivo.sintoma || 'Motivo de consulta'}</div>
    {motivo.diagnostico && <div style={{ marginTop: 5, color: c.ink2, fontSize: 13 }}>{motivo.diagnostico}</div>}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14 }}>
      <MiniStat label="Sesiones" value={evoluciones.length} />
      <MiniStat label="Rutinas" value={rutinas.length} />
    </div>
    <div style={{ marginTop: 14 }}>
      <button type="button" onClick={onRoutine} style={s.primary}>+ Crear rutina</button>
    </div>
  </section>
}

export default function PatientCleanDashboard() {
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
  const [showMotivoModal, setShowMotivoModal] = useState(false)

  const selected = useMemo(() => motivos.find(m => String(m.id) === String(selectedId)), [motivos, selectedId])

  async function loadBase() {
    setLoading(true)
    try {
      const [p, sld, mot] = await Promise.all([api.getPaciente(id), api.getSaldo(id).catch(() => null), api.getMotivos(id)])
      const list = Array.isArray(mot) ? mot : []
      setPaciente(p); setSaldo(sld); setMotivos(list)
      const metricPairs = await Promise.all(list.map(async m => {
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

  if (loading || !paciente) return <div style={{ ...s.card, padding: 22, textAlign: 'center', color: c.muted }}>Cargando paciente...</div>

  return <div style={s.shell}>
    <PatientHero paciente={paciente} saldo={saldo} onBack={() => navigate('/kine/pacientes')} onNewMotivo={() => setShowMotivoModal(true)} />
    {!selected ? <section style={{ ...s.card, padding: 15 }}>
      <SectionTitle eyebrow="Motivos de consulta" title="Elegí una lesión para trabajar"><button type="button" onClick={() => setShowMotivoModal(true)} style={s.btn}>+ Agregar</button></SectionTitle>
      {motivos.length === 0 ? <Empty title="Todavía no hay motivos" text="Agregá el primer motivo de consulta para empezar a cargar sesiones y rutinas." action="Agregar motivo" onAction={() => setShowMotivoModal(true)} /> : <div style={{ display: 'grid', gap: 10 }}>{motivos.map(m => <MotivoCard key={m.id} motivo={m} metrics={metrics[m.id]} active={String(m.id) === String(selectedId)} onClick={() => setSelectedId(m.id)} />)}</div>}
    </section> : <MotivoDetail motivo={selected} evoluciones={evoluciones} rutinas={rutinas} onBack={() => setSelectedId(null)} onRoutine={() => navigate(`/kine/rutinas-clinicas/${id}`)} />}
    {showMotivoModal && <MotivoModal onClose={() => setShowMotivoModal(false)} onSave={createMotivo} />}
  </div>
}
