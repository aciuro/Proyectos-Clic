FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

RUN mkdir -p /data/uploads

ENV DATA_DIR=/data

EXPOSE 3000

CMD ["npm", "start"]
