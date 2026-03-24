# Multi-stage build for both API and worker
FROM node:20-alpine AS base

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY nest-cli.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# ============================================
# API Service Stage
# ============================================
FROM base AS api

WORKDIR /app

# Copy only production dependencies and build output
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built files
COPY --from=base /app/dist ./dist

# Create non-root user (optional but recommended)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

CMD ["node", "dist/api/main.js"]

# ============================================
# Worker Service Stage
# ============================================
FROM base AS worker

WORKDIR /app

# Copy only production dependencies and build output
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built files
COPY --from=base /app/dist ./dist

# Create non-root user (optional but recommended)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3001

CMD ["node", "dist/worker/main.js"]