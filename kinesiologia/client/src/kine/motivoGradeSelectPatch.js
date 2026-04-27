const GRADO_OPTIONS = ['I', 'II', 'III', 'IV', 'NO APLICA']

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

function fieldByLabelText(text) {
  const wanted = text.toLowerCase()
  const node = Array.from(document.querySelectorAll('label div, label span, label p'))
    .find(el => el.textContent?.trim().toLowerCase() === wanted)
  return node?.closest('label') || null
}

function makeSection(title, subtitle) {
  const box = document.createElement('div')
  box.style.cssText = 'margin:12px 0 6px; padding-top:10px; border-top:1px solid rgba(83,151,166,.22); text-align:center;'
  const h = document.createElement('div')
  h.textContent = title
  h.style.cssText = 'font-size:13px; font-weight:950; color:#082B34; letter-spacing:.02em;'
  box.appendChild(h)
  if (subtitle) {
    const p = document.createElement('div')
    p.textContent = subtitle
    p.style.cssText = 'margin-top:4px; font-size:11px; line-height:1.35; color:#789FAA; font-weight:700;'
    box.appendChild(p)
  }
  return box
}

function ensureExtraState() {
  window.__rehabMotivoExtra = window.__rehabMotivoExtra || { signos_sintomas: '', dolor: null }
  return window.__rehabMotivoExtra
}

function patchFetchForMotivoExtras() {
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
        const extra = ensureExtraState()
        return originalFetch(input, { ...init, body: JSON.stringify({
          ...body,
          signos_sintomas: extra.signos_sintomas || '',
          dolor: extra.dolor === '' ? null : extra.dolor,
        }) })
      }
    } catch {}
    return originalFetch(input, init)
  }
}

function patchModalLayout() {
  const form = Array.from(document.querySelectorAll('form')).find(node => {
    const txt = node.textContent || ''
    return txt.includes('Motivo de consulta') && txt.includes('Guardar') && txt.includes('Cancelar')
  })
  if (!form) return

  const overlay = form.parentElement
  if (overlay && overlay.dataset.motivoOverlayPatched !== 'true') {
    overlay.dataset.motivoOverlayPatched = 'true'
    overlay.style.display = 'flex'
    overlay.style.alignItems = 'flex-start'
    overlay.style.justifyContent = 'center'
    overlay.style.overflowY = 'auto'
    overlay.style.webkitOverflowScrolling = 'touch'
    overlay.style.padding = 'max(14px, env(safe-area-inset-top)) 12px max(18px, env(safe-area-inset-bottom))'
    overlay.style.boxSizing = 'border-box'
  }

  if (form.dataset.motivoLayoutPatched !== 'true') {
    form.dataset.motivoLayoutPatched = 'true'
    form.style.maxHeight = 'calc(100dvh - 24px)'
    form.style.overflowY = 'auto'
    form.style.webkitOverflowScrolling = 'touch'
    form.style.padding = '18px 16px 16px'
    form.style.rowGap = '10px'
    form.style.borderRadius = '28px'
    form.style.boxSizing = 'border-box'
    form.style.textAlign = 'center'

    form.querySelectorAll('input, textarea, select').forEach(el => { el.style.textAlign = 'left' })

    const actions = Array.from(form.querySelectorAll('div')).find(el => {
      const text = el.textContent || ''
      return text.includes('Cancelar') && text.includes('Guardar')
    })
    if (actions) {
      actions.style.position = 'sticky'
      actions.style.bottom = '0'
      actions.style.background = '#FFFFFF'
      actions.style.paddingTop = '12px'
      actions.style.paddingBottom = '2px'
      actions.style.marginTop = '8px'
      actions.style.borderTop = '1px solid rgba(83,151,166,.18)'
      actions.style.zIndex = '2'
      actions.style.justifyContent = 'center'
      actions.style.flexWrap = 'wrap'
    }
  }
}

