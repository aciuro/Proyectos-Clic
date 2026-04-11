# Guia Del Proyecto De Kinesiologia

Esta guia esta pensada para cualquier persona nueva que llegue al repo y necesite entender rapido que parte esta viva, donde tocar cada cosa y que trampas hay hoy.

No es una guia teorica. Es un mapa de trabajo para poder hacer cambios sin romper el sistema por confusion de contexto.

## 1. Que es este repo hoy

El repo nacio como un bot de WhatsApp para registrar gastos en Google Sheets.

Con el tiempo se le agregaron varias capas mas:

- Un backend Express para un modulo de kinesiologia
- Un frontend React/Vite para administracion y portal del paciente
- Un WebSocket para el chat web
- Un chat interno tipo "Claude" con acceso al sistema

Eso significa que hoy el repo es un sistema mixto:

- Parte 1: bot de WhatsApp + Google Sheets
- Parte 2: sistema web de kinesiologia
- Parte 3: chat interno por WebSocket

La app de kinesiologia no vive separada del resto. Se monta desde el servidor principal.

## 2. Cual es la ruta canonica y cual es la copia duplicada

Hay dos lugares con codigo de kinesiologia:

- Ruta activa/canonica:
  - `src/`
  - `client/`
- Ruta duplicada:
  - `kinesiologia/`

La app real se levanta desde `src/index.js`, que monta:

- `app.use('/api/kine', kineRoutes)`
- `express.static('../client/dist')`
- WebSocket del chat

Por eso, salvo que haya una razon muy puntual, los cambios deberian hacerse en:

- `src/*`
- `client/*`

La carpeta `kinesiologia/` hoy funciona mas como copia o snapshot de trabajo que como entrypoint real.

## 3. Como arranca el sistema

### Backend principal

Archivo clave:

- `src/index.js`

Responsabilidades:

- Levantar el bot de WhatsApp
- Procesar mensajes del bot de gastos
- Montar la API de kinesiologia
- Servir el frontend compilado
- Exponer `/uploads`
- Abrir el WebSocket para el chat web y para `KineClaude`

### Frontend

Entry del frontend:

- `client/src/main.jsx`

Rutas principales:

- `/kine/*` -> modulo de kinesiologia
- `/` -> redirige a `/kine`
- `/*` -> otra UI del proyecto original (`App.jsx`)

### API de kinesiologia

Router:

- `src/kine-routes.js`

Base de datos:

- `src/kine-db.js`

### Persistencia

La base SQLite se guarda en:

- `path.join(process.env.DATA_DIR || raiz_del_repo, 'kine.db')`

En Railway se espera usar:

- `DATA_DIR=/data`

## 4. Mapa rapido de archivos

### Backend kinesiologia

- `src/index.js`
  - servidor principal
  - Express
  - WebSocket
  - montaje de `/api/kine`
  - frontend estatico

- `src/kine-routes.js`
  - login
  - auth JWT
  - CRUDs de pacientes, turnos, ejercicios, motivos, evoluciones, estudios, documentos
  - portal paciente

- `src/kine-db.js`
  - schema SQLite
  - migraciones simples con `ALTER TABLE`
  - queries
  - seed de ejercicios
  - usuario admin por defecto

- `src/claude-chat.js`
  - logica del chat interno del panel

### Frontend kinesiologia

- `client/src/kine/KineApp.jsx`
  - decide si mostrar layout admin o portal de paciente

- `client/src/kine/Login.jsx`
  - login

- `client/src/kine/Dashboard.jsx`
  - metricas y proximos turnos

- `client/src/kine/Pacientes.jsx`
  - listado de pacientes
  - alta/edicion
  - creacion de acceso para portal

- `client/src/kine/PacienteDetalle.jsx`
  - pantalla mas importante del sistema
  - motivos
  - evoluciones
  - saldo
  - estudios
  - ejercicios por sesion
  - acciones de cobro

