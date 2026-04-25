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

export const CONTRACCION_FILTROS = [
  { id: 'Todos', label: 'Todas', emoji: '✨' },
  { id: 'concentrica', label: 'Concéntrica', emoji: '⬆️' },
  { id: 'isometrica', label: 'Isométrica', emoji: '⏸️' },
  { id: 'excentrica', label: 'Excéntrica', emoji: '⬇️' },
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
  { name: 'Elevación de talones bilateral', group: 'Tobillo / pie', regiones: ['tobillo', 'rodilla'], contracciones: ['concentrica'], tags: ['gemelos', 'sóleo'] },
  { name: 'Elevación de talones unilateral', group: 'Tobillo / pie', regiones: ['tobillo', 'rodilla'], contracciones: ['concentrica'], tags: ['gemelos', 'sóleo'] },
  { name: 'Elevación de talones excéntrica bilateral', group: 'Tobillo / pie', regiones: ['tobillo', 'rodilla'], contracciones: ['excentrica'], tags: ['gemelos', 'sóleo', 'aquiles', 'bajar lento'] },
  { name: 'Elevación de talones excéntrica unilateral', group: 'Tobillo / pie', regiones: ['tobillo', 'rodilla'], contracciones: ['excentrica'], tags: ['gemelos', 'sóleo', 'aquiles', 'bajar lento'] },
  { name: 'Gemelo excéntrico: subir con dos y bajar con una', group: 'Tobillo / pie', regiones: ['tobillo', 'rodilla'], contracciones: ['excentrica'], tags: ['aquiles', 'gemelo', 'dos a una'] },
  { name: 'Sóleo excéntrico con rodilla flexionada', group: 'Tobillo / pie', regiones: ['tobillo', 'rodilla'], contracciones: ['excentrica'], tags: ['sóleo', 'aquiles'] },
  { name: 'Isométrico de gemelo en punta de pie', group: 'Tobillo / pie', regiones: ['tobillo', 'rodilla'], contracciones: ['isometrica'], tags: ['gemelos', 'aquiles'] },
  { name: 'Tibial anterior con banda', group: 'Tobillo / pie', regiones: ['tobillo'], contracciones: ['concentrica'] },
  { name: 'Tibial anterior excéntrico con banda', group: 'Tobillo / pie', regiones: ['tobillo'], contracciones: ['excentrica'] },
  { name: 'Eversión de tobillo con banda', group: 'Tobillo / pie', regiones: ['tobillo'], contracciones: ['concentrica'] },
  { name: 'Eversión de tobillo excéntrica con banda', group: 'Tobillo / pie', regiones: ['tobillo'], contracciones: ['excentrica'] },
  { name: 'Inversión de tobillo con banda', group: 'Tobillo / pie', regiones: ['tobillo'], contracciones: ['concentrica'] },
  { name: 'Inversión de tobillo excéntrica con banda', group: 'Tobillo / pie', regiones: ['tobillo'], contracciones: ['excentrica'] },
  { name: 'Balance unipodal', group: 'Tobillo / pie', regiones: ['tobillo', 'rodilla', 'cadera', 'core'], contracciones: ['isometrica'] },
  { name: 'Balance unipodal con alcance', group: 'Tobillo / pie', regiones: ['tobillo', 'rodilla', 'cadera', 'core'], contracciones: ['isometrica'] },
  { name: 'Short foot', group: 'Tobillo / pie', regiones: ['tobillo'], contracciones: ['isometrica'] },
  { name: 'Movilidad de tobillo en pared', group: 'Tobillo / pie', regiones: ['tobillo'], contracciones: [] },

  { name: 'Camilla de cuádriceps bilateral', group: 'Rodilla / máquinas', regiones: ['rodilla', 'cadera'], contracciones: ['concentrica'], tags: ['máquina', 'cuádriceps', 'recto femoral'] },
  { name: 'Camilla de cuádriceps unilateral', group: 'Rodilla / máquinas', regiones: ['rodilla', 'cadera'], contracciones: ['concentrica'], tags: ['máquina', 'cuádriceps', 'recto femoral', 'unilateral'] },
  { name: 'Camilla de cuádriceps excéntrica bilateral', group: 'Rodilla / máquinas', regiones: ['rodilla', 'cadera'], contracciones: ['excentrica'], tags: ['máquina', 'cuádriceps', 'bajar lento'] },
  { name: 'Camilla de cuádriceps: subir con dos y bajar con una', group: 'Rodilla / máquinas', regiones: ['rodilla', 'cadera'], contracciones: ['excentrica'], tags: ['máquina', 'cuádriceps', 'dos a una'] },
  { name: 'Isométrico en camilla de cuádriceps a 60°', group: 'Rodilla / máquinas', regiones: ['rodilla', 'cadera'], contracciones: ['isometrica'], tags: ['máquina', 'cuádriceps'] },
  { name: 'Isométrico en camilla de cuádriceps a 90°', group: 'Rodilla / máquinas', regiones: ['rodilla', 'cadera'], contracciones: ['isometrica'], tags: ['máquina', 'cuádriceps'] },
  { name: 'Camilla de isquiotibiales bilateral', group: 'Rodilla / máquinas', regiones: ['rodilla', 'cadera'], contracciones: ['concentrica'], tags: ['máquina', 'isquiosurales', 'femoral'] },
  { name: 'Camilla de isquiotibiales unilateral', group: 'Rodilla / máquinas', regiones: ['rodilla', 'cadera'], contracciones: ['concentrica'], tags: ['máquina', 'isquiosurales', 'femoral', 'unilateral'] },
  { name: 'Camilla de isquiotibiales excéntrica bilateral', group: 'Rodilla / máquinas', regiones: ['rodilla', 'cadera'], contracciones: ['excentrica'], tags: ['máquina', 'isquiosurales', 'bajar lento'] },
  { name: 'Camilla de isquiotibiales: subir con dos y bajar con una', group: 'Rodilla / máquinas', regiones: ['rodilla', 'cadera'], contracciones: ['excentrica'], tags: ['máquina', 'isquiosurales', 'dos a una'] },
  { name: 'Isométrico de isquiotibiales en camilla', group: 'Rodilla / máquinas', regiones: ['rodilla', 'cadera'], contracciones: ['isometrica'], tags: ['máquina', 'isquiosurales'] },
  { name: 'Prensa bilateral', group: 'Rodilla / máquinas', regiones: ['rodilla', 'cadera', 'tobillo'], contracciones: ['concentrica'], tags: ['máquina', 'prensa'] },
  { name: 'Prensa unilateral', group: 'Rodilla / máquinas', regiones: ['rodilla', 'cadera', 'tobillo'], contracciones: ['concentrica'], tags: ['máquina', 'prensa', 'unilateral'] },
  { name: 'Prensa excéntrica bilateral', group: 'Rodilla / máquinas', regiones: ['rodilla', 'cadera', 'tobillo'], contracciones: ['excentrica'], tags: ['máquina', 'prensa', 'bajar lento'] },
  { name: 'Prensa: subir con dos y bajar con una', group: 'Rodilla / máquinas', regiones: ['rodilla', 'cadera', 'tobillo'], contracciones: ['excentrica'], tags: ['máquina', 'prensa', 'dos a una'] },
  { name: 'Sentadilla hack bilateral', group: 'Rodilla / máquinas', regiones: ['rodilla', 'cadera'], contracciones: ['concentrica'], tags: ['máquina'] },
  { name: 'Sentadilla hack excéntrica', group: 'Rodilla / máquinas', regiones: ['rodilla', 'cadera'], contracciones: ['excentrica'], tags: ['máquina', 'bajar lento'] },

  { name: 'Extensión terminal de rodilla con banda', group: 'Rodilla', regiones: ['rodilla'], contracciones: ['concentrica'] },
  { name: 'Extensión terminal de rodilla isométrica', group: 'Rodilla', regiones: ['rodilla'], contracciones: ['isometrica'] },
  { name: 'Isométrico de cuádriceps', group: 'Rodilla', regiones: ['rodilla', 'cadera'], contracciones: ['isometrica'], tags: ['recto femoral'] },
  { name: 'Elevación de pierna recta', group: 'Rodilla', regiones: ['rodilla', 'cadera'], contracciones: ['isometrica', 'concentrica'], tags: ['recto femoral', 'psoas'] },
  { name: 'Spanish squat', group: 'Rodilla', regiones: ['rodilla', 'cadera'], contracciones: ['isometrica'] },
  { name: 'Spanish squat excéntrica', group: 'Rodilla', regiones: ['rodilla', 'cadera'], contracciones: ['excentrica'] },
  { name: 'Sentadilla a cajón', group: 'Rodilla', regiones: ['rodilla', 'cadera', 'core'], contracciones: ['concentrica'] },
  { name: 'Sentadilla a cajón excéntrica', group: 'Rodilla', regiones: ['rodilla', 'cadera', 'core'], contracciones: ['excentrica'] },
  { name: 'Sentadilla declinada excéntrica', group: 'Rodilla', regiones: ['rodilla', 'cadera', 'tobillo'], contracciones: ['excentrica'], tags: ['tendón rotuliano', 'bajar lento'] },
  { name: 'Step down', group: 'Rodilla', regiones: ['rodilla', 'cadera', 'tobillo'], contracciones: ['concentrica'] },
  { name: 'Step down excéntrico', group: 'Rodilla', regiones: ['rodilla', 'cadera', 'tobillo'], contracciones: ['excentrica'], tags: ['bajar lento'] },
  { name: 'Curl femoral con fitball', group: 'Rodilla', regiones: ['rodilla', 'cadera'], contracciones: ['concentrica'], tags: ['isquiosurales'] },
  { name: 'Curl femoral excéntrico con fitball', group: 'Rodilla', regiones: ['rodilla', 'cadera'], contracciones: ['excentrica'], tags: ['isquiosurales'] },
  { name: 'Nórdico asistido', group: 'Rodilla', regiones: ['rodilla', 'cadera'], contracciones: ['excentrica'], tags: ['isquiosurales'] },
  { name: 'Nórdico excéntrico', group: 'Rodilla', regiones: ['rodilla', 'cadera'], contracciones: ['excentrica'], tags: ['isquiosurales'] },

  { name: 'Puente de glúteo', group: 'Cadera', regiones: ['cadera', 'lumbar', 'core'], contracciones: ['concentrica', 'isometrica'] },
  { name: 'Puente de glúteo unilateral', group: 'Cadera', regiones: ['cadera', 'lumbar', 'core'], contracciones: ['concentrica', 'isometrica'] },
  { name: 'Hip thrust', group: 'Cadera', regiones: ['cadera', 'lumbar', 'core'], contracciones: ['concentrica'] },
  { name: 'Hip thrust unilateral', group: 'Cadera', regiones: ['cadera', 'lumbar', 'core'], contracciones: ['concentrica'] },
  { name: 'Hip thrust excéntrico', group: 'Cadera', regiones: ['cadera', 'lumbar', 'core'], contracciones: ['excentrica'] },
  { name: 'Isométrico de hip thrust arriba', group: 'Cadera', regiones: ['cadera', 'lumbar', 'core'], contracciones: ['isometrica'] },
  { name: 'Clamshell', group: 'Cadera', regiones: ['cadera'], contracciones: ['concentrica'] },
  { name: 'Clamshell isométrico', group: 'Cadera', regiones: ['cadera'], contracciones: ['isometrica'] },
  { name: 'Abducción de cadera lateral', group: 'Cadera', regiones: ['cadera'], contracciones: ['concentrica'] },
  { name: 'Abducción de cadera excéntrica', group: 'Cadera', regiones: ['cadera'], contracciones: ['excentrica'] },
  { name: 'Caminata lateral con banda', group: 'Cadera', regiones: ['cadera', 'rodilla'], contracciones: ['isometrica'] },
  { name: 'Monster walk', group: 'Cadera', regiones: ['cadera', 'rodilla'], contracciones: ['isometrica'] },
  { name: 'Peso muerto rumano bilateral', group: 'Cadera', regiones: ['cadera', 'rodilla', 'lumbar', 'core'], contracciones: ['concentrica'], tags: ['isquiosurales'] },
  { name: 'Peso muerto rumano unilateral', group: 'Cadera', regiones: ['cadera', 'rodilla', 'lumbar', 'core'], contracciones: ['concentrica'], tags: ['isquiosurales'] },
  { name: 'Peso muerto rumano excéntrico', group: 'Cadera', regiones: ['cadera', 'rodilla', 'lumbar', 'core'], contracciones: ['excentrica'], tags: ['isquiosurales', 'bajar lento'] },
  { name: 'Copenhagen plank corto', group: 'Cadera', regiones: ['cadera', 'rodilla', 'core'], contracciones: ['isometrica'], tags: ['aductores'] },
  { name: 'Copenhagen excéntrico', group: 'Cadera', regiones: ['cadera', 'rodilla', 'core'], contracciones: ['excentrica'], tags: ['aductores'] },
  { name: 'Flexor de cadera con banda', group: 'Cadera', regiones: ['cadera', 'lumbar'], contracciones: ['concentrica'], tags: ['psoas'] },
  { name: 'Rotación externa de cadera con banda', group: 'Cadera', regiones: ['cadera'], contracciones: ['concentrica'] },
  { name: 'Rotación interna de cadera con banda', group: 'Cadera', regiones: ['cadera'], contracciones: ['concentrica'] },

  { name: 'McGill curl up', group: 'Lumbar / core', regiones: ['lumbar', 'core'], contracciones: ['isometrica'] },
  { name: 'Bird dog', group: 'Lumbar / core', regiones: ['lumbar', 'core', 'cadera'], contracciones: ['isometrica'] },
  { name: 'Dead bug', group: 'Lumbar / core', regiones: ['lumbar', 'core', 'cadera'], contracciones: ['isometrica'] },
  { name: 'Plancha frontal', group: 'Lumbar / core', regiones: ['lumbar', 'core', 'hombro'], contracciones: ['isometrica'] },
  { name: 'Plancha lateral', group: 'Lumbar / core', regiones: ['lumbar', 'core', 'cadera', 'hombro'], contracciones: ['isometrica'] },
  { name: 'Pallof press', group: 'Lumbar / core', regiones: ['lumbar', 'core', 'hombro'], contracciones: ['isometrica'] },
  { name: 'Pallof press concéntrico', group: 'Lumbar / core', regiones: ['lumbar', 'core', 'hombro'], contracciones: ['concentrica'] },
  { name: 'Bisagra de cadera con palo', group: 'Lumbar / core', regiones: ['lumbar', 'cadera'], contracciones: [] },
  { name: 'Extensión lumbar en banco romano', group: 'Lumbar / core', regiones: ['lumbar', 'cadera'], contracciones: ['concentrica'] },
  { name: 'Extensión lumbar excéntrica en banco romano', group: 'Lumbar / core', regiones: ['lumbar', 'cadera'], contracciones: ['excentrica'] },

  { name: 'Open book torácico', group: 'Dorsal / torácica', regiones: ['dorsal', 'hombro'], contracciones: [] },
  { name: 'Extensión torácica en foam roller', group: 'Dorsal / torácica', regiones: ['dorsal', 'hombro'], contracciones: [] },
  { name: 'Cat camel', group: 'Dorsal / torácica', regiones: ['dorsal', 'lumbar'], contracciones: [] },
  { name: 'Wall slides', group: 'Dorsal / torácica', regiones: ['dorsal', 'hombro'], contracciones: ['concentrica'] },
  { name: 'Pullover con banda', group: 'Dorsal / torácica', regiones: ['dorsal', 'hombro'], contracciones: ['concentrica'], tags: ['dorsal ancho'] },
  { name: 'Pullover excéntrico con banda', group: 'Dorsal / torácica', regiones: ['dorsal', 'hombro'], contracciones: ['excentrica'], tags: ['dorsal ancho'] },

  { name: 'Rotación externa hombro con banda', group: 'Hombro / escápula', regiones: ['hombro'], contracciones: ['concentrica'] },
  { name: 'Rotación externa hombro excéntrica', group: 'Hombro / escápula', regiones: ['hombro'], contracciones: ['excentrica'] },
  { name: 'Rotación externa hombro isométrica', group: 'Hombro / escápula', regiones: ['hombro'], contracciones: ['isometrica'] },
  { name: 'Rotación interna hombro con banda', group: 'Hombro / escápula', regiones: ['hombro'], contracciones: ['concentrica'] },
  { name: 'Rotación interna hombro excéntrica', group: 'Hombro / escápula', regiones: ['hombro'], contracciones: ['excentrica'] },
  { name: 'Rotación interna hombro isométrica', group: 'Hombro / escápula', regiones: ['hombro'], contracciones: ['isometrica'] },
  { name: 'Y T W escapular', group: 'Hombro / escápula', regiones: ['hombro', 'dorsal'], contracciones: ['isometrica', 'concentrica'] },
  { name: 'Serrato punch', group: 'Hombro / escápula', regiones: ['hombro', 'dorsal'], contracciones: ['concentrica'] },
  { name: 'Push up plus', group: 'Hombro / escápula', regiones: ['hombro', 'dorsal', 'core'], contracciones: ['concentrica', 'isometrica'] },
  { name: 'Elevación en plano escapular', group: 'Hombro / escápula', regiones: ['hombro'], contracciones: ['concentrica'] },
  { name: 'Elevación en plano escapular excéntrica', group: 'Hombro / escápula', regiones: ['hombro'], contracciones: ['excentrica'] },
  { name: 'Remo bajo con banda', group: 'Hombro / escápula', regiones: ['hombro', 'dorsal'], contracciones: ['concentrica'] },
  { name: 'Face pull con banda', group: 'Hombro / escápula', regiones: ['hombro', 'dorsal'], contracciones: ['concentrica'] },

  { name: 'Cruce de poleas plano', group: 'Poleas / pecho', regiones: ['hombro'], contracciones: ['concentrica'], tags: ['polea', 'pecho', 'plano'] },
  { name: 'Cruce de poleas inclinado', group: 'Poleas / pecho', regiones: ['hombro'], contracciones: ['concentrica'], tags: ['polea', 'pecho', 'inclinado'] },
  { name: 'Cruce de poleas declinado', group: 'Poleas / pecho', regiones: ['hombro'], contracciones: ['concentrica'], tags: ['polea', 'pecho', 'declinado'] },
  { name: 'Press unilateral en polea', group: 'Poleas / pecho', regiones: ['hombro', 'core'], contracciones: ['concentrica'], tags: ['polea', 'pecho', 'unilateral'] },
  { name: 'Press inclinado en polea', group: 'Poleas / pecho', regiones: ['hombro'], contracciones: ['concentrica'], tags: ['polea', 'inclinado'] },
  { name: 'Remo unilateral en polea', group: 'Poleas / espalda', regiones: ['hombro', 'dorsal', 'core'], contracciones: ['concentrica'], tags: ['polea', 'remo', 'unilateral'] },
  { name: 'Jalón unilateral en polea', group: 'Poleas / espalda', regiones: ['hombro', 'dorsal'], contracciones: ['concentrica'], tags: ['polea', 'jalón', 'unilateral'] },
  { name: 'Pullover en polea alta', group: 'Poleas / espalda', regiones: ['hombro', 'dorsal'], contracciones: ['concentrica'], tags: ['polea', 'dorsal ancho'] },
  { name: 'Face pull en polea', group: 'Poleas / hombro', regiones: ['hombro', 'dorsal'], contracciones: ['concentrica'], tags: ['polea', 'escápula'] },
  { name: 'Rotación externa en polea', group: 'Poleas / hombro', regiones: ['hombro'], contracciones: ['concentrica'], tags: ['polea', 'rotadores'] },
  { name: 'Rotación externa excéntrica en polea', group: 'Poleas / hombro', regiones: ['hombro'], contracciones: ['excentrica'], tags: ['polea', 'rotadores'] },
  { name: 'Rotación interna en polea', group: 'Poleas / hombro', regiones: ['hombro'], contracciones: ['concentrica'], tags: ['polea', 'rotadores'] },
  { name: 'Rotación interna excéntrica en polea', group: 'Poleas / hombro', regiones: ['hombro'], contracciones: ['excentrica'], tags: ['polea', 'rotadores'] },

  { name: 'Flexoextensión de codo con mancuerna', group: 'Brazo / codo', regiones: ['brazo'], contracciones: ['concentrica'] },
  { name: 'Curl bíceps con banda', group: 'Brazo / codo', regiones: ['brazo', 'hombro'], contracciones: ['concentrica'], tags: ['bíceps biarticular'] },
  { name: 'Curl bíceps excéntrico', group: 'Brazo / codo', regiones: ['brazo', 'hombro'], contracciones: ['excentrica'], tags: ['bíceps biarticular', 'bajar lento'] },
  { name: 'Curl bíceps isométrico a 90°', group: 'Brazo / codo', regiones: ['brazo', 'hombro'], contracciones: ['isometrica'], tags: ['bíceps'] },
  { name: 'Tríceps overhead con banda', group: 'Brazo / codo', regiones: ['brazo', 'hombro'], contracciones: ['concentrica'], tags: ['tríceps largo'] },
  { name: 'Tríceps overhead excéntrico', group: 'Brazo / codo', regiones: ['brazo', 'hombro'], contracciones: ['excentrica'], tags: ['tríceps largo', 'bajar lento'] },
  { name: 'Tríceps en polea unilateral', group: 'Brazo / codo', regiones: ['brazo', 'hombro'], contracciones: ['concentrica'], tags: ['polea', 'tríceps'] },
  { name: 'Tríceps en polea excéntrico', group: 'Brazo / codo', regiones: ['brazo', 'hombro'], contracciones: ['excentrica'], tags: ['polea', 'tríceps'] },
  { name: 'Pronosupinación con mancuerna', group: 'Brazo / codo', regiones: ['brazo'], contracciones: ['concentrica'] },
  { name: 'Pronosupinación excéntrica', group: 'Brazo / codo', regiones: ['brazo'], contracciones: ['excentrica'] },
  { name: 'Isométrico de extensores de muñeca', group: 'Brazo / codo', regiones: ['brazo'], contracciones: ['isometrica'] },
  { name: 'Excéntrico de extensores de muñeca', group: 'Brazo / codo', regiones: ['brazo'], contracciones: ['excentrica'], tags: ['epicondilalgia'] },
  { name: 'Excéntrico de flexores de muñeca', group: 'Brazo / codo', regiones: ['brazo'], contracciones: ['excentrica'], tags: ['epitroclealgia'] },
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
  if (/(hombro|deltoides|press militar|elevacion|rotacion|escap|serrato|face pull|pecho|press de banca|fondos|flexion de pecho|pullover|polea)/.test(s)) regions.add('hombro')
  if (/(biceps|triceps|curl|codo|antebrazo|muneca|pulley|frances|pronacion|supinacion)/.test(s)) regions.add('brazo')
  if (/(core|plancha|bird dog|dead bug|pallof|abdominal|crunch|rueda|rotacion|balance|unilateral)/.test(s)) regions.add('core')
  if (!regions.size && /miembros inferiores|pierna/.test(s)) ['tobillo', 'rodilla', 'cadera'].forEach(r => regions.add(r))
  if (!regions.size && /espalda/.test(s)) ['dorsal', 'lumbar'].forEach(r => regions.add(r))
  if (!regions.size && /pectorales|deltoides/.test(s)) regions.add('hombro')
  return [...regions]
}

