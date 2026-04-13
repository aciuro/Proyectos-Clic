import { useEffect, useState } from 'react'
import { api } from './api.js'

/* ── Paleta ──────────────────────────────────────────────── */
const c = {
  bg:        "#F0F8FA",
  white:     "#FFFFFF",
  sky:       "#5BB8CC",
  skyDark:   "#3A96AE",
  skyLight:  "#DAEEF5",
  skyXlight: "#EEF7FA",
  aqua:      "#7EC8B8",
  aquaDark:  "#4FA898",
  aquaLight: "#D8F0EA",
  ink:       "#0D3540",
  muted:     "#7AAAB8",
  border:    "#C0DDE5",
  redBg:     "#FEF0EE",
  redBorder: "#F5A897",
  redText:   "#C0341D",
  redSub:    "#E05A3A",
  yellow:    "#F5C842",
}

const CATEGORY_CONFIG = {
  Friend:     { bg:"#E8F7F0", color:"#1A7A4A", border:"#A3D9BF", dot:"#2ECC71" },
  Clic:       { bg:"#E8F0FA", color:"#1A4A7A", border:"#A3BFD9", dot:"#3B82F6" },
  Particular: { bg:"#F0E8FA", color:"#4A1A7A", border:"#BFA3D9", dot:"#8B5CF6" },
}
const PATIENT_CATEGORY = "Friend"
const ALIAS    = 'clic.escobar'
const ADMIN_WA = '5491144054833'

const INITIAL_HISTORY = [
  { date:"2026-04-10", manana:3, noche:2, descripcion:"Dolor al bajar escaleras, leve al caminar." },
  { date:"2026-04-09", manana:5, noche:4, descripcion:"Molestia al caminar distancias largas." },
  { date:"2026-04-08", manana:4, noche:3, descripcion:"Puntada al rotar el pie hacia adentro." },
]

const globalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display&display=swap');
  .pp-root * { box-sizing: border-box; font-family: 'DM Sans', sans-serif; }
  .pp-root { background: #F0F8FA; min-height: 100vh; }
  @media (max-width: 767px) {
    .pp-main { padding-bottom: 100px; }
    .pp-sidebar { display: none !important; }
    .pp-bottom-nav { display: flex !important; }
  }
  @media (min-width: 768px) {
    .pp-bottom-nav { display: none !important; }
    .pp-sidebar { display: flex !important; }
    .pp-desktop-cols { display: grid !important; grid-template-columns: 1fr 1fr; gap: 20px; }
    .pp-main { padding: 40px !important; max-width: 860px; }
    .pp-saludo-nombre { font-size: 32px !important; }
  }
`

const IconInicio  = ({size=22}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
const IconTurnos  = ({size=22}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
const IconRutinas = ({size=22}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
const IconPerfil  = ({size=22}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const IconBell    = ({size=20}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>

function colorEscala(v) {
  if (!v) return c.border
  if (v <= 3) return "#2ECC71"
  if (v <= 6) return c.yellow
  return c.redSub
}

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
    <div style={{ position:'relative', paddingBottom:'56.25%', margin:'1rem 0', borderRadius:12, overflow:'hidden' }}>
      <iframe src={embedUrl} style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%' }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="Ejercicio" />
    </div>
  )
  return <a href={url} target="_blank" rel="noreferrer" style={{ color:c.sky }}>Ver video del ejercicio</a>
}

function EjercicioDetalle({ ej, onVolver }) {
  const nombre = ej.nombre.replace(/ — (CC|OA)$/, '')
  return (
    <div style={{ background:c.bg, minHeight:'100vh', paddingBottom:'2rem' }}>
      <button onClick={onVolver} style={{ background:'none', border:'none', color:c.sky, fontSize:15, fontWeight:600, cursor:'pointer', padding:'1.5rem 1rem 0.5rem', display:'flex', alignItems:'center', gap:6 }}>
        ← Volver a la rutina
      </button>
      <div style={{ padding:'0 1rem' }}>
        <span style={{ background:c.skyLight, color:c.skyDark, borderRadius:20, padding:'2px 12px', fontSize:12, fontWeight:600 }}>
          {ej.categoria || 'General'}
        </span>
        <h2 style={{ color:c.ink, fontSize:22, fontWeight:700, margin:'0.75rem 0 1rem' }}>{nombre}</h2>
        {(ej.series || ej.repeticiones || ej.segundos) && (
          <div style={{ background:c.white, borderRadius:14, border:`0.5px solid ${c.border}`, padding:'1rem', marginBottom:'1rem' }}>
            <div style={{ fontSize:11, color:c.muted, fontWeight:600, marginBottom:'0.75rem', textTransform:'uppercase', letterSpacing:1 }}>Tu prescripción</div>
            <div style={{ display:'flex', gap:16 }}>
              {ej.series && <div style={{ textAlign:'center' }}><div style={{ fontSize:28, fontWeight:700, color:c.sky }}>{ej.series}</div><div style={{ fontSize:11, color:c.muted }}>Series</div></div>}
              {ej.repeticiones && <div style={{ textAlign:'center' }}><div style={{ fontSize:28, fontWeight:700, color:c.sky }}>{ej.repeticiones}</div><div style={{ fontSize:11, color:c.muted }}>Reps</div></div>}
              {ej.segundos && <div style={{ textAlign:'center' }}><div style={{ fontSize:28, fontWeight:700, color:c.sky }}>{ej.segundos}"</div><div style={{ fontSize:11, color:c.muted }}>Seg</div></div>}
            </div>
          </div>
        )}
        <VideoEmbed url={ej.video_url} />
        {ej.descripcion && <p style={{ color:c.muted, fontSize:14, lineHeight:1.6 }}>{ej.descripcion}</p>}
      </div>
    </div>
  )
}

function ModalDolor({ onClose, historia, onGuardar }) {
  const [tab, setTab] = useState('registrar')
  const [manana, setManana] = useState(null)
  const [noche, setNoche] = useState(null)
  const [descripcion, setDescripcion] = useState('')
  const [guardado, setGuardado] = useState(false)
  const hoy = new Date().toISOString().split('T')[0]

  function handleGuardar() {
    if (!manana && !noche) return
    onGuardar({ date:hoy, manana:manana||0, noche:noche||0, descripcion })
    setGuardado(true); setTimeout(() => setGuardado(false), 2500)
    setManana(null); setNoche(null); setDescripcion('')
  }

  function mensajeEscala(v) {
    if (v <= 3) return 'Bien, seguí con la rutina'
    if (v <= 6) return 'Moderado, prestá atención'
    return 'Alto, consultá con Augusto'
  }

  function Escala({ value, onChange }) {
    return (
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', margin:'0.5rem 0' }}>
        {[1,2,3,4,5,6,7,8,9,10].map(n => (
          <button key={n} onClick={() => onChange(n)} style={{
            width:36, height:36, borderRadius:8, border:'none', cursor:'pointer', fontWeight:700, fontSize:14,
            background: value===n ? colorEscala(n) : c.skyXlight,
            color: value===n ? '#fff' : c.ink, transition:'all 0.15s',
          }}>{n}</button>
        ))}
        {value && <span style={{ fontSize:12, color:c.muted, alignSelf:'center' }}>{mensajeEscala(value)}</span>}
      </div>
    )
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(13,53,64,0.5)', zIndex:1000, display:'flex', alignItems:'flex-end', justifyContent:'center' }} onClick={onClose}>
      <div style={{ background:c.white, borderRadius:'20px 20px 0 0', width:'100%', maxWidth:520, maxHeight:'92vh', overflow:'auto', padding:'1.5rem' }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
          <div style={{ fontSize:18, fontWeight:700, color:c.ink }}>Registro de dolor</div>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:24, color:c.muted, cursor:'pointer', lineHeight:1 }}>×</button>
        </div>
        <div style={{ display:'flex', gap:4, marginBottom:'1.5rem', background:c.skyXlight, borderRadius:10, padding:4 }}>
          {['registrar','historial'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex:1, padding:'8px', borderRadius:8, border:'none', cursor:'pointer', fontWeight:600, fontSize:13,
              background: tab===t ? c.white : 'transparent',
              color: tab===t ? c.skyDark : c.muted,
              boxShadow: tab===t ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            }}>{t==='registrar' ? 'Registrar hoy' : 'Historial'}</button>
          ))}
        </div>

        {tab === 'registrar' && (
          <div>
            <div style={{ marginBottom:'1.25rem' }}>
              <div style={{ fontSize:14, fontWeight:600, color:c.ink, marginBottom:'0.4rem' }}>🌅 Al despertar</div>
              <Escala value={manana} onChange={setManana} />
            </div>
            <div style={{ marginBottom:'1.25rem' }}>
              <div style={{ fontSize:14, fontWeight:600, color:c.ink, marginBottom:'0.4rem' }}>✍️ ¿Qué dolor tuviste durante el día?</div>
              <textarea value={descripcion} onChange={e=>setDescripcion(e.target.value)}
                placeholder="Describí cómo te sentiste..." rows={3}
                style={{ width:'100%', border:`0.5px solid ${c.border}`, borderRadius:10, padding:'10px 12px', fontSize:14, color:c.ink, background:c.white, resize:'none', outline:'none', fontFamily:'inherit' }} />
            </div>
            <div style={{ marginBottom:'1.5rem' }}>
              <div style={{ fontSize:14, fontWeight:600, color:c.ink, marginBottom:'0.4rem' }}>🌙 Al acostarse</div>
              <Escala value={noche} onChange={setNoche} />
            </div>
            {guardado
              ? <div style={{ textAlign:'center', color:'#2ECC71', fontWeight:700, padding:'12px', background:'#E8F7F0', borderRadius:10 }}>✓ Guardado</div>
              : <button onClick={handleGuardar} style={{ width:'100%', padding:'14px', background:c.sky, color:'#fff', border:'none', borderRadius:12, fontWeight:700, fontSize:15, cursor:'pointer' }}>
                  Guardar registro de hoy
                </button>
            }
          </div>
        )}

        {tab === 'historial' && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {historia.length === 0
              ? <div style={{ color:c.muted, textAlign:'center', padding:'2rem' }}>Sin registros aún</div>
              : historia.map((h,i) => {
                  const d = new Date(h.date+'T12:00')
                  const label = d.toLocaleDateString('es-AR', { weekday:'short', day:'numeric', month:'short' })
                  return (
                    <div key={i} style={{ background:c.skyXlight, borderRadius:12, padding:'1rem' }}>
                      <div style={{ fontSize:13, color:c.muted, fontWeight:600, marginBottom:'0.5rem', textTransform:'capitalize' }}>{label}</div>
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
                      {h.descripcion && <p style={{ fontSize:13, color:c.ink, fontStyle:'italic', margin:0, lineHeight:1.5 }}>{h.descripcion}</p>}
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

function DeudaOverlay({ paciente, saldo }) {
  const msg = encodeURIComponent(`Hola Augusto! Soy ${paciente.nombre} ${paciente.apellido}. Acabo de realizar el pago de $${saldo} por mis sesiones. Alias: ${ALIAS}. Por favor confirmame cuando lo recibas. Gracias!`)
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(13,53,64,0.7)', zIndex:900, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
      <div style={{ background:c.white, borderRadius:20, padding:'2rem', maxWidth:380, width:'100%', textAlign:'center' }}>
        <div style={{ fontSize:40, marginBottom:'0.75rem' }}>🔒</div>
        <h2 style={{ color:c.ink, fontSize:20, fontWeight:700, margin:'0 0 0.5rem' }}>Acceso suspendido</h2>
        <p style={{ color:c.muted, fontSize:14, marginBottom:'1rem' }}>Tenés un saldo pendiente de <strong style={{ color:c.ink }}>${saldo}</strong> por tus sesiones.</p>
        <div style={{ background:c.redBg, border:`0.5px solid ${c.redBorder}`, borderRadius:12, padding:'0.75rem', marginBottom:'1rem' }}>
          <div style={{ fontSize:11, color:c.redText, marginBottom:4 }}>Transferí al alias</div>
          <div style={{ fontSize:18, fontWeight:700, color:c.redSub }}>{ALIAS}</div>
        </div>
        <a href={`https://wa.me/${ADMIN_WA}?text=${msg}`} target="_blank" rel="noreferrer"
          style={{ display:'block', background:c.sky, color:'#fff', padding:'14px', borderRadius:12, fontWeight:700, textDecoration:'none', fontSize:15 }}>
          Avisá que pagaste por WhatsApp
        </a>
      </div>
    </div>
  )
}

