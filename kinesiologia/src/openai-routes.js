const express = require('express')
const jwt = require('jsonwebtoken')

const router = express.Router()

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Sin token' })
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'kine-ciuro-secret-2024')
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido' })
  }
}

function onlyAdmin(req, res, next) {
  if (req.user?.rol === 'admin' || req.user?.email === 'augustociuro@gmail.com') return next()
  return res.status(403).json({ error: 'Solo disponible para el portal profesional' })
}

function extractJson(text = '') {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) return null
  try { return JSON.parse(text.slice(start, end + 1)) } catch { return null }
}

router.post('/ia/rutina', auth, onlyAdmin, async (req, res) => {
  const key = process.env.OPENAI_API_KEY
  if (!key) return res.status(500).json({ error: 'Falta configurar OPENAI_API_KEY en Railway / servidor' })

  const prompt = String(req.body?.prompt || '').trim()
  const rutina = req.body?.rutina || {}
  const contexto = req.body?.contexto || {}
  if (!prompt) return res.status(400).json({ error: 'Falta el pedido para la IA' })

  const system = `Sos un asistente clínico para una app de kinesiología. Convertí el pedido del kinesiólogo en acciones JSON seguras para editar una rutina. No inventes diagnósticos. No guardes nada. Solo devolvé JSON válido con esta forma: {"resumen":"...", "actions":[{"type":"add_exercise","nombre":"...","series":"3","repeticiones":"10","pausa":"60 seg","indicacion":"..."},{"type":"remove_item","query":"..."},{"type":"update_all_exercises","series":"3","repeticiones":"10"},{"type":"add_agent","nombre":"Hielo","duracion":"15 min","frecuencia":"post rutina"},{"type":"remove_agent","query":"hielo"},{"type":"set_frequency","veces":3,"frecuencia":"3 veces antes del próximo control"},{"type":"add_indication","texto":"..."},{"type":"reorder_clinical"}]} Acciones permitidas: add_exercise, remove_item, update_all_exercises, add_agent, remove_agent, set_frequency, add_indication, reorder_clinical.`

  const input = [
    { role: 'system', content: system },
    { role: 'user', content: JSON.stringify({ pedido: prompt, rutina, contexto }) },
  ]

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      input,
      temperature: 0.2,
      max_output_tokens: 900,
    }),
  })

  const data = await response.json()
  if (!response.ok) {
    return res.status(response.status).json({ error: data?.error?.message || 'Error llamando a OpenAI' })
  }

  const text = data.output_text || data.output?.flatMap(o => o.content || []).map(c => c.text || '').join('\n') || ''
  const parsed = extractJson(text)
  if (!parsed) return res.status(502).json({ error: 'La IA no devolvió JSON utilizable', raw: text })

  res.json({ ok: true, ...parsed })
})

module.exports = router
