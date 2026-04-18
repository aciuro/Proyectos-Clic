import { useEffect, useState } from 'react'
import { api } from './api.js'

/* ── Paleta ──────────────────────────────────────────────── */
const c = {
  white:       '#ffffff',
  s50:         '#f8fafc',
  s100:        '#f1f5f9',
  s200:        '#e2e8f0',
  s300:        '#cbd5e1',
  s400:        '#94a3b8',
  s500:        '#64748b',
  s700:        '#334155',
  s900:        '#0f172a',
  blue:        '#2563eb',
  blueDark:    '#1d4ed8',
  blue50:      '#eff6ff',
  blue100:     '#dbeafe',
  emerald:     '#059669',
  emeraldBg:   '#ecfdf5',
  emeraldText: '#047857',
  red:         '#dc2626',
  redBg:       '#fef2f2',
  redBorder:   '#fecaca',
  redText:     '#991b1b',
}

const ALIAS    = 'clic.escobar'
const ADMIN_WA = '5491144054833'

const INITIAL_HISTORY = [
  { date:'2026-04-10', manana:3, noche:2, descripcion:'Dolor al bajar escaleras, leve al caminar.' },
  { date:'2026-04-09', manana:5, noche:4, descripcion:'Molestia al caminar distancias largas.' },
  { date:'2026-04-08', manana:4, noche:3, descripcion:'Puntada al rotar el pie hacia adentro.' },
]

const globalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
  .pp-root * { box-sizing: border-box; font-family: 'DM Sans', sans-serif; }
  .pp-root { background: #f8fafc; min-height: 100vh; }
  .pp-right-col { display: none; }
  @media (min-width: 768px) {
    .pp-right-col { display: block; }
    .pp-contact-btn { display: none; }
    .pp-bottom-nav-pill { display: none; }
    .pp-bottom-bar { position: static !important; border-top: none !important; background: transparent !important; backdrop-filter: none !important; }
    .pp-main-grid { display: grid !important; grid-template-columns: 1.1fr 0.9fr; gap: 16px; }
    .pp-content { padding: 32px !important; max-width: 960px; margin: 0 auto; }
  }
`

/* ── UI helpers ─────────────────────────────────────────── */
function Card({ children, style = {} }) {
  return (
    <div style={{
      background: c.white, borderRadius: 20,
      border: `1px solid ${c.s200}`,
      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
      ...style,
    }}>
      {children}
    </div>
  )
}

function Badge({ children, tone = 'default' }) {
  const tones = {
    default: { background: c.s100, color: c.s700 },
    success: { background: c.emeraldBg, color: c.emeraldText },
    warning: { background: '#fffbeb', color: '#92400e' },
    info:    { background: c.blue50, color: c.blue },
  }
  const t = tones[tone] || tones.default
  return (
    <span style={{ ...t, borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 500, display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
      {children}
    </span>
  )
}

function SectionTitle({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: c.s900 }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 13, color: c.s500, marginTop: 2 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

function StatLabel({ children }) {
  return <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: c.s500 }}>{children}</p>
}

function colorEscala(v) {
  if (!v) return c.s200
  if (v <= 3) return '#16a34a'
  if (v <= 6) return '#f59e0b'
  return '#dc2626'
}

/* ── VideoEmbed ─────────────────────────────────────────── */
function VideoEmbed({ url }) {
  if (!url) return null
  let embedUrl = null
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  if (yt) embedUrl = `https://www.youtube.com/embed/${yt[1]}`
  const sh = url.match(/youtube\.com\/shorts\/([^?&\s]+)/)
  if (sh) embedUrl = `https://www.youtube.com/embed/${sh[1]}`
  const vi = url.match(/vimeo\.com\/(\d+)/)
  if (vi) embedUrl = `https://player.vimeo.com/video/${vi[1]}`
  if (embedUrl) return (
    <div style={{ position:'relative', paddingBottom:'56.25%', margin:'1rem 0', borderRadius:14, overflow:'hidden' }}>
      <iframe src={embedUrl} style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%' }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="Ejercicio" />
    </div>
  )
  return <a href={url} target="_blank" rel="noreferrer" style={{ color:c.blue }}>Ver video del ejercicio</a>
}