- `client/src/kine/Agenda.jsx`
  - calendario de turnos

- `client/src/kine/Ejercicios.jsx`
  - ABM de ejercicios

- `client/src/kine/PortalPaciente.jsx`
  - vista paciente
  - ejercicios de la ultima evolucion
  - overlay de deuda

- `client/src/kine/KineClaude.jsx`
  - chat del asistente por WebSocket

- `client/src/kine/api.js`
  - wrapper de fetch para `/api/kine`

- `client/src/kine/kine.css`
  - estilos del modulo completo

## 5. Modelo mental del dominio

El sistema mezcla dos modelos clinicos.

### Modelo legacy

Tablas:

- `lesiones`
- `sesiones`

Este modelo se usa todavia en varias queries y en partes del dashboard.

### Modelo mas nuevo / operativo

Tablas:

- `motivos`
- `evoluciones`
- `estudios`

Este es el modelo que hoy domina:

- seguimiento clinico
- cobro por sesion
- saldo del paciente
- ejercicios mostrados en el portal paciente

### Otras tablas

- `usuarios`
  - login y roles

- `pacientes`
  - ficha del paciente
  - puede estar vinculada a un `usuario_id`

- `turnos`
  - agenda

- `documentos`
  - archivos generales del paciente

- `ejercicios`
  - catalogo global

- `paciente_ejercicios`
  - ejercicios asignados directamente a un paciente

## 6. Relaciones de datos importantes

- `usuarios (1) -> (0..1) pacientes`
  - un usuario paciente puede estar vinculado a una ficha de paciente

- `pacientes (1) -> (N) motivos`
- `motivos (1) -> (N) evoluciones`
- `motivos (1) -> (N) estudios`

- `pacientes (1) -> (N) turnos`
- `pacientes (1) -> (N) documentos`

- `pacientes (1) -> (N) paciente_ejercicios`
- `ejercicios (1) -> (N) paciente_ejercicios`

- `pacientes (1) -> (N) lesiones`
- `lesiones (1) -> (N) sesiones`

## 7. Flujo funcional real

### 7.1 Login

1. El usuario entra al frontend
2. `Login.jsx` hace `POST /api/kine/login`
3. El backend responde:
   - `token`
   - `usuario`
   - `paciente` si el rol es `paciente`
4. El token se guarda en `localStorage` como `kine_token`
5. `KineApp.jsx` decide que layout mostrar

### 7.2 Alta de paciente

1. El admin crea un paciente desde `Pacientes.jsx`
2. `POST /api/kine/pacientes`
3. Si el paciente tiene email:
   - se crea usuario automaticamente o
   - se vincula uno ya existente
4. Ese usuario puede entrar al portal

### 7.3 Seguimiento clinico actual

1. El admin abre `PacienteDetalle.jsx`
2. Crea o edita un `motivo`
3. Dentro del motivo registra `evoluciones`
4. Cada evolucion puede guardar:
   - fecha
   - notas
   - dolor
   - tecnicas
   - monto cobrado
   - pagado
   - `tecnicas_sesion` como JSON
   - `ejercicios_sesion` como JSON

### 7.4 Portal del paciente

El portal no muestra toda la historia.

Hoy toma:

- la ultima evolucion del paciente
- los ejercicios guardados en `ejercicios_sesion`
- el saldo pendiente

Si hay deuda:

- se muestra un overlay de bloqueo
- el contenido queda visible pero bloqueado visualmente

### 7.5 Agenda

La agenda usa la tabla `turnos` y permite:

- crear
- editar
- cancelar
- confirmar
- marcar realizado

### 7.6 Chat interno "Claude"

La pantalla `KineClaude.jsx` abre un WebSocket contra el mismo host.

Ese socket conversa con:

- `src/index.js`
- `src/claude-chat.js`

No usa la API REST de kinesiologia. Usa eventos por WebSocket.

