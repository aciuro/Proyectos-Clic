/**
 * Bot de WhatsApp para registro de gastos compartidos.
 *
 * Escucha mensajes en un grupo de WhatsApp, parsea gastos
 * de texto libre y los registra en Google Sheets.
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const express = require('express');
const { WebSocketServer } = require('ws');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const sheets = require('./sheets');
const { parseGasto, parseCaja, resolverSocio } = require('./parser');

const CARPETA_COMPROBANTES = 'C:\\Users\\augus\\OneDrive\\Desktop\\Clic Marzo26\\Comprobantes';

// ─── Configuración ───────────────────────────────────────────
const GROUP_ID = process.env.WHATSAPP_GROUP_ID;
const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const GOOGLE_CREDENTIALS = process.env.GOOGLE_CREDENTIALS;

// Meses en español para el comando !total
const MESES = {
  enero: 1, febrero: 2, marzo: 3, abril: 4,
  mayo: 5, junio: 6, julio: 7, agosto: 8,
  septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12,
};

// ─── Inicialización del cliente WhatsApp ─────────────────────
const client = new Client({
  authStrategy: new LocalAuth({ dataPath: '/app/.wwebjs_auth' }),
  puppeteer: {
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  },
});

// ─── Eventos del cliente ─────────────────────────────────────

client.on('qr', (qr) => {
  console.log('\n📱 Escaneá este QR con WhatsApp:\n');
  qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
  console.log('\n✅ Bot conectado y listo!\n');

  // Imprimir grupos disponibles para encontrar el ID
  if (!GROUP_ID) {
    console.log('⚠️  WHATSAPP_GROUP_ID no configurado. Grupos disponibles:\n');
    const chats = await client.getChats();
    const groups = chats.filter(c => c.isGroup);
    groups.forEach(g => {
      console.log(`  📌 "${g.name}" → ID: ${g.id._serialized}`);
    });
    console.log('\nCopiá el ID del grupo y ponelo en .env como WHATSAPP_GROUP_ID\n');
  }
});

client.on('auth_failure', (msg) => {
  console.error('❌ Error de autenticación:', msg);
});

client.on('disconnected', (reason) => {
  console.log('🔌 Bot desconectado:', reason);
});

// ─── Servidor WebSocket para el frontend ─────────────────────

const app = express();
app.use(express.static(path.join(__dirname, '../client/dist')));
const server = app.listen(3000, () => console.log('🌐 Frontend en http://localhost:3000'));
const wss = new WebSocketServer({ server });

function broadcast(evento) {
  const data = JSON.stringify({ ...evento, timestamp: new Date().toISOString() });
  wss.clients.forEach(ws => {
    if (ws.readyState === ws.OPEN) ws.send(data);
  });
}

// ─── Estado de confirmaciones pendientes ─────────────────────
// chatId → { archivos, contactos, caption }
const confirmacionesPendientes = new Map();

// ─── Handler principal de mensajes ───────────────────────────

client.on('message', async (msg) => {
  try {
    // Responder en el grupo configurado O en chats individuales
    const chat = await msg.getChat();
    if (chat.isGroup && GROUP_ID && chat.id._serialized !== GROUP_ID) return;

    const texto = msg.body.trim();
    if (!texto) return;

    // Verificar si hay una confirmación pendiente para este chat
    if (confirmacionesPendientes.has(chat.id._serialized)) {
      const pendiente = confirmacionesPendientes.get(chat.id._serialized);
      if (/^(sí|si|dale|ok|yes|confirmar|confirma|enviar|enviá|va|listo)\b/i.test(texto)) {
        confirmacionesPendientes.delete(chat.id._serialized);
        await ejecutarEnvios(chat, pendiente.archivos, pendiente.contactos, pendiente.caption);
      } else if (/^(no|cancelar|cancela|parar|para)\b/i.test(texto)) {
        confirmacionesPendientes.delete(chat.id._serialized);
        await chat.sendMessage('❌ Envío cancelado.');
      }
      return;
    }

    // Solo responder si el mensaje empieza con "Mosca" (case insensitive)
    if (!/^mosca\b/i.test(texto)) return;

    // Obtener nombre del contacto
    const contact = await msg.getContact();
    const socio = contact.pushname || contact.name || msg.author || 'Desconocido';

    // Quitar "Mosca" del inicio y procesar lo que sigue
    const cuerpo = texto.replace(/^mosca\s*/i, '').trim();
    if (!cuerpo) return;

    // Procesar comandos
    if (cuerpo.startsWith('!')) {
      await handleComando(chat, cuerpo, socio);
      return;
    }

    // Detectar intención de enviar comprobantes
    const quiereEnviar = /envi/i.test(cuerpo);
    const mencionaComprobante = /comprobante|transfer|pago|archivo/i.test(cuerpo);
    const mencionaTodos = /\btodos\b|\btodo\b/i.test(cuerpo);

    if (quiereEnviar && mencionaComprobante) {
      // Extraer mensaje personalizado: "con el mensaje ..." o "diciendo ..." (con o sin comillas)
      const matchMensaje = cuerpo.match(/(?:con (?:el )?mensaje|mensaje|diciendo|que diga)[:\s]+["""''](.+?)["""'']/i)
        || cuerpo.match(/(?:con (?:el )?mensaje|mensaje|diciendo|que diga)[:\s]+(.+)$/i);
      const caption = matchMensaje ? matchMensaje[1].trim() : null;

      if (mencionaTodos) {
        await cmdEnviarComprobantes(chat, null, caption);
        return;
      }

      // Leer nombres disponibles en la carpeta
      let archivosDisponibles = [];
      if (fs.existsSync(CARPETA_COMPROBANTES)) {
        archivosDisponibles = fs.readdirSync(CARPETA_COMPROBANTES)
          .filter(f => ['.pdf', '.jpg', '.jpeg', '.png'].includes(path.extname(f).toLowerCase()))
          .map(f => path.basename(f, path.extname(f)).trim());
      }

      // Buscar qué nombres del mensaje coinciden con archivos disponibles
      const cuerpoNorm = cuerpo.toLowerCase();
      const nombresEncontrados = archivosDisponibles.filter(nombre => {
        const palabras = nombre.toLowerCase().split(/\s+/);
        const coincidencias = palabras.filter(p => p.length > 2 && cuerpoNorm.includes(p));
        return coincidencias.length >= 2;
      });

      if (nombresEncontrados.length > 0) {
        await cmdEnviarComprobantes(chat, nombresEncontrados, caption);
      } else {
        // No encontró nombres, preguntar a quién
        const lista = archivosDisponibles.length > 0
          ? `\n\nComprobantes disponibles:\n${archivosDisponibles.map(n => `  • ${n}`).join('\n')}`
          : '';
        await chat.sendMessage(`¿A quién le envío el comprobante?${lista}`);
      }
      return;
    }

    // Detectar si es para Mov de Caja o Gastos
    if (/\bmov(?:imiento)?\s+de\s+caja\b/i.test(cuerpo)) {
      const mov = parseCaja(cuerpo);
      if (mov) {
        broadcast({ tipo: 'mov_caja', estado: 'registrado', datos: mov, socio });
        await sheets.registrarMovCaja(mov);
        await chat.sendMessage(
          `✅ Mov de Caja registrado\n` +
          `${mov.ingresoEgreso === 'Ingreso' ? '📈' : '📉'} ${mov.ingresoEgreso || '—'}\n` +
          `💰 $${formatMonto(mov.monto)}\n` +
          `📝 ${mov.item}\n` +
          (mov.caja  ? `🗂️ Caja: ${mov.caja}\n`  : '') +
          (mov.sede  ? `📍 Sede: ${mov.sede}\n`   : '') +
          (mov.notas ? `📌 Notas: ${mov.notas}`   : '')
        );
      } else {
        await chat.sendMessage(`❓ No entendí el movimiento. Ejemplo:\nMosca mov de caja egreso 5000 Caja Oficina Central nafta`);
      }
      return;
    }

    // Intentar parsear como gasto
    const gasto = parseGasto(cuerpo, socio);
    if (gasto) {
      broadcast({ tipo: 'gasto', estado: 'registrado', datos: gasto });
      const id = await sheets.registrarGasto(gasto.socio, gasto.descripcion, gasto.monto);
      await chat.sendMessage(
        `✅ Registrado gasto #${id}\n` +
        `👤 ${gasto.socio}\n` +
        `📝 ${gasto.descripcion}\n` +
        `💰 $${formatMonto(gasto.monto)}`
      );
    } else {
      await chat.sendMessage(`❓ No entendí el monto. Ejemplo: Mosca almuerzo $150`);
    }
  } catch (err) {
    console.error('[Bot] Error procesando mensaje:', err.message);
  }
});

