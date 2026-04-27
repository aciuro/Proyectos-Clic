const GRADO_OPTIONS = ['I', 'II', 'III', 'IV', 'NO APLICA']
const PAIN_LABELS = ['sin dolor', 'leve', 'leve', 'leve', 'moderado', 'moderado', 'moderado', 'intenso', 'intenso', 'intenso', 'máximo']

function normalizeGrade(value) {
  const raw = String(value ?? '').trim()
  const upper = raw.toUpperCase()
  if (GRADO_OPTIONS.includes(upper)) return upper
  if (raw === '1') return 'I'
  if (raw === '2') return 'II'
  if (raw === '3') return 'III'
  if (raw === '4') return 'IV'
  return 'NO APLICA'
}

function setNativeValue(input, value) {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
  setter?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

function getExtraState() {
  window.__rehabMotivoExtra = window.__rehabMotivoExtra || { signos_sintomas: '', dolor: '' }
  return window.__rehabMotivoExtra
}

function patchFetch() {
  if (window.__rehabMotivoFetchPatched) return
  window.__rehabMotivoFetchPatched = true
  const originalFetch = window.fetch.bind(window)
  window.fetch = (input, init = {}) => {
    try {
      const url = typeof input === 'string' ? input : input?.url || ''
      const method = String(init?.method || 'GET').toUpperCase()
      const isMotivoSave = /\/api\/kine\/(pacientes\/[^/]+\/motivos|motivos\/[^/]+)$/.test(url)
      if (isMotivoSave && ['POST', 'PUT'].includes(method) && typeof init.body === 'string') {
        const body = JSON.parse(init.body)
        const extra = getExtraState()
        return originalFetch(input, {
          ...init,
          body: JSON.stringify({
            ...body,
            grado: normalizeGrade(body.grado),
            signos_sintomas: extra.signos_sintomas || body.signos_sintomas || '',
            dolor: extra.dolor === '' ? null : Number(extra.dolor),
          }),
        })
      }
    } catch {}
    return originalFetch(input, init)
  }
}

function textNodeEquals(node, text) {
  return node?.textContent?.trim().toLowerCase() === text.toLowerCase()
}

function findField(labelTexts) {
  const wanted = Array.isArray(labelTexts) ? labelTexts : [labelTexts]
  const labelNode = Array.from(document.querySelectorAll('label div, label span, label p, div, span, p'))
    .find(el => wanted.some(t => textNodeEquals(el, t)))
  return labelNode?.closest('label') || labelNode?.parentElement || null
}

function findMotivoForm() {
  const motivoField = findField(['Motivo / lesión', 'Motivo de consulta'])
  const diagnosticoField = findField(['Diagnóstico o detalle', 'Diagnóstico médico'])
  const gradoField = findField('Grado')
  const montoField = findField('Monto sesión')
  const form = motivoField?.closest('form') || diagnosticoField?.closest('form') || gradoField?.closest('form') || montoField?.closest('form')
  if (!form) return null
  const txt = form.textContent || ''
  if (!txt.includes('Guardar') && !txt.includes('Crear') && !txt.includes('Agregar')) return null
  return { form, motivoField, diagnosticoField, gradoField, montoField }
}

function section(title, subtitle) {
  const el = document.createElement('div')
  el.className = 'rehab-motivo-section-title'
  el.style.cssText = 'margin:14px 0 8px;padding-top:12px;border-top:1px solid rgba(83,151,166,.22);text-align:center;'
  el.innerHTML = `<div style="font-size:18px;font-weight:950;color:#082B34;letter-spacing:-.02em">${title}</div>${subtitle ? `<div style="margin:5px auto 0;max-width:310px;font-size:13px;line-height:1.25;color:#789FAA;font-weight:750">${subtitle}</div>` : ''}`
  return el
}

function relabel(field, text) {
  const node = Array.from(field?.querySelectorAll('div, span, p') || []).find(n => n.textContent?.trim())
  if (node) {
    node.textContent = text
    node.style.textAlign = 'center'
    node.style.fontWeight = '950'
    node.style.color = '#315F68'
    node.style.fontSize = '14px'
  }
}

function ensureSelectForGrade(gradoField) {
  if (!gradoField || gradoField.dataset.gradeSelectPatched === 'true') return
  const input = gradoField.querySelector('input')
  if (!input) return
  gradoField.dataset.gradeSelectPatched = 'true'
  const select = document.createElement('select')
  select.value = normalizeGrade(input.value)
  select.style.cssText = input.style.cssText
  select.style.width = '100%'
  select.style.borderRadius = input.style.borderRadius || '18px'
  select.style.border = input.style.border || '1px solid rgba(83,151,166,.30)'
  select.style.background = '#fff'
  select.style.padding = input.style.padding || '14px 15px'
  select.style.fontSize = input.style.fontSize || '16px'
  select.style.color = input.style.color || '#082B34'
  select.style.fontFamily = input.style.fontFamily || 'inherit'
  select.style.boxSizing = 'border-box'
  select.style.outline = 'none'
  for (const value of GRADO_OPTIONS) {
    const opt = document.createElement('option')
    opt.value = value
    opt.textContent = value
    select.appendChild(opt)
  }
  select.addEventListener('change', () => setNativeValue(input, select.value))
  input.style.display = 'none'
  input.insertAdjacentElement('beforebegin', select)
  setNativeValue(input, select.value)
}

function addSignsAndPain(afterNode) {
  if (!afterNode || afterNode.parentElement?.querySelector('.rehab-signos-sintomas')) return
  const extra = getExtraState()

  const signsWrap = document.createElement('label')
  signsWrap.className = 'rehab-signos-sintomas'
  signsWrap.style.cssText = 'display:block;margin-top:12px;text-align:center;'
  signsWrap.innerHTML = '<div style="font-size:14px;color:#315F68;font-weight:950;margin-bottom:7px;text-align:center">Signos y síntomas</div>'
  const textarea = document.createElement('textarea')
  textarea.placeholder = 'Ej: dolor al bajar escaleras, edema leve, dolor a la palpación, rigidez matinal...'
  textarea.rows = 4
  textarea.style.cssText = 'width:100%;border:1px solid rgba(83,151,166,.30);border-radius:18px;padding:14px 15px;color:#082B34;background:#fff;outline:none;font-family:inherit;font-size:16px;box-sizing:border-box;resize:vertical;min-height:108px;text-align:left;'
  textarea.value = extra.signos_sintomas || ''
  textarea.addEventListener('input', () => { getExtraState().signos_sintomas = textarea.value })
  signsWrap.appendChild(textarea)

  const painWrap = document.createElement('div')
  painWrap.className = 'rehab-pain-scale'
  painWrap.style.cssText = 'display:block;margin-top:14px;text-align:center;'
  painWrap.innerHTML = '<div style="font-size:14px;color:#315F68;font-weight:950;margin-bottom:6px">Dolor actual</div><div style="font-size:12px;color:#789FAA;font-weight:800;margin-bottom:9px">Escala 0 a 10: 0 sin dolor, 10 peor dolor imaginable.</div>'
  const grid = document.createElement('div')
  grid.style.cssText = 'display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:6px;'
  const summary = document.createElement('div')
  summary.style.cssText = 'margin-top:8px;font-size:13px;color:#315F68;font-weight:900;text-align:center;'
  const renderSummary = () => { summary.textContent = extra.dolor === '' ? 'Sin seleccionar' : `${extra.dolor}/10 · ${PAIN_LABELS[Number(extra.dolor)]}` }
  for (let i = 0; i <= 10; i++) {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.textContent = String(i)
    btn.style.cssText = 'border:1px solid rgba(83,151,166,.30);background:#fff;color:#082B34;border-radius:12px;padding:9px 0;font-weight:950;font-family:inherit;cursor:pointer;'
    btn.addEventListener('click', () => {
      extra.dolor = i
      Array.from(grid.children).forEach(child => { child.style.background = '#fff'; child.style.color = '#082B34'; child.style.borderColor = 'rgba(83,151,166,.30)' })
      btn.style.background = '#2F9FB2'
      btn.style.color = '#fff'
      btn.style.borderColor = '#2F9FB2'
      renderSummary()
    })
    grid.appendChild(btn)
  }
  renderSummary()
  painWrap.appendChild(grid)
  painWrap.appendChild(summary)

  afterNode.insertAdjacentElement('afterend', painWrap)
  afterNode.insertAdjacentElement('afterend', signsWrap)
  signsWrap.insertAdjacentElement('beforebegin', section('3. Signos, síntomas y dolor', 'Registro clínico rápido para seguir la evolución.'))
}

function patchLayout() {
  const found = findMotivoForm()
  if (!found) return
  const { form, motivoField, diagnosticoField, gradoField, montoField } = found

  const overlay = form.parentElement
  if (overlay && overlay.dataset.rehabOverlayPatched !== 'true') {
    overlay.dataset.rehabOverlayPatched = 'true'
    overlay.style.display = 'flex'
    overlay.style.alignItems = 'flex-start'
    overlay.style.justifyContent = 'center'
    overlay.style.overflowY = 'auto'
    overlay.style.webkitOverflowScrolling = 'touch'
    overlay.style.padding = 'max(14px, env(safe-area-inset-top)) 12px max(18px, env(safe-area-inset-bottom))'
    overlay.style.boxSizing = 'border-box'
  }

  if (form.dataset.rehabMotivoPatched !== 'true') {
    form.dataset.rehabMotivoPatched = 'true'
    form.style.maxHeight = 'calc(100dvh - 24px)'
    form.style.overflowY = 'auto'
    form.style.webkitOverflowScrolling = 'touch'
    form.style.boxSizing = 'border-box'
    form.style.textAlign = 'center'
    form.style.paddingBottom = '0'
    form.querySelectorAll('input, textarea, select').forEach(el => { el.style.textAlign = 'left'; el.style.fontSize = '16px' })

    if (motivoField) {
      relabel(motivoField, 'Motivo de consulta')
      motivoField.insertAdjacentElement('beforebegin', section('1. Motivo de consulta', 'Qué trae al paciente a consulta.'))
    }
    if (diagnosticoField) {
      relabel(diagnosticoField, 'Diagnóstico médico')
      diagnosticoField.insertAdjacentElement('beforebegin', section('2. Diagnóstico médico', 'Diagnóstico informado o presuntivo, con grado si corresponde.'))
    }

    const gradoRow = gradoField?.parentElement
    if (gradoRow && montoField && gradoRow.contains(montoField)) {
      gradoRow.style.display = 'grid'
      gradoRow.style.gridTemplateColumns = '1fr'
      gradoRow.style.gap = '12px'
    }
    relabel(gradoField, 'Grado')
    ensureSelectForGrade(gradoField)

    addSignsAndPain(gradoRow || gradoField || diagnosticoField || motivoField)

    if (montoField) {
      relabel(montoField, 'Monto sesión')
      const painWrap = form.querySelector('.rehab-pain-scale')
      if (painWrap) {
        painWrap.insertAdjacentElement('afterend', montoField)
        montoField.insertAdjacentElement('beforebegin', section('4. Monto de sesión', 'Dato administrativo para cobros y saldo.'))
      }
    }

    const actions = Array.from(form.querySelectorAll('div')).find(el => {
      const text = el.textContent || ''
      return text.includes('Cancelar') && text.includes('Guardar')
    })
    if (actions) {
      actions.style.position = 'sticky'
      actions.style.bottom = '0'
      actions.style.background = '#fff'
      actions.style.borderTop = '1px solid rgba(83,151,166,.22)'
      actions.style.padding = '13px 0 16px'
      actions.style.marginTop = '10px'
      actions.style.justifyContent = 'center'
      actions.style.flexWrap = 'wrap'
      actions.style.zIndex = '2'
    }
  } else {
    ensureSelectForGrade(gradoField)
  }
}

function patchMotivoForm() {
  patchFetch()
  patchLayout()
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', patchMotivoForm)
  const observer = new MutationObserver(patchMotivoForm)
  observer.observe(document.documentElement, { childList: true, subtree: true })
}
