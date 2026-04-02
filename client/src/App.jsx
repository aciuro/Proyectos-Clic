import { useEffect, useState } from 'react'
import './App.css'

const TIPO_LABELS = {
  gasto: 'Gasto',
  mov_caja: 'Mov. de Caja',
  comprobantes_preview: 'Comprobantes',
  comprobantes_envio: 'Envío',
}

const TIPO_COLORS = {
  gasto: '#4ade80',
  mov_caja: '#60a5fa',
  comprobantes_preview: '#facc15',
  comprobantes_envio: '#a78bfa',
}

function EventoDetalle({ evento }) {
  if (evento.tipo === 'gasto') {
    return (
      <div>
        <p><strong>👤 {evento.datos.socio}</strong></p>
        <p>📝 {evento.datos.descripcion}</p>
        <p>💰 ${evento.datos.monto?.toLocaleString('es-AR')}</p>
      </div>
    )
  }

  if (evento.tipo === 'mov_caja') {
    const { datos } = evento
    return (
      <div>
        <p><strong>{datos.ingresoEgreso === 'Ingreso' ? '📈' : '📉'} {datos.ingresoEgreso}</strong></p>
        <p>💰 ${datos.monto?.toLocaleString('es-AR')}</p>
        <p>📝 {datos.item}</p>
        {datos.caja && <p>🗂️ {datos.caja}</p>}
        {datos.sede && <p>📍 {datos.sede}</p>}
      </div>
    )
  }

  if (evento.tipo === 'comprobantes_preview') {
    return (
      <div>
        <p><strong>⏳ Esperando confirmación</strong></p>
        {evento.caption && <p>💬 "{evento.caption}"</p>}
        <div className="lista">
          {evento.listos?.map((l, i) => (
            <div key={i} className="lista-item ok">✅ {l.archivo.replace(/\.[^.]+$/, '')} → {l.contacto}</div>
          ))}
          {evento.noEncontrados?.map((a, i) => (
            <div key={i} className="lista-item error">❌ {a.replace(/\.[^.]+$/, '')} — sin contacto</div>
          ))}
          {evento.duplicados?.map((a, i) => (
            <div key={i} className="lista-item warn">⚠️ {a.replace(/\.[^.]+$/, '')} — duplicado</div>
          ))}
        </div>
      </div>
    )
  }

  if (evento.tipo === 'comprobantes_envio') {
    if (evento.estado === 'iniciado') return <p>📤 Enviando {evento.total} comprobante(s)...</p>
    if (evento.estado === 'enviado') return (
      <div>
        <p>✅ {evento.archivo?.replace(/\.[^.]+$/, '')} → {evento.contacto}</p>
        <progress value={evento.progreso} max={evento.total} />
        <small>{evento.progreso} / {evento.total}</small>
      </div>
    )
    if (evento.estado === 'error') return <p>❌ Error enviando {evento.archivo?.replace(/\.[^.]+$/, '')}</p>
    if (evento.estado === 'finalizado') return (
      <div>
        <p>✅ Enviados: {evento.enviados?.length}</p>
        {evento.errores?.length > 0 && <p>❌ Errores: {evento.errores?.length}</p>}
      </div>
    )
  }

  return null
}

function EventoCard({ evento }) {
  const color = TIPO_COLORS[evento.tipo] || '#94a3b8'
  const label = TIPO_LABELS[evento.tipo] || evento.tipo
  const hora = new Date(evento.timestamp).toLocaleTimeString('es-AR')

  return (
    <div className="card">
      <div className="card-header">
        <span className="badge" style={{ background: color }}>{label}</span>
        <span className="hora">{hora}</span>
      </div>
      <div className="card-body">
        <EventoDetalle evento={evento} />
      </div>
    </div>
  )
}

export default function App() {
  const [eventos, setEventos] = useState([])
  const [conectado, setConectado] = useState(false)

  useEffect(() => {
    const ws = new WebSocket(`ws://${window.location.host}`)
    ws.onopen = () => setConectado(true)
    ws.onclose = () => setConectado(false)
    ws.onmessage = (msg) => {
      const evento = JSON.parse(msg.data)
      setEventos(prev => [evento, ...prev].slice(0, 100))
    }
    return () => ws.close()
  }, [])

  return (
    <div className="app">
      <header>
        <h1>cliccentral</h1>
        <span className={`status ${conectado ? 'on' : 'off'}`}>
          {conectado ? '● conectado' : '○ desconectado'}
        </span>
      </header>
      <main>
        {eventos.length === 0 && (
          <div className="empty">Esperando actividad del bot...</div>
        )}
        {eventos.map((e, i) => (
          <EventoCard key={i} evento={e} />
        ))}
      </main>
    </div>
  )
}
