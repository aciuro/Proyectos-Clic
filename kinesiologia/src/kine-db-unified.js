let mod;

if (process.env.DATABASE_URL) {
  mod = require('./kine-db-postgres');
} else {
  mod = require('./kine-db');
}

module.exports = mod;
