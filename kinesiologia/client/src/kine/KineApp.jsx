import { useEffect, useState } from 'react'
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { api } from './api.js'
import Login from './Login.jsx'
import Dashboard from './Dashboard.jsx'
import Pacientes from './Pacientes.jsx'
import PacienteDetalle from './PacienteDetalle.jsx'
import PatientClinicalRoutineBridge from './PatientClinicalRoutineBridge.jsx'
import ClinicalRoutinePatientPage from './ClinicalRoutinePatientPage.jsx'
import ClinicalRoutinesHub from './ClinicalRoutinesHub.jsx'
import Ejercicios from './Ejercicios.jsx'
import Agenda from './Agenda.jsx'
import KineClaude from './KineClaude.jsx'
import Notas from './Notas.jsx'
import Cuenta from './Cuenta.jsx'
import PortalPaciente from './PortalPaciente.jsx'
import './kine.css'
import './premium-refresh.css'

const c = {
  bg: '#F6FBFC', white: '#FFFFFF', sky: '#3FA7B8', skyDark: '#277F92',
  skyLight: '#E2F5F8', skyXlight: '#F3FBFD', aqua: '#79CDBB', aquaDark: '#4FA898',
  aquaLight: '#E8F8F4', ink: '#0B2F38', ink2: '#315F68', muted: '#7FA5AE',
  border: 'rgba(113,167,179,.28)', sidebar: '#EEE4D4',
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
  { id: 'rutinas-clinicas', label: 'Rutinas clínicas', path: '/kine/rutinas-clinicas',
    icon: (a) => <svg width="18" height="18" viewBox="0 0 22 22" fill="none"><path d="M5 5h12v12H5z" stroke={a ? c.skyDark : 'rgba(13,53,64,0.35)'} strokeWidth="1.5"/><path d="M8 9h6M8 13h4" stroke={a ? c.skyDark : 'rgba(13,53,64,0.35)'} strokeWidth="1.5" strokeLinecap="round"/></svg> },
  { id: 'cuenta',     label: 'Cuenta',    path: '/kine/cuenta',
    icon: (a) => <svg width="18" height="18" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="8" stroke={a ? c.skyDark : 'rgba(13,53,64,0.35)'} strokeWidth="1.5"/><path d="M11 7v1.5m0 5V15m-2-5.5c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2 .9-2 2 .9 2 2 2" stroke={a ? c.skyDark : 'rgba(13,53,64,0.35)'} strokeWidth="1.3" strokeLinecap="round"/></svg> },
  { id: 'notas',      label: 'Notas',     path: '/kine/notas',
    icon: (a) => <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M3 2h7l3 3v9H3V2z" stroke={a ? c.skyDark : 'rgba(13,53,64,0.35)'} strokeWidth="1.2" strokeLinejoin="round"/><path d="M10 2v3h3" stroke={a ? c.skyDark : 'rgba(13,53,64,0.35)'} strokeWidth="1.2" strokeLinejoin="round"/><path d="M5 7h6M5 9.5h4" stroke={a ? c.skyDark : 'rgba(13,53,64,0.35)'} strokeWidth="1.1" strokeLinecap="round"/></svg> },
]

const ADMIN_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&family=DM+Serif+Display&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body { font-family: 'DM Sans', sans-serif; background: ${c.bg}; -webkit-font-smoothing: antialiased; color: ${c.ink}; }
  textarea, input { outline: none; }
  .adm-shell { display: flex; min-height: 100vh; flex-direction: column; background: radial-gradient(circle at 58% -8%, rgba(91,184,204,.18), transparent 34%), linear-gradient(135deg, #F6FBFC 0%, #FAFDFD 56%, #EEF8FA 100%); }
  .adm-topbar { background: transparent; display: flex; align-items: center; justify-content: space-between; padding: 16px 18px 8px; }
  .adm-content { flex: 1; padding: 4px 16px 130px; }
  .adm-bottom-nav { position: fixed; bottom: 12px; left: 12px; right: 12px; background: rgba(255,255,255,.86); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); border: 1px solid ${c.border}; border-radius: 24px; display: flex; justify-content: space-around; padding: 10px 4px env(safe-area-inset-bottom,10px); z-index: 100; box-shadow: 0 18px 48px rgba(13,53,64,.14); }
  .adm-bnav-btn { display: flex; flex-direction: column; align-items: center; gap: 2px; flex: 1; min-width: 48px; background: none; border: none; cursor: pointer; padding: 5px 2px; border-radius: 16px; }
  .adm-bnav-label { font-size: 8.5px; font-family: 'DM Sans', sans-serif; white-space: nowrap; }
  .adm-bnav-dot { width: 4px; height: 4px; border-radius: 50%; background: ${c.skyDark}; margin: 1px auto 0; }
  @media (min-width: 768px) {
    .adm-shell { flex-direction: row; height: 100vh; overflow: hidden; }
    .adm-sidebar { display: flex !important; width: 220px; background: linear-gradient(180deg, #EEE5D7 0%, #E7DDCD 100%); flex-direction: column; flex-shrink: 0; border-right: 1px solid rgba(13,53,64,.08); box-shadow: 8px 0 34px rgba(13,53,64,.045); }
    .adm-topbar { display: none; }
    .adm-bottom-nav { display: none; }
    .adm-content { flex: 1; overflow-y: auto; padding: 36px 42px 48px; }
  }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: rgba(63,167,184,.35); border-radius: 2px; }
`

function LogoSVG() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <ellipse cx="13" cy="13" rx="7.5" ry="10.5" fill="#5BB8CC" transform="rotate(-20 13 13)"/>
      <ellipse cx="13" cy="13" rx="5.5" ry="8.5" fill="#79CDBB" opacity="0.62" transform="rotate(30 13 13)"/>
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
    if (p.includes('/rutinas-clinicas')) return 'rutinas-clinicas'
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
      <aside className="adm-sidebar" style={{ display: 'none' }}>
        <div style={{ padding: '28px 20px 24px', borderBottom: `1px solid rgba(13,53,64,0.08)` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <LogoSVG />
            <div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 17, color: c.ink, letterSpacing: '-.02em' }}>Rehabilitaplus</div>
              <div style={{ fontSize: 9, color: c.muted, letterSpacing: '1.25px', textTransform: 'uppercase', marginTop: 2 }}>Panel profesional</div>
            </div>
          </div>
        </div>
        <div style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
          {NAV_ITEMS.map(item => {
            const active = activeId === item.id
            return (
              <button key={item.id} onClick={() => navigate(item.path)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 16, cursor: 'pointer', border: 'none', background: active ? `rgba(63,167,184,0.14)` : 'transparent', width: '100%', textAlign: 'left', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.16s ease', boxShadow: active ? 'inset 0 0 0 1px rgba(63,167,184,.16)' : 'none' }}>
                {item.icon(active)}
                <span style={{ fontSize: 12.5, color: active ? c.skyDark : 'rgba(13,53,64,0.52)', fontWeight: active ? 800 : 500 }}>{item.label}</span>
              </button>
            )
          })}
        </div>
        <div style={{ padding: '16px 20px', borderTop: `1px solid rgba(13,53,64,0.08)`, display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: `linear-gradient(135deg, ${c.sky} 0%, ${c.skyDark} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: '#fff', boxShadow: '0 10px 22px rgba(39,127,146,.18)' }}>
            {nombre[0]}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: c.ink2, fontWeight: 800 }}>{usuario?.nombre}</div>
            <div style={{ fontSize: 10, color: c.muted }}>Kinesiología</div>
          </div>
          <button onClick={onLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.muted, fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 800 }}>Salir</button>
        </div>
      </aside>
      <header className="adm-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LogoSVG />
          <div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 15, color: c.ink }}>Rehabilitaplus</div>
            <div style={{ fontSize: 9, color: c.muted, letterSpacing: '1px', textTransform: 'uppercase' }}>Panel profesional</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: c.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff' }}>
            {nombre[0]}
          </div>
          <button onClick={onLogout} style={{ background: 'rgba(255,255,255,.85)', border: `1px solid ${c.border}`, borderRadius: 12, padding: '6px 11px', fontSize: 11, color: c.muted, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 800 }}>Salir</button>
        </div>
      </header>
      <main className="adm-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pacientes" element={<Pacientes />} />
          <Route path="/paciente/:id" element={<PatientClinicalRoutineBridge />} />
          <Route path="/paciente/:id/rutinas-clinicas" element={<ClinicalRoutinePatientPage />} />
          <Route path="/rutinas-clinicas" element={<ClinicalRoutinesHub />} />
          <Route path="/rutinas-clinicas/:id" element={<ClinicalRoutinePatientPage />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/ejercicios" element={<Ejercicios />} />
          <Route path="/claude" element={<KineClaude />} />
          <Route path="/cuenta" element={<Cuenta />} />
          <Route path="/notas" element={<Notas />} />
          <Route path="*" element={<Navigate to="/kine" replace />} />
        </Routes>
      </main>
      <nav className="adm-bottom-nav">
        {NAV_ITEMS.map(item => {
          const active = activeId === item.id
          return (
            <button key={item.id} className="adm-bnav-btn" onClick={() => navigate(item.path)}>
              {item.icon(active)}
              <span className="adm-bnav-label" style={{ color: active ? c.skyDark : 'rgba(13,53,64,0.45)', fontWeight: active ? 800 : 500 }}>{item.label}</span>
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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#F6FBFC', gap: 12 }}>
        <div style={{ width: 46, height: 46, background: `linear-gradient(135deg, ${c.sky} 0%, ${c.skyDark} 100%)`, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 16, color: '#fff', boxShadow: '0 18px 42px rgba(39,127,146,.2)' }}>R+</div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, fontWeight: 900, color: c.ink }}>Rehabilitaplus</div>
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