function inferContractions(name = '') {
  const s = normalizeText(name)
  const result = new Set()
  if (/(excentr|bajar lento|baja con una|dos y bajar|tempo)/.test(s)) result.add('excentrica')
  if (/(isometr|sostener|mantener|plancha|balance|hold)/.test(s)) result.add('isometrica')
  if (!result.size && /(movilidad|open book|cat camel|foam roller)/.test(s)) return []
  if (!result.size) result.add('concentrica')
  return [...result]
}

function getCombinedExerciseLibrary() {
  const base = exerciseLibrary.flatMap(section => section.items.map(item => ({
    ...item,
    group: section.title,
    regiones: item.regiones || inferRegions(item.name, section.title),
    contracciones: item.contracciones || inferContractions(item.name),
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

export function getExerciseOptions(contexto = 'gimnasio', search = '', group = 'Todos', region = 'Todos', contraccion = 'Todos') {
  const q = normalizeText(search.trim())
  return getCombinedExerciseLibrary()
    .filter(item => {
      if (group !== 'Todos' && item.group !== group) return false
      if (region !== 'Todos' && !(item.regiones || []).includes(region)) return false
      if (contraccion !== 'Todos' && !(item.contracciones || []).includes(contraccion)) return false
      const haystack = normalizeText(`${item.name} ${item.group} ${(item.tags || []).join(' ')} ${(item.contracciones || []).join(' ')}`)
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
