(() => {
  const COLORS = {
    ink: '#0D3540', muted: '#7AAAB8', border: '#C0DDE5', white: '#FFFFFF', bg: '#F0F8FA',
    sky: '#5BB8CC', skyDark: '#3A96AE', aqua: '#7EC8B8', aquaDark: '#4FA898', aquaLight: '#D8F0EA',
    yellow: '#FFF8D6', yellowBorder: '#F0DFA0', yellowText: '#7A5C00'
  }

  const state = {
    mounted: false,
    pacienteId: null,
    rutinas: [],
    progress: {},
    busy: false,
    lastRenderKey: '',
  }

  function token() { return localStorage.getItem('kine_token') }
  function headers() { return token() ? { Authorization: `Bearer ${token()}` } : {} }

  async function api(path, options = {}) {
    const res = await fetch(`/api/kine${path}`, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...headers(),
        ...(options.headers || {}),
      },
    })
    if (!res.ok) throw new Error(`API ${res.status}`)
    return res.json()
  }

  function isPatientPortal() {
    const t = token()
    if (!t) return false
    const body = document.body?.innerText || ''
    return body.includes('Rutina') || body.includes('Dolor') || body.includes('Próximo turno') || body.includes('Kinesiología')
  }

  function isRutinasTabLikely() {
    const text = document.body?.innerText || ''
    if (text.includes('Rutina de hoy')) return false
    return text.includes('Rutinas') || text.includes('ACTIVAS') || text.includes('PENDIENTES') || text.includes('HECHOS')
  }

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

  function dose(item) {
    const parts = []
    if (item.series) parts.push(`${item.series} series`)
    if (item.repeticiones || item.reps) parts.push(`${item.repeticiones || item.reps} reps`)
    if (item.segundos) parts.push(`${item.segundos} seg`)
    if (item.pausa) parts.push(`pausa ${item.pausa}`)
    const text = parts.join(' · ')
    const extra = item.indicacion || item.detalle || item.descripcion || ''
    return [text, extra].filter(Boolean).join(' · ')
  }

  function routineItems(rutina) {
    return Array.isArray(rutina.ejercicios) ? rutina.ejercicios : []
  }

  function activeRutinas() {
    return state.rutinas.filter(r => !r.estado || r.estado === 'Activa' || r.estado === 'activa' || r.activa)
  }

  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild) }

  function progressBar(value, max) {
    const pct = max ? Math.min(100, Math.round((value / max) * 100)) : 0
    return h('div', { style: { height: '9px', background: '#EAF6F8', borderRadius: '999px', overflow: 'hidden', border: `1px solid ${COLORS.border}` } }, [
      h('div', { style: { height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${COLORS.aqua}, ${COLORS.sky})`, borderRadius: '999px', transition: 'width .2s ease' } })
    ])
  }

  function checkbox(item, rutina, progress) {
    const btn = h('button', {
      type: 'button',
      style: {
        width: '30px', height: '30px', minWidth: '30px', borderRadius: '10px', border: `1.5px solid ${item.hecho ? COLORS.aquaDark : COLORS.border}`,
        background: item.hecho ? COLORS.aquaDark : COLORS.white, color: '#fff', fontWeight: '900', cursor: 'pointer', fontSize: '16px',
        display: 'grid', placeItems: 'center'
      },
      onclick: async (ev) => {
        ev.preventDefault(); ev.stopPropagation()
        await toggleItem(rutina.id, item.index, !item.hecho)
      }
    }, item.hecho ? '✓' : '')
    return btn
  }

  function itemRow(item, rutina, progress) {
    const done = item.hecho
    return h('div', {
      style: {
        display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '11px', border: `1px solid ${done ? '#BFE8DB' : COLORS.border}`,
        background: done ? '#F1FBF7' : COLORS.white, borderRadius: '14px', marginTop: '8px'
      }
    }, [
      checkbox(item, rutina, progress),
      h('div', { style: { flex: '1', minWidth: '0' } }, [
        h('div', { style: { fontSize: '14px', fontWeight: '800', color: done ? COLORS.aquaDark : COLORS.ink, textDecoration: done ? 'line-through' : 'none', lineHeight: '1.25' } }, item.nombre || item.name || `Ejercicio ${item.index + 1}`),
        dose(item) ? h('div', { style: { marginTop: '4px', fontSize: '12px', color: COLORS.muted, lineHeight: '1.35' } }, dose(item)) : null,
        item.tipo ? h('div', { style: { marginTop: '7px', display: 'inline-flex', fontSize: '10px', color: COLORS.skyDark, background: '#EAF6F8', borderRadius: '999px', padding: '3px 8px', fontWeight: '800' } }, item.tipo) : null,
      ])
    ])
  }

  function routineCard(rutina) {
    const progress = state.progress[rutina.id]
    const items = progress?.items || routineItems(rutina).map((it, i) => ({ ...it, index: i, nombre: it.nombre || it.name || it.titulo || it.texto || `Ejercicio ${i + 1}`, hecho: false }))
    const hechos = progress?.hechos ?? items.filter(i => i.hecho).length
    const total = progress?.total_items ?? items.length
    const completadas = progress?.completadas ?? 0
    const objetivo = progress?.objetivo || Number(rutina.veces || 1) || 1
    const intento = progress?.intento_numero || 1
    const completa = total > 0 && hechos >= total

    const card = h('div', { class: 'rp-patient-routine-card', style: { background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: '18px', padding: '14px', marginBottom: '14px', boxShadow: '0 8px 28px rgba(13,53,64,.06)' } })
    card.appendChild(h('div', { style: { display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'flex-start' } }, [
      h('div', { style: { flex: '1' } }, [
        h('div', { style: { fontSize: '11px', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: '800' } }, rutina.motivo_sintoma || 'Rutina clínica'),
        h('div', { style: { marginTop: '4px', fontSize: '18px', color: COLORS.ink, fontWeight: '900', lineHeight: '1.15' } }, rutina.nombre || 'Rutina'),
        h('div', { style: { marginTop: '6px', fontSize: '12px', color: COLORS.muted, lineHeight: '1.35' } }, `Vuelta actual ${intento} · ${hechos}/${total} ejercicios`),
      ]),
      h('div', { style: { textAlign: 'right', minWidth: '82px' } }, [
        h('div', { style: { fontSize: '20px', color: completa ? COLORS.aquaDark : COLORS.skyDark, fontWeight: '900' } }, `${completadas}/${objetivo}`),
        h('div', { style: { fontSize: '10px', color: COLORS.muted, textTransform: 'uppercase', fontWeight: '800' } }, 'completadas')
      ])
    ]))
    card.appendChild(h('div', { style: { marginTop: '12px' } }, progressBar(hechos, total || 1)))
    if (completa) {
      card.appendChild(h('div', { style: { marginTop: '10px', background: COLORS.aquaLight, color: COLORS.aquaDark, border: '1px solid #BDE8DC', borderRadius: '12px', padding: '9px 10px', fontSize: '12px', fontWeight: '800', lineHeight: '1.35' } }, '✅ Vuelta completada. Ya quedó guardada en la base de datos.'))
      card.appendChild(h('button', { type: 'button', onclick: () => resetAttempt(rutina.id), style: { marginTop: '10px', width: '100%', border: `1px solid ${COLORS.border}`, background: '#fff', color: COLORS.skyDark, borderRadius: '13px', padding: '10px', fontWeight: '800', cursor: 'pointer' } }, 'Empezar otra vuelta'))
    }
    items.forEach(item => card.appendChild(itemRow(item, rutina, progress)))
    return card
  }

  function render() {
    const root = ensureRoot()
    if (!root) return
    clear(root)
    const rutinas = activeRutinas()
    if (!rutinas.length) {
      root.style.display = 'none'
      return
    }
    root.style.display = 'block'
    root.appendChild(h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '10px', margin: '0 0 12px' } }, [
      h('div', {}, [
        h('div', { style: { fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: COLORS.muted, fontWeight: '800' } }, 'Rutina con progreso'),
        h('div', { style: { marginTop: '4px', fontSize: '20px', color: COLORS.ink, fontWeight: '900' } }, 'Tu rutina semanal')
      ]),
      h('button', { type: 'button', onclick: loadAll, style: { border: `1px solid ${COLORS.border}`, background: COLORS.white, color: COLORS.skyDark, borderRadius: '12px', padding: '8px 10px', fontWeight: '800', fontSize: '12px', cursor: 'pointer' } }, 'Actualizar')
    ]))
    rutinas.forEach(r => root.appendChild(routineCard(r)))
  }

  function ensureRoot() {
    let content = document.querySelector('.pac-content') || document.querySelector('#root')
    if (!content) return null
    let root = document.getElementById('rp-patient-routine-progress')
    if (!root) {
      root = document.createElement('section')
      root.id = 'rp-patient-routine-progress'
      root.style.marginBottom = '14px'
      content.insertBefore(root, content.firstChild)
    }
    return root
  }

  async function toggleItem(rutinaId, index, hecho) {
    if (state.busy) return
    state.busy = true
    try {
      const updated = await api(`/rutinas/${rutinaId}/progreso/items/${index}`, {
        method: 'PATCH', body: JSON.stringify({ hecho })
      })
      state.progress[rutinaId] = updated
      render()
    } catch (err) {
      console.warn('No se pudo guardar progreso de rutina', err)
      alert('No se pudo guardar el progreso. Probá de nuevo.')
    } finally {
      state.busy = false
    }
  }

  async function resetAttempt(rutinaId) {
    if (state.busy) return
    state.busy = true
    try {
      const updated = await api(`/rutinas/${rutinaId}/progreso/reiniciar-intento`, { method: 'POST', body: JSON.stringify({}) })
      state.progress[rutinaId] = updated
      render()
    } catch (err) {
      console.warn('No se pudo reiniciar intento', err)
      alert('No se pudo empezar otra vuelta. Probá de nuevo.')
    } finally {
      state.busy = false
    }
  }

  async function loadAll() {
    if (!isPatientPortal() || !token()) return
    try {
      const me = await api('/me')
      const pacienteId = me?.paciente?.id
      if (!pacienteId) return
      state.pacienteId = pacienteId
      const rutinas = await api(`/pacientes/${pacienteId}/rutinas`)
      state.rutinas = Array.isArray(rutinas) ? rutinas : []
      const active = activeRutinas()
      const progresses = await Promise.all(active.map(async r => {
        try { return [r.id, await api(`/rutinas/${r.id}/progreso`)] }
        catch { return [r.id, null] }
      }))
      progresses.forEach(([id, p]) => { if (p) state.progress[id] = p })
      render()
    } catch (err) {
      // No hacemos ruido si todavía no terminó de cargar login/app.
      console.warn('No se pudo cargar progreso de rutinas', err)
    }
  }

  function boot() {
    if (state.mounted) return
    state.mounted = true
    setTimeout(loadAll, 1200)
    setInterval(() => {
      if (isPatientPortal()) loadAll()
    }, 25000)
    const obs = new MutationObserver(() => {
      if (!document.getElementById('rp-patient-routine-progress') && isPatientPortal()) {
        setTimeout(render, 200)
      }
    })
    obs.observe(document.body, { childList: true, subtree: true })
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot)
  else boot()
})()
