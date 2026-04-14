const s = {
  white: '#ffffff', s200: '#e2e8f0', s400: '#94a3b8',
  s500: '#64748b', s600: '#475569', s900: '#0f172a',
}

export default function Modal({ open, onClose, titulo, subtitulo, children }) {
  if (!open) return null
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, zIndex: 50,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 520, background: s.white,
          borderRadius: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          padding: 24, maxHeight: '92vh', overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: s.s900 }}>{titulo}</h2>
            {subtitulo && <p style={{ fontSize: 14, color: s.s500, marginTop: 3 }}>{subtitulo}</p>}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, color: s.s400, cursor: 'pointer', lineHeight: 1, padding: '2px 4px' }}>✕</button>
        </div>

        {children}
      </div>
    </div>
  )
}
