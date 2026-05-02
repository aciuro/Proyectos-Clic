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
}

export default function ClinicalRoutineSmartEditor(props) {
  const { rutina } = props

  const [pain, setPain] = useState(3)
  const [objetivo, setObjetivo] = useState('rehab')
  const [localRutina, setLocalRutina] = useState(rutina || {})

  const [iaPrompt, setIaPrompt] = useState('')
  const [iaLoading, setIaLoading] = useState(false)
  const [iaResponse, setIaResponse] = useState(null)
  const [iaError, setIaError] = useState('')

  const articulation = useMemo(
    () => inferArticulationFromText(localRutina?.nombre || localRutina?.notas || ''),
    [localRutina]
  )

  const suggestions = useMemo(
    () => getExerciseSuggestions({ articulation, pain, objetivo }),
    [articulation, pain, objetivo]
  )

  function applyAll() {
    setLocalRutina(prev => ({
      ...prev,
      ejercicios: [...(prev?.ejercicios || []), ...suggestions],
    }))
  }

  function applyOne(ex) {
    setLocalRutina(prev => ({
      ...prev,
      ejercicios: [...(prev?.ejercicios || []), ex],
    }))
  }

  async function handleIA() {
    const prompt = iaPrompt.trim()
    if (!prompt) return

    setIaLoading(true)
    setIaError('')
    setIaResponse(null)

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
          Pedile cambios sobre la rutina. Ej: “agregá hielo 15 min”, “bajá a 3 series”,
          “sacá step down”, “ordená movilidad primero”.
        </div>

        <textarea
          value={iaPrompt}
          onChange={e => setIaPrompt(e.target.value)}
          placeholder="Escribí qué querés cambiar..."
          style={{
            width: '100%',
            minHeight: 76,
            marginTop: 10,
            border: `1px solid ${c.border}`,
            borderRadius: 14,
            padding: 12,
            resize: 'vertical',
            boxSizing: 'border-box',
            fontFamily: 'inherit',
            fontSize: 14,
            color: c.ink,
            outline: 'none',
          }}
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
          {iaLoading ? 'Pensando...' : 'Enviar a IA'}
        </button>

        {iaError && (
          <div
            style={{
              marginTop: 10,
              border: '1px solid #F5A897',
              background: '#FEF2F2',
              color: '#B91C1C',
              borderRadius: 12,
              padding: 10,
              fontSize: 13,
              fontWeight: 800,
            }}
          >
            {iaError}
          </div>
        )}

        {iaResponse && (
          <div
            style={{
              marginTop: 12,
              border: `1px solid ${c.border}`,
              background: '#F6FBFC',
              borderRadius: 14,
              padding: 12,
            }}
          >
            <div style={{ fontWeight: 900, color: c.ink }}>
              IA propone:
            </div>

            {iaResponse.resumen && (
              <div style={{ marginTop: 5, fontSize: 13, color: c.muted }}>
                {iaResponse.resumen}
              </div>
            )}

            {Array.isArray(iaResponse.actions) && iaResponse.actions.length > 0 && (
              <div style={{ display: 'grid', gap: 7, marginTop: 10 }}>
                {iaResponse.actions.map((action, index) => (
                  <div
                    key={`${action.type}-${index}`}
                    style={{
                      border: `1px solid ${c.border}`,
                      background: '#fff',
                      borderRadius: 12,
                      padding: 10,
                      fontSize: 12,
                      color: c.ink,
                    }}
                  >
                    <b>{action.type}</b>
                    <pre
                      style={{
                        margin: '6px 0 0',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        fontSize: 11,
                      }}
                    >
                      {JSON.stringify(action, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div
        style={{
          border: `1px solid ${c.border}`,
          borderRadius: 20,
          padding: 14,
          background: '#fff',
        }}
      >
        <div style={{ fontWeight: 900, color: c.ink }}>
          Sugerencias automáticas
        </div>

        <div
          style={{
            marginTop: 10,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 8,
          }}
        >
          <input
            value={pain}
            onChange={e => setPain(Number(e.target.value) || 0)}
            placeholder="Dolor 0-10"
            style={{
              border: `1px solid ${c.border}`,
              borderRadius: 12,
              padding: 10,
              fontFamily: 'inherit',
            }}
          />

          <select
            value={objetivo}
            onChange={e => setObjetivo(e.target.value)}
            style={{
              border: `1px solid ${c.border}`,
              borderRadius: 12,
              padding: 10,
              fontFamily: 'inherit',
            }}
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
            <div
              key={s.id}
              style={{
                border: `1px solid ${c.border}`,
                borderRadius: 14,
                padding: 10,
                display: 'flex',
                justifyContent: 'space-between',
                gap: 10,
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontWeight: 900, color: c.ink }}>
                  {s.nombre}
                </div>
                <div style={{ fontSize: 11, color: c.muted }}>
                  {s.motivo_sugerencia}
                </div>
              </div>

              <button
                type="button"
                onClick={() => applyOne(s)}
                style={{
                  background: c.sky,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '6px 10px',
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                +
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={applyAll}
          style={{
            marginTop: 10,
            border: `1px solid ${c.border}`,
            borderRadius: 14,
            padding: '10px 12px',
            background: '#fff',
            color: c.skyDark,
            fontWeight: 900,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Agregar todas
        </button>
      </div>

      <ClinicalRoutineEditorWizard
        {...props}
        rutina={localRutina}
      />
    </div>
  )
}
