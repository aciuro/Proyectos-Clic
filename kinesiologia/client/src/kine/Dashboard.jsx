import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from './api.js'

const c = {
  bg: '#F0F8FA', white: '#FFFFFF', sky: '#5BB8CC', skyDark: '#3A96AE',
  skyLight: '#DAEEF5', skyXlight: '#EEF7FA', aqua: '#7EC8B8', aquaDark: '#4FA898',
  aquaLight: '#D8F0EA', ink: '#0D3540', ink2: '#2A6070', muted: '#7AAAB8',
  border: '#C0DDE5',
  redBg: '#FEF0EE', redBorder: '#F5A897', redText: '#C0341D', redSub: '#E05A3A',
  yellow: '#FFF8D6', yellowBorder: '#F0DFA0', yellowText: '#7A5C00', yellowDark: '#B8860B',
}

const CSS = `
  .dash-two-col { display: grid; grid-template-columns: 1fr; gap: 0; }
  .dash-stat-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-bottom: 18px; }
  @media (min-width: 768px) {
    .dash-two-col { grid-template-columns: 1fr 1fr; gap: 20px; }
    .dash-stat-grid { grid-template-columns: repeat(4,1fr); }
  }
`

function getFechaDisplay() {
  const now = new Date()
  const days = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
  return `${days[now.getDay()]} ${now.getDate()} de ${months[now.getMonth()]}`
}

function getSaludo() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

