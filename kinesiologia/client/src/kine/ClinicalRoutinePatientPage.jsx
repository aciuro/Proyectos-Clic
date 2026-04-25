import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from './api.js'
import ClinicalRoutineEditor from './ClinicalRoutineEditor.jsx'
import { buildRoutinePayload, getRoutineContext, normalizeRoutineItems, summarizeItem } from './clinicalRoutineUtils.js'

const c = {
  ink: '#082B34', ink2: '#315F68', muted: '#789FAA', sky: '#2F9FB2', skyDark: '#176F82',
  border: 'rgba(83,151,166,.30)', soft: '#F4FAFB', white: '#fff', danger: '#B91C1C', mint: '#72CDB8'
}

const fld = {
  width: '100%', borderRadius: 18, border: `1px solid ${c.border}`, background: 'rgba(255,255,255,.94)',
  padding: '12px 14px', fontSize: 14, color: c.ink, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
}
const btn = { border: 'none', borderRadius: 18, padding: '11px 15px', fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit' }
const glass = { background: 'rgba(255,255,255,.94)', border: `1px solid ${c.border}`, borderRadius: 26, boxShadow: '0 14px 40px rgba(13,53,64,.075)' }

const EMPTY_RUTINA = {
  nombre: '', estado: 'Activa', resumen: '', ejercicios: [], hielo: null, calor: null, contraste: null, notas: '', veces: 1, ejercicios_libres: null,
}

const pill = { display: 'inline-flex', alignItems: 'center', borderRadius: 999, padding: '5px 9px', background: '#E9F7FA', color: c.skyDark, fontSize: 11, fontWeight: 900, textTransform: 'capitalize' }

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
          {rutina.resumen && <p style={{ margin: '7px 0 0', fontSize: 13, color: c.muted, lineHeight: 1.45 }}>{rutina.resumen}</p>}
        </div>
        <div style={{ display: 'flex', gap: 7 }}>
          <button type="button" onClick={() => onEdit(rutina)} style={{ ...btn, background: '#E9F7FA', color: c.skyDark, padding: '9px 12px' }}>Editar</button>
          <button type="button" onClick={() => onDelete(rutina)} style={{ ...btn, background: '#FEF2F2', color: c.danger, padding: '9px 12px' }}>Eliminar</button>
        </div>
      </div>
      <div style={{ display: 'grid', gap: 8, marginTop: 14 }}>
        {items.slice(0, 6).map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'center', border: '1px solid rgba(83,151,166,.20)', background: '#F8FCFD', borderRadius: 16, padding: 9 }}>
            {item.imagen ? <img src={item.imagen} alt={item.nombre} style={{ width: 44, height: 44, objectFit: 'contain', borderRadius: 12, background: '#fff', flexShrink: 0 }} /> : <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0, color: c.skyDark, fontWeight: 900 }}>{i + 1}</div>}
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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(8,43,52,.38)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 14, backdropFilter: 'blur(7px)' }}>
      <div style={{ width: 'min(980px, 100%)', maxHeight: '92vh', overflowY: 'auto', background: '#F4FAFB', borderRadius: 30, border: `1px solid ${c.border}`, boxShadow: '0 32px 90px rgba(13,53,64,.28)' }}>
        <div style={{ position: 'sticky', top: 0, zIndex: 3, background: 'rgba(244,250,251,.94)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${c.border}`, padding: 16, display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 950, letterSpacing: '.1em', textTransform: 'uppercase', color: c.muted }}>{form.id ? 'Editar rutina' : 'Nueva rutina'}</div>
            <div style={{ fontSize: 20, fontWeight: 950, color: c.ink, marginTop: 3, letterSpacing: '-.035em' }}>Rutina clínica unificada</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={onClose} style={{ ...btn, background: '#fff', color: c.ink2, border: `1px solid ${c.border}` }}>Cerrar</button>
            <button type="button" onClick={save} disabled={saving || !form.nombre?.trim()} style={{ ...btn, background: `linear-gradient(135deg, ${c.sky} 0%, ${c.skyDark} 100%)`, color: '#fff', opacity: saving || !form.nombre?.trim() ? .55 : 1 }}>{saving ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </div>

        <div style={{ padding: 16, display: 'grid', gap: 14 }}>
          <section style={{ ...glass, padding: 14, display: 'grid', gap: 10 }}>
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
