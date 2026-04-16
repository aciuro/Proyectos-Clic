const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sheetsApi = require('./sheets-api');

const router = express.Router();
router.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'clic-sistema-2024';

const PASSWORD_HASH = bcrypt.hashSync('Clic2023!', 10);

const USERS = [
  { email: 'lucas.fradusco@gmail.com',      nombre: 'Lucas' },
  { email: 'augustociuro@gmail.com',         nombre: 'Augusto' },
  { email: 'nicolasavanzillotta@gmail.com',  nombre: 'Nicolas' },
  { email: 'tizianavanzillotta@gmail.com',   nombre: 'Tiziana' },
];

const SHEETS = [
  { id: '1v-dCy6PtlT9dr4STzOT3I4rbhNio8MvE78DSSCQoFR4', nombre: 'Salario Clic' },
  { id: '1VcH-2CDesE1P1jmlhyPN80pE9MOxymeOyovvSF0D34E', nombre: 'Franquicias CP' },
];

// ── Auth ──────────────────────────────────────────────────────
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

router.get('/health', (req, res) => res.json({ ok: true }));

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = USERS.find(u => u.email.toLowerCase() === email?.toLowerCase());
  if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });
  const ok = await bcrypt.compare(password, PASSWORD_HASH);
  if (!ok) return res.status(401).json({ error: 'Contraseña incorrecta' });
  const token = jwt.sign({ email: user.email, nombre: user.nombre }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user });
});

router.get('/me', auth, (req, res) => {
  res.json(req.user);
});

// ── Sheets ────────────────────────────────────────────────────
router.get('/sheets', auth, (req, res) => {
  res.json(SHEETS);
});

router.get('/sheets/:id/tabs', auth, async (req, res) => {
  try {
    const sheet = SHEETS.find(s => s.id === req.params.id);
    if (!sheet) return res.status(404).json({ error: 'Sheet no encontrado' });
    const tabs = await sheetsApi.getTabs(req.params.id);
    res.json(tabs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/sheets/:id/data', auth, async (req, res) => {
  try {
    const sheet = SHEETS.find(s => s.id === req.params.id);
    if (!sheet) return res.status(404).json({ error: 'Sheet no encontrado' });
    const { tab } = req.query;
    if (!tab) return res.status(400).json({ error: 'Falta tab' });
    const data = await sheetsApi.getTabData(req.params.id, tab);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/sheets/:id/data', auth, async (req, res) => {
  try {
    const { tab, values } = req.body;
    if (!tab || !values) return res.status(400).json({ error: 'Faltan datos' });
    await sheetsApi.addRow(req.params.id, tab, values);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/sheets/:id/data/:row', auth, async (req, res) => {
  try {
    const { tab, values } = req.body;
    await sheetsApi.updateRow(req.params.id, tab, parseInt(req.params.row), values);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/sheets/:id/data/:row', auth, async (req, res) => {
  try {
    const { tab } = req.query;
    await sheetsApi.deleteRow(req.params.id, tab, parseInt(req.params.row));
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
