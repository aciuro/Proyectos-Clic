import { useState } from 'react'
import { api } from './api.js'

export default function Login({ onLogin }) {
  const [form, setForm]           = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api.login(form)
      onLogin(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fld = {
    width: '100%', borderRadius: 16, border: '1px solid #e2e8f0', background: '#fff',
    padding: '13px 16px', color: '#0f172a', outline: 'none', fontSize: 15,
    fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.15s',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f9ff 0%, #f8fafc 50%, #ecfeff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div style={{ width: '100%', maxWidth: 900, borderRadius: 32, border: '1px solid #e2e8f0', background: '#fff', boxShadow: '0 20px 80px rgba(15,23,42,0.12)', overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>

        {/* Panel izquierdo */}
        <div style={{ background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)', padding: 40, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 520 }}>
          <div>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#fff' }}>
              R+
            </div>
            <h1 style={{ fontSize: 34, fontWeight: 700, color: '#fff', marginTop: 24, marginBottom: 0, lineHeight: 1.2 }}>Rehabilita Plus</h1>
            <p style={{ fontSize: 14, color: 'rgba(240,249,255,0.9)', marginTop: 14, lineHeight: 1.6, maxWidth: 280 }}>
              Gestión clínica para kinesiología, seguimiento de pacientes, sesiones y rutinas en un solo lugar.
            </p>
          </div>
          <div style={{ borderRadius: 24, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', padding: 20 }}>
            <p style={{ fontWeight: 600, fontSize: 14, color: '#fff', margin: 0 }}>Ingreso seguro</p>
            <p style={{ fontSize: 13, color: 'rgba(240,249,255,0.9)', marginTop: 8, marginBottom: 0, lineHeight: 1.6 }}>
              Accedé a tu panel profesional o a tu portal de paciente con una experiencia simple y ordenada.
            </p>
          </div>
        </div>

        {/* Panel derecho */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 40px' }}>
          <div style={{ width: '100%', maxWidth: 360 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#059669' }}>
              R+
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', marginTop: 20, marginBottom: 6, letterSpacing: '-0.025em' }}>Iniciar sesión</h2>
            <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>Ingresá con tus credenciales para continuar.</p>

            <form onSubmit={handleSubmit} style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#334155', marginBottom: 8 }}>Email</label>
                <input
                  type="email" required autoFocus placeholder="tu@email.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  style={fld}
                  onFocus={e => e.target.style.borderColor = '#059669'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <label style={{ fontSize: 14, fontWeight: 500, color: '#334155' }}>Contraseña</label>
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    style={{ fontSize: 13, fontWeight: 500, color: '#0284c7', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
                    {showPassword ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'} required placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  style={fld}
                  onFocus={e => e.target.style.borderColor = '#059669'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>

              {error && (
                <div style={{ borderRadius: 12, background: '#fef2f2', border: '1px solid #fecaca', padding: '12px 14px', fontSize: 13, color: '#dc2626' }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                style={{ width: '100%', borderRadius: 16, background: loading ? '#6ee7b7' : '#059669', color: '#fff', padding: '14px', fontSize: 15, fontWeight: 600, border: 'none', cursor: loading ? 'default' : 'pointer', fontFamily: 'inherit', transition: 'background 0.15s', marginTop: 4 }}>
                {loading ? 'Ingresando...' : 'Ingresar'}
              </button>
            </form>

            <p style={{ marginTop: 24, fontSize: 13, color: '#94a3b8', textAlign: 'center' }}>
              Acceso para profesionales y pacientes.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
