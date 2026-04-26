const BASE_EXERCISES = [
  // Tobillo / pie
  ['Elevación de talones bilateral', 'Tobillo / pie', ['tobillo'], ['concentrica'], ['gemelos', 'sóleo', 'bilateral']],
  ['Elevación de talones unilateral', 'Tobillo / pie', ['tobillo'], ['concentrica'], ['gemelos', 'sóleo', 'unilateral']],
  ['Elevación de talones excéntrica bilateral', 'Tobillo / pie', ['tobillo'], ['excentrica'], ['gemelos', 'sóleo', 'aquiles', 'bajar lento']],
  ['Elevación de talones excéntrica unilateral', 'Tobillo / pie', ['tobillo'], ['excentrica'], ['gemelos', 'sóleo', 'aquiles', 'bajar lento', 'unilateral']],
  ['Gemelo excéntrico: subir con dos y bajar con una', 'Tobillo / pie', ['tobillo'], ['excentrica'], ['aquiles', 'gemelo', 'dos a una']],
  ['Sóleo excéntrico con rodilla flexionada', 'Tobillo / pie', ['tobillo'], ['excentrica'], ['sóleo', 'aquiles', 'rodilla flexionada']],
  ['Isométrico de gemelo en punta de pie', 'Tobillo / pie', ['tobillo'], ['isometrica'], ['gemelos', 'aquiles']],
  ['Tibial anterior con banda', 'Tobillo / pie', ['tobillo'], ['concentrica'], ['dorsiflexión']],
  ['Tibial anterior excéntrico con banda', 'Tobillo / pie', ['tobillo'], ['excentrica'], ['dorsiflexión', 'bajar lento']],
  ['Eversión de tobillo con banda', 'Tobillo / pie', ['tobillo'], ['concentrica'], ['peroneos']],
  ['Eversión de tobillo excéntrica con banda', 'Tobillo / pie', ['tobillo'], ['excentrica'], ['peroneos']],
  ['Inversión de tobillo con banda', 'Tobillo / pie', ['tobillo'], ['concentrica'], ['tibial posterior']],
  ['Inversión de tobillo excéntrica con banda', 'Tobillo / pie', ['tobillo'], ['excentrica'], ['tibial posterior']],
  ['Short foot', 'Tobillo / pie', ['tobillo'], ['isometrica'], ['intrínsecos del pie']],
  ['Toe yoga', 'Tobillo / pie', ['tobillo'], ['isometrica'], ['intrínsecos del pie']],
  ['Movilidad de tobillo en pared', 'Tobillo / pie', ['tobillo'], [], ['dorsiflexión', 'movilidad']],
  ['Balance unipodal', 'Tobillo / pie', ['tobillo', 'cadera', 'core'], ['isometrica'], ['propiocepción']],
  ['Balance unipodal con alcance', 'Tobillo / pie', ['tobillo', 'rodilla', 'cadera', 'core'], ['isometrica'], ['propiocepción', 'control']],
  ['Saltos pogo bilaterales', 'Tobillo / pie', ['tobillo', 'rodilla'], ['concentrica'], ['pliometría', 'retorno deportivo']],
  ['Saltos pogo unilaterales', 'Tobillo / pie', ['tobillo', 'rodilla'], ['concentrica'], ['pliometría', 'unilateral']],

  // Rodilla
  ['Camilla de cuádriceps bilateral', 'Rodilla / máquinas', ['rodilla'], ['concentrica'], ['máquina', 'cuádriceps']],
  ['Camilla de cuádriceps unilateral', 'Rodilla / máquinas', ['rodilla'], ['concentrica'], ['máquina', 'cuádriceps', 'unilateral']],
  ['Camilla de cuádriceps excéntrica bilateral', 'Rodilla / máquinas', ['rodilla'], ['excentrica'], ['máquina', 'cuádriceps', 'bajar lento']],
  ['Camilla de cuádriceps: subir con dos y bajar con una', 'Rodilla / máquinas', ['rodilla'], ['excentrica'], ['máquina', 'cuádriceps', 'dos a una']],
  ['Isométrico en camilla de cuádriceps a 60°', 'Rodilla / máquinas', ['rodilla'], ['isometrica'], ['máquina', 'cuádriceps']],
  ['Isométrico en camilla de cuádriceps a 90°', 'Rodilla / máquinas', ['rodilla'], ['isometrica'], ['máquina', 'cuádriceps']],
  ['Camilla de isquiotibiales bilateral', 'Rodilla / máquinas', ['rodilla', 'cadera'], ['concentrica'], ['máquina', 'isquiosurales']],
  ['Camilla de isquiotibiales unilateral', 'Rodilla / máquinas', ['rodilla', 'cadera'], ['concentrica'], ['máquina', 'isquiosurales', 'unilateral']],
  ['Camilla de isquiotibiales excéntrica bilateral', 'Rodilla / máquinas', ['rodilla', 'cadera'], ['excentrica'], ['máquina', 'isquiosurales', 'bajar lento']],
  ['Camilla de isquiotibiales: subir con dos y bajar con una', 'Rodilla / máquinas', ['rodilla', 'cadera'], ['excentrica'], ['máquina', 'isquiosurales', 'dos a una']],
  ['Prensa bilateral', 'Rodilla / máquinas', ['rodilla', 'cadera'], ['concentrica'], ['máquina', 'prensa']],
  ['Prensa unilateral', 'Rodilla / máquinas', ['rodilla', 'cadera'], ['concentrica'], ['máquina', 'prensa', 'unilateral']],
  ['Prensa excéntrica bilateral', 'Rodilla / máquinas', ['rodilla', 'cadera'], ['excentrica'], ['máquina', 'prensa', 'bajar lento']],
  ['Prensa: subir con dos y bajar con una', 'Rodilla / máquinas', ['rodilla', 'cadera'], ['excentrica'], ['máquina', 'prensa', 'dos a una']],
  ['Sentadilla hack bilateral', 'Rodilla / máquinas', ['rodilla', 'cadera'], ['concentrica'], ['máquina']],
  ['Sentadilla hack excéntrica', 'Rodilla / máquinas', ['rodilla', 'cadera'], ['excentrica'], ['máquina', 'bajar lento']],
  ['Extensión terminal de rodilla con banda', 'Rodilla', ['rodilla'], ['concentrica'], ['TKE']],
  ['Extensión terminal de rodilla isométrica', 'Rodilla', ['rodilla'], ['isometrica'], ['TKE']],
  ['Isométrico de cuádriceps', 'Rodilla', ['rodilla'], ['isometrica'], ['cuádriceps']],
  ['Elevación de pierna recta', 'Rodilla', ['rodilla', 'cadera'], ['concentrica', 'isometrica'], ['cuádriceps', 'recto femoral']],
  ['Spanish squat', 'Rodilla', ['rodilla', 'cadera'], ['isometrica'], ['tendón rotuliano']],
  ['Spanish squat excéntrica', 'Rodilla', ['rodilla', 'cadera'], ['excentrica'], ['tendón rotuliano']],
  ['Sentadilla a cajón', 'Rodilla', ['rodilla', 'cadera'], ['concentrica'], ['control']],
  ['Sentadilla a cajón excéntrica', 'Rodilla', ['rodilla', 'cadera'], ['excentrica'], ['control', 'bajar lento']],
  ['Sentadilla declinada excéntrica', 'Rodilla', ['rodilla'], ['excentrica'], ['tendón rotuliano', 'bajar lento']],
  ['Step up', 'Rodilla', ['rodilla', 'cadera'], ['concentrica'], ['funcional']],
  ['Step down', 'Rodilla', ['rodilla', 'cadera'], ['concentrica'], ['control']],
  ['Step down excéntrico', 'Rodilla', ['rodilla', 'cadera'], ['excentrica'], ['bajar lento', 'control']],
  ['Split squat', 'Rodilla', ['rodilla', 'cadera'], ['concentrica'], ['unilateral']],
  ['Split squat excéntrico', 'Rodilla', ['rodilla', 'cadera'], ['excentrica'], ['unilateral', 'bajar lento']],
  ['Nórdico asistido', 'Rodilla', ['rodilla', 'cadera'], ['excentrica'], ['isquiosurales']],
  ['Nórdico excéntrico', 'Rodilla', ['rodilla', 'cadera'], ['excentrica'], ['isquiosurales']],
  ['Curl femoral con fitball', 'Rodilla', ['rodilla', 'cadera'], ['concentrica'], ['isquiosurales']],
  ['Curl femoral excéntrico con fitball', 'Rodilla', ['rodilla', 'cadera'], ['excentrica'], ['isquiosurales']],

  // Cadera
  ['Puente de glúteo', 'Cadera', ['cadera', 'lumbar', 'core'], ['concentrica', 'isometrica'], ['glúteo']],
  ['Puente de glúteo unilateral', 'Cadera', ['cadera', 'lumbar', 'core'], ['concentrica', 'isometrica'], ['glúteo', 'unilateral']],
  ['Hip thrust', 'Cadera', ['cadera', 'lumbar', 'core'], ['concentrica'], ['glúteo']],
  ['Hip thrust unilateral', 'Cadera', ['cadera', 'lumbar', 'core'], ['concentrica'], ['glúteo', 'unilateral']],
  ['Hip thrust excéntrico', 'Cadera', ['cadera', 'lumbar', 'core'], ['excentrica'], ['glúteo', 'bajar lento']],
  ['Isométrico de hip thrust arriba', 'Cadera', ['cadera', 'lumbar', 'core'], ['isometrica'], ['glúteo']],
  ['Clamshell', 'Cadera', ['cadera'], ['concentrica'], ['rotadores externos']],
  ['Clamshell isométrico', 'Cadera', ['cadera'], ['isometrica'], ['rotadores externos']],
  ['Abducción de cadera lateral', 'Cadera', ['cadera'], ['concentrica'], ['glúteo medio']],
  ['Abducción de cadera excéntrica', 'Cadera', ['cadera'], ['excentrica'], ['glúteo medio']],
  ['Caminata lateral con banda', 'Cadera', ['cadera', 'rodilla'], ['isometrica'], ['glúteo medio']],
  ['Monster walk', 'Cadera', ['cadera', 'rodilla'], ['isometrica'], ['glúteo medio']],
  ['Patada de glúteo en polea', 'Cadera / poleas', ['cadera'], ['concentrica'], ['polea', 'glúteo mayor']],
  ['Abducción de cadera en polea', 'Cadera / poleas', ['cadera'], ['concentrica'], ['polea', 'glúteo medio']],
  ['Aducción de cadera en polea', 'Cadera / poleas', ['cadera'], ['concentrica'], ['polea', 'aductores']],
  ['Flexión de cadera en polea', 'Cadera / poleas', ['cadera'], ['concentrica'], ['polea', 'psoas']],
  ['Rotación externa de cadera con banda', 'Cadera', ['cadera'], ['concentrica'], ['rotadores externos']],
  ['Rotación interna de cadera con banda', 'Cadera', ['cadera'], ['concentrica'], ['rotadores internos']],
  ['Peso muerto rumano bilateral', 'Cadera', ['cadera', 'rodilla', 'lumbar'], ['concentrica'], ['isquiosurales']],
  ['Peso muerto rumano unilateral', 'Cadera', ['cadera', 'rodilla', 'lumbar', 'core'], ['concentrica'], ['unilateral', 'isquiosurales']],
  ['Peso muerto rumano excéntrico', 'Cadera', ['cadera', 'rodilla', 'lumbar'], ['excentrica'], ['isquiosurales', 'bajar lento']],
  ['Copenhagen plank corto', 'Cadera', ['cadera', 'rodilla', 'core'], ['isometrica'], ['aductores']],
  ['Copenhagen excéntrico', 'Cadera', ['cadera', 'rodilla', 'core'], ['excentrica'], ['aductores']],

  // Lumbar / core / dorsal
  ['McGill curl up', 'Lumbar / core', ['lumbar', 'core'], ['isometrica'], ['control motor']],
  ['Bird dog', 'Lumbar / core', ['lumbar', 'core', 'cadera'], ['isometrica'], ['control motor']],
  ['Dead bug', 'Lumbar / core', ['lumbar', 'core', 'cadera'], ['isometrica'], ['control motor']],
  ['Plancha frontal', 'Lumbar / core', ['lumbar', 'core', 'hombro'], ['isometrica'], ['anti-extensión']],
  ['Plancha lateral', 'Lumbar / core', ['lumbar', 'core', 'cadera', 'hombro'], ['isometrica'], ['anti-inclinación']],
  ['Pallof press', 'Lumbar / core', ['lumbar', 'core', 'hombro'], ['isometrica'], ['anti-rotación', 'polea']],
  ['Pallof press concéntrico', 'Lumbar / core', ['lumbar', 'core', 'hombro'], ['concentrica'], ['polea']],
  ['Bisagra de cadera con palo', 'Lumbar / core', ['lumbar', 'cadera'], [], ['técnica']],
  ['Extensión lumbar en banco romano', 'Lumbar / core', ['lumbar', 'cadera'], ['concentrica'], ['banco romano']],
  ['Extensión lumbar excéntrica en banco romano', 'Lumbar / core', ['lumbar', 'cadera'], ['excentrica'], ['banco romano']],
  ['Open book torácico', 'Dorsal / torácica', ['dorsal', 'hombro'], [], ['movilidad']],
  ['Extensión torácica en foam roller', 'Dorsal / torácica', ['dorsal', 'hombro'], [], ['movilidad']],
  ['Cat camel', 'Dorsal / torácica', ['dorsal', 'lumbar'], [], ['movilidad']],
  ['Wall slides', 'Dorsal / torácica', ['dorsal', 'hombro'], ['concentrica'], ['escápula']],
  ['Pullover con banda', 'Dorsal / torácica', ['dorsal', 'hombro'], ['concentrica'], ['dorsal ancho']],
  ['Pullover excéntrico con banda', 'Dorsal / torácica', ['dorsal', 'hombro'], ['excentrica'], ['dorsal ancho']],

  // Hombro / escápula / brazo
  ['Péndulo de hombro', 'Hombro / escápula', ['hombro'], [], ['movilidad']],
  ['Rotación externa hombro con banda', 'Hombro / escápula', ['hombro'], ['concentrica'], ['manguito rotador']],
  ['Rotación externa hombro excéntrica', 'Hombro / escápula', ['hombro'], ['excentrica'], ['manguito rotador']],
  ['Rotación externa hombro isométrica', 'Hombro / escápula', ['hombro'], ['isometrica'], ['manguito rotador']],
  ['Rotación interna hombro con banda', 'Hombro / escápula', ['hombro'], ['concentrica'], ['subescapular']],
  ['Rotación interna hombro excéntrica', 'Hombro / escápula', ['hombro'], ['excentrica'], ['subescapular']],
  ['Rotación interna hombro isométrica', 'Hombro / escápula', ['hombro'], ['isometrica'], ['subescapular']],
  ['Y T W escapular', 'Hombro / escápula', ['hombro', 'dorsal'], ['concentrica', 'isometrica'], ['trapecio medio/inferior']],
  ['Serrato punch', 'Hombro / escápula', ['hombro', 'dorsal'], ['concentrica'], ['serrato']],
  ['Push up plus', 'Hombro / escápula', ['hombro', 'dorsal', 'core'], ['concentrica', 'isometrica'], ['serrato']],
  ['Elevación en plano escapular', 'Hombro / escápula', ['hombro'], ['concentrica'], ['deltoides', 'supraespinoso']],
  ['Elevación en plano escapular excéntrica', 'Hombro / escápula', ['hombro'], ['excentrica'], ['deltoides', 'supraespinoso']],
  ['Remo bajo con banda', 'Hombro / escápula', ['hombro', 'dorsal'], ['concentrica'], ['escápula']],
  ['Face pull con banda', 'Hombro / escápula', ['hombro', 'dorsal'], ['concentrica'], ['escápula']],
  ['Face pull en polea', 'Poleas / hombro', ['hombro', 'dorsal'], ['concentrica'], ['polea', 'escápula']],
  ['Rotación externa en polea', 'Poleas / hombro', ['hombro'], ['concentrica'], ['polea', 'rotadores']],
  ['Rotación externa excéntrica en polea', 'Poleas / hombro', ['hombro'], ['excentrica'], ['polea', 'rotadores']],
  ['Rotación interna en polea', 'Poleas / hombro', ['hombro'], ['concentrica'], ['polea', 'rotadores']],
  ['Rotación interna excéntrica en polea', 'Poleas / hombro', ['hombro'], ['excentrica'], ['polea', 'rotadores']],
  ['Cruce de poleas plano', 'Poleas / pecho', ['hombro'], ['concentrica'], ['polea', 'pecho', 'plano']],
  ['Cruce de poleas inclinado', 'Poleas / pecho', ['hombro'], ['concentrica'], ['polea', 'pecho', 'inclinado']],
  ['Cruce de poleas declinado', 'Poleas / pecho', ['hombro'], ['concentrica'], ['polea', 'pecho', 'declinado']],
  ['Remo unilateral en polea', 'Poleas / espalda', ['hombro', 'dorsal', 'core'], ['concentrica'], ['polea', 'remo', 'unilateral']],
  ['Jalón unilateral en polea', 'Poleas / espalda', ['hombro', 'dorsal'], ['concentrica'], ['polea', 'jalón', 'unilateral']],
  ['Pullover en polea alta', 'Poleas / espalda', ['hombro', 'dorsal'], ['concentrica'], ['polea', 'dorsal ancho']],
  ['Curl bíceps con banda', 'Brazo / codo', ['brazo', 'hombro'], ['concentrica'], ['bíceps biarticular']],
  ['Curl bíceps excéntrico', 'Brazo / codo', ['brazo', 'hombro'], ['excentrica'], ['bíceps', 'bajar lento']],
  ['Tríceps overhead con banda', 'Brazo / codo', ['brazo', 'hombro'], ['concentrica'], ['tríceps largo']],
  ['Tríceps overhead excéntrico', 'Brazo / codo', ['brazo', 'hombro'], ['excentrica'], ['tríceps largo']],
  ['Tríceps en polea unilateral', 'Brazo / codo', ['brazo', 'hombro'], ['concentrica'], ['polea', 'tríceps']],
  ['Tríceps en polea excéntrico', 'Brazo / codo', ['brazo', 'hombro'], ['excentrica'], ['polea', 'tríceps']],
  ['Excéntrico de extensores de muñeca', 'Brazo / codo', ['brazo'], ['excentrica'], ['epicondilalgia']],
  ['Excéntrico de flexores de muñeca', 'Brazo / codo', ['brazo'], ['excentrica'], ['epitroclealgia']],
]

