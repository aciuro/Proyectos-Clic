const express = require('express')
const jwt = require('jsonwebtoken')
const Database = require('better-sqlite3')
const path = require('path')

const router = express.Router()
const dataDir = process.env.DATA_DIR || path.join(__dirname, '..')
const db = new Database(path.join(dataDir, 'kine.db'))

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS rutina_progreso_feedback (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    intento_id  INTEGER NOT NULL REFERENCES rutina_progreso_intentos(id) ON DELETE CASCADE,
    rutina_id   INTEGER NOT NULL REFERENCES rutinas(id) ON DELETE CASCADE,
    paciente_id INTEGER NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    dolor       INTEGER,
    dificultad  TEXT,
    comentario  TEXT,
    created_at  TEXT DEFAULT (datetime('now','localtime')),
    updated_at  TEXT DEFAULT (datetime('now','localtime')),
    UNIQUE(intento_id)
  );
`)

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Sin token' })
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido' })
  }
}

function getPacienteDelUsuario(userId) {
  return db.prepare('SELECT * FROM pacientes WHERE usuario_id=? LIMIT 1').get(userId)
}

function getRutinaConPaciente(rutinaId) {
  return db.prepare(`
    SELECT r.*, m.paciente_id, m.sintoma AS motivo_sintoma
    FROM rutinas r
    JOIN motivos m ON m.id = r.motivo_id
    WHERE r.id = ?
  `).get(rutinaId)
}

function puedeAccederRutina(req, rutina) {
  if (!rutina) return false
  if (req.user?.rol === 'admin') return true
  const p = getPacienteDelUsuario(req.user.id)
  return !!p && String(p.id) === String(rutina.paciente_id)
}

function currentPeriodKey() {
  const now = new Date()
  const tmp = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
  const dayNum = tmp.getUTCDay() || 7
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil((((tmp - yearStart) / 86400000) + 1) / 7)
  return `${tmp.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
}

function getOrCreateCurrentAttempt(rutina, periodoKey) {
  const existing = db.prepare(`
    SELECT * FROM rutina_progreso_intentos
    WHERE rutina_id=? AND paciente_id=? AND periodo_key=? AND completado=0
    ORDER BY intento_numero ASC
    LIMIT 1
  `).get(rutina.id, rutina.paciente_id, periodoKey)
  if (existing) return existing

  const last = db.prepare(`
    SELECT COALESCE(MAX(intento_numero), 0) AS n
    FROM rutina_progreso_intentos
    WHERE rutina_id=? AND paciente_id=? AND periodo_key=?
  `).get(rutina.id, rutina.paciente_id, periodoKey)
  const intentoNumero = Number(last?.n || 0) + 1
  const info = db.prepare(`
    INSERT INTO rutina_progreso_intentos (rutina_id, paciente_id, usuario_id, periodo_key, intento_numero)
    VALUES (?, ?, ?, ?, ?)
  `).run(rutina.id, rutina.paciente_id, null, periodoKey, intentoNumero)
  return db.prepare('SELECT * FROM rutina_progreso_intentos WHERE id=?').get(info.lastInsertRowid)
}

function feedbackFor(intentoId) {
  return db.prepare('SELECT * FROM rutina_progreso_feedback WHERE intento_id=? LIMIT 1').get(intentoId) || null
}

router.post('/rutinas/:id/progreso/feedback', auth, (req, res) => {
  const rutina = getRutinaConPaciente(req.params.id)
  if (!puedeAccederRutina(req, rutina)) return res.status(403).json({ error: 'Sin acceso' })

  const periodoKey = req.body?.periodo_key || currentPeriodKey()
  const intentoId = Number(req.body?.intento_id)
  const intento = intentoId
    ? db.prepare('SELECT * FROM rutina_progreso_intentos WHERE id=? AND rutina_id=? AND paciente_id=?').get(intentoId, rutina.id, rutina.paciente_id)
    : getOrCreateCurrentAttempt(rutina, periodoKey)
  if (!intento) return res.status(400).json({ error: 'Intento inválido' })

  const dolorRaw = req.body?.dolor
  const dolorNumber = dolorRaw === null || dolorRaw === undefined || dolorRaw === '' ? null : Number(dolorRaw)
  const dolor = Number.isFinite(dolorNumber) ? Math.max(0, Math.min(10, dolorNumber)) : null
  const dificultad = String(req.body?.dificultad || 'normal').slice(0, 30)
  const comentario = String(req.body?.comentario || '').slice(0, 1000)

  db.prepare(`
    INSERT INTO rutina_progreso_feedback (intento_id, rutina_id, paciente_id, dolor, dificultad, comentario, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now','localtime'))
    ON CONFLICT(intento_id) DO UPDATE SET
      dolor=excluded.dolor,
      dificultad=excluded.dificultad,
      comentario=excluded.comentario,
      updated_at=datetime('now','localtime')
  `).run(intento.id, rutina.id, rutina.paciente_id, dolor, dificultad, comentario)

  res.json({ ok: true, feedback: feedbackFor(intento.id) })
})

module.exports = router
