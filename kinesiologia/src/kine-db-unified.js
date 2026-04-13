let mod;

if (process.env.DATABASE_URL) {
  mod = require('../kinesiologia/kine-db');
} else {
  mod = require('./kine-db');
}

module.exports = mod;
