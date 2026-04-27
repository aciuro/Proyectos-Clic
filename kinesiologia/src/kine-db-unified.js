const db = require('./kine-db');

function fixMotivo(data) {
  const d = Object.assign({}, data || {});
  d.sintoma = d.sintoma || d.lesion || '';
  d.aparicion = d.aparicion || '';
  return d;
}

module.exports = Object.assign({}, db, {
  insertMotivo(data) {
    return db.insertMotivo(fixMotivo(data));
  },
  updateMotivo(data) {
    return db.updateMotivo(fixMotivo(data));
  }
});
