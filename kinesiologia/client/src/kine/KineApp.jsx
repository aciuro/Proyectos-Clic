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

const c = {
  bg: '#F0F8FA', white: '#FFFFFF', sky: '#5BB8CC', skyDark: '#3A96AE',
  skyLight: '#DAEEF5', skyXlight: '#EEF7FA', aqua: '#7EC8B8', aquaDark: '#4FA898',
  aquaLight: '#D8F0EA', ink: '#0D3540', ink2: '#2A6070', muted: '#7AAAB8',
  border: '#C0DDE5', sidebar: '#E8DFD0',
}

const NAV_ITEMS = [
  { id: 'dashboard',  label: 'Dashboard', path: '/kine',
    icon: (a) => <svg width="18" height="18" viewBox="0 0 22 22" fill="none"><path d="M3 11L11 4l8 7" stroke={a ? c.skyDark : 'rgba(13,53,64,0.35)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 9v9h4v-4h2v4h4V9" stroke={a ? c.skyDark : 'rgba(13,53,64,0.35)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { id: 'pacientes',  label: 'Pacientes', path: '/kine/pacientes',
    icon: (a) => <svg width="18" height="18" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="7" r="4" stroke={a ? c.skyDark : 'rgba(13,53,64,0.35)'} strokeWidth="1.5"/><path d="M4 19c0-3.9 3.1-7 7-7s7 3.1 7 7" stroke={a ? c.skyDark : 'rgba(13,53,64,0.35)'} strokeWidth="1.5" strokeLinecap="round"/></svg> },
  { id: 'agenda',     label: 'Agenda',    path: '/kine/agenda',
    icon: (a) => <svg width="18" height="18" viewBox="0 0 22 22" fill="none"><rect x="3" y="5" width="16" height="14" rx="2" stroke={a ? c.skyDark : 'rgba(13,53,64,0.35)'} strokeWidth="1.5"/><path d="M7 5V3M15 5V3M3 9h16" stroke={a ? c.skyDark : 'rgba(13,53,64,0.35)'} strokeWidth="1.5" strokeLinecap="round"/></svg> },
  { id: 'ejercicios', label: 'Rutinas',   path: '/kine/ejercicios',
    icon: (a) => <svg width="18" height="18" viewBox="0 0 22 22" fill="none"><path d="M4 6h14M4 11h9M4 16h7" stroke={a ? c.skyDark : 'rgba(13,53,64,0.35)'} strokeWidth="1.5" strokeLinecap="round"/></svg> },
  { id: 'cuenta',     label: 'Cuenta',    path: '/kine/cuenta',
    icon: (a) => <svg width="18" height="18" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="8" stroke={a ? c.skyDark : 'rgba(13,53,64,0.35)'} strokeWidth="1.5"/><path d="M11 7v1.5m0 5V15m-2-5.5c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2 .9-2 2 .9 2 2 2" stroke={a ? c.skyDark : 'rgba(13,53,64,0.35)'} strokeWidth="1.3" strokeLinecap="round"/></svg> },
  { id: 'notas',      label: 'Notas',     path: '/kine/notas',
    icon: (a) => <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M3 2h7l3 3v9H3V2z" stroke={a ? c.skyDark : 'rgba(13,53,64,0.35)'} strokeWidth="1.2" strokeLinejoin="round"/><path d="M10 2v3h3" stroke={a ? c.skyDark : 'rgba(13,53,64,0.35)'} strokeWidth="1.2" strokeLinejoin="round"/><path d="M5 7h6M5 9.5h4" stroke={a ? c.skyDark : 'rgba(13,53,64,0.35)'} strokeWidth="1.1" strokeLinecap="round"/></svg> },
]

const ADMIN_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body { font-family: 'DM Sans', sans-serif; background: ${c.bg}; -webkit-font-smoothing: antialiased; }
  textarea, input { outline: none; }
  .adm-shell { display: flex; min-height: 100vh; flex-direction: column; background: ${c.bg}; }
  .adm-topbar { background: transparent; display: flex; align-items: center; justify-content: space-between; padding: 16px 18px 8px; }
  .adm-content { flex: 1; padding: 4px 16px 130px; }
  .adm-bottom-nav { position: fixed; bottom: 12px; left: 12px; right: 12px; background: ${c.white}; border: 0.5px solid ${c.border}; border-radius: 22px; display: flex; justify-content: space-around; padding: 10px 4px env(safe-area-inset-bottom,10px); z-index: 100; box-shadow: 0 4px 24px rgba(13,53,64,0.08); }
  .adm-bnav-btn { display: flex; flex-direction: column; align-items: center; gap: 2px; flex: 1; min-width: 48px; background: none; border: none; cursor: pointer; padding: 4px 2px; }
  .adm-bnav-label { font-size: 8.5px; font-family: 'DM Sans', sans-serif; white-space: nowrap; }
  .adm-bnav-dot { width: 4px; height: 4px; border-radius: 50%; background: ${c.skyDark}; margin: 1px auto 0; }
  @media (min-width: 768px) {
    .adm-shell { flex-direction: row; height: 100vh; overflow: hidden; }
    .adm-sidebar { display: flex !important; width: 210px; background: ${c.sidebar}; flex-direction: column; flex-shrink: 0; }
    .adm-topbar { display: none; }
    .adm-bottom-nav { display: none; }
    .adm-content { flex: 1; overflow-y: auto; padding: 30px 36px 40px; }
  }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: ${c.border}; border-radius: 2px; }
`

function LogoSVG() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <ellipse cx="13" cy="13" rx="7.5" ry="10.5" fill="#5BB8CC" transform="rotate(-20 13 13)"/>
      <ellipse cx="13" cy="13" rx="5.5" ry="8.5" fill="#7EC8B8" opacity="0.6" transform="rotate(30 13 13)"/>
      <line x1="13" y1="4" x2="13" y2="22" stroke={c.ink} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
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
    if (p.includes('/claude'))    return 'claude'
    if (p.includes('/cuenta'))    return 'cuenta'
    if (p.includes('/notas'))     return 'notas'
    return 'dashboard'
  }

  const activeId = getActiveId()
  const nombre = usuario?.nombre?.split(' ')[0] || 'Augusto'

  return (
    <div className="adm-shell">
      <style>{ADMIN_CSS}</style>

      {/* Sidebar desktop */}
      <aside className="adm-sidebar" style={{ display: 'none' }}>
        <div style={{ padding: '26px 20px 22px', borderBottom: `0.5px solid rgba(13,53,64,0.1)` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <LogoSVG />
            <div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, color: c.ink }}>Rehabilitaplus</div>
              <div style={{ fontSize: 9, color: c.muted, letterSpacing: '1.2px', textTransform: 'uppercase', marginTop: 2 }}>Panel profesional</div>
            </div>
          </div>
        </div>
        <div style={{ padding: '14px 10px', flex: 1, display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          {NAV_ITEMS.map(item => {
            const active = activeId === item.id
            return (
              <button key={item.id} onClick={() => navigate(item.path)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, cursor: 'pointer', border: 'none', background: active ? `rgba(91,184,204,0.18)` : 'none', width: '100%', textAlign: 'left', fontFamily: "'DM Sans', sans-serif", transition: 'background 0.12s' }}>
                {item.icon(active)}
                <span style={{ fontSize: 12.5, color: active ? c.skyDark : 'rgba(13,53,64,0.5)', fontWeight: active ? 500 : 400 }}>{item.label}</span>
              </button>
            )
          })}
        </div>
        <div style={{ padding: '16px 20px', borderTop: `0.5px solid rgba(13,53,64,0.1)`, display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: c.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#fff' }}>
            {nombre[0]}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: c.ink2, fontWeight: 500 }}>{usuario?.nombre}</div>
            <div style={{ fontSize: 10, color: c.muted }}>Kinesiología</div>
          </div>
          <button onClick={onLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.muted, fontSize: 11, fontFamily: "'DM Sans', sans-serif" }}>Salir</button>
        </div>
      </aside>

      {/* Topbar mobile */}
      <header className="adm-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LogoSVG />
          <div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 15, color: c.ink }}>Rehabilitaplus</div>
            <div style={{ fontSize: 9, color: c.muted, letterSpacing: '1px', textTransform: 'uppercase' }}>Panel profesional</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: c.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#fff' }}>
            {nombre[0]}
          </div>
          <button onClick={onLogout} style={{ background: 'none', border: `0.5px solid ${c.border}`, borderRadius: 8, padding: '5px 10px', fontSize: 11, color: c.muted, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Salir</button>
        </div>
      </header>

      {/* Contenido */}
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

      {/* Bottom nav flotante mobile */}
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
