const bcrypt = require('bcryptjs');

let db;
let isPostgres = false;

if (process.env.DATABASE_URL) {
  isPostgres = true;
  const { createPgDb } = require('./pg-sync');
  db = createPgDb(process.env.DATABASE_URL);
} else {
  const Database = require('better-sqlite3');
  const path = require('path');
  const dataDir = process.env.DATA_DIR || path.join(__dirname, '..');
  db = new Database(path.join(dataDir, 'kine.db'));
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
}
