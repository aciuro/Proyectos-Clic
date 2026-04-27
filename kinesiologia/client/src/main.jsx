import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import './kine/motivoGradeSelectPatch.js'
import App from './App.jsx'
import KineApp from './kine/KineApp.jsx'
import ClinicalRoutinePatientPage from './kine/ClinicalRoutinePatientPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/kine/paciente/:id/rutinas-clinicas" element={<ClinicalRoutinePatientPage />} />
        <Route path="/kine/*" element={<KineApp />} />
        <Route path="/" element={<Navigate to="/kine" replace />} />
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
