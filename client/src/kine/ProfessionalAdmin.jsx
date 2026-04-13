import { useState, useEffect } from 'react'
import Pacientes from './Pacientes.jsx'
import Agenda from './Agenda.jsx'
import Ejercicios from './Ejercicios.jsx'
import { api } from './api.js'

export default function ProfessionalAdmin() {
  const [tab, setTab] = useState('dashboard')
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.getDashboard().then(setStats).catch(()=>{})
  }, [])

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#F0F8FA' }}>

      <aside style={{ width:220, background:'#E8DFD0', padding:20 }}>
        <div style={{ marginBottom:30 }}>
          <div style={{ fontWeight:700 }}>Rehabilitaplus</div>
          <div style={{ fontSize:10, opacity:0.6 }}>Panel profesional</div>
        </div>

        {[
          ['dashboard','Dashboard'],
          ['pacientes','Pacientes'],
          ['agenda','Agenda'],
          ['rutinas','Rutinas'],
          ['cuenta','Cuenta'],
          ['notas','Notas'],
        ].map(([id,label]) => (
          <button key={id} onClick={()=>setTab(id)}
            style={{ display:'block', width:'100%', textAlign:'left', padding:10, border:'none', background: tab===id ? '#DAEEF5' : 'transparent', marginBottom:4, borderRadius:8, cursor:'pointer' }}>
            {label}
          </button>
        ))}
      </aside>

      <main style={{ flex:1, padding:30 }}>

        {tab==='dashboard' && (
          <div>
            <h2>Dashboard</h2>
            {stats && (
              <div style={{ display:'flex', gap:10 }}>
                <div>Pacientes: {stats.stats.total_pacientes}</div>
                <div>Turnos hoy: {stats.stats.turnos_hoy}</div>
              </div>
            )}
          </div>
        )}

        {tab==='pacientes' && <Pacientes />}
        {tab==='agenda' && <Agenda />}
        {tab==='rutinas' && <Ejercicios />}

        {tab==='cuenta' && (
          <div>
            <h2>Cuenta</h2>
            <p>Módulo visual pendiente</p>
          </div>
        )}

        {tab==='notas' && (
          <div>
            <h2>Notas</h2>
            <p>Módulo visual pendiente</p>
          </div>
        )}

      </main>

    </div>
  )
}