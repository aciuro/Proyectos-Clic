import { useMemo, useState } from 'react'
import ClinicalRoutineEditorWizard from './ClinicalRoutineEditorWizard.jsx'
import { getExerciseSuggestions, inferArticulationFromText, getSuggestionSummary } from './exerciseSuggestions.js'
import { api } from './api.js'

const c = {
  ink: '#082B34',
  muted: '#789FAA',
  border: 'rgba(83,151,166,.30)',
  sky: '#2F9FB2',
  skyDark: '#176F82',
  mint: '#E5F8F3',
  mintDark: '#16855F',
}

const fieldStyle = {
  width: '100%',
  border: `1px solid ${c.border}`,
  borderRadius: 14,
  padding: 12,
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  fontSize: 14,
  background: '#FFFFFF',
  color: c.ink,
  WebkitTextFillColor: c.ink,
  caretColor: c.skyDark,
  outline: 'none',
}

function itemText(item = {}) {
  return String(item.nombre || item.name || item.texto || item.titulo || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function matches(item, query = '') {
  const q = String(query || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  if (!q) return false
  const name = itemText(item)
  return name.includes(q) || q.split(/\s+/).some(t => t.length > 3 && name.includes(t))
}

function makeExercise(action = {}) {
  return {
    tipo: 'ejercicio',
    bloque: 'gimnasio',
    nombre: action.nombre || action.name || 'Ejercicio sugerido',
    series: action.series || '3',
    repeticiones: action.repeticiones || action.reps || '10',
    pausa: action.pausa || '60 seg',
    indicacion: action.indicacion || action.detalle || '',
    sugerido_ia: true,
  }
}

function makeAgent(action = {}) {
  return {
    tipo: 'agente',
    bloque: 'post',
    nombre: action.nombre || 'Agente físico',
    duracion: action.duracion || '15 min',
    frecuencia: action.frecuencia || 'post rutina',
    detalle: action.detalle || '',
    sugerido_ia: true,
  }
}

function makeIndication(action = {}) {
  return {
    tipo: 'indicacion',
    bloque: 'indicacion',
    texto: action.texto || action.indicacion || 'Indicación sugerida por IA',
    sugerido_ia: true,
  }
}

function reorderClinical(items = []) {
  const order = { movilidad: 0, cardio: 1, ejercicio: 2, gimnasio: 2, campo: 3, agente: 4, post: 4, indicacion: 5 }
  const type = it => it.tipo || it.bloque || 'ejercicio'
  return [...items].sort((a, b) => (order[type(a)] ?? 9) - (order[type(b)] ?? 9))
}

function applyActionsToRoutine(rutina = {}, actions = []) {
  let ejercicios = Array.isArray(rutina.ejercicios) ? [...rutina.ejercicios] : []
  let next = { ...rutina }
  const applied = []

  actions.forEach(action => {
    if (!action?.type) return

    if (action.type === 'add_exercise') {
      ejercicios.push(makeExercise(action))
      applied.push(`Agregado ejercicio: ${action.nombre || 'Ejercicio'}`)
    }

    if (action.type === 'add_agent') {
      ejercicios.push(makeAgent(action))
      applied.push(`Agregado agente: ${action.nombre || 'Agente físico'}`)
    }

    if (action.type === 'add_indication') {
      ejercicios.push(makeIndication(action))
      applied.push('Agregada indicación')
    }

    if (action.type === 'remove_item') {
      const before = ejercicios.length
      ejercicios = ejercicios.filter(item => !matches(item, action.query || action.nombre || action.name))
      if (before !== ejercicios.length) applied.push(`Eliminado: ${action.query || action.nombre}`)
    }

    if (action.type === 'remove_agent') {
      const query = action.query || action.nombre || 'hielo'
      const before = ejercicios.length
      ejercicios = ejercicios.filter(item => !(item.tipo === 'agente' && matches(item, query)))
      if (before !== ejercicios.length) applied.push(`Eliminado agente: ${query}`)
    }

    if (action.type === 'update_all_exercises') {
      ejercicios = ejercicios.map(item => {
        const isExercise = item.tipo === 'ejercicio' || item.bloque === 'gimnasio'
        if (!isExercise) return item
        return {
          ...item,
          ...(action.series ? { series: action.series } : {}),
          ...(action.repeticiones ? { repeticiones: action.repeticiones, reps: action.repeticiones } : {}),
          ...(action.reps ? { repeticiones: action.reps, reps: action.reps } : {}),
          ...(action.pausa ? { pausa: action.pausa } : {}),
          ...(action.indicacion ? { indicacion: action.indicacion } : {}),
        }
      })
      applied.push('Actualizados ejercicios')
    }

    if (action.type === 'set_frequency') {
      next.veces = action.veces || next.veces
      next.frecuencia = action.frecuencia || (action.veces ? `${action.veces} veces antes del próximo control` : next.frecuencia)
      applied.push(`Frecuencia: ${next.frecuencia}`)
    }

    if (action.type === 'reorder_clinical') {
      ejercicios = reorderClinical(ejercicios)
      applied.push('Orden clínico aplicado')
    }
  })

  next.ejercicios = ejercicios
  return { rutina: next, applied }
}

function inferFocus(items = []) {
  const types = Array.from(new Set(items.map(it => it.tipo || it.bloque || 'ejercicio')))
  return types.length ? types : ['ejercicio']
}

export default function ClinicalRoutineSmartEditor(props) {
  const { rutina } = props

  const [pain, setPain] = useState(3)
  const [objetivo, setObjetivo] = useState('rehab')
  const [localRutina, setLocalRutina] = useState(rutina || {})
  const [editorKey, setEditorKey] = useState(0)

  const [iaPrompt, setIaPrompt] = useState('')
  const [iaLoading, setIaLoading] = useState(false)
  const [iaResponse, setIaResponse] = useState(null)
  const [iaError, setIaError] = useState('')
  const [iaAppliedMessage, setIaAppliedMessage] = useState('')

  const articulation = useMemo(
    () => inferArticulationFromText(localRutina?.nombre || localRutina?.notas || ''),
    [localRutina]
  )

  const suggestions = useMemo(
    () => getExerciseSuggestions({ articulation, pain, objetivo }),
    [articulation, pain, objetivo]
  )

  function commitRoutine(next, message = '') {
    setLocalRutina(next)
    setEditorKey(k => k + 1)
    const focos = inferFocus(next.ejercicios || [])
    props.onChange?.({
      contexto: focos[0] || 'ejercicio',
      ejercicios: next.ejercicios || [],
      frecuencia: next.frecuencia,
      focos,
    })
    props.onGeneralChange?.({ nombre: next.nombre, notas: next.notas, resumen: next.notas })
    if (message) setIaAppliedMessage(message)
  }

  function applyAll() {
    commitRoutine({
      ...localRutina,
      ejercicios: [...(localRutina?.ejercicios || []), ...suggestions],
    }, 'Sugerencias agregadas al borrador. Revisá, editá o eliminá antes de guardar.')
  }

  function applyOne(ex) {
    commitRoutine({
      ...localRutina,
      ejercicios: [...(localRutina?.ejercicios || []), ex],
    }, `${ex.nombre || 'Ejercicio'} agregado al borrador.`)
  }

  async function handleIA() {
    const prompt = iaPrompt.trim()
    if (!prompt) return

    setIaLoading(true)
    setIaError('')
    setIaResponse(null)
    setIaAppliedMessage('')

    try {
      const res = await api.iaRutina({
        prompt,
        rutina: localRutina,
        contexto: {
          dolor: pain,
          objetivo,
          articulacion: articulation,
        },
      })

      const actions = Array.isArray(res.actions) ? res.actions : []
      const appliedResult = applyActionsToRoutine(localRutina, actions)

      if (appliedResult.applied.length) {
        commitRoutine(
          appliedResult.rutina,
          `IA aplicada al borrador: ${appliedResult.applied.join(' · ')}. Todavía no se guardó en la base.`
        )
      } else {
        setIaAppliedMessage('La IA respondió, pero no hubo acciones aplicables al borrador.')
      }

      setIaResponse(res)
      setIaPrompt('')
    } catch (e) {
      console.error(e)
      setIaError(e?.message || 'Error con IA')
    } finally {
      setIaLoading(false)
    }
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div
        style={{
          border: `1px solid ${c.border}`,
          borderRadius: 20,
          padding: 14,
          background: '#fff',
        }}
      >
        <div style={{ fontWeight: 900, color: c.ink }}>
          Asistente IA
        </div>

        <div style={{ marginTop: 5, fontSize: 12, color: c.muted, lineHeight: 1.35 }}>
          Auto-aplica cambios al borrador. Podés editarlos o eliminarlos antes de tocar Guardar.
        </div>

        <textarea
          value={iaPrompt}
          onChange={e => setIaPrompt(e.target.value)}
          placeholder="Ej: agregá hielo 15 min, bajá a 3 series, sacá step down..."
          style={{ ...fieldStyle, minHeight: 76, marginTop: 10, resize: 'vertical' }}
        />

        <button
          type="button"
          onClick={handleIA}
          disabled={iaLoading || !iaPrompt.trim()}
          style={{
            marginTop: 8,
            border: 'none',
            borderRadius: 14,
            padding: '10px 14px',
            background: `linear-gradient(135deg, ${c.sky}, ${c.skyDark})`,
            color: '#fff',
            fontWeight: 900,
            cursor: iaLoading || !iaPrompt.trim() ? 'default' : 'pointer',
            opacity: iaLoading || !iaPrompt.trim() ? 0.55 : 1,
            fontFamily: 'inherit',
          }}
        >
          {iaLoading ? 'Pensando y aplicando...' : 'Enviar y auto-aplicar'}
        </button>

        {iaAppliedMessage && (
          <div style={{ marginTop: 10, border: `1px solid rgba(22,133,95,.25)`, background: c.mint, color: c.mintDark, borderRadius: 12, padding: 10, fontSize: 13, fontWeight: 900 }}>
            {iaAppliedMessage}
          </div>
        )}

        {iaError && (
          <div style={{ marginTop: 10, border: '1px solid #F5A897', background: '#FEF2F2', color: '#B91C1C', borderRadius: 12, padding: 10, fontSize: 13, fontWeight: 800 }}>
            {iaError}
          </div>
        )}

        {iaResponse && (
          <div style={{ marginTop: 12, border: `1px solid ${c.border}`, background: '#F6FBFC', borderRadius: 14, padding: 12 }}>
            <div style={{ fontWeight: 900, color: c.ink }}>
              IA aplicó:
            </div>

            {iaResponse.resumen && (
              <div style={{ marginTop: 5, fontSize: 13, color: c.muted }}>
                {iaResponse.resumen}
              </div>
            )}

            {Array.isArray(iaResponse.actions) && iaResponse.actions.length > 0 && (
              <div style={{ display: 'grid', gap: 7, marginTop: 10 }}>
                {iaResponse.actions.map((action, index) => (
                  <div key={`${action.type}-${index}`} style={{ border: `1px solid ${c.border}`, background: '#fff', borderRadius: 12, padding: 10, fontSize: 12, color: c.ink }}>
                    <b>{action.type}</b>{action.nombre ? ` · ${action.nombre}` : ''}{action.query ? ` · ${action.query}` : ''}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ border: `1px solid ${c.border}`, borderRadius: 20, padding: 14, background: '#fff' }}>
        <div style={{ fontWeight: 900, color: c.ink }}>
          Sugerencias automáticas
        </div>

        <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <input
            value={pain}
            onChange={e => setPain(Number(e.target.value) || 0)}
            placeholder="Dolor 0-10"
            style={fieldStyle}
          />

          <select
            value={objetivo}
            onChange={e => setObjetivo(e.target.value)}
            style={fieldStyle}
          >
            <option value="rehab">Rehab</option>
            <option value="fuerza">Fuerza</option>
            <option value="retorno">Retorno</option>
          </select>
        </div>

        <div style={{ marginTop: 8, fontSize: 12, color: c.muted }}>
          {getSuggestionSummary({ pain, objetivo })}
        </div>

        <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
          {suggestions.map(s => (
            <div key={s.id} style={{ border: `1px solid ${c.border}`, borderRadius: 14, padding: 10, display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 900, color: c.ink }}>
                  {s.nombre}
                </div>
                <div style={{ fontSize: 11, color: c.muted }}>
                  {s.motivo_sugerencia}
                </div>
              </div>

              <button type="button" onClick={() => applyOne(s)} style={{ background: c.sky, color: '#fff', border: 'none', borderRadius: 10, padding: '6px 10px', fontWeight: 900, cursor: 'pointer' }}>
                +
              </button>
            </div>
          ))}
        </div>

        <button type="button" onClick={applyAll} style={{ marginTop: 10, border: `1px solid ${c.border}`, borderRadius: 14, padding: '10px 12px', background: '#fff', color: c.skyDark, fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit' }}>
          Agregar todas
        </button>
      </div>

      <ClinicalRoutineEditorWizard
        key={editorKey}
        {...props}
        rutina={localRutina}
      />
    </div>
  )
}
