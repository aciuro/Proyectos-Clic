import { useEffect, useMemo, useState } from 'react'
import { api } from './api.js'

const ALIAS = 'clic.escobar'
const ADMIN_WA = '5491144054833'

function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString('es-AR')}`
}

function formatLongDate(value) {
  return new Date(value).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function VideoEmbed({ url }) {
  if (!url) return null
  let embedUrl = null
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  if (ytMatch) embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`
  const shortsMatch = url.match(/youtube\.com\/shorts\/([^?&\s]+)/)
  if (shortsMatch) embedUrl = `https://www.youtube.com/embed/${shortsMatch[1]}`
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`

  if (embedUrl) {
    return (
      <div className="video-embed-wrap">
        <iframe src={embedUrl} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="Ejercicio" />
      </div>
    )
  }

  return <a href={url} target="_blank" rel="noreferrer" className="kine-ej-video-link">Ver video del ejercicio</a>
}

function ExerciseDetail({ exercise, onBack }) {
  return (
    <div className="rhp-detail-shell">
      <div className="rhp-detail-card">
        <button className="rhp-back-link" onClick={onBack}>← Volver a la rutina</button>
        <span className="rhp-chip">{exercise.categoria || 'General'}</span>
        <h2 className="rhp-detail-title">{exercise.nombre.replace(/ — (CC|OA)$/, '')}</h2>
        <div className="rhp-prescription-grid">
          {exercise.series ? <div className="rhp-prescription-item"><strong>{exercise.series}</strong><span>Series</span></div> : null}
          {exercise.repeticiones ? <div className="rhp-prescription-item"><strong>{exercise.repeticiones}</strong><span>Reps</span></div> : null}
          {exercise.segundos ? <div className="rhp-prescription-item"><strong>{exercise.segundos}"</strong><span>Segundos</span></div> : null}
        </div>
        <VideoEmbed url={exercise.video_url} />
        {exercise.descripcion ? <p className="rhp-detail-description">{exercise.descripcion}</p> : null}
      </div>
    </div>
  )
}

export default function PortalPaciente({ usuario, paciente, onLogout }) {
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('home')
  const [selectedExerciseId, setSelectedExerciseId] = useState(null)
  const [saldo, setSaldo] = useState(0)
  const [ejercicios, setEjercicios] = useState([])
  const [turnos, setTurnos] = useState([])
  const [motivos, setMotivos] = useState([])
  const [studies, setStudies] = useState([])
  const [completed, setCompleted] = useState({})
  const [turnoForm, setTurnoForm] = useState({ fecha: '', hora: '', notas: '' })
  const [submittingTurno, setSubmittingTurno] = useState(false)
  const [turnoError, setTurnoError] = useState('')

  useEffect(() => {
    if (!paciente) return
    let active = true

    async function load() {
      setLoading(true)
      try {
        const [rutinaData, saldoData, turnosData, motivosData] = await Promise.all([
          api.getEjerciciosGimnasio(paciente.id),
          api.getSaldo(paciente.id),
          api.getTurnosPaciente(paciente.id),
          api.getMotivos(paciente.id),
        ])

        if (!active) return
        setEjercicios(rutinaData?.ejercicios || [])
        setSaldo(saldoData?.saldo_pendiente || 0)
        setTurnos(turnosData || [])
        setMotivos(motivosData || [])

        const grouped = await Promise.all((motivosData || []).map(async (motivo) => {
          const items = await api.getEstudios(motivo.id).catch(() => [])
          return items.map(item => ({ ...item, motivo }))
        }))
        if (!active) return
        setStudies(grouped.flat().sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => { active = false }
  }, [paciente?.id])

  const upcomingTurnos = useMemo(() => {
    const today = new Date()
    const floor = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    return [...turnos]
      .filter(turno => turno.estado !== 'cancelado')
      .filter(turno => new Date(`${turno.fecha}T${turno.hora || '00:00'}`) >= floor)
      .sort((a, b) => new Date(`${a.fecha}T${a.hora || '00:00'}`) - new Date(`${b.fecha}T${b.hora || '00:00'}`))
  }, [turnos])

  const selectedExercise = ejercicios.find(item => item.id === selectedExerciseId)
  const latestMotivo = motivos[0]
  const hasDebt = saldo > 0
  const payMessage = encodeURIComponent(`Hola Augusto. Soy ${paciente?.nombre || ''} ${paciente?.apellido || ''}. Acabo de realizar el pago de ${formatMoney(saldo)}. Alias: ${ALIAS}.`)
  const payUrl = `https://wa.me/${ADMIN_WA}?text=${payMessage}`

  async function refreshStudies(nextMotivos = motivos) {
    const grouped = await Promise.all((nextMotivos || []).map(async (motivo) => {
      const items = await api.getEstudios(motivo.id).catch(() => [])
      return items.map(item => ({ ...item, motivo }))
    }))
    setStudies(grouped.flat().sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
  }

  async function handleStudyUpload(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !latestMotivo) return
    const formData = new FormData()
    formData.append('archivo', file)
    formData.append('nombre', file.name)
    await api.uploadEstudio(latestMotivo.id, formData)
    await refreshStudies()
    setView('estudios')
  }

  async function handleTurnoSubmit(event) {
    event.preventDefault()
    setSubmittingTurno(true)
    setTurnoError('')
    try {
      const turno = await api.solicitarTurnoPaciente(paciente.id, {
        fecha: turnoForm.fecha,
        hora: turnoForm.hora,
        notas: turnoForm.notas,
        motivo: turnoForm.notas || 'Solicitud de turno',
      })
      setTurnos(prev => [...prev, turno])
      setTurnoForm({ fecha: '', hora: '', notas: '' })
      setView('turnos')
    } catch (error) {
      setTurnoError(error.message || 'No se pudo enviar la solicitud.')
    } finally {
      setSubmittingTurno(false)
    }
  }

  if (!paciente) {
    return <div className="rhp-empty-state">Tu cuenta todavia no esta vinculada a un paciente.</div>
  }

  if (selectedExercise) {
    return <ExerciseDetail exercise={selectedExercise} onBack={() => setSelectedExerciseId(null)} />
  }

  const nextTurno = upcomingTurnos[0]
  const menu = [
    ['home', 'Inicio'],
    ['turnos', 'Turnos'],
    ['rutina', 'Rutinas'],
    ['estudios', 'Estudios'],
    ['saldo', 'Saldo'],
    ['perfil', 'Perfil'],
  ]

  return (
    <div className="rhp-shell">
      {hasDebt && !loading ? (
        <div className="rhp-debt-overlay">
          <div className="rhp-debt-card">
            <div className="rhp-debt-icon">Saldo pendiente</div>
            <h2>{formatMoney(saldo)}</h2>
            <p>Regulariza el pago para recuperar el acceso completo al portal.</p>
            <div className="rhp-alias-box"><span>Alias</span><strong>{ALIAS}</strong></div>
            <a href={payUrl} target="_blank" rel="noreferrer" className="rhp-primary-btn">Avisar pago por WhatsApp</a>
          </div>
        </div>
      ) : null}

      <header className="rhp-topnav">
        <div className="rhp-logo"><span className="rhp-logo-mark" /><span>Rehabilitaplus</span></div>
        <div className="rhp-topnav-right">
          <button className="rhp-icon-btn" type="button">○</button>
          <div className="rhp-avatar-wrap">
            <div className="rhp-avatar">{paciente.nombre?.[0]}{paciente.apellido?.[0]}</div>
            <span className="rhp-avatar-name">{usuario?.nombre || paciente.nombre}</span>
          </div>
          <button className="rhp-logout-btn rhp-desktop-only" onClick={onLogout}>Salir</button>
        </div>
      </header>

      <div className={`rhp-main${hasDebt && !loading ? ' locked' : ''}`}>
        <aside className="rhp-sidebar rhp-desktop-only">
          <div className="rhp-sidebar-date">{formatLongDate(new Date())}</div>
          <div className="rhp-sidebar-menu">
            {menu.map(([id, label]) => (
              <button key={id} className={`rhp-sidebar-item${view === id ? ' active' : ''}`} onClick={() => setView(id)}>{label}</button>
            ))}
          </div>
        </aside>

        <main className="rhp-content">
          <div className="rhp-mobile-greeting rhp-mobile-only">
            <div className="rhp-mobile-date">{new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
            <div className="rhp-mobile-name">Hola, {paciente.nombre}</div>
          </div>

          {loading ? <div className="rhp-loading">Cargando portal...</div> : null}

          {!loading && view === 'home' ? (
            <>
              <div className="rhp-section-top rhp-desktop-only">
                <span className="rhp-section-label">Resumen</span>
                <span className="rhp-section-date">{formatLongDate(new Date())}</span>
              </div>

              <div className="rhp-stat-grid rhp-desktop-only">
                <button className="rhp-stat-card sky" onClick={() => setView('turnos')}><span>Proximo turno</span><strong>{nextTurno ? formatLongDate(`${nextTurno.fecha}T12:00`) : 'Sin turno'}</strong><small>{nextTurno ? `${nextTurno.hora?.slice(0, 5)} hs` : 'Pedinos uno nuevo'}</small></button>
                <button className="rhp-stat-card aqua" onClick={() => setView('rutina')}><span>Rutina de hoy</span><strong>{ejercicios.length} ejercicios</strong><small>{ejercicios[0]?.categoria || 'Movilidad y fuerza'}</small></button>
                <button className="rhp-stat-card debt" onClick={() => setView('saldo')}><span>Estado de cuenta</span><strong>{hasDebt ? formatMoney(saldo) : 'Sin deuda'}</strong><small>{hasDebt ? 'Regularizar' : 'Todo al dia'}</small></button>
              </div>

              <div className="rhp-two-col rhp-desktop-only">
                <section className="rhp-panel">
                  <div className="rhp-panel-head"><h3>Mis turnos</h3><button onClick={() => setView('turnos')}>Ver todos</button></div>
                  {upcomingTurnos.slice(0, 3).map(turno => (
                    <div key={turno.id} className="rhp-list-row"><strong>{formatLongDate(`${turno.fecha}T12:00`)}</strong><span>{turno.motivo || 'Sesion'} · {turno.hora?.slice(0, 5)} hs</span></div>
                  ))}
                  {upcomingTurnos.length === 0 ? <div className="rhp-empty-inline">Todavia no tenes turnos cargados.</div> : null}
                </section>
                <section className="rhp-panel">
                  <div className="rhp-panel-head"><h3>Estudios clinicos</h3><button onClick={() => setView('estudios')}>Ver todo</button></div>
                  {studies.slice(0, 3).map(study => (
                    <div key={study.id} className="rhp-study-row"><div><strong>{study.nombre}</strong><span>{new Date(study.created_at).toLocaleDateString('es-AR')}</span></div><a href={`/api/kine/estudios/${study.id}/descargar`}>Descargar</a></div>
                  ))}
                  {studies.length === 0 ? <div className="rhp-empty-inline">No hay estudios cargados.</div> : null}
                  {latestMotivo ? <label className="rhp-upload-row">Subir archivo<input type="file" hidden onChange={handleStudyUpload} /></label> : null}
                </section>
              </div>

              <div className="rhp-mobile-home rhp-mobile-only">
                <button className="rhp-mobile-card" onClick={() => setView('turnos')}>
                  <span className="rhp-card-kicker">Proximo turno</span>
                  <strong>{nextTurno ? (nextTurno.motivo || 'Sesion') : 'Sin turno confirmado'}</strong>
                  <small>{nextTurno ? `${new Date(`${nextTurno.fecha}T12:00`).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })} · ${nextTurno.hora?.slice(0, 5)} hs` : 'Toca pedir turno'}</small>
                </button>
                <button className="rhp-mobile-card aqua" onClick={() => setView('rutina')}>
                  <span className="rhp-card-kicker">Rutina de hoy</span>
                  <strong>{ejercicios[0]?.categoria || 'Rutina personalizada'}</strong>
                  <small>{ejercicios.length} ejercicios</small>
                </button>
                <div className="rhp-mini-grid">
                  <button className="rhp-mini-card" onClick={() => setView('estudios')}><strong>Estudios</strong><small>{studies.length} archivos</small></button>
                  <button className="rhp-mini-card debt" onClick={() => setView('saldo')}><strong>{formatMoney(saldo)}</strong><small>{hasDebt ? 'Pendiente' : 'Al dia'}</small></button>
                </div>
              </div>
            </>
          ) : null}

          {!loading && view === 'turnos' ? (
            <div className="rhp-stack">
              <section className="rhp-panel">
                <div className="rhp-panel-head"><h3>Mis turnos</h3></div>
                {upcomingTurnos.length === 0 ? <div className="rhp-empty-inline">Todavia no tenes turnos agendados.</div> : upcomingTurnos.map(turno => (
                  <div key={turno.id} className="rhp-list-row"><strong>{formatLongDate(`${turno.fecha}T12:00`)}</strong><span>{turno.motivo || 'Sesion'} · {turno.hora?.slice(0, 5)} hs</span></div>
                ))}
              </section>
              <section className="rhp-panel">
                <div className="rhp-panel-head"><h3>Solicitar turno</h3></div>
                <form className="rhp-form" onSubmit={handleTurnoSubmit}>
                  <div className="rhp-form-row">
                    <label><span>Fecha</span><input type="date" min={new Date().toISOString().slice(0, 10)} value={turnoForm.fecha} onChange={e => setTurnoForm(prev => ({ ...prev, fecha: e.target.value }))} required /></label>
                    <label><span>Hora</span><input type="time" value={turnoForm.hora} onChange={e => setTurnoForm(prev => ({ ...prev, hora: e.target.value }))} required /></label>
                  </div>
                  <label><span>Motivo o comentario</span><textarea rows={3} value={turnoForm.notas} onChange={e => setTurnoForm(prev => ({ ...prev, notas: e.target.value }))} /></label>
                  {turnoError ? <div className="rhp-form-error">{turnoError}</div> : null}
                  <button type="submit" className="rhp-primary-btn" disabled={submittingTurno}>{submittingTurno ? 'Enviando...' : 'Solicitar turno'}</button>
                </form>
              </section>
            </div>
          ) : null}

          {!loading && view === 'rutina' ? (
            <section className="rhp-panel">
              <div className="rhp-panel-head"><h3>Rutina de hoy</h3><span>{Object.values(completed).filter(Boolean).length}/{ejercicios.length}</span></div>
              <div className="rhp-routine-list">
                {ejercicios.length === 0 ? <div className="rhp-empty-inline">No tenes ejercicios asignados.</div> : ejercicios.map((exercise, index) => (
                  <button key={exercise.id} className={`rhp-routine-row${completed[exercise.id] ? ' done' : ''}`} onClick={() => setSelectedExerciseId(exercise.id)}>
                    <span className={`rhp-check-btn${completed[exercise.id] ? ' active' : ''}`} onClick={(event) => { event.stopPropagation(); setCompleted(prev => ({ ...prev, [exercise.id]: !prev[exercise.id] })) }}>{completed[exercise.id] ? '✓' : ''}</span>
                    <span className="rhp-routine-index">{index + 1}</span>
                    <div className="rhp-routine-copy"><strong>{exercise.nombre.replace(/ — (CC|OA)$/, '')}</strong><small>{exercise.categoria || 'General'}</small></div>
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          {!loading && view === 'estudios' ? (
            <section className="rhp-panel">
              <div className="rhp-panel-head"><h3>Estudios clinicos</h3>{latestMotivo ? <label className="rhp-upload-row inline">Subir archivo<input type="file" hidden onChange={handleStudyUpload} /></label> : null}</div>
              {studies.length === 0 ? <div className="rhp-empty-inline">No hay estudios cargados.</div> : studies.map(study => (
                <div key={study.id} className="rhp-study-row"><div><strong>{study.nombre}</strong><span>{new Date(study.created_at).toLocaleDateString('es-AR')}</span></div><a href={`/api/kine/estudios/${study.id}/descargar`}>Descargar</a></div>
              ))}
            </section>
          ) : null}

          {!loading && view === 'saldo' ? (
            <section className="rhp-panel debt-panel">
              <div className="rhp-panel-head"><h3>Estado de cuenta</h3></div>
              <div className={`rhp-balance-value${hasDebt ? ' debt' : ''}`}>{formatMoney(saldo)}</div>
              <div className="rhp-balance-sub">{hasDebt ? 'Saldo pendiente' : 'Estas al dia'}</div>
              {hasDebt ? <><div className="rhp-alias-box"><span>Alias</span><strong>{ALIAS}</strong></div><a href={payUrl} target="_blank" rel="noreferrer" className="rhp-primary-btn">Avisar pago por WhatsApp</a></> : null}
            </section>
          ) : null}

          {!loading && view === 'perfil' ? (
            <div className="rhp-stack">
              <section className="rhp-panel profile">
                <div className="rhp-profile-avatar">{paciente.nombre?.[0]}{paciente.apellido?.[0]}</div>
                <strong>{paciente.nombre} {paciente.apellido}</strong>
                <span>{usuario?.email || paciente.email || 'Sin email'}</span>
              </section>
              <section className="rhp-panel">
                <div className="rhp-profile-row"><span>Telefono</span><strong>{paciente.telefono || paciente.celular || 'No informado'}</strong></div>
                <div className="rhp-profile-row"><span>Obra social</span><strong>{paciente.obra_social || 'No informada'}</strong></div>
                <div className="rhp-profile-row"><span>DNI</span><strong>{paciente.dni || 'No informado'}</strong></div>
              </section>
              <button className="rhp-secondary-btn rhp-mobile-only" onClick={onLogout}>Cerrar sesion</button>
            </div>
          ) : null}
        </main>
      </div>

      <nav className="rhp-mobile-nav rhp-mobile-only">
        {menu.filter(([id]) => ['home', 'turnos', 'rutina', 'perfil'].includes(id)).map(([id, label]) => (
          <button key={id} className={`rhp-mobile-nav-item${view === id ? ' active' : ''}`} onClick={() => setView(id)}>{label}</button>
        ))}
      </nav>
    </div>
  )
}
