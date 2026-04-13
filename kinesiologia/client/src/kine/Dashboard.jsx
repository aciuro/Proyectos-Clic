import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from './api.js'

const c = {
  bg: '#F0F8FA', white: '#FFFFFF', sky: '#5BB8CC', skyDark: '#3A96AE',
  skyLight: '#DAEEF5', skyXlight: '#EEF7FA', aqua: '#7EC8B8', aquaDark: '#4FA898',
  aquaLight: '#D8F0EA', ink: '#0D3540', ink2: '#2A6070', muted: '#7AAAB8',
  border: '#C0DDE5', redBg: '#FEF0EE', redBorder: '#F5A897', redText: '#C0341D',
  redSub: '#E05A3A', yellow: '#FFF8D6', yellowBorder: '#F0DFA0', yellowText: '#7A5C00',
}

const STAT_ICONS = {
  patients: (color) => <svg width="20" height="20" viewBox="0 0 22 22" fill="none"><circle cx="8" cy="7" r="3" stroke={color} strokeWidth="1.4"/><path d="M2 18c0-3.3 2.7-6 6-6" stroke={color} strokeWidth="1.4" strokeLinecap="round"/><circle cx="15" cy="8" r="2.5" stroke={color} strokeWidth="1.4"/><path d="M12 18c0-2.8 1.8-5 4-5.5" stroke={color} strokeWidth="1.4" strokeLinecap="round"/></svg>,
  injury:   (color) => <svg width="20" height="20" viewBox="0 0 22 22" fill="none"><path d="M11 3v4M11 15v4M3 11h4M15 11h4" stroke={color} strokeWidth="1.4" strokeLinecap="round"/><circle cx="11" cy="11" r="4" stroke={color} strokeWidth="1.4"/></svg>,
  sessions: (color) => <svg width="20" height="20" viewBox="0 0 22 22" fill="none"><rect x="3" y="5" width="16" height="14" rx="2" stroke={color} strokeWidth="1.4"/><path d="M7 5V3M15 5V3M3 9h16" stroke={color} strokeWidth="1.4" strokeLinecap="round"/><path d="M7 13l2.5 2.5L15 11" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  today:    (color) => <svg width="20" height="20" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="8" stroke={color} strokeWidth="1.4"/><path d="M11 7v4l2.5 2.5" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  upcoming: (color) => <svg width="20" height="20" viewBox="0 0 22 22" fill="none"><path d="M5 12l4 4 8-8" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
}

const STAT_DEFS = [
  { key: 'total_pacientes',  label: 'Pacientes totales', icon: 'patients', color: c.sky,     nav: '/kine/pacientes' },
  { key: 'lesiones_activas', label: 'Lesiones activas',  icon: 'injury',   color: '#F59E0B', nav: null },
  { key: 'sesiones_mes',     label: 'Sesiones este mes', icon: 'sessions', color: c.aqua,    nav: null },
  { key: 'turnos_hoy',       label: 'Turnos hoy',        icon: 'today',    color: '#A78BFA', nav: '/kine/agenda' },
  { key: 'turnos_proximos',  label: 'Turnos próximos',   icon: 'upcoming', color: c.skyDark, nav: '/kine/agenda' },
]

