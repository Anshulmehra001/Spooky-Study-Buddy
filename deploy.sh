#!/bin/bash

# Spooky Study Buddy Deployment Script
# This script builds and prepares the application for production deployment

set -e  # Exit on any error

echo "🎃 Starting Spooky Study Buddy deployment preparation..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${PURPLE}[DEPLOY]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required environment variables are set
check_environment() {
    print_status "Checking environment configuration..."
    
    if [ ! -f "server/.env" ]; then
        print_error "server/.env file not found!"
        print_warning "Please copy server/.env.example to server/.env and configure it"
        exit 1
    fi
    
    if [ ! -f "client/.env" ]; then
        print_warning "client/.env not found, using defaults"
    fi
    
    # Check if OpenAI API key is configured
    if ! grep -q "OPENAI_API_KEY=sk-" server/.env 2>/dev/null; then
        print_warning "OpenAI API key may not be configured properly"
        print_warning "Make sure to set OPENAI_API_KEY in server/.env"
    fi
    
    print_success "Environment check completed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed!"
        exit 1
    fi
    
    npm run install:all
    print_success "Dependencies installed"
}

# Run tests
run_tests() {
    print_status "Running tests..."
    
    # Run client tests
    print_status "Running client tests..."
    cd client && npm run test
    cd ..
    
    # Run server tests
    print_status "Running server tests..."
    cd server && npm run test
    cd ..
    
    print_success "All tests passed"
}

# Lint code
lint_code() {
    print_status "Linting code..."
    npm run lint
    print_success "Code linting completed"
}

# Build application
build_application() {
    print_status "Building application for production..."
    
    # Clean previous builds
    print_status "Cleaning previous builds..."
    rm -rf client/dist
    rm -rf server/dist
    
    # Build client and server
    npm run build
    
    print_success "Application built successfully"
}

# Create production environment files
create_production_env() {
    print_status "Creating production environment configuration..."
    
    # Create production server env
    cat > server/.env.production << EOF
# Production Environment Configuration
NODE_ENV=production
PORT=\${PORT:-3001}

# OpenAI API Configuration
OPENAI_API_KEY=\${OPENAI_API_KEY}

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# Story Storage Configuration
STORIES_RETENTION_DAYS=30
CLEANUP_INTERVAL_HOURS=6

# CORS Configuration
ALLOWED_ORIGINS=\${ALLOWED_ORIGINS:-*}

# Security
TRUST_PROXY=true
EOF

    # Create production client env
    cat > client/.env.production << EOF
# Production Client Configuration
VITE_API_URL=\${VITE_API_URL:-/api}
VITE_APP_NAME=Spooky Study Buddy
VITE_APP_VERSION=1.0.0
EOF

    print_success "Production environment files created"
}

# Create Docker configuration
create_docker_config() {
    print_status "Creating Docker configuration..."
    
    # Create Dockerfile
    cat > Dockerfile << 'EOF'
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
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S spooky -u 1001

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=builder --chown=spooky:nodejs /app/server/dist ./server/dist
COPY --from=builder --chown=spooky:nodejs /app/client/dist ./client/dist
COPY --from=builder --chown=spooky:nodejs /app/server/package*.json ./server/
COPY --from=builder --chown=spooky:nodejs /app/node_modules ./node_modules

# Create uploads directory
RUN mkdir -p /app/server/uploads && chown spooky:nodejs /app/server/uploads

# Switch to app user
USER spooky

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server/dist/index.js"]
EOF

    # Create docker-compose.yml
    cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  spooky-study-buddy:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ALLOWED_ORIGINS=${ALLOWED_ORIGINS:-*}
    volumes:
      - uploads:/app/server/uploads
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3001/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

volumes:
  uploads:
EOF

    # Create .dockerignore
    cat > .dockerignore << 'EOF'
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.env.local
.env.development
.env.test
.env.production
client/.env*
server/.env*
client/dist
server/dist
coverage
.nyc_output
.vscode
.idea
*.log
uploads
EOF

    print_success "Docker configuration created"
}