// ─── Handlers de comandos ────────────────────────────────────

async function handleComando(chat, texto, socio) {
  const parts = texto.toLowerCase().split(/\s+/);
  const comando = parts[0];

  switch (comando) {
    case '!resumen':
    case '!deuda':
      await cmdResumen(chat, socio);
      break;

    case '!total':
      await cmdTotal(chat, parts.slice(1).join(' '));
      break;

    case '!reembolsar':
      await cmdReembolsar(chat, parts[1]);
      break;

    case '!ultimos':
      await cmdUltimos(chat);
      break;

    case '!enviar':
      await cmdEnviarComprobantes(chat);
      break;

    case '!ayuda':
    case '!help':
      await cmdAyuda(chat);
      break;

    default:
      // Comando no reconocido — no hacer nada
      break;
  }
}

async function cmdResumen(chat, socio) {
  const { pendientes, total } = await sheets.obtenerResumenSocio(socio);

  if (pendientes.length === 0) {
    await chat.sendMessage(`✨ ${socio}: No tenés gastos pendientes de reembolso.`);
    return;
  }

  let msg = `📊 *Resumen de ${socio}*\n\n`;
  pendientes.forEach(g => {
    msg += `  #${g.id} | ${g.fecha} | ${g.descripcion} | $${formatMonto(g.monto)}\n`;
  });
  msg += `\n💰 *Total pendiente: $${formatMonto(total)}* (${pendientes.length} gastos)`;

  await chat.sendMessage(msg);
}

