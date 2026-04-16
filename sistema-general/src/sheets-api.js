const { google } = require('googleapis');

let sheetsClient = null;

function getCredentials() {
  if (process.env.GOOGLE_CREDENTIALS) {
    return JSON.parse(process.env.GOOGLE_CREDENTIALS);
  }
  // Local dev: leer desde archivo
  try {
    return require('../../Downloads/fleet-symbol-492812-m9-0833dffa2b96.json');
  } catch {
    throw new Error('GOOGLE_CREDENTIALS no configurado');
  }
}

function getClient() {
  if (sheetsClient) return sheetsClient;
  const credentials = getCredentials();
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  sheetsClient = google.sheets({ version: 'v4', auth });
  return sheetsClient;
}

async function getTabs(sheetId) {
  const s = getClient();
  const res = await s.spreadsheets.get({ spreadsheetId: sheetId });
  return res.data.sheets.map(h => ({
    id: h.properties.sheetId,
    nombre: h.properties.title,
  }));
}

async function getTabData(sheetId, tabName) {
  const s = getClient();
  const res = await s.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `'${tabName}'`,
  });

  const rows = res.data.values || [];
  if (rows.length === 0) return { headers: [], rows: [] };

  const headers = rows[0];
  const data = rows.slice(1).map((row, i) => ({
    _rowIndex: i + 2, // +1 por header, +1 por ser 1-based
    values: headers.map((_, ci) => row[ci] || ''),
  }));

  return { headers, rows: data };
}

async function addRow(sheetId, tabName, values) {
  const s = getClient();
  await s.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: `'${tabName}'`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [values] },
  });
}

async function updateRow(sheetId, tabName, rowIndex, values) {
  const s = getClient();
  const colEnd = String.fromCharCode(64 + values.length); // A=65
  await s.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: `'${tabName}'!A${rowIndex}:${colEnd}${rowIndex}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [values] },
  });
}

async function deleteRow(sheetId, tabName, rowIndex) {
  const s = getClient();
  // Obtener sheetId numérico
  const meta = await s.spreadsheets.get({ spreadsheetId: sheetId });
  const hoja = meta.data.sheets.find(h => h.properties.title === tabName);
  if (!hoja) throw new Error('Tab no encontrado');

  await s.spreadsheets.batchUpdate({
    spreadsheetId: sheetId,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId: hoja.properties.sheetId,
            dimension: 'ROWS',
            startIndex: rowIndex - 1,
            endIndex: rowIndex,
          },
        },
      }],
    },
  });
}

module.exports = { getTabs, getTabData, addRow, updateRow, deleteRow };
