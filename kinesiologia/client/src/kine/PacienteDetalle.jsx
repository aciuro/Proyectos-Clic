import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { api } from './api.js'
import Modal from './Modal.jsx'

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

// Normaliza el JSON de ejercicios_sesion al formato [{id, series, repeticiones, segundos}]
function parseEjSesion(json) {
  if (!json) return []
  try {
    const arr = JSON.parse(json)
    return arr.map(x => typeof x === 'number' || typeof x === 'string'
      ? { id: Number(x), series: '', repeticiones: '', segundos: '' }
      : { id: x.id, series: x.series ?? '', repeticiones: x.repeticiones ?? '', segundos: x.segundos ?? '' }
    )
  } catch { return [] }
}

const TECNICAS_OPCIONES = [
  'Puncion Seca',
  'MEP',
  'Masoterapia',
  'Movilidad',
  'Gun',
]

// Selector de ejercicios por sector → músculo → ejercicios
function EjercicioSelector({ ejercicios, seleccionados, onChange }) {
  const [sector, setSector] = useState(null)
  const [musculo, setMusculo] = useState(null)

  // Extraer sectores y músculos de la categoría "Sector · Músculo"
  const sectores = [...new Set(ejercicios.map(e => (e.categoria || '').split(' · ')[0]))].filter(Boolean).sort()
  const musculos = sector
    ? [...new Set(ejercicios.filter(e => (e.categoria || '').startsWith(sector + ' · ')).map(e => (e.categoria || '').split(' · ')[1]))].filter(Boolean)
    : []
  const ejsMusculo = musculo
    ? ejercicios.filter(e => e.categoria === `${sector} · ${musculo}`)
    : []

  function toggleEj(ej) {
    const ya = seleccionados.some(x => x.id === ej.id)
    if (ya) onChange(seleccionados.filter(x => x.id !== ej.id))
    else onChange([...seleccionados, { id: ej.id, series: '', repeticiones: '', segundos: '' }])
  }

  function upd(id, field, val) {
    onChange(seleccionados.map(x => x.id === id ? { ...x, [field]: val } : x))
  }

  return (
    <div className="kine-ej-selector">
      <div className="kine-ej-selector-titulo">Ejercicios de gimnasio</div>

      {/* Ejercicios seleccionados */}
      {seleccionados.length > 0 && (
        <div className="kine-ej-sel-lista">
          {seleccionados.map(ejd => {
            const ej = ejercicios.find(e => e.id === ejd.id)
            if (!ej) return null
            return (
              <div key={ejd.id} className="kine-ej-sel-row">
                <div className="kine-ej-sel-nombre">{ej.nombre}</div>
                <div className="kine-ej-sel-inputs">
                  <label><span>Series</span><input type="number" min="1" max="10" value={ejd.series} onChange={e => upd(ejd.id, 'series', e.target.value)} placeholder="—" /></label>
                  <label><span>Reps</span><input type="number" min="1" max="100" value={ejd.repeticiones} onChange={e => upd(ejd.id, 'repeticiones', e.target.value)} placeholder="—" /></label>
                  <label><span>Seg</span><input type="number" min="1" max="300" value={ejd.segundos} onChange={e => upd(ejd.id, 'segundos', e.target.value)} placeholder="—" /></label>
                </div>
                <button type="button" className="kine-ej-sel-rm" onClick={() => onChange(seleccionados.filter(x => x.id !== ejd.id))}>×</button>
              </div>
            )
          })}
        </div>
      )}

      {/* Navegación sector → músculo → ejercicios */}
      <div className="kine-ej-nav">
        {/* Paso 1: Sectores */}
        {!sector && (
          <div className="kine-ej-nav-grid">
            {sectores.map(s => (
              <button key={s} type="button" className="kine-ej-nav-btn" onClick={() => { setSector(s); setMusculo(null) }}>{s}</button>
            ))}
          </div>
        )}

        {/* Paso 2: Músculos del sector */}
        {sector && !musculo && (
          <>
            <div className="kine-ej-nav-back">
              <button type="button" className="kine-ej-nav-volver" onClick={() => setSector(null)}>← {sector}</button>
            </div>
            <div className="kine-ej-nav-grid">
              {musculos.map(m => (
                <button key={m} type="button" className="kine-ej-nav-btn" onClick={() => setMusculo(m)}>{m}</button>
              ))}
            </div>
          </>
        )}

        {/* Paso 3: Ejercicios del músculo */}
        {sector && musculo && (
          <>
            <div className="kine-ej-nav-back">
              <button type="button" className="kine-ej-nav-volver" onClick={() => setMusculo(null)}>← {musculo}</button>
            </div>
            <div className="kine-ej-ej-lista">
              {ejsMusculo.map(ej => {
                const sel = seleccionados.some(x => x.id === ej.id)
                return (
                  <label key={ej.id} className={`kine-ej-opcion ${sel ? 'selected' : ''}`}>
                    <input type="checkbox" checked={sel} onChange={() => toggleEj(ej)} />
                    <div className="kine-ej-opcion-info">
                      <div className="kine-ej-opcion-nombre">{ej.nombre}</div>
                      {ej.descripcion && <div className="kine-ej-opcion-desc">{ej.descripcion}</div>}
                    </div>
                  </label>
                )
              })}
            </div>
          </>
        )}
      </div>
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
                const catalog = getEjByNombre(ej.nombre)
                const params = [ej.series && `${ej.series} series`, ej.reps && `${ej.reps} reps`, ej.tiempo && ej.tiempo].filter(Boolean).join(' · ')
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
                          alt={ej.nombre}
                          style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover', background: '#f1f5f9', flexShrink: 0 }}
                          onError={e => { e.target.style.display = 'none' }}
                        />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: 14, color: '#0f172a', margin: 0 }}>{ej.nombre}</p>
                        {params && <p style={{ fontSize: 13, color: '#64748b', margin: '3px 0 0' }}>{params}</p>}
                      </div>
                      <span style={{ fontSize: 12, color: '#94a3b8', flexShrink: 0 }}>{isExpanded ? '▴' : '▾'}</span>
                    </button>
                    {isExpanded && catalog && (
                      <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {catalog.imagen && (
                          <img
                            src={catalog.imagen}
                            alt={ej.nombre}
                            style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 12, background: '#f1f5f9' }}
                            onError={e => { e.target.style.display = 'none' }}
                          />
                        )}
                        {catalog.descripcion && (
                          <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, margin: 0 }}>{catalog.descripcion}</p>
                        )}
                        {catalog.video && (
                          <a href={catalog.video} target="_blank" rel="noopener noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#2563eb', textDecoration: 'none' }}>
                            ▶ Ver video
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {(routine.hielo || routine.calor || routine.contraste) && (
            <div style={{ borderRadius: 16, border: '1px solid #e2e8f0', padding: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#64748b', marginBottom: 12 }}>Agentes físicos</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {routine.hielo && <li style={{ fontSize: 14, color: '#334155' }}>• Hielo — {routine.hielo} min</li>}
                {routine.calor && <li style={{ fontSize: 14, color: '#334155' }}>• Calor — {routine.calor} min</li>}
                {routine.contraste && <li style={{ fontSize: 14, color: '#334155' }}>• Baños de contraste — {routine.contraste}</li>}
              </ul>
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
    </div>
  )
}

const rFld = { width: '100%', borderRadius: 12, border: '1px solid #e2e8f0', background: '#fff', padding: '10px 14px', color: '#0f172a', outline: 'none', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }

function RoutineModalForm({ onClose, onSave }) {
  const [nombre, setNombre] = useState('')
  const [estado, setEstado] = useState('Activa')
  const [rows, setRows] = useState([{ id: 1, nombre: EJERCICIOS_CATALOG[0].nombre, series: '', reps: '', tiempo: '' }])
  const [hielo, setHielo] = useState(false)
  const [hieloMin, setHieloMin] = useState('')
  const [calor, setCalor] = useState(false)
  const [calorMin, setCalorMin] = useState('')
  const [contraste, setContraste] = useState(false)
  const [contrasteMin, setContrasteMin] = useState('')
  const [contrasteCiclos, setContrasteCiclos] = useState('')
  const [notas, setNotas] = useState('')

  function addRow() {
    setRows(prev => [...prev, { id: prev.length + 1, nombre: EJERCICIOS_CATALOG[0].nombre, series: '', reps: '', tiempo: '' }])
  }
  function updateRow(id, field, val) {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r))
  }
  function removeRow(id) {
    setRows(prev => prev.filter(r => r.id !== id))
  }

  function handleSave(e) {
    e.preventDefault()
    const resumen = [
      rows.length > 0 && `${rows.length} ejercicio${rows.length !== 1 ? 's' : ''}`,
      hielo && `hielo ${hieloMin} min`,
      calor && `calor ${calorMin} min`,
    ].filter(Boolean).join(' + ')
    onSave({
      id: Date.now(),
      nombre: nombre || 'Rutina sin nombre',
      estado,
      resumen,
      ejercicios: rows,
      hielo: hielo ? hieloMin : null,
      calor: calor ? calorMin : null,
      contraste: contraste ? `${contrasteMin} min · ${contrasteCiclos} ciclos` : null,
      notas,
    })
  }

  const secH = { fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: 12 }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 60 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 760, background: '#fff', borderRadius: 28, border: '1px solid #e2e8f0', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>Nueva rutina</h2>
            <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>Seleccioná ejercicios, agentes físicos e indicaciones domiciliarias</p>
          </div>
          <button onClick={onClose} style={mc.iconBtn}>✕</button>
        </div>

        <form id="form-rutina" onSubmit={handleSave} style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ ...secH, display: 'block', marginBottom: 6 }}>Nombre de la rutina</label>
              <input style={rFld} placeholder="Ej: Rutina tobillo fase 1" value={nombre} onChange={e => setNombre(e.target.value)} />
            </div>
            <div>
              <label style={{ ...secH, display: 'block', marginBottom: 6 }}>Estado</label>
              <select style={rFld} value={estado} onChange={e => setEstado(e.target.value)}>
                <option>Activa</option>
                <option>Inactiva</option>
              </select>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <p style={secH}>Ejercicios</p>
              <button type="button" onClick={addRow} style={mc.btnBlue}>+ Agregar ejercicio</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {rows.map((row, i) => (
                <div key={row.id} style={{ borderRadius: 16, border: '1px solid #e2e8f0', background: '#f8fafc', padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>Ejercicio {i + 1}</span>
                    {rows.length > 1 && <button type="button" onClick={() => removeRow(row.id)} style={{ ...mc.iconBtn, fontSize: 13 }}>✕</button>}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 0.6fr 0.6fr 0.8fr', gap: 8 }}>
                    <select style={rFld} value={row.nombre} onChange={e => updateRow(row.id, 'nombre', e.target.value)}>
                      {Object.entries(EJERCICIOS_POR_ZONA).map(([zona, ejs]) => (
                        <optgroup key={zona} label={ZONAS_LABEL[zona]}>
                          {ejs.map(ej => <option key={ej.id} value={ej.nombre}>{ej.nombre}</option>)}
                        </optgroup>
                      ))}
                    </select>
                    <input style={rFld} placeholder="Series" value={row.series} onChange={e => updateRow(row.id, 'series', e.target.value)} />
                    <input style={rFld} placeholder="Reps" value={row.reps} onChange={e => updateRow(row.id, 'reps', e.target.value)} />
                    <input style={rFld} placeholder="Tiempo" value={row.tiempo} onChange={e => updateRow(row.id, 'tiempo', e.target.value)} />
                  </div>
                  {(() => { const c = getEjByNombre(row.nombre); return c?.descripcion ? (
                    <p style={{ fontSize: 12, color: '#64748b', marginTop: 8, lineHeight: 1.5 }}>{c.descripcion}</p>
                  ) : null })()}
                </div>
              ))}
            </div>
          </div>

          <div>
            <p style={secH}>Agentes físicos</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[
                { label: 'Hielo', enabled: hielo, setEnabled: setHielo, val: hieloMin, setVal: setHieloMin, placeholder: 'Minutos' },
                { label: 'Calor', enabled: calor, setEnabled: setCalor, val: calorMin, setVal: setCalorMin, placeholder: 'Minutos' },
              ].map(({ label, enabled, setEnabled, val, setVal, placeholder }) => (
                <div key={label} style={{ borderRadius: 16, border: '1px solid #e2e8f0', padding: 16 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500, color: '#334155', cursor: 'pointer' }}>
                    <input type="checkbox" checked={enabled} onChange={() => setEnabled(v => !v)} style={{ width: 16, height: 16 }} />
                    {label}
                  </label>
                  <input type="number" min="0" placeholder={placeholder} disabled={!enabled}
                    style={{ ...rFld, marginTop: 10, background: enabled ? '#fff' : '#f8fafc', color: enabled ? '#0f172a' : '#94a3b8' }}
                    value={val} onChange={e => setVal(e.target.value)} />
                </div>
              ))}
              <div style={{ borderRadius: 16, border: '1px solid #e2e8f0', padding: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500, color: '#334155', cursor: 'pointer' }}>
                  <input type="checkbox" checked={contraste} onChange={() => setContraste(v => !v)} style={{ width: 16, height: 16 }} />
                  Baños de contraste
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
                  <input type="number" min="0" placeholder="Min." disabled={!contraste}
                    style={{ ...rFld, background: contraste ? '#fff' : '#f8fafc', color: contraste ? '#0f172a' : '#94a3b8' }}
                    value={contrasteMin} onChange={e => setContrasteMin(e.target.value)} />
                  <input type="number" min="0" placeholder="Ciclos" disabled={!contraste}
                    style={{ ...rFld, background: contraste ? '#fff' : '#f8fafc', color: contraste ? '#0f172a' : '#94a3b8' }}
                    value={contrasteCiclos} onChange={e => setContrasteCiclos(e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label style={{ ...secH, display: 'block', marginBottom: 6 }}>Notas</label>
            <textarea rows={4} placeholder="Ej: realizar 4 veces por semana, no superar dolor 4/10..."
              style={{ ...rFld, resize: 'none', lineHeight: 1.5 }}
              value={notas} onChange={e => setNotas(e.target.value)} />
          </div>
        </form>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '16px 24px', borderTop: '1px solid #e2e8f0', flexShrink: 0 }}>
          <button type="button" onClick={onClose} style={{ padding: '11px 20px', borderRadius: 14, border: '1px solid #e2e8f0', background: '#fff', color: '#334155', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
            Cancelar
          </button>
          <button type="submit" form="form-rutina" style={{ ...mc.btnEmerald, padding: '11px 22px', fontSize: 14 }}>
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

  useEffect(() => {
    cargarDetalle()
    api.getEjercicios().then(setEjercicios).catch(() => {})
  }, [])

  async function cargarDetalle() {
    setLoadingEvol(true)
    try {
      const [evols, ests, ejs] = await Promise.all([
        api.getEvoluciones(motivo.id),
        api.getEstudios(motivo.id),
        api.getEjercicios(),
      ])
      setEvoluciones(evols)
      setEstudios(ests)
      setEjercicios(ejs)
    } finally { setLoadingEvol(false) }
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
                <p style={mc.sectionTitle}>Rutinas ({routines.length})</p>
                <p style={mc.sectionSub}>Indicaciones domiciliarias y seguimiento</p>
              </div>
              <button onClick={() => setShowRoutineModal(true)} style={mc.btnBlue}>+ Nueva rutina</button>
            </div>
            {routines.length === 0 ? (
              <div style={mc.emptyBox}>
                <p style={{ fontSize: 16, fontWeight: 500, color: '#64748b', margin: 0 }}>Sin rutinas creadas</p>
                <p style={{ fontSize: 14, color: '#94a3b8', marginTop: 8, marginBottom: 0 }}>Creá una rutina domiciliaria para el paciente.</p>
              </div>
            ) : (
              <div className="mc-routines-grid">
                {routines.map(r => (
                  <button key={r.id} onClick={() => setSelectedRoutine(r)} className="mc-routine-card">
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: 16, color: '#0f172a', margin: 0 }}>{r.nombre}</p>
                        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4, marginBottom: 0 }}>{r.resumen}</p>
                      </div>
                      <span style={mc.pillBlue(r.estado === 'Activa')}>{r.estado}</span>
                    </div>
                    <p style={{ marginTop: 14, fontSize: 13, fontWeight: 600, color: '#2563eb' }}>Abrir rutina</p>
                  </button>
                ))}
              </div>
            )}
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
        <RoutineViewModal
          routine={selectedRoutine}
          onClose={() => setSelectedRoutine(null)}
          onEdit={() => { setSelectedRoutine(null); setShowRoutineModal(true) }}
        />
      )}

      {/* Routine create modal */}
      {showRoutineModal && (
        <RoutineModalForm
          onClose={() => setShowRoutineModal(false)}
          onSave={(r) => { setRoutines(prev => [...prev, r]); setShowRoutineModal(false) }}
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

          {/* Ejercicios de gimnasio */}
          <EjercicioSelector
            ejercicios={ejercicios}
            seleccionados={formEvol.ejercicios_sesion || []}
            onChange={lista => setFormEvol(f => ({ ...f, ejercicios_sesion: lista }))}
          />

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
        @media (max-width: 768px) {
          .mc-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .mc-sessions-grid { grid-template-columns: 1fr; }
          .mc-routines-grid { grid-template-columns: 1fr; }
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
