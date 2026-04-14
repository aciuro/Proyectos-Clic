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
function SeccionInicio({ paciente, ejercicios, turnos, saldo, motivos, onVerDetalle, onAbrirDolor, historialDolor, onTabChange }) {
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

        {/* Ejercicios indicados */}
        <Card style={{ padding:20 }}>
          <SectionTitle
            title="Ejercicios indicados"
            subtitle="Tu rutina actual para continuar en casa"
            action={ejercicios.length > 0
              ? <button onClick={() => onTabChange('rutinas')} style={{ fontSize:13, fontWeight:600, color:c.blue, background:'none', border:'none', cursor:'pointer', fontFamily:"'DM Sans', sans-serif" }}>Ver todos</button>
              : null
            }
          />
          <div style={{ marginTop:16, display:'flex', flexDirection:'column', gap:10 }}>
            {ejercicios.length === 0 ? (
              <p style={{ fontSize:13, color:c.s400, textAlign:'center', padding:'1rem' }}>Tu kinesiólogo aún no asignó ejercicios</p>
            ) : ejercicios.slice(0,3).map((ej, i) => {
              const nombre = ej.nombre.replace(/ — (CC|OA)$/, '')
              const detalle = [ej.series && `${ej.series} series`, ej.repeticiones && `${ej.repeticiones} repeticiones`, ej.segundos && `${ej.segundos} segundos`].filter(Boolean).join(' · ')
              return (
                <div key={ej.id} onClick={() => onVerDetalle(ej.id)}
                  style={{ borderRadius:16, border:`1px solid ${c.s200}`, padding:16, cursor:'pointer' }}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
                    <div style={{ minWidth:0 }}>
                      <p style={{ fontWeight:600, color:c.s900, fontSize:14, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{nombre}</p>
                      {detalle && <p style={{ fontSize:13, color:c.s500, marginTop:4 }}>{detalle}</p>}
                    </div>
                    <Badge tone={i === ejercicios.length - 1 && ejercicios.length > 1 ? 'info' : 'success'}>
                      {i === ejercicios.length - 1 && ejercicios.length > 1 ? 'Nuevo' : 'Activo'}
                    </Badge>
                  </div>
                </div>
              )
            })}
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

/* ── SeccionRutinas ─────────────────────────────────────── */
function SeccionRutinas({ ejercicios, onVerDetalle }) {
  const [completados, setCompletados] = useState({})
  const total  = ejercicios.length
  const hechos = Object.values(completados).filter(Boolean).length
  const pct    = total > 0 ? Math.round((hechos/total)*100) : 0

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <h1 style={{ fontSize:22, fontWeight:700, color:c.s900, letterSpacing:'-0.025em' }}>Rutinas</h1>
      {ejercicios.length === 0 ? (
        <Card style={{ padding:'2rem', textAlign:'center', color:c.s400, fontSize:14 }}>
          Tu kinesiólogo aún no asignó ejercicios
        </Card>
      ) : (
        <Card style={{ padding:20 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
            <div>
              <div style={{ fontSize:15, fontWeight:600, color:c.s900 }}>Rutina de hoy</div>
              <div style={{ fontSize:12, color:c.s500, marginTop:2 }}>{hechos} de {total} ejercicios</div>
            </div>
            <div style={{ fontSize:26, fontWeight:800, color:c.blue }}>{pct}%</div>
          </div>
          <div style={{ height:6, background:c.s100, borderRadius:4, marginBottom:16, overflow:'hidden' }}>
            <div style={{ width:`${pct}%`, height:'100%', background:c.blue, borderRadius:4, transition:'width 0.3s' }} />
          </div>
          {ejercicios.map((ej, i) => {
            const nombre = ej.nombre.replace(/ — (CC|OA)$/, '')
            const hecho  = completados[ej.id]
            return (
              <div key={ej.id} onClick={() => onVerDetalle(ej.id)}
                style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 0', borderBottom:`1px solid ${c.s100}`, cursor:'pointer', opacity:hecho?0.5:1 }}>
                <button onClick={e => { e.stopPropagation(); setCompletados(p=>({...p,[ej.id]:!p[ej.id]})) }}
                  style={{ width:26, height:26, borderRadius:8, border:`2px solid ${hecho?c.emerald:c.s200}`, background:hecho?c.emerald:'transparent', color:'#fff', fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {hecho && '✓'}
                </button>
                <div style={{ width:22, height:22, borderRadius:7, background:c.blue50, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:c.blue, flexShrink:0 }}>{i+1}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:14, fontWeight:500, color:c.s900, textDecoration:hecho?'line-through':'none', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{nombre}</div>
                  <div style={{ fontSize:11, color:c.s500 }}>{ej.categoria}</div>
                </div>
                <div style={{ fontSize:12, color:c.s400, display:'flex', gap:6, flexShrink:0 }}>
                  {ej.series       && <span>{ej.series}<small style={{opacity:0.7}}>s</small></span>}
                  {ej.repeticiones && <span>{ej.repeticiones}<small style={{opacity:0.7}}>r</small></span>}
                  {ej.segundos     && <span>{ej.segundos}<small style={{opacity:0.7}}>"</small></span>}
                </div>
                <span style={{ color:c.s300, fontSize:18 }}>›</span>
              </div>
            )
          })}
          {pct === 100 && (
            <div style={{ background:c.emeraldBg, color:c.emeraldText, borderRadius:12, padding:'0.75rem', textAlign:'center', fontWeight:700, marginTop:12 }}>
              🎉 ¡Excelente! Completaste toda la rutina
            </div>
          )}
        </Card>
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
              {tab==='inicio'  && <SeccionInicio paciente={paciente} ejercicios={ejercicios} turnos={turnos} saldo={saldo} motivos={motivos} onVerDetalle={setSeleccionado} onAbrirDolor={() => setModalDolor(true)} historialDolor={historialDolor} onTabChange={setTab} />}
              {tab==='turnos'  && <SeccionTurnos  turnos={turnos} paciente={paciente} />}
              {tab==='rutinas' && <SeccionRutinas ejercicios={ejercicios} onVerDetalle={setSeleccionado} />}
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
