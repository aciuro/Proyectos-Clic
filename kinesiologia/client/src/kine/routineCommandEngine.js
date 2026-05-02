import { getExerciseSuggestions, inferArticulationFromText } from './exerciseSuggestions.js'

function n(text = '') {
  return String(text).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function parseNumber(text, fallback = '') {
  const match = String(text).match(/(\d+)/)
  return match ? match[1] : fallback
}

function itemName(item = {}) {
  return n(item.nombre || item.name || item.titulo || item.texto || '')
}

function matchesItem(item, wanted) {
  const name = itemName(item)
  const q = n(wanted)
  if (!q) return false
  return name.includes(q) || q.split(/\s+/).some(t => t.length > 3 && name.includes(t))
}

function agentItem(name, duration = '15 min', frequency = 'post rutina') {
  return { tipo: 'agente', bloque: 'post', nombre: name, duracion: duration, frecuencia: frequency, detalle: '' }
}

function indicationItem(text) {
  return { tipo: 'indicacion', bloque: 'indicacion', texto: text }
}

function exerciseItem(name, patch = {}) {
  return { tipo: 'ejercicio', bloque: 'gimnasio', nombre: name, series: '3', repeticiones: '10', pausa: '60 seg', indicacion: '', ...patch }
}

function removeByText(items, query) {
  const q = n(query)
  return items.filter(it => !matchesItem(it, q))
}

function reorderByBlocks(items) {
  const order = { movilidad: 0, cardio: 1, ejercicio: 2, campo: 3, agente: 4, indicacion: 5, post: 4, gimnasio: 2 }
  function type(it) { return it.tipo || it.bloque || 'ejercicio' }
  return [...items].sort((a, b) => (order[type(a)] ?? 9) - (order[type(b)] ?? 9))
}

export function applyRoutineCommand(rutina = {}, command = '') {
  const raw = String(command || '').trim()
  const text = n(raw)
  let items = Array.isArray(rutina.ejercicios) ? [...rutina.ejercicios] : []
  let next = { ...rutina, ejercicios: items }
  const notes = []

  if (!raw) return { rutina, applied: false, message: 'Escribí qué querés modificar.' }

  // Frecuencia de rutina
  if (text.includes('veces') && (text.includes('rutina') || text.includes('proxima sesion') || text.includes('control'))) {
    const qty = parseNumber(text, '')
    if (qty) {
      next.veces = Number(qty)
      next.frecuencia = `${qty} veces antes del próximo control`
      notes.push(`Frecuencia cambiada a ${qty} veces antes del próximo control.`)
    }
  }

  // Series globales
  if (text.includes('series')) {
    const qty = parseNumber(text, '')
    if (qty) {
      items = items.map(it => it.tipo === 'ejercicio' || it.bloque === 'gimnasio' ? { ...it, series: qty } : it)
      notes.push(`Series cambiadas a ${qty} en ejercicios.`)
    }
  }

  // Repeticiones globales
  if (text.includes('repeticion') || text.includes('repeticiones') || text.includes('reps')) {
    const qty = parseNumber(text, '')
    if (qty) {
      items = items.map(it => it.tipo === 'ejercicio' || it.bloque === 'gimnasio' ? { ...it, repeticiones: qty, reps: qty } : it)
      notes.push(`Repeticiones cambiadas a ${qty} en ejercicios.`)
    }
  }

  // Agentes físicos
  if (text.includes('hielo')) {
    const qty = parseNumber(text, '15')
    if (text.includes('saca') || text.includes('elimina') || text.includes('borra') || text.includes('quita')) {
      items = removeByText(items, 'hielo')
      notes.push('Hielo eliminado.')
    } else {
      items.push(agentItem('Hielo', `${qty} min`, 'post rutina'))
      notes.push(`Hielo agregado ${qty} min.`)
    }
  }
  if (text.includes('calor')) {
    const qty = parseNumber(text, '15')
    if (text.includes('saca') || text.includes('elimina') || text.includes('borra') || text.includes('quita')) {
      items = removeByText(items, 'calor')
      notes.push('Calor eliminado.')
    } else {
      items.push(agentItem('Calor', `${qty} min`, 'previo o según indicación'))
      notes.push(`Calor agregado ${qty} min.`)
    }
  }
  if (text.includes('contraste')) {
    if (text.includes('saca') || text.includes('elimina') || text.includes('borra') || text.includes('quita')) {
      items = removeByText(items, 'contraste')
      notes.push('Baño de contraste eliminado.')
    } else {
      items.push(agentItem('Baño de contraste', '1 frío / 3 calor x 3 ciclos', '1 vez por día'))
      notes.push('Baño de contraste agregado.')
    }
  }

  // Orden clínico
  if (text.includes('ordena') || text.includes('ordenar') || text.includes('primero movilidad')) {
    items = reorderByBlocks(items)
    notes.push('Orden clínico aplicado: movilidad/cardio, ejercicios, campo, agentes, indicaciones.')
  }

  // Eliminar ejercicio por nombre
  if (text.includes('saca') || text.includes('elimina') || text.includes('borra') || text.includes('quita')) {
    const afterWords = raw.replace(/^(saca|sacá|elimina|eliminá|borra|borrá|quita|quitá)\s+/i, '')
    if (afterWords && !n(afterWords).includes('hielo') && !n(afterWords).includes('calor') && !n(afterWords).includes('contraste')) {
      const before = items.length
      items = removeByText(items, afterWords)
      if (items.length !== before) notes.push(`Eliminado: ${afterWords}.`)
    }
  }

  // Agregar sugerencias o ejercicio específico
  if (text.includes('agrega') || text.includes('agreg') || text.includes('sumar') || text.includes('pone')) {
    const articulation = inferArticulationFromText([rutina.nombre, rutina.notas, raw].join(' '))
    const suggested = getExerciseSuggestions({ articulation, pain: 3, objetivo: 'rehab', query: raw }).slice(0, 1)
    if (suggested.length && !text.includes('hielo') && !text.includes('calor') && !text.includes('contraste')) {
      items.push(suggested[0])
      notes.push(`Agregado: ${suggested[0].nombre}.`)
    } else if (!text.includes('hielo') && !text.includes('calor') && !text.includes('contraste')) {
      const name = raw.replace(/^(agrega|agregá|sumar|sumá|pone|poné)\s+/i, '')
      if (name) {
        items.push(exerciseItem(name))
        notes.push(`Agregado como ejercicio libre: ${name}.`)
      }
    }
  }

  // Indicaciones
  if (text.includes('dolor') && text.includes('no superar')) {
    const qty = parseNumber(text, '5')
    items.push(indicationItem(`No superar dolor ${qty}/10. Suspender si aumenta al día siguiente.`))
    notes.push(`Indicación de dolor agregada: no superar ${qty}/10.`)
  }

  next = { ...next, ejercicios: items }
  if (!notes.length) return { rutina, applied: false, message: 'No pude interpretar el pedido. Probá: “agregá hielo 15 min”, “cambiá series a 3”, “sacá Spanish squat”.' }
  return { rutina: next, applied: true, message: notes.join(' ') }
}
