# Use Node.js 18 Alpine as base image
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci --only=production && \
    npm install --save-dev @types/node @types/react typescript

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Generate Prisma client and build Next.js
RUN npx prisma generate && \
    npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/prisma/seed.ts ./prisma/seed.ts
COPY --from=builder /app/prisma/seed-katy.ts ./prisma/seed-katy.ts
COPY --from=builder /app/prisma/seed-data ./prisma/seed-data

# Copy startup script
COPY start.sh ./start.sh
RUN chmod +x ./start.sh

# Create data directory for SQLite
RUN mkdir -p /data && chown -R nextjs:nodejs /data

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["./start.sh"]
