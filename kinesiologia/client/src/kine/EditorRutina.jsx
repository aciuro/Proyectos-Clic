import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from './api'

export default function EditorRutina() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [data, setData] = useState({ objetivo:'', frecuencia:'', prescripcion: [] })

  useEffect(() => {
    api.getRutinaPrescripcion(id).then(setData)
  }, [id])

  function addBloque(tipo) {
    setData(prev => ({
      ...prev,
      prescripcion: [...prev.prescripcion, { tipo }]
    }))
  }

  function updateBloque(i, field, value) {
    const copy = [...data.prescripcion]
    copy[i][field] = value
    setData({ ...data, prescripcion: copy })
  }

  function save() {
    api.updateRutinaPrescripcion(id, data).then(() => {
      alert('Guardado')
      navigate(-1)
    })
  }

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: '0 auto' }}>
      <h2>Editor de rutina</h2>

      <input placeholder="Objetivo" value={data.objetivo} onChange={e => setData({ ...data, objetivo: e.target.value })} />
      <input placeholder="Frecuencia" value={data.frecuencia} onChange={e => setData({ ...data, frecuencia: e.target.value })} />

      <div>
        <button onClick={() => addBloque('cardio')}>+ Cardio</button>
        <button onClick={() => addBloque('intervalo')}>+ Intervalo</button>
        <button onClick={() => addBloque('indicacion')}>+ Indicacion</button>
      </div>

      {data.prescripcion.map((b, i) => (
        <div key={i} style={{ border:'1px solid #ccc', padding:10, marginTop:10 }}>
          <b>{b.tipo}</b>

          {b.tipo === 'cardio' && (
            <>
              <input placeholder="tipo" onChange={e => updateBloque(i,'modo', e.target.value)} />
              <input placeholder="minutos" onChange={e => updateBloque(i,'duracion', e.target.value)} />
            </>
          )}

          {b.tipo === 'intervalo' && (
            <>
              <input placeholder="reps" onChange={e => updateBloque(i,'reps', e.target.value)} />
              <input placeholder="trabajo" onChange={e => updateBloque(i,'trabajo', e.target.value)} />
              <input placeholder="descanso" onChange={e => updateBloque(i,'descanso', e.target.value)} />
            </>
          )}

          {b.tipo === 'indicacion' && (
            <textarea onChange={e => updateBloque(i,'texto', e.target.value)} />
          )}
        </div>
      ))}

      <button onClick={save}>Guardar</button>
    </div>
  )
}