async function cmdTotal(chat, mesTexto) {
  let mes = null;
  let anio = null;

  if (mesTexto) {
    const mesNorm = mesTexto.toLowerCase().trim();
    mes = MESES[mesNorm];
    if (!mes) {
      await chat.sendMessage(`❓ No reconozco el mes "${mesTexto}". Usá: enero, febrero, marzo...`);
      return;
    }
  }

  const data = await sheets.obtenerTotalMes(mes, anio);
  const nombreMes = Object.keys(MESES).find(k => MESES[k] === data.mes) || '';

  let msg = `📊 *Total de gastos - ${nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1)} ${data.anio}*\n\n`;
  msg += `💰 Total: $${formatMonto(data.total)} (${data.cantidad} gastos)\n\n`;
  msg += `*Por socio:*\n`;

  Object.entries(data.porSocio)
    .sort((a, b) => b[1] - a[1])
    .forEach(([nombre, monto]) => {
      msg += `  👤 ${nombre}: $${formatMonto(monto)}\n`;
    });

  await chat.sendMessage(msg);
}

async function cmdReembolsar(chat, idStr) {
  const id = parseInt(idStr);
  if (isNaN(id)) {
    await chat.sendMessage('❓ Usá: !reembolsar [número de gasto]\nEjemplo: !reembolsar 5');
    return;
  }

  const gasto = await sheets.marcarReembolsado(id);
  if (!gasto) {
    await chat.sendMessage(`❌ No encontré el gasto #${id}`);
    return;
  }

  await chat.sendMessage(
    `✅ Gasto #${id} marcado como *REEMBOLSADO*\n` +
    `👤 ${gasto.socio} | ${gasto.descripcion} | $${formatMonto(gasto.monto)}`
  );
}

