const db = require('./kine-db');

function normalizeGrade(value) {
  const raw = String(value ?? '').trim();
  const upper = raw.toUpperCase();
  if (['I', 'II', 'III', 'IV'].includes(upper)) return upper;
  if (raw === '1') return 'I';
  if (raw === '2') return 'II';
  if (raw === '3') return 'III';
  if (raw === '4') return 'IV';
  return 'NO APLICA';
}

function fixMotivo(data) {
  const src = data || {};
  const sintoma = src.sintoma || src.lesion || src.motivo_consulta || '';
  const diagnostico = src.diagnostico || src.diagnostico_medico || '';
  const grado = normalizeGrade(src.grado);
  const signosSintomas = src.signos_sintomas || src.signos || src.sintomas || '';
  const dolor = src.dolor === '' || src.dolor == null ? '' : String(src.dolor);
  const aparicion = src.aparicion || [
    diagnostico && `Diagnóstico médico: ${diagnostico}`,
    grado && grado !== 'NO APLICA' && `Grado: ${grado}`,
    signosSintomas && `Signos y síntomas: ${signosSintomas}`,
    dolor !== '' && `Dolor: ${dolor}/10`,
  ].filter(Boolean).join('\n');

  return {
    paciente_id: src.paciente_id,
    sintoma,
    aparicion,
    momento_dia: src.momento_dia || '',
    movimientos: src.movimientos || '',
    afloja_dia: src.afloja_dia ? 1 : 0,
    monto_sesion: Number(src.monto_sesion || 0),
    estado: src.estado || 'activo',
  };
}

module.exports = Object.assign({}, db, {
  insertMotivo(data) {
    return db.insertMotivo(fixMotivo(data));
  },
  updateMotivo(data) {
    return db.updateMotivo(fixMotivo(data));
  }
});
