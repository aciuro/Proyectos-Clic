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

const s = {
  bg: '#f8fafc', white: '#ffffff',
  sidebar: '#0f172a',
  accent: '#059669', accentBg: '#ecfdf5', accentDark: '#047857',
  s50: '#f8fafc', s100: '#f1f5f9', s200: '#e2e8f0',
  s300: '#cbd5e1', s400: '#94a3b8', s500: '#64748b',
  s700: '#334155', s800: '#1e293b', s900: '#0f172a',
}

const NAV_ITEMS = [
  {
    id: 'dashboard', label: 'Dashboard', path: '/kine',
    icon: (a) => <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
      <path d="M3 11L11 4l8 7" stroke={a ? s.s900 : s.s300} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 9v9h4v-4h2v4h4V9" stroke={a ? s.s900 : s.s300} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>,
  },
  {
    id: 'pacientes', label: 'Pacientes', path: '/kine/pacientes',
    icon: (a) => <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="7" r="4" stroke={a ? s.s900 : s.s300} strokeWidth="1.5"/>
      <path d="M4 19c0-3.9 3.1-7 7-7s7 3.1 7 7" stroke={a ? s.s900 : s.s300} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>,
  },
  {
    id: 'agenda', label: 'Agenda', path: '/kine/agenda',
    icon: (a) => <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
      <rect x="3" y="5" width="16" height="14" rx="2" stroke={a ? s.s900 : s.s300} strokeWidth="1.5"/>
      <path d="M7 5V3M15 5V3M3 9h16" stroke={a ? s.s900 : s.s300} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>,
  },
  {
    id: 'ejercicios', label: 'Ejercicios', path: '/kine/ejercicios',
    icon: (a) => <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
      <path d="M4 6h14M4 11h9M4 16h7" stroke={a ? s.s900 : s.s300} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>,
  },
  {
    id: 'claude', label: 'Claude', path: '/kine/claude',
    icon: (a) => <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="8" stroke={a ? s.s900 : s.s300} strokeWidth="1.5"/>
      <path d="M8 11c0-1.7 1.3-3 3-3s3 1.3 3 3-1.3 3-3 3" stroke={a ? s.s900 : s.s300} strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="11" cy="15.5" r="0.7" fill={a ? s.s900 : s.s300}/>
    </svg>,
  },
]

function LogoBadge({ dark }) {
  return (
    <div style={{ width: 36, height: 36, background: s.accent, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: s.s900, flexShrink: 0 }}>
      R+
    </div>
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
    if (p.includes('/claude')) return 'claude'
    return 'dashboard'
  }

  const activeId = getActiveId()

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; }
        body { font-family: 'DM Sans', sans-serif; background: ${s.bg}; -webkit-font-smoothing: antialiased; }
        .pro-shell { display: flex; min-height: 100vh; flex-direction: column; background: ${s.bg}; }
        .pro-topbar { background: ${s.white}; border-bottom: 1px solid ${s.s200}; display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; }
        .pro-content { flex: 1; padding: 16px 16px 100px; overflow-x: hidden; }
        .pro-bottom-nav { position: fixed; bottom: 0; left: 0; right: 0; background: rgba(255,255,255,0.97); border-top: 1px solid ${s.s200}; padding: 10px 12px calc(env(safe-area-inset-bottom, 0px) + 10px); z-index: 100; }
        .pro-bnav-inner { display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; background: ${s.s100}; border-radius: 20px; padding: 6px; }
        .pro-bnav-btn { display: flex; flex-direction: column; align-items: center; gap: 3px; background: none; border: none; cursor: pointer; padding: 6px 4px; border-radius: 14px; }
        .pro-bnav-label { font-size: 9px; font-family: 'DM Sans', sans-serif; white-space: nowrap; font-weight: 500; }
        @media (min-width: 768px) {
          .pro-shell { flex-direction: row; height: 100vh; overflow: hidden; }
          .pro-sidebar { display: flex !important; width: 220px; background: ${s.sidebar}; flex-direction: column; flex-shrink: 0; }
          .pro-topbar { display: none; }
          .pro-bottom-nav { display: none; }
          .pro-content { flex: 1; overflow-y: auto; padding: 32px 36px 40px; }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: ${s.s200}; border-radius: 2px; }
      `}</style>

      <div className="pro-shell">
        {/* Sidebar desktop */}
        <aside className="pro-sidebar" style={{ display: 'none' }}>
          <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <LogoBadge />
              <div>
                <div style={{ fontWeight: 600, fontSize: 15, color: s.white }}>Rehabilitaplus</div>
                <div style={{ fontSize: 11, color: s.s400, marginTop: 2 }}>Panel profesional</div>
              </div>
            </div>
          </div>

          <div style={{ padding: '12px 10px', flex: 1, display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
            {NAV_ITEMS.map(item => {
              const active = activeId === item.id
              return (
                <button key={item.id} onClick={() => navigate(item.path)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 14, cursor: 'pointer', border: 'none', background: active ? s.white : 'transparent', width: '100%', textAlign: 'left', fontFamily: "'DM Sans', sans-serif", transition: 'background 0.12s' }}>
                  {item.icon(active)}
                  <span style={{ fontSize: 13.5, color: active ? s.s900 : s.s300, fontWeight: active ? 600 : 400 }}>{item.label}</span>
                </button>
              )
            })}
          </div>

          <div style={{ padding: '14px 16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ background: s.s800, borderRadius: 14, padding: '14px', marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: s.s400, marginBottom: 4 }}>Sesión activa</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: s.white }}>{usuario?.nombre}</div>
            </div>
            <button onClick={onLogout} style={{ width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '9px', fontSize: 12, color: s.s400, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
              Cerrar sesión
            </button>
          </div>
        </aside>

        {/* Topbar mobile */}
        <header className="pro-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <LogoBadge />
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: s.s900 }}>Rehabilitaplus</div>
              <div style={{ fontSize: 10, color: s.s500 }}>Panel profesional</div>
            </div>
          </div>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: s.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: s.s900 }}>
            {usuario?.nombre?.[0] || 'A'}
          </div>
        </header>

        {/* Contenido */}
        <main className="pro-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pacientes" element={<Pacientes />} />
            <Route path="/paciente/:id" element={<PacienteDetalle />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/ejercicios" element={<Ejercicios />} />
            <Route path="/claude" element={<KineClaude />} />
            <Route path="*" element={<Navigate to="/kine" replace />} />
          </Routes>
        </main>

        {/* Bottom nav mobile */}
        <nav className="pro-bottom-nav">
          <div className="pro-bnav-inner">
            {NAV_ITEMS.map(item => {
              const active = activeId === item.id
              return (
                <button key={item.id} className="pro-bnav-btn" onClick={() => navigate(item.path)}>
                  {item.icon(active)}
                  <span className="pro-bnav-label" style={{ color: active ? s.accent : s.s400 }}>{item.label}</span>
                </button>
              )
            })}
          </div>
        </nav>
      </div>
    </>
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
