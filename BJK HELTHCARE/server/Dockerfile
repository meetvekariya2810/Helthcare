# BJK HEALTHCARE DIGITAL BRAIN — PRODUCTION BACKEND DOCKERFILE
# Multi-stage lightweight build targeting Azure Container Apps / App Service

# Stage 1: Build & Dependencies
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install build dependencies
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Runtime Production Image
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

# Security: Run as non-root user
USER node

# Copy production node_modules and application code
COPY --chown=node:node --from=builder /usr/src/app/node_modules ./node_modules
COPY --chown=node:node . .

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

CMD ["node", "server.js"]