/* ── EjercicioDetalle ───────────────────────────────────── */
function EjercicioDetalle({ ej, onVolver }) {
  const nombre = ej.nombre.replace(/ — (CC|OA)$/, '')
  return (
    <div style={{ background: c.s50, minHeight:'100vh', paddingBottom:'2rem' }}>
      <button onClick={onVolver} style={{ background:'none', border:'none', color:c.blue, fontSize:15, fontWeight:600, cursor:'pointer', padding:'1.5rem 1rem 0.5rem', display:'flex', alignItems:'center', gap:6 }}>
        ← Volver a la rutina
      </button>
      <div style={{ padding:'0 1rem' }}>
        <span style={{ background:c.blue50, color:c.blue, borderRadius:20, padding:'2px 12px', fontSize:12, fontWeight:600 }}>
          {ej.categoria || 'General'}
        </span>
        <h2 style={{ color:c.s900, fontSize:22, fontWeight:700, margin:'0.75rem 0 1rem' }}>{nombre}</h2>
        {(ej.series || ej.repeticiones || ej.segundos) && (
          <Card style={{ padding:'1rem', marginBottom:'1rem' }}>
            <div style={{ fontSize:11, color:c.s500, fontWeight:600, marginBottom:'0.75rem', textTransform:'uppercase', letterSpacing:1 }}>Tu prescripción</div>
            <div style={{ display:'flex', gap:16 }}>
              {ej.series       && <div style={{ textAlign:'center' }}><div style={{ fontSize:28, fontWeight:700, color:c.blue }}>{ej.series}</div><div style={{ fontSize:11, color:c.s500 }}>Series</div></div>}
              {ej.repeticiones && <div style={{ textAlign:'center' }}><div style={{ fontSize:28, fontWeight:700, color:c.blue }}>{ej.repeticiones}</div><div style={{ fontSize:11, color:c.s500 }}>Reps</div></div>}
              {ej.segundos     && <div style={{ textAlign:'center' }}><div style={{ fontSize:28, fontWeight:700, color:c.blue }}>{ej.segundos}"</div><div style={{ fontSize:11, color:c.s500 }}>Seg</div></div>}
            </div>
          </Card>
        )}
        <VideoEmbed url={ej.video_url} />
        {ej.descripcion && <p style={{ color:c.s500, fontSize:14, lineHeight:1.6 }}>{ej.descripcion}</p>}
      </div>
    </div>
  )
}

/* ── ModalDolor ─────────────────────────────────────────── */
function ModalDolor({ onClose, historia, onGuardar }) {
  const [tab, setTab]           = useState('registrar')
  const [manana, setManana]     = useState(null)
  const [noche, setNoche]       = useState(null)
  const [descripcion, setDesc]  = useState('')
  const [guardado, setGuardado] = useState(false)
  const hoy = new Date().toISOString().split('T')[0]

  function handleGuardar() {
    if (!manana && !noche) return
    onGuardar({ date:hoy, manana:manana||0, noche:noche||0, descripcion })
    setGuardado(true); setTimeout(() => setGuardado(false), 2500)
    setManana(null); setNoche(null); setDesc('')
  }

  function Escala({ value, onChange }) {
    return (
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', margin:'0.5rem 0' }}>
        {[1,2,3,4,5,6,7,8,9,10].map(n => (
          <button key={n} onClick={() => onChange(n)} style={{
            width:36, height:36, borderRadius:10, border:'none', cursor:'pointer', fontWeight:700, fontSize:14,
            background: value===n ? colorEscala(n) : c.s100,
            color: value===n ? '#fff' : c.s700,
          }}>{n}</button>
        ))}
      </div>
    )
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.5)', zIndex:1000, display:'flex', alignItems:'flex-end' }} onClick={onClose}>
      <div style={{ background:c.white, borderRadius:'20px 20px 0 0', width:'100%', maxWidth:520, maxHeight:'92vh', overflow:'auto', padding:'1.5rem', margin:'0 auto' }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
          <div style={{ fontSize:18, fontWeight:700, color:c.s900 }}>Registro de dolor</div>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:24, color:c.s400, cursor:'pointer' }}>×</button>
        </div>
        <div style={{ display:'flex', gap:4, marginBottom:'1.5rem', background:c.s100, borderRadius:12, padding:4 }}>
          {['registrar','historial'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex:1, padding:'8px', borderRadius:9, border:'none', cursor:'pointer', fontWeight:600, fontSize:13,
              background: tab===t ? c.white : 'transparent',
              color: tab===t ? c.blue : c.s500,
              boxShadow: tab===t ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}>{t==='registrar' ? 'Registrar hoy' : 'Historial'}</button>
          ))}
        </div>
        {tab === 'registrar' && (
          <div>
            <div style={{ marginBottom:'1.25rem' }}>
              <div style={{ fontSize:14, fontWeight:600, color:c.s900, marginBottom:'0.4rem' }}>🌅 Al despertar</div>
              <Escala value={manana} onChange={setManana} />
            </div>
            <div style={{ marginBottom:'1.25rem' }}>
              <div style={{ fontSize:14, fontWeight:600, color:c.s900, marginBottom:'0.4rem' }}>✍️ Descripción</div>
              <textarea value={descripcion} onChange={e=>setDesc(e.target.value)} placeholder="Describí cómo te sentiste..." rows={3}
                style={{ width:'100%', border:`1px solid ${c.s200}`, borderRadius:12, padding:'10px 12px', fontSize:14, color:c.s900, resize:'none', outline:'none', fontFamily:'inherit' }} />
            </div>
            <div style={{ marginBottom:'1.5rem' }}>
              <div style={{ fontSize:14, fontWeight:600, color:c.s900, marginBottom:'0.4rem' }}>🌙 Al acostarse</div>
              <Escala value={noche} onChange={setNoche} />
            </div>
            {guardado
              ? <div style={{ textAlign:'center', color:c.emerald, fontWeight:700, padding:'12px', background:c.emeraldBg, borderRadius:12 }}>✓ Guardado</div>
              : <button onClick={handleGuardar} style={{ width:'100%', padding:'14px', background:c.blue, color:'#fff', border:'none', borderRadius:14, fontWeight:700, fontSize:15, cursor:'pointer' }}>
                  Guardar registro
                </button>
            }
          </div>
        )}
        {tab === 'historial' && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {historia.length === 0
              ? <div style={{ color:c.s400, textAlign:'center', padding:'2rem' }}>Sin registros aún</div>
              : historia.map((h,i) => {
                  const d = new Date(h.date+'T12:00')
                  const label = d.toLocaleDateString('es-AR', { weekday:'short', day:'numeric', month:'short' })
                  return (
                    <div key={i} style={{ background:c.s50, borderRadius:14, padding:'1rem', border:`1px solid ${c.s200}` }}>
                      <div style={{ fontSize:12, color:c.s500, fontWeight:600, marginBottom:'0.5rem', textTransform:'capitalize' }}>{label}</div>
                      <div style={{ display:'flex', gap:8, marginBottom:'0.5rem' }}>
                        <div style={{ flex:1, background:colorEscala(h.manana), borderRadius:10, padding:'8px', textAlign:'center' }}>
                          <div style={{ fontSize:22, fontWeight:800, color:'#fff' }}>{h.manana}</div>
                          <div style={{ fontSize:10, color:'#fff', opacity:0.9 }}>Mañana</div>
                        </div>
                        <div style={{ flex:1, background:colorEscala(h.noche), borderRadius:10, padding:'8px', textAlign:'center' }}>
                          <div style={{ fontSize:22, fontWeight:800, color:'#fff' }}>{h.noche}</div>
                          <div style={{ fontSize:10, color:'#fff', opacity:0.9 }}>Noche</div>
                        </div>
                      </div>
                      {h.descripcion && <p style={{ fontSize:13, color:c.s700, fontStyle:'italic', margin:0, lineHeight:1.5 }}>{h.descripcion}</p>}
                    </div>
                  )
                })
            }
          </div>
        )}
      </div>
    </div>
  )
}