function patchLabelsAndSections() {
  const motivoField = fieldByLabelText('Motivo / lesión') || fieldByLabelText('Motivo de consulta')
  const diagnosticoField = fieldByLabelText('Diagnóstico o detalle') || fieldByLabelText('Diagnóstico médico')
  const gradoField = fieldByLabelText('Grado')
  const montoField = fieldByLabelText('Monto sesión')
  const form = motivoField?.closest('form') || diagnosticoField?.closest('form')
  if (!form || form.dataset.motivoClinicalPatched === 'true') return
  form.dataset.motivoClinicalPatched = 'true'

  const motivoLabel = motivoField?.querySelector('div')
  if (motivoLabel) { motivoLabel.textContent = 'Motivo de consulta'; motivoLabel.style.textAlign = 'center' }
  const diagnosticoLabel = diagnosticoField?.querySelector('div')
  if (diagnosticoLabel) { diagnosticoLabel.textContent = 'Diagnóstico médico'; diagnosticoLabel.style.textAlign = 'center' }
  const gradoLabel = gradoField?.querySelector('div')
  if (gradoLabel) gradoLabel.style.textAlign = 'center'
  const montoLabel = montoField?.querySelector('div')
  if (montoLabel) montoLabel.style.textAlign = 'center'

  if (motivoField) motivoField.insertAdjacentElement('beforebegin', makeSection('1. Motivo de consulta', 'Qué trae al paciente a consulta.'))
  if (diagnosticoField) diagnosticoField.insertAdjacentElement('beforebegin', makeSection('2. Diagnóstico médico', 'Diagnóstico informado o presuntivo, con grado si corresponde.'))

  const gradoRow = gradoField?.parentElement
  if (gradoRow && montoField && gradoRow.contains(montoField)) {
    gradoRow.style.gridTemplateColumns = '1fr'
    gradoRow.style.gap = '12px'
  }

  const signosBlock = document.createElement('label')
  signosBlock.style.cssText = 'display:block; margin-top:12px; text-align:center;'
  signosBlock.innerHTML = '<div style="font-size:12px;color:#315F68;font-weight:950;margin-bottom:6px;text-align:center">Signos y síntomas</div>'
  const signos = document.createElement('textarea')
  signos.placeholder = 'Ej: dolor al bajar escaleras, edema leve, dolor a la palpación, rigidez matinal...'
  signos.rows = 4
  signos.style.cssText = 'width:100%; border:1px solid rgba(83,151,166,.30); border-radius:15px; padding:12px 13px; color:#082B34; background:#fff; outline:none; font-family:inherit; font-size:14px; box-sizing:border-box; resize:vertical; min-height:104px; text-align:left;'
  signos.addEventListener('input', () => { ensureExtraState().signos_sintomas = signos.value })
  signosBlock.appendChild(signos)

  const painBlock = document.createElement('div')
  painBlock.style.cssText = 'display:block; margin-top:12px; text-align:center;'
  painBlock.innerHTML = '<div style="font-size:12px;color:#315F68;font-weight:950;margin-bottom:6px">Dolor actual</div><div style="font-size:11px;color:#789FAA;font-weight:700;margin-bottom:8px">Escala numérica 0 a 10: 0 sin dolor, 10 peor dolor imaginable.</div>'
  const painBtns = document.createElement('div')
  painBtns.style.cssText = 'display:grid; grid-template-columns:repeat(6,minmax(0,1fr)); gap:6px;'
  const painText = document.createElement('div')
  painText.textContent = 'Sin seleccionar'
  painText.style.cssText = 'margin-top:8px; font-size:12px; color:#315F68; font-weight:900; text-align:center;'
  const labels = ['sin dolor', 'leve', 'leve', 'leve', 'moderado', 'moderado', 'moderado', 'intenso', 'intenso', 'intenso', 'máximo']
  for (let i = 0; i <= 10; i++) {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.textContent = String(i)
    btn.style.cssText = 'border:1px solid rgba(83,151,166,.30); background:#fff; color:#082B34; border-radius:10px; padding:8px 0; font-weight:950; font-family:inherit; cursor:pointer;'
    btn.addEventListener('click', () => {
      ensureExtraState().dolor = i
      painText.textContent = `${i}/10 · ${labels[i]}`
      Array.from(painBtns.children).forEach(x => { x.style.background = '#fff'; x.style.color = '#082B34'; x.style.borderColor = 'rgba(83,151,166,.30)' })
      btn.style.background = '#2F9FB2'
      btn.style.color = '#fff'
      btn.style.borderColor = '#2F9FB2'
    })
    painBtns.appendChild(btn)
  }
  painBlock.appendChild(painBtns)
  painBlock.appendChild(painText)

  const insertAfter = gradoRow || diagnosticoField || motivoField
  if (insertAfter) {
    insertAfter.insertAdjacentElement('afterend', painBlock)
    insertAfter.insertAdjacentElement('afterend', signosBlock)
    signosBlock.insertAdjacentElement('beforebegin', makeSection('3. Signos, síntomas y dolor', 'Registro clínico rápido para seguir la evolución.'))
  }

  if (montoField) {
    painBlock.insertAdjacentElement('afterend', montoField)
    montoField.insertAdjacentElement('beforebegin', makeSection('4. Monto de sesión', 'Dato administrativo para cobros y saldo.'))
  }
}

function patchGradeInput() {
  const labels = Array.from(document.querySelectorAll('label, div, span, p'))
    .filter(el => el.textContent?.trim().toLowerCase() === 'grado')

  for (const label of labels) {
    const wrap = label.parentElement
    if (!wrap || wrap.dataset.gradeSelectPatched === 'true') continue
    const input = wrap.querySelector('input') || wrap.parentElement?.querySelector('input')
    if (!input || input.dataset.gradeSelectSource === 'true') continue

    wrap.dataset.gradeSelectPatched = 'true'
    input.dataset.gradeSelectSource = 'true'

    const select = document.createElement('select')
    select.dataset.gradeSelect = 'true'
    select.value = normalizeGrade(input.value)
    select.style.cssText = input.style.cssText
    select.style.width = '100%'
    select.style.borderRadius = input.style.borderRadius || '18px'
    select.style.border = input.style.border || '1px solid #dbe7ec'
    select.style.background = '#fff'
    select.style.padding = input.style.padding || '14px 16px'
    select.style.fontSize = input.style.fontSize || '16px'
    select.style.color = input.style.color || '#0f2f3a'
    select.style.fontFamily = input.style.fontFamily || 'inherit'
    select.style.boxSizing = 'border-box'
    select.style.outline = 'none'
    select.style.textAlign = 'left'

    for (const optionValue of GRADO_OPTIONS) {
      const option = document.createElement('option')
      option.value = optionValue
      option.textContent = optionValue
      select.appendChild(option)
    }

    select.addEventListener('change', () => setNativeValue(input, select.value))
    input.style.display = 'none'
    input.insertAdjacentElement('beforebegin', select)
    setNativeValue(input, select.value)
  }
}

function patchMotivoForm() {
  patchFetchForMotivoExtras()
  patchModalLayout()
  patchGradeInput()
  patchLabelsAndSections()
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', patchMotivoForm)
  const observer = new MutationObserver(patchMotivoForm)
  observer.observe(document.documentElement, { childList: true, subtree: true })
}
