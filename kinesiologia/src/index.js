require('dotenv').config();

const path = require('path');
const express = require('express');
const kineRoutes = require('./kine-routes');
const routineProgressRoutes = require('./routine-progress-routes');
const routineFeedbackRoutes = require('./routine-feedback-routes');
const openaiRoutes = require('./openai-routes');

const app = express();
app.use(express.json());

// ─── Rutas API ────────────────────────────────────────────────
app.use('/api/kine', routineFeedbackRoutes);
app.use('/api/kine', routineProgressRoutes);
app.use('/api/kine', kineRoutes);
app.use('/api/kine', openaiRoutes);

// ─── Archivos estáticos ───────────────────────────────────────
const uploadsDir = path.join(process.env.DATA_DIR || path.join(__dirname, '..'), 'uploads');
app.use('/uploads', express.static(uploadsDir));
app.use(express.static(path.join(__dirname, '../client/dist')));

// ─── SPA fallback ─────────────────────────────────────────────
app.get('/', (req, res) => res.redirect('/kine'));
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// ─── Arranque ─────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('🚀 Iniciando...');
  console.log(`✅ Sistema de Kinesiología activo en http://localhost:${PORT}`);
  console.log(`🌐 Frontend en http://localhost:${PORT}`);
});
