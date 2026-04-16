require('dotenv').config();
const path = require('path');
const express = require('express');
const routes = require('./routes');

const app = express();
app.use('/api', routes);
app.use(express.static(path.join(__dirname, '../client/dist')));
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Sistema General en http://localhost:${PORT}`));
