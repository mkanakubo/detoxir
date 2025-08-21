# Multi-stage build for NestJS Backend with pnpm

# Stage 1: Build stage
FROM node:20-alpine AS builder

# Enable corepack for pnpm
RUN corepack enable

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Stage 2: Production stage
FROM node:20-alpine AS production

# Enable corepack for pnpm
RUN corepack enable

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile && pnpm store prune

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy any additional files if needed (like .env files, config files)
# COPY --from=builder /app/.env* ./

# Copy Prisma schema for migrations
COPY --from=builder /app/prisma ./prisma

# Install Prisma Client for production and SQLite support
RUN pnpm add @prisma/client prisma sqlite3 && pnpm prisma generate

# Create data directory for SQLite
RUN mkdir -p /app/data && chown -R nestjs:nodejs /app/data

# Change ownership to non-root user
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expose the port that the app runs on (Cloud Run uses PORT env var)
EXPOSE 3001

# Health check optimized for Cloud Run
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-3001}/health || exit 1

# Start the application
CMD ["node", "dist/main"]