/* ── DeudaOverlay ───────────────────────────────────────── */
function DeudaOverlay({ paciente, saldo }) {
  const msg = encodeURIComponent(`Hola Augusto! Soy ${paciente.nombre} ${paciente.apellido}. Acabo de realizar el pago de $${saldo} por mis sesiones. Alias: ${ALIAS}. Por favor confirmame cuando lo recibas. Gracias!`)
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.75)', zIndex:900, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
      <Card style={{ padding:'2rem', maxWidth:360, width:'100%', textAlign:'center' }}>
        <div style={{ fontSize:40, marginBottom:'0.75rem' }}>🔒</div>
        <h2 style={{ color:c.s900, fontSize:20, fontWeight:700, margin:'0 0 0.5rem' }}>Acceso suspendido</h2>
        <p style={{ color:c.s500, fontSize:14, marginBottom:'1rem' }}>Tenés un saldo pendiente de <strong style={{ color:c.s900 }}>${saldo}</strong>.</p>
        <div style={{ background:c.redBg, border:`1px solid ${c.redBorder}`, borderRadius:14, padding:'0.75rem', marginBottom:'1rem' }}>
          <div style={{ fontSize:11, color:c.redText, marginBottom:4 }}>Transferí al alias</div>
          <div style={{ fontSize:18, fontWeight:700, color:c.red }}>{ALIAS}</div>
        </div>
        <a href={`https://wa.me/${ADMIN_WA}?text=${msg}`} target="_blank" rel="noreferrer"
          style={{ display:'block', background:c.blue, color:'#fff', padding:'14px', borderRadius:14, fontWeight:700, textDecoration:'none', fontSize:15 }}>
          Avisá que pagaste por WhatsApp
        </a>
      </Card>
    </div>
  )
}

