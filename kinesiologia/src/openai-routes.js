const express = require('express')
const jwt = require('jsonwebtoken')

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'kine-ciuro-secret-2024'

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Sin token' })
  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido' })
  }
}

function onlyAdmin(req, res, next) {
  if (req.user?.rol === 'admin') return next()
  return res.status(403).json({ error: 'Solo disponible para el portal profesional' })
}

function extractJson(text = '') {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) return null
  try { return JSON.parse(text.slice(start, end + 1)) } catch { return null }
}

function openAIErrorMessage(data, status) {
  const msg = data?.error?.message || 'Error llamando a OpenAI'
  if (status === 401) return 'OpenAI rechazó la API key. Revisá OPENAI_API_KEY en Railway: que esté en el proyecto de kinesiología, sin espacios ni comillas.'
  if (status === 429) return 'OpenAI respondió sin cuota o con límite de uso. Revisá crédito/límites en OpenAI Platform.'
  return msg
}

router.post('/ia/rutina', auth, onlyAdmin, async (req, res) => {
  try {
    const key = process.env.OPENAI_API_KEY
    if (!key) return res.status(500).json({ error: 'Falta configurar OPENAI_API_KEY en Railway / servidor' })

    const prompt = String(req.body?.prompt || '').trim()
    const rutina = req.body?.rutina || {}
    const contexto = req.body?.contexto || {}
    if (!prompt) return res.status(400).json({ error: 'Falta el pedido para la IA' })

    const system = `Sos un copiloto clínico para una app de kinesiología. Convertí el pedido del kinesiólogo en acciones JSON seguras para editar una rutina. No guardes nada y no inventes diagnósticos.

Devolvé SOLO JSON válido con esta forma:
{"resumen":"...", "actions":[...]}

Acciones permitidas:
1) {"type":"add_exercise","nombre":"...","series":"3","repeticiones":"10","pausa":"60 seg","indicacion":"..."}
2) {"type":"add_exercise_query","cantidad":2,"musculo":"cuadriceps","contraccion":"excentrica","region":"rodilla","series":"3","repeticiones":"8-10","pausa":"60-90 seg","indicacion":"Bajada lenta y controlada"}
3) {"type":"add_mobility","nombre":"Bicicleta fija","duracion":"10 min","detalle":"Entrada en calor suave"}
4) {"type":"add_stretching","nombre":"Elongación final","duracion":"5-8 min","detalle":"Suave, sin dolor"}
5) {"type":"add_agent","nombre":"Hielo","duracion":"15 min","frecuencia":"post rutina"}
6) {"type":"remove_item","query":"..."}
7) {"type":"remove_agent","query":"hielo"}
8) {"type":"update_all_exercises","series":"3","repeticiones":"10"}
9) {"type":"set_frequency","veces":3,"frecuencia":"3 veces antes del próximo control"}
10) {"type":"add_indication","texto":"..."}
11) {"type":"reorder_clinical"}

Reglas importantes:
- Si el kinesiólogo pide “dos excéntricos de cuádriceps”, NO inventes nombres: usá add_exercise_query con cantidad 2, musculo cuadriceps, contraccion excentrica, region rodilla.
- Si pide “dos concéntricos de isquio”, usá add_exercise_query con musculo isquiotibiales, contraccion concentrica, region rodilla o cadera según contexto.
- Si pide gemelo, región tobillo, musculo gemelos.
- Si pide glúteo mayor, región cadera, musculo gluteo mayor.
- Si pide bicicleta/caminar/cinta/elíptico, usá add_mobility o add_cardio, no add_exercise_query.
- Si pide elongación al final, usá add_stretching.
- Terminá con reorder_clinical si armás varios bloques.
- Preferí dosis conservadoras y editables.`

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
        temperature: 0.15,
        max_output_tokens: 1200,
      }),
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      return res.status(502).json({ error: openAIErrorMessage(data, response.status), openai_status: response.status })
    }

    const text = data.output_text || data.output?.flatMap(o => o.content || []).map(c => c.text || '').join('\n') || ''
    const parsed = extractJson(text)
    if (!parsed) return res.status(502).json({ error: 'La IA no devolvió JSON utilizable', raw: text })

    res.json({ ok: true, ...parsed })
  } catch (e) {
    console.error('OpenAI rutina error:', e)
    res.status(500).json({ error: 'Error interno del asistente IA' })
  }
})

module.exports = router
