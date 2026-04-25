import { useEffect, useState } from 'react'
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { api } from './api.js'
import Login from './Login.jsx'
import Dashboard from './Dashboard.jsx'
import Pacientes from './Pacientes.jsx'
import PacienteDetalle from './PacienteDetalle.jsx'
import ClinicalRoutinePatientPage from './ClinicalRoutinePatientPage.jsx'
import Ejercicios from './Ejercicios.jsx'
import Agenda from './Agenda.jsx'
import KineClaude from './KineClaude.jsx'
import Notas from './Notas.jsx'
import Cuenta from './Cuenta.jsx'
import PortalPaciente from './PortalPaciente.jsx'
import './kine.css'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', path: '/kine' },
  { id: 'pacientes', label: 'Pacientes', path: '/kine/pacientes' },
  { id: 'agenda', label: 'Agenda', path: '/kine/agenda' },
  { id: 'ejercicios', label: 'Rutinas', path: '/kine/ejercicios' },
  { id: 'cuenta', label: 'Cuenta', path: '/kine/cuenta' },
  { id: 'notas', label: 'Notas', path: '/kine/notas' },
]

const shellCss = `
  * { box-sizing: border-box; }
  html, body, #root { min-height: 100%; }
  body { margin: 0; font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #F0F8FA; }
  .adm-shell { min-height: 100vh; background: #F0F8FA; }
  .adm-top { display: flex; align-items: center; justify-content: space-between; padding: 16px 18px 8px; }
  .adm-brand { font-weight: 900; color: #0D3540; }
  .adm-sub { font-size: 11px; color: #7AAAB8; margin-top: 2px; }
  .adm-content { padding: 8px 16px 128px; }
  .adm-bottom-nav { position: fixed; left: 12px; right: 12px; bottom: 12px; z-index: 50; display: flex; gap: 4px; justify-content: space-around; background: #fff; border: 1px solid #C0DDE5; border-radius: 22px; box-shadow: 0 4px 24px rgba(13,53,64,.08); padding: 10px 4px; }
  .adm-bnav-btn { border: 0; background: transparent; color: rgba(13,53,64,.55); font-size: 10px; font-weight: 700; padding: 6px 4px; border-radius: 14px; flex: 1; cursor: pointer; }
  .adm-bnav-btn.active { background: rgba(91,184,204,.18); color: #3A96AE; }
  .adm-sidebar { display: none; }
  @media (min-width: 768px) {
    .adm-shell { display: flex; height: 100vh; overflow: hidden; }
    .adm-sidebar { display: flex; width: 210px; background: #E8DFD0; flex-direction: column; padding: 22px 12px; gap: 8px; flex-shrink: 0; }
    .adm-side-brand { font-weight: 900; color: #0D3540; padding: 0 8px 14px; }
    .adm-side-btn { border: 0; background: transparent; border-radius: 12px; text-align: left; padding: 10px 12px; color: rgba(13,53,64,.58); font-weight: 700; cursor: pointer; }
    .adm-side-btn.active { background: rgba(91,184,204,.18); color: #3A96AE; }
    .adm-top, .adm-bottom-nav { display: none; }
    .adm-content { flex: 1; overflow-y: auto; padding: 30px 36px 40px; }
  }
`

function getActiveId(pathname) {
  if (pathname === '/kine' || pathname === '/kine/') return 'dashboard'
  if (pathname.includes('/paciente') || pathname.includes('/pacientes')) return 'pacientes'
  if (pathname.includes('/agenda')) return 'agenda'
  if (pathname.includes('/ejercicios')) return 'ejercicios'
  if (pathname.includes('/cuenta')) return 'cuenta'
  if (pathname.includes('/notas')) return 'notas'
  return 'dashboard'
}

function AdminLayout({ usuario, onLogout }) {
  const navigate = useNavigate()
  const location = useLocation()
  const activeId = getActiveId(location.pathname)
  const nombre = usuario?.nombre?.split(' ')[0] || 'Usuario'

  return (
    <div className="adm-shell">
      <style>{shellCss}</style>
      <aside className="adm-sidebar">
        <div className="adm-side-brand">Rehabilitaplus</div>
        {navItems.map(item => (
          <button key={item.id} className={`adm-side-btn ${activeId === item.id ? 'active' : ''}`} onClick={() => navigate(item.path)}>{item.label}</button>
        ))}
        <button className="adm-side-btn" onClick={onLogout} style={{ marginTop: 'auto' }}>Salir</button>
      </aside>
      <header className="adm-top">
        <div><div className="adm-brand">Rehabilitaplus</div><div className="adm-sub">Panel profesional</div></div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><span style={{ color: '#3A96AE', fontWeight: 800 }}>{nombre}</span><button onClick={onLogout}>Salir</button></div>
      </header>
      <main className="adm-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pacientes" element={<Pacientes />} />
          <Route path="/paciente/:id" element={<PacienteDetalle />} />
          <Route path="/paciente/:id/rutinas-clinicas" element={<ClinicalRoutinePatientPage />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/ejercicios" element={<Ejercicios />} />
          <Route path="/claude" element={<KineClaude />} />
          <Route path="/cuenta" element={<Cuenta />} />
          <Route path="/notas" element={<Notas />} />
          <Route path="*" element={<Navigate to="/kine" replace />} />
        </Routes>
      </main>
      <nav className="adm-bottom-nav">
        {navItems.map(item => <button key={item.id} className={`adm-bnav-btn ${activeId === item.id ? 'active' : ''}`} onClick={() => navigate(item.path)}>{item.label}</button>)}
      </nav>
    </div>
  )
}

function PacienteLayout({ usuario, paciente, onLogout }) {
  return <Routes><Route path="/*" element={<PortalPaciente usuario={usuario} paciente={paciente} onLogout={onLogout} />} /></Routes>
}

export default function KineApp() {
  const [auth, setAuth] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('kine_token')
    if (!token) { setLoading(false); return }
    api.me().then(data => setAuth(data)).catch(() => localStorage.removeItem('kine_token')).finally(() => setLoading(false))
  }, [])

  function handleLogin(data) {
    localStorage.setItem('kine_token', data.token)
    setAuth({ usuario: data.usuario, paciente: data.paciente })
  }

  function handleLogout() {
    localStorage.removeItem('kine_token')
    setAuth(null)
    navigate('/kine/login')
  }

  if (loading) return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#F0F8FA', color: '#0D3540', fontWeight: 900 }}>Rehabilitaplus</div>

  if (!auth) return <div className="kine-app"><Routes><Route path="/login" element={<Login onLogin={handleLogin} />} /><Route path="*" element={<Navigate to="/kine/login" replace />} /></Routes></div>

  if (auth.usuario.rol === 'admin') return <AdminLayout usuario={auth.usuario} onLogout={handleLogout} />
  return <PacienteLayout usuario={auth.usuario} paciente={auth.paciente} onLogout={handleLogout} />
}
