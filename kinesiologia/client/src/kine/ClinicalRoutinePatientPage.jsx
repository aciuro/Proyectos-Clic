import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from './api.js'
import ClinicalRoutineEditorWizard from './ClinicalRoutineEditorWizard.jsx'
import { buildRoutinePayload, getRoutineContext, normalizeRoutineItems, summarizeItem } from './clinicalRoutineUtils.js'

const c = {
  ink: '#082B34', ink2: '#315F68', muted: '#789FAA', sky: '#2F9FB2', skyDark: '#176F82',
  border: 'rgba(83,151,166,.30)', soft: '#F4FAFB', white: '#fff', danger: '#B91C1C'
}

const fld = {
  width: '100%', borderRadius: 18, border: `1px solid ${c.border}`, background: 'rgba(255,255,255,.94)',
  padding: '12px 14px', fontSize: 14, color: c.ink, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
}
const btn = { border: 'none', borderRadius: 18, padding: '11px 15px', fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit' }
const glass = { background: 'rgba(255,255,255,.94)', border: `1px solid ${c.border}`, borderRadius: 26, boxShadow: '0 14px 40px rgba(13,53,64,.075)' }
const pill = { display: 'inline-flex', alignItems: 'center', borderRadius: 999, padding: '5px 9px', background: '#E9F7FA', color: c.skyDark, fontSize: 11, fontWeight: 900, textTransform: 'capitalize' }

const EMPTY_RUTINA = {
  nombre: '', estado: 'Activa', resumen: '', ejercicios: [], hielo: null, calor: null, contraste: null, notas: '', veces: 1, ejercicios_libres: null,
}

function RutinaCard({ rutina, onEdit, onDelete }) {
  const items = normalizeRoutineItems(rutina)
  const contexto = getRoutineContext(rutina)
  return (
    <article style={{ ...glass, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
            <span style={pill}>{rutina.estado || 'Activa'}</span>
            <span style={pill}>{contexto}</span>
            <span style={pill}>{items.length} ítems</span>
          </div>
          <h3 style={{ margin: 0, fontSize: 19, fontWeight: 950, color: c.ink, letterSpacing: '-.035em' }}>{rutina.nombre || 'Rutina sin nombre'}</h3>
          {(rutina.notas || rutina.resumen) && <p style={{ margin: '7px 0 0', fontSize: 13, color: c.muted, lineHeight: 1.45 }}>{rutina.notas || rutina.resumen}</p>}
        </div>
        <div style={{ display: 'flex', gap: 7 }}>
          <button type="button" onClick={() => onEdit(rutina)} style={{ ...btn, background: '#E9F7FA', color: c.skyDark, padding: '9px 12px' }}>Editar</button>
          <button type="button" onClick={() => onDelete(rutina)} style={{ ...btn, background: '#FEF2F2', color: c.danger, padding: '9px 12px' }}>Eliminar</button>
        </div>
      </div>
      <div style={{ display: 'grid', gap: 8, marginTop: 14 }}>
        {items.slice(0, 6).map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'center', border: '1px solid rgba(83,151,166,.20)', background: '#F8FCFD', borderRadius: 16, padding: 9 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0, color: c.skyDark, fontWeight: 900 }}>{i + 1}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 900, color: c.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.nombre || item.texto || item.tipo}</div>
              <div style={{ fontSize: 11.5, color: c.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>{summarizeItem(item)}</div>
            </div>
          </div>
        ))}
        {items.length > 6 && <div style={{ fontSize: 12, color: c.muted, fontWeight: 800 }}>+ {items.length - 6} ítems más</div>}
      </div>
    </article>
  )
}

