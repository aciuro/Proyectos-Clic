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

function labelText(el) {
  return el?.textContent?.trim().toLowerCase()
}

function findField(names) {
  const wanted = (Array.isArray(names) ? names : [names]).map(x => x.toLowerCase())
  const labelNode = Array.from(document.querySelectorAll('label div, label span, label p, div, span, p'))
    .find(el => wanted.includes(labelText(el)))
  return labelNode?.closest('label') || null
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

function setLabel(field, text) {
  const node = Array.from(field?.querySelectorAll('div, span, p') || []).find(n => n.textContent?.trim())
  if (node) {
    node.textContent = text
    node.style.textAlign = 'center'
    node.style.fontWeight = '750'
    node.style.color = '#334155'
    node.style.fontSize = '14px'
    node.style.marginBottom = '8px'
  }
}

function restyleField(field) {
  field?.querySelectorAll('input, textarea, select').forEach(el => {
    el.style.width = '100%'
    el.style.borderRadius = '14px'
    el.style.border = '1px solid #e2e8f0'
    el.style.background = '#fff'
    el.style.padding = '12px 14px'
    el.style.fontSize = '15px'
    el.style.boxSizing = 'border-box'
    el.style.textAlign = 'left'
  })
}

function ensureSelectForGrade(gradoField) {
  if (!gradoField || gradoField.dataset.gradeSelectPatched === 'true') return
  const input = gradoField.querySelector('input')
  if (!input) return
  gradoField.dataset.gradeSelectPatched = 'true'
  const select = document.createElement('select')
  select.value = normalizeGrade(input.value)
  select.style.cssText = input.style.cssText
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
  restyleField(gradoField)
}

function addClinicalFields(afterNode) {
  if (!afterNode || afterNode.parentElement?.querySelector('.rehab-clinical-extra')) return
  const extra = getExtraState()
  const wrap = document.createElement('div')
  wrap.className = 'rehab-clinical-extra'
  wrap.style.cssText = 'display:grid;gap:12px;margin-top:12px;'

  const signs = document.createElement('label')
  signs.style.cssText = 'display:block;text-align:center;'
  signs.innerHTML = '<div style="font-size:14px;color:#334155;font-weight:750;margin-bottom:8px;text-align:center">Signos y síntomas</div>'
  const textarea = document.createElement('textarea')
  textarea.placeholder = 'Ej: dolor al bajar escaleras, edema leve, dolor a la palpación...'
  textarea.rows = 3
  textarea.style.cssText = 'width:100%;border:1px solid #e2e8f0;border-radius:14px;padding:12px 14px;color:#0f172a;background:#fff;outline:none;font-family:inherit;font-size:15px;box-sizing:border-box;resize:vertical;min-height:90px;text-align:left;'
  textarea.value = extra.signos_sintomas || ''
  textarea.addEventListener('input', () => { getExtraState().signos_sintomas = textarea.value })
  signs.appendChild(textarea)

  const pain = document.createElement('div')
  pain.style.cssText = 'text-align:center;'
  pain.innerHTML = '<div style="font-size:14px;color:#334155;font-weight:750;margin-bottom:6px">Dolor actual</div><div style="font-size:12px;color:#64748b;font-weight:600;margin-bottom:8px">Escala 0 a 10</div>'
  const grid = document.createElement('div')
  grid.style.cssText = 'display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:6px;'
  const summary = document.createElement('div')
  summary.style.cssText = 'margin-top:7px;font-size:12px;color:#334155;font-weight:700;text-align:center;'
  const renderSummary = () => { summary.textContent = extra.dolor === '' ? 'Sin seleccionar' : `${extra.dolor}/10 · ${PAIN_LABELS[Number(extra.dolor)]}` }
  for (let i = 0; i <= 10; i++) {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.textContent = String(i)
    btn.style.cssText = 'border:1px solid #e2e8f0;background:#fff;color:#0f172a;border-radius:10px;padding:8px 0;font-weight:750;font-family:inherit;cursor:pointer;'
    btn.addEventListener('click', () => {
      extra.dolor = i
      Array.from(grid.children).forEach(child => { child.style.background = '#fff'; child.style.color = '#0f172a'; child.style.borderColor = '#e2e8f0' })
      btn.style.background = '#0ea5e9'
      btn.style.color = '#fff'
      btn.style.borderColor = '#0ea5e9'
      renderSummary()
    })
    grid.appendChild(btn)
  }
  renderSummary()
  pain.appendChild(grid)
  pain.appendChild(summary)

  wrap.appendChild(signs)
  wrap.appendChild(pain)
  afterNode.insertAdjacentElement('afterend', wrap)
}

function patchLayout() {
  const found = findMotivoForm()
  if (!found) return
  const { form, motivoField, diagnosticoField, gradoField, montoField } = found

  const overlay = form.parentElement
  if (overlay && overlay.dataset.rehabOverlayPatched !== 'true') {
    overlay.dataset.rehabOverlayPatched = 'true'
    overlay.style.alignItems = 'flex-start'
    overlay.style.justifyContent = 'center'
    overlay.style.overflowY = 'auto'
    overlay.style.webkitOverflowScrolling = 'touch'
    overlay.style.padding = '12px'
    overlay.style.boxSizing = 'border-box'
  }

  if (form.dataset.rehabMotivoPatched === 'true') {
    ensureSelectForGrade(gradoField)
    return
  }
  form.dataset.rehabMotivoPatched = 'true'

  form.querySelectorAll('.rehab-motivo-section-title').forEach(x => x.remove())
  form.style.maxHeight = 'calc(100dvh - 24px)'
  form.style.overflowY = 'auto'
  form.style.webkitOverflowScrolling = 'touch'
  form.style.boxSizing = 'border-box'
  form.style.textAlign = 'center'
  form.style.paddingBottom = '0'
  form.style.gap = '12px'

  setLabel(motivoField, 'Motivo de consulta')
  setLabel(diagnosticoField, 'Diagnóstico médico')
  setLabel(gradoField, 'Grado')
  setLabel(montoField, 'Monto sesión')

  ;[motivoField, diagnosticoField, gradoField, montoField].forEach(restyleField)
  ensureSelectForGrade(gradoField)

  const gradoRow = gradoField?.parentElement
  if (gradoRow && montoField && gradoRow.contains(montoField)) {
    gradoRow.style.display = 'grid'
    gradoRow.style.gridTemplateColumns = '1fr'
    gradoRow.style.gap = '12px'
  }

  addClinicalFields(gradoRow || gradoField || diagnosticoField || motivoField)

  if (montoField) {
    const extra = form.querySelector('.rehab-clinical-extra')
    if (extra && !extra.contains(montoField)) extra.insertAdjacentElement('afterend', montoField)
  }

  const actions = Array.from(form.querySelectorAll('div')).find(el => {
    const text = el.textContent || ''
    return text.includes('Cancelar') && text.includes('Guardar')
  })
  if (actions) {
    actions.style.position = 'sticky'
    actions.style.bottom = '0'
    actions.style.background = '#fff'
    actions.style.borderTop = '1px solid #e2e8f0'
    actions.style.padding = '12px 0 14px'
    actions.style.marginTop = '8px'
    actions.style.justifyContent = 'center'
    actions.style.flexWrap = 'wrap'
    actions.style.zIndex = '2'
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