/* ── Secciones ───────────────────────────────────────────── */

function SeccionInicio({ paciente, ejercicios, turnos, saldo, motivos, onVerDetalle, onAbrirDolor, historialDolor }) {
  const hoy = new Date(); hoy.setHours(0,0,0,0)
  const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
  const diasSemana = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']
  const proximoTurno = turnos
    .filter(t => { const d=new Date(t.fecha+'T'+(t.hora||'00:00')); return d>=hoy && t.estado!=='cancelado' })
    .sort((a,b) => new Date(a.fecha+'T'+a.hora)-new Date(b.fecha+'T'+b.hora))[0]
  const ultimoMotivo = motivos?.[0]
  const fechaStr = new Date().toLocaleDateString('es-AR', { weekday:'long', day:'numeric', month:'long' }).toUpperCase()

  return (
    <div>
      {/* Saludo */}
      <div style={{ marginBottom:'1.5rem' }}>
        <div style={{ fontSize:10, color:c.muted, letterSpacing:'1.2px', textTransform:'uppercase', marginBottom:4 }}>{fechaStr}</div>
        <div className="pp-saludo-nombre" style={{ fontFamily:"'DM Serif Display', serif", fontSize:26, color:c.ink, lineHeight:1.1 }}>Hola, {paciente.nombre}</div>
      </div>

      {/* Próximo turno */}
      {proximoTurno ? (() => {
        const d = new Date(proximoTurno.fecha+'T12:00')
        return (
          <div style={{ background:c.white, borderRadius:16, border:`0.5px solid ${c.border}`, padding:'0.875rem', marginBottom:'0.875rem', display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ background:c.sky, borderRadius:12, minWidth:50, height:54, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'#fff' }}>
              <div style={{ fontSize:22, fontWeight:800, lineHeight:1 }}>{d.getDate()}</div>
              <div style={{ fontSize:9, fontWeight:600 }}>{meses[d.getMonth()].toUpperCase()}</div>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:11, color:c.muted }}>{diasSemana[d.getDay()]}</div>
              <div style={{ fontSize:14, fontWeight:700, color:c.ink, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{proximoTurno.motivo || 'Sesión de kinesiología'}</div>
              <div style={{ fontSize:12, color:c.muted }}>Augusto Ciuró · {proximoTurno.hora?.slice(0,5)}</div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:5, flexShrink:0 }}>
              <span style={{ background:c.aquaLight, color:c.aquaDark, borderRadius:20, padding:'2px 9px', fontSize:10, fontWeight:700 }}>Confirmado</span>
              <button style={{ background:'none', border:`0.5px solid ${c.border}`, borderRadius:7, padding:'3px 9px', fontSize:11, color:c.muted, cursor:'pointer' }}>Reagendar</button>
            </div>
          </div>
        )
      })() : (
        <div style={{ background:c.skyXlight, borderRadius:14, padding:'0.875rem', marginBottom:'0.875rem', textAlign:'center', color:c.muted, fontSize:13 }}>No tenés turnos próximos</div>
      )}

      {/* Rutina de hoy */}
      {ejercicios.length > 0 && (
        <div style={{ background:c.white, borderRadius:16, border:`0.5px solid ${c.border}`, padding:'0.875rem', marginBottom:'0.875rem', display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ background:c.aquaLight, borderRadius:12, width:46, height:46, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>💪</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:11, color:c.muted, marginBottom:1 }}>
              {ultimoMotivo?.sintoma ? ultimoMotivo.sintoma.charAt(0).toUpperCase()+ultimoMotivo.sintoma.slice(1) : 'Tu rutina'}
            </div>
            <div style={{ fontSize:15, fontWeight:700, color:c.ink }}>Rutina n°1 · {ejercicios.length} ejercicios</div>
          </div>
          <button onClick={() => onVerDetalle(ejercicios[0].id)}
            style={{ background:c.aqua, color:'#fff', border:'none', borderRadius:10, padding:'8px 14px', fontSize:13, fontWeight:700, cursor:'pointer', flexShrink:0 }}>
            Ver →
          </button>
        </div>
      )}

      {/* Grid Estudios + Saldo */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:'0.875rem' }}>
        <div style={{ background:c.white, borderRadius:14, border:`0.5px solid ${c.border}`, padding:'0.875rem' }}>
          <div style={{ fontSize:10, color:c.muted, fontWeight:600, marginBottom:4 }}>📎 ESTUDIOS</div>
          <div style={{ fontSize:22, fontWeight:800, color:c.ink, lineHeight:1 }}>0</div>
          <div style={{ fontSize:11, color:c.muted, marginBottom:'0.75rem' }}>archivos</div>
          <button style={{ background:c.skyLight, color:c.skyDark, border:'none', borderRadius:8, padding:'6px 10px', fontSize:11, fontWeight:600, cursor:'pointer', width:'100%' }}>Ver todo</button>
        </div>
        <div style={{ background:saldo>0?c.redBg:c.white, borderRadius:14, border:`0.5px solid ${saldo>0?c.redBorder:c.border}`, padding:'0.875rem' }}>
          <div style={{ fontSize:10, color:c.muted, fontWeight:600, marginBottom:4 }}>💳 SALDO</div>
          <div style={{ fontSize:22, fontWeight:800, color:saldo>0?c.redText:c.ink, lineHeight:1 }}>${saldo||0}</div>
          <div style={{ marginBottom:'0.75rem' }}>
            <span style={{ background:saldo>0?c.redBorder:c.aquaLight, color:saldo>0?c.redText:c.aquaDark, borderRadius:20, padding:'1px 7px', fontSize:10, fontWeight:700 }}>
              {saldo>0?'Pendiente':'Al día'}
            </span>
          </div>
          {saldo>0 && <button style={{ background:c.redSub, color:'#fff', border:'none', borderRadius:8, padding:'6px 10px', fontSize:11, fontWeight:600, cursor:'pointer', width:'100%' }}>Pagar</button>}
        </div>
      </div>

      {/* Grid Notas + Dolor */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
        <div style={{ background:c.white, borderRadius:14, border:`0.5px solid ${c.border}`, padding:'0.875rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:6 }}>
            <span style={{ fontSize:10, color:c.muted, fontWeight:600 }}>📝 NOTAS</span>
            <span style={{ background:c.skyLight, color:c.skyDark, borderRadius:20, padding:'1px 6px', fontSize:9, fontWeight:700 }}>Solo lectura</span>
          </div>
          <div style={{ fontSize:12, color:c.ink, lineHeight:1.5 }}>
            {ultimoMotivo?.sintoma ? `Trabajar la movilidad. Mantener los ejercicios diarios.` : 'Sin notas aún.'}
          </div>
          <div style={{ fontSize:10, color:c.muted, marginTop:6 }}>✦ No editable</div>
        </div>
        <div onClick={onAbrirDolor} style={{ background:c.white, borderRadius:14, border:`0.5px solid ${c.border}`, padding:'0.875rem', cursor:'pointer' }}>
          <div style={{ fontSize:10, color:c.muted, fontWeight:600, marginBottom:6 }}>😣 DOLOR</div>
          {historialDolor.length > 0 ? (
            <>
              <div style={{ display:'flex', gap:5, marginBottom:4 }}>
                <div style={{ flex:1, background:colorEscala(historialDolor[0].manana), borderRadius:7, padding:'5px', textAlign:'center' }}>
                  <div style={{ fontSize:16, fontWeight:800, color:'#fff' }}>{historialDolor[0].manana}</div>
                  <div style={{ fontSize:9, color:'#fff', opacity:0.9 }}>Mañana</div>
                </div>
                <div style={{ flex:1, background:colorEscala(historialDolor[0].noche), borderRadius:7, padding:'5px', textAlign:'center' }}>
                  <div style={{ fontSize:16, fontWeight:800, color:'#fff' }}>{historialDolor[0].noche}</div>
                  <div style={{ fontSize:9, color:'#fff', opacity:0.9 }}>Noche</div>
                </div>
              </div>
              <div style={{ fontSize:10, color:c.muted }}>Registrar →</div>
            </>
          ) : (
            <div style={{ fontSize:12, color:c.muted }}>Tocá para registrar</div>
          )}
        </div>
      </div>
    </div>
  )
}

function SeccionTurnos({ turnos, paciente }) {
  const [form, setForm]       = useState({ fecha:'', hora:'', notas:'' })
  const [enviando, setEnviando] = useState(false)
  const [exito, setExito]     = useState(false)
  const [error, setError]     = useState('')
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
    <div>
      <div style={{ fontSize:18, fontWeight:700, color:c.ink, marginBottom:'1.25rem' }}>Turnos</div>
      {proximos.map(t => {
        const d = new Date(t.fecha+'T12:00')
        return (
          <div key={t.id} style={{ background:c.white, borderRadius:14, border:`0.5px solid ${c.border}`, padding:'0.875rem', marginBottom:'0.75rem', display:'flex', gap:12, alignItems:'center' }}>
            <div style={{ background:c.sky, borderRadius:10, minWidth:46, height:50, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'#fff' }}>
              <div style={{ fontSize:19, fontWeight:800, lineHeight:1 }}>{d.getDate()}</div>
              <div style={{ fontSize:9 }}>{meses[d.getMonth()].toUpperCase()}</div>
            </div>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:c.ink }}>{diasSemana[d.getDay()]} · {t.hora?.slice(0,5)}</div>
              <div style={{ fontSize:12, color:c.muted }}>{t.motivo||'Sesión de kinesiología'}</div>
            </div>
          </div>
        )
      })}
      <div style={{ background:c.white, borderRadius:16, border:`0.5px solid ${c.border}`, padding:'1.25rem', marginTop:'0.5rem' }}>
        <div style={{ fontSize:15, fontWeight:700, color:c.ink, marginBottom:'1rem' }}>Solicitar turno</div>
        {exito ? (
          <div style={{ background:c.aquaLight, color:c.aquaDark, borderRadius:10, padding:'1rem', textAlign:'center', fontWeight:600 }}>✓ Solicitud enviada. El kinesiólogo te confirmará.</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
              <div>
                <label style={{ fontSize:12, color:c.muted, display:'block', marginBottom:4 }}>Fecha</label>
                <input type="date" min={hoyStr} value={form.fecha} onChange={e=>setForm(f=>({...f,fecha:e.target.value}))}
                  style={{ width:'100%', border:`0.5px solid ${c.border}`, borderRadius:10, padding:'9px 10px', fontSize:14, color:c.ink, outline:'none', fontFamily:'inherit' }} />
              </div>
              <div>
                <label style={{ fontSize:12, color:c.muted, display:'block', marginBottom:4 }}>Hora</label>
                <input type="time" value={form.hora} onChange={e=>setForm(f=>({...f,hora:e.target.value}))}
                  style={{ width:'100%', border:`0.5px solid ${c.border}`, borderRadius:10, padding:'9px 10px', fontSize:14, color:c.ink, outline:'none', fontFamily:'inherit' }} />
              </div>
            </div>
            <textarea value={form.notas} onChange={e=>setForm(f=>({...f,notas:e.target.value}))} placeholder="Motivo (opcional)" rows={2}
              style={{ width:'100%', border:`0.5px solid ${c.border}`, borderRadius:10, padding:'9px 10px', fontSize:14, color:c.ink, resize:'none', outline:'none', fontFamily:'inherit', marginBottom:10 }} />
            {error && <div style={{ color:c.redText, fontSize:12, marginBottom:8 }}>{error}</div>}
            <button type="submit" disabled={enviando} style={{ width:'100%', background:c.sky, color:'#fff', border:'none', borderRadius:12, padding:'13px', fontWeight:700, fontSize:15, cursor:'pointer' }}>
              {enviando ? 'Enviando...' : 'Solicitar turno'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

function SeccionRutinas({ ejercicios, onVerDetalle }) {
  const [completados, setCompletados] = useState({})
  const total = ejercicios.length
  const hechos = Object.values(completados).filter(Boolean).length
  const pct = total > 0 ? Math.round((hechos/total)*100) : 0

  return (
    <div>
      <div style={{ fontSize:18, fontWeight:700, color:c.ink, marginBottom:'1.25rem' }}>Rutinas</div>
      {ejercicios.length === 0 ? (
        <div style={{ background:c.white, borderRadius:16, border:`0.5px solid ${c.border}`, padding:'2rem', textAlign:'center', color:c.muted }}>
          Tu kinesiólogo aún no asignó ejercicios
        </div>
      ) : (
        <div style={{ background:c.white, borderRadius:16, border:`0.5px solid ${c.border}`, padding:'1.25rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem' }}>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:c.ink }}>Rutina de hoy</div>
              <div style={{ fontSize:12, color:c.muted }}>{hechos} de {total} ejercicios</div>
            </div>
            <div style={{ fontSize:28, fontWeight:800, color:c.aqua }}>{pct}%</div>
          </div>
          <div style={{ height:6, background:c.skyLight, borderRadius:4, marginBottom:'1rem', overflow:'hidden' }}>
            <div style={{ width:`${pct}%`, height:'100%', background:c.aqua, borderRadius:4, transition:'width 0.3s' }} />
          </div>
          {ejercicios.map((ej,i) => {
            const nombre = ej.nombre.replace(/ — (CC|OA)$/, '')
            const hecho = completados[ej.id]
            return (
              <div key={ej.id} onClick={() => onVerDetalle(ej.id)}
                style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0', borderBottom:`0.5px solid ${c.skyXlight}`, cursor:'pointer', opacity:hecho?0.5:1 }}>
                <button onClick={e => { e.stopPropagation(); setCompletados(p=>({...p,[ej.id]:!p[ej.id]})) }}
                  style={{ width:24, height:24, borderRadius:6, border:`1.5px solid ${hecho?c.aqua:c.border}`, background:hecho?c.aqua:'transparent', color:'#fff', fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {hecho && '✓'}
                </button>
                <div style={{ width:22, height:22, borderRadius:6, background:c.skyLight, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:c.sky, flexShrink:0 }}>{i+1}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:14, fontWeight:600, color:c.ink, textDecoration:hecho?'line-through':'none', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{nombre}</div>
                  <div style={{ fontSize:11, color:c.muted }}>{ej.categoria}</div>
                </div>
                <div style={{ fontSize:12, color:c.muted, display:'flex', gap:6, flexShrink:0 }}>
                  {ej.series && <span>{ej.series}<small style={{opacity:0.7}}>s</small></span>}
                  {ej.repeticiones && <span>{ej.repeticiones}<small style={{opacity:0.7}}>r</small></span>}
                  {ej.segundos && <span>{ej.segundos}<small style={{opacity:0.7}}>"</small></span>}
                </div>
                <span style={{ color:c.muted, fontSize:18, flexShrink:0 }}>›</span>
              </div>
            )
          })}
          {pct === 100 && (
            <div style={{ background:c.aquaLight, color:c.aquaDark, borderRadius:10, padding:'0.75rem', textAlign:'center', fontWeight:700, marginTop:'0.75rem' }}>
              🎉 ¡Excelente! Completaste toda la rutina
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SeccionPerfil({ paciente, usuario, onLogout }) {
  const catCfg = CATEGORY_CONFIG[PATIENT_CATEGORY] || CATEGORY_CONFIG.Friend
  return (
    <div>
      <div style={{ fontSize:18, fontWeight:700, color:c.ink, marginBottom:'1.25rem' }}>Perfil</div>
      <div style={{ background:c.white, borderRadius:16, border:`0.5px solid ${c.border}`, padding:'1.5rem', textAlign:'center', marginBottom:'1rem' }}>
        <div style={{ width:70, height:70, borderRadius:'50%', background:c.sky, color:'#fff', fontSize:24, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 0.75rem' }}>
          {paciente.nombre[0]}{paciente.apellido[0]}
        </div>
        <div style={{ fontSize:20, fontWeight:700, color:c.ink }}>{paciente.nombre} {paciente.apellido}</div>
        <div style={{ fontSize:13, color:c.muted, margin:'4px 0 12px' }}>{usuario?.email}</div>
        <span style={{ background:catCfg.bg, color:catCfg.color, border:`0.5px solid ${catCfg.border}`, borderRadius:20, padding:'3px 14px', fontSize:12, fontWeight:700, display:'inline-flex', alignItems:'center', gap:6 }}>
          <span style={{ width:7, height:7, borderRadius:'50%', background:catCfg.dot, display:'inline-block' }} />
          {PATIENT_CATEGORY}
        </span>
      </div>
      {paciente.celular && (
        <div style={{ background:c.white, borderRadius:14, border:`0.5px solid ${c.border}`, padding:'1rem', marginBottom:'0.75rem' }}>
          <div style={{ fontSize:11, color:c.muted, marginBottom:2 }}>Celular</div>
          <div style={{ fontSize:15, color:c.ink }}>{paciente.celular}</div>
        </div>
      )}
      <button onClick={onLogout} style={{ width:'100%', background:'none', border:`0.5px solid ${c.border}`, borderRadius:12, padding:'13px', color:c.muted, fontWeight:600, fontSize:14, cursor:'pointer', marginTop:'0.5rem' }}>
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
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:c.bg, gap:12, padding:'2rem' }}>
      <div style={{ fontSize:40 }}>🏥</div>
      <p style={{ color:c.muted, textAlign:'center' }}>Tu cuenta aún no está vinculada a un paciente.<br />Consultá con tu kinesiólogo.</p>
    </div>
  )

  if (seleccionado) {
    const ej = ejercicios.find(e => e.id === seleccionado)
    if (ej) return <div className="pp-root"><EjercicioDetalle ej={ej} onVolver={() => setSeleccionado(null)} /></div>
  }

  const catCfg = CATEGORY_CONFIG[PATIENT_CATEGORY] || CATEGORY_CONFIG.Friend
  const tieneDeuda = saldo > 0
  const navItems = [
    { id:'inicio',  label:'Inicio',  Icon:IconInicio  },
    { id:'turnos',  label:'Turnos',  Icon:IconTurnos  },
    { id:'rutinas', label:'Rutinas', Icon:IconRutinas },
    { id:'perfil',  label:'Perfil',  Icon:IconPerfil  },
  ]

  return (
    <div className="pp-root">
      <style>{globalStyle}</style>
      {tieneDeuda && !loading && <DeudaOverlay paciente={paciente} saldo={saldo} />}
      {modalDolor && <ModalDolor onClose={() => setModalDolor(false)} historia={historialDolor} onGuardar={r => setHistorialDolor(prev => [r,...prev])} />}

      <div style={{ display:'flex' }}>
        {/* Sidebar desktop */}
        <div className="pp-sidebar" style={{ display:'none', flexDirection:'column', width:220, background:c.white, borderRight:`0.5px solid ${c.border}`, minHeight:'100vh', padding:'2rem 1rem', flexShrink:0 }}>
          <div style={{ marginBottom:'2rem' }}>
            <div style={{ fontSize:15, fontWeight:800, color:c.ink, marginBottom:8 }}>Rehabilitaplus</div>
            <span style={{ background:catCfg.bg, color:catCfg.color, border:`0.5px solid ${catCfg.border}`, borderRadius:20, padding:'2px 12px', fontSize:11, fontWeight:700, display:'inline-flex', alignItems:'center', gap:5 }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:catCfg.dot }} />
              {PATIENT_CATEGORY}
            </span>
          </div>
          {navItems.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setTab(id)} style={{
              display:'flex', alignItems:'center', gap:10, padding:'11px 14px', borderRadius:12, border:'none', cursor:'pointer', marginBottom:4,
              background: tab===id ? c.skyLight : 'transparent',
              color: tab===id ? c.skyDark : c.muted,
              fontWeight: tab===id ? 700 : 500, fontSize:14,
            }}>
              <Icon /> {label}
              {tab===id && <span style={{ marginLeft:'auto', width:6, height:6, borderRadius:'50%', background:c.sky }} />}
            </button>
          ))}
        </div>

        {/* Contenido */}
        <div className="pp-main" style={{ flex:1, padding:'1.25rem', overflowX:'hidden' }}>
          {/* Header */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
            <span style={{ background:catCfg.bg, color:catCfg.color, border:`0.5px solid ${catCfg.border}`, borderRadius:20, padding:'3px 12px', fontSize:12, fontWeight:700, display:'inline-flex', alignItems:'center', gap:6 }}>
              <span style={{ width:7, height:7, borderRadius:'50%', background:catCfg.dot }} />
              {PATIENT_CATEGORY}
            </span>
            <button style={{ background:c.white, border:`0.5px solid ${c.border}`, borderRadius:10, padding:'7px', cursor:'pointer', display:'flex', alignItems:'center', color:c.muted }}>
              <IconBell />
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign:'center', color:c.muted, padding:'3rem' }}>Cargando...</div>
          ) : (
            <>
              {tab==='inicio'  && <SeccionInicio paciente={paciente} ejercicios={ejercicios} turnos={turnos} saldo={saldo} motivos={motivos} onVerDetalle={setSeleccionado} onAbrirDolor={() => setModalDolor(true)} historialDolor={historialDolor} />}
              {tab==='turnos'  && <SeccionTurnos  turnos={turnos} paciente={paciente} />}
              {tab==='rutinas' && <SeccionRutinas ejercicios={ejercicios} onVerDetalle={setSeleccionado} />}
              {tab==='perfil'  && <SeccionPerfil  paciente={paciente} usuario={usuario} onLogout={onLogout} />}
            </>
          )}
        </div>
      </div>

      {/* Nav inferior mobile */}
      <div className="pp-bottom-nav" style={{ display:'none', position:'fixed', bottom:12, left:12, right:12, background:c.white, border:`0.5px solid ${c.border}`, borderRadius:22, padding:'10px 4px env(safe-area-inset-bottom, 10px)', zIndex:100, boxShadow:'0 4px 24px rgba(13,53,64,0.08)' }}>
        {navItems.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setTab(id)} style={{
            flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3,
            background:'none', border:'none', cursor:'pointer',
            color: tab===id ? c.sky : c.muted, padding:'4px 0',
          }}>
            <Icon />
            <span style={{ fontSize:10, fontWeight: tab===id ? 700 : 400 }}>{label}</span>
            {tab===id && <span style={{ width:4, height:4, borderRadius:'50%', background:c.sky }} />}
          </button>
        ))}
      </div>
    </div>
  )
}