## 8. API de kinesiologia

Base:

- `/api/kine`

### Auth

- `POST /login`
- `GET /me`
- `GET /health`

### Pacientes

- `GET /pacientes`
- `GET /pacientes/:id`
- `POST /pacientes`
- `PUT /pacientes/:id`
- `DELETE /pacientes/:id`
- `POST /pacientes/:id/crear-acceso`

### Lesiones y sesiones

- `GET /pacientes/:id/lesiones`
- `POST /lesiones`
- `PUT /lesiones/:id`
- `DELETE /lesiones/:id`
- `GET /lesiones/:id/sesiones`
- `POST /sesiones`
- `PUT /sesiones/:id`
- `DELETE /sesiones/:id`

### Ejercicios

- `GET /ejercicios`
- `POST /ejercicios`
- `PUT /ejercicios/:id`
- `DELETE /ejercicios/:id`

### Dashboard y agenda

- `GET /dashboard`
- `GET /turnos`
- `POST /turnos`
- `PUT /turnos/:id`
- `DELETE /turnos/:id`

### Documentos

- `GET /pacientes/:id/documentos`
- `POST /pacientes/:id/documentos`
- `GET /documentos/:id/descargar`
- `DELETE /documentos/:id`

### Motivos, evoluciones y cobros

- `GET /pacientes/:id/motivos`
- `POST /pacientes/:id/motivos`
- `PUT /motivos/:id`
- `DELETE /motivos/:id`
- `GET /motivos/:id/evoluciones`
- `POST /motivos/:id/evoluciones`
- `PUT /evoluciones/:id`
- `DELETE /evoluciones/:id`
- `PATCH /evoluciones/:id/pagar`
- `POST /pacientes/:id/pagar-todo`
- `GET /pacientes/:id/saldo`

### Estudios

- `GET /motivos/:id/estudios`
- `POST /motivos/:id/estudios`
- `GET /estudios/:id/descargar`
- `DELETE /estudios/:id`

### Ejercicios del paciente

- `GET /pacientes/:id/ejercicios`
- `POST /pacientes/:id/ejercicios`
- `DELETE /paciente-ejercicios/:id`
- `GET /pacientes/:id/ejercicios-gimnasio`

## 9. Que pantalla usa que fuente de datos

### `Dashboard.jsx`

Consume:

- `GET /dashboard`

Ojo: varias metricas salen de `lesiones` y `sesiones`, no del modelo `motivos/evoluciones`.

### `Pacientes.jsx`

Consume:

- `GET /pacientes`
- `POST /pacientes`
- `PUT /pacientes/:id`
- `DELETE /pacientes/:id`
- `POST /pacientes/:id/crear-acceso`

### `PacienteDetalle.jsx`

Consume principalmente:

- `GET /pacientes/:id`
- `GET /pacientes/:id/motivos`
- `GET /pacientes/:id/saldo`
- `GET /motivos/:id/evoluciones`
- `POST /motivos/:id/evoluciones`
- `PUT /evoluciones/:id`
- `PATCH /evoluciones/:id/pagar`
- `POST /pacientes/:id/pagar-todo`
- `GET /motivos/:id/estudios`
- `POST /motivos/:id/estudios`
- `GET /ejercicios`

Si una feature toca seguimiento clinico, probablemente termine aca.

### `Agenda.jsx`

Consume:

- `GET /turnos`
- `POST /turnos`
- `PUT /turnos/:id`
- `DELETE /turnos/:id`
- `GET /pacientes`

### `Ejercicios.jsx`

Consume:

- `GET /ejercicios`
- `POST /ejercicios`
- `PUT /ejercicios/:id`
- `DELETE /ejercicios/:id`

### `PortalPaciente.jsx`

Consume:

- `GET /pacientes/:id/ejercicios-gimnasio`
- `GET /pacientes/:id/saldo`

## 10. Donde tocar segun el cambio

