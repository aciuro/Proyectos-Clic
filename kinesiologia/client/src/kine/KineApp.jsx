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
import PortalPaciente from './PortalPaciente.jsx'
import './kine.css'

const blue       = '#2563eb'
const blue100    = '#dbeafe'
const blue50     = '#eff6ff'
const s50        = '#f8fafc'
const s100       = '#f1f5f9'
const s200       = '#e2e8f0'
const s400       = '#94a3b8'
const s500       = '#64748b'
const s700       = '#334155'
const s900       = '#0f172a'

const NAV_ITEMS = [
  { id: 'dashboard',   label: 'Inicio',     path: '/kine' },
  { id: 'pacientes',   label: 'Pacientes',  path: '/kine/pacientes' },
  { id: 'agenda',      label: 'Agenda',     path: '/kine/agenda' },
  { id: 'ejercicios',  label: 'Ejercicios', path: '/kine/ejercicios' },
  { id: 'claude',      label: 'Claude',     path: '/kine/claude' },
]

const ADMIN_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body { font-family: 'DM Sans', sans-serif; background: ${s50}; -webkit-font-smoothing: antialiased; }
  .adm-root { background: ${s50}; min-height: 100vh; font-family: 'DM Sans', sans-serif; }
  .adm-content { padding: 16px 16px 130px; max-width: 720px; margin: 0 auto; }
  .adm-bottombar { position: fixed; bottom: 0; left: 0; right: 0; border-top: 1px solid ${s200}; background: rgba(255,255,255,0.95); backdrop-filter: blur(8px); padding: 12px 16px calc(env(safe-area-inset-bottom,0px) + 12px); z-index: 100; }
  .adm-nav-pill { display: grid; grid-template-columns: repeat(5,1fr); gap: 6px; background: ${s50}; border-radius: 24px; padding: 8px; }
  .adm-nav-btn { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; padding: 6px 2px; border-radius: 16px; border: none; cursor: pointer; background: none; font-family: 'DM Sans', sans-serif; font-size: 10px; font-weight: 400; color: ${s500}; transition: all 0.15s; }
  .adm-nav-btn.active { font-weight: 600; color: ${blue}; }
  .adm-nav-icon { width: 26px; height: 26px; border-radius: 50%; background: ${s100}; display: flex; align-items: center; justify-content: center; transition: background 0.15s; }
  .adm-nav-btn.active .adm-nav-icon { background: ${blue100}; }
  @media (min-width: 768px) {
    .adm-content { padding: 32px 32px 40px; }
    .adm-bottombar { position: static; border-top: none; background: transparent; backdrop-filter: none; padding: 0; }
    .adm-nav-pill { max-width: 480px; }
  }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: ${s200}; border-radius: 2px; }
`

const NAV_ICONS = {
  dashboard:  <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M2 10L10 3l8 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 8.5v7h3.5v-3h3v3H15v-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  pacientes:  <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.6"/><path d="M3 18c0-3.9 3.1-7 7-7s7 3.1 7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  agenda:     <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><rect x="2" y="4" width="16" height="13" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M6 4V2M14 4V2M2 8h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  ejercicios: <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M3 5h14M3 10h9M3 15h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  claude:     <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.6"/><path d="M7.5 10c0-1.4 1.1-2.5 2.5-2.5s2.5 1.1 2.5 2.5-1.1 2.5-2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><circle cx="10" cy="14" r="0.7" fill="currentColor"/></svg>,
}

function AdminLayout({ usuario, onLogout }) {
  const navigate = useNavigate()
  const location = useLocation()

  function getActiveId() {
    const p = location.pathname
    if (p === '/kine' || p === '/kine/') return 'dashboard'
    if (p.includes('/paciente')) return 'pacientes'
    if (p.includes('/agenda')) return 'agenda'
    if (p.includes('/ejercicios')) return 'ejercicios'
    if (p.includes('/claude')) return 'claude'
    return 'dashboard'
  }

  const activeId = getActiveId()
  const nombre = usuario?.nombre?.split(' ')[0] || 'Augusto'

  return (
    <div className="adm-root">
      <style>{ADMIN_STYLE}</style>

      <div className="adm-content">
        {/* Header */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <p style={{ fontSize: 14, color: s500 }}>Panel profesional</p>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: s900, letterSpacing: '-0.025em', marginTop: 2 }}>
              Hola, {nombre} 👋
            </h1>
          </div>
          <div style={{ width: 44, height: 44, background: blue, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, color: '#fff', boxShadow: '0 1px 3px rgba(37,99,235,0.3)', flexShrink: 0 }}>
            R+
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pacientes" element={<Pacientes />} />
          <Route path="/paciente/:id" element={<PacienteDetalle />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/ejercicios" element={<Ejercicios />} />
          <Route path="/claude" element={<KineClaude />} />
          <Route path="*" element={<Navigate to="/kine" replace />} />
        </Routes>
      </div>

      {/* Bottom bar */}
      <div className="adm-bottombar">
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <div className="adm-nav-pill">
            {NAV_ITEMS.map(item => {
              const active = activeId === item.id
              return (
                <button key={item.id} className={`adm-nav-btn${active ? ' active' : ''}`} onClick={() => navigate(item.path)}>
                  <span className="adm-nav-icon">{NAV_ICONS[item.id]}</span>
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function PacienteLayout({ usuario, paciente, onLogout }) {
  return (
    <Routes>
      <Route path="/*" element={<PortalPaciente usuario={usuario} paciente={paciente} onLogout={onLogout} />} />
    </Routes>
  )
}

export default function KineApp() {
  const [auth, setAuth] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('kine_token')
    if (!token) { setLoading(false); return }
    api.me()
      .then(data => setAuth(data))
      .catch(() => localStorage.removeItem('kine_token'))
      .finally(() => setLoading(false))
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

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8fafc', gap: 12 }}>
        <div style={{ width: 44, height: 44, background: '#059669', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: '#0f172a' }}>R+</div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, fontWeight: 600, color: '#0f172a' }}>Rehabilitaplus</div>
      </div>
    )
  }

  if (!auth) {
    return (
      <div className="kine-app">
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/kine/login" replace />} />
        </Routes>
      </div>
    )
  }

  if (auth.usuario.rol === 'admin') {
    return <AdminLayout usuario={auth.usuario} onLogout={handleLogout} />
  }

  return <PacienteLayout usuario={auth.usuario} paciente={auth.paciente} onLogout={handleLogout} />
}
