const express = require('express')
const jwt = require('jsonwebtoken')
const Database = require('better-sqlite3')
const path = require('path')

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'kine-ciuro-secret-2024'
const dataDir = process.env.DATA_DIR || path.join(__dirname, '..')
const db = new Database(path.join(dataDir, 'kine.db'))

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS rutina_progreso_intentos (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    rutina_id      INTEGER NOT NULL REFERENCES rutinas(id) ON DELETE CASCADE,
    paciente_id    INTEGER NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    usuario_id     INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    periodo_key    TEXT NOT NULL,
    intento_numero INTEGER NOT NULL DEFAULT 1,
    completado     INTEGER NOT NULL DEFAULT 0,
    completado_at  TEXT,
    created_at     TEXT DEFAULT (datetime('now','localtime')),
    updated_at     TEXT DEFAULT (datetime('now','localtime')),
    UNIQUE(rutina_id, paciente_id, periodo_key, intento_numero)
  );

  CREATE TABLE IF NOT EXISTS rutina_progreso_items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    intento_id  INTEGER NOT NULL REFERENCES rutina_progreso_intentos(id) ON DELETE CASCADE,
    item_index  INTEGER NOT NULL,
    item_key    TEXT,
    nombre      TEXT,
    hecho       INTEGER NOT NULL DEFAULT 0,
    hecho_at    TEXT,
    updated_at  TEXT DEFAULT (datetime('now','localtime')),
    UNIQUE(intento_id, item_index)
  );
`)

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

function parseEjercicios(rutina) {
  try {
    const parsed = rutina.ejercicios ? JSON.parse(rutina.ejercicios) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function itemName(item, index) {
  return item?.nombre || item?.name || item?.titulo || item?.texto || item?.ejercicio?.nombre || `Ejercicio ${index + 1}`
}

function itemImage(item) {
  return item?.imagen || item?.image || item?.imagen_url || item?.foto || item?.ejercicio?.imagen || item?.ejercicio?.image || item?.ejercicio?.imagen_url || null
}

function itemVideo(item) {
  return item?.video_url || item?.video || item?.ejercicio?.video_url || item?.ejercicio?.video || ''
}

function getTargetCount(rutina) {
  try {
    const meta = rutina.ejercicios_libres ? JSON.parse(rutina.ejercicios_libres) : {}
    const f = String(meta.frecuencia || rutina.frecuencia || '')
    if (f.includes('3')) return 3
    if (f.includes('2')) return 2
  } catch {}
  return Number(rutina.veces || 1) || 1
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

function getProgressPayload(rutina, periodoKey = currentPeriodKey()) {
  const ejercicios = parseEjercicios(rutina)
  const intento = getOrCreateCurrentAttempt(rutina, periodoKey)
  const itemsDb = db.prepare('SELECT * FROM rutina_progreso_items WHERE intento_id=?').all(intento.id)
  const byIndex = new Map(itemsDb.map(i => [Number(i.item_index), i]))
  const items = ejercicios.map((item, index) => {
    const row = byIndex.get(index)
    return {
      index,
      key: item?.id || item?.key || `${index}`,
      nombre: itemName(item, index),
      tipo: item?.tipo || item?.bloque || 'ejercicio',
      hecho: !!row?.hecho,
      hecho_at: row?.hecho_at || null,
      series: item?.series || '',
      repeticiones: item?.repeticiones || item?.reps || '',
      reps: item?.repeticiones || item?.reps || '',
      segundos: item?.segundos || '',
      pausa: item?.pausa || '',
      indicacion: item?.indicacion || item?.detalle || item?.descripcion || '',
      descripcion: item?.descripcion || item?.detalle || item?.indicacion || '',
      imagen: itemImage(item),
      image: itemImage(item),
      imagen_url: itemImage(item),
      foto: itemImage(item),
      video_url: itemVideo(item),
      video: itemVideo(item),
    }
  })
  const completadas = db.prepare(`
    SELECT COUNT(*) AS total
    FROM rutina_progreso_intentos
    WHERE rutina_id=? AND paciente_id=? AND periodo_key=? AND completado=1
  `).get(rutina.id, rutina.paciente_id, periodoKey)?.total || 0
  return {
    rutina_id: rutina.id,
    paciente_id: rutina.paciente_id,
    periodo_key: periodoKey,
    intento_id: intento.id,
    intento_numero: intento.intento_numero,
    completado: !!intento.completado,
    completadas,
    objetivo: getTargetCount(rutina),
    total_items: items.length,
    hechos: items.filter(i => i.hecho).length,
    items,
  }
}

function syncCompletionIfNeeded(intentoId, totalItems) {
  if (!totalItems) return
  const hechos = db.prepare('SELECT COUNT(*) AS total FROM rutina_progreso_items WHERE intento_id=? AND hecho=1').get(intentoId)?.total || 0
  if (hechos >= totalItems) {
    db.prepare(`
      UPDATE rutina_progreso_intentos
      SET completado=1, completado_at=COALESCE(completado_at, datetime('now','localtime')), updated_at=datetime('now','localtime')
      WHERE id=?
    `).run(intentoId)
  } else {
    db.prepare(`
      UPDATE rutina_progreso_intentos
      SET completado=0, completado_at=NULL, updated_at=datetime('now','localtime')
      WHERE id=?
    `).run(intentoId)
  }
}

router.get('/rutinas/:id/progreso', auth, (req, res) => {
  const rutina = getRutinaConPaciente(req.params.id)
  if (!puedeAccederRutina(req, rutina)) return res.status(403).json({ error: 'Sin acceso' })
  res.json(getProgressPayload(rutina, req.query.periodo || currentPeriodKey()))
})

router.patch('/rutinas/:id/progreso/items/:itemIndex', auth, (req, res) => {
  const rutina = getRutinaConPaciente(req.params.id)
  if (!puedeAccederRutina(req, rutina)) return res.status(403).json({ error: 'Sin acceso' })

  const ejercicios = parseEjercicios(rutina)
  const itemIndex = Number(req.params.itemIndex)
  if (!Number.isInteger(itemIndex) || itemIndex < 0 || itemIndex >= ejercicios.length) {
    return res.status(400).json({ error: 'Ítem inválido' })
  }

  const periodoKey = req.body?.periodo_key || currentPeriodKey()
  const intento = getOrCreateCurrentAttempt(rutina, periodoKey)
  const item = ejercicios[itemIndex]
  const hecho = req.body?.hecho ? 1 : 0
  db.prepare(`
    INSERT INTO rutina_progreso_items (intento_id, item_index, item_key, nombre, hecho, hecho_at, updated_at)
    VALUES (?, ?, ?, ?, ?, CASE WHEN ?=1 THEN datetime('now','localtime') ELSE NULL END, datetime('now','localtime'))
    ON CONFLICT(intento_id, item_index) DO UPDATE SET
      item_key=excluded.item_key,
      nombre=excluded.nombre,
      hecho=excluded.hecho,
      hecho_at=CASE WHEN excluded.hecho=1 THEN COALESCE(rutina_progreso_items.hecho_at, datetime('now','localtime')) ELSE NULL END,
      updated_at=datetime('now','localtime')
  `).run(intento.id, itemIndex, String(item?.id || item?.key || itemIndex), itemName(item, itemIndex), hecho, hecho)

  syncCompletionIfNeeded(intento.id, ejercicios.length)
  res.json(getProgressPayload(rutina, periodoKey))
})

router.post('/rutinas/:id/progreso/reiniciar-intento', auth, (req, res) => {
  const rutina = getRutinaConPaciente(req.params.id)
  if (!puedeAccederRutina(req, rutina)) return res.status(403).json({ error: 'Sin acceso' })
  const periodoKey = req.body?.periodo_key || currentPeriodKey()
  const intento = getOrCreateCurrentAttempt(rutina, periodoKey)
  db.prepare('DELETE FROM rutina_progreso_items WHERE intento_id=?').run(intento.id)
  db.prepare('UPDATE rutina_progreso_intentos SET completado=0, completado_at=NULL, updated_at=datetime(\'now\',\'localtime\') WHERE id=?').run(intento.id)
  res.json(getProgressPayload(rutina, periodoKey))
})

module.exports = router