### Quiero cambiar login o permisos

Tocar:

- `src/kine-routes.js`
- `client/src/kine/Login.jsx`
- `client/src/kine/KineApp.jsx`

### Quiero agregar un campo a pacientes

Tocar:

- `src/kine-db.js`
  - schema
  - migracion
  - queries `insertPaciente`, `updatePaciente`, `getPaciente`, `getPacientes`
- `src/kine-routes.js`
  - recibir y devolver el campo
- `client/src/kine/Pacientes.jsx`
- `client/src/kine/PacienteDetalle.jsx` si debe verse ahi

### Quiero cambiar la ficha clinica

Tocar:

- `src/kine-db.js`
- `src/kine-routes.js`
- `client/src/kine/PacienteDetalle.jsx`

### Quiero cambiar deuda, cobros o saldo

Tocar:

- `src/kine-db.js`
  - `getSaldoPaciente`
  - `pagarTodasEvoluciones`
  - queries relacionadas
- `src/kine-routes.js`
- `client/src/kine/PacienteDetalle.jsx`
- `client/src/kine/PortalPaciente.jsx`

### Quiero cambiar agenda o turnos

Tocar:

- `src/kine-db.js`
- `src/kine-routes.js`
- `client/src/kine/Agenda.jsx`

### Quiero cambiar el portal del paciente

Tocar:

- `client/src/kine/PortalPaciente.jsx`
- `src/kine-routes.js`
- `src/kine-db.js`

### Quiero cambiar el catalogo de ejercicios

Tocar:

- `client/src/kine/Ejercicios.jsx`
- `src/kine-routes.js`
- `src/kine-db.js`

### Quiero cambiar el chat interno

Tocar:

- `client/src/kine/KineClaude.jsx`
- `src/claude-chat.js`
- `src/index.js`

## 11. Deuda tecnica y trampas importantes

Esta seccion es probablemente la mas valiosa para alguien nuevo.

### 11.1 Hay codigo duplicado

Existe una copia de kinesiologia dentro de `kinesiologia/`.

Riesgo:

- tocar archivos ahi y que el cambio no impacte la app real

Regla practica:

- trabajar en `src/` y `client/`, no en `kinesiologia/`

### 11.2 Conviven dos modelos clinicos

Hay dos mundos:

- `lesiones/sesiones`
- `motivos/evoluciones`

Riesgo:

- cambiar una pantalla pensando que usa el modelo nuevo cuando en realidad sigue leyendo el viejo

Ejemplos:

- dashboard usa `sesiones`
- deuda y portal paciente usan `evoluciones`

### 11.3 El seed de ejercicios se ejecuta en cada arranque

En `src/kine-db.js` hay un bloque que:

- hace `DELETE FROM ejercicios`
- vuelve a insertar un seed enorme

Riesgo muy alto:

- se pierden ejercicios creados o editados a mano
- pueden romperse relaciones con `paciente_ejercicios`
- por `ON DELETE CASCADE` se pueden borrar asignaciones al paciente

Antes de tocar ejercicios en serio, esto deberia revisarse.

### 11.4 El frontend de Vite no tiene proxy

`client/vite.config.js` no define proxy.

Riesgo:

- `npm run dev` en `client/` por separado no va a pegarle bien a `/api/kine` salvo que se monte detras del mismo host o se agregue proxy

En la practica, el flujo mas real del sistema es:

- compilar `client`
- servirlo desde Express

### 11.5 Uploads mezclan dos estrategias de path

`src/index.js` sirve uploads usando `DATA_DIR`.

Pero en `src/kine-routes.js`, para descargar o borrar archivos se usa `path.join(__dirname, '../uploads/', ...)`.

Riesgo:

- en Railway o con `DATA_DIR=/data`, servir archivos y descargarlos pueden no apuntar al mismo lugar

### 11.6 El README principal esta desactualizado respecto al modulo web

