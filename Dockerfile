FROM node:20-slim

# Instalar dependencias de Chromium para Puppeteer
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-ipafont-gothic \
    fonts-freefont-ttf \
    python3 \
    make \
    g++ \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Configurar Puppeteer para usar Chromium del sistema
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# Forzar invalidacion de cache en cada deploy
ENV CACHE_BUST=2026-04-11-2230

# Copiar todo el código fuente
COPY . .

# Instalar dependencias del servidor
RUN npm ci --omit=dev

# Instalar dependencias del subproyecto de kinesiologia
RUN cd kinesiologia && npm ci --omit=dev

# Instalar dependencias y buildear el frontend
RUN cd client && npm ci
RUN cd client && npm run build

# Directorio para datos persistentes (montar volumen aquí en Railway)
RUN mkdir -p /data/uploads
RUN mkdir -p /app/.wwebjs_auth

ENV DATA_DIR=/data

EXPOSE 3000

CMD ["npm", "start"]
