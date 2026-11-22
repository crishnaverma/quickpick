# Stage 1: Build Frontend
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Production Server
FROM node:20-alpine AS server
WORKDIR /app
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install --omit=dev
COPY server/ ./
COPY --from=client-builder /app/client/dist /app/client/dist

# Generate Prisma Client
RUN npx prisma generate --schema=prisma/schema.postgresql.prisma

EXPOSE 5000
CMD ["node", "src/server.js"]
