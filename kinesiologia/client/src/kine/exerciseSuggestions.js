import { getClinicalExerciseOptions } from './clinicalExerciseIntelligence.js'

function n(text = '') {
  return String(text).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

const articulationKeywords = {
  rodilla: ['rodilla', 'rotul', 'menisco', 'lca', 'lcp', 'cuadriceps', 'isquio', 'patelar'],
  tobillo: ['tobillo', 'aquiles', 'gemelo', 'soleo', 'pie', 'fascitis', 'peroneo'],
  cadera: ['cadera', 'glute', 'trocanter', 'pubalgia', 'aductor', 'psoas', 'piriforme'],
  hombro: ['hombro', 'manguito', 'supra', 'infra', 'subescapular', 'biceps', 'escapula'],
  lumbar: ['lumbar', 'lumbalgia', 'ciatica', 'core'],
  dorsal: ['dorsal', 'toracica', 'escapula'],
  brazo: ['codo', 'epicondil', 'epitrocle', 'biceps', 'triceps', 'muñeca'],
  core: ['core', 'abdominal', 'estabilidad'],
}

export function inferArticulationFromText(text = '') {
  const hay = n(text)
  for (const [art, keys] of Object.entries(articulationKeywords)) {
    if (keys.some(k => hay.includes(n(k)))) return art
  }
  return 'rodilla'
}

function targetContractions({ pain, objetivo }) {
  if (Number(pain) >= 7) return ['isometrica']
  if (objetivo === 'retorno') return ['concentrica', 'excentrica']
  if (objetivo === 'fuerza') return ['concentrica', 'excentrica']
  return ['isometrica', 'excentrica', 'concentrica']
}

function defaultDose(ex, { pain, objetivo }) {
  const contr = ex.contracciones || []
  if (contr.includes('isometrica') || Number(pain) >= 7) return { series: '4', repeticiones: '30-45 seg', pausa: '60 seg', indicacion: 'Mantener dolor tolerable. No superar 5/10.' }
  if (contr.includes('excentrica')) return { series: '3', repeticiones: '8-10', pausa: '75 seg', indicacion: 'Bajada lenta y controlada. Evitar rebote.' }
  if (objetivo === 'retorno') return { series: '3', repeticiones: '8-12', pausa: '60-90 seg', indicacion: 'Técnica limpia. Progresar solo si no aumenta dolor al día siguiente.' }
  return { series: '3', repeticiones: '10-12', pausa: '60 seg', indicacion: 'Controlar técnica y rango cómodo.' }
}

export function getExerciseSuggestions({ articulation = 'rodilla', pain = 3, objetivo = 'rehab', query = '' } = {}) {
  const contractions = targetContractions({ pain, objetivo })
  const all = contractions.flatMap(contraction =>
    getClinicalExerciseOptions(query, { articulacion: articulation, contraccion: contraction, objetivo: objetivo === 'retorno' ? 'retorno' : 'Todos' })
  )

  const seen = new Set()
  const unique = all.filter(ex => {
    const key = n(ex.name)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return unique.slice(0, 8).map((ex, index) => ({
    id: `${n(ex.name).replace(/\s+/g, '-')}-${index}`,
    tipo: 'ejercicio',
    bloque: 'gimnasio',
    nombre: ex.name,
    group: ex.group,
    imagen: ex.images?.[0],
    image: ex.images?.[0],
    contracciones: ex.contracciones || [],
    regiones: ex.regiones || [],
    tags: ex.tags || [],
    ...defaultDose(ex, { pain, objetivo }),
    sugerido: true,
    motivo_sugerencia: `Sugerido por ${articulation} · dolor ${pain}/10 · objetivo ${objetivo}`,
  }))
}

export function getSuggestionSummary({ pain = 3, objetivo = 'rehab' } = {}) {
  if (Number(pain) >= 7) return 'Dolor alto: priorizar isométricos, control y baja irritabilidad.'
  if (objetivo === 'retorno') return 'Retorno deportivo: combinar fuerza, control y ejercicios funcionales progresivos.'
  if (objetivo === 'fuerza') return 'Fuerza: progresar carga con técnica y tolerancia al día siguiente.'
  return 'Rehabilitación: mezclar control, isométricos y excéntricos según tolerancia.'
}