/* ── Columna derecha (solo desktop) ─────────────────────── */
function RightColumn({ motivos, onTabChange }) {
  return (
    <div className="pp-right-col" style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {/* Estado del tratamiento */}
      <Card style={{ padding:20 }}>
        <SectionTitle title="Estado del tratamiento" />
        <div style={{ marginTop:16, background:c.s50, borderRadius:16, padding:16 }}>
          <p style={{ fontWeight:600, color:c.s900, fontSize:14 }}>
            {motivos?.[0]?.sintoma ? motivos[0].sintoma.charAt(0).toUpperCase() + motivos[0].sintoma.slice(1) : 'Rehabilitación'}
          </p>
          <p style={{ fontSize:13, color:c.s500, marginTop:4 }}>Evolución favorable</p>
        </div>
        <div style={{ marginTop:12, display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <div style={{ borderRadius:14, border:`1px solid ${c.s200}`, padding:14 }}>
            <StatLabel>Kinesiólogo</StatLabel>
            <p style={{ marginTop:6, fontSize:13, fontWeight:600, color:c.s900 }}>Lic. Augusto Ciuro</p>
          </div>
          <div style={{ borderRadius:14, border:`1px solid ${c.s200}`, padding:14 }}>
            <StatLabel>Próximo control</StatLabel>
            <p style={{ marginTop:6, fontSize:13, fontWeight:600, color:c.s900 }}>A definir</p>
          </div>
        </div>
      </Card>

      {/* Mensajes */}
      <Card style={{ padding:20 }}>
        <SectionTitle title="Mensajes" />
        <div style={{ marginTop:16, display:'flex', flexDirection:'column', gap:10 }}>
          <div style={{ background:c.s50, borderRadius:14, padding:14 }}>
            <p style={{ fontWeight:500, color:c.s900, fontSize:14 }}>Recordatorio</p>
            <p style={{ fontSize:13, color:c.s500, marginTop:4 }}>Intentá completar tu rutina al menos 4 veces por semana.</p>
          </div>
          <div style={{ background:c.s50, borderRadius:14, padding:14 }}>
            <p style={{ fontWeight:500, color:c.s900, fontSize:14 }}>Indicaciones</p>
            <p style={{ fontSize:13, color:c.s500, marginTop:4 }}>Evitá movimientos bruscos durante los próximos días.</p>
          </div>
        </div>
      </Card>

      {/* Accesos rápidos */}
      <Card style={{ padding:20 }}>
        <SectionTitle title="Accesos rápidos" />
        <div style={{ marginTop:16, display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {[['Turnos','turnos'],['Rutinas','rutinas'],['Estudios','inicio'],['Perfil','perfil']].map(([label, id]) => (
            <button key={label} onClick={() => onTabChange(id)}
              style={{ borderRadius:14, border:`1px solid ${c.s200}`, padding:'14px', textAlign:'left', fontSize:13, fontWeight:500, color:c.s700, background:'none', cursor:'pointer', fontFamily:"'DM Sans', sans-serif" }}>
              {label}
            </button>
          ))}
        </div>
      </Card>
    </div>
  )
}

/* ── SeccionInicio ──────────────────────────────────────── */
function SeccionInicio({ paciente, ejercicios, rutinas, turnos, saldo, motivos, onVerDetalle, onAbrirDolor, historialDolor, onTabChange }) {
  const hoy = new Date(); hoy.setHours(0,0,0,0)
  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  const proximoTurno = turnos
    .filter(t => { const d=new Date(t.fecha+'T'+(t.hora||'00:00')); return d>=hoy && t.estado!=='cancelado' })
    .sort((a,b) => new Date(a.fecha+'T'+a.hora)-new Date(b.fecha+'T'+b.hora))[0]
  const dolorHoy = historialDolor[0]

  return (
    <div className="pp-main-grid" style={{ display:'block' }}>
      {/* Columna izquierda */}
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

        {/* Próximo turno */}
        <Card style={{
          overflow:'hidden',
          borderColor: c.blue100,
          background: 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)',
          padding: 20,
        }}>
          <p style={{ fontSize:14, fontWeight:500, color:c.blue }}>Próximo turno</p>
          {proximoTurno ? (() => {
            const d = new Date(proximoTurno.fecha+'T12:00')
            return (
              <>
                <h2 style={{ fontSize:30, fontWeight:700, color:c.s900, marginTop:8, letterSpacing:'-0.025em', lineHeight:1.1 }}>
                  {d.getDate()} {meses[d.getMonth()]} · {proximoTurno.hora?.slice(0,5)} hs
                </h2>
                <p style={{ fontSize:14, color:c.s500, marginTop:8 }}>
                  {proximoTurno.motivo || 'Sesión de kinesiología'}
                </p>
              </>
            )
          })() : (
            <>
              <h2 style={{ fontSize:28, fontWeight:700, color:c.s900, marginTop:8, letterSpacing:'-0.025em' }}>Sin turnos próximos</h2>
              <p style={{ fontSize:14, color:c.s500, marginTop:8 }}>Cuando reserves una nueva sesión, la vas a ver acá.</p>
            </>
          )}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:20 }}>
            <button onClick={() => onTabChange('turnos')}
              style={{ background:c.blue, color:'#fff', padding:'12px 16px', borderRadius:16, fontWeight:600, fontSize:14, border:'none', cursor:'pointer', boxShadow:'0 1px 3px rgba(37,99,235,0.25)' }}>
              {proximoTurno ? 'Confirmar' : 'Reservar turno'}
            </button>
            <button onClick={() => onTabChange('turnos')}
              style={{ background:c.white, color:c.s700, padding:'12px 16px', borderRadius:16, fontWeight:600, fontSize:14, border:`1px solid ${c.s200}`, cursor:'pointer' }}>
              {proximoTurno ? 'Cambiar' : 'Ver agenda'}
            </button>
          </div>
        </Card>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12 }}>
          <Card style={{ padding:16 }} onClick={onAbrirDolor}>
            <StatLabel>Dolor</StatLabel>
            <p style={{ fontSize:24, fontWeight:700, color:c.s900, marginTop:8 }}>{dolorHoy ? `${dolorHoy.manana}/10` : '—'}</p>
            {dolorHoy && dolorHoy.manana <= 3
              ? <p style={{ fontSize:12, color:c.emerald, marginTop:4 }}>Mejorando</p>
              : <p style={{ fontSize:12, color:c.s400, marginTop:4, cursor:'pointer' }}>Registrar →</p>
            }
          </Card>
          <Card style={{ padding:16 }}>
            <StatLabel>Sesión</StatLabel>
            <p style={{ fontSize:24, fontWeight:700, color:c.s900, marginTop:8 }}>—</p>
            <p style={{ fontSize:12, color:c.s500, marginTop:4 }}>Plan actual</p>
          </Card>
          <Card style={{ padding:16 }}>
            <StatLabel>Progreso</StatLabel>
            <p style={{ fontSize:24, fontWeight:700, color:c.s900, marginTop:8 }}>+20%</p>
            <p style={{ fontSize:12, color:c.s500, marginTop:4 }}>Movilidad</p>
          </Card>
        </div>

        {/* Tu evolución */}
        <Card style={{ padding:20 }}>
          <SectionTitle title="Tu evolución" subtitle="Resumen simple de cómo venís avanzando" />
          <div style={{ marginTop:16, display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12 }}>
            {[['Dolor','-35%'],['Movilidad','75%'],['Adherencia','82%']].map(([label, val]) => (
              <div key={label} style={{ background:c.s50, borderRadius:16, padding:16, textAlign:'center' }}>
                <StatLabel>{label}</StatLabel>
                <p style={{ fontSize:20, fontWeight:700, color:c.s900, marginTop:8 }}>{val}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Rutinas activas */}
        <Card style={{ padding:20 }}>
          <SectionTitle
            title="Mis rutinas"
            subtitle="Indicaciones domiciliarias de tu kinesiólogo"
            action={rutinas.length > 0
              ? <button onClick={() => onTabChange('rutinas')} style={{ fontSize:13, fontWeight:600, color:c.blue, background:'none', border:'none', cursor:'pointer', fontFamily:"'DM Sans', sans-serif" }}>Ver todas</button>
              : null
            }
          />
          <div style={{ marginTop:16, display:'flex', flexDirection:'column', gap:10 }}>
            {rutinas.filter(r => r.estado === 'Activa').length === 0 ? (
              <p style={{ fontSize:13, color:c.s400, textAlign:'center', padding:'1rem' }}>Tu kinesiólogo aún no asignó rutinas</p>
            ) : rutinas.filter(r => r.estado === 'Activa').slice(0,2).map(r => (
              <button key={r.id} onClick={() => onTabChange('rutinas')}
                style={{ borderRadius:16, border:`1px solid #a7f3d0`, background:'linear-gradient(135deg,#f0fdf4 0%,#fff 100%)', padding:16, cursor:'pointer', textAlign:'left', fontFamily:"'DM Sans', sans-serif", width:'100%' }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
                  <div style={{ minWidth:0 }}>
                    <p style={{ fontWeight:700, color:c.s900, fontSize:14, margin:0 }}>{r.nombre}</p>
                    {r.resumen && <p style={{ fontSize:13, color:c.s500, marginTop:4, marginBottom:0 }}>{r.resumen}</p>}
                  </div>
                  <Badge tone="success">Activa</Badge>
                </div>
                <p style={{ fontSize:13, fontWeight:600, color:'#059669', marginTop:12, marginBottom:0 }}>Ver rutina →</p>
              </button>
            ))}
          </div>
        </Card>

        {saldo > 0 && (
          <div style={{ background:c.redBg, border:`1px solid ${c.redBorder}`, borderRadius:16, padding:'14px' }}>
            <p style={{ fontSize:13, fontWeight:600, color:c.red }}>💳 Saldo pendiente: ${saldo}</p>
            <p style={{ fontSize:12, color:c.redText, marginTop:4 }}>Transferí al alias <strong>{ALIAS}</strong></p>
          </div>
        )}
      </div>

      {/* Columna derecha — solo desktop */}
      <RightColumn motivos={motivos} onTabChange={onTabChange} />
    </div>
  )
}

/* ── SeccionTurnos ──────────────────────────────────────── */
function SeccionTurnos({ turnos, paciente }) {
  const [form, setForm]         = useState({ fecha:'', hora:'', notas:'' })
  const [enviando, setEnviando] = useState(false)
  const [exito, setExito]       = useState(false)
  const [error, setError]       = useState('')
  const hoyStr = new Date().toISOString().split('T')[0]
  const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
  const diasSemana = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
  const hoy = new Date(); hoy.setHours(0,0,0,0)
  const proximos = turnos.filter(t => { const d=new Date(t.fecha+'T12:00'); return d>=hoy && t.estado!=='cancelado' }).sort((a,b)=>new Date(a.fecha)-new Date(b.fecha))

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.fecha || !form.hora) { setError('Completá fecha y hora'); return }
    setEnviando(true)
    try {
      await api.createTurno({ paciente_id:paciente.id, fecha:form.fecha, hora:form.hora, duracion:45, motivo:form.notas||'Sesión kinesiología', estado:'pendiente', notas:form.notas })
      setExito(true); setForm({ fecha:'', hora:'', notas:'' }); setTimeout(() => setExito(false), 4000)
    } catch { setError('No se pudo enviar. Intentá de nuevo.') }
    finally { setEnviando(false) }
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <h1 style={{ fontSize:22, fontWeight:700, color:c.s900, letterSpacing:'-0.025em' }}>Turnos</h1>
      {proximos.map(t => {
        const d = new Date(t.fecha+'T12:00')
        return (
          <Card key={t.id} style={{ padding:16, display:'flex', gap:12, alignItems:'center' }}>
            <div style={{ background:c.blue, borderRadius:12, minWidth:46, height:50, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'#fff', flexShrink:0 }}>
              <div style={{ fontSize:18, fontWeight:800, lineHeight:1 }}>{d.getDate()}</div>
              <div style={{ fontSize:9, fontWeight:600 }}>{meses[d.getMonth()].toUpperCase()}</div>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:14, fontWeight:700, color:c.s900 }}>{diasSemana[d.getDay()]} · {t.hora?.slice(0,5)}</div>
              <div style={{ fontSize:13, color:c.s500, marginTop:2 }}>{t.motivo||'Sesión de kinesiología'}</div>
            </div>
            <Badge tone="success">Confirmado</Badge>
          </Card>
        )
      })}
      <Card style={{ padding:20 }}>
        <h2 style={{ fontSize:16, fontWeight:600, color:c.s900, marginBottom:16 }}>Solicitar turno</h2>
        {exito ? (
          <div style={{ background:c.emeraldBg, color:c.emeraldText, borderRadius:12, padding:'1rem', textAlign:'center', fontWeight:600 }}>✓ Solicitud enviada.</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
              <div>
                <label style={{ fontSize:12, color:c.s500, display:'block', marginBottom:4 }}>Fecha</label>
                <input type="date" min={hoyStr} value={form.fecha} onChange={e=>setForm(f=>({...f,fecha:e.target.value}))}
                  style={{ width:'100%', border:`1px solid ${c.s200}`, borderRadius:12, padding:'10px 11px', fontSize:14, color:c.s900, outline:'none', fontFamily:'inherit' }} />
              </div>
              <div>
                <label style={{ fontSize:12, color:c.s500, display:'block', marginBottom:4 }}>Hora</label>
                <input type="time" value={form.hora} onChange={e=>setForm(f=>({...f,hora:e.target.value}))}
                  style={{ width:'100%', border:`1px solid ${c.s200}`, borderRadius:12, padding:'10px 11px', fontSize:14, color:c.s900, outline:'none', fontFamily:'inherit' }} />
              </div>
            </div>
            <textarea value={form.notas} onChange={e=>setForm(f=>({...f,notas:e.target.value}))} placeholder="Motivo (opcional)" rows={2}
              style={{ width:'100%', border:`1px solid ${c.s200}`, borderRadius:12, padding:'10px 11px', fontSize:14, color:c.s900, resize:'none', outline:'none', fontFamily:'inherit', marginBottom:10 }} />
            {error && <div style={{ color:c.red, fontSize:12, marginBottom:8 }}>{error}</div>}
            <button type="submit" disabled={enviando}
              style={{ width:'100%', background:c.blue, color:'#fff', border:'none', borderRadius:14, padding:'14px', fontWeight:700, fontSize:15, cursor:'pointer' }}>
              {enviando ? 'Enviando...' : 'Solicitar turno'}
            </button>
          </form>
        )}
      </Card>
    </div>
  )
}

