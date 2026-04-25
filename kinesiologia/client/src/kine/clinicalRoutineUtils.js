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

export const ARTICULACION_FILTROS = [
  { id: 'Todos', label: 'Todos', emoji: '✨' },
  { id: 'tobillo', label: 'Tobillo / pie', emoji: '🦶' },
  { id: 'rodilla', label: 'Rodilla', emoji: '🦵' },
  { id: 'cadera', label: 'Cadera', emoji: '⚙️' },
  { id: 'lumbar', label: 'Lumbar', emoji: '⬇️' },
  { id: 'dorsal', label: 'Dorsal / torácica', emoji: '⬆️' },
  { id: 'hombro', label: 'Hombro / escápula', emoji: '💪' },
  { id: 'brazo', label: 'Brazo / codo', emoji: '🦾' },
  { id: 'core', label: 'Core', emoji: '◉' },
]

export const MOVILIDAD_PRESETS = [
  'Caminar', 'Bicicleta fija', 'Elíptico', 'Movilidad de tobillo', 'Movilidad de rodilla',
  'Movilidad de cadera', 'Movilidad lumbar', 'Movilidad torácica', 'Movilidad de hombro',
  'Movilidad cervical', 'Activación escapular', 'Activación de glúteo',
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

const EXTRA_CLINICAL_EXERCISES = [
  { name: 'Elevación de talones bilateral', group: 'Tobillo / pie', regiones: ['tobillo', 'rodilla'], tags: ['gemelos', 'sóleo'] },
  { name: 'Elevación de talones unilateral', group: 'Tobillo / pie', regiones: ['tobillo', 'rodilla'], tags: ['gemelos', 'sóleo'] },
  { name: 'Tibial anterior con banda', group: 'Tobillo / pie', regiones: ['tobillo'] },
  { name: 'Eversión de tobillo con banda', group: 'Tobillo / pie', regiones: ['tobillo'] },
  { name: 'Inversión de tobillo con banda', group: 'Tobillo / pie', regiones: ['tobillo'] },
  { name: 'Balance unipodal', group: 'Tobillo / pie', regiones: ['tobillo', 'rodilla', 'cadera', 'core'] },
  { name: 'Balance unipodal con alcance', group: 'Tobillo / pie', regiones: ['tobillo', 'rodilla', 'cadera', 'core'] },
  { name: 'Short foot', group: 'Tobillo / pie', regiones: ['tobillo'] },
  { name: 'Movilidad de tobillo en pared', group: 'Tobillo / pie', regiones: ['tobillo'] },

  { name: 'Extensión terminal de rodilla con banda', group: 'Rodilla', regiones: ['rodilla'] },
  { name: 'Isométrico de cuádriceps', group: 'Rodilla', regiones: ['rodilla', 'cadera'], tags: ['recto femoral'] },
  { name: 'Elevación de pierna recta', group: 'Rodilla', regiones: ['rodilla', 'cadera'], tags: ['recto femoral', 'psoas'] },
  { name: 'Spanish squat', group: 'Rodilla', regiones: ['rodilla', 'cadera'] },
  { name: 'Sentadilla a cajón', group: 'Rodilla', regiones: ['rodilla', 'cadera', 'core'] },
  { name: 'Step down', group: 'Rodilla', regiones: ['rodilla', 'cadera', 'tobillo'] },
  { name: 'Curl femoral con fitball', group: 'Rodilla', regiones: ['rodilla', 'cadera'], tags: ['isquiosurales'] },
  { name: 'Nórdico asistido', group: 'Rodilla', regiones: ['rodilla', 'cadera'], tags: ['isquiosurales'] },

  { name: 'Puente de glúteo', group: 'Cadera', regiones: ['cadera', 'lumbar', 'core'] },
  { name: 'Hip thrust', group: 'Cadera', regiones: ['cadera', 'lumbar', 'core'] },
  { name: 'Clamshell', group: 'Cadera', regiones: ['cadera'] },
  { name: 'Abducción de cadera lateral', group: 'Cadera', regiones: ['cadera'] },
  { name: 'Caminata lateral con banda', group: 'Cadera', regiones: ['cadera', 'rodilla'] },
  { name: 'Monster walk', group: 'Cadera', regiones: ['cadera', 'rodilla'] },
  { name: 'Peso muerto rumano unilateral', group: 'Cadera', regiones: ['cadera', 'rodilla', 'lumbar', 'core'], tags: ['isquiosurales'] },
  { name: 'Flexor de cadera con banda', group: 'Cadera', regiones: ['cadera', 'lumbar'], tags: ['psoas'] },
  { name: 'Rotación externa de cadera con banda', group: 'Cadera', regiones: ['cadera'] },
  { name: 'Rotación interna de cadera con banda', group: 'Cadera', regiones: ['cadera'] },

  { name: 'McGill curl up', group: 'Lumbar / core', regiones: ['lumbar', 'core'] },
  { name: 'Bird dog', group: 'Lumbar / core', regiones: ['lumbar', 'core', 'cadera'] },
  { name: 'Dead bug', group: 'Lumbar / core', regiones: ['lumbar', 'core', 'cadera'] },
  { name: 'Plancha frontal', group: 'Lumbar / core', regiones: ['lumbar', 'core', 'hombro'] },
  { name: 'Plancha lateral', group: 'Lumbar / core', regiones: ['lumbar', 'core', 'cadera', 'hombro'] },
  { name: 'Pallof press', group: 'Lumbar / core', regiones: ['lumbar', 'core', 'hombro'] },
  { name: 'Bisagra de cadera con palo', group: 'Lumbar / core', regiones: ['lumbar', 'cadera'] },
  { name: 'Extensión lumbar en banco romano', group: 'Lumbar / core', regiones: ['lumbar', 'cadera'] },

  { name: 'Open book torácico', group: 'Dorsal / torácica', regiones: ['dorsal', 'hombro'] },
  { name: 'Extensión torácica en foam roller', group: 'Dorsal / torácica', regiones: ['dorsal', 'hombro'] },
  { name: 'Cat camel', group: 'Dorsal / torácica', regiones: ['dorsal', 'lumbar'] },
  { name: 'Wall slides', group: 'Dorsal / torácica', regiones: ['dorsal', 'hombro'] },
  { name: 'Pullover con banda', group: 'Dorsal / torácica', regiones: ['dorsal', 'hombro'], tags: ['dorsal ancho'] },

  { name: 'Rotación externa hombro con banda', group: 'Hombro / escápula', regiones: ['hombro'] },
  { name: 'Rotación interna hombro con banda', group: 'Hombro / escápula', regiones: ['hombro'] },
  { name: 'Y T W escapular', group: 'Hombro / escápula', regiones: ['hombro', 'dorsal'] },
  { name: 'Serrato punch', group: 'Hombro / escápula', regiones: ['hombro', 'dorsal'] },
  { name: 'Push up plus', group: 'Hombro / escápula', regiones: ['hombro', 'dorsal', 'core'] },
  { name: 'Elevación en plano escapular', group: 'Hombro / escápula', regiones: ['hombro'] },
  { name: 'Remo bajo con banda', group: 'Hombro / escápula', regiones: ['hombro', 'dorsal'] },
  { name: 'Face pull con banda', group: 'Hombro / escápula', regiones: ['hombro', 'dorsal'] },

  { name: 'Flexoextensión de codo con mancuerna', group: 'Brazo / codo', regiones: ['brazo'] },
  { name: 'Curl bíceps con banda', group: 'Brazo / codo', regiones: ['brazo', 'hombro'], tags: ['bíceps biarticular'] },
  { name: 'Tríceps overhead con banda', group: 'Brazo / codo', regiones: ['brazo', 'hombro'], tags: ['tríceps largo'] },
  { name: 'Pronosupinación con mancuerna', group: 'Brazo / codo', regiones: ['brazo'] },
  { name: 'Isométrico de extensores de muñeca', group: 'Brazo / codo', regiones: ['brazo'] },
]

function normalizeText(value = '') {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function hasGymKeyword(name = '') {
  const s = normalizeText(name)
  return ['maquina', 'barra', 'mancuerna', 'polea', 'smith', 'press', 'prensa', 'curl', 'remo', 'jalon', 'camilla', 'banco'].some(k => s.includes(k))
}

function hasHomeKeyword(name = '') {
  const s = normalizeText(name)
  return ['banda', 'peso corporal', 'puente', 'plancha', 'bird dog', 'dead bug', 'flexion', 'sentadilla libre', 'step up', 'clamshell', 'movilidad', 'balance'].some(k => s.includes(k))
}

function inferRegions(name = '', group = '') {
  const s = normalizeText(`${name} ${group}`)
  const regions = new Set()
  if (/(tobillo|talon|talones|gemelo|soleo|tibial|evers|invers|pie)/.test(s)) regions.add('tobillo')
  if (/(rodilla|cuadriceps|camilla|sentadilla|prensa|zancada|bulgara|step|femoral|nordico|extension de piernas|curl femoral|gemelo)/.test(s)) regions.add('rodilla')
  if (/(cadera|gluteo|peso muerto|stiff|hip thrust|puente|abduccion|aduccion|sumo|zancada|sentadilla|psoas|flexor)/.test(s)) regions.add('cadera')
  if (/(lumbar|bisagra|peso muerto|stiff|core|plancha|bird dog|dead bug|pallof|extension lumbar)/.test(s)) regions.add('lumbar')
  if (/(dorsal|torac|espalda|remo|jalon|dominada|pulldown|pullover|trapecio|face pull)/.test(s)) regions.add('dorsal')
  if (/(hombro|deltoides|press militar|elevacion|rotacion|escap|serrato|face pull|pecho|press de banca|fondos|flexion de pecho|pullover)/.test(s)) regions.add('hombro')
  if (/(biceps|triceps|curl|codo|antebrazo|muneca|pulley|frances)/.test(s)) regions.add('brazo')
  if (/(core|plancha|bird dog|dead bug|pallof|abdominal|crunch|rueda|rotacion|balance)/.test(s)) regions.add('core')
  if (!regions.size && /miembros inferiores|pierna/.test(s)) ['tobillo', 'rodilla', 'cadera'].forEach(r => regions.add(r))
  if (!regions.size && /espalda/.test(s)) ['dorsal', 'lumbar'].forEach(r => regions.add(r))
  if (!regions.size && /pectorales|deltoides/.test(s)) regions.add('hombro')
  return [...regions]
}

function getCombinedExerciseLibrary() {
  const base = exerciseLibrary.flatMap(section => section.items.map(item => ({
    ...item,
    group: section.title,
    regiones: item.regiones || inferRegions(item.name, section.title),
    source: 'base',
  })))
  const extras = EXTRA_CLINICAL_EXERCISES.map(item => ({ images: [], source: 'clinica', ...item }))
  const seen = new Set()
  return [...extras, ...base].filter(item => {
    const key = normalizeText(item.name)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function getExerciseGroups() {
  return ['Todos', ...new Set(getCombinedExerciseLibrary().map(item => item.group).filter(Boolean))]
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
  const found = getCombinedExerciseLibrary().find(item => item.name === nombre)
  return found?.images?.[0] || null
}

export function getExerciseMeta(nombre) {
  const found = getCombinedExerciseLibrary().find(item => item.name === nombre)
  return found || null
}

export function getExerciseOptions(contexto = 'gimnasio', search = '', group = 'Todos', region = 'Todos') {
  const q = normalizeText(search.trim())
  return getCombinedExerciseLibrary()
    .filter(item => {
      if (group !== 'Todos' && item.group !== group) return false
      if (region !== 'Todos' && !(item.regiones || []).includes(region)) return false
      const haystack = normalizeText(`${item.name} ${item.group} ${(item.tags || []).join(' ')}`)
      if (q && !haystack.includes(q)) return false
      if (contexto === 'gimnasio') return true
      if (contexto === 'casa') return item.source === 'clinica' || hasHomeKeyword(item.name) || !hasGymKeyword(item.name)
      if (contexto === 'campo') return item.source === 'clinica' || hasHomeKeyword(item.name) || (item.regiones || []).some(r => ['tobillo', 'rodilla', 'cadera', 'lumbar', 'core'].includes(r))
      return true
    })
}

export function normalizeRoutineItems(rutina = {}) {
  const base = Array.isArray(rutina.ejercicios) ? rutina.ejercicios : []
  return base.map((item) => {
    if (item.tipo) return { ...item, imagen: item.imagen || getExerciseImage(item.nombre) }
    return {
      tipo: 'ejercicio', bloque: 'gimnasio', nombre: item.nombre || item.name || 'Ejercicio',
      series: item.series ?? '', repeticiones: item.repeticiones ?? item.reps ?? '', segundos: item.segundos ?? '', pausa: item.pausa ?? '',
      indicacion: item.indicacion ?? item.nota ?? '', imagen: item.imagen || getExerciseImage(item.nombre || item.name),
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
  return { ...rutina, ejercicios: items, ejercicios_libres: makeRoutineMeta(contexto, extraMeta) }
}

export function summarizeItem(item) {
  if (item.tipo === 'movilidad') return [item.duracion, item.detalle].filter(Boolean).join(' · ') || 'Entrada en calor / movilidad'
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
