# Use Node.js 20 Alpine as base image
FROM node:20-alpine

# Create app directory and set permissions for non-root user
WORKDIR /app
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the Next.js app
RUN npm run build

# Create data directory for SQLite
RUN mkdir -p /data && chown -R nextjs:nextjs /data

# Switch to non-root user
USER nextjs

# Fly sets PORT; default to 8080
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 8080

# Start via package.json (no start.sh)
CMD ["npm", "run", "start"]