function getNombreDia() {
  const d = new Date()
  const hora = d.getHours()
  if (hora < 12) return 'Buen día'
  if (hora < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

function getFechaDisplay() {
  return new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const navigate = useNavigate()

  useEffect(() => { api.getDashboard().then(setData) }, [])

  if (!data) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0', color: c.muted, fontSize: 13 }}>
        Cargando...
      </div>
    )
  }

  const { stats, proximosTurnos } = data

  return (
    <div>
      {/* Encabezado */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, color: c.muted, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 3, textTransform: 'capitalize' }}>
          {getFechaDisplay()}
        </div>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: c.ink, lineHeight: 1.1 }}>
          {getNombreDia()}, Augusto
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 18 }}>
        {STAT_DEFS.map(def => (
          <div key={def.key}
            onClick={() => def.nav && navigate(def.nav)}
            style={{ background: c.white, borderRadius: 13, border: `0.5px solid ${c.border}`, padding: '13px 12px', display: 'flex', flexDirection: 'column', gap: 5, cursor: def.nav ? 'pointer' : 'default', transition: 'box-shadow 0.15s' }}
            onMouseEnter={e => { if (def.nav) e.currentTarget.style.boxShadow = `0 4px 16px rgba(91,184,204,0.15)` }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}>
            {STAT_ICONS[def.icon](def.color)}
            <div style={{ fontSize: 24, fontWeight: 600, color: c.ink, lineHeight: 1 }}>{stats[def.key] ?? '—'}</div>
            <div style={{ fontSize: 10, color: c.muted, lineHeight: 1.3 }}>{def.label}</div>
          </div>
        ))}
      </div>

      {/* Próximos turnos */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: c.muted, fontWeight: 500, marginBottom: 10 }}>Próximos turnos</div>
        {proximosTurnos.length === 0 ? (
          <div style={{ background: c.skyXlight, borderRadius: 13, padding: '16px', textAlign: 'center', color: c.muted, fontSize: 13 }}>Sin turnos próximos</div>
        ) : (
          <>
            {proximosTurnos.map(t => {
              const fecha = new Date(t.fecha + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })
              return (
                <div key={t.id} onClick={() => navigate('/kine/agenda')}
                  style={{ background: c.white, borderRadius: 13, border: `0.5px solid ${c.border}`, padding: '11px 13px', marginBottom: 7, display: 'flex', alignItems: 'center', gap: 11, cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = c.sky; e.currentTarget.style.boxShadow = `0 4px 14px rgba(91,184,204,0.12)` }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.boxShadow = 'none' }}>
                  <div style={{ borderRadius: 10, width: 44, height: 44, background: c.sky, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', lineHeight: 1 }}>{t.hora}</span>
                    <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 }}>{fecha.split(' ').slice(1).join(' ')}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: c.ink, marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.nombre} {t.apellido}</div>
                    {t.motivo && <div style={{ fontSize: 11, color: c.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.motivo}</div>}
                  </div>
                  <span style={{ fontSize: 10, background: t.estado === 'confirmado' ? c.aquaLight : c.redBg, color: t.estado === 'confirmado' ? c.aquaDark : c.redText, padding: '2px 8px', borderRadius: 10, flexShrink: 0 }}>{t.estado}</span>
                </div>
              )
            })}
            <button onClick={() => navigate('/kine/agenda')} style={{ width: '100%', marginTop: 2, padding: '9px 0', borderRadius: 11, border: `0.5px solid ${c.border}`, background: 'transparent', fontSize: 11, color: c.skyDark, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
              Ver agenda completa →
            </button>
          </>
        )}
      </div>

      {/* Accesos rápidos */}
      <div>
        <div style={{ fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: c.muted, fontWeight: 500, marginBottom: 10 }}>Acceso rápido</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          <div onClick={() => navigate('/kine/pacientes')} style={{ background: `linear-gradient(135deg,${c.aquaLight},#C8EDE5)`, border: `0.5px solid #A8DDD5`, borderRadius: 16, padding: '14px 12px', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
              {STAT_ICONS.patients(c.aquaDark)}
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: c.aquaDark, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Pacientes</div>
          </div>

          <div onClick={() => navigate('/kine/agenda')} style={{ background: `linear-gradient(135deg,${c.skyLight},${c.skyXlight})`, border: `0.5px solid ${c.border}`, borderRadius: 16, padding: '14px 12px', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
              {STAT_ICONS.today(c.skyDark)}
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: c.skyDark, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Agenda</div>
          </div>

          <div onClick={() => navigate('/kine/ejercicios')} style={{ background: `linear-gradient(135deg,#F3E5F5,#E1BEE7)`, border: `0.5px solid #CE93D8`, borderRadius: 16, padding: '14px 12px', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
              {STAT_ICONS.sessions('#8E24AA')}
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#6A1B9A', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Ejercicios</div>
          </div>
        </div>
      </div>
    </div>
  )
}
