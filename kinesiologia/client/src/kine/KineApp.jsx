import { useEffect, useState } from 'react'
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { api } from './api.js'
import Login from './Login.jsx'
import Dashboard from './Dashboard.jsx'
import Pacientes from './Pacientes.jsx'
import PacienteDetalle from './PacienteDetalle.jsx'
import Ejercicios from './Ejercicios.jsx'
import Agenda from './Agenda.jsx'
import KineClaude from './KineClaude.jsx'
import Notas from './Notas.jsx'
import Cuenta from './Cuenta.jsx'
import PortalPaciente from './PortalPaciente.jsx'
import EditorRutina from './EditorRutina.jsx'
import RutinaEditorAccess from './RutinaEditorAccess.jsx'
import './kine.css'

// (mantengo todo igual hasta el return de AdminLayout)

// ... (todo el código igual que antes) ...

      <main className="adm-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pacientes" element={<Pacientes />} />
          <Route path="/paciente/:id" element={<PacienteDetalle />} />
          <Route path="/rutina/:id/editor" element={<EditorRutina />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/ejercicios" element={<Ejercicios />} />
          <Route path="/claude" element={<KineClaude />} />
          <Route path="/cuenta" element={<Cuenta />} />
          <Route path="/notas" element={<Notas />} />
          <Route path="*" element={<Navigate to="/kine" replace />} />
        </Routes>
      </main>

      <RutinaEditorAccess />

      <nav className="adm-bottom-nav">
        {NAV_ITEMS.map(item => {
          const active = activeId === item.id
          return (
            <button key={item.id} className="adm-bnav-btn" onClick={() => navigate(item.path)}>
              {item.icon(active)}
              <span className="adm-bnav-label" style={{ color: active ? c.skyDark : 'rgba(13,53,64,0.45)' }}>{item.label}</span>
              {active && <div className="adm-bnav-dot" />}
            </button>
          )
        })}
      </nav>
    </div>
  )
}

// resto igual