function estadoBadge(estado) {
  if (estado === 'confirmado') return { bg: c.aquaLight, color: c.aquaDark }
  if (estado === 'pendiente')  return { bg: c.yellow,    color: c.yellowText }
  return { bg: c.skyLight, color: c.skyDark }
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const navigate = useNavigate()

  useEffect(() => { api.getDashboard().then(setData) }, [])

  if (!data) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'60px 0', color:c.muted, fontSize:13, fontFamily:"'DM Sans', sans-serif" }}>
      Cargando...
    </div>
  )

  const { stats, proximosTurnos } = data

  const statCards = [
    { label: 'Pacientes', value: stats.total_pacientes ?? '—', nav: '/kine/pacientes',
      icon: <svg width="20" height="20" viewBox="0 0 22 22" fill="none"><circle cx="8" cy="7" r="3" stroke={c.sky} strokeWidth="1.4"/><path d="M2 18c0-3.3 2.7-6 6-6" stroke={c.sky} strokeWidth="1.4" strokeLinecap="round"/><circle cx="15" cy="8" r="2.5" stroke={c.sky} strokeWidth="1.4"/><path d="M12 18c0-2.8 1.8-5 4-5.5" stroke={c.sky} strokeWidth="1.4" strokeLinecap="round"/></svg> },
    { label: 'Turnos hoy', value: stats.turnos_hoy ?? '—', nav: '/kine/agenda',
      icon: <svg width="20" height="20" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="8" stroke="#A78BFA" strokeWidth="1.4"/><path d="M11 7v4l2.5 2.5" stroke="#A78BFA" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg> },
    { label: 'Próximos', value: stats.turnos_proximos ?? '—', nav: '/kine/agenda',
      icon: <svg width="20" height="20" viewBox="0 0 22 22" fill="none"><rect x="3" y="5" width="16" height="14" rx="2" stroke={c.skyDark} strokeWidth="1.4"/><path d="M7 5V3M15 5V3M3 9h16" stroke={c.skyDark} strokeWidth="1.4" strokeLinecap="round"/><path d="M7 13l2.5 2.5L15 11" stroke={c.skyDark} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg> },
    { label: 'Sesiones mes', value: stats.sesiones_mes ?? '—', nav: null,
      icon: <svg width="20" height="20" viewBox="0 0 22 22" fill="none"><path d="M5 12l4 4 8-8" stroke={c.aquaDark} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  ]

  return (
    <div>
      <style>{CSS}</style>

      {/* Greeting */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 10, color: c.muted, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 3 }}>{getFechaDisplay()}</div>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: c.ink, lineHeight: 1.1 }}>{getSaludo()}, Augusto</div>
      </div>

      {/* Stats */}
      <div className="dash-stat-grid">
        {statCards.map(sc => (
          <div key={sc.label} onClick={() => sc.nav && navigate(sc.nav)}
            style={{ background: c.white, borderRadius: 13, border: `0.5px solid ${c.border}`, padding: '13px 12px', display: 'flex', flexDirection: 'column', gap: 5, cursor: sc.nav ? 'pointer' : 'default' }}>
            {sc.icon}
            <div style={{ fontSize: 24, fontWeight: 600, color: c.ink, lineHeight: 1 }}>{sc.value}</div>
            <div style={{ fontSize: 10, color: c.muted, lineHeight: 1.3 }}>{sc.label}</div>
          </div>
        ))}
      </div>

      <div className="dash-two-col">

        {/* Próximos turnos */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: c.muted, fontWeight: 500, marginBottom: 10 }}>Próximos turnos</div>
          {proximosTurnos.length === 0 ? (
            <div style={{ background: c.white, borderRadius: 13, border: `0.5px solid ${c.border}`, padding: 16, textAlign: 'center', color: c.muted, fontSize: 13 }}>
              Sin turnos próximos
            </div>
          ) : (
            proximosTurnos.map(t => {
              const tone = estadoBadge(t.estado)
              const hora = t.hora ? t.hora.slice(0, 5) : '—'
              const d = new Date(t.fecha + 'T12:00')
              const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
              const fechaCorta = `${d.getDate()} ${meses[d.getMonth()]}`
              return (
                <div key={t.id} style={{ background: c.white, borderRadius: 13, border: `0.5px solid ${c.border}`, padding: '11px 13px', marginBottom: 7, display: 'flex', alignItems: 'center', gap: 11 }}>
                  <div style={{ borderRadius: 10, width: 44, height: 44, background: c.sky, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', lineHeight: 1 }}>{hora}</span>
                    <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 }}>{fechaCorta}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: c.ink, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.nombre} {t.apellido}</div>
                    {t.motivo && <div style={{ fontSize: 11, color: c.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.motivo}</div>}
                  </div>
                  <span style={{ fontSize: 10, background: tone.bg, color: tone.color, padding: '2px 8px', borderRadius: 10, flexShrink: 0, whiteSpace: 'nowrap' }}>{t.estado}</span>
                </div>
              )
            })
          )}
          <button onClick={() => navigate('/kine/agenda')}
            style={{ width: '100%', marginTop: 2, padding: '9px 0', borderRadius: 11, border: `0.5px solid ${c.border}`, background: 'transparent', fontSize: 11, color: c.skyDark, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
            Ver agenda completa →
          </button>
        </div>

        {/* Acceso rápido */}
        <div>
          <div style={{ fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: c.muted, fontWeight: 500, marginBottom: 10 }}>Acceso rápido</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>

            {/* Rutinas */}
            <div onClick={() => navigate('/kine/ejercicios')}
              style={{ background: `linear-gradient(135deg,${c.aquaLight},#C8EDE5)`, border: `0.5px solid #A8DDD5`, borderRadius: 16, padding: '16px 14px', cursor: 'pointer' }}>
              <div style={{ width: 36, height: 36, borderRadius: 11, background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <svg width="18" height="18" viewBox="0 0 22 22" fill="none"><path d="M5 11c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke={c.aquaDark} strokeWidth="1.5" strokeLinecap="round"/><path d="M8 15l3-8 3 8" stroke={c.aquaDark} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 13h4" stroke={c.aquaDark} strokeWidth="1.5" strokeLinecap="round"/></svg>
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: c.aquaDark, lineHeight: 1, marginBottom: 3 }}>{stats.total_pacientes ?? '—'}</div>
              <div style={{ fontSize: 9, color: c.aquaDark, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Rutinas activas</div>
            </div>

            {/* Pacientes */}
            <div onClick={() => navigate('/kine/pacientes')}
              style={{ background: `linear-gradient(135deg,${c.skyLight},${c.skyXlight})`, border: `0.5px solid ${c.border}`, borderRadius: 16, padding: '16px 14px', cursor: 'pointer' }}>
              <div style={{ width: 36, height: 36, borderRadius: 11, background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <svg width="18" height="18" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="7" r="4" stroke={c.skyDark} strokeWidth="1.4"/><path d="M4 19c0-3.9 3.1-7 7-7s7 3.1 7 7" stroke={c.skyDark} strokeWidth="1.4" strokeLinecap="round"/></svg>
              </div>
              <div style={{ fontSize: 10, fontWeight: 500, color: c.skyDark, marginBottom: 4 }}>Pacientes</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 9, color: c.skyDark }}>→ Ver listado</span>
                <span style={{ fontSize: 9, color: c.muted }}>→ Agregar nuevo</span>
              </div>
            </div>

            {/* Claude IA */}
            <div onClick={() => navigate('/kine/claude')}
              style={{ background: `linear-gradient(135deg,${c.yellow},#FFF3C0)`, border: `0.5px solid ${c.yellowBorder}`, borderRadius: 16, padding: '16px 14px', cursor: 'pointer' }}>
              <div style={{ width: 36, height: 36, borderRadius: 11, background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <svg width="18" height="18" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="8" stroke={c.yellowDark} strokeWidth="1.5"/><path d="M8 9c0-1.7 1.3-3 3-3s3 1.3 3 3c0 2-3 2.5-3 5" stroke={c.yellowDark} strokeWidth="1.4" strokeLinecap="round"/><circle cx="11" cy="17" r="0.8" fill={c.yellowDark}/></svg>
              </div>
              <div style={{ fontSize: 10, fontWeight: 500, color: c.yellowText, marginBottom: 5 }}>Asistente IA</div>
              <div style={{ fontSize: 9, color: c.yellowDark, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Claude →</div>
            </div>

          </div>

          {/* Botones nuevos */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button onClick={() => navigate('/kine/pacientes')}
              style={{ background: c.white, border: `0.5px solid ${c.border}`, borderRadius: 13, padding: '12px', fontSize: 12, fontWeight: 500, color: c.ink2, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
              + Nuevo paciente
            </button>
            <button onClick={() => navigate('/kine/agenda')}
              style={{ background: `linear-gradient(135deg,${c.sky},${c.skyDark})`, border: 'none', borderRadius: 13, padding: '12px', fontSize: 12, fontWeight: 500, color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
              + Nuevo turno
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
