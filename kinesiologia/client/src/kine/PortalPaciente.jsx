import { useEffect, useState } from 'react'
import { api } from './api.js'

/* ── Paleta ──────────────────────────────────────────────── */
const c = {
  bg:        '#f8fafc',
  white:     '#ffffff',
  blue:      '#2563eb',
  blueDark:  '#1d4ed8',
  blueBg:    '#eff6ff',
  blueLight: '#bfdbfe',
  cyan:      '#06b6d4',
  s50:       '#f8fafc',
  s100:      '#f1f5f9',
  s200:      '#e2e8f0',
  s300:      '#cbd5e1',
  s400:      '#94a3b8',
  s500:      '#64748b',
  s700:      '#334155',
  s900:      '#0f172a',
  emerald:   '#059669',
  emeraldBg: '#ecfdf5',
  emeraldText: '#047857',
  amber50:   '#fffbeb',
  amber200:  '#fde68a',
  amber800:  '#92400e',
  red:       '#dc2626',
  redBg:     '#fef2f2',
  redBorder: '#fecaca',
  redText:   '#991b1b',
  yellow:    '#f59e0b',
}

const ALIAS    = 'clic.escobar'
const ADMIN_WA = '5491144054833'

const INITIAL_HISTORY = [
  { date:'2026-04-10', manana:3, noche:2, descripcion:'Dolor al bajar escaleras, leve al caminar.' },
  { date:'2026-04-09', manana:5, noche:4, descripcion:'Molestia al caminar distancias largas.' },
  { date:'2026-04-08', manana:4, noche:3, descripcion:'Puntada al rotar el pie hacia adentro.' },
]

const globalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display&display=swap');
  .pp-root * { box-sizing: border-box; font-family: 'DM Sans', sans-serif; }
  .pp-root { background: #f8fafc; min-height: 100vh; }
  @media (max-width: 767px) {
    .pp-main { padding-bottom: 130px !important; }
    .pp-sidebar { display: none !important; }
    .pp-bottom-nav { display: block !important; }
  }
  @media (min-width: 768px) {
    .pp-bottom-nav { display: none !important; }
    .pp-sidebar { display: flex !important; }
    .pp-main { padding: 40px !important; max-width: 780px; }
  }
`

const card = {
  background: c.white,
  borderRadius: 24,
  border: `1px solid ${c.s200}`,
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
}

function colorEscala(v) {
  if (!v) return c.s200
  if (v <= 3) return '#16a34a'
  if (v <= 6) return '#f59e0b'
  return '#dc2626'
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
    <div style={{ position:'relative', paddingBottom:'56.25%', margin:'1rem 0', borderRadius:16, overflow:'hidden' }}>
      <iframe src={embedUrl} style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%' }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="Ejercicio" />
    </div>
  )
  return <a href={url} target="_blank" rel="noreferrer" style={{ color:c.blue }}>Ver video del ejercicio</a>
}

function EjercicioDetalle({ ej, onVolver }) {
  const nombre = ej.nombre.replace(/ — (CC|OA)$/, '')
  return (
    <div style={{ background:c.bg, minHeight:'100vh', paddingBottom:'2rem' }}>
      <button onClick={onVolver} style={{ background:'none', border:'none', color:c.blue, fontSize:15, fontWeight:600, cursor:'pointer', padding:'1.5rem 1rem 0.5rem', display:'flex', alignItems:'center', gap:6 }}>
        ← Volver a la rutina
      </button>
      <div style={{ padding:'0 1rem' }}>
        <span style={{ background:c.blueBg, color:c.blue, borderRadius:20, padding:'2px 12px', fontSize:12, fontWeight:600 }}>
          {ej.categoria || 'General'}
        </span>
        <h2 style={{ color:c.s900, fontSize:22, fontWeight:700, margin:'0.75rem 0 1rem' }}>{nombre}</h2>
        {(ej.series || ej.repeticiones || ej.segundos) && (
          <div style={{ ...card, padding:'1rem', marginBottom:'1rem' }}>
            <div style={{ fontSize:11, color:c.s500, fontWeight:600, marginBottom:'0.75rem', textTransform:'uppercase', letterSpacing:1 }}>Tu prescripción</div>
            <div style={{ display:'flex', gap:16 }}>
              {ej.series && <div style={{ textAlign:'center' }}><div style={{ fontSize:28, fontWeight:700, color:c.blue }}>{ej.series}</div><div style={{ fontSize:11, color:c.s500 }}>Series</div></div>}
              {ej.repeticiones && <div style={{ textAlign:'center' }}><div style={{ fontSize:28, fontWeight:700, color:c.blue }}>{ej.repeticiones}</div><div style={{ fontSize:11, color:c.s500 }}>Reps</div></div>}
              {ej.segundos && <div style={{ textAlign:'center' }}><div style={{ fontSize:28, fontWeight:700, color:c.blue }}>{ej.segundos}"</div><div style={{ fontSize:11, color:c.s500 }}>Seg</div></div>}
            </div>
          </div>
        )}
        <VideoEmbed url={ej.video_url} />
        {ej.descripcion && <p style={{ color:c.s500, fontSize:14, lineHeight:1.6 }}>{ej.descripcion}</p>}
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
            width:36, height:36, borderRadius:10, border:'none', cursor:'pointer', fontWeight:700, fontSize:14,
            background: value===n ? colorEscala(n) : c.s100,
            color: value===n ? '#fff' : c.s700, transition:'all 0.15s',
          }}>{n}</button>
        ))}
        {value && <span style={{ fontSize:12, color:c.s500, alignSelf:'center' }}>{mensajeEscala(value)}</span>}
      </div>
    )
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.5)', zIndex:1000, display:'flex', alignItems:'flex-end', justifyContent:'center' }} onClick={onClose}>
      <div style={{ background:c.white, borderRadius:'24px 24px 0 0', width:'100%', maxWidth:520, maxHeight:'92vh', overflow:'auto', padding:'1.5rem' }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
          <div style={{ fontSize:18, fontWeight:700, color:c.s900 }}>Registro de dolor</div>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:24, color:c.s400, cursor:'pointer', lineHeight:1 }}>×</button>
        </div>
        <div style={{ display:'flex', gap:4, marginBottom:'1.5rem', background:c.s100, borderRadius:14, padding:4 }}>
          {['registrar','historial'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex:1, padding:'8px', borderRadius:10, border:'none', cursor:'pointer', fontWeight:600, fontSize:13,
              background: tab===t ? c.white : 'transparent',
              color: tab===t ? c.blue : c.s500,
              boxShadow: tab===t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
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
              <div style={{ fontSize:14, fontWeight:600, color:c.s900, marginBottom:'0.4rem' }}>✍️ ¿Qué dolor tuviste durante el día?</div>
              <textarea value={descripcion} onChange={e=>setDescripcion(e.target.value)}
                placeholder="Describí cómo te sentiste..." rows={3}
                style={{ width:'100%', border:`1px solid ${c.s200}`, borderRadius:14, padding:'10px 12px', fontSize:14, color:c.s900, background:c.white, resize:'none', outline:'none', fontFamily:'inherit' }} />
            </div>
            <div style={{ marginBottom:'1.5rem' }}>
              <div style={{ fontSize:14, fontWeight:600, color:c.s900, marginBottom:'0.4rem' }}>🌙 Al acostarse</div>
              <Escala value={noche} onChange={setNoche} />
            </div>
            {guardado
              ? <div style={{ textAlign:'center', color:c.emerald, fontWeight:700, padding:'12px', background:c.emeraldBg, borderRadius:14 }}>✓ Guardado</div>
              : <button onClick={handleGuardar} style={{ width:'100%', padding:'14px', background:c.blue, color:'#fff', border:'none', borderRadius:16, fontWeight:700, fontSize:15, cursor:'pointer' }}>
                  Guardar registro de hoy
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
                    <div key={i} style={{ background:c.s50, borderRadius:16, padding:'1rem', border:`1px solid ${c.s200}` }}>
                      <div style={{ fontSize:12, color:c.s500, fontWeight:600, marginBottom:'0.5rem', textTransform:'capitalize' }}>{label}</div>
                      <div style={{ display:'flex', gap:8, marginBottom:'0.5rem' }}>
                        <div style={{ flex:1, background:colorEscala(h.manana), borderRadius:12, padding:'8px', textAlign:'center' }}>
                          <div style={{ fontSize:22, fontWeight:800, color:'#fff' }}>{h.manana}</div>
                          <div style={{ fontSize:10, color:'#fff', opacity:0.9 }}>Mañana</div>
                        </div>
                        <div style={{ flex:1, background:colorEscala(h.noche), borderRadius:12, padding:'8px', textAlign:'center' }}>
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

function DeudaOverlay({ paciente, saldo }) {
  const msg = encodeURIComponent(`Hola Augusto! Soy ${paciente.nombre} ${paciente.apellido}. Acabo de realizar el pago de $${saldo} por mis sesiones. Alias: ${ALIAS}. Por favor confirmame cuando lo recibas. Gracias!`)
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.75)', zIndex:900, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
      <div style={{ ...card, padding:'2rem', maxWidth:360, width:'100%', textAlign:'center' }}>
        <div style={{ fontSize:40, marginBottom:'0.75rem' }}>🔒</div>
        <h2 style={{ color:c.s900, fontSize:20, fontWeight:700, margin:'0 0 0.5rem' }}>Acceso suspendido</h2>
        <p style={{ color:c.s500, fontSize:14, marginBottom:'1rem' }}>Tenés un saldo pendiente de <strong style={{ color:c.s900 }}>${saldo}</strong> por tus sesiones.</p>
        <div style={{ background:c.redBg, border:`1px solid ${c.redBorder}`, borderRadius:16, padding:'0.75rem', marginBottom:'1rem' }}>
          <div style={{ fontSize:11, color:c.redText, marginBottom:4 }}>Transferí al alias</div>
          <div style={{ fontSize:18, fontWeight:700, color:c.red }}>{ALIAS}</div>
        </div>
        <a href={`https://wa.me/${ADMIN_WA}?text=${msg}`} target="_blank" rel="noreferrer"
          style={{ display:'block', background:c.blue, color:'#fff', padding:'14px', borderRadius:16, fontWeight:700, textDecoration:'none', fontSize:15 }}>
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
  const dolorHoy = historialDolor[0]

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 13, color: c.s500, marginBottom: 3 }}>Portal del paciente</p>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: c.s900, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          Hola, {paciente.nombre} 👋
        </h1>
      </div>

      {/* Hero — Próximo turno */}
      <div style={{ background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)', borderRadius: 24, padding: '20px', marginBottom: 12, color: '#fff' }}>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>Tu recuperación, ordenada y simple</p>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 14 }}>Próximo turno</h2>
        {proximoTurno ? (() => {
          const d = new Date(proximoTurno.fecha+'T12:00')
          return (
            <>
              <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: '14px', backdropFilter: 'blur(4px)', marginBottom: 14 }}>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>{diasSemana[d.getDay()]}, {d.getDate()} de {meses[d.getMonth()]}</p>
                <p style={{ fontSize: 30, fontWeight: 700, marginTop: 4, lineHeight: 1 }}>{proximoTurno.hora?.slice(0,5)} hs</p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 6 }}>Augusto Ciuró · {proximoTurno.motivo || 'Sesión de kinesiología'}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button style={{ background: '#fff', color: c.blue, borderRadius: 14, padding: '11px', fontWeight: 600, fontSize: 13, border: 'none', cursor: 'pointer' }}>Confirmar</button>
                <button style={{ background: 'rgba(37,99,235,0.2)', color: '#fff', borderRadius: 14, padding: '11px', fontWeight: 600, fontSize: 13, border: '1px solid rgba(255,255,255,0.25)', cursor: 'pointer' }}>Reprogramar</button>
              </div>
            </>
          )
        })() : (
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: '14px', textAlign: 'center', color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
            No tenés turnos próximos
          </div>
        )}
      </div>

      {/* Mini stats — Dolor · Sesión · Progreso */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 12 }}>
        <div onClick={onAbrirDolor} style={{ ...card, padding: '14px', cursor: 'pointer' }}>
          <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: c.s500 }}>Dolor</p>
          <p style={{ fontSize: 24, fontWeight: 700, color: c.s900, marginTop: 6, lineHeight: 1 }}>
            {dolorHoy ? `${dolorHoy.manana}/10` : '—'}
          </p>
          <p style={{ fontSize: 11, color: dolorHoy && dolorHoy.manana <= 3 ? c.emerald : c.s500, marginTop: 4 }}>
            {dolorHoy && dolorHoy.manana <= 3 ? 'Mejorando' : 'Registrar →'}
          </p>
        </div>
        <div style={{ ...card, padding: '14px' }}>
          <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: c.s500 }}>Sesión</p>
          <p style={{ fontSize: 24, fontWeight: 700, color: c.s900, marginTop: 6, lineHeight: 1 }}>—</p>
          <p style={{ fontSize: 11, color: c.s500, marginTop: 4 }}>Plan actual</p>
        </div>
        <div style={{ ...card, padding: '14px' }}>
          <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: c.s500 }}>Rutinas</p>
          <p style={{ fontSize: 24, fontWeight: 700, color: c.s900, marginTop: 6, lineHeight: 1 }}>{ejercicios.length}</p>
          <p style={{ fontSize: 11, color: c.s500, marginTop: 4 }}>asignadas</p>
        </div>
      </div>

      {/* Ejercicios indicados */}
      {ejercicios.length > 0 && (
        <div style={{ ...card, padding: '20px', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 14 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: c.s900 }}>Ejercicios indicados</h2>
              <p style={{ fontSize: 12, color: c.s500, marginTop: 2 }}>
                {ultimoMotivo?.sintoma ? ultimoMotivo.sintoma : 'Rutina para continuar en casa'}
              </p>
            </div>
            <button onClick={() => onVerDetalle(ejercicios[0].id)}
              style={{ fontSize: 13, fontWeight: 600, color: c.blue, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' }}>
              Ver todos
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ejercicios.slice(0, 3).map(ej => {
              const nombre = ej.nombre.replace(/ — (CC|OA)$/, '')
              return (
                <div key={ej.id} onClick={() => onVerDetalle(ej.id)}
                  style={{ borderRadius: 16, border: `1px solid ${c.s200}`, padding: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: 600, color: c.s900, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{nombre}</p>
                    <p style={{ fontSize: 12, color: c.s500, marginTop: 2 }}>
                      {[ej.series && `${ej.series} series`, ej.repeticiones && `${ej.repeticiones} reps`, ej.segundos && `${ej.segundos} seg`].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <span style={{ background: c.emeraldBg, color: c.emeraldText, borderRadius: 20, padding: '2px 9px', fontSize: 10, fontWeight: 600, flexShrink: 0 }}>Activo</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Seguimiento */}
      <div style={{ ...card, padding: '20px', marginBottom: 12 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: c.s900, marginBottom: 4 }}>Seguimiento</h2>
        <p style={{ fontSize: 12, color: c.s500, marginBottom: 14 }}>Resumen claro de tu evolución</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            { label: 'Dolor', value: '-35%' },
            { label: 'Movilidad', value: '75%' },
            { label: 'Adherencia', value: '82%' },
          ].map(item => (
            <div key={item.label} style={{ background: c.s50, borderRadius: 16, padding: '14px', border: `1px solid ${c.s200}` }}>
              <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: c.s500 }}>{item.label}</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: c.s900, marginTop: 6 }}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Saldo */}
      {saldo > 0 && (
        <div style={{ background: c.redBg, border: `1px solid ${c.redBorder}`, borderRadius: 20, padding: '16px', marginBottom: 12 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: c.red }}>💳 Saldo pendiente: ${saldo}</p>
          <p style={{ fontSize: 12, color: c.redText, marginTop: 4 }}>Transferí al alias <strong>{ALIAS}</strong></p>
        </div>
      )}
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
      <h1 style={{ fontSize: 22, fontWeight: 700, color: c.s900, letterSpacing: '-0.02em', marginBottom: 16 }}>Turnos</h1>

      {proximos.map(t => {
        const d = new Date(t.fecha+'T12:00')
        return (
          <div key={t.id} style={{ ...card, padding: '14px', marginBottom: 10, display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ background: c.blue, borderRadius: 14, minWidth: 48, height: 52, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
              <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1 }}>{d.getDate()}</div>
              <div style={{ fontSize: 9, fontWeight: 600 }}>{meses[d.getMonth()].toUpperCase()}</div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: c.s900 }}>{diasSemana[d.getDay()]} · {t.hora?.slice(0,5)}</div>
              <div style={{ fontSize: 12, color: c.s500, marginTop: 2 }}>{t.motivo||'Sesión de kinesiología'}</div>
            </div>
            <span style={{ background: c.emeraldBg, color: c.emeraldText, borderRadius: 20, padding: '3px 10px', fontSize: 10, fontWeight: 600, flexShrink: 0 }}>Confirmado</span>
          </div>
        )
      })}

      <div style={{ ...card, padding: '20px', marginTop: 8 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: c.s900, marginBottom: 16 }}>Solicitar turno</h2>
        {exito ? (
          <div style={{ background: c.emeraldBg, color: c.emeraldText, borderRadius: 14, padding: '1rem', textAlign: 'center', fontWeight: 600 }}>✓ Solicitud enviada. El kinesiólogo te confirmará.</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div>
                <label style={{ fontSize: 12, color: c.s500, display: 'block', marginBottom: 4 }}>Fecha</label>
                <input type="date" min={hoyStr} value={form.fecha} onChange={e=>setForm(f=>({...f,fecha:e.target.value}))}
                  style={{ width: '100%', border: `1px solid ${c.s200}`, borderRadius: 12, padding: '10px 11px', fontSize: 14, color: c.s900, outline: 'none', fontFamily: 'inherit' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: c.s500, display: 'block', marginBottom: 4 }}>Hora</label>
                <input type="time" value={form.hora} onChange={e=>setForm(f=>({...f,hora:e.target.value}))}
                  style={{ width: '100%', border: `1px solid ${c.s200}`, borderRadius: 12, padding: '10px 11px', fontSize: 14, color: c.s900, outline: 'none', fontFamily: 'inherit' }} />
              </div>
            </div>
            <textarea value={form.notas} onChange={e=>setForm(f=>({...f,notas:e.target.value}))} placeholder="Motivo (opcional)" rows={2}
              style={{ width: '100%', border: `1px solid ${c.s200}`, borderRadius: 12, padding: '10px 11px', fontSize: 14, color: c.s900, resize: 'none', outline: 'none', fontFamily: 'inherit', marginBottom: 10 }} />
            {error && <div style={{ color: c.red, fontSize: 12, marginBottom: 8 }}>{error}</div>}
            <button type="submit" disabled={enviando}
              style={{ width: '100%', background: c.blue, color: '#fff', border: 'none', borderRadius: 16, padding: '14px', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
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
      <h1 style={{ fontSize: 22, fontWeight: 700, color: c.s900, letterSpacing: '-0.02em', marginBottom: 16 }}>Rutinas</h1>
      {ejercicios.length === 0 ? (
        <div style={{ ...card, padding: '2rem', textAlign: 'center', color: c.s400, fontSize: 14 }}>
          Tu kinesiólogo aún no asignó ejercicios
        </div>
      ) : (
        <div style={{ ...card, padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: c.s900 }}>Rutina de hoy</div>
              <div style={{ fontSize: 12, color: c.s500, marginTop: 2 }}>{hechos} de {total} ejercicios</div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: c.blue }}>{pct}%</div>
          </div>
          <div style={{ height: 6, background: c.s100, borderRadius: 4, marginBottom: 16, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: c.blue, borderRadius: 4, transition: 'width 0.3s' }} />
          </div>
          {ejercicios.map((ej, i) => {
            const nombre = ej.nombre.replace(/ — (CC|OA)$/, '')
            const hecho = completados[ej.id]
            return (
              <div key={ej.id} onClick={() => onVerDetalle(ej.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', borderBottom: `1px solid ${c.s100}`, cursor: 'pointer', opacity: hecho ? 0.5 : 1 }}>
                <button onClick={e => { e.stopPropagation(); setCompletados(p=>({...p,[ej.id]:!p[ej.id]})) }}
                  style={{ width: 26, height: 26, borderRadius: 8, border: `2px solid ${hecho ? c.emerald : c.s200}`, background: hecho ? c.emerald : 'transparent', color: '#fff', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {hecho && '✓'}
                </button>
                <div style={{ width: 24, height: 24, borderRadius: 8, background: c.blueBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: c.blue, flexShrink: 0 }}>{i+1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: c.s900, textDecoration: hecho ? 'line-through' : 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{nombre}</div>
                  <div style={{ fontSize: 11, color: c.s500 }}>{ej.categoria}</div>
                </div>
                <div style={{ fontSize: 12, color: c.s400, display: 'flex', gap: 6, flexShrink: 0 }}>
                  {ej.series && <span>{ej.series}<small style={{opacity:0.7}}>s</small></span>}
                  {ej.repeticiones && <span>{ej.repeticiones}<small style={{opacity:0.7}}>r</small></span>}
                  {ej.segundos && <span>{ej.segundos}<small style={{opacity:0.7}}>"</small></span>}
                </div>
                <span style={{ color: c.s300, fontSize: 18, flexShrink: 0 }}>›</span>
              </div>
            )
          })}
          {pct === 100 && (
            <div style={{ background: c.emeraldBg, color: c.emeraldText, borderRadius: 14, padding: '0.75rem', textAlign: 'center', fontWeight: 700, marginTop: '0.75rem' }}>
              🎉 ¡Excelente! Completaste toda la rutina
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SeccionPerfil({ paciente, usuario, onLogout }) {
  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: c.s900, letterSpacing: '-0.02em', marginBottom: 16 }}>Perfil</h1>
      <div style={{ ...card, padding: '1.5rem', textAlign: 'center', marginBottom: 12 }}>
        <div style={{ width: 70, height: 70, borderRadius: '50%', background: c.blue, color: '#fff', fontSize: 24, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
          {paciente.nombre[0]}{paciente.apellido[0]}
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: c.s900 }}>{paciente.nombre} {paciente.apellido}</div>
        <div style={{ fontSize: 13, color: c.s500, margin: '4px 0 12px' }}>{usuario?.email}</div>
      </div>
      {paciente.celular && (
        <div style={{ ...card, padding: '1rem', marginBottom: 10 }}>
          <div style={{ fontSize: 11, color: c.s500, marginBottom: 2 }}>Celular</div>
          <div style={{ fontSize: 15, color: c.s900 }}>{paciente.celular}</div>
        </div>
      )}
      <div style={{ ...card, padding: '20px', marginBottom: 10 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: c.s900, marginBottom: 12 }}>Accesos rápidos</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {['Estudios', 'Recetas', 'Pagos', 'Ayuda'].map(item => (
            <button key={item} style={{ borderRadius: 14, border: `1px solid ${c.s200}`, padding: '14px', textAlign: 'left', fontSize: 13, fontWeight: 500, color: c.s700, background: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
              {item}
            </button>
          ))}
        </div>
      </div>
      <button onClick={onLogout} style={{ width: '100%', background: 'none', border: `1px solid ${c.s200}`, borderRadius: 16, padding: '13px', color: c.s500, fontWeight: 600, fontSize: 14, cursor: 'pointer', marginTop: '0.5rem' }}>
        Cerrar sesión
      </button>
    </div>
  )
}

/* ── Íconos nav ──────────────────────────────────────────── */
const IconInicio  = ({active}) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#2563eb' : '#94a3b8'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
const IconTurnos  = ({active}) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#2563eb' : '#94a3b8'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
const IconRutinas = ({active}) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#2563eb' : '#94a3b8'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
const IconPerfil  = ({active}) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#2563eb' : '#94a3b8'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>

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
      <p style={{ color:c.s500, textAlign:'center' }}>Tu cuenta aún no está vinculada a un paciente.<br />Consultá con tu kinesiólogo.</p>
    </div>
  )

  if (seleccionado) {
    const ej = ejercicios.find(e => e.id === seleccionado)
    if (ej) return <div className="pp-root"><EjercicioDetalle ej={ej} onVolver={() => setSeleccionado(null)} /></div>
  }

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
        <div className="pp-sidebar" style={{ display:'none', flexDirection:'column', width:220, background:'#0f172a', borderRight:'none', minHeight:'100vh', padding:'24px 12px', flexShrink:0 }}>
          <div style={{ marginBottom:'2rem', padding:'0 8px' }}>
            <div style={{ width:36, height:36, background:c.blue, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:14, color:'#fff', marginBottom:10 }}>R+</div>
            <div style={{ fontSize:15, fontWeight:600, color:'#fff' }}>Rehabilitaplus</div>
            <div style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>Portal del paciente</div>
          </div>
          {navItems.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setTab(id)} style={{
              display:'flex', alignItems:'center', gap:10, padding:'11px 14px', borderRadius:14, border:'none', cursor:'pointer', marginBottom:2, width:'100%',
              background: tab===id ? c.white : 'transparent',
              color: tab===id ? '#0f172a' : '#94a3b8',
              fontWeight: tab===id ? 600 : 400, fontSize:13.5, fontFamily:"'DM Sans', sans-serif",
            }}>
              <Icon active={tab===id} /> {label}
            </button>
          ))}
        </div>

        {/* Contenido */}
        <div className="pp-main" style={{ flex:1, padding:'16px', overflowX:'hidden' }}>
          {loading ? (
            <div style={{ textAlign:'center', color:c.s400, padding:'3rem' }}>Cargando...</div>
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
      <div className="pp-bottom-nav" style={{ display:'none', position:'fixed', bottom:0, left:0, right:0, background:'rgba(255,255,255,0.97)', borderTop:`1px solid ${c.s200}`, padding:'10px 12px calc(env(safe-area-inset-bottom, 0px) + 10px)', zIndex:100 }}>
        {/* CTA contactar */}
        <button
          style={{ width:'100%', background:c.blue, color:'#fff', borderRadius:16, padding:'12px', fontWeight:600, fontSize:14, border:'none', cursor:'pointer', marginBottom:8, fontFamily:"'DM Sans', sans-serif" }}>
          Contactar al kinesiólogo
        </button>
        {/* Tabs */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:4, background:c.s100, borderRadius:20, padding:6 }}>
          {navItems.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setTab(id)} style={{
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:3,
              background: tab===id ? c.white : 'transparent',
              border:'none', cursor:'pointer', padding:'7px 4px', borderRadius:14,
              color: tab===id ? c.blue : c.s400,
              boxShadow: tab===id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            }}>
              <Icon active={tab===id} />
              <span style={{ fontSize:10, fontWeight: tab===id ? 600 : 400, fontFamily:"'DM Sans', sans-serif" }}>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