async function cmdUltimos(chat) {
  const ultimos = await sheets.obtenerUltimos(5);

  if (ultimos.length === 0) {
    await chat.sendMessage('📭 No hay gastos registrados todavía.');
    return;
  }

  let msg = '📋 *Últimos 5 gastos:*\n\n';
  ultimos.reverse().forEach(g => {
    const estado = g.estado === 'REEMBOLSADO' ? '✅' : '⏳';
    msg += `  ${estado} #${g.id} | ${g.fecha} | ${g.socio} | ${g.descripcion} | $${formatMonto(g.monto)}\n`;
  });

  await chat.sendMessage(msg);
}

async function cmdAyuda(chat) {
  await chat.sendMessage(
    `🤖 *Mosca - Bot de Gastos*\n\n` +
    `📝 *Registrar gasto:*\n` +
    `   Mosca almuerzo cliente $150\n` +
    `   Mosca taxi aeropuerto 80\n\n` +
    `📊 *Mosca !resumen* — Tus gastos pendientes de reembolso\n` +
    `📊 *Mosca !total* — Total de gastos del mes actual\n` +
    `📊 *Mosca !total marzo* — Total de un mes específico\n` +
    `✅ *Mosca !reembolsar 5* — Marcar gasto #5 como reembolsado\n` +
    `📋 *Mosca !ultimos* — Últimos 5 gastos registrados\n` +
    `📤 *Mosca !enviar* — Envía comprobantes de la carpeta a cada contacto\n` +
    `❓ *Mosca !ayuda* — Este mensaje`
  );
}

async function resolverContactos(archivos) {
  const todosContactos = (await client.getContacts()).filter(c => c.isMyContact);
  const contactos = Array.from(
    new Map(todosContactos.map(c => [c.id._serialized, c])).values()
  );

  const listos = [];
  const noEncontrados = [];
  const duplicados = [];

  for (const archivo of archivos) {
    const nombreArchivo = path.basename(archivo, path.extname(archivo)).trim().toLowerCase();
    const palabrasArchivo = nombreArchivo.split(/\s+/);

    let coincidencias = contactos.filter(c => {
      const nombre = (c.name || '').trim().toLowerCase();
      if (!nombre) return false;
      if (nombre === nombreArchivo) return true;
      const palabrasContacto = nombre.split(/\s+/);
      const coincidePalabras = palabrasContacto.filter(p => p.length > 2 && palabrasArchivo.includes(p));
      return coincidePalabras.length >= 2;
    });

    if (coincidencias.length === 0) {
      noEncontrados.push(archivo);
      continue;
    }

    if (coincidencias.length > 1) {
      const argentino = coincidencias.find(c => c.id.user.startsWith('549'));
      if (argentino) {
        coincidencias = [argentino];
      } else {
        const numeros = coincidencias.map(c => `  • +${c.id.user}`).join('\n');
        duplicados.push({ archivo, numeros });
        continue;
      }
    }

    listos.push({ archivo, contacto: coincidencias[0] });
  }

  return { listos, noEncontrados, duplicados };
}

