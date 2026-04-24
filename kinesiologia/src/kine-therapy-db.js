const Database = require('better-sqlite3');
const path = require('path');

const dataDir = process.env.DATA_DIR || path.join(__dirname, '..');
const db = new Database(path.join(dataDir, 'kine.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function ensureColumn(table, column, ddl) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all().map(c => c.name);
  if (!cols.includes(column)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${ddl}`);
}

ensureColumn('rutinas', 'tipo_plan', `tipo_plan TEXT DEFAULT 'terapeutico'`);
ensureColumn('rutinas', 'objetivo', `objetivo TEXT`);
ensureColumn('rutinas', 'frecuencia', `frecuencia TEXT`);
ensureColumn('rutinas', 'prescripcion', `prescripcion TEXT`);

db.exec(`
  CREATE TABLE IF NOT EXISTS rutina_feedback (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    rutina_id      INTEGER NOT NULL REFERENCES rutinas(id) ON DELETE CASCADE,
    paciente_id    INTEGER REFERENCES pacientes(id) ON DELETE SET NULL,
    fecha          TEXT DEFAULT (date('now','localtime')),
    completada     INTEGER DEFAULT 0,
    dificultad     INTEGER,
    dolor_durante  INTEGER,
    dolor_despues  INTEGER,
    duracion_min   INTEGER,
    comentario     TEXT,
    created_at     TEXT DEFAULT (datetime('now','localtime'))
  )
`);

function parseJSON(value, fallback) {
  if (!value) return fallback;
  try { return JSON.parse(value); }
  catch { return fallback; }
}

function getPacienteByUsuario(usuarioId) {
  return db.prepare('SELECT * FROM pacientes WHERE usuario_id=?').get(usuarioId);
}

function getMotivo(id) {
  return db.prepare('SELECT * FROM motivos WHERE id=?').get(id);
}

function getRutina(id) {
  return db.prepare('SELECT * FROM rutinas WHERE id=?').get(id);
}

function parseRutinaPrescripcion(rutina) {
  return {
    id: rutina.id,
    motivo_id: rutina.motivo_id,
    nombre: rutina.nombre,
    estado: rutina.estado,
    resumen: rutina.resumen,
    notas: rutina.notas,
    tipo_plan: rutina.tipo_plan || 'terapeutico',
    objetivo: rutina.objetivo || '',
    frecuencia: rutina.frecuencia || '',
    prescripcion: parseJSON(rutina.prescripcion, []),
    ejercicios: parseJSON(rutina.ejercicios, []),
    hielo: parseJSON(rutina.hielo, null),
    calor: parseJSON(rutina.calor, null),
    contraste: parseJSON(rutina.contraste, null),
    ejercicios_libres: rutina.ejercicios_libres || '',
  };
}

function updateRutinaPrescripcion(id, data) {
  db.prepare(`
    UPDATE rutinas
    SET tipo_plan=@tipo_plan,
        objetivo=@objetivo,
        frecuencia=@frecuencia,
        prescripcion=@prescripcion
    WHERE id=@id
  `).run({
    id,
    tipo_plan: data.tipo_plan || 'terapeutico',
    objetivo: data.objetivo || '',
    frecuencia: data.frecuencia || '',
    prescripcion: JSON.stringify(Array.isArray(data.prescripcion) ? data.prescripcion : []),
  });
  return parseRutinaPrescripcion(getRutina(id));
}

function insertRutinaFeedback(data) {
  const info = db.prepare(`
    INSERT INTO rutina_feedback
      (rutina_id, paciente_id, fecha, completada, dificultad, dolor_durante, dolor_despues, duracion_min, comentario)
    VALUES
      (@rutina_id, @paciente_id, @fecha, @completada, @dificultad, @dolor_durante, @dolor_despues, @duracion_min, @comentario)
  `).run(data);
  return db.prepare('SELECT * FROM rutina_feedback WHERE id=?').get(info.lastInsertRowid);
}

function getFeedbackByRutina(rutinaId) {
  return db.prepare(`
    SELECT rf.*, p.nombre, p.apellido
    FROM rutina_feedback rf
    LEFT JOIN pacientes p ON p.id = rf.paciente_id
    WHERE rf.rutina_id=?
    ORDER BY rf.fecha DESC, rf.created_at DESC
  `).all(rutinaId);
}

function getFeedbackByPaciente(pacienteId) {
  return db.prepare(`
    SELECT rf.*, r.nombre AS rutina_nombre, r.tipo_plan, m.sintoma AS motivo_sintoma
    FROM rutina_feedback rf
    JOIN rutinas r ON r.id = rf.rutina_id
    JOIN motivos m ON m.id = r.motivo_id
    WHERE rf.paciente_id=? OR m.paciente_id=?
    ORDER BY rf.fecha DESC, rf.created_at DESC
  `).all(pacienteId, pacienteId);
}

module.exports = {
  getPacienteByUsuario,
  getMotivo,
  getRutina,
  parseRutinaPrescripcion,
  updateRutinaPrescripcion,
  insertRutinaFeedback,
  getFeedbackByRutina,
  getFeedbackByPaciente,
};
