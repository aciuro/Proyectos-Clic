const { parentPort } = require('worker_threads');
const { Pool } = require('pg');

let port = null;
let pool = null;
let connectionString = null;
let txClient = null;

function ensurePool() {
  if (!pool) {
    pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  }
}

function serializeError(error) {
  return error && error.stack ? error.stack : (error && error.message) ? error.message : String(error);
}

function reply(id, ok, payload) {
  port.postMessage(ok ? { id, ok: true, result: payload } : { id, ok: false, error: payload });
}

async function handleRequest(message) {
  const { id, type, sql, params } = message;
  try {
    if (type === 'query') {
      ensurePool();
      const client = txClient || pool;
      const result = await client.query(sql, params);
      reply(id, true, { rows: result.rows, rowCount: result.rowCount, command: result.command });
      return;
    }
    if (type === 'begin') {
      ensurePool();
      txClient = await pool.connect();
      await txClient.query('BEGIN');
      reply(id, true, null);
      return;
    }
    if (type === 'commit') {
      await txClient.query('COMMIT');
      txClient.release();
      txClient = null;
      reply(id, true, null);
      return;
    }
    if (type === 'rollback') {
      if (txClient) {
        await txClient.query('ROLLBACK');
        txClient.release();
        txClient = null;
      }
      reply(id, true, null);
      return;
    }
    if (type === 'close') {
      if (txClient) {
        await txClient.query('ROLLBACK');
        txClient.release();
        txClient = null;
      }
      if (pool) {
        await pool.end();
        pool = null;
      }
      reply(id, true, null);
      return;
    }
    throw new Error(`Tipo de mensaje desconocido: ${type}`);
  } catch (error) {
    reply(id, false, serializeError(error));
  }
}

parentPort.on('message', (message) => {
  if (message.type === 'init') {
    port = message.port;
    connectionString = message.connectionString;
    port.on('message', handleRequest);
    port.start();
  }
});