El `README.md` sigue describiendo sobre todo el bot de gastos.

El modulo de kinesiologia existe, pero no esta explicado ahi con suficiente contexto operativo.

### 11.7 Hay mezcla de campos legacy en pacientes

La tabla `pacientes` tiene campos tipo:

- `fecha_nac`
- `telefono`

Pero tambien hay migraciones y queries que trabajan con:

- `edad`
- `celular`

Riesgo:

- agregar o editar campos sin mirar schema + migraciones + forms

## 12. Credenciales y defaults importantes

En `src/kine-db.js` se crea un admin por defecto si no existe ninguno:

- email: `augusto@ciuro.com`
- password inicial: `admin123`

Ademas, al crear pacientes con email, el backend puede generar acceso automaticamente.

## 13. Como correrlo localmente

### Backend

Desde la raiz:

```bash
npm install
npm start
```

### Frontend

Desde `client/`:

```bash
npm install
npm run build
```

El backend sirve lo compilado desde:

- `client/dist`

### Variables utiles

- `PORT`
- `DATA_DIR`
- `JWT_SECRET`
- `WHATSAPP_GROUP_ID`
- `GOOGLE_SHEET_ID`
- `GOOGLE_CREDENTIALS`

## 14. Como pensar un cambio sin perderse

Si llegas nuevo, este orden ayuda:

1. Mirar `src/index.js` para entender el montaje general
2. Confirmar si el cambio pertenece al modulo web o al bot
3. Si es web, trabajar en `src/kine-routes.js` + `src/kine-db.js` + el componente React puntual
4. Si toca pacientes o seguimiento, revisar `PacienteDetalle.jsx`
5. Si toca metricas, revisar si vienen de `sesiones` o de `evoluciones`
6. Si toca ejercicios, revisar primero el seed de `src/kine-db.js`
7. Verificar siempre si estas tocando la ruta canonica y no la copia `kinesiologia/`

## 15. Recetas rapidas

### Agregar una nueva metrica al dashboard

1. Crear query en `src/kine-db.js`
2. Exponerla en `src/kine-routes.js` dentro de `/dashboard`
3. Pintarla en `client/src/kine/Dashboard.jsx`

### Agregar un nuevo campo en evoluciones

1. Agregar columna o migracion en `src/kine-db.js`
2. Actualizar `insertEvolucion`, `updateEvolucion`, `getEvolucionesByMotivo`
3. Ajustar endpoints en `src/kine-routes.js`
4. Ajustar modal y render en `client/src/kine/PacienteDetalle.jsx`

### Cambiar que ve el paciente en su portal

1. Revisar `GET /pacientes/:id/ejercicios-gimnasio`
2. Revisar `getUltimaEvolucionPaciente` en `src/kine-db.js`
3. Cambiar `PortalPaciente.jsx`

## 16. Resumen ejecutivo para quien entra por primera vez

Si solo te llevas 5 ideas, que sean estas:

1. La app de kinesiologia real sale de `src/` y `client/`
2. `kinesiologia/` esta duplicada y no deberia ser tu primer lugar de edicion
3. `PacienteDetalle.jsx` es la pantalla central del negocio
4. Hay dos modelos clinicos conviviendo: `lesiones/sesiones` y `motivos/evoluciones`
5. El seed de ejercicios en `src/kine-db.js` hoy es un punto de riesgo alto

## 17. Recomendacion de mantenimiento

Antes de seguir agregando features grandes, convendria encarar al menos estas limpiezas:

- definir una sola ruta canonica y eliminar duplicados
- consolidar el modelo clinico en una sola capa
- sacar el seed destructivo de ejercicios del arranque
- unificar el manejo de uploads con `DATA_DIR`
- actualizar el README principal para reflejar el sistema real

Mientras eso no pase, cualquier cambio deberia hacerse con mucho cuidado y revisando siempre de que capa vienen los datos.
