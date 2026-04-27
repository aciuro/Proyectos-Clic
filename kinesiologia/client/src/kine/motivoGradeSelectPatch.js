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

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', patchGradeInput)
  const observer = new MutationObserver(patchGradeInput)
  observer.observe(document.documentElement, { childList: true, subtree: true })
}
