# Backend EDC Dockerfile
# Multi-stage build for production deployment

# ============================================================
# Stage 1: Build
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy source code
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript
RUN npm run build

# ============================================================
# Stage 2: Production
# ============================================================
FROM node:20-alpine AS production

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files and install production dependencies only
COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# Copy built JavaScript files
COPY --from=builder /app/dist ./dist

# Set ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Environment variables (can be overridden at runtime)
ENV NODE_ENV=production
ENV PORT=3002
ENV BACKEND_MODE=hybrid
ENV EDC_API_KEY=password
ENV CONSUMER_MANAGEMENT_URL=http://consumer-controlplane:8081
ENV CONSUMER_DSP_URL=http://consumer-controlplane:8082/api/dsp
ENV CONSUMER_IDENTITY_HUB_URL=http://consumer-identityhub:7082
ENV PROVIDER_MANAGEMENT_URL=http://provider-controlplane:8191
ENV PROVIDER_DSP_URL=http://provider-controlplane:8192/api/dsp
ENV PROVIDER_IDENTITY_HUB_URL=http://provider-identityhub:7092
ENV PROVIDER_PARTICIPANT_ID=provider
ENV MOCK_BACKEND_URL=http://backend-mock:3001

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3002/health || exit 1

# Start the server
CMD ["node", "dist/server.js"]
