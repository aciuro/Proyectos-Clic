import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from './api.js'
import ClinicalRoutineEditor from './ClinicalRoutineEditor.jsx'
import { buildRoutinePayload, getRoutineContext, normalizeRoutineItems, summarizeItem } from './clinicalRoutineUtils.js'

const c = {
  ink: '#0D3540', muted: '#7AAAB8', sky: '#5BB8CC', skyDark: '#3A96AE',
  border: '#C0DDE5', soft: '#F3FBFD', white: '#fff', danger: '#B91C1C'
}

const fld = { width: '100%', borderRadius: 14, border: '1px solid #dbe7eb', background: '#fff', padding: '10px 12px', fontSize: 13, color: c.ink, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }
const btn = { border: 'none', borderRadius: 14, padding: '10px 14px', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }

const EMPTY_RUTINA = {
  nombre: '', estado: 'Activa', resumen: '', ejercicios: [], hielo: null, calor: null, contraste: null, notas: '', veces: 1, ejercicios_libres: null,
}

function RutinaCard({ rutina, onEdit, onDelete }) {
  const items = normalizeRoutineItems(rutina)
  const contexto = getRoutineContext(rutina)
  return (
    <div style={{ background: '#fff', border: '1px solid rgba(91,184,204,.22)', borderRadius: 22, padding: 16, boxShadow: '0 8px 24px rgba(13,53,64,.06)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 900, color: c.ink }}>{rutina.nombre || 'Rutina sin nombre'}</div>
          <div style={{ marginTop: 5, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span style={pill}>{rutina.estado || 'Activa'}</span>
            <span style={pill}>{contexto}</span>
            <span style={pill}>{items.length} ítems</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button type="button" onClick={() => onEdit(rutina)} style={{ ...btn, background: '#EFF9FC', color: c.skyDark }}>Editar</button>
          <button type="button" onClick={() => onDelete(rutina)} style={{ ...btn, background: '#FEF2F2', color: c.danger }}>Eliminar</button>
        </div>
      </div>
      {rutina.resumen && <div style={{ marginTop: 10, fontSize: 13, color: c.muted }}>{rutina.resumen}</div>}
      <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
        {items.slice(0, 6).map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', border: '1px solid #e5eef2', background: '#f8fbfc', borderRadius: 14, padding: 9 }}>
            {item.imagen ? <img src={item.imagen} alt={item.nombre} style={{ width: 42, height: 42, objectFit: 'contain', borderRadius: 10, background: '#fff' }} /> : <div style={{ width: 42, height: 42, borderRadius: 10, background: '#fff', display: 'grid', placeItems: 'center' }}>•</div>}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: c.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.nombre || item.texto || item.tipo}</div>
              <div style={{ fontSize: 11, color: c.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{summarizeItem(item)}</div>
            </div>
          </div>
        ))}
        {items.length > 6 && <div style={{ fontSize: 12, color: c.muted }}>+ {items.length - 6} ítems más</div>}
      </div>
    </div>
  )
}

const pill = { display: 'inline-flex', alignItems: 'center', borderRadius: 999, padding: '5px 9px', background: '#EFF9FC', color: c.skyDark, fontSize: 11, fontWeight: 800, textTransform: 'capitalize' }

function EditorModal({ motivoId, rutina, onClose, onSaved }) {
  const [form, setForm] = useState({ ...EMPTY_RUTINA, ...rutina })
  const [editorData, setEditorData] = useState({ contexto: getRoutineContext(form), ejercicios: normalizeRoutineItems(form) })
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    const payload = buildRoutinePayload({ ...form }, editorData.contexto, editorData.ejercicios)
    try {
      if (form.id) await api.updateRutina(form.id, payload)
      else await api.createRutina(motivoId, payload)
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,53,64,.35)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 14 }}>
      <div style={{ width: 'min(980px, 100%)', maxHeight: '92vh', overflowY: 'auto', background: '#F3FBFD', borderRadius: 28, border: '1px solid rgba(91,184,204,.32)', boxShadow: '0 28px 80px rgba(13,53,64,.25)' }}>
        <div style={{ position: 'sticky', top: 0, zIndex: 3, background: 'rgba(243,251,253,.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(91,184,204,.22)', padding: 16, display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: '.08em', textTransform: 'uppercase', color: c.muted }}>{form.id ? 'Editar rutina' : 'Nueva rutina'}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: c.ink, marginTop: 3 }}>Rutina clínica unificada</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={onClose} style={{ ...btn, background: '#fff', color: c.ink, border: '1px solid #dbe7eb' }}>Cerrar</button>
            <button type="button" onClick={save} disabled={saving || !form.nombre?.trim()} style={{ ...btn, background: c.sky, color: '#fff', opacity: saving || !form.nombre?.trim() ? .55 : 1 }}>{saving ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </div>

        <div style={{ padding: 16, display: 'grid', gap: 14 }}>
          <section style={{ background: '#fff', border: '1px solid rgba(91,184,204,.22)', borderRadius: 22, padding: 14, display: 'grid', gap: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr .6fr .6fr', gap: 10 }}>
              <input style={fld} value={form.nombre || ''} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre: Rodilla semana 2" />
              <select style={fld} value={form.estado || 'Activa'} onChange={e => setForm({ ...form, estado: e.target.value })}><option>Activa</option><option>Pausada</option><option>Finalizada</option></select>
              <input style={fld} type="number" min="1" value={form.veces || 1} onChange={e => setForm({ ...form, veces: e.target.value })} placeholder="Veces" />
            </div>
            <input style={fld} value={form.resumen || ''} onChange={e => setForm({ ...form, resumen: e.target.value })} placeholder="Resumen corto para el paciente" />
            <textarea style={{ ...fld, minHeight: 72, resize: 'vertical' }} value={form.notas || ''} onChange={e => setForm({ ...form, notas: e.target.value })} placeholder="Notas generales" />
          </section>

          <ClinicalRoutineEditor rutina={{ ...form, ejercicios: editorData.ejercicios }} onChange={setEditorData} />
        </div>
      </div>
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

  return (
    <div style={{ display: 'grid', gap: 16, paddingBottom: 40 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
        <div>
          <button type="button" onClick={() => navigate(`/kine/paciente/${id}`)} style={{ ...btn, background: '#fff', color: c.skyDark, border: '1px solid rgba(91,184,204,.35)', marginBottom: 10 }}>← Volver al paciente</button>
          <div style={{ fontSize: 12, fontWeight: 900, color: c.muted, textTransform: 'uppercase', letterSpacing: '.08em' }}>RehabilitaPlus</div>
          <h1 style={{ margin: '4px 0 0', color: c.ink, fontSize: 28 }}>Rutinas clínicas unificadas</h1>
          <p style={{ margin: '6px 0 0', color: c.muted, fontSize: 14 }}>{paciente ? `${paciente.nombre} ${paciente.apellido}` : 'Paciente'}</p>
        </div>
        <button type="button" onClick={() => setEditing({ ...EMPTY_RUTINA })} disabled={!motivoId} style={{ ...btn, background: c.sky, color: '#fff', marginTop: 8, opacity: motivoId ? 1 : .55 }}>+ Nueva rutina</button>
      </header>

      <section style={{ background: '#fff', border: '1px solid rgba(91,184,204,.22)', borderRadius: 22, padding: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 900, color: c.ink, marginBottom: 8 }}>Motivo de consulta</div>
        <select style={fld} value={motivoId} onChange={e => setMotivoId(e.target.value)}>
          {motivos.map(m => <option key={m.id} value={m.id}>{m.lesion || m.sintoma || m.diagnostico || `Motivo ${m.id}`}</option>)}
        </select>
      </section>

      {loading ? <div style={{ color: c.muted }}>Cargando...</div> : (
        <div style={{ display: 'grid', gap: 12 }}>
          {rutinas.length === 0 && <div style={{ background: '#fff', border: '1px dashed #cbd5e1', borderRadius: 22, padding: 28, textAlign: 'center', color: c.muted }}>Sin rutinas creadas para este motivo.</div>}
          {rutinas.map(r => <RutinaCard key={r.id} rutina={r} onEdit={setEditing} onDelete={deleteRutina} />)}
        </div>
      )}

      {editing && <EditorModal motivoId={motivoId} rutina={editing} onClose={() => setEditing(null)} onSaved={async () => { setEditing(null); setRutinas(await api.getRutinas(motivoId)) }} />}
    </div>
  )
}
