const path = require('path');
const { Worker, MessageChannel, receiveMessageOnPort } = require('worker_threads');

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function compileSql(sql, params) {
  const values = [];
  const namedIndex = new Map();
  const paramObject = params.length === 1 && isPlainObject(params[0]) ? params[0] : null;
  const positional = params;
  let positionalIndex = 0;
  let out = '';
  let state = 'normal';
  let mode = null;

  for (let i = 0; i < sql.length; i += 1) {
    const ch = sql[i];
    const next = sql[i + 1];

    if (state === 'single') {
      out += ch;
      if (ch === "'" && next === "'") {
        out += next;
        i += 1;
      } else if (ch === "'") {
        state = 'normal';
      }
      continue;
    }

    if (state === 'double') {
      out += ch;
      if (ch === '"' && next === '"') {
        out += next;
        i += 1;
      } else if (ch === '"') {
        state = 'normal';
      }
      continue;
    }

    if (state === 'line') {
      out += ch;
      if (ch === '\n') state = 'normal';
      continue;
    }

    if (state === 'block') {
      out += ch;
      if (ch === '*' && next === '/') {
        out += next;
        i += 1;
        state = 'normal';
      }
      continue;
    }

    if (ch === "'") {
      state = 'single';
      out += ch;
      continue;
    }

    if (ch === '"') {
      state = 'double';
      out += ch;
      continue;
    }

    if (ch === '-' && next === '-') {
      state = 'line';
      out += ch;
      continue;
    }

    if (ch === '/' && next === '*') {
      state = 'block';
      out += ch;
      continue;
    }

    if (ch === '@') {
      const match = sql.slice(i + 1).match(/^[A-Za-z_][A-Za-z0-9_]*/);
      if (match) {
        if (mode === 'positional') {
          throw new Error('No se pueden mezclar placeholders nombrados y posicionales en la misma consulta.');
        }
        mode = 'named';
        if (!paramObject) {
          throw new Error('La consulta usa placeholders nombrados y esperaba un objeto de parámetros.');
        }
        const name = match[0];
        let index = namedIndex.get(name);
        if (!index) {
          index = values.length + 1;
          namedIndex.set(name, index);
          values.push(paramObject[name]);
        }
        out += `$${index}`;
        i += name.length;
        continue;
      }
    }

    if (ch === '?') {
      if (mode === 'named') {
        throw new Error('No se pueden mezclar placeholders nombrados y posicionales en la misma consulta.');
      }
      mode = 'positional';
      if (positionalIndex >= positional.length) {
        throw new Error('Faltan parámetros posicionales para la consulta.');
      }
      values.push(positional[positionalIndex]);
      positionalIndex += 1;
      out += `$${values.length}`;
      continue;
    }

    out += ch;
  }

  return { sql: out, params: values };
}

function shouldReturnInsertedId(sql) {
  return /^\s*insert\b/i.test(sql) && !/\breturning\b/i.test(sql);
}

function createPgDb(connectionString) {
  const worker = new Worker(path.join(__dirname, 'pg-sync-worker.js'));
  const { port1, port2 } = new MessageChannel();
  const waitView = new Int32Array(new SharedArrayBuffer(4));
  let nextId = 1;

  port1.start();
  worker.postMessage({ type: 'init', port: port2, connectionString }, [port2]);

  function request(type, payload = {}) {
    const id = nextId;
    nextId += 1;
    port1.postMessage({ id, type, ...payload });

    while (true) {
      const received = receiveMessageOnPort(port1);
      if (received) {
        const message = received.message;
        if (message.id !== id) {
          continue;
        }
        if (message.ok) {
          return message.result;
        }
        const error = new Error(message.error || 'Error en PostgreSQL');
        error.cause = message.error;
        throw error;
      }

      Atomics.wait(waitView, 0, 0, 50);
    }
  }

  function prepare(sql) {
    return {
      run: (...params) => {
        const compiled = compileSql(sql, params);
        const querySql = shouldReturnInsertedId(sql) ? `${compiled.sql} RETURNING id` : compiled.sql;
        const result = request('query', { sql: querySql, params: compiled.params });
        if (shouldReturnInsertedId(sql)) {
          return {
            lastInsertRowid: result.rows[0]?.id ?? null,
            changes: result.rowCount ?? 0
          };
        }
        return { changes: result.rowCount ?? 0 };
      },
      get: (...params) => {
        const compiled = compileSql(sql, params);
        const result = request('query', { sql: compiled.sql, params: compiled.params });
        return result.rows[0];
      },
      all: (...params) => {
        const compiled = compileSql(sql, params);
        const result = request('query', { sql: compiled.sql, params: compiled.params });
        return result.rows;
      }
    };
  }

  return {
    exec: (sql) => {
      request('query', { sql, params: [] });
    },
    prepare,
    transaction: (fn) => (...args) => {
      request('begin');
      try {
        const result = fn(...args);
        request('commit');
        return result;
      } catch (error) {
        try {
          request('rollback');
        } catch (_) {
          // Ignore rollback errors and rethrow the original failure.
        }
        throw error;
      }
    },
    close: () => {
      try {
        request('close');
      } finally {
        worker.terminate();
      }
    }
  };
}

module.exports = {
  createPgDb
};
