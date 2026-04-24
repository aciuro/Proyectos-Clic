const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('./kine-db-unified');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'kine-ciuro-secret-2024';

router.use(express.json());

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Sin token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
}

function soloAdmin(req, res, next) {
  if (req.user?.rol !== 'admin') return res.status(403).json({ error: 'Solo admin' });
  next();
}

function getPacienteDelUsuario(req) {
  if (req.user?.rol !== 'paciente') return null;
  return db.getPacienteByUsuario(req.user.id);
}

function puedeAccederPaciente(req, pacienteId) {
  if (req.user?.rol === 'admin') return true;
  const miPaciente = getPacienteDelUsuario(req);
  return !!miPaciente && String(miPaciente.id) === String(pacienteId);
}

function puedeAccederRutina(req, rutinaId) {
  if (req.user?.rol === 'admin') return true;
  const rutina = db.getRutina(rutinaId);
  if (!rutina) return false;
  const motivo = db.getMotivo(rutina.motivo_id);
  return motivo && puedeAccederPaciente(req, motivo.paciente_id);
}

function normalizarPrescripcion(body) {
  return {
    tipo_plan: body.tipo_plan || 'terapeutico',
    objetivo: body.objetivo || '',
    frecuencia: body.frecuencia || '',
    prescripcion: Array.isArray(body.prescripcion) ? body.prescripcion : [],
  };
}

// Guarda una prescripción flexible para rutinas terapéuticas.
// Soporta bloques de cardio/interválicos, caminata, carrera, bici, pausas y consignas libres.
router.put('/rutinas/:id/prescripcion', auth, soloAdmin, (req, res) => {
  try {
    const rutina = db.getRutina(req.params.id);
    if (!rutina) return res.status(404).json({ error: 'Rutina no encontrada' });
    const data = normalizarPrescripcion(req.body);
    res.json(db.updateRutinaPrescripcion(req.params.id, data));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get('/rutinas/:id/prescripcion', auth, (req, res) => {
  if (!puedeAccederRutina(req, req.params.id)) return res.status(403).json({ error: 'Sin acceso' });
  const rutina = db.getRutina(req.params.id);
  if (!rutina) return res.status(404).json({ error: 'Rutina no encontrada' });
  res.json(db.parseRutinaPrescripcion(rutina));
});

// Feedback del paciente al terminar una rutina.
router.post('/rutinas/:id/feedback', auth, (req, res) => {
  if (!puedeAccederRutina(req, req.params.id)) return res.status(403).json({ error: 'Sin acceso' });
  try {
    const miPaciente = req.user.rol === 'paciente' ? getPacienteDelUsuario(req) : null;
    const feedback = db.insertRutinaFeedback({
      rutina_id: req.params.id,
      paciente_id: req.body.paciente_id || miPaciente?.id || null,
      completada: req.body.completada ? 1 : 0,
      dificultad: req.body.dificultad ?? null,
      dolor_durante: req.body.dolor_durante ?? null,
      dolor_despues: req.body.dolor_despues ?? null,
      duracion_min: req.body.duracion_min ?? null,
      comentario: req.body.comentario || '',
      fecha: req.body.fecha || new Date().toISOString().split('T')[0],
    });
    res.status(201).json(feedback);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get('/rutinas/:id/feedback', auth, (req, res) => {
  if (!puedeAccederRutina(req, req.params.id)) return res.status(403).json({ error: 'Sin acceso' });
  res.json(db.getFeedbackByRutina(req.params.id));
});

router.get('/pacientes/:id/feedback-rutinas', auth, (req, res) => {
  if (!puedeAccederPaciente(req, req.params.id)) return res.status(403).json({ error: 'Sin acceso' });
  res.json(db.getFeedbackByPaciente(req.params.id));
});

module.exports = router;