function EditorModal({ motivoId, rutina, onClose, onSaved }) {
  const [form, setForm] = useState({ ...EMPTY_RUTINA, ...rutina })
  const [editorData, setEditorData] = useState({ contexto: getRoutineContext(form), ejercicios: normalizeRoutineItems(form), frecuencia: undefined, focos: undefined })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    const oldHtml = html.style.overflow
    const oldBody = body.style.overflow
    const oldPosition = body.style.position
    const oldWidth = body.style.width
    const oldTop = body.style.top
    const oldOverscroll = body.style.overscrollBehavior
    const scrollY = window.scrollY || window.pageYOffset || 0
    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    body.style.position = 'fixed'
    body.style.width = '100%'
    body.style.top = `-${scrollY}px`
    body.style.overscrollBehavior = 'none'
    return () => {
      html.style.overflow = oldHtml
      body.style.overflow = oldBody
      body.style.position = oldPosition
      body.style.width = oldWidth
      body.style.top = oldTop
      body.style.overscrollBehavior = oldOverscroll
      window.scrollTo(0, scrollY)
    }
  }, [])

  async function save() {
    setSaving(true)
    const payload = buildRoutinePayload(
      { ...form },
      editorData.contexto,
      editorData.ejercicios,
      { frecuencia: editorData.frecuencia, focos: editorData.focos }
    )
    try {
      if (form.id) await api.updateRutina(form.id, payload)
      else await api.createRutina(motivoId, payload)
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(8,43,52,.38)', zIndex: 200, display: 'flex', alignItems: 'stretch', justifyContent: 'center', padding: '10px 12px', backdropFilter: 'blur(7px)', overflow: 'hidden', overscrollBehavior: 'contain' }}>
      <div style={{ width: 'min(860px, calc(100vw - 24px))', height: 'calc(100dvh - 20px)', maxHeight: 'calc(100dvh - 20px)', overflowY: 'auto', overflowX: 'hidden', background: '#F4FAFB', borderRadius: 30, border: `1px solid ${c.border}`, boxShadow: '0 32px 90px rgba(13,53,64,.28)', overscrollBehaviorY: 'contain', WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}>
        <div style={{ position: 'sticky', top: 0, zIndex: 3, background: 'rgba(244,250,251,.96)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${c.border}`, padding: 16, display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 950, letterSpacing: '.1em', textTransform: 'uppercase', color: c.muted }}>{form.id ? 'Editar rutina' : 'Nueva rutina'}</div>
            <div style={{ fontSize: 20, fontWeight: 950, color: c.ink, marginTop: 3, letterSpacing: '-.035em' }}>Rutina clínica unificada</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={onClose} style={{ ...btn, background: '#fff', color: c.ink2, border: `1px solid ${c.border}` }}>Cerrar</button>
            <button type="button" onClick={save} disabled={saving || !form.nombre?.trim()} style={{ ...btn, background: `linear-gradient(135deg, ${c.sky} 0%, ${c.skyDark} 100%)`, color: '#fff', opacity: saving || !form.nombre?.trim() ? .55 : 1 }}>{saving ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </div>

        <div style={{ padding: '16px 16px 34px', display: 'grid', gap: 14, overflowX: 'hidden' }}>
          <ClinicalRoutineEditorWizard
            rutina={{ ...form, ejercicios: editorData.ejercicios }}
            onGeneralChange={(general) => setForm(prev => ({ ...prev, ...general }))}
            onChange={setEditorData}
          />
        </div>
      </div>
    </div>
  )
}

function EmptyState({ onCreate }) {
  return (
    <div style={{ ...glass, padding: '28px 20px', textAlign: 'center', display: 'grid', justifyItems: 'center', gap: 10 }}>
      <div style={{ width: 46, height: 46, borderRadius: 16, background: '#E9F7FA', display: 'grid', placeItems: 'center', color: c.skyDark, fontSize: 22, fontWeight: 950 }}>＋</div>
      <div>
        <div style={{ fontSize: 17, color: c.ink, fontWeight: 950, letterSpacing: '-.03em' }}>Sin rutinas todavía</div>
        <div style={{ fontSize: 13, color: c.muted, marginTop: 5, lineHeight: 1.45 }}>Creá la primera rutina para este motivo de consulta.</div>
      </div>
      <button type="button" onClick={onCreate} style={{ ...btn, background: `linear-gradient(135deg, ${c.sky} 0%, ${c.skyDark} 100%)`, color: '#fff', marginTop: 2 }}>Crear primera rutina</button>
    </div>
  )
}

export default function ClinicalRoutinePatientPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [paciente, setPaciente] = useState(null)
  const [motivos, setMotivos] = useState([])
  const [motivoId, setMotivoId] = useState('')
  const [rutinas, setRutinas] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const [p, ms] = await Promise.all([api.getPaciente(id), api.getMotivos(id)])
      setPaciente(p)
      setMotivos(ms)
      const selected = motivoId || ms[0]?.id || ''
      setMotivoId(selected)
      if (selected) setRutinas(await api.getRutinas(selected))
      else setRutinas([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])
  useEffect(() => {
    if (!motivoId) return
    api.getRutinas(motivoId).then(setRutinas).catch(() => setRutinas([]))
  }, [motivoId])

  async function deleteRutina(rutina) {
    if (!window.confirm(`¿Eliminar la rutina "${rutina.nombre}"?`)) return
    await api.deleteRutina(rutina.id)
    setRutinas(await api.getRutinas(motivoId))
  }

  const selectedMotivo = motivos.find(m => String(m.id) === String(motivoId))
  const patientName = paciente ? `${paciente.nombre || ''} ${paciente.apellido || ''}`.trim() : 'Paciente'

  return (
    <div style={{ display: 'grid', gap: 14, paddingBottom: 40 }}>
      <section style={{ ...glass, padding: 18, background: 'linear-gradient(135deg, rgba(255,255,255,.96) 0%, rgba(233,247,250,.70) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ display: 'grid', gap: 10, minWidth: 0, flex: 1 }}>
            <button type="button" onClick={() => navigate(`/kine/paciente/${id}`)} style={{ ...btn, justifySelf: 'start', background: '#fff', color: c.skyDark, border: `1px solid ${c.border}`, padding: '9px 12px' }}>← Volver al paciente</button>
            <div>
              <div style={{ fontSize: 11, fontWeight: 950, color: c.muted, textTransform: 'uppercase', letterSpacing: '.12em' }}>Rutinas clínicas</div>
              <h1 style={{ margin: '5px 0 0', color: c.ink, fontSize: 30, lineHeight: 1.05, fontWeight: 950, letterSpacing: '-.045em' }}>Rutinas clínicas</h1>
              <p style={{ margin: '7px 0 0', color: c.muted, fontSize: 14, fontWeight: 800 }}>{patientName}</p>
            </div>
          </div>
          <button type="button" onClick={() => setEditing({ ...EMPTY_RUTINA })} disabled={!motivoId} style={{ ...btn, background: `linear-gradient(135deg, ${c.sky} 0%, ${c.skyDark} 100%)`, color: '#fff', opacity: motivoId ? 1 : .55, boxShadow: '0 14px 32px rgba(23,111,130,.22)', marginTop: 4 }}>+ Nueva rutina</button>
        </div>
      </section>

      <section style={{ ...glass, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 950, color: c.muted, textTransform: 'uppercase', letterSpacing: '.1em' }}>Motivo de consulta</div>
            <div style={{ marginTop: 3, fontSize: 15, color: c.ink, fontWeight: 950 }}>{selectedMotivo ? (selectedMotivo.lesion || selectedMotivo.sintoma || selectedMotivo.diagnostico || `Motivo ${selectedMotivo.id}`) : 'Sin motivo seleccionado'}</div>
          </div>
          <span style={{ ...pill, background: '#F1FBFD' }}>{rutinas.length} rutinas</span>
        </div>
        <select style={fld} value={motivoId} onChange={e => setMotivoId(e.target.value)}>
          {motivos.map(m => <option key={m.id} value={m.id}>{m.lesion || m.sintoma || m.diagnostico || `Motivo ${m.id}`}</option>)}
        </select>
      </section>

      {loading ? <div style={{ ...glass, padding: 20, color: c.muted, textAlign: 'center', fontWeight: 800 }}>Cargando rutinas...</div> : (
        <section style={{ display: 'grid', gap: 12 }}>
          {rutinas.length === 0 && <EmptyState onCreate={() => setEditing({ ...EMPTY_RUTINA })} />}
          {rutinas.map(r => <RutinaCard key={r.id} rutina={r} onEdit={setEditing} onDelete={deleteRutina} />)}
        </section>
      )}

      {editing && <EditorModal motivoId={motivoId} rutina={editing} onClose={() => setEditing(null)} onSaved={async () => { setEditing(null); setRutinas(await api.getRutinas(motivoId)) }} />}
    </div>
  )
}
