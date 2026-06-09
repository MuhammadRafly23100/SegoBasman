FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./
EXPOSE 3001

# Jalankan migrasi database lalu start aplikasi.
# Menggunakan node_modules/.bin/prisma (devDependency prisma ikut ter-copy dari builder).
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node dist/main.js"]
