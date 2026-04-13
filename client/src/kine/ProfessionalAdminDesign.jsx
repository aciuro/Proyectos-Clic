import { useEffect, useMemo, useState } from 'react'
import Pacientes from './Pacientes.jsx'
import Agenda from './Agenda.jsx'
import { api } from './api.js'

const c = {
  bg: '#F0F8FA', white: '#FFFFFF', sky: '#5BB8CC', skyDark: '#3A96AE',
  skyLight: '#DAEEF5', skyXlight: '#EEF7FA', aqua: '#7EC8B8', aquaDark: '#4FA898',
  aquaLight: '#D8F0EA', ink: '#0D3540', ink2: '#2A6070', muted: '#7AAAB8',
  border: '#C0DDE5', sidebar: '#E8DFD0', redBg: '#FEF0EE', redBorder: '#F5A897',
  redText: '#C0341D', redSub: '#E05A3A', yellow: '#FFF8D6', yellowBorder: '#F0DFA0',
  yellowText: '#7A5C00', yellowDark: '#B8860B'
}

const CAT = {
  Friend: { bg: 'linear-gradient(135deg,#E8F5E9,#C8E6C9)', color: '#2E7D32', border: '#A5D6A7', dot: '#43A047' },
  Clic: { bg: 'linear-gradient(135deg,#E3F2FD,#BBDEFB)', color: '#1565C0', border: '#90CAF9', dot: '#1E88E5' },
  Particular: { bg: 'linear-gradient(135deg,#F3E5F5,#E1BEE7)', color: '#6A1B9A', border: '#CE93D8', dot: '#8E24AA' },
}

function CatBadge({ cat }) {
  const cfg = CAT[cat] || CAT.Friend
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px 2px 6px', borderRadius: 20, border: `0.5px solid ${cfg.border}`, background: cfg.bg, fontSize: 10, fontWeight: 500, color: cfg.color, whiteSpace: 'nowrap' }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.dot }} />{cat}
    </span>
  )
}

function StatIcon({ type, color }) {
  const s = color
  const icons = {
    patients: <svg width="20" height="20" viewBox="0 0 22 22" fill="none"><circle cx="8" cy="7" r="3" stroke={s} strokeWidth="1.4"/><path d="M2 18c0-3.3 2.7-6 6-6" stroke={s} strokeWidth="1.4" strokeLinecap="round"/><circle cx="15" cy="8" r="2.5" stroke={s} strokeWidth="1.4"/><path d="M12 18c0-2.8 1.8-5 4-5.5" stroke={s} strokeWidth="1.4" strokeLinecap="round"/></svg>,
    injury: <svg width="20" height="20" viewBox="0 0 22 22" fill="none"><path d="M11 3v4M11 15v4M3 11h4M15 11h4" stroke={s} strokeWidth="1.4" strokeLinecap="round"/><circle cx="11" cy="11" r="4" stroke={s} strokeWidth="1.4"/></svg>,
    sessions: <svg width="20" height="20" viewBox="0 0 22 22" fill="none"><rect x="3" y="5" width="16" height="14" rx="2" stroke={s} strokeWidth="1.4"/><path d="M7 5V3M15 5V3M3 9h16" stroke={s} strokeWidth="1.4" strokeLinecap="round"/><path d="M7 13l2.5 2.5L15 11" stroke={s} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    today: <svg width="20" height="20" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="8" stroke={s} strokeWidth="1.4"/><path d="M11 7v4l2.5 2.5" stroke={s} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    upcoming: <svg width="20" height="20" viewBox="0 0 22 22" fill="none"><path d="M5 12l4 4 8-8" stroke={s} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  }
  return icons[type] || null
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'pacientes', label: 'Pacientes' },
  { id: 'agenda', label: 'Agenda' },
  { id: 'rutinas', label: 'Rutinas' },
  { id: 'cuenta', label: 'Cuenta' },
  { id: 'notas', label: 'Notas' },
]

function DashboardView({ stats, turnos, setActiveTab }) {
  const STATS = [
    { label: 'Pacientes totales', value: stats?.total_pacientes ?? '-', icon: 'patients', color: c.sky },
    { label: 'Lesiones activas', value: stats?.lesiones_activas ?? '-', icon: 'injury', color: '#F59E0B' },
    { label: 'Sesiones este mes', value: stats?.sesiones_mes ?? '-', icon: 'sessions', color: c.aqua },
    { label: 'Turnos hoy', value: stats?.turnos_hoy ?? '-', icon: 'today', color: '#A78BFA' },
    { label: 'Turnos próximos', value: stats?.turnos_proximos ?? '-', icon: 'upcoming', color: c.skyDark },
  ]

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, color: c.muted, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 3 }}>Panel profesional</div>
        <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 24, color: c.ink, lineHeight: 1.1 }}>Buen día, Augusto</div>
      </div>

      <div className="pro-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 18 }}>
        {STATS.map(stat => (
          <div key={stat.label} style={{ background: c.white, borderRadius: 13, border: `0.5px solid ${c.border}`, padding: '13px 12px', display: 'flex', flexDirection: 'column', gap: 5 }}>
            <StatIcon type={stat.icon} color={stat.color} />
            <div style={{ fontSize: 24, fontWeight: 600, color: c.ink, lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontSize: 10, color: c.muted, lineHeight: 1.3 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="pro-dash-cols" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: c.muted, fontWeight: 500, marginBottom: 10 }}>Próximos turnos</div>
          {turnos.map((t, i) => (
            <div key={i} style={{ background: c.white, borderRadius: 13, border: `0.5px solid ${c.border}`, padding: '11px 13px', marginBottom: 7, display: 'flex', alignItems: 'center', gap: 11 }}>
              <div style={{ borderRadius: 10, width: 44, height: 44, background: c.sky, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', lineHeight: 1 }}>{t.hora?.slice(0,5) || '--:--'}</span>
                <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 }}>{t.fecha || ''}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: c.ink, marginBottom: 3 }}>{t.nombre} {t.apellido}</div>
                <CatBadge cat={i % 3 === 0 ? 'Clic' : i % 3 === 1 ? 'Friend' : 'Particular'} />
              </div>
              <span style={{ fontSize: 10, background: t.estado === 'confirmado' ? c.aquaLight : c.redBg, color: t.estado === 'confirmado' ? c.aquaDark : c.redText, padding: '2px 8px', borderRadius: 10, flexShrink: 0 }}>{t.estado || 'pendiente'}</span>
            </div>
          ))}
          <button onClick={() => setActiveTab('agenda')} style={{ width: '100%', marginTop: 2, padding: '9px 0', borderRadius: 11, border: `0.5px solid ${c.border}`, background: 'transparent', fontSize: 11, color: c.skyDark, fontWeight: 500, cursor: 'pointer' }}>Ver agenda completa →</button>
        </div>

        <div>
          <div style={{ fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: c.muted, fontWeight: 500, marginBottom: 10 }}>Acceso rápido</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
            <div onClick={() => setActiveTab('rutinas')} style={{ background: `linear-gradient(135deg,${c.aquaLight},#C8EDE5)`, border: `0.5px solid #A8DDD5`, borderRadius: 16, padding: '16px 14px', cursor: 'pointer' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: c.aquaDark, lineHeight: 1, marginBottom: 4 }}>3</div>
              <div style={{ fontSize: 10, color: c.aquaDark, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Rutinas activas</div>
            </div>
            <div onClick={() => setActiveTab('cuenta')} style={{ background: `linear-gradient(135deg,${c.skyLight},${c.skyXlight})`, border: `0.5px solid ${c.border}`, borderRadius: 16, padding: '16px 14px', cursor: 'pointer' }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: c.skyDark, marginBottom: 5 }}>Estado de cuenta</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 9, color: c.aquaDark }}>↑ Ingresos</span>
                <span style={{ fontSize: 9, color: c.redSub }}>↓ Egresos</span>
                <span style={{ fontSize: 9, color: c.muted }}>⏳ Pendientes</span>
              </div>
            </div>
            <div onClick={() => setActiveTab('notas')} style={{ background: `linear-gradient(135deg,${c.yellow},#FFF3C0)`, border: `0.5px solid ${c.yellowBorder}`, borderRadius: 16, padding: '16px 14px', cursor: 'pointer' }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: c.yellowText, lineHeight: 1.4, marginBottom: 6 }}>Comprar bandas elásticas rojas y azules</div>
              <div style={{ fontSize: 10, color: c.yellowDark, textTransform: 'uppercase', letterSpacing: '0.8px' }}>3 notas →</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function RutinasView() {
  const [selected, setSelected] = useState(null)
  const [rutinas, setRutinas] = useState([
    { id: 1, nombre: 'Rutina n°1', paciente: 'María González', categoria: 'Friend', lesion: 'Esguince de Tobillo', ejercicios: [
      { id: 1, nombre: 'Movilidad de tobillo', series: 3, reps: 15, nota: 'Movimiento lento y controlado' },
      { id: 2, nombre: 'Estiramiento de gemelo', series: 3, reps: 30, nota: 'Mantener 30 seg cada lado' },
    ]},
    { id: 2, nombre: 'Rutina n°1', paciente: 'Emilia Santaliz', categoria: 'Clic', lesion: 'Lumbalgia crónica', ejercicios: [
      { id: 1, nombre: 'Cat-Cow', series: 3, reps: 10, nota: 'Respiración coordinada' },
      { id: 2, nombre: 'Bird-Dog', series: 3, reps: 10, nota: 'Alternar lados' },
    ]},
  ])

  return (
    <div>
      {!selected ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 10, color: c.muted, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 3 }}>Panel profesional</div>
              <div style={{ fontSize: 20, fontWeight: 500, color: c.ink }}>Rutinas activas</div>
            </div>
            <button style={{ padding: '9px 16px', borderRadius: 11, border: 'none', background: c.sky, color: '#fff', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Nueva rutina</button>
          </div>
          {rutinas.map(r => (
            <div key={r.id} onClick={() => setSelected(r)} style={{ background: c.white, borderRadius: 16, border: `0.5px solid ${c.border}`, marginBottom: 10, cursor: 'pointer', overflow: 'hidden' }}>
              <div style={{ height: 3, background: CAT[r.categoria].dot, opacity: 0.7 }} />
              <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: c.ink }}>{r.nombre}</span>
                    <CatBadge cat={r.categoria} />
                  </div>
                  <div style={{ fontSize: 12, color: c.muted, marginBottom: 8 }}>{r.paciente} · {r.lesion}</div>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <span style={{ fontSize: 10, background: c.aquaLight, color: c.aquaDark, padding: '2px 8px', borderRadius: 8 }}>{r.ejercicios.length} ejercicios</span>
                    <span style={{ fontSize: 10, background: c.skyLight, color: c.skyDark, padding: '2px 8px', borderRadius: 8 }}>Activa</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <button onClick={() => setSelected(null)} style={{ width: 36, height: 36, borderRadius: 10, background: c.white, border: `0.5px solid ${c.border}`, cursor: 'pointer' }}>←</button>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 17, fontWeight: 500, color: c.ink }}>{selected.nombre}</span>
                <CatBadge cat={selected.categoria} />
              </div>
              <div style={{ fontSize: 12, color: c.muted, marginTop: 2 }}>{selected.paciente} · {selected.lesion}</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {selected.ejercicios.map((ej, idx) => (
              <div key={ej.id} style={{ background: c.white, borderRadius: 16, border: `0.5px solid ${c.border}`, overflow: 'hidden' }}>
                <div style={{ height: 100, background: `linear-gradient(135deg,${c.skyXlight},${c.aquaLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 8, left: 8, width: 22, height: 22, borderRadius: 7, background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: c.skyDark }}>{idx + 1}</span>
                  </div>
                </div>
                <div style={{ padding: '11px 13px' }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: c.ink, marginBottom: 6 }}>{ej.nombre}</div>
                  <div style={{ display: 'flex', gap: 5, marginBottom: 7 }}>
                    <span style={{ fontSize: 10, background: c.skyLight, color: c.skyDark, padding: '3px 8px', borderRadius: 8 }}>{ej.series} series</span>
                    <span style={{ fontSize: 10, background: c.aquaLight, color: c.aquaDark, padding: '3px 8px', borderRadius: 8 }}>{ej.reps} reps</span>
                  </div>
                  {ej.nota && <div style={{ fontSize: 10, color: c.muted, fontStyle: 'italic', marginBottom: 8 }}>"{ej.nota}"</div>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function CuentaView() {
  const [tab, setTab] = useState('saldos')
  const saldos = [
    { paciente: 'Laura Ríos', categoria: 'Particular', monto: 3500, estado: 'debe', fecha: 'Vence 19 abr', sesiones: 4 },
    { paciente: 'María González', categoria: 'Friend', monto: 1200, estado: 'debe', fecha: 'Vence 15 abr', sesiones: 2 },
    { paciente: 'Emilia Santaliz', categoria: 'Clic', monto: 2400, estado: 'pagado', fecha: 'Pagó 10 abr', sesiones: 3 },
  ]
  const ingresos = [
    { desc: 'Sesión Emilia Santaliz', fecha: '10 abr', monto: 2400 },
    { desc: 'Sesión María González', fecha: '8 abr', monto: 1800 },
  ]
  const egresos = [
    { desc: 'Insumos kinesiología', fecha: '9 abr', monto: 850 },
    { desc: 'Alquiler consultorio', fecha: '1 abr', monto: 4500 },
  ]
  const totalIngresos = ingresos.reduce((a, i) => a + i.monto, 0)
  const totalEgresos = egresos.reduce((a, i) => a + i.monto, 0)
  const balance = totalIngresos - totalEgresos
  const deben = saldos.filter(s => s.estado === 'debe')

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, color: c.muted, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 3 }}>Panel profesional</div>
        <div style={{ fontSize: 20, fontWeight: 500, color: c.ink }}>Estado de cuenta</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
        <div style={{ background: `linear-gradient(135deg,${c.aquaLight},#C8EDE5)`, border: `0.5px solid #A8DDD5`, borderRadius: 16, padding: '15px 14px' }}><div style={{ fontSize: 10, color: c.aquaDark, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>Ingresos</div><div style={{ fontSize: 22, fontWeight: 700, color: c.aquaDark, lineHeight: 1 }}>${totalIngresos.toLocaleString()}</div></div>
        <div style={{ background: `linear-gradient(135deg,${c.redBg},#FDE8E4)`, border: `0.5px solid ${c.redBorder}`, borderRadius: 16, padding: '15px 14px' }}><div style={{ fontSize: 10, color: c.redSub, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>Egresos</div><div style={{ fontSize: 22, fontWeight: 700, color: c.redText, lineHeight: 1 }}>${totalEgresos.toLocaleString()}</div></div>
        <div style={{ background: balance >= 0 ? `linear-gradient(135deg,${c.skyLight},${c.skyXlight})` : `linear-gradient(135deg,${c.redBg},#FDE8E4)`, border: `0.5px solid ${balance >= 0 ? c.border : c.redBorder}`, borderRadius: 16, padding: '15px 14px' }}><div style={{ fontSize: 10, color: balance >= 0 ? c.skyDark : c.redText, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>Balance</div><div style={{ fontSize: 22, fontWeight: 700, color: balance >= 0 ? c.skyDark : c.redText, lineHeight: 1 }}>${Math.abs(balance).toLocaleString()}</div></div>
      </div>

      <div style={{ display: 'flex', background: c.skyXlight, borderRadius: 12, padding: 3, marginBottom: 18 }}>
        {['saldos','ingresos','egresos'].map(t => <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '8px 4px', borderRadius: 10, border: 'none', cursor: 'pointer', background: tab === t ? c.white : 'transparent', color: tab === t ? c.skyDark : c.muted, fontSize: 11, fontWeight: tab === t ? 500 : 400 }}>{t === 'saldos' ? 'Saldos a cobrar' : t[0].toUpperCase() + t.slice(1)}</button>)}
      </div>

      {tab === 'saldos' && deben.map((s, i) => (
        <div key={i} style={{ background: c.white, borderRadius: 15, border: `0.5px solid ${c.redBorder}`, padding: '14px 16px', marginBottom: 9, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3, flexWrap: 'wrap' }}><span style={{ fontSize: 13, fontWeight: 500, color: c.ink }}>{s.paciente}</span><CatBadge cat={s.categoria} /></div>
            <div style={{ fontSize: 11, color: c.redSub }}>{s.fecha} · {s.sesiones} sesiones</div>
          </div>
          <div style={{ textAlign: 'right' }}><div style={{ fontSize: 17, fontWeight: 700, color: c.redText }}>${s.monto.toLocaleString()}</div></div>
        </div>
      ))}
      {tab === 'ingresos' && ingresos.map((item, i) => <div key={i} style={{ background: c.white, borderRadius: 13, border: `0.5px solid ${c.border}`, padding: '12px 14px', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><div><div style={{ fontSize: 13, fontWeight: 500, color: c.ink }}>{item.desc}</div><div style={{ fontSize: 11, color: c.muted }}>{item.fecha}</div></div><span style={{ fontSize: 14, fontWeight: 600, color: c.aquaDark }}>+${item.monto.toLocaleString()}</span></div>)}
      {tab === 'egresos' && egresos.map((item, i) => <div key={i} style={{ background: c.white, borderRadius: 13, border: `0.5px solid ${c.border}`, padding: '12px 14px', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><div><div style={{ fontSize: 13, fontWeight: 500, color: c.ink }}>{item.desc}</div><div style={{ fontSize: 11, color: c.muted }}>{item.fecha}</div></div><span style={{ fontSize: 14, fontWeight: 600, color: c.redText }}>-${item.monto.toLocaleString()}</span></div>)}
    </div>
  )
}

function NotasView() {
  const [notas, setNotas] = useState([
    { id: 1, texto: 'Comprar bandas elásticas rojas y azules', fecha: '12 abr' },
    { id: 2, texto: 'Decirle a María que traiga ropa cómoda la próxima sesión', fecha: '11 abr' },
    { id: 3, texto: 'Renovar seguro de consultorio antes del 30', fecha: '10 abr' },
  ])
  const [nuevo, setNuevo] = useState('')

  function agregarNota() {
    if (!nuevo.trim()) return
    setNotas(prev => [{ id: Date.now(), texto: nuevo.trim(), fecha: 'Hoy' }, ...prev])
    setNuevo('')
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, color: c.muted, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 3 }}>Panel profesional</div>
        <div style={{ fontSize: 20, fontWeight: 500, color: c.ink }}>Notas</div>
      </div>
      <div style={{ background: c.yellow, border: `0.5px solid ${c.yellowBorder}`, borderRadius: 16, padding: '14px 16px', marginBottom: 18 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: c.yellowText, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8 }}>Nueva nota</div>
        <textarea value={nuevo} onChange={e => setNuevo(e.target.value)} placeholder='Escribí lo que necesitás recordar…' style={{ width: '100%', minHeight: 72, padding: '10px 12px', borderRadius: 11, border: `1px solid ${c.yellowBorder}`, background: 'rgba(255,255,255,0.7)', fontSize: 13, color: c.ink, resize: 'none', outline: 'none', lineHeight: 1.55 }} />
        <button onClick={agregarNota} style={{ marginTop: 8, width: '100%', padding: '10px 0', borderRadius: 11, border: 'none', background: `linear-gradient(135deg,#F0DFA0,${c.yellowBorder})`, color: c.yellowText, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Guardar nota</button>
      </div>
      {notas.map(nota => <div key={nota.id} style={{ background: c.white, borderRadius: 14, border: `0.5px solid ${c.yellowBorder}`, padding: '13px 16px', marginBottom: 10 }}><div style={{ fontSize: 13, color: c.ink, lineHeight: 1.5 }}>{nota.texto}</div><div style={{ fontSize: 10, color: c.muted, marginTop: 4 }}>{nota.fecha}</div></div>)}
    </div>
  )
}

export default function ProfessionalAdminDesign({ usuario, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [dashboard, setDashboard] = useState(null)

  useEffect(() => {
    api.getDashboard().then(setDashboard).catch(() => setDashboard(null))
  }, [])

  const content = useMemo(() => ({
    dashboard: <DashboardView stats={dashboard?.stats} turnos={dashboard?.proximosTurnos || []} setActiveTab={setActiveTab} />,
    pacientes: <Pacientes />,
    agenda: <Agenda />,
    rutinas: <RutinasView />,
    cuenta: <CuentaView />,
    notas: <NotasView />,
  }), [activeTab, dashboard])

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; }
        body { font-family: 'DM Sans', sans-serif; background: ${c.bg}; -webkit-font-smoothing: antialiased; }
        .pro-shell { display: flex; min-height: 100vh; flex-direction: column; background: ${c.bg}; }
        .topbar { background: transparent; display: flex; align-items: center; justify-content: space-between; padding: 16px 18px 8px; }
        .pro-content { flex: 1; padding: 4px 16px 110px; }
        .bottom-nav { position: fixed; bottom: 12px; left: 12px; right: 12px; background: ${c.white}; border: 0.5px solid ${c.border}; border-radius: 22px; display: flex; justify-content: space-around; padding: 10px 4px env(safe-area-inset-bottom,10px); z-index: 100; overflow-x: auto; box-shadow: 0 4px 24px rgba(13,53,64,0.08); }
        .bnav-btn { display: flex; flex-direction: column; align-items: center; gap: 2px; flex: 1; min-width: 48px; background: none; border: none; cursor: pointer; padding: 4px 2px; }
        .bnav-label { font-size: 8.5px; white-space: nowrap; }
        .sidebar-d { display: none; }
        @media (min-width: 768px) {
          .pro-shell { flex-direction: row; height: 100vh; overflow: hidden; }
          .sidebar-d { display: flex; width: 210px; background: ${c.sidebar}; flex-direction: column; flex-shrink: 0; }
          .topbar, .bottom-nav { display: none; }
          .pro-content { flex: 1; overflow-y: auto; padding: 30px 36px 40px; }
          .pro-dash-cols { grid-template-columns: 1fr 1fr !important; }
          .pro-stat-grid { grid-template-columns: repeat(5,1fr) !important; }
        }
      `}</style>
      <div className="pro-shell">
        <aside className="sidebar-d">
          <div style={{ padding: '26px 20px 22px', borderBottom: '0.5px solid rgba(13,53,64,0.1)' }}>
            <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 16, color: c.ink }}>Rehabilitaplus</div>
            <div style={{ fontSize: 9, color: c.muted, letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 3 }}>Panel profesional</div>
          </div>
          <div style={{ padding: '14px 10px', flex: 1, display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
            {NAV_ITEMS.map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, cursor: 'pointer', border: 'none', background: activeTab === item.id ? 'rgba(91,184,204,0.18)' : 'transparent', width: '100%', textAlign: 'left', fontFamily: 'DM Sans, sans-serif' }}>
                <span style={{ fontSize: 12.5, color: activeTab === item.id ? c.skyDark : 'rgba(13,53,64,0.5)', fontWeight: activeTab === item.id ? 500 : 400 }}>{item.label}</span>
              </button>
            ))}
          </div>
          <div style={{ padding: '16px 20px', borderTop: '0.5px solid rgba(13,53,64,0.1)', display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: c.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#fff' }}>{usuario?.nombre?.[0] || 'A'}</div>
            <div><div style={{ fontSize: 12, color: c.ink2, fontWeight: 500 }}>{usuario?.nombre || 'Augusto Ciuró'}</div><div style={{ fontSize: 10, color: c.muted }}>Kinesiología</div></div>
          </div>
        </aside>

        <main className="pro-content">
          <header className="topbar">
            <div><div style={{ fontFamily: 'DM Serif Display,serif', fontSize: 15, color: c.ink }}>Rehabilitaplus</div><div style={{ fontSize: 9, color: c.muted, letterSpacing: '1px', textTransform: 'uppercase' }}>Panel profesional</div></div>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: c.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#fff' }}>{usuario?.nombre?.[0] || 'A'}</div>
          </header>
          {content[activeTab]}
        </main>

        <nav className="bottom-nav">
          {NAV_ITEMS.map(item => {
            const active = activeTab === item.id
            return (
              <button key={item.id} className="bnav-btn" onClick={() => setActiveTab(item.id)}>
                <span className="bnav-label" style={{ color: active ? c.skyDark : 'rgba(13,53,64,0.45)' }}>{item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </>
  )
}