/* ── RutinaCard ─────────────────────────────────────────── */
function RutinaCard({ rutina }) {
  const [done, setDone] = useState({})
  const [libresHecho, setLibresHecho] = useState(false)
  const [expanded, setExpanded] = useState(true)
  const [vecesCompletadas, setVecesCompletadas] = useState(0)

  const ejs = rutina.ejercicios || []
  const tieneLibres = !!rutina.ejercicios_libres
  const totalVeces = rutina.veces || 1
  const completados = ejs.filter((_, i) => done[i]).length
  const ejsCompletos = ejs.length === 0 || completados === ejs.length
  const todoHecho = ejsCompletos && (!tieneLibres || libresHecho)
  const rutinaFinalizada = vecesCompletadas >= totalVeces

  function marcarVuelta() {
    setVecesCompletadas(v => v + 1)
    setDone({})
    setLibresHecho(false)
  }

  return (
    <Card style={{ overflow:'hidden' }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#f0fdf4 0%,#fff 100%)', padding:'18px 20px', borderBottom:`1px solid ${c.s200}` }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:11, fontWeight:700, color:'#059669', textTransform:'uppercase', letterSpacing:'0.07em', margin:0 }}>
              {rutina.motivo_sintoma || 'Rutina domiciliaria'}
            </p>
            <h2 style={{ fontSize:18, fontWeight:700, color:c.s900, margin:'6px 0 0', lineHeight:1.2 }}>{rutina.nombre}</h2>
            {rutina.notas && <p style={{ fontSize:13, color:c.s500, marginTop:6, marginBottom:0, lineHeight:1.5 }}>{rutina.notas}</p>}
          </div>
          <button onClick={() => setExpanded(v => !v)}
            style={{ background:'none', border:'none', cursor:'pointer', color:c.s400, fontSize:20, padding:'4px', flexShrink:0 }}>
            {expanded ? '▴' : '▾'}
          </button>
        </div>

        {/* Checklist de vueltas */}
        {totalVeces > 1 && (
          <div style={{ marginTop:14 }}>
            <p style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color: rutinaFinalizada ? '#059669' : c.s400, margin:'0 0 8px' }}>
              {rutinaFinalizada ? '¡Completaste todas las vueltas! 🎉' : `Vueltas completadas — ${vecesCompletadas}/${totalVeces}`}
            </p>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {Array.from({ length: totalVeces }).map((_, i) => (
                <div key={i} style={{
                  width:38, height:38, borderRadius:'50%',
                  background: i < vecesCompletadas ? '#059669' : '#fff',
                  border: `2px solid ${i < vecesCompletadas ? '#059669' : c.s300}`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:15, color:'#fff', fontWeight:700,
                  transition:'all 0.2s',
                }}>
                  {i < vecesCompletadas ? '✓' : <span style={{ color: c.s300, fontSize:13, fontWeight:600 }}>{i+1}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {(ejs.length > 0 || tieneLibres) && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginTop:14 }}>
            {[
              ['Total', ejs.length + (tieneLibres ? 1 : 0)],
              ['Hechos', completados + (libresHecho ? 1 : 0)],
              ['Pendientes', (ejs.length - completados) + (!libresHecho && tieneLibres ? 1 : 0)],
            ].map(([label, val]) => (
              <div key={label} style={{ borderRadius:12, background:'#fff', padding:'10px', textAlign:'center', boxShadow:'0 1px 2px rgba(0,0,0,0.04)' }}>
                <p style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.06em', color:c.s400, margin:0 }}>{label}</p>
                <p style={{ fontSize:18, fontWeight:700, color:c.s900, margin:'4px 0 0' }}>{val}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ejercicios */}
      {expanded && (
        <div style={{ padding:'14px 16px', display:'flex', flexDirection:'column', gap:12 }}>
          {ejs.map((ej, i) => {
            const hecho = !!done[i]
            return (
              <div key={i} style={{ borderRadius:20, border:`1px solid ${hecho ? '#a7f3d0' : c.s200}`, background: hecho ? '#f0fdf4' : '#fff', padding:14, transition:'all 0.2s' }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                  <button onClick={() => setDone(prev => ({ ...prev, [i]: !prev[i] }))} style={{
                    marginTop:2, width:26, height:26, borderRadius:'50%', flexShrink:0,
                    border:`2px solid ${hecho ? '#059669' : c.s300}`,
                    background: hecho ? '#059669' : '#fff', color:'#fff',
                    fontSize:13, fontWeight:700, cursor:'pointer',
                    display:'flex', alignItems:'center', justifyContent:'center',
                  }}>
                    {hecho ? '✓' : ''}
                  </button>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontWeight:700, fontSize:14, color: hecho ? '#059669' : c.s900, margin:0, textDecoration: hecho ? 'line-through' : 'none' }}>{ej.exerciseId}</p>
                    {/* Imágenes */}
                    {ej.images && ej.images[0] && (
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:10 }}>
                        <img src={ej.images[0]} alt={ej.exerciseId + ' A'} style={{ width:'100%', aspectRatio:'1/1', objectFit:'contain', borderRadius:12, border:`1px solid ${c.s200}`, background:c.s50, padding:4 }} loading="lazy" />
                        <img src={ej.images[1]} alt={ej.exerciseId + ' B'} style={{ width:'100%', aspectRatio:'1/1', objectFit:'contain', borderRadius:12, border:`1px solid ${c.s200}`, background:c.s50, padding:4 }} loading="lazy" />
                      </div>
                    )}
                    {/* Pills */}
                    <div style={{ display:'flex', gap:8, marginTop:10, flexWrap:'wrap' }}>
                      {[
                        ej.reps && ej.reps !== 'No aplica' && ['Reps', ej.reps],
                        ej.seconds && ej.seconds !== 'No aplica' && ['Seg.', ej.seconds],
                        ej.series && ['Series', ej.series],
                        ej.peso && ['Peso', ej.peso],
                      ].filter(Boolean).map(([label, val]) => (
                        <div key={label} style={{ borderRadius:10, background:c.s100, padding:'7px 12px', textAlign:'center', minWidth:52 }}>
                          <p style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.06em', color:c.s400, margin:0 }}>{label}</p>
                          <p style={{ fontSize:15, fontWeight:700, color:c.s900, margin:'2px 0 0' }}>{val}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Agentes físicos */}
          {(rutina.hielo || rutina.calor || rutina.contraste) && (
            <div style={{ borderRadius:16, background:c.s50, border:`1px solid ${c.s200}`, padding:14 }}>
              <p style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:c.s500, margin:'0 0 10px' }}>Agentes físicos</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {rutina.hielo && <span style={{ borderRadius:100, background:c.blue50, color:c.blue, fontSize:12, fontWeight:600, padding:'5px 12px' }}>Hielo {rutina.hielo.min} min · {rutina.hielo.vecesAlDia}x/día</span>}
                {rutina.calor && <span style={{ borderRadius:100, background:'#fffbeb', color:'#92400e', fontSize:12, fontWeight:600, padding:'5px 12px' }}>Calor {rutina.calor.min} min · {rutina.calor.vecesAlDia}x/día</span>}
                {rutina.contraste && <span style={{ borderRadius:100, background:c.s100, color:c.s700, fontSize:12, fontWeight:600, padding:'5px 12px' }}>Contraste · {rutina.contraste.vecesAlDia}x/día</span>}
              </div>
            </div>
          )}

          {/* Ejercicios adicionales escritos (Claude) */}
          {tieneLibres && (
            <div onClick={() => !rutinaFinalizada && setLibresHecho(v => !v)}
              style={{ borderRadius:16, background: libresHecho ? '#f0fdf4' : '#fff', border: libresHecho ? '1px solid #a7f3d0' : `1px solid ${c.s200}`, padding:16, cursor: rutinaFinalizada ? 'default' : 'pointer', transition:'all 0.2s' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                <div style={{
                  width:26, height:26, borderRadius:'50%', flexShrink:0,
                  border:`2px solid ${libresHecho ? '#059669' : c.s300}`,
                  background: libresHecho ? '#059669' : '#fff',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:13, fontWeight:700, color:'#fff',
                }}>
                  {libresHecho ? '✓' : ''}
                </div>
                <p style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color: libresHecho ? '#059669' : c.s500, margin:0 }}>Ejercicios adicionales</p>
              </div>
              <p style={{ fontSize:14, color: libresHecho ? '#059669' : c.s700, margin:0, lineHeight:1.7, whiteSpace:'pre-wrap', textDecoration: libresHecho ? 'line-through' : 'none', opacity: libresHecho ? 0.7 : 1 }}>{rutina.ejercicios_libres}</p>
            </div>
          )}

          {todoHecho && !rutinaFinalizada && (
            <div style={{ background:c.emeraldBg, border:`1px solid #a7f3d0`, borderRadius:16, padding:'16px', textAlign:'center' }}>
              <p style={{ color:c.emeraldText, fontWeight:700, fontSize:15, margin:'0 0 10px' }}>
                ¡Excelente! Completaste todos los ejercicios 💪
              </p>
              <button onClick={marcarVuelta} style={{
                background:'#059669', color:'#fff', border:'none', borderRadius:12,
                padding:'10px 24px', fontWeight:700, fontSize:14, cursor:'pointer',
                fontFamily:"'DM Sans', sans-serif",
              }}>
                Marcar vuelta {vecesCompletadas + 1} de {totalVeces}
              </button>
            </div>
          )}
          {rutinaFinalizada && (
            <div style={{ background:c.emeraldBg, border:`1px solid #a7f3d0`, borderRadius:16, padding:'16px', textAlign:'center' }}>
              <p style={{ fontSize:22, margin:'0 0 4px' }}>🎉</p>
              <p style={{ color:c.emeraldText, fontWeight:700, fontSize:15, margin:0 }}>
                ¡Completaste todas las {totalVeces} vueltas!
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

/* ── SeccionRutinas ─────────────────────────────────────── */
function SeccionRutinas({ rutinas }) {
  const activas   = rutinas.filter(r => r.estado === 'Activa')
  const inactivas = rutinas.filter(r => r.estado !== 'Activa')

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <h1 style={{ fontSize:22, fontWeight:700, color:c.s900, letterSpacing:'-0.025em', margin:0 }}>Mis rutinas</h1>

      {rutinas.length === 0 ? (
        <Card style={{ padding:'2.5rem', textAlign:'center', color:c.s400, fontSize:14 }}>
          Tu kinesiólogo aún no asignó rutinas
        </Card>
      ) : (
        <>
          {activas.length > 0 && (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ width:8, height:8, borderRadius:'50%', background:'#10b981', display:'inline-block' }} />
                <span style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'#059669' }}>Activas ({activas.length})</span>
              </div>
              {activas.map(r => <RutinaCard key={r.id} rutina={r} />)}
            </div>
          )}

          {inactivas.length > 0 && (
            <div style={{ display:'flex', flexDirection:'column', gap:14, marginTop:8 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ width:8, height:8, borderRadius:'50%', background:c.s400, display:'inline-block' }} />
                <span style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:c.s400 }}>Anteriores ({inactivas.length})</span>
              </div>
              {inactivas.map(r => (
                <Card key={r.id} style={{ padding:16, opacity:0.7 }}>
                  <p style={{ fontWeight:600, fontSize:14, color:c.s700, margin:0 }}>{r.nombre}</p>
                  {r.resumen && <p style={{ fontSize:13, color:c.s400, marginTop:4, marginBottom:0 }}>{r.resumen}</p>}
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

/* ── SeccionPerfil ──────────────────────────────────────── */
function SeccionPerfil({ paciente, usuario, onLogout }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <h1 style={{ fontSize:22, fontWeight:700, color:c.s900, letterSpacing:'-0.025em' }}>Perfil</h1>
      <Card style={{ padding:'1.5rem', textAlign:'center' }}>
        <div style={{ width:68, height:68, borderRadius:'50%', background:c.blue, color:'#fff', fontSize:22, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
          {paciente.nombre[0]}{paciente.apellido[0]}
        </div>
        <div style={{ fontSize:20, fontWeight:700, color:c.s900 }}>{paciente.nombre} {paciente.apellido}</div>
        <div style={{ fontSize:13, color:c.s500, marginTop:4 }}>{usuario?.email}</div>
      </Card>
      {paciente.celular && (
        <Card style={{ padding:16 }}>
          <StatLabel>Celular</StatLabel>
          <div style={{ fontSize:15, color:c.s900, marginTop:6 }}>{paciente.celular}</div>
        </Card>
      )}
      <Card style={{ padding:20 }}>
        <SectionTitle title="Accesos rápidos" />
        <div style={{ marginTop:16, display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {['Estudios','Recetas','Pagos','Ayuda'].map(item => (
            <button key={item} style={{ borderRadius:12, border:`1px solid ${c.s200}`, padding:'14px', textAlign:'left', fontSize:13, fontWeight:500, color:c.s700, background:'none', cursor:'pointer', fontFamily:"'DM Sans', sans-serif" }}>
              {item}
            </button>
          ))}
        </div>
      </Card>
      <button onClick={onLogout} style={{ width:'100%', background:'none', border:`1px solid ${c.s200}`, borderRadius:14, padding:'13px', color:c.s500, fontWeight:600, fontSize:14, cursor:'pointer' }}>
        Cerrar sesión
      </button>
    </div>
  )
}

/* ── Portal principal ────────────────────────────────────── */
export default function PortalPaciente({ paciente, usuario, onLogout }) {
  const [tab,            setTab]            = useState('inicio')
  const [ejercicios,     setEjercicios]     = useState([])
  const [rutinas,        setRutinas]        = useState([])
  const [turnos,         setTurnos]         = useState([])
  const [motivos,        setMotivos]        = useState([])
  const [saldo,          setSaldo]          = useState(0)
  const [loading,        setLoading]        = useState(true)
  const [seleccionado,   setSeleccionado]   = useState(null)
  const [modalDolor,     setModalDolor]     = useState(false)
  const [historialDolor, setHistorialDolor] = useState(INITIAL_HISTORY)

  useEffect(() => {
    if (!paciente) return
    setLoading(true)
    Promise.all([
      api.getEjerciciosGimnasio(paciente.id).then(d => setEjercicios(d?.ejercicios||[])).catch(()=>{}),
      api.getSaldo(paciente.id).then(s => setSaldo(s.saldo_pendiente||0)).catch(()=>{}),
      api.getTurnos().then(ts => setTurnos(ts||[])).catch(()=>{}),
      api.getMotivos(paciente.id).then(setMotivos).catch(()=>{}),
      api.getRutinasPaciente(paciente.id).then(setRutinas).catch(()=>{}),
    ]).finally(() => setLoading(false))
  }, [paciente?.id])

  if (!paciente) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:c.s50, gap:12, padding:'2rem' }}>
      <div style={{ fontSize:40 }}>🏥</div>
      <p style={{ color:c.s500, textAlign:'center' }}>Tu cuenta aún no está vinculada a un paciente.<br />Consultá con tu kinesiólogo.</p>
    </div>
  )

  if (seleccionado) {
    const ej = ejercicios.find(e => e.id === seleccionado)
    if (ej) return <div className="pp-root"><EjercicioDetalle ej={ej} onVolver={() => setSeleccionado(null)} /></div>
  }

  const tieneDeuda = saldo > 0
  const navItems = [
    { id:'inicio',  label:'Inicio'  },
    { id:'turnos',  label:'Turnos'  },
    { id:'rutinas', label:'Rutinas' },
    { id:'perfil',  label:'Perfil'  },
  ]

  return (
    <div className="pp-root">
      <style>{globalStyle}</style>
      {tieneDeuda && !loading && <DeudaOverlay paciente={paciente} saldo={saldo} />}
      {modalDolor && <ModalDolor onClose={() => setModalDolor(false)} historia={historialDolor} onGuardar={r => setHistorialDolor(prev => [r,...prev])} />}

      <div className="pp-content" style={{ padding:'16px 16px 0' }}>

        {/* Header */}
        <header style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div>
            <p style={{ fontSize:14, color:c.s500 }}>Portal del paciente</p>
            <h1 style={{ fontSize:24, fontWeight:700, color:c.s900, letterSpacing:'-0.025em', marginTop:2 }}>
              Hola, {paciente.nombre} 👋
            </h1>
          </div>
          <div style={{ width:44, height:44, background:c.blue, borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:15, color:'#fff', boxShadow:'0 1px 3px rgba(37,99,235,0.3)', flexShrink:0 }}>
            R+
          </div>
        </header>

        {/* Contenido con padding inferior para el nav */}
        <div style={{ paddingBottom: 130 }}>
          {loading ? (
            <div style={{ textAlign:'center', color:c.s400, padding:'3rem' }}>Cargando...</div>
          ) : (
            <>
              {tab==='inicio'  && <SeccionInicio paciente={paciente} ejercicios={ejercicios} rutinas={rutinas} turnos={turnos} saldo={saldo} motivos={motivos} onVerDetalle={setSeleccionado} onAbrirDolor={() => setModalDolor(true)} historialDolor={historialDolor} onTabChange={setTab} />}
              {tab==='turnos'  && <SeccionTurnos  turnos={turnos} paciente={paciente} />}
              {tab==='rutinas' && <SeccionRutinas rutinas={rutinas} />}
              {tab==='perfil'  && <SeccionPerfil  paciente={paciente} usuario={usuario} onLogout={onLogout} />}
            </>
          )}
        </div>
      </div>

      {/* Bottom bar — fixed mobile */}
      <div className="pp-bottom-bar" style={{ position:'fixed', bottom:0, left:0, right:0, borderTop:`1px solid ${c.s200}`, background:'rgba(255,255,255,0.95)', backdropFilter:'blur(8px)', padding:'12px 16px calc(env(safe-area-inset-bottom, 0px) + 12px)', zIndex:100 }}>
        <div style={{ maxWidth:448, margin:'0 auto' }}>
          {/* Botón contactar */}
          <button className="pp-contact-btn"
            style={{ width:'100%', background:c.blue, color:'#fff', padding:'14px 16px', borderRadius:16, fontWeight:600, fontSize:14, border:'none', cursor:'pointer', marginBottom:10, boxShadow:'0 1px 3px rgba(37,99,235,0.25)', fontFamily:"'DM Sans', sans-serif" }}>
            Contactar kinesiólogo
          </button>
          {/* Tabs */}
          <div className="pp-bottom-nav-pill" style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:8, background:c.s50, borderRadius:24, padding:8 }}>
            {navItems.map(({ id, label }) => (
              <button key={id} onClick={() => setTab(id)} style={{
                display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4,
                padding:'7px 4px', borderRadius:16, border:'none', cursor:'pointer',
                background:'none', color: tab===id ? c.blue : c.s500,
                fontSize:11, fontWeight: tab===id ? 600 : 400, fontFamily:"'DM Sans', sans-serif",
              }}>
                <span style={{ width:24, height:24, borderRadius:'50%', background: tab===id ? c.blue100 : c.s100, display:'block' }} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
