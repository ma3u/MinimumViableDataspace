# Docker Name Exporter for macOS
# 
# Sidecar service that queries Docker API and exports container metrics
# with proper name labels, solving cAdvisor's name resolution issue on
# Docker Desktop for macOS.

FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY index.js ./

# Expose metrics port
EXPOSE 9417

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:9417/health || exit 1

# Note: Running as root is required to access Docker socket
# This is acceptable for a local development tool
CMD ["node", "index.js"]