# Create deployment documentation
create_deployment_docs() {
    print_status "Creating deployment documentation..."
    
    cat > DEPLOYMENT.md << 'EOF'
# 🎃 Spooky Study Buddy - Deployment Guide

This guide covers different deployment options for Spooky Study Buddy.

## 🚀 Quick Deploy Options

### Option 1: Docker (Recommended)

1. **Build and run with Docker Compose:**
```bash
# Set environment variables
export OPENAI_API_KEY="your-api-key-here"
export ALLOWED_ORIGINS="https://yourdomain.com"

# Build and start
docker-compose up -d
```

2. **Access the application:**
- Application: http://localhost:3001
- Health check: http://localhost:3001/api/health

### Option 2: Node.js Direct

1. **Prepare environment:**
```bash
# Install dependencies and build
npm run install:all
npm run build

# Configure production environment
cp server/.env.example server/.env.production
# Edit server/.env.production with your settings
```

2. **Start production server:**
```bash
cd server
NODE_ENV=production npm start
```

### Option 3: Platform-as-a-Service (Heroku, Railway, etc.)

1. **Set environment variables in your platform:**
```
NODE_ENV=production
OPENAI_API_KEY=your-api-key-here
PORT=3001
ALLOWED_ORIGINS=https://yourdomain.com
```

2. **Deploy using platform-specific methods**

## 🔧 Environment Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key for AI features | `sk-...` |
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `3001` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `https://yourdomain.com` |

### Optional Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MAX_FILE_SIZE` | Max upload size in bytes | `10485760` (10MB) |
| `STORIES_RETENTION_DAYS` | Days to keep stories | `30` |
| `CLEANUP_INTERVAL_HOURS` | Cleanup frequency | `6` |

## 🏗️ Build Process

The build process creates optimized production bundles:

1. **Client Build** (`client/dist/`):
   - Optimized React bundle
   - Minified CSS and JavaScript
   - Static assets with cache headers

2. **Server Build** (`server/dist/`):
   - Compiled TypeScript to JavaScript
   - Optimized for Node.js runtime

## 🔍 Health Monitoring

### Health Check Endpoint
```
GET /api/health
```

Returns:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "version": "1.0.0"
}
```

### Monitoring Recommendations

1. **Application Monitoring:**
   - Monitor `/api/health` endpoint
   - Track response times for story generation
   - Monitor file upload success rates

2. **Resource Monitoring:**
   - CPU usage (story generation is CPU intensive)
   - Memory usage (file processing)
   - Disk space (uploaded files and stories)

3. **Error Monitoring:**
   - OpenAI API failures
   - File upload errors
   - Story generation timeouts

## 🔒 Security Considerations

### Production Security Checklist

- [ ] OpenAI API key is secure and not exposed
- [ ] CORS is configured for your domain only
- [ ] File upload limits are enforced
- [ ] HTTPS is enabled (recommended)
- [ ] Regular security updates applied

### File Security

- Uploaded files are automatically cleaned up
- File size limits prevent abuse
- Only text and PDF files are accepted
- No executable files are processed

## 🚨 Troubleshooting

### Common Issues

1. **OpenAI API Errors:**
   - Check API key validity
   - Verify API quota and billing
   - Monitor rate limits

2. **File Upload Issues:**
   - Check file size limits
   - Verify upload directory permissions
   - Monitor disk space

3. **Performance Issues:**
   - Story generation can take 10-30 seconds
   - Consider implementing request queuing for high load
   - Monitor memory usage during file processing

### Logs and Debugging

Enable debug logging:
```bash
DEBUG=spooky:* npm start
```

Key log patterns to monitor:
- Story generation requests and timing
- File upload success/failure
- OpenAI API response times
- Cleanup job execution

## 📊 Performance Optimization

### Recommended Settings

1. **For Low Traffic (< 100 users/day):**
   - Single instance deployment
   - Basic health monitoring
   - Daily cleanup jobs

2. **For Medium Traffic (100-1000 users/day):**
   - Load balancer with 2-3 instances
   - Redis for session storage (if needed)
   - Hourly cleanup jobs
   - CDN for static assets

3. **For High Traffic (> 1000 users/day):**
   - Auto-scaling deployment
   - Database for story persistence
   - Queue system for story generation
   - Advanced monitoring and alerting

## 🔄 Updates and Maintenance

### Regular Maintenance Tasks

1. **Weekly:**
   - Review error logs
   - Check disk usage
   - Verify backup processes

2. **Monthly:**
   - Update dependencies
   - Review security patches
   - Performance analysis

3. **Quarterly:**
   - Full security audit
   - Capacity planning review
   - Disaster recovery testing
EOF

    print_success "Deployment documentation created"
}

# Main deployment function
main() {
    echo "🎃👻🦇 Spooky Study Buddy Deployment Preparation 🦇👻🎃"
    echo ""
    
    # Run all preparation steps
    check_environment
    install_dependencies
    lint_code
    run_tests
    build_application
    create_production_env
    create_docker_config
    create_deployment_docs
    
    echo ""
    print_success "🎉 Deployment preparation completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "  1. Configure your OpenAI API key in server/.env.production"
    echo "  2. Choose your deployment method (see DEPLOYMENT.md)"
    echo "  3. Deploy using: docker-compose up -d"
    echo ""
    echo "🔗 Useful commands:"
    echo "  • Test locally: npm run dev"
    echo "  • Build only: npm run build"
    echo "  • Start production: cd server && NODE_ENV=production npm start"
    echo ""
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi