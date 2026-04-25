import { exerciseLibrary } from './exerciseLibrary.js'

export const CONTEXTOS_RUTINA = [
  { id: 'gimnasio', label: 'Gimnasio', emoji: '🏋️', hint: 'Máquinas, barra, mancuernas y poleas.' },
  { id: 'campo', label: 'Campo', emoji: '🏃', hint: 'Pasadas, intermitentes, trote y retorno deportivo.' },
  { id: 'casa', label: 'Casa', emoji: '🏠', hint: 'Peso corporal, bandas, movilidad y control.' },
]

export const TIPOS_ITEM = [
  { id: 'movilidad', label: 'Movilidad', emoji: '🟢' },
  { id: 'ejercicio', label: 'Gimnasio / Fuerza', emoji: '🔵' },
  { id: 'campo', label: 'Campo', emoji: '🟡' },
  { id: 'cardio', label: 'Cardio', emoji: '🟣' },
  { id: 'agente', label: 'Agente físico', emoji: '🧊' },
  { id: 'indicacion', label: 'Indicación', emoji: '📝' },
]

export const MOVILIDAD_PRESETS = [
  'Caminar',
  'Bicicleta fija',
  'Elíptico',
  'Movilidad de hombro',
  'Movilidad cervical',
  'Movilidad torácica',
  'Movilidad de cadera',
  'Activación escapular',
  'Activación de glúteo',
]

export const CARDIO_PRESETS = ['Bicicleta fija', 'Cinta', 'Caminata', 'Elíptico', 'Trote continuo']
export const CAMPO_PRESETS = ['Pasadas', 'Intermitente', 'Trote', 'Fondo', 'Cambios de ritmo', 'Trabajo técnico', 'Aceleraciones', 'Desaceleraciones']
export const AGENTES_FISICOS = ['Hielo', 'Calor', 'Baño de contraste']

export const QUICK_ROUTINE_FLOW = [
  { id: 'movilidad', label: '1. Entrada en calor', helper: 'Movilidad, bici, caminata o activación inicial.' },
  { id: 'ejercicio', label: '2. Gimnasio / fuerza', helper: 'Ejercicios con carga, máquina, polea, banda o peso corporal.' },
  { id: 'campo', label: '3. Campo', helper: 'Pasadas, intermitentes, trote o retorno deportivo.' },
  { id: 'agente', label: '4. Post entrenamiento', helper: 'Hielo, calor o contraste después de entrenar.' },
]

function hasGymKeyword(name = '') {
  const s = name.toLowerCase()
  return ['máquina', 'maquina', 'barra', 'mancuerna', 'polea', 'smith', 'press', 'prensa', 'curl', 'remo', 'jalón', 'jalon', 'camilla', 'banco'].some(k => s.includes(k))
}

function hasHomeKeyword(name = '') {
  const s = name.toLowerCase()
  return ['banda', 'peso corporal', 'puente', 'plancha', 'bird dog', 'dead bug', 'flexión', 'flexion', 'sentadilla libre', 'step up', 'clamshell', 'movilidad'].some(k => s.includes(k))
}

export function parseRoutineMeta(rutina = {}) {
  if (!rutina.ejercicios_libres) return {}
  try {
    const parsed = JSON.parse(rutina.ejercicios_libres)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function makeRoutineMeta(contexto = 'gimnasio', extra = {}) {
  return JSON.stringify({ version: 2, contexto, ...extra })
}

export function getExerciseImage(nombre) {
  for (const group of exerciseLibrary) {
    const found = group.items.find(item => item.name === nombre)
    if (found) return found.images?.[0] || null
  }
  return null
}

export function getExerciseMeta(nombre) {
  for (const group of exerciseLibrary) {
    const found = group.items.find(item => item.name === nombre)
    if (found) return { ...found, group: group.title }
  }
  return null
}

export function getExerciseOptions(contexto = 'gimnasio', search = '', group = 'Todos') {
  const q = search.trim().toLowerCase()
  return exerciseLibrary.flatMap(section => {
    if (group !== 'Todos' && section.title !== group) return []
    return section.items
      .filter(item => {
        if (q && !item.name.toLowerCase().includes(q)) return false
        if (contexto === 'gimnasio') return true
        if (contexto === 'casa') return hasHomeKeyword(item.name) || !hasGymKeyword(item.name)
        if (contexto === 'campo') return hasHomeKeyword(item.name) || ['Miembros inferiores y pierna', 'Core'].includes(section.title)
        return true
      })
      .map(item => ({ ...item, group: section.title }))
  })
}

export function normalizeRoutineItems(rutina = {}) {
  const base = Array.isArray(rutina.ejercicios) ? rutina.ejercicios : []
  return base.map((item) => {
    if (item.tipo) return { ...item, imagen: item.imagen || getExerciseImage(item.nombre) }
    return {
      tipo: 'ejercicio',
      bloque: 'gimnasio',
      nombre: item.nombre || item.name || 'Ejercicio',
      series: item.series ?? '',
      repeticiones: item.repeticiones ?? item.reps ?? '',
      segundos: item.segundos ?? '',
      pausa: item.pausa ?? '',
      indicacion: item.indicacion ?? item.nota ?? '',
      imagen: item.imagen || getExerciseImage(item.nombre || item.name),
    }
  })
}

export function getRoutineContext(rutina = {}) {
  const meta = parseRoutineMeta(rutina)
  return rutina.contexto || rutina.contexto_rutina || meta.contexto || 'gimnasio'
}

export function getRoutineFrequency(rutina = {}) {
  const meta = parseRoutineMeta(rutina)
  return meta.frecuencia || rutina.frecuencia || '2-3 veces antes del próximo control'
}

export function getRoutineFocus(rutina = {}) {
  const meta = parseRoutineMeta(rutina)
  return Array.isArray(meta.focos) ? meta.focos : ['gimnasio']
}

export function buildRoutinePayload(rutina, contexto, items, extraMeta = {}) {
  return {
    ...rutina,
    ejercicios: items,
    ejercicios_libres: makeRoutineMeta(contexto, extraMeta),
  }
}

export function summarizeItem(item) {
  if (item.tipo === 'movilidad') {
    return [item.duracion, item.detalle].filter(Boolean).join(' · ') || 'Entrada en calor / movilidad'
  }
  if (item.tipo === 'ejercicio') {
    const parts = []
    if (item.series) parts.push(`${item.series} series`)
    if (item.repeticiones) parts.push(`${item.repeticiones} reps`)
    if (item.segundos) parts.push(`${item.segundos} seg`)
    if (item.pausa) parts.push(`pausa ${item.pausa}`)
    return parts.join(' · ') || item.indicacion || 'Sin dosificación'
  }
  if (item.tipo === 'cardio') return [item.duracion, item.intensidad, item.detalle].filter(Boolean).join(' · ') || 'Cardio libre'
  if (item.tipo === 'campo') return item.detalle || 'Trabajo de campo libre'
  if (item.tipo === 'agente') {
    if (item.nombre === 'Baño de contraste') return item.detalle || '1 min frío / 3 min calor · 3 a 4 rondas'
    return [item.duracion, item.frecuencia, item.detalle].filter(Boolean).join(' · ') || item.nombre || 'Agente físico'
  }
  if (item.tipo === 'indicacion') return item.texto || 'Indicación clínica'
  return item.nombre || 'Ítem'
}
