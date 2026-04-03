import { useEffect, useState } from 'react'
import { api } from './api.js'

function VideoEmbed({ url }) {
  if (!url) return null

  let embedUrl = null

  // YouTube watch o youtu.be
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  if (ytMatch) embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`

  // YouTube Shorts
  const shortsMatch = url.match(/youtube\.com\/shorts\/([^?&\s]+)/)
  if (shortsMatch) embedUrl = `https://www.youtube.com/embed/${shortsMatch[1]}`

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`

  if (embedUrl) return (
    <div className="video-embed-wrap">
      <iframe
        src={embedUrl}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="Ejercicio"
      />
    </div>
  )

  // YouTube search u otro link
  return (
    <a href={url} target="_blank" rel="noreferrer" className="kine-ej-video-link">
      🔍 Ver videos del ejercicio
    </a>
  )
}

function EjercicioCard({ ej, onClick }) {
  const nombre = ej.nombre.replace(/ — (CC|OA)$/, '')
  const hasParams = ej.series || ej.repeticiones || ej.segundos || ej.duracion_seg
  return (
    <div className="portal-ej-card" onClick={() => onClick(ej.id)}>
      {ej.video_url && <div className="portal-ej-thumb">▶</div>}
      <div className="kine-ej-header">
        <span className="kine-ej-cat">{ej.categoria || 'General'}</span>
      </div>
      <div className="kine-ej-nombre">{nombre}</div>
      {ej.descripcion && <div className="kine-ej-desc">{ej.descripcion.slice(0, 80)}{ej.descripcion.length > 80 ? '...' : ''}</div>}
      {hasParams && (
        <div className="kine-ej-params">
          {ej.series && <span>{ej.series} series</span>}
          {ej.repeticiones && <span>{ej.repeticiones} reps</span>}
          {(ej.segundos || ej.duracion_seg) && <span>{ej.segundos || ej.duracion_seg}s</span>}
        </div>
      )}
    </div>
  )
}

function EjercicioDetalle({ ej, onVolver }) {
  const nombre = ej.nombre.replace(/ — (CC|OA)$/, '')
  const esCadenaCerrada = ej.nombre.includes('— CC')
  const esCadenaAbierta = ej.nombre.includes('— OA')
  return (
    <div className="portal-ej-detalle">
      <button className="kine-btn-back" onClick={onVolver}>← Volver</button>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
        <span className="kine-ej-cat">{ej.categoria || 'General'}</span>
        {esCadenaCerrada && <span className="portal-cadena-tag cc">Cadena Cerrada</span>}
        {esCadenaAbierta && <span className="portal-cadena-tag oa">Cadena Abierta</span>}
      </div>
      <h2 className="portal-ej-titulo">{nombre}</h2>

      {/* Parámetros asignados por el kinesiólogo */}
      {(ej.series || ej.repeticiones || ej.segundos) && (
        <div className="portal-ej-indicacion">
          <div className="portal-ej-indicacion-titulo">Tu prescripción</div>
          <div className="portal-ej-params">
            {ej.series && <div className="portal-param"><span className="portal-param-val">{ej.series}</span><span className="portal-param-lbl">Series</span></div>}
            {ej.repeticiones && <div className="portal-param"><span className="portal-param-val">{ej.repeticiones}</span><span className="portal-param-lbl">Reps</span></div>}
            {ej.segundos && <div className="portal-param"><span className="portal-param-val">{ej.segundos}"</span><span className="portal-param-lbl">Segundos</span></div>}
          </div>
        </div>
      )}

      <VideoEmbed url={ej.video_url} />
      {ej.descripcion && <p className="portal-ej-desc">{ej.descripcion}</p>}

      {/* Parámetros generales del ejercicio (tabla paciente_ejercicios) */}
      {(ej.duracion_seg || ej.frecuencia) && (
        <div className="portal-ej-params" style={{ marginTop: '1rem' }}>
          {ej.duracion_seg && <div className="portal-param"><span className="portal-param-val">{ej.duracion_seg}s</span><span className="portal-param-lbl">Duración</span></div>}
          {ej.frecuencia && <div className="portal-param"><span className="portal-param-val">{ej.frecuencia}</span><span className="portal-param-lbl">Frecuencia</span></div>}
        </div>
      )}
      {ej.notas && <div className="portal-ej-notas"><strong>Indicaciones:</strong> {ej.notas}</div>}
    </div>
  )
}

function TabGimnasio({ pacienteId }) {
  const [data, setData] = useState(null)
  const [seleccionado, setSeleccionado] = useState(null)

  useEffect(() => {
    api.getEjerciciosGimnasio(pacienteId).then(setData)
  }, [pacienteId])

  if (!data) return <div className="kine-loading">Cargando...</div>

  const { ejercicios, fecha } = data

  if (ejercicios.length === 0) return (
    <div className="kine-empty">Tu kinesiólogo aún no asignó ejercicios de gimnasio</div>
  )

  if (seleccionado) {
    const ej = ejercicios.find(e => e.id === seleccionado)
    return <EjercicioDetalle ej={ej} onVolver={() => setSeleccionado(null)} />
  }

  return (
    <div>
      {fecha && (
        <div className="portal-gimnasio-fecha">
          Ejercicios asignados en la sesión del{' '}
          <strong>{new Date(fecha + 'T12:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}</strong>
        </div>
      )}
      <div className="kine-ej-grid">
        {ejercicios.map(e => (
          <EjercicioCard key={e.id} ej={e} onClick={setSeleccionado} />
        ))}
      </div>
    </div>
  )
}

function TabEjercicios({ pacienteId }) {
  const [ejercicios, setEjercicios] = useState([])
  const [seleccionado, setSeleccionado] = useState(null)
  const [catFiltro, setCatFiltro] = useState('')

  useEffect(() => {
    api.getEjerciciosPaciente(pacienteId).then(setEjercicios)
  }, [pacienteId])

  const categorias = [...new Set(ejercicios.map(e => e.categoria).filter(Boolean))]
  const filtrados = catFiltro ? ejercicios.filter(e => e.categoria === catFiltro) : ejercicios

  if (ejercicios.length === 0) return (
    <div className="kine-empty">Tu kinesiólogo aún no asignó un plan de ejercicios</div>
  )

  if (seleccionado) {
    const ej = ejercicios.find(e => e.id === seleccionado)
    return <EjercicioDetalle ej={ej} onVolver={() => setSeleccionado(null)} />
  }

  return (
    <div>
      {categorias.length > 1 && (
        <div className="portal-filtros">
          <button className={`portal-filtro-btn ${!catFiltro ? 'active' : ''}`} onClick={() => setCatFiltro('')}>Todos</button>
          {categorias.map(c => (
            <button key={c} className={`portal-filtro-btn ${catFiltro === c ? 'active' : ''}`} onClick={() => setCatFiltro(c)}>{c}</button>
          ))}
        </div>
      )}
      <div className="kine-ej-grid">
        {filtrados.map(e => (
          <EjercicioCard key={e.id} ej={e} onClick={setSeleccionado} />
        ))}
      </div>
    </div>
  )
}

function TabHistoria({ paciente }) {
  const [lesiones, setLesiones] = useState([])
  const [sesiones, setSesiones] = useState({})
  const [expandida, setExpandida] = useState(null)

  useEffect(() => {
    api.getLesiones(paciente.id).then(ls => {
      setLesiones(ls)
      if (ls.length > 0) setExpandida(ls[0].id)
    })
  }, [paciente.id])

  useEffect(() => {
    if (expandida && !sesiones[expandida]) {
      api.getSesiones(expandida).then(ss => setSesiones(prev => ({ ...prev, [expandida]: ss })))
    }
  }, [expandida])

  return (
    <div>
      <div className="portal-info-grid">
        {paciente.obra_social && <div className="portal-info-item"><span className="portal-info-lbl">Obra social</span><span>{paciente.obra_social} {paciente.nro_afiliado ? `· Nro ${paciente.nro_afiliado}` : ''}</span></div>}
        {paciente.motivo_consulta && <div className="portal-info-item" style={{ gridColumn: '1/-1' }}><span className="portal-info-lbl">Motivo de consulta</span><span>{paciente.motivo_consulta}</span></div>}
        {paciente.antecedentes && <div className="portal-info-item" style={{ gridColumn: '1/-1' }}><span className="portal-info-lbl">Antecedentes</span><span>{paciente.antecedentes}</span></div>}
        {paciente.medicacion && <div className="portal-info-item"><span className="portal-info-lbl">Medicación</span><span>{paciente.medicacion}</span></div>}
        {paciente.alergias && <div className="portal-info-item"><span className="portal-info-lbl">Alergias</span><span>{paciente.alergias}</span></div>}
      </div>

      <h3 className="portal-section-titulo">Lesiones y tratamientos</h3>

      {lesiones.length === 0
        ? <div className="kine-empty">Sin lesiones registradas</div>
        : lesiones.map(l => (
            <div key={l.id} className="portal-lesion">
              <div className="portal-lesion-header" onClick={() => setExpandida(expandida === l.id ? null : l.id)}>
                <div>
                  <div className="portal-lesion-desc">{l.descripcion}</div>
                  {l.diagnostico && <div className="portal-lesion-diag">{l.diagnostico}</div>}
                  <div className="portal-lesion-meta">
                    {l.fecha_ingreso && <span>Ingreso: {l.fecha_ingreso}</span>}
                    <span className={`kine-estado ${l.estado}`}>{l.estado}</span>
                    <span>{l.total_sesiones} sesión{l.total_sesiones !== 1 ? 'es' : ''}</span>
                  </div>
                </div>
                <span className="portal-chevron">{expandida === l.id ? '▲' : '▼'}</span>
              </div>

              {expandida === l.id && (
                <div className="portal-sesiones">
                  {!sesiones[l.id]
                    ? <div className="kine-loading">Cargando...</div>
                    : sesiones[l.id].length === 0
                      ? <div className="kine-empty-sm">Sin sesiones</div>
                      : sesiones[l.id].map((s, i) => (
                          <div key={s.id} className="portal-sesion">
                            <div className="portal-sesion-num">#{sesiones[l.id].length - i}</div>
                            <div className="portal-sesion-info">
                              <div className="kine-sesion-fecha">
                                {new Date(s.fecha + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                {s.duracion && <span className="kine-sesion-dur"> · {s.duracion} min</span>}
                              </div>
                              {s.tecnicas && <div className="portal-sesion-campo"><strong>Técnicas:</strong> {s.tecnicas}</div>}
                              {s.evolucion && <div className="portal-sesion-campo"><strong>Evolución:</strong> {s.evolucion}</div>}
                              {s.notas && <div className="portal-sesion-campo">{s.notas}</div>}
                            </div>
                          </div>
                        ))
                  }
                </div>
              )}
            </div>
          ))
      }
    </div>
  )
}

export default function PortalPaciente({ paciente }) {
  const [tab, setTab] = useState('gimnasio')

  if (!paciente) return (
    <div className="kine-page">
      <div className="kine-empty">Tu cuenta aún no está vinculada a un paciente. Consultá con tu kinesiólogo.</div>
    </div>
  )

  return (
    <div className="kine-page">
      <div className="portal-header">
        <div className="kine-detalle-avatar">{paciente.nombre[0]}{paciente.apellido[0]}</div>
        <div>
          <h1 className="kine-detalle-nombre">{paciente.nombre} {paciente.apellido}</h1>
          <div className="kine-detalle-meta">
            {paciente.fecha_nac && <span>Nac. {paciente.fecha_nac}</span>}
            {paciente.telefono && <span>· {paciente.telefono}</span>}
          </div>
        </div>
      </div>

      <div className="kine-tabs">
        <button className={`kine-tab ${tab === 'gimnasio' ? 'active' : ''}`} onClick={() => setTab('gimnasio')}>
          🏋️ Gimnasio
        </button>
        <button className={`kine-tab ${tab === 'ejercicios' ? 'active' : ''}`} onClick={() => setTab('ejercicios')}>
          📋 Plan de ejercicios
        </button>
        <button className={`kine-tab ${tab === 'historia' ? 'active' : ''}`} onClick={() => setTab('historia')}>
          🗂️ Mi historia
        </button>
      </div>

      {tab === 'gimnasio' && <TabGimnasio pacienteId={paciente.id} />}
      {tab === 'ejercicios' && <TabEjercicios pacienteId={paciente.id} />}
      {tab === 'historia' && <TabHistoria paciente={paciente} />}
    </div>
  )
}