async function cmdEnviarComprobantes(chat, nombresEspecificos = null, caption = null) {
  if (!fs.existsSync(CARPETA_COMPROBANTES)) {
    await chat.sendMessage(`❌ No encontré la carpeta:\n${CARPETA_COMPROBANTES}`);
    return;
  }

  let archivos = fs.readdirSync(CARPETA_COMPROBANTES).filter(f => {
    const ext = path.extname(f).toLowerCase();
    return ['.pdf', '.jpg', '.jpeg', '.png'].includes(ext);
  });

  if (nombresEspecificos && nombresEspecificos.length > 0) {
    const nombresNorm = nombresEspecificos.map(n => n.toLowerCase());
    archivos = archivos.filter(f =>
      nombresNorm.some(n => path.basename(f, path.extname(f)).trim().toLowerCase() === n)
    );
    if (archivos.length === 0) {
      await chat.sendMessage(`❌ No encontré archivos para: ${nombresEspecificos.join(', ')}`);
      return;
    }
  }

  if (archivos.length === 0) {
    await chat.sendMessage('📭 La carpeta de comprobantes está vacía.');
    return;
  }

  const { listos, noEncontrados, duplicados } = await resolverContactos(archivos);

  // Armar preview
  let preview = `📋 *Esto es lo que voy a enviar:*\n\n`;

  if (listos.length > 0) {
    preview += `✅ *Listo para enviar (${listos.length}):*\n`;
    listos.forEach(({ archivo, contacto }) => {
      preview += `  • ${path.basename(archivo, path.extname(archivo))} → ${contacto.name}\n`;
    });
    preview += '\n';
  }

  if (duplicados.length > 0) {
    preview += `⚠️ *Contacto duplicado (${duplicados.length}):*\n`;
    duplicados.forEach(d => preview += `  • ${d.archivo}:\n${d.numeros}\n`);
    preview += '\n';
  }

  if (noEncontrados.length > 0) {
    preview += `❌ *No encontré contacto para (${noEncontrados.length}):*\n`;
    noEncontrados.forEach(a => preview += `  • ${a}\n`);
    preview += '\n';
  }

  if (caption) {
    preview += `💬 *Mensaje:* ${caption}\n\n`;
  }

  if (listos.length === 0) {
    await chat.sendMessage(preview + 'No hay nada para enviar.');
    return;
  }

  preview += `¿Confirmo el envío? (sí / no)`;
  await chat.sendMessage(preview);

  broadcast({
    tipo: 'comprobantes_preview',
    estado: 'esperando_confirmacion',
    listos: listos.map(l => ({ archivo: l.archivo, contacto: l.contacto.name })),
    noEncontrados,
    duplicados: duplicados.map(d => d.archivo),
    caption,
  });

  // Guardar estado pendiente
  confirmacionesPendientes.set(chat.id._serialized, { archivos: listos.map(l => l.archivo), contactos: listos.map(l => l.contacto), caption });
}

async function ejecutarEnvios(chat, archivos, contactos, caption) {
  await chat.sendMessage('📤 Enviando...');
  broadcast({ tipo: 'comprobantes_envio', estado: 'iniciado', total: archivos.length });

  const enviados = [];
  const errores = [];

  for (let i = 0; i < archivos.length; i++) {
    try {
      const filePath = path.join(CARPETA_COMPROBANTES, archivos[i]);
      const media = MessageMedia.fromFilePath(filePath);
      await client.sendMessage(contactos[i].id._serialized, media, { caption: caption || undefined });
      enviados.push(archivos[i]);
      broadcast({ tipo: 'comprobantes_envio', estado: 'enviado', archivo: archivos[i], contacto: contactos[i].name, progreso: enviados.length, total: archivos.length });
    } catch (err) {
      errores.push(archivos[i]);
      broadcast({ tipo: 'comprobantes_envio', estado: 'error', archivo: archivos[i] });
    }
  }

  let resumen = `📊 *Resultado del envío:*\n\n`;
  if (enviados.length > 0) {
    resumen += `✅ *Enviados (${enviados.length}):*\n`;
    enviados.forEach(a => resumen += `  • ${a}\n`);
    resumen += '\n';
  }
  if (errores.length > 0) {
    resumen += `❌ *Errores (${errores.length}):*\n`;
    errores.forEach(a => resumen += `  • ${a}\n`);
  }

  broadcast({ tipo: 'comprobantes_envio', estado: 'finalizado', enviados, errores });
  await chat.sendMessage(resumen);
}

// ─── Utilidades ──────────────────────────────────────────────

function formatMonto(num) {
  return num.toLocaleString('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

// ─── Arranque ────────────────────────────────────────────────

async function main() {
  console.log('🚀 Iniciando Bot de Gastos...\n');

  if (!SHEET_ID || !GOOGLE_CREDENTIALS) {
    console.error('❌ Faltan variables de entorno. Revisá el archivo .env');
    console.error('   Necesitás: GOOGLE_SHEET_ID y GOOGLE_CREDENTIALS');
    process.exit(1);
  }

  // Conectar a Google Sheets
  await sheets.init(SHEET_ID, GOOGLE_CREDENTIALS);

  // Iniciar cliente de WhatsApp
  client.initialize();
}

main().catch(err => {
  console.error('❌ Error fatal:', err);
  process.exit(1);
});
