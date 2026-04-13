# Proyectos Clic

Monorepo con dos proyectos independientes, cada uno con su propio deploy en Railway.

## Proyectos

### `kinesiologia/`
Sistema de gestión para consultorio de kinesiología (rehabilitaplus.com).
- Backend: Node.js + Express + SQLite/Postgres
- Frontend: React (Vite), pre-buildeado en `client/dist/`
- Deploy: Railway, servicio `kinesiologia`

### `bot/`
Bot de WhatsApp para registro de gastos compartidos en Google Sheets.
- Node.js + whatsapp-web.js + Puppeteer
- Deploy: Railway, servicio `bot`

## Cómo trabajar

Cada proyecto es independiente. Para arrancar uno:

```bash
# Kinesiologia
cd kinesiologia
npm install
npm run dev

# Bot
cd bot
npm install
npm start
```

Cada uno tiene su propio `.env`, `Dockerfile` y `railway.toml`.