function normalizeText(value = '') {
  return String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function mapExercise(row) {
  const [name, group, regiones, contracciones, tags] = row
  return { name, group, regiones, contracciones, tags, images: [] }
}

export const premiumExerciseLibrary = BASE_EXERCISES.map(mapExercise)

export function getPremiumExerciseGroups() {
  return ['Todos', ...Array.from(new Set(premiumExerciseLibrary.map(e => e.group))).sort((a, b) => a.localeCompare(b))]
}

export function getPremiumExerciseOptions(context = 'gimnasio', search = '', group = 'Todos', region = 'Todos', contraction = 'Todos') {
  const q = normalizeText(search)
  return premiumExerciseLibrary
    .filter(e => group === 'Todos' || e.group === group)
    .filter(e => region === 'Todos' || (e.regiones || []).includes(region))
    .filter(e => contraction === 'Todos' || (e.contracciones || []).includes(contraction))
    .filter(e => {
      if (!q) return true
      const haystack = normalizeText([e.name, e.group, ...(e.tags || []), ...(e.regiones || []), ...(e.contracciones || [])].join(' '))
      return haystack.includes(q)
    })
    .sort((a, b) => {
      const regionScore = (e) => region !== 'Todos' && e.regiones?.[0] === region ? 0 : 1
      const groupScore = (e) => e.group.includes('/') ? 0 : 1
      return regionScore(a) - regionScore(b) || groupScore(a) - groupScore(b) || a.name.localeCompare(b.name)
    })
}
