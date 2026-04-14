import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from './api.js'

const s = {
  bg: '#f8fafc', white: '#ffffff',
  accent: '#059669', accentBg: '#ecfdf5', accentDark: '#047857',
  s50: '#f8fafc', s100: '#f1f5f9', s200: '#e2e8f0',
  s400: '#94a3b8', s500: '#64748b', s700: '#334155', s900: '#0f172a',
  amber50: '#fffbeb', amber200: '#fde68a', amber800: '#92400e',
  red: '#dc2626', redBg: '#fef2f2', redBorder: '#fecaca',
  blue: '#2563eb', blueBg: '#eff6ff',
}

const card = {
  background: s.white,
  borderRadius: 24,
  border: `1px solid ${s.s200}`,
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
}

function getFechaDisplay() {
  return new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
}

function getSaludo() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

function statusTone(estado) {
  if (estado === 'confirmado') return { bg: s.accentBg, color: s.accentDark }
  if (estado === 'pendiente')  return { bg: s.amber50,  color: s.amber800 }
  return { bg: s.blueBg, color: s.blue }
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const navigate = useNavigate()

  useEffect(() => { api.getDashboard().then(setData) }, [])

  if (!data) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0', color: s.s400, fontSize: 13 }}>
        Cargando...
      </div>
    )
  }

  const { stats, proximosTurnos } = data

  const statCards = [
    { label: 'Pacientes', value: stats.total_pacientes ?? '—', note: 'en total', nav: '/kine/pacientes' },
    { label: 'Turnos hoy', value: stats.turnos_hoy ?? '—', note: 'confirmados', nav: '/kine/agenda' },
    { label: 'Próximos', value: stats.turnos_proximos ?? '—', note: 'esta semana', nav: '/kine/agenda' },
    { label: 'Sesiones', value: stats.sesiones_mes ?? '—', note: 'este mes', nav: null },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 13, color: s.s500, textTransform: 'capitalize', marginBottom: 3 }}>{getFechaDisplay()}</p>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: s.s900, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          {getSaludo()}, Augusto
        </h1>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 20 }}>
        {statCards.map(sc => (
          <div key={sc.label} onClick={() => sc.nav && navigate(sc.nav)}
            style={{ ...card, padding: '16px', cursor: sc.nav ? 'pointer' : 'default' }}>
            <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: s.s500 }}>{sc.label}</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: s.s900, marginTop: 6, lineHeight: 1 }}>{sc.value}</p>
            <p style={{ fontSize: 12, color: s.s500, marginTop: 4 }}>{sc.note}</p>
          </div>
        ))}
      </div>

      {/* Turnos del día */}
      <div style={{ ...card, padding: '20px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: s.s900 }}>Turnos del día</h2>
            <p style={{ fontSize: 12, color: s.s500, marginTop: 2 }}>Lo más importante primero</p>
          </div>
          <button onClick={() => navigate('/kine/agenda')}
            style={{ fontSize: 13, fontWeight: 600, color: s.accent, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' }}>
            Ver agenda →
          </button>
        </div>

        {proximosTurnos.length === 0 ? (
          <div style={{ background: s.s100, borderRadius: 16, padding: '16px', textAlign: 'center', color: s.s400, fontSize: 13 }}>
            Sin turnos próximos
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {proximosTurnos.map(t => {
              const tone = statusTone(t.estado)
              const hora = t.hora ? t.hora.slice(0, 5) : '—'
              const fecha = new Date(t.fecha + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })
              return (
                <div key={t.id} style={{ borderRadius: 16, border: `1px solid ${s.s200}`, padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    {/* Time badge */}
                    <div style={{ minWidth: 52, height: 52, background: s.s100, borderRadius: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: s.s700, lineHeight: 1.1 }}>{hora}</span>
                      <span style={{ fontSize: 9, color: s.s400, marginTop: 2, textTransform: 'capitalize' }}>{fecha.split(' ').slice(0,1).join(' ')}</span>
                    </div>
                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontWeight: 600, color: s.s900, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {t.nombre} {t.apellido}
                          </p>
                          {t.motivo && <p style={{ fontSize: 12, color: s.s500, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.motivo}</p>}
                        </div>
                        <span style={{ background: tone.bg, color: tone.color, borderRadius: 20, padding: '2px 9px', fontSize: 10, fontWeight: 600, flexShrink: 0, whiteSpace: 'nowrap' }}>
                          {t.estado}
                        </span>
                      </div>
                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                        <button onClick={() => navigate('/kine/pacientes')}
                          style={{ flex: 1, background: s.s900, color: s.white, border: 'none', borderRadius: 12, padding: '9px 8px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                          Ver ficha
                        </button>
                        <button onClick={() => navigate('/kine/agenda')}
                          style={{ background: 'none', color: s.s700, border: `1px solid ${s.s200}`, borderRadius: 12, padding: '9px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                          Evolución
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Pacientes recientes / Accesos rápidos */}
      <div style={{ ...card, padding: '20px', marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: s.s900, marginBottom: 4 }}>Accesos rápidos</h2>
        <p style={{ fontSize: 12, color: s.s500, marginBottom: 14 }}>Trabajá más rápido desde acá</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {[
            { label: 'Pacientes',  note: 'Ver listado completo', nav: '/kine/pacientes', bg: '#ecfdf5', color: '#047857' },
            { label: 'Agenda',     note: 'Gestionar turnos',     nav: '/kine/agenda',    bg: '#eff6ff', color: '#1d4ed8' },
            { label: 'Ejercicios', note: 'Biblioteca de rutinas', nav: '/kine/ejercicios', bg: '#faf5ff', color: '#6d28d9' },
            { label: 'Claude',     note: 'Asistente IA',         nav: '/kine/claude',    bg: '#fff7ed', color: '#c2410c' },
          ].map(item => (
            <div key={item.label} onClick={() => navigate(item.nav)}
              style={{ background: item.bg, borderRadius: 16, padding: '14px', cursor: 'pointer', border: `1px solid ${s.s200}` }}>
              <p style={{ fontWeight: 600, color: item.color, fontSize: 13 }}>{item.label}</p>
              <p style={{ fontSize: 11, color: s.s500, marginTop: 4 }}>{item.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Nuevo paciente / turno — CTA */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        <button onClick={() => navigate('/kine/pacientes')}
          style={{ background: s.white, border: `1px solid ${s.s200}`, borderRadius: 16, padding: '13px', fontSize: 13, fontWeight: 600, color: s.s700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          + Nuevo paciente
        </button>
        <button onClick={() => navigate('/kine/agenda')}
          style={{ background: s.accent, border: 'none', borderRadius: 16, padding: '13px', fontSize: 13, fontWeight: 600, color: s.white, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
          + Nuevo turno
        </button>
      </div>
    </div>
  )
}
