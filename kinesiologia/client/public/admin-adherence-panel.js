(() => {
  const COLORS = {
    ink: '#082B34', muted: '#789FAA', border: 'rgba(83,151,166,.30)', white: '#FFFFFF',
    sky: '#2F9FB2', skyDark: '#176F82', aqua: '#72CDB8', aquaDark: '#13795B', soft: '#EAF6F8', warn: '#B45309'
  }

  const state = { mounted: false, pacienteId: null, data: null, busy: false }

  function token() { return localStorage.getItem('kine_token') }
  function h(tag, attrs = {}, children = []) {
    const el = document.createElement(tag)
    Object.entries(attrs || {}).forEach(([k, v]) => {
      if (k === 'style') Object.assign(el.style, v)
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v)
      else if (v !== null && v !== undefined) el.setAttribute(k, v)
    })
    ;(Array.isArray(children) ? children : [children]).forEach(child => {
      if (child === null || child === undefined) return
      el.appendChild(typeof child === 'string' ? document.createTextNode(child) : child)
    })
    return el
  }

  async function api(path) {
    const res = await fetch(`/api/kine${path}`, { headers: token() ? { Authorization: `Bearer ${token()}` } : {} })
    if (!res.ok) throw new Error(`API ${res.status}`)
    return res.json()
  }

  function getPacienteIdFromPath() {
    const m = location.pathname.match(/pacientes\/(\d+)/i) || location.pathname.match(/paciente\/(\d+)/i)
    return m ? m[1] : null
  }

  function isAdminPatientDetail() {
    const id = getPacienteIdFromPath()
    if (!id || !token()) return false
    const body = document.body?.innerText || ''
    return body.includes('Sesión') || body.includes('Motivo') || body.includes('Evolución') || body.includes('Rutina') || body.includes('Paciente')
  }

  function progressBar(pct) {
    return h('div', { style: { height: '10px', background: '#EAF6F8', borderRadius: 999, overflow: 'hidden', border: `1px solid ${COLORS.border}` } }, [
      h('div', { style: { height: '100%', width: `${Math.max(0, Math.min(100, pct || 0))}%`, background: `linear-gradient(90deg, ${COLORS.aqua}, ${COLORS.sky})`, borderRadius: 999 } })
    ])
  }

  function pill(text, kind = 'soft') {
    const bg = kind === 'good' ? '#EAFBF5' : kind === 'warn' ? '#FFF7ED' : COLORS.soft
    const color = kind === 'good' ? COLORS.aquaDark : kind === 'warn' ? COLORS.warn : COLORS.skyDark
    return h('span', { style: { display: 'inline-flex', padding: '4px 8px', borderRadius: 999, background: bg, color, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '.04em' } }, text)
  }

  function routineRow(r) {
    const omitidos = Array.isArray(r.omitidos) ? r.omitidos.slice(0, 4) : []
    return h('div', { style: { border: `1px solid ${COLORS.border}`, borderRadius: 18, padding: 12, background: '#FFFFFF', marginTop: 10 } }, [
      h('div', { style: { display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' } }, [
        h('div', { style: { flex: 1, minWidth: 0 } }, [
          h('div', { style: { fontSize: 14, fontWeight: 950, color: COLORS.ink, lineHeight: 1.2 } }, r.nombre || 'Rutina'),
          h('div', { style: { fontSize: 11, color: COLORS.muted, marginTop: 4 } }, r.motivo_sintoma || 'Rutina activa'),
        ]),
        h('div', { style: { textAlign: 'right' } }, [
          h('div', { style: { fontSize: 18, fontWeight: 950, color: r.porcentaje >= 70 ? COLORS.aquaDark : COLORS.skyDark } }, `${r.completadas || 0}/${r.objetivo || 0}`),
          h('div', { style: { fontSize: 10, color: COLORS.muted, fontWeight: 800 } }, 'vueltas')
        ])
      ]),
      h('div', { style: { marginTop: 10 } }, progressBar(r.porcentaje || 0)),
      h('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 9 } }, [
        pill(`${r.porcentaje || 0}% adherencia`, r.porcentaje >= 70 ? 'good' : 'soft'),
        pill(`${r.ejercicios_hechos || 0}/${r.ejercicios_total || 0} ejercicios`, 'soft'),
      ]),
      omitidos.length ? h('div', { style: { marginTop: 9, fontSize: 11, color: COLORS.muted, lineHeight: 1.35 } }, `Omitidos: ${omitidos.join(', ')}${r.omitidos.length > 4 ? '…' : ''}`) : null
    ])
  }

  function render() {
    if (!isAdminPatientDetail()) { removeRoot(); return }
    const root = ensureRoot()
    if (!root || !state.data) return
    while (root.firstChild) root.removeChild(root.firstChild)
    const d = state.data
    root.appendChild(h('section', { style: { background: 'linear-gradient(135deg,#FFFFFF 0%,#ECF8FA 100%)', border: `1px solid ${COLORS.border}`, borderRadius: 26, padding: 16, margin: '0 0 16px', boxShadow: '0 14px 38px rgba(13,53,64,.07)' } }, [
      h('div', { style: { display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' } }, [
        h('div', { style: { flex: 1 } }, [
          h('div', { style: { fontSize: 11, color: COLORS.muted, fontWeight: 950, textTransform: 'uppercase', letterSpacing: '.1em' } }, 'Adherencia semanal'),
          h('div', { style: { marginTop: 4, fontSize: 22, color: COLORS.ink, fontWeight: 950, letterSpacing: '-.04em' } }, `${d.completadas || 0}/${d.objetivo || 0} vueltas completadas`),
          h('div', { style: { marginTop: 5, fontSize: 12, color: COLORS.muted } }, `Período ${d.periodo_key || 'actual'} · ${d.rutinas_activas || 0} rutina/s activa/s`),
        ]),
        h('button', { type: 'button', onclick: load, style: { border: `1px solid ${COLORS.border}`, background: '#fff', color: COLORS.skyDark, borderRadius: 14, padding: '9px 11px', fontSize: 12, fontWeight: 900, cursor: 'pointer' } }, 'Actualizar')
      ]),
      h('div', { style: { marginTop: 13 } }, progressBar(d.porcentaje || 0)),
      h('div', { style: { display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 10 } }, [
        pill(`${d.porcentaje || 0}% total`, d.porcentaje >= 70 ? 'good' : 'warn'),
        pill('Guardado en base de datos', 'good')
      ]),
      ...(Array.isArray(d.detalle) && d.detalle.length ? d.detalle.map(routineRow) : [h('div', { style: { marginTop: 12, color: COLORS.muted, fontSize: 13 } }, 'Todavía no hay rutinas activas para medir adherencia.')])
    ]))
  }

  function ensureRoot() {
    let content = document.querySelector('.adm-content') || document.querySelector('main') || document.querySelector('#root')
    if (!content) return null
    let root = document.getElementById('rp-admin-adherence-panel')
    if (!root) {
      root = document.createElement('div')
      root.id = 'rp-admin-adherence-panel'
      const firstSection = content.querySelector('section, .paciente-card, div')
      if (firstSection && firstSection.parentElement === content) content.insertBefore(root, firstSection.nextSibling)
      else content.insertBefore(root, content.firstChild)
    }
    return root
  }

  function removeRoot() {
    const root = document.getElementById('rp-admin-adherence-panel')
    if (root) root.remove()
  }

  async function load() {
    if (state.busy || !isAdminPatientDetail()) return
    const id = getPacienteIdFromPath()
    if (!id) return
    state.busy = true
    try {
      state.pacienteId = id
      state.data = await api(`/pacientes/${id}/adherencia-rutinas`)
      render()
    } catch (e) {
      console.warn('No se pudo cargar adherencia', e)
    } finally {
      state.busy = false
    }
  }

  function boot() {
    if (state.mounted) return
    state.mounted = true
    setTimeout(load, 1400)
    setInterval(load, 30000)
    new MutationObserver(() => {
      setTimeout(() => {
        if (isAdminPatientDetail()) load()
        else removeRoot()
      }, 300)
    }).observe(document.body, { childList: true, subtree: true })
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot)
  else boot()
})()
