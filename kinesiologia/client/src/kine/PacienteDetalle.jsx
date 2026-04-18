import { useEffect, useState, Component } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { api } from './api.js'
import Modal from './Modal.jsx'
import { exerciseLibrary } from './exerciseLibrary.js'

class ModalErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null } }
  static getDerivedStateFromError(error) { return { hasError: true, error } }
  render() {
    if (this.state.hasError) {
      return (
        <div onClick={this.props.onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 60 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 24, padding: 32, maxWidth: 400, width: '100%', textAlign: 'center' }}>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Error al cargar la rutina</p>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>Ocurrió un problema al mostrar esta rutina. Intentá editarla o recargá la página.</p>
            <button onClick={this.props.onClose} style={{ padding: '10px 24px', borderRadius: 12, background: '#0f172a', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Cerrar</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

const MOTIVO_EMPTY = {
  lesion: '', grado: 'No aplica', diagnostico: '',
  tiempo_evolucion: '', unidad_tiempo: 'Semanas',
  momento_dia: '', movimientos: '',
  afloja_dia: false, monto_sesion: '', estado: 'activo',
}

/* ── Estilos para formulario de motivo ─────────────────── */
const mFld = {
  width: '100%', borderRadius: 14, border: '1px solid #e2e8f0',
  background: '#fff', padding: '11px 16px', color: '#0f172a',
  outline: 'none', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box',
}
const mLbl = { display: 'block', fontSize: 14, fontWeight: 500, color: '#334155', marginBottom: 8 }
const mSecH = { fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: 16 }
const EVOL_EMPTY = { fecha: new Date().toISOString().slice(0, 10), notas: '', dolor: '', tecnicas: '', monto_cobrado: '', pagado: false, tecnicas_sesion: [], ejercicios_sesion: [] }

// Normaliza el JSON de ejercicios_sesion — soporta formato viejo {id} y nuevo {nombre}
function parseEjSesion(json) {
  if (!json) return []
  try {
    const arr = JSON.parse(json)
    return arr.map(x => {
      if (typeof x === 'number' || typeof x === 'string') return { id: Number(x), nombre: null, series: '', repeticiones: '', segundos: '' }
      if (x.nombre) return { nombre: x.nombre, series: x.series ?? '', repeticiones: x.repeticiones ?? '', segundos: x.segundos ?? '' }
      return { id: x.id, nombre: null, series: x.series ?? '', repeticiones: x.repeticiones ?? '', segundos: x.segundos ?? '' }
    })
  } catch { return [] }
}

const TECNICAS_OPCIONES = [
  'Puncion Seca',
  'MEP',
  'Masoterapia',
  'Movilidad',
  'Gun',
  'Electro',
  'Presoterapia',
]

// Selector visual de ejercicios usando la biblioteca local con imágenes
function EjercicioSelectorVisual({ seleccionados, onChange }) {
  const [activeGroup, setActiveGroup] = useState(null)
  const [search, setSearch] = useState('')

  const groups = exerciseLibrary.map(g => g.title)

  const filteredSections = exerciseLibrary
    .filter(g => !activeGroup || g.title === activeGroup)
    .map(g => ({
      ...g,
      items: g.items.filter(item =>
        !search || item.name.toLowerCase().includes(search.toLowerCase())
      )
    }))
    .filter(g => g.items.length > 0)

  function toggleEj(item) {
    const ya = seleccionados.some(x => x.nombre === item.name)
    if (ya) onChange(seleccionados.filter(x => x.nombre !== item.name))
    else onChange([...seleccionados, { nombre: item.name, series: '', repeticiones: '', segundos: '' }])
  }

  function upd(nombre, field, val) {
    onChange(seleccionados.map(x => x.nombre === nombre ? { ...x, [field]: val } : x))
  }

  const sS = {
    wrap: { border: '1px solid #e2e8f0', borderRadius: 18, overflow: 'hidden', background: '#f8fafc' },
    header: { padding: '14px 16px', borderBottom: '1px solid #e2e8f0', background: '#fff' },
    title: { fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 10 },
    groups: { display: 'flex', gap: 6, flexWrap: 'wrap' },
    groupBtn: (active) => ({
      padding: '5px 12px', borderRadius: 20, border: '1px solid ' + (active ? '#0ea5e9' : '#e2e8f0'),
      background: active ? '#0ea5e9' : '#fff', color: active ? '#fff' : '#475569',
      fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s'
    }),
    search: { width: '100%', borderRadius: 12, border: '1px solid #e2e8f0', background: '#fff', padding: '8px 12px', fontSize: 13, color: '#0f172a', outline: 'none', boxSizing: 'border-box', marginTop: 8, fontFamily: 'inherit' },
    body: { maxHeight: 340, overflowY: 'auto', padding: 12 },
    groupLabel: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#94a3b8', marginBottom: 8, marginTop: 4 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 },
    card: (selected) => ({
      borderRadius: 14, border: '2px solid ' + (selected ? '#0ea5e9' : '#e2e8f0'),
      background: selected ? '#f0f9ff' : '#fff', cursor: 'pointer',
      overflow: 'hidden', transition: 'all 0.15s', padding: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'inherit',
    }),
    cardImg: { width: '100%', aspectRatio: '1/1', objectFit: 'contain', background: '#f8fafc', padding: 4 },
    cardName: { fontSize: 11, fontWeight: 600, color: '#334155', textAlign: 'center', padding: '6px 6px 8px', lineHeight: 1.3 },
    selList: { borderTop: '1px solid #e2e8f0', padding: 12, display: 'flex', flexDirection: 'column', gap: 8, background: '#fff' },
    selRow: { display: 'flex', alignItems: 'center', gap: 8, borderRadius: 12, border: '1px solid #e2e8f0', padding: '8px 10px', background: '#f8fafc' },
    selName: { flex: 1, fontSize: 13, fontWeight: 600, color: '#0f172a', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    selInputs: { display: 'flex', gap: 6, flexShrink: 0 },
    selField: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 },
    selFieldLbl: { fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' },
    selInput: { width: 46, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', padding: '4px 6px', fontSize: 12, textAlign: 'center', outline: 'none', fontFamily: 'inherit', color: '#0f172a' },
    rmBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 18, lineHeight: 1, padding: '0 2px', flexShrink: 0 },
  }

  return (
    <div style={sS.wrap}>
      <div style={sS.header}>
        <div style={sS.title}>Ejercicios de la sesión</div>
        <div style={sS.groups}>
          <button type="button" style={sS.groupBtn(!activeGroup)} onClick={() => setActiveGroup(null)}>Todos</button>
          {groups.map(g => (
            <button key={g} type="button" style={sS.groupBtn(activeGroup === g)} onClick={() => setActiveGroup(g === activeGroup ? null : g)}>{g}</button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Buscar ejercicio…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={sS.search}
        />
      </div>

      <div style={sS.body}>
        {filteredSections.map(section => (
          <div key={section.title}>
            {!activeGroup && <div style={sS.groupLabel}>{section.title}</div>}
            <div style={sS.grid}>
              {section.items.map(item => {
                const selected = seleccionados.some(x => x.nombre === item.name)
                return (
                  <button key={item.name} type="button" style={sS.card(selected)} onClick={() => toggleEj(item)}>
                    <img src={item.images[0]} alt={item.name} style={sS.cardImg} loading="lazy" />
                    <div style={sS.cardName}>{item.name}</div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
        {filteredSections.length === 0 && (
          <div style={{ padding: '20px 0', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Sin resultados</div>
        )}
      </div>

      {seleccionados.length > 0 && (
        <div style={sS.selList}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#64748b', marginBottom: 2 }}>
            Seleccionados ({seleccionados.length})
          </div>
          {seleccionados.map(ejd => (
            <div key={ejd.nombre} style={sS.selRow}>
              <div style={sS.selName}>{ejd.nombre}</div>
              <div style={sS.selInputs}>
                <div style={sS.selField}>
                  <span style={sS.selFieldLbl}>Series</span>
                  <input type="number" min="1" max="10" value={ejd.series} onChange={e => upd(ejd.nombre, 'series', e.target.value)} placeholder="—" style={sS.selInput} />
                </div>
                <div style={sS.selField}>
                  <span style={sS.selFieldLbl}>Reps</span>
                  <input type="number" min="1" max="100" value={ejd.repeticiones} onChange={e => upd(ejd.nombre, 'repeticiones', e.target.value)} placeholder="—" style={sS.selInput} />
                </div>
                <div style={sS.selField}>
                  <span style={sS.selFieldLbl}>Seg</span>
                  <input type="number" min="1" max="300" value={ejd.segundos} onChange={e => upd(ejd.nombre, 'segundos', e.target.value)} placeholder="—" style={sS.selInput} />
                </div>
              </div>
              <button type="button" style={sS.rmBtn} onClick={() => onChange(seleccionados.filter(x => x.nombre !== ejd.nombre))}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SaldoChip({ saldo }) {
  if (!saldo) return null
  const pendiente = saldo.saldo_pendiente || 0
  return (
    <div className={`saldo-chip ${pendiente > 0 ? 'deuda' : 'ok'}`}>
      {pendiente > 0 ? `Debe $${pendiente.toLocaleString('es-AR')}` : 'Sin deuda'}
    </div>
  )
}

/* ── Estilos inline compartidos ─────────────────────────── */
const mc = {
  card: { background: '#fff', borderRadius: 28, border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' },
  iconBtn: { background: 'none', border: 'none', cursor: 'pointer', borderRadius: 12, padding: '6px 8px', color: '#94a3b8', fontSize: 16, transition: 'background 0.15s', lineHeight: 1 },
  sectionTitle: { fontWeight: 700, fontSize: 16, color: '#0f172a' },
  sectionSub: { fontSize: 14, color: '#64748b', marginTop: 2 },
  emptyBox: { borderRadius: 24, border: '2px dashed #cbd5e1', background: '#f8fafc', padding: '40px 24px', textAlign: 'center' },
  btnEmerald: { padding: '10px 16px', borderRadius: 16, background: '#059669', color: '#fff', border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer', boxShadow: '0 1px 3px rgba(5,150,105,0.25)', fontFamily: 'inherit' },
  btnBlue: { padding: '10px 16px', borderRadius: 16, background: '#2563eb', color: '#fff', border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer', boxShadow: '0 1px 3px rgba(37,99,235,0.25)', fontFamily: 'inherit' },
  pill: (active) => ({ display: 'inline-block', padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600, background: active ? '#dcfce7' : '#f1f5f9', color: active ? '#166534' : '#475569' }),
  pillBlue: (active) => ({ display: 'inline-block', padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600, background: active ? '#dbeafe' : '#f1f5f9', color: active ? '#1e40af' : '#475569' }),
}

const EJERCICIOS_CATALOG = [
  // 🦶 TOBILLO
  {
    id: 'tobillo_dorsiflexion', nombre: 'Dorsiflexión de tobillo', zona: 'tobillo',
    imagen: '/ejercicios/tobillo_dorsiflexion.jpg', video: null,
    descripcion: 'Sentado o de pie, llevar la punta del pie hacia la espinilla. Mejora el rango de movilidad articular del tobillo.',
  },
  {
    id: 'tobillo_eversion_banda', nombre: 'Eversión con banda', zona: 'tobillo',
    imagen: '/ejercicios/tobillo_eversion_banda.jpg', video: null,
    descripcion: 'Con banda elástica anclada, realizar el movimiento del pie hacia afuera. Fortalece los peroneos.',
  },
  {
    id: 'tobillo_equilibrio', nombre: 'Equilibrio unipodal', zona: 'tobillo',
    imagen: '/ejercicios/tobillo_equilibrio.jpg', video: null,
    descripcion: 'De pie sobre una sola pierna, mantener el equilibrio. Activa los estabilizadores del tobillo y mejora la propiocepción.',
  },
  // 🦵 RODILLA
  {
    id: 'cuadriceps_isometrico', nombre: 'Cuádriceps isométrico', zona: 'rodilla',
    imagen: '/ejercicios/cuadriceps_isometrico.jpg', video: null,
    descripcion: 'Sentado con la rodilla extendida, contraer el cuádriceps sin movimiento. Activa la musculatura sin carga articular.',
  },
  {
    id: 'sentadilla_parcial', nombre: 'Sentadilla parcial', zona: 'rodilla',
    imagen: '/ejercicios/sentadilla_parcial.jpg', video: null,
    descripcion: 'Flexión de rodilla hasta 60–90°, sin que las rodillas superen la punta del pie. Fortalece cuádriceps y glúteos.',
  },
  {
    id: 'step_up', nombre: 'Step up', zona: 'rodilla',
    imagen: '/ejercicios/step_up.jpg', video: null,
    descripcion: 'Subir y bajar de un escalón de forma controlada. Ejercicio funcional para rodilla y cadera.',
  },
  // 🍑 CADERA
  {
    id: 'puente_gluteos', nombre: 'Puente de glúteos', zona: 'cadera',
    imagen: '/ejercicios/puente_gluteos.jpg', video: null,
    descripcion: 'Boca arriba con pies apoyados, elevar la cadera hasta alineación. Activa glúteo mayor e isquiotibiales.',
  },
  {
    id: 'clamshell', nombre: 'Clamshell', zona: 'cadera',
    imagen: '/ejercicios/clamshell.jpg', video: null,
    descripcion: 'De costado con rodillas flexionadas, abrir y cerrar la pierna superior. Trabaja el glúteo medio.',
  },
  {
    id: 'abduccion_cadera', nombre: 'Abducción de cadera', zona: 'cadera',
    imagen: '/ejercicios/abduccion_cadera.jpg', video: null,
    descripcion: 'De pie o acostado, alejar la pierna del eje del cuerpo. Fortalece los abductores de cadera.',
  },
  // 🧠 LUMBAR
  {
    id: 'gato_camello', nombre: 'Gato-camello', zona: 'lumbar',
    imagen: '/ejercicios/gato_camello.jpg', video: null,
    descripcion: 'En cuatro apoyos, alternar flexión y extensión de columna. Moviliza la columna lumbar y torácica.',
  },
  {
    id: 'dead_bug', nombre: 'Dead bug', zona: 'lumbar',
    imagen: '/ejercicios/dead_bug.jpg', video: null,
    descripcion: 'Boca arriba, extender brazo y pierna opuesta sin perder el contacto lumbar con el suelo. Estabilidad lumbopélvica.',
  },
  {
    id: 'bird_dog', nombre: 'Bird dog', zona: 'lumbar',
    imagen: '/ejercicios/bird_dog.jpg', video: null,
    descripcion: 'En cuatro apoyos, extender brazo y pierna opuestos manteniendo la espalda neutra. Control motor lumbar.',
  },
  // 💪 HOMBRO
  {
    id: 'pendulares_hombro', nombre: 'Ejercicios pendulares', zona: 'hombro',
    imagen: '/ejercicios/pendulares_hombro.jpg', video: null,
    descripcion: 'Inclinado hacia adelante, dejar colgar el brazo y balancearlo suavemente. Descomprime la articulación del hombro.',
  },
  {
    id: 'elevacion_frontal', nombre: 'Elevación frontal', zona: 'hombro',
    imagen: '/ejercicios/elevacion_frontal.jpg', video: null,
    descripcion: 'De pie, elevar el brazo extendido hacia adelante hasta la horizontal. Trabaja el deltoides anterior.',
  },
  {
    id: 'rotacion_externa_banda', nombre: 'Rotación externa con banda', zona: 'hombro',
    imagen: '/ejercicios/rotacion_externa_banda.jpg', video: null,
    descripcion: 'Con el codo a 90°, rotar el antebrazo hacia afuera contra la banda. Fortalece el manguito rotador.',
  },
  {
    id: 'retraccion_escapular', nombre: 'Retracción escapular', zona: 'hombro',
    imagen: '/ejercicios/retraccion_escapular.jpg', video: null,
    descripcion: 'Juntar las escápulas como si aplanara un lápiz entre ellas. Activa romboides y trapecio medio.',
  },
  // 💪 BRAZO
  {
    id: 'flexion_codo', nombre: 'Flexión de codo', zona: 'brazo',
    imagen: '/ejercicios/flexion_codo.jpg', video: null,
    descripcion: 'Flexión y extensión del codo con o sin carga. Trabaja bíceps braquial y braquiorradial.',
  },
  {
    id: 'extension_codo', nombre: 'Extensión de codo', zona: 'brazo',
    imagen: '/ejercicios/extension_codo.jpg', video: null,
    descripcion: 'Extensión del codo con banda o peso. Trabaja el tríceps braquial.',
  },
  {
    id: 'pronacion_supinacion', nombre: 'Pronación / Supinación', zona: 'brazo',
    imagen: '/ejercicios/pronacion_supinacion.jpg', video: null,
    descripcion: 'Rotar el antebrazo con el codo a 90°. Mejora la movilidad del codo y el antebrazo.',
  },
  // 🔹 CERVICAL
  {
    id: 'flexion_cervical', nombre: 'Flexión cervical', zona: 'cervical',
    imagen: '/ejercicios/flexion_cervical.jpg', video: null,
    descripcion: 'Llevar el mentón hacia el pecho lentamente. Moviliza la columna cervical en flexión.',
  },
  {
    id: 'inclinacion_cervical', nombre: 'Inclinación lateral cervical', zona: 'cervical',
    imagen: '/ejercicios/inclinacion_cervical.jpg', video: null,
    descripcion: 'Inclinar la cabeza hacia el hombro sin rotar. Moviliza y estira la musculatura lateral del cuello.',
  },
  {
    id: 'rotacion_cervical', nombre: 'Rotación cervical', zona: 'cervical',
    imagen: '/ejercicios/rotacion_cervical.jpg', video: null,
    descripcion: 'Girar la cabeza hacia cada lado con suavidad. Mejora la rotación cervical y libera tensión.',
  },
  // 🧱 ZONA MEDIA
  {
    id: 'plancha_frontal', nombre: 'Plancha frontal', zona: 'zona_media',
    imagen: '/ejercicios/plancha_frontal.jpg', video: null,
    descripcion: 'Apoyado en antebrazos y puntas, mantener el cuerpo alineado. Activa toda la musculatura del core.',
  },
  {
    id: 'plancha_lateral', nombre: 'Plancha lateral', zona: 'zona_media',
    imagen: '/ejercicios/plancha_lateral.jpg', video: null,
    descripcion: 'Apoyado en un antebrazo y el pie lateral, mantener el cuerpo alineado. Trabaja oblicuos y cuadrado lumbar.',
  },
  {
    id: 'crunch_abdominal', nombre: 'Crunch abdominal', zona: 'zona_media',
    imagen: '/ejercicios/crunch_abdominal.jpg', video: null,
    descripcion: 'Boca arriba, despegar levemente la cabeza y hombros del suelo. Activa el recto abdominal.',
  },
  // 🦶 PLANTA DEL PIE
  {
    id: 'rodar_pelota', nombre: 'Rodar pelota plantar', zona: 'planta_pie',
    imagen: '/ejercicios/rodar_pelota.jpg', video: null,
    descripcion: 'Con la pelota bajo la planta, hacer rodar suavemente toda la fascia. Libera la tensión plantar.',
  },
  {
    id: 'estiramiento_fascia', nombre: 'Estiramiento fascia plantar', zona: 'planta_pie',
    imagen: '/ejercicios/estiramiento_fascia.jpg', video: null,
    descripcion: 'Doblar los dedos del pie hacia atrás y sostener la posición. Estira la fascia plantar.',
  },
  {
    id: 'toalla_dedos', nombre: 'Arrugar toalla con los dedos', zona: 'planta_pie',
    imagen: '/ejercicios/toalla_dedos.jpg', video: null,
    descripcion: 'Con una toalla en el suelo, arrugarla con los dedos del pie. Fortalece la musculatura intrínseca del pie.',
  },
]

const ZONAS_LABEL = {
  tobillo: '🦶 Tobillo', rodilla: '🦵 Rodilla', cadera: '🍑 Cadera',
  lumbar: '🧠 Lumbar', hombro: '💪 Hombro', brazo: '💪 Brazo',
  cervical: '🔹 Cervical', zona_media: '🧱 Zona media', planta_pie: '🦶 Planta del pie',
}

const EJERCICIOS_POR_ZONA = EJERCICIOS_CATALOG.reduce((acc, ej) => {
  acc[ej.zona] = acc[ej.zona] || []
  acc[ej.zona].push(ej)
  return acc
}, {})

function getEjByNombre(nombre) {
  return EJERCICIOS_CATALOG.find(e => e.nombre === nombre) || null
}

function SessionViewModal({ evol, numero, ejerciciosList, onClose, onEdit }) {
  const tecnicas = evol.tecnicas_sesion ? (() => { try { return JSON.parse(evol.tecnicas_sesion) } catch { return [] } })() : []
  const ejData = parseEjSesion(evol.ejercicios_sesion)
  const ejerciciosNombres = ejData.map(ejd => {
    // Nuevo formato: {nombre}
    if (ejd.nombre) {
      const params = [ejd.series && `${ejd.series}s`, ejd.repeticiones && `${ejd.repeticiones}r`, ejd.segundos && `${ejd.segundos}"`].filter(Boolean).join(' ')
      return params ? `${ejd.nombre} (${params})` : ejd.nombre
    }
    // Formato viejo: {id} → lookup en lista de backend
    const ej = ejerciciosList.find(e => e.id === ejd.id)
    if (!ej) return null
    const nombre = ej.nombre.replace(/ — (CC|OA)$/, '')
    const params = [ejd.series && `${ejd.series}s`, ejd.repeticiones && `${ejd.repeticiones}r`, ejd.segundos && `${ejd.segundos}"`].filter(Boolean).join(' ')
    return params ? `${nombre} (${params})` : nombre
  }).filter(Boolean)

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 60 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 640, background: '#fff', borderRadius: 28, border: '1px solid #e2e8f0', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Sesión {numero}</h2>
            <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
              {new Date(evol.fecha + 'T12:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <button onClick={onClose} style={mc.iconBtn}>✕</button>
        </div>

        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ borderRadius: 16, background: '#f8fafc', padding: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>Dolor registrado</p>
              <p style={{ marginTop: 8, fontWeight: 700, fontSize: 18, color: '#0f172a' }}>{evol.dolor != null && evol.dolor !== '' ? `${evol.dolor}/10` : '—'}</p>
            </div>
            <div style={{ borderRadius: 16, background: '#f8fafc', padding: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>Cobro</p>
              <p style={{ marginTop: 8, fontWeight: 700, fontSize: 18, color: '#0f172a' }}>
                {evol.monto_cobrado > 0 ? `$${Number(evol.monto_cobrado).toLocaleString('es-AR')} ${evol.pagado ? '✓' : '⏳'}` : '—'}
              </p>
            </div>
          </div>

          {(tecnicas.length > 0 || ejerciciosNombres.length > 0) && (
            <div style={{ borderRadius: 16, border: '1px solid #e2e8f0', padding: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#64748b', marginBottom: 12 }}>Qué se realizó</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {tecnicas.map(t => <li key={t} style={{ fontSize: 14, color: '#334155' }}>• {t}</li>)}
                {ejerciciosNombres.map(e => <li key={e} style={{ fontSize: 14, color: '#334155' }}>• {e}</li>)}
              </ul>
            </div>
          )}

          {evol.notas && (
            <div style={{ borderRadius: 16, border: '1px solid #e2e8f0', padding: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#64748b', marginBottom: 8 }}>Notas</p>
              <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.6 }}>{evol.notas}</p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '16px 24px', borderTop: '1px solid #e2e8f0', flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: '11px 20px', borderRadius: 14, border: '1px solid #e2e8f0', background: '#fff', color: '#334155', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
            Cerrar
          </button>
          <button onClick={onEdit} style={{ ...mc.btnEmerald, padding: '11px 20px', fontSize: 14 }}>
            Editar sesión
          </button>
        </div>
      </div>
    </div>
  )
}

function RoutineViewModal({ routine, onClose, onEdit }) {
  const [expandedEj, setExpandedEj] = useState(null)
  const [zoomImg, setZoomImg] = useState(null)

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 60 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 680, background: '#fff', borderRadius: 28, border: '1px solid #e2e8f0', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>{routine.nombre}</h2>
            <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>{routine.resumen || ''}</p>
          </div>
          <button onClick={onClose} style={mc.iconBtn}>✕</button>
        </div>

        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ borderRadius: 16, border: '1px solid #e2e8f0', padding: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>Estado</p>
            <p style={{ marginTop: 8, fontWeight: 700, color: '#0f172a' }}>{routine.estado}</p>
          </div>

          {routine.ejercicios && routine.ejercicios.length > 0 && (
            <div style={{ borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#64748b', padding: '14px 16px', borderBottom: '1px solid #e2e8f0', margin: 0 }}>
                Ejercicios ({routine.ejercicios.length})
              </p>
              {routine.ejercicios.map((ej, i) => {
                const catalog = EJ_MAP[ej.exerciseId] || null
                const params = [
                  ej.series && ej.series !== 'No aplica' && `${ej.series} series`,
                  ej.reps && ej.reps !== 'No aplica' && `${ej.reps} reps`,
                  ej.seconds && ej.seconds !== 'No aplica' && `${ej.seconds} seg`,
                ].filter(Boolean).join(' · ')
                const isExpanded = expandedEj === i
                return (
                  <div key={i} style={{ borderBottom: i < routine.ejercicios.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                    <button
                      onClick={() => setExpandedEj(isExpanded ? null : i)}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
                    >
                      {catalog?.imagen && (
                        <img
                          src={catalog.imagen}
                          alt={catalog?.nombre}
                          style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover', background: '#f1f5f9', flexShrink: 0 }}
                          onError={e => { e.target.style.display = 'none' }}
                        />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: 14, color: '#0f172a', margin: 0 }}>{catalog?.nombre || ej.exerciseId}</p>
                        {params && <p style={{ fontSize: 13, color: '#64748b', margin: '3px 0 0' }}>{params}</p>}
                      </div>
                      <span style={{ fontSize: 12, color: '#94a3b8', flexShrink: 0 }}>{isExpanded ? '▴' : '▾'}</span>
                    </button>
                    {isExpanded && catalog && (
                      <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          {catalog.imagen && (
                            <img
                              src={catalog.imagen}
                              alt={`${catalog.nombre} A`}
                              onClick={() => setZoomImg(catalog.imagen)}
                              style={{ width: '100%', aspectRatio: '1', objectFit: 'contain', borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0', padding: 6, cursor: 'zoom-in' }}
                              onError={e => { e.target.style.display = 'none' }}
                            />
                          )}
                          {catalog.imagenB && (
                            <img
                              src={catalog.imagenB}
                              alt={`${catalog.nombre} B`}
                              onClick={() => setZoomImg(catalog.imagenB)}
                              style={{ width: '100%', aspectRatio: '1', objectFit: 'contain', borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0', padding: 6, cursor: 'zoom-in' }}
                              onError={e => { e.target.style.display = 'none' }}
                            />
                          )}
                        </div>
                        {params && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {ej.series && ej.series !== 'No aplica' && <span style={{ background: '#f1f5f9', color: '#475569', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600 }}>{ej.series} series</span>}
                            {ej.reps && ej.reps !== 'No aplica' && <span style={{ background: '#eff6ff', color: '#1d4ed8', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600 }}>{ej.reps} reps</span>}
                            {ej.seconds && ej.seconds !== 'No aplica' && <span style={{ background: '#f0fdf4', color: '#15803d', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600 }}>{ej.seconds} seg</span>}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {(routine.hielo?.min || routine.calor?.min || routine.contraste?.vecesAlDia) && (
            <div style={{ borderRadius: 16, border: '1px solid #e2e8f0', padding: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#64748b', marginBottom: 12 }}>Agentes físicos</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {routine.hielo?.min && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#eff6ff', color: '#1d4ed8', borderRadius: 20, padding: '6px 14px', fontSize: 13, fontWeight: 600 }}>
                    🧊 Hielo — {routine.hielo.min} min{routine.hielo.vecesAlDia ? ` · ${routine.hielo.vecesAlDia}x/día` : ''}
                  </span>
                )}
                {routine.calor?.min && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff7ed', color: '#c2410c', borderRadius: 20, padding: '6px 14px', fontSize: 13, fontWeight: 600 }}>
                    🔥 Calor — {routine.calor.min} min{routine.calor.vecesAlDia ? ` · ${routine.calor.vecesAlDia}x/día` : ''}
                  </span>
                )}
                {routine.contraste?.vecesAlDia && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f0fdf4', color: '#15803d', borderRadius: 20, padding: '6px 14px', fontSize: 13, fontWeight: 600 }}>
                    🌊 Contraste — {routine.contraste.vecesAlDia}x/día
                  </span>
                )}
              </div>
            </div>
          )}

          {routine.notas && (
            <div style={{ borderRadius: 16, border: '1px solid #e2e8f0', padding: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#64748b', marginBottom: 8 }}>Notas</p>
              <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.6 }}>{routine.notas}</p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '16px 24px', borderTop: '1px solid #e2e8f0', flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: '11px 20px', borderRadius: 14, border: '1px solid #e2e8f0', background: '#fff', color: '#334155', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
            Cerrar
          </button>
          <button onClick={onEdit} style={{ ...mc.btnBlue, padding: '11px 20px', fontSize: 14 }}>
            Editar rutina
          </button>
        </div>
      </div>

      {/* Popup chiquito de imagen */}
      {zoomImg && (
        <div onClick={() => setZoomImg(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 70, padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, padding: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.25)', maxWidth: 320, width: '100%', position: 'relative' }}>
            <button onClick={() => setZoomImg(null)} style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: '#f1f5f9', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            <img src={zoomImg} alt="ejercicio" style={{ width: '100%', borderRadius: 12, objectFit: 'contain', display: 'block' }} />
          </div>
        </div>
      )}
    </div>
  )
}

const rFld = { width: '100%', borderRadius: 12, border: '1px solid #e2e8f0', background: '#fff', padding: '10px 14px', color: '#0f172a', outline: 'none', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }
const REP_OPTIONS = ['No aplica', '5', '8', '10', '12', '15', '20']
const SEC_OPTIONS = ['No aplica', '10', '15', '20', '30', '45', '60']
const SERIES_OPTIONS = ['1', '2', '3', '4', '5']
// Mapa nombre → {nombre, imagen, grupo} construido desde exerciseLibrary
const EJ_MAP = Object.fromEntries(
  exerciseLibrary.flatMap(g => g.items.map(item => [
    item.name,
    { nombre: item.name, imagen: item.images[0], imagenB: item.images[1], grupo: g.title }
  ]))
)

function RoutineModalForm({ onClose, onSave, initialData }) {
  const init = initialData || {}
  // Normalizar ejercicios guardados (pueden no tener images si vienen de la DB)
  const initEjs = (init.ejercicios || []).map(e => ({
    key: e.key || Date.now() + Math.random(),
    exerciseId: e.exerciseId,
    images: e.images || EJ_MAP[e.exerciseId]?.imagen ? [EJ_MAP[e.exerciseId]?.imagen, EJ_MAP[e.exerciseId]?.imagenB] : ['', ''],
    reps: e.reps || '10',
    seconds: e.seconds || 'No aplica',
    series: e.series || '3',
  }))
  const [nombre, setNombre] = useState(init.nombre || '')
  const [estado, setEstado] = useState(init.estado || 'Activa')
  const [veces, setVeces] = useState(init.veces || 1)
  const [ejercicios, setEjercicios] = useState(initEjs)
  const [search, setSearch] = useState('')
  const [grupo, setGrupo] = useState('Todos')
  const [ice, setIce] = useState(init.hielo ? { enabled: true, minutes: init.hielo.min || '', timesPerDay: init.hielo.vecesAlDia || '' } : { enabled: false, minutes: '', timesPerDay: '' })
  const [heat, setHeat] = useState(init.calor ? { enabled: true, minutes: init.calor.min || '', timesPerDay: init.calor.vecesAlDia || '' } : { enabled: false, minutes: '', timesPerDay: '' })
  const [contrast, setContrast] = useState(init.contraste ? { enabled: true, timesPerDay: init.contraste.vecesAlDia || '' } : { enabled: false, timesPerDay: '' })
  const [notas, setNotas] = useState(init.notas || '')
  const [ejerciciosLibres, setEjerciciosLibres] = useState(init.ejercicios_libres || '')
  const [claudeDesc, setClaudeDesc] = useState('')
  const [claudeLoading, setClaudeLoading] = useState(false)
  const [claudeError, setClaudeError] = useState('')

  const allGroups = ['Todos', ...exerciseLibrary.map(g => g.title)]

  const filtered = exerciseLibrary
    .flatMap(g => g.items.map(item => ({ ...item, group: g.title })))
    .filter(item => {
      const matchGroup = grupo === 'Todos' || item.group === grupo
      const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase())
      return matchGroup && matchSearch
    })

  function addEjercicio(item) {
    if (ejercicios.find(e => e.exerciseId === item.name)) return
    setEjercicios(prev => [...prev, { key: Date.now(), exerciseId: item.name, images: item.images, reps: '10', seconds: 'No aplica', series: '3' }])
  }
  function updateEj(key, field, val) {
    setEjercicios(prev => prev.map(e => e.key === key ? { ...e, [field]: val } : e))
  }
  function removeEj(key) {
    setEjercicios(prev => prev.filter(e => e.key !== key))
  }

  async function generarConClaude() {
    if (!claudeDesc.trim()) return
    setClaudeLoading(true)
    setClaudeError('')
    try {
      const res = await api.claudeRutina(claudeDesc)
      if (res.texto) setEjerciciosLibres(res.texto)
      else setClaudeError('Sin respuesta de Claude')
    } catch {
      setClaudeError('Error al conectar con Claude')
    } finally {
      setClaudeLoading(false)
    }
  }

  function handleSave(e) {
    e.preventDefault()
    const resumen = [
      ejercicios.length > 0 && `${ejercicios.length} ejercicio${ejercicios.length !== 1 ? 's' : ''}`,
      ice.enabled && `hielo ${ice.minutes} min`,
      heat.enabled && `calor ${heat.minutes} min`,
    ].filter(Boolean).join(' + ')
    onSave({
      id: Date.now(),
      nombre: nombre || 'Rutina sin nombre',
      estado,
      veces: parseInt(veces) || 1,
      resumen,
      ejercicios,
      hielo: ice.enabled ? { min: ice.minutes, vecesAlDia: ice.timesPerDay } : null,
      calor: heat.enabled ? { min: heat.minutes, vecesAlDia: heat.timesPerDay } : null,
      contraste: contrast.enabled ? { vecesAlDia: contrast.timesPerDay } : null,
      notas,
      ejercicios_libres: ejerciciosLibres || null,
    })
  }

  const fld = { width: '100%', borderRadius: 16, border: '1px solid #e2e8f0', background: '#fff', padding: '12px 16px', color: '#0f172a', outline: 'none', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }
  const secTitle = { fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }
  const secSub = { fontSize: 14, color: '#64748b', marginTop: 4, marginBottom: 0 }
  const card = { borderRadius: 24, border: '1px solid #e2e8f0', background: '#fff', padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }
  const pillBtn = (active) => ({
    padding: '7px 16px', borderRadius: 100, border: '1px solid ' + (active ? '#0ea5e9' : '#e2e8f0'),
    background: active ? '#0ea5e9' : '#fff', color: active ? '#fff' : '#475569',
    fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
  })

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 60 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 1200, background: '#f8fafc', borderRadius: 32, border: '1px solid #e2e8f0', boxShadow: '0 24px 80px rgba(0,0,0,0.18)', maxHeight: '94vh', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px 28px', borderBottom: '1px solid #e2e8f0', background: '#fff', borderRadius: '32px 32px 0 0', flexShrink: 0 }}>
          <div>
            <span style={{ display: 'inline-block', background: '#ecfdf5', color: '#059669', fontWeight: 600, fontSize: 12, padding: '4px 12px', borderRadius: 100 }}>Rutina domiciliaria</span>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginTop: 10, marginBottom: 4 }}>{initialData ? 'Editar rutina' : 'Nueva rutina'}</h2>
            <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>Armá la rutina con ejercicios de tu biblioteca y agentes físicos claros para el paciente.</p>
          </div>
          <button onClick={onClose} style={{ ...mc.iconBtn, marginTop: 4 }}>✕</button>
        </div>

        {/* Body */}
        <form id="form-rutina" onSubmit={handleSave} style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          <div className="rm-layout">

            {/* Columna izquierda */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Datos generales */}
              <div style={card}>
                <p style={secTitle}>Datos generales</p>
                <p style={secSub}>Nombre de la rutina y estado actual.</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 140px', gap: 14, marginTop: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 8 }}>Nombre de la rutina</label>
                    <input style={fld} placeholder="Ej: Rutina tobillo fase 1" value={nombre} onChange={e => setNombre(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 8 }}>Repetir rutina</label>
                    <div style={{ position: 'relative' }}>
                      <input type="number" min="1" max="30" style={fld} value={veces} onChange={e => setVeces(e.target.value)} />
                      <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#94a3b8', pointerEvents: 'none' }}>veces</span>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 8 }}>Estado</label>
                    <select style={fld} value={estado} onChange={e => setEstado(e.target.value)}>
                      <option>Activa</option>
                      <option>Inactiva</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Biblioteca */}
              <div style={card}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <p style={secTitle}>Biblioteca de ejercicios</p>
                    <p style={secSub}>Elegí y agregá ejercicios a la rutina.</p>
                  </div>
                  <span style={{ background: '#f1f5f9', color: '#475569', fontWeight: 500, fontSize: 13, padding: '8px 14px', borderRadius: 14, flexShrink: 0 }}>{filtered.length} resultados</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 10, marginTop: 16 }}>
                  <input style={fld} placeholder="Buscar ejercicio..." value={search} onChange={e => setSearch(e.target.value)} />
                  <select style={fld} value={grupo} onChange={e => setGrupo(e.target.value)}>
                    {allGroups.map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
                  {allGroups.map(g => (
                    <button key={g} type="button" style={pillBtn(grupo === g)} onClick={() => setGrupo(g)}>{g}</button>
                  ))}
                </div>
                <div className="rm-lib-grid" style={{ marginTop: 16, maxHeight: 430, overflowY: 'auto', paddingRight: 4 }}>
                  {filtered.map(item => {
                    const added = ejercicios.some(e => e.exerciseId === item.name)
                    return (
                      <div key={item.name} style={{ borderRadius: 22, border: '1px solid #e2e8f0', background: '#f8fafc', padding: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                          <div>
                            <p style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', margin: 0, lineHeight: 1.3 }}>{item.name}</p>
                            <p style={{ fontSize: 12, color: '#64748b', margin: '3px 0 0' }}>{item.group}</p>
                          </div>
                          <span style={{ background: '#eff6ff', color: '#2563eb', fontWeight: 600, fontSize: 11, padding: '3px 8px', borderRadius: 100, flexShrink: 0 }}>2 fotos</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 10 }}>
                          <img src={item.images[0]} alt={item.name + ' A'} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'contain', borderRadius: 12, border: '1px solid #e2e8f0', background: '#fff', padding: 4 }} loading="lazy" />
                          <img src={item.images[1]} alt={item.name + ' B'} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'contain', borderRadius: 12, border: '1px solid #e2e8f0', background: '#fff', padding: 4 }} loading="lazy" />
                        </div>
                        <button type="button" onClick={() => addEjercicio(item)} disabled={added}
                          style={{ marginTop: 10, width: '100%', padding: '10px 0', borderRadius: 14, border: 'none', fontWeight: 600, fontSize: 13, cursor: added ? 'default' : 'pointer', fontFamily: 'inherit', background: added ? '#d1fae5' : '#059669', color: added ? '#059669' : '#fff', transition: 'all 0.15s' }}>
                          {added ? '✓ Agregado' : 'Agregar a la rutina'}
                        </button>
                      </div>
                    )
                  })}
                  {filtered.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '32px 0', color: '#94a3b8', fontSize: 14 }}>Sin resultados</div>
                  )}
                </div>
              </div>

              {/* Agentes físicos */}
              <div style={card}>
                <p style={secTitle}>Agentes físicos</p>
                <p style={secSub}>Indicaciones domiciliarias con tiempos y cantidad de veces al día.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 16 }}>
                  {/* Hielo */}
                  <div style={{ borderRadius: 20, border: '1px solid #e2e8f0', background: '#f8fafc', padding: 16 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600, color: '#1e293b', cursor: 'pointer' }}>
                      <input type="checkbox" checked={ice.enabled} onChange={() => setIce(v => ({ ...v, enabled: !v.enabled }))} style={{ width: 17, height: 17 }} />
                      Hielo
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                      <input type="number" min="0" placeholder="Minutos" disabled={!ice.enabled} value={ice.minutes} onChange={e => setIce(v => ({ ...v, minutes: e.target.value }))}
                        style={{ ...fld, background: ice.enabled ? '#fff' : '#f1f5f9', color: ice.enabled ? '#0f172a' : '#94a3b8' }} />
                      <input type="number" min="0" placeholder="Veces al día" disabled={!ice.enabled} value={ice.timesPerDay} onChange={e => setIce(v => ({ ...v, timesPerDay: e.target.value }))}
                        style={{ ...fld, background: ice.enabled ? '#fff' : '#f1f5f9', color: ice.enabled ? '#0f172a' : '#94a3b8' }} />
                    </div>
                  </div>
                  {/* Calor */}
                  <div style={{ borderRadius: 20, border: '1px solid #e2e8f0', background: '#f8fafc', padding: 16 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600, color: '#1e293b', cursor: 'pointer' }}>
                      <input type="checkbox" checked={heat.enabled} onChange={() => setHeat(v => ({ ...v, enabled: !v.enabled }))} style={{ width: 17, height: 17 }} />
                      Calor
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                      <input type="number" min="0" placeholder="Minutos" disabled={!heat.enabled} value={heat.minutes} onChange={e => setHeat(v => ({ ...v, minutes: e.target.value }))}
                        style={{ ...fld, background: heat.enabled ? '#fff' : '#f1f5f9', color: heat.enabled ? '#0f172a' : '#94a3b8' }} />
                      <input type="number" min="0" placeholder="Veces al día" disabled={!heat.enabled} value={heat.timesPerDay} onChange={e => setHeat(v => ({ ...v, timesPerDay: e.target.value }))}
                        style={{ ...fld, background: heat.enabled ? '#fff' : '#f1f5f9', color: heat.enabled ? '#0f172a' : '#94a3b8' }} />
                    </div>
                  </div>
                  {/* Contraste */}
                  <div style={{ borderRadius: 20, border: '1px solid #e2e8f0', background: '#f8fafc', padding: 16 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600, color: '#1e293b', cursor: 'pointer' }}>
                      <input type="checkbox" checked={contrast.enabled} onChange={() => setContrast(v => ({ ...v, enabled: !v.enabled }))} style={{ width: 17, height: 17 }} />
                      Baño de contraste
                    </label>
                    <div style={{ borderRadius: 12, border: '1px solid #e2e8f0', background: '#fff', padding: '10px 12px', marginTop: 12, fontSize: 12, color: '#475569', lineHeight: 1.6 }}>
                      1 min frío → 3 min calor → 1 min frío → 3 min calor → 1 min frío → 3 min calor → 1 min frío
                    </div>
                    <input type="number" min="0" placeholder="Veces al día" disabled={!contrast.enabled} value={contrast.timesPerDay} onChange={e => setContrast(v => ({ ...v, timesPerDay: e.target.value }))}
                      style={{ ...fld, marginTop: 8, background: contrast.enabled ? '#fff' : '#f1f5f9', color: contrast.enabled ? '#0f172a' : '#94a3b8' }} />
                  </div>
                </div>
              </div>

              {/* Notas */}
              <div style={card}>
                <p style={secTitle}>Notas</p>
                <p style={secSub}>Indicaciones generales para el paciente.</p>
                <textarea rows={4} placeholder="Ej: realizar 4 veces por semana, no superar dolor 4/10, suspender si aumenta la inflamación..."
                  style={{ ...fld, marginTop: 14, resize: 'none', lineHeight: 1.5 }}
                  value={notas} onChange={e => setNotas(e.target.value)} />
              </div>

              {/* Ejercicios con Claude */}
              <div style={card}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 4 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>✦</div>
                  <div>
                    <p style={secTitle}>Ejercicios con Claude</p>
                    <p style={secSub}>Describí los ejercicios que querés incluir y Claude los formatea en una rutina prolija para el paciente.</p>
                  </div>
                </div>
                <div style={{ marginTop: 16, display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                  <textarea rows={3} placeholder="Ej: ejercicios de propiocepción para tobillo, 3 series cada uno, incluir trabajo en una pierna y en tabla inestable"
                    style={{ ...fld, flex: 1, resize: 'none', lineHeight: 1.5 }}
                    value={claudeDesc} onChange={e => setClaudeDesc(e.target.value)} />
                  <button type="button" onClick={generarConClaude} disabled={claudeLoading || !claudeDesc.trim()}
                    style={{ padding: '12px 20px', borderRadius: 16, border: 'none', background: claudeLoading || !claudeDesc.trim() ? '#e2e8f0' : '#059669', color: claudeLoading || !claudeDesc.trim() ? '#94a3b8' : '#fff', fontWeight: 600, fontSize: 14, cursor: claudeLoading || !claudeDesc.trim() ? 'default' : 'pointer', fontFamily: 'inherit', flexShrink: 0, minWidth: 120 }}>
                    {claudeLoading ? 'Generando...' : 'Generar'}
                  </button>
                </div>
                {claudeError && <p style={{ fontSize: 13, color: '#ef4444', marginTop: 8 }}>{claudeError}</p>}
                {ejerciciosLibres && (
                  <div style={{ marginTop: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#059669' }}>Rutina generada</span>
                      <button type="button" onClick={() => setEjerciciosLibres('')} style={{ background: 'none', border: 'none', fontSize: 12, color: '#94a3b8', cursor: 'pointer', fontFamily: 'inherit' }}>Eliminar</button>
                    </div>
                    <textarea rows={8} style={{ ...fld, resize: 'vertical', lineHeight: 1.6, background: '#f0fdf4', borderColor: '#bbf7d0' }}
                      value={ejerciciosLibres} onChange={e => setEjerciciosLibres(e.target.value)} />
                  </div>
                )}
              </div>
            </div>

            {/* Columna derecha — resumen */}
            <aside style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ ...card, position: 'sticky', top: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                  <div>
                    <p style={secTitle}>Resumen de la rutina</p>
                    <p style={secSub}>Lo que va a ver el paciente.</p>
                  </div>
                  <span style={{ background: '#ecfdf5', color: '#059669', fontWeight: 600, fontSize: 12, padding: '4px 12px', borderRadius: 100, flexShrink: 0 }}>{ejercicios.length} ejercicios</span>
                </div>

                {ejercicios.length === 0 ? (
                  <div style={{ marginTop: 20, borderRadius: 20, border: '2px dashed #cbd5e1', background: '#f8fafc', padding: '32px 20px', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
                    Todavía no agregaste ejercicios a la rutina.
                  </div>
                ) : (
                  <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 14, maxHeight: 560, overflowY: 'auto', paddingRight: 4 }}>
                    {ejercicios.map((item, i) => (
                      <div key={item.key} style={{ borderRadius: 22, border: '1px solid #e2e8f0', background: '#f8fafc', padding: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
                          <p style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', margin: 0 }}>{i + 1}. {item.exerciseId}</p>
                          <button type="button" onClick={() => removeEj(item.key)}
                            style={{ padding: '5px 12px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
                            Quitar
                          </button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 12 }}>
                          <img src={item.images[0]} alt={item.exerciseId + ' A'} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'contain', borderRadius: 12, border: '1px solid #e2e8f0', background: '#fff', padding: 4 }} loading="lazy" />
                          <img src={item.images[1]} alt={item.exerciseId + ' B'} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'contain', borderRadius: 12, border: '1px solid #e2e8f0', background: '#fff', padding: 4 }} loading="lazy" />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                          {[
                            { label: 'Repeticiones', field: 'reps', val: item.reps, opts: REP_OPTIONS },
                            { label: 'Segundos', field: 'seconds', val: item.seconds, opts: SEC_OPTIONS },
                            { label: 'Series', field: 'series', val: item.series, opts: SERIES_OPTIONS },
                          ].map(({ label, field, val, opts }) => (
                            <div key={field}>
                              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#94a3b8', marginBottom: 6 }}>{label}</label>
                              <select style={{ ...fld, padding: '10px 12px', fontSize: 13 }} value={val} onChange={e => updateEj(item.key, field, e.target.value)}>
                                {opts.map(o => <option key={o}>{o}</option>)}
                              </select>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </aside>

          </div>
        </form>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '16px 28px', borderTop: '1px solid #e2e8f0', background: '#fff', borderRadius: '0 0 32px 32px', flexShrink: 0 }}>
          <button type="button" onClick={onClose} style={{ padding: '12px 22px', borderRadius: 16, border: '1px solid #e2e8f0', background: '#fff', color: '#334155', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
            Cancelar
          </button>
          <button type="submit" form="form-rutina" style={{ ...mc.btnEmerald, padding: '12px 24px', fontSize: 14, borderRadius: 16 }}>
            Guardar rutina
          </button>
        </div>
      </div>
    </div>
  )
}

function MotivoCard({ motivo, onUpdated }) {
  const [open, setOpen] = useState(true)
  const [evoluciones, setEvoluciones] = useState([])
  const [estudios, setEstudios] = useState([])
  const [loadingEvol, setLoadingEvol] = useState(false)
  const [modalEvol, setModalEvol] = useState(false)
  const [formEvol, setFormEvol] = useState(EVOL_EMPTY)
  const [editEvolId, setEditEvolId] = useState(null)
  const [modalEstudio, setModalEstudio] = useState(false)
  const [archivoEstudio, setArchivoEstudio] = useState(null)
  const [nombreEstudio, setNombreEstudio] = useState('')
  const [modalEditMotivo, setModalEditMotivo] = useState(false)
  const [formMotivo, setFormMotivo] = useState({ ...motivo, afloja_dia: !!motivo.afloja_dia })
  const [ejercicios, setEjercicios] = useState([])
  const [selectedEvol, setSelectedEvol] = useState(null)
  const [routines, setRoutines] = useState([])
  const [selectedRoutine, setSelectedRoutine] = useState(null)
  const [showRoutineModal, setShowRoutineModal] = useState(false)
  const [editingRoutine, setEditingRoutine] = useState(null)  // rutina a editar

  useEffect(() => {
    cargarDetalle()
    api.getEjercicios().then(setEjercicios).catch(() => {})
  }, [])

  async function cargarDetalle() {
    setLoadingEvol(true)
    try {
      const [evols, ests, ejs, ruts] = await Promise.all([
        api.getEvoluciones(motivo.id),
        api.getEstudios(motivo.id),
        api.getEjercicios(),
        api.getRutinas(motivo.id),
      ])
      setEvoluciones(evols)
      setEstudios(ests)
      setEjercicios(ejs)
      setRoutines(ruts)
    } finally { setLoadingEvol(false) }
  }

  async function guardarRutina(data) {
    try {
      if (editingRoutine) {
        const updated = await api.updateRutina(editingRoutine.id, data)
        setRoutines(prev => prev.map(r => r.id === updated.id ? updated : r))
        if (selectedRoutine?.id === updated.id) setSelectedRoutine(updated)
      } else {
        const created = await api.createRutina(motivo.id, data)
        setRoutines(prev => [created, ...prev])
      }
    } catch (e) { alert('Error al guardar rutina: ' + e.message) }
    setShowRoutineModal(false)
    setEditingRoutine(null)
  }

  async function guardarEvol(e) {
    e.preventDefault()
    const data = {
      ...formEvol,
      tecnicas_sesion: JSON.stringify(formEvol.tecnicas_sesion || []),
      ejercicios_sesion: JSON.stringify(formEvol.ejercicios_sesion || []),
      pagado: formEvol.pagado ? 1 : 0
    }
    if (editEvolId) await api.updateEvolucion(editEvolId, data)
    else await api.createEvolucion(motivo.id, data)
    setModalEvol(false)
    setEvoluciones(await api.getEvoluciones(motivo.id))
    onUpdated()
  }

  function abrirNuevaEvol() {
    setFormEvol({ ...EVOL_EMPTY, tecnicas_sesion: [], ejercicios_sesion: [], monto_cobrado: motivo.monto_sesion || '' })
    setEditEvolId(null)
    setModalEvol(true)
  }

  function abrirEditarEvol(ev) {
    setFormEvol({
      fecha: ev.fecha,
      notas: ev.notas || '',
      dolor: ev.dolor ?? '',
      tecnicas: ev.tecnicas || '',
      monto_cobrado: ev.monto_cobrado || '',
      pagado: !!ev.pagado,
      tecnicas_sesion: ev.tecnicas_sesion ? JSON.parse(ev.tecnicas_sesion) : [],
      ejercicios_sesion: parseEjSesion(ev.ejercicios_sesion),
    })
    setEditEvolId(ev.id)
    setModalEvol(true)
  }

  async function eliminarEvol(id) {
    if (!confirm('¿Eliminar esta sesión?')) return
    await api.deleteEvolucion(id)
    setEvoluciones(await api.getEvoluciones(motivo.id))
    onUpdated()
  }

  async function subirEstudio(e) {
    e.preventDefault()
    if (!archivoEstudio) return
    const fd = new FormData()
    fd.append('archivo', archivoEstudio)
    fd.append('nombre', nombreEstudio || archivoEstudio.name)
    fd.append('tipo', archivoEstudio.type.startsWith('image') ? 'imagen' : 'documento')
    await api.uploadEstudio(motivo.id, fd)
    setModalEstudio(false)
    setArchivoEstudio(null)
    setNombreEstudio('')
    setEstudios(await api.getEstudios(motivo.id))
  }

  async function eliminarEstudio(id) {
    if (!confirm('¿Eliminar estudio?')) return
    await api.deleteEstudio(id)
    setEstudios(await api.getEstudios(motivo.id))
  }

  async function guardarMotivo(e) {
    e.preventDefault()
    await api.updateMotivo(motivo.id, { ...formMotivo, afloja_dia: formMotivo.afloja_dia ? 1 : 0 })
    setModalEditMotivo(false)
    onUpdated()
  }

  async function eliminarMotivo() {
    if (!confirm('¿Eliminar este motivo y toda su historia?')) return
    await api.deleteMotivo(motivo.id)
    onUpdated()
  }

  const chartData = [...evoluciones].reverse().filter(e => e.dolor != null).map(e => ({ fecha: e.fecha, dolor: e.dolor }))

  function getSesionResumen(ev) {
    const tecnicas = ev.tecnicas_sesion ? (() => { try { return JSON.parse(ev.tecnicas_sesion) } catch { return [] } })() : []
    if (ev.notas) return ev.notas.length > 70 ? ev.notas.slice(0, 70) + '…' : ev.notas
    if (tecnicas.length > 0) return tecnicas.slice(0, 3).join(' + ')
    return 'Sin descripción'
  }

  return (
    <div style={mc.card}>
      {/* ── Header ─────────────────────────────────── */}
      <div style={{ borderBottom: '1px solid #e2e8f0', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flex: 1, minWidth: 0 }}>
            <div style={{ marginTop: 10, width: 14, height: 14, borderRadius: '50%', background: motivo.estado === 'activo' ? '#10b981' : motivo.estado === 'resuelto' ? '#94a3b8' : '#f59e0b', flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0 }}>{motivo.sintoma}</h2>
                <span style={mc.pill(motivo.estado === 'activo')}>
                  {motivo.estado === 'activo' ? 'Activo' : motivo.estado === 'resuelto' ? 'Resuelto' : 'Derivado'}
                </span>
              </div>
              <p style={{ marginTop: 8, fontSize: 15, color: '#64748b' }}>
                {motivo.total_evoluciones} sesión{motivo.total_evoluciones !== 1 ? 'es' : ''} registradas
                {motivo.saldo_pendiente > 0 && <span style={{ color: '#ef4444' }}> · Debe ${Number(motivo.saldo_pendiente).toLocaleString('es-AR')}</span>}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <button onClick={() => { setFormMotivo({ ...motivo, afloja_dia: !!motivo.afloja_dia }); setModalEditMotivo(true) }} style={mc.iconBtn} title="Editar">✎</button>
            <button onClick={eliminarMotivo} style={mc.iconBtn} title="Eliminar">⌫</button>
            <button onClick={() => setOpen(o => !o)} style={mc.iconBtn} title={open ? 'Colapsar' : 'Expandir'}>{open ? '▴' : '▾'}</button>
          </div>
        </div>

        {/* Stats pills */}
        <div className="mc-stats-grid">
          {[
            ['Evolución', motivo.aparicion || '—'],
            ['Momento del dolor', motivo.momento_dia || '—'],
            ['Grado', motivo.grado || 'No aplica'],
            ['Monto por sesión', motivo.monto_sesion ? `$${Number(motivo.monto_sesion).toLocaleString('es-AR')}` : '—'],
            ['Estado', motivo.estado === 'activo' ? 'Activo' : motivo.estado === 'resuelto' ? 'Resuelto' : 'Derivado'],
          ].map(([label, value]) => (
            <div key={label} style={{ borderRadius: 16, background: '#f8fafc', padding: '14px 12px', textAlign: 'center' }}>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', margin: 0 }}>{label}</p>
              <p style={{ marginTop: 8, fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '8px 0 0' }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {open && (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 32 }}>

          {/* ── Estudios ─────────────────────────── */}
          <section>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
              <div>
                <p style={mc.sectionTitle}>Estudios</p>
                <p style={mc.sectionSub}>Adjuntos y resultados del paciente</p>
              </div>
              <button onClick={() => setModalEstudio(true)} style={mc.btnEmerald}>+ Subir estudio</button>
            </div>
            {estudios.length === 0 ? (
              <div style={mc.emptyBox}>
                <p style={{ fontSize: 16, fontWeight: 500, color: '#64748b', margin: 0 }}>Sin estudios cargados</p>
                <p style={{ fontSize: 14, color: '#94a3b8', marginTop: 8, marginBottom: 0 }}>Podés subir imágenes, informes o archivos PDF.</p>
              </div>
            ) : (
              <div className="estudios-grid">
                {estudios.map(est => (
                  <div key={est.id} className="estudio-item">
                    {est.tipo === 'imagen'
                      ? <img src={`/uploads/${est.archivo}`} alt={est.nombre} className="estudio-img" onClick={() => window.open(`/uploads/${est.archivo}`)} />
                      : <a href={`/api/kine/estudios/${est.id}/descargar`} className="estudio-doc">📄 {est.nombre}</a>
                    }
                    <div className="estudio-nombre">{est.nombre}</div>
                    <button className="kine-btn-icon-sm danger estudio-del" onClick={() => eliminarEstudio(est.id)}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── Sesiones ─────────────────────────── */}
          <section>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
              <div>
                <p style={mc.sectionTitle}>Sesiones ({evoluciones.length})</p>
                <p style={mc.sectionSub}>Historial de atención y seguimiento</p>
              </div>
              <button onClick={abrirNuevaEvol} style={mc.btnEmerald}>+ Nueva sesión</button>
            </div>

            {chartData.length > 1 && (
              <div style={{ marginBottom: 16 }} className="evol-chart">
                <ResponsiveContainer width="100%" height={100}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="fecha" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="dolor" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {loadingEvol ? (
              <div className="kine-loading">Cargando...</div>
            ) : evoluciones.length === 0 ? (
              <div style={mc.emptyBox}>
                <p style={{ fontSize: 16, fontWeight: 500, color: '#64748b', margin: 0 }}>Sin sesiones registradas</p>
                <p style={{ fontSize: 14, color: '#94a3b8', marginTop: 8, marginBottom: 0 }}>Registrá la primera sesión con el botón de arriba.</p>
              </div>
            ) : (
              <div className="mc-sessions-grid">
                {evoluciones.map((ev, i) => (
                  <button key={ev.id} onClick={() => setSelectedEvol(ev)} className="mc-session-card">
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: 16, color: '#0f172a', margin: 0 }}>Sesión {evoluciones.length - i}</p>
                        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4, marginBottom: 0 }}>
                          {new Date(ev.fecha + 'T12:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <span style={ev.monto_cobrado > 0 ? mc.pill(ev.pagado) : mc.pill(false)}>
                        {ev.monto_cobrado > 0 ? (ev.pagado ? 'Pagado' : 'Pendiente') : 'Sin cobro'}
                      </span>
                    </div>
                    <p style={{ marginTop: 14, fontSize: 13, color: '#334155', lineHeight: 1.5 }}>{getSesionResumen(ev)}</p>
                    {ev.dolor != null && ev.dolor !== '' && (
                      <p style={{ marginTop: 8, fontSize: 12, color: '#94a3b8' }}>Dolor: {ev.dolor}/10</p>
                    )}
                    <p style={{ marginTop: 12, fontSize: 13, fontWeight: 600, color: '#059669' }}>Ver detalle</p>
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* ── Rutinas ──────────────────────────── */}
          <section>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
              <div>
                <p style={mc.sectionTitle}>Rutinas</p>
                <p style={mc.sectionSub}>Indicaciones domiciliarias y seguimiento</p>
              </div>
              <button onClick={() => setShowRoutineModal(true)} style={mc.btnBlue}>+ Nueva rutina</button>
            </div>

            {routines.length === 0 ? (
              <div style={mc.emptyBox}>
                <p style={{ fontSize: 16, fontWeight: 500, color: '#64748b', margin: 0 }}>Sin rutinas creadas</p>
                <p style={{ fontSize: 14, color: '#94a3b8', marginTop: 8, marginBottom: 0 }}>Creá una rutina domiciliaria para el paciente.</p>
              </div>
            ) : (() => {
              const activas   = routines.filter(r => r.estado === 'Activa')
              const inactivas = routines.filter(r => r.estado !== 'Activa')
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                  {/* Activas */}
                  {activas.length > 0 && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', flexShrink: 0, display: 'inline-block' }} />
                        <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#059669' }}>
                          Activas ({activas.length})
                        </span>
                      </div>
                      <div className="mc-routines-grid">
                        {activas.map(r => (
                          <button key={r.id} onClick={() => setSelectedRoutine(r)} style={{
                            width: '100%', textAlign: 'left', borderRadius: 24, border: '1px solid #a7f3d0',
                            background: 'linear-gradient(135deg, #f0fdf4 0%, #fff 100%)',
                            padding: 20, cursor: 'pointer', fontFamily: 'inherit',
                            transition: 'transform 0.15s, box-shadow 0.15s',
                            boxShadow: '0 1px 4px rgba(16,185,129,0.08)',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                              <p style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', margin: 0, lineHeight: 1.3 }}>{r.nombre}</p>
                              <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: '#d1fae5', color: '#059669' }}>Activa</span>
                            </div>
                            {r.resumen && <p style={{ fontSize: 13, color: '#475569', marginTop: 6, marginBottom: 0 }}>{r.resumen}</p>}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 14 }}>
                              <span style={{ fontSize: 13, fontWeight: 600, color: '#059669' }}>Ver rutina →</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Inactivas */}
                  {inactivas.length > 0 && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#94a3b8', flexShrink: 0, display: 'inline-block' }} />
                        <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#94a3b8' }}>
                          Anteriores ({inactivas.length})
                        </span>
                      </div>
                      <div className="mc-routines-grid">
                        {inactivas.map(r => (
                          <button key={r.id} onClick={() => setSelectedRoutine(r)} style={{
                            width: '100%', textAlign: 'left', borderRadius: 24, border: '1px solid #e2e8f0',
                            background: '#f8fafc', padding: 20, cursor: 'pointer', fontFamily: 'inherit',
                            transition: 'transform 0.15s, box-shadow 0.15s',
                            opacity: 0.85,
                          }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                              <p style={{ fontWeight: 600, fontSize: 15, color: '#475569', margin: 0, lineHeight: 1.3 }}>{r.nombre}</p>
                              <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100, background: '#f1f5f9', color: '#64748b' }}>Inactiva</span>
                            </div>
                            {r.resumen && <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 6, marginBottom: 0 }}>{r.resumen}</p>}
                            <p style={{ fontSize: 13, fontWeight: 500, color: '#94a3b8', marginTop: 14, marginBottom: 0 }}>Ver →</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )
            })()}
          </section>
        </div>
      )}

      {/* Session view modal */}
      {selectedEvol && (
        <SessionViewModal
          evol={selectedEvol}
          numero={evoluciones.length - evoluciones.indexOf(selectedEvol)}
          ejerciciosList={ejercicios}
          onClose={() => setSelectedEvol(null)}
          onEdit={() => { setSelectedEvol(null); abrirEditarEvol(selectedEvol) }}
        />
      )}

      {/* Routine view modal */}
      {selectedRoutine && (
        <ModalErrorBoundary onClose={() => setSelectedRoutine(null)}>
          <RoutineViewModal
            routine={selectedRoutine}
            onClose={() => setSelectedRoutine(null)}
            onEdit={() => { setEditingRoutine(selectedRoutine); setSelectedRoutine(null); setShowRoutineModal(true) }}
          />
        </ModalErrorBoundary>
      )}

      {/* Routine create/edit modal */}
      {showRoutineModal && (
        <RoutineModalForm
          onClose={() => { setShowRoutineModal(false); setEditingRoutine(null) }}
          onSave={guardarRutina}
          initialData={editingRoutine}
        />
      )}

      {/* Modal editar motivo */}
      <Modal open={modalEditMotivo} onClose={() => setModalEditMotivo(false)} titulo="Editar motivo de consulta">
        <form className="kine-form" onSubmit={guardarMotivo}>
          <label>Síntoma *<input required value={formMotivo.sintoma} onChange={e => setFormMotivo(f => ({ ...f, sintoma: e.target.value }))} /></label>
          <label>Aparición del síntoma<input value={formMotivo.aparicion || ''} onChange={e => setFormMotivo(f => ({ ...f, aparicion: e.target.value }))} placeholder="¿Cuándo empezó?" /></label>
          <label>Momento del día que duele<input value={formMotivo.momento_dia || ''} onChange={e => setFormMotivo(f => ({ ...f, momento_dia: e.target.value }))} placeholder="Ej: Por la mañana, al levantarse..." /></label>
          <label>Movimientos que duelen<textarea rows={2} value={formMotivo.movimientos || ''} onChange={e => setFormMotivo(f => ({ ...f, movimientos: e.target.value }))} /></label>
          <div className="kine-form-row">
            <label className="kine-form-check">
              <input type="checkbox" checked={!!formMotivo.afloja_dia} onChange={e => setFormMotivo(f => ({ ...f, afloja_dia: e.target.checked }))} />
              Afloja con el paso del día
            </label>
            <label>Monto por sesión ($)<input type="number" min="0" step="100" value={formMotivo.monto_sesion || ''} onChange={e => setFormMotivo(f => ({ ...f, monto_sesion: e.target.value }))} /></label>
          </div>
          <label>Estado
            <select value={formMotivo.estado} onChange={e => setFormMotivo(f => ({ ...f, estado: e.target.value }))}>
              <option value="activo">Activo</option>
              <option value="resuelto">Resuelto</option>
              <option value="derivado">Derivado</option>
            </select>
          </label>
          <div className="kine-form-footer">
            <button type="button" className="kine-btn-secondary" onClick={() => setModalEditMotivo(false)}>Cancelar</button>
            <button type="submit" className="kine-btn-primary">Guardar</button>
          </div>
        </form>
      </Modal>

      {/* Modal nueva/editar evolución */}
      <Modal open={modalEvol} onClose={() => setModalEvol(false)} titulo={editEvolId ? 'Editar sesión' : 'Nueva sesión'}>
        <form className="kine-form" onSubmit={guardarEvol}>
          <div className="kine-form-row">
            <label>Fecha *<input type="date" required value={formEvol.fecha} onChange={e => setFormEvol(f => ({ ...f, fecha: e.target.value }))} /></label>
            <label>Dolor (0-10)<input type="number" min="0" max="10" value={formEvol.dolor} onChange={e => setFormEvol(f => ({ ...f, dolor: e.target.value }))} placeholder="0-10" /></label>
          </div>

          <label>Técnicas de la sesión
            <div className="kine-checkbox-group">
              {TECNICAS_OPCIONES.map(tec => (
                <label key={tec} className="kine-checkbox-item">
                  <input
                    type="checkbox"
                    checked={formEvol.tecnicas_sesion?.includes(tec)}
                    onChange={e => {
                      const current = formEvol.tecnicas_sesion || []
                      const updated = e.target.checked
                        ? [...current, tec]
                        : current.filter(t => t !== tec)
                      setFormEvol(f => ({ ...f, tecnicas_sesion: updated }))
                    }}
                  />
                  {tec}
                </label>
              ))}
            </div>
          </label>

          <label>Notas de la sesión<textarea rows={3} value={formEvol.notas} onChange={e => setFormEvol(f => ({ ...f, notas: e.target.value }))} /></label>
          <div className="kine-form-row">
            <label>Monto cobrado ($)<input type="number" min="0" step="100" value={formEvol.monto_cobrado} onChange={e => setFormEvol(f => ({ ...f, monto_cobrado: e.target.value }))} /></label>
            <label className="kine-form-check" style={{ justifyContent: 'flex-end', paddingTop: '1.5rem' }}>
              <input type="checkbox" checked={!!formEvol.pagado} onChange={e => setFormEvol(f => ({ ...f, pagado: e.target.checked }))} />
              Cobrado
            </label>
          </div>
          <div className="kine-form-footer">
            <button type="button" className="kine-btn-secondary" onClick={() => setModalEvol(false)}>Cancelar</button>
            <button type="submit" className="kine-btn-primary">{editEvolId ? 'Guardar' : 'Registrar sesión'}</button>
          </div>
        </form>
      </Modal>

      {/* Modal subir estudio */}
      <Modal open={modalEstudio} onClose={() => setModalEstudio(false)} titulo="Subir estudio">
        <form className="kine-form" onSubmit={subirEstudio}>
          <label>Archivo *<input type="file" required onChange={e => setArchivoEstudio(e.target.files[0])} accept="image/*,.pdf,.doc,.docx" /></label>
          <label>Nombre (opcional)<input value={nombreEstudio} onChange={e => setNombreEstudio(e.target.value)} placeholder="Ej: Radiografía rodilla derecha" /></label>
          <div className="kine-form-footer">
            <button type="button" className="kine-btn-secondary" onClick={() => setModalEstudio(false)}>Cancelar</button>
            <button type="submit" className="kine-btn-primary">Subir</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default function PacienteDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [paciente, setPaciente] = useState(null)
  const [motivos, setMotivos] = useState([])
  const [saldo, setSaldo] = useState(null)
  const [modalMotivo, setModalMotivo] = useState(false)
  const [formMotivo, setFormMotivo] = useState(MOTIVO_EMPTY)
  const [loading, setLoading] = useState(true)

  useEffect(() => { cargar() }, [id])

  async function cargar() {
    setLoading(true)
    try {
      const [pac, movs, sld] = await Promise.all([
        api.getPaciente(id),
        api.getMotivos(id),
        api.getSaldo(id),
      ])
      setPaciente(pac)
      setMotivos(movs)
      setSaldo(sld)
    } finally { setLoading(false) }
  }

  async function crearMotivo(e) {
    e.preventDefault()
    const partes = [
      formMotivo.lesion,
      formMotivo.grado !== 'No aplica' ? `Grado ${formMotivo.grado}` : '',
    ].filter(Boolean).join(' ')
    const sintoma = [partes, formMotivo.diagnostico].filter(Boolean).join(' — ') || formMotivo.diagnostico
    const aparicion = formMotivo.tiempo_evolucion
      ? `${formMotivo.tiempo_evolucion} ${formMotivo.unidad_tiempo}`
      : ''
    await api.createMotivo(id, {
      sintoma,
      aparicion,
      momento_dia: formMotivo.momento_dia,
      movimientos: formMotivo.movimientos,
      afloja_dia: 0,
      monto_sesion: formMotivo.monto_sesion,
      estado: formMotivo.estado,
    })
    setModalMotivo(false)
    cargar()
  }

  if (loading) return <div className="kine-loading">Cargando...</div>
  if (!paciente) return <div className="kine-empty">Paciente no encontrado</div>

  return (
    <div className="kine-page">
      <style>{`
        .mc-stats-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-top: 24px; }
        .mc-sessions-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .mc-routines-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
        .mc-session-card { width: 100%; text-align: left; background: #fff; border: 1px solid #e2e8f0; border-radius: 24px; padding: 20px; cursor: pointer; transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s; font-family: inherit; }
        .mc-session-card:hover { transform: translateY(-2px); border-color: #cbd5e1; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .mc-routine-card { width: 100%; text-align: left; background: #fff; border: 1px solid #e2e8f0; border-radius: 24px; padding: 20px; cursor: pointer; transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s; font-family: inherit; }
        .mc-routine-card:hover { transform: translateY(-2px); border-color: #cbd5e1; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .rm-layout { display: grid; grid-template-columns: 1fr; gap: 20px; }
        .rm-lib-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (min-width: 1100px) { .rm-layout { grid-template-columns: 1.2fr 0.8fr; } }
        @media (min-width: 1400px) { .rm-lib-grid { grid-template-columns: 1fr 1fr 1fr; } }
        @media (max-width: 768px) {
          .mc-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .mc-sessions-grid { grid-template-columns: 1fr; }
          .mc-routines-grid { grid-template-columns: 1fr; }
          .rm-lib-grid { grid-template-columns: 1fr; }
        }
      `}</style>
      <div className="kine-page-header">
        <div className="paciente-header-left">
          <button className="kine-btn-back" onClick={() => navigate('/kine/pacientes')}>← Volver</button>
          <div className="paciente-header-avatar">{paciente.nombre[0]}{paciente.apellido[0]}</div>
          <div>
            <h1 className="kine-page-title" style={{ marginBottom: 0 }}>{paciente.nombre} {paciente.apellido}</h1>
            <div className="paciente-header-meta">
              {paciente.edad && <span>{paciente.edad} años</span>}
              {paciente.celular && <span>{paciente.celular}</span>}
              {paciente.email && <span>{paciente.email}</span>}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {saldo && <SaldoChip saldo={saldo} />}
          <button className="kine-btn-primary" onClick={() => { setFormMotivo(MOTIVO_EMPTY); setModalMotivo(true) }}>+ Motivo de consulta</button>
        </div>
      </div>

      {saldo && saldo.total_sesiones > 0 && (
        <div className="saldo-resumen">
          <div className="saldo-item"><span>Sesiones</span><strong>{saldo.total_sesiones}</strong></div>
          <div className="saldo-item"><span>Total cobrado</span><strong>${Number(saldo.total_cobrado).toLocaleString('es-AR')}</strong></div>
          <div className="saldo-item"><span>Pagado</span><strong>${Number(saldo.total_pagado).toLocaleString('es-AR')}</strong></div>
          <div className={`saldo-item ${saldo.saldo_pendiente > 0 ? 'deuda' : ''}`}>
            <span>Saldo pendiente</span>
            <strong>${Number(saldo.saldo_pendiente).toLocaleString('es-AR')}</strong>
          </div>
          {saldo.saldo_pendiente > 0 && (
            <button className="kine-btn-primary" style={{ marginLeft: 'auto' }} onClick={async () => {
              if (!confirm(`¿Marcar todas las sesiones pendientes de ${paciente.nombre} como pagadas?`)) return
              await api.pagarTodo(id)
              cargar()
            }}>
              ✓ Marcar todo como pagado
            </button>
          )}
        </div>
      )}

      {motivos.length === 0
        ? (
          <div className="kine-empty" style={{ marginTop: '2rem' }}>
            <p>No hay motivos de consulta registrados</p>
            <button className="kine-btn-primary" style={{ marginTop: '1rem' }} onClick={() => { setFormMotivo(MOTIVO_EMPTY); setModalMotivo(true) }}>
              + Agregar motivo de consulta
            </button>
          </div>
        )
        : (
          <div className="motivos-lista">
            {motivos.map(m => (
              <MotivoCard key={m.id} motivo={m} onUpdated={cargar} />
            ))}
          </div>
        )
      }

      <Modal
        open={modalMotivo}
        onClose={() => setModalMotivo(false)}
        titulo="Nueva sesión"
        subtitulo="Cargá la información clínica y administrativa"
        maxWidth={720}
        footer={
          <>
            <button type="button" onClick={() => setModalMotivo(false)}
              style={{ padding: '11px 20px', borderRadius: 14, border: '1px solid #e2e8f0', color: '#334155', background: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'inherit' }}>
              Cancelar
            </button>
            <button type="submit" form="form-motivo"
              style={{ padding: '11px 22px', borderRadius: 14, background: '#059669', color: '#fff', border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer', boxShadow: '0 1px 3px rgba(5,150,105,0.3)', fontFamily: 'inherit' }}>
              Guardar sesión
            </button>
          </>
        }
      >
        <form id="form-motivo" onSubmit={crearMotivo} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* ── Información clínica ─────────────────────── */}
          <div>
            <p style={mSecH}>Información clínica</p>

            {/* Lesión + Grado */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={mLbl}>Lesión</label>
                <select style={mFld} value={formMotivo.lesion} onChange={e => setFormMotivo(f => ({ ...f, lesion: e.target.value }))}>
                  <option value="">Seleccionar</option>
                  {['Muscular','Tendinosa','Ligamentaria','Ósea','Articular','Neurológica','Postquirúrgica'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label style={mLbl}>Grado</label>
                <select style={mFld} value={formMotivo.grado} onChange={e => setFormMotivo(f => ({ ...f, grado: e.target.value }))}>
                  {['No aplica','I','II','III'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>

            {/* Diagnóstico */}
            <div style={{ marginBottom: 16 }}>
              <label style={mLbl}>Diagnóstico *</label>
              <input required style={mFld} placeholder="Ej: Esguince lateral de tobillo derecho"
                value={formMotivo.diagnostico} onChange={e => setFormMotivo(f => ({ ...f, diagnostico: e.target.value }))} />
            </div>

            {/* Tiempo de evolución + Unidad */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={mLbl}>Tiempo de evolución</label>
                <input type="number" min="0" placeholder="Ej: 2" style={mFld}
                  value={formMotivo.tiempo_evolucion} onChange={e => setFormMotivo(f => ({ ...f, tiempo_evolucion: e.target.value }))} />
              </div>
              <div>
                <label style={mLbl}>Unidad</label>
                <select style={mFld} value={formMotivo.unidad_tiempo} onChange={e => setFormMotivo(f => ({ ...f, unidad_tiempo: e.target.value }))}>
                  {['Días','Semanas','Meses','Años'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>

            {/* Momento del dolor */}
            <div style={{ marginBottom: 16 }}>
              <label style={mLbl}>Momento del dolor</label>
              <select style={mFld} value={formMotivo.momento_dia} onChange={e => setFormMotivo(f => ({ ...f, momento_dia: e.target.value }))}>
                <option value="">Seleccionar</option>
                {['Al despertar','Por la mañana','Por la tarde','Por la noche','Durante el esfuerzo','Después del esfuerzo','Al caminar','En reposo','Constante'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>

            {/* Movimientos */}
            <div>
              <label style={mLbl}>Movimientos que duelen</label>
              <textarea rows={4} placeholder="Ej: flexión plantar, inversión, marcha prolongada..."
                style={{ ...mFld, resize: 'none', lineHeight: 1.5 }}
                value={formMotivo.movimientos} onChange={e => setFormMotivo(f => ({ ...f, movimientos: e.target.value }))} />
              <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>
                Este campo puede completarse ahora o más adelante con información del paciente.
              </p>
            </div>
          </div>

          {/* ── Datos administrativos ───────────────────── */}
          <div>
            <p style={mSecH}>Datos administrativos</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={mLbl}>Monto de sesión</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }}>$</span>
                  <input type="number" min="0" step="100" placeholder="35000"
                    style={{ ...mFld, paddingLeft: 28 }}
                    value={formMotivo.monto_sesion} onChange={e => setFormMotivo(f => ({ ...f, monto_sesion: e.target.value }))} />
                </div>
              </div>
              <div>
                <label style={mLbl}>Estado</label>
                <select style={mFld} value={formMotivo.estado} onChange={e => setFormMotivo(f => ({ ...f, estado: e.target.value }))}>
                  <option value="activo">Activo</option>
                  <option value="resuelto">Resuelto</option>
                  <option value="derivado">Derivado</option>
                </select>
              </div>
            </div>
          </div>

        </form>
      </Modal>
    </div>
  )
}
