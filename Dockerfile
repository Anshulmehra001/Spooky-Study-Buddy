# Multi-stage build for Spooky Study Buddy
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/
COPY shared/package*.json ./shared/

# Install dependencies
RUN npm ci --only=production --ignore-scripts

# Copy source code
COPY . .

# Build application
RUN npm run build:prod

# Production stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S spooky -u 1001 -G nodejs

# Set working directory
WORKDIR /app

# Copy built application with proper ownership
COPY --from=builder --chown=spooky:nodejs /app/server/dist ./server/dist
COPY --from=builder --chown=spooky:nodejs /app/client/dist ./client/dist
COPY --from=builder --chown=spooky:nodejs /app/server/package*.json ./server/
COPY --from=builder --chown=spooky:nodejs /app/node_modules ./node_modules

# Create necessary directories
RUN mkdir -p /app/server/uploads /app/server/data && \
    chown -R spooky:nodejs /app/server/uploads /app/server/data

# Switch to non-root user
USER spooky

# Expose port
EXPOSE 3001

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Start application with proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server/dist/index.js"]