const BASE = '/api/kine'

function getToken() {
  return localStorage.getItem('kine_token')
}

async function req(method, path, body) {
  const token = getToken()
  const res = await fetch(BASE + path, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (res.status === 401) {
    localStorage.removeItem('kine_token')
    window.location.href = '/kine/login'
    return
  }
  if (!res.ok) throw new Error((await res.json()).error || res.statusText)
  return res.json()
}

function safeJson(value, fallback = null) {
  if (!value) return fallback
  if (typeof value !== 'string') return value
  try { return JSON.parse(value) } catch { return fallback }
}

function summarizeCleanItem(item = {}) {
  const parts = []
  if (item.series) parts.push(`${item.series} series`)
  if (item.repeticiones || item.reps) parts.push(`${item.repeticiones || item.reps} reps`)
  if (item.segundos) parts.push(`${item.segundos} seg`)
  if (item.pausa) parts.push(`pausa ${item.pausa}`)
  const dose = parts.join(' · ')
  const extra = item.descripcion || item.indicacion || item.detalle || item.texto || ''
  return [dose, extra].filter(Boolean).join(' · ')
}

function cleanRoutineItem(item = {}, index = 0) {
  const tipo = item.tipo || item.bloque || 'ejercicio'
  const nombre =
    item.nombre || item.name || item.titulo || item.texto || item.ejercicio_nombre || item.nombre_ejercicio ||
    item.ejercicio?.nombre || item.ejercicio?.name ||
    (tipo === 'agente' ? 'Agente físico' : tipo === 'indicacion' ? 'Indicación' : `Ejercicio ${index + 1}`)

  const categoria = item.categoria || item.group || item.bloque || item.tipo || item.ejercicio?.categoria || 'ejercicio'
  const repeticiones = item.repeticiones || item.reps || item.ejercicio?.repeticiones || ''
  const series = item.series || item.ejercicio?.series || ''
  const segundos = item.segundos || item.ejercicio?.segundos || ''
  const pausa = item.pausa || item.ejercicio?.pausa || ''
  const video = item.video_url || item.video || item.ejercicio?.video_url || item.ejercicio?.video || ''
  const imagen = item.imagen || item.image || item.imagen_url || item.foto || item.ejercicio?.imagen || item.ejercicio?.image || null

  const descripcion = [
    item.indicacion,
    item.detalle,
    item.descripcion,
    tipo === 'indicacion' ? item.texto : null,
  ].filter(Boolean).join(' · ')

  const limpio = {
    ...item,
    id: item.id || `${tipo}-${index}`,
    tipo,
    nombre,
    name: nombre,
    titulo: nombre,
    texto: item.texto || nombre,
    display_name: nombre,
    ejercicio_nombre: nombre,
    nombre_ejercicio: nombre,
    categoria,
    descripcion,
    detalle: item.detalle || descripcion,
    indicacion: item.indicacion || item.detalle || descripcion,
    video_url: video,
    video,
    imagen,
    image: imagen,
    imagen_url: imagen,
    foto: imagen,
    series,
    repeticiones,
    reps: repeticiones,
    segundos,
    pausa,
  }

  limpio.ejercicio = {
    ...(item.ejercicio || {}),
    nombre,
    name: nombre,
    titulo: nombre,
    categoria,
    descripcion,
    video_url: video,
    video,
    imagen,
    image: imagen,
  }

  return limpio
}

function normalizeRoutine(rutina = {}) {
  const meta = safeJson(rutina.ejercicios_libres, {}) || {}
  const rawEjercicios = safeJson(rutina.ejercicios, rutina.ejercicios)
  const ejercicios = Array.isArray(rawEjercicios) ? rawEjercicios : []
  const cleanEjercicios = ejercicios.map(cleanRoutineItem)
  const resumenEjercicios = cleanEjercicios
    .map((ej, i) => `${i + 1}. ${ej.nombre}${summarizeCleanItem(ej) ? ` — ${summarizeCleanItem(ej)}` : ''}`)
    .join('\n')

  const activa = !rutina.estado || rutina.estado === 'Activa' || rutina.estado === 'activa'

  return {
    ...rutina,
    estado: rutina.estado || 'Activa',
    activa,
    ejercicios: cleanEjercicios,
    items: cleanEjercicios,
    bloques: cleanEjercicios,
    rutina_items: cleanEjercicios,
    total_ejercicios: cleanEjercicios.length,
    ejercicios_count: cleanEjercicios.length,
    frecuencia: meta.frecuencia || rutina.frecuencia || '2-3 veces antes del próximo control',
    focos: Array.isArray(meta.focos) ? meta.focos : undefined,
    contexto: meta.contexto || rutina.contexto,
    ejercicios_libres: resumenEjercicios,
    resumen: rutina.resumen || resumenEjercicios,
    descripcion: rutina.descripcion || resumenEjercicios,
    indicaciones: resumenEjercicios,
  }
}

function normalizeRutinas(rutinas) {
  return Array.isArray(rutinas) ? rutinas.map(normalizeRoutine) : rutinas
}

export const api = {
  login:  (data) => req('POST', '/login', data),
  me:     () => req('GET', '/me'),

  getPacientes:   () => req('GET', '/pacientes'),
  getPaciente:    (id) => req('GET', `/pacientes/${id}`),
  createPaciente: (data) => req('POST', '/pacientes', data),
  updatePaciente: (id, data) => req('PUT', `/pacientes/${id}`, data),
  deletePaciente: (id) => req('DELETE', `/pacientes/${id}`),
  crearAcceso:    (id, data) => req('POST', `/pacientes/${id}/crear-acceso`, data),

  getLesiones:   (pacienteId) => req('GET', `/pacientes/${pacienteId}/lesiones`),
  createLesion:  (data) => req('POST', '/lesiones', data),
  updateLesion:  (id, data) => req('PUT', `/lesiones/${id}`),
  deleteLesion:  (id) => req('DELETE', `/lesiones/${id}`),

  getSesiones:   (lesionId) => req('GET', `/lesiones/${lesionId}/sesiones`),
  createSesion:  (data) => req('POST', '/sesiones', data),
  updateSesion:  (id, data) => req('PUT', `/sesiones/${id}`),
  deleteSesion:  (id) => req('DELETE', `/sesiones/${id}`),

  getEjercicios:   () => req('GET', '/ejercicios'),
  createEjercicio: (data) => req('POST', '/ejercicios', data),
  updateEjercicio: (id, data) => req('PUT', `/ejercicios/${id}`, data),
  deleteEjercicio: (id) => req('DELETE', `/ejercicios/${id}`),

  getEjerciciosPaciente: (id) => req('GET', `/pacientes/${id}/ejercicios`),
  asignarEjercicio:      (id, data) => req('POST', `/pacientes/${id}/ejercicios`, data),
  quitarEjercicio:       (id) => req('DELETE', `/paciente-ejercicios/${id}`),

  getDashboard: () => req('GET', '/dashboard'),

  getTurnos:   (mes) => req('GET', `/turnos${mes ? `?mes=${mes}` : ''}`),
  getTurnosPaciente: (pacienteId) => req('GET', `/pacientes/${pacienteId}/turnos`),
  createTurno: (data) => req('POST', '/turnos', data),
  solicitarTurnoPaciente: (pacienteId, data) => req('POST', `/pacientes/${pacienteId}/turnos`, data),
  updateTurno: (id, data) => req('PUT', `/turnos/${id}`, data),
  deleteTurno: (id) => req('DELETE', `/turnos/${id}`),

  getDocumentos:   (pacienteId) => req('GET', `/pacientes/${pacienteId}/documentos`),
  deleteDocumento: (id) => req('DELETE', `/documentos/${id}`),
  uploadDocumento: (pacienteId, formData) => {
    const token = localStorage.getItem('kine_token')
    return fetch(`/api/kine/pacientes/${pacienteId}/documentos`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(r => r.json())
  },

  getMotivos:       (pacienteId) => req('GET', `/pacientes/${pacienteId}/motivos`),
  createMotivo:     (pacienteId, data) => req('POST', `/pacientes/${pacienteId}/motivos`, data),
  updateMotivo:     (id, data) => req('PUT', `/motivos/${id}`, data),
  deleteMotivo:     (id) => req('DELETE', `/motivos/${id}`),

  getEvoluciones:   (motivoId) => req('GET', `/motivos/${motivoId}/evoluciones`),
  createEvolucion:  (motivoId, data) => req('POST', `/motivos/${motivoId}/evoluciones`, data),
  updateEvolucion:  (id, data) => req('PUT', `/evoluciones/${id}`),
  deleteEvolucion:  (id) => req('DELETE', `/evoluciones/${id}`),
  togglePagado:     (id) => req('PATCH', `/evoluciones/${id}/pagar`),
  pagarTodo:        (pacienteId) => req('POST', `/pacientes/${pacienteId}/pagar-todo`),
  getSaldo:         (pacienteId) => req('GET', `/pacientes/${pacienteId}/saldo`),

  getEjerciciosGimnasio: (pacienteId) => req('GET', `/pacientes/${pacienteId}/ejercicios-gimnasio`),

  getEstudios:      (motivoId) => req('GET', `/motivos/${motivoId}/estudios`),
  deleteEstudio:    (id) => req('DELETE', `/estudios/${id}`),
  uploadEstudio:    (motivoId, formData) => {
    const token = localStorage.getItem('kine_token')
    return fetch(`/api/kine/motivos/${motivoId}/estudios`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(r => r.json())
  },

  getRutinasPaciente: (pacienteId) => req('GET', `/pacientes/${pacienteId}/rutinas`).then(normalizeRutinas),
  getRutinas:    (motivoId) => req('GET', `/motivos/${motivoId}/rutinas`).then(normalizeRutinas),
  createRutina:  (motivoId, data) => req('POST', `/motivos/${motivoId}/rutinas`, data),
  updateRutina:  (id, data) => req('PUT', `/rutinas/${id}`, data),
  deleteRutina:  (id) => req('DELETE', `/rutinas/${id}`),
  getRutinaProgreso: (rutinaId) => req('GET', `/rutinas/${rutinaId}/progreso`),
  marcarRutinaItem: (rutinaId, itemIndex, hecho) => req('PATCH', `/rutinas/${rutinaId}/progreso/items/${itemIndex}`, { hecho }),
  reiniciarRutinaIntento: (rutinaId) => req('POST', `/rutinas/${rutinaId}/progreso/reiniciar-intento`, {}),
  guardarRutinaFeedback: (rutinaId, data) => req('POST', `/rutinas/${rutinaId}/progreso/feedback`, data),
  getAdherenciaRutinas: (pacienteId) => req('GET', `/pacientes/${pacienteId}/adherencia-rutinas`),

  getDolorEvolucion: (id) => req('GET', `/pacientes/${id}/dolor`),

  claudeRutina: (descripcion) => req('POST', '/claude/rutina', { descripcion }),

  getNotas:     () => req('GET', '/notas'),
  createNota:   (texto) => req('POST', '/notas', { texto }),
  updateNota:   (id, texto) => req('PUT', `/notas/${id}`, { texto }),
  deleteNota:   (id) => req('DELETE', `/notas/${id}`),

  getMovimientos:    (tipo) => req('GET', `/movimientos${tipo ? `?tipo=${tipo}` : ''}`),
  createMovimiento:  (data) => req('POST', '/movimientos', data),
  deleteMovimiento:  (id) => req('DELETE', `/movimientos/${id}`),

  getSaldosTodos:      () => req('GET', '/saldos'),
  pagarSaldoPaciente:  (pacienteId) => req('POST', `/saldos/${pacienteId}/pagar`),
}
