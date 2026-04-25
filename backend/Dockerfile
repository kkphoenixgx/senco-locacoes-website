# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Instala dependências de build necessárias para módulos nativos (se houver)
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production
FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

# Copia apenas o necessário do stage anterior
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist-prod ./dist-prod

# Instala apenas dependências de produção
# (Isso é importante se houver módulos nativos que não foram buildados no bundle)
RUN npm ci --only=production && npm cache clean --force

# Cria o diretório de uploads e define as permissões
RUN mkdir -p uploads && chown node:node uploads

# Usa um usuário não-root para segurança
USER node

EXPOSE 3000

# O comando 'start' já usa 'node -r dotenv/config dist-prod/server.js'
CMD ["npm", "run", "start"]
