# Этап 1: Сборка приложения
FROM node:20-alpine AS builder

WORKDIR /app

COPY . .

RUN npm ci

RUN npm run build

EXPOSE 4173

CMD ["npm", "run", "preview"]