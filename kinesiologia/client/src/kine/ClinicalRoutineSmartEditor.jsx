import { useMemo, useState } from 'react'
import ClinicalRoutineEditorWizard from './ClinicalRoutineEditorWizard.jsx'
import { getExerciseSuggestions, inferArticulationFromText, getSuggestionSummary } from './exerciseSuggestions.js'

const c = { ink:'#082B34', muted:'#789FAA', border:'rgba(83,151,166,.30)', sky:'#2F9FB2' }

export default function ClinicalRoutineSmartEditor(props){
  const { rutina } = props

  const [pain,setPain]=useState(3)
  const [objetivo,setObjetivo]=useState('rehab')

  const articulation = useMemo(()=>inferArticulationFromText(rutina?.nombre || rutina?.notas || ''),[rutina])

  const suggestions = useMemo(()=>getExerciseSuggestions({ articulation, pain, objetivo }),[articulation,pain,objetivo])

  const [localRutina,setLocalRutina]=useState(rutina)

  function applyAll(){
    const next = {
      ...localRutina,
      ejercicios: [...(localRutina?.ejercicios || []), ...suggestions]
    }
    setLocalRutina(next)
  }

  function applyOne(ex){
    const next = {
      ...localRutina,
      ejercicios: [...(localRutina?.ejercicios || []), ex]
    }
    setLocalRutina(next)
  }

  return (
    <div style={{display:'grid',gap:12}}>

      <div style={{border:`1px solid ${c.border}`,borderRadius:20,padding:14,background:'#fff'}}>
        <div style={{fontWeight:900,color:c.ink}}>Sugerencias automáticas</div>

        <div style={{marginTop:10,display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          <input value={pain} onChange={e=>setPain(Number(e.target.value)||0)} placeholder="Dolor 0-10" />
          <select value={objetivo} onChange={e=>setObjetivo(e.target.value)}>
            <option value="rehab">Rehab</option>
            <option value="fuerza">Fuerza</option>
            <option value="retorno">Retorno</option>
          </select>
        </div>

        <div style={{marginTop:8,fontSize:12,color:c.muted}}>
          {getSuggestionSummary({pain,objetivo})}
        </div>

        <div style={{marginTop:12,display:'grid',gap:8}}>
          {suggestions.map(s=>(
            <div key={s.id} style={{border:`1px solid ${c.border}`,borderRadius:14,padding:10,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{fontWeight:900}}>{s.nombre}</div>
                <div style={{fontSize:11,color:c.muted}}>{s.motivo_sugerencia}</div>
              </div>
              <button onClick={()=>applyOne(s)} style={{background:c.sky,color:'#fff',border:'none',borderRadius:10,padding:'6px 10px'}}>+</button>
            </div>
          ))}
        </div>

        <button onClick={applyAll} style={{marginTop:10}}>Agregar todas</button>
      </div>

      <ClinicalRoutineEditorWizard
        {...props}
        rutina={localRutina}
      />

    </div>
  )
}
