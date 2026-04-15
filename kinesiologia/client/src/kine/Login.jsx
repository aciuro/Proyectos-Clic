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
    marginTop: 8,
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f0f9ff 0%, #f1f5f9 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div style={{ width: '100%', maxWidth: 384 }}>

        {/* Logo + título */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 auto', boxShadow: '0 4px 14px rgba(5,150,105,0.35)' }}>
            R+
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginTop: 16, marginBottom: 0 }}>Rehabilita Plus</h1>
          <p style={{ fontSize: 14, color: '#64748b', marginTop: 6, marginBottom: 0 }}>Ingresá para continuar</p>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: 28, padding: 24, boxShadow: '0 8px 40px rgba(15,23,42,0.10)', border: '1px solid #e2e8f0' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            <div>
              <label style={{ fontSize: 14, fontWeight: 500, color: '#334155' }}>Email</label>
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ fontSize: 14, fontWeight: 500, color: '#334155' }}>Contraseña</label>
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  style={{ fontSize: 13, color: '#0284c7', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
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
              style={{ width: '100%', borderRadius: 16, background: loading ? '#6ee7b7' : '#059669', color: '#fff', padding: '14px', fontSize: 15, fontWeight: 600, border: 'none', cursor: loading ? 'default' : 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(5,150,105,0.3)', transition: 'background 0.15s' }}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>

          </form>
        </div>

        {/* Footer */}
        <p style={{ marginTop: 24, textAlign: 'center', fontSize: 12, color: '#94a3b8' }}>
          Acceso para pacientes y profesionales
        </p>

      </div>
    </div>
  )
}
