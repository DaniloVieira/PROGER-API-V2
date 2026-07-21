# ─── Build Stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Instala dependências primeiro (cache layer)
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Copia código fonte e faz o build
COPY . .
RUN npm run build

# Remove devDependencies para reduzir tamanho
RUN npm prune --production

# ─── Production Stage ────────────────────────────────────────────────────────
FROM node:20-alpine AS production

# Instala Oracle Instant Client para oracledb
RUN apk add --no-cache libaio curl && \
    mkdir -p /opt/oracle && \
    cd /opt/oracle && \
    curl -sL https://download.oracle.com/otn_software/linux/instantclient/199000/instantclient-basic-linux.x64-19.9.0.0.0dbru.zip -o instantclient.zip && \
    unzip instantclient.zip && \
    mv instantclient_19_9 instantclient && \
    rm instantclient.zip && \
    echo /opt/oracle/instantclient > /etc/ld.so.conf.d/oracle-instantclient.conf && \
    ldconfig

WORKDIR /app

# Copia apenas o necessário do build stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production
ENV LD_LIBRARY_PATH=/opt/oracle/instantclient

EXPOSE 3000

CMD ["node", "dist/main.js"]