# 🎃 Spooky Study Buddy - Deployment Guide

This guide covers different deployment options for Spooky Study Buddy, from local development to production deployment.

## 🚀 Quick Deploy Options

### Option 1: Docker (Recommended)

**Prerequisites:**
- Docker and Docker Compose installed
- OpenAI API key

**Steps:**
1. **Clone and configure:**
```bash
git clone <repository-url>
cd spooky-study-buddy
cp server/.env.example server/.env
# Edit server/.env and add your OpenAI API key
```

2. **Build and run:**
```bash
# Set environment variables
export OPENAI_API_KEY="your-api-key-here"
export ALLOWED_ORIGINS="https://yourdomain.com"

# Build and start
docker-compose up --build -d
```

3. **Access the application:**
- Application: http://localhost:3001
- Health check: http://localhost:3001/api/health

### Option 2: Node.js Direct

**Prerequisites:**
- Node.js 18+
- npm or yarn
- OpenAI API key

**Steps:**
1. **Install and build:**
```bash
npm run install:all
npm run build:prod
```

2. **Configure environment:**
```bash
cp server/.env.example server/.env
# Edit server/.env with your settings
```

3. **Start production server:**
```bash
npm run start:prod
```

### Option 3: Platform-as-a-Service

**Supported Platforms:**
- Heroku
- Railway
- Render
- Vercel (frontend only)
- Netlify (frontend only)

**Environment Variables:**
```
NODE_ENV=production
OPENAI_API_KEY=your-api-key-here
PORT=3001
ALLOWED_ORIGINS=https://yourdomain.com
```

## 🔧 Environment Configuration

### Required Environment Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `OPENAI_API_KEY` | OpenAI API key for AI features | `sk-...` | ✅ |
| `NODE_ENV` | Environment mode | `production` | ✅ |
| `PORT` | Server port | `3001` | ✅ |

### Optional Environment Variables

| Variable | Description | Default | Optional |
|----------|-------------|---------|----------|
| `ALLOWED_ORIGINS` | CORS allowed origins | `*` | ⚠️ |
| `MAX_FILE_SIZE` | Max upload size (bytes) | `10485760` (10MB) | ✅ |
| `STORIES_RETENTION_DAYS` | Days to keep stories | `30` | ✅ |
| `CLEANUP_INTERVAL_HOURS` | Cleanup frequency | `6` | ✅ |
| `UPLOAD_DIR` | Upload directory path | `./uploads` | ✅ |
| `LOG_LEVEL` | Logging level | `info` | ✅ |

## 🏗️ Build Process

### Development Build
```bash
npm run dev          # Start development servers
npm run build        # Basic production build
```

### Production Build
```bash
npm run build:prod   # Optimized production build
```

**Build Output:**
- **Client:** `client/dist/` - Optimized React bundle with static assets
- **Server:** `server/dist/` - Compiled TypeScript to JavaScript

### Build Optimizations

**Client Optimizations:**
- Code splitting and lazy loading
- Asset optimization and compression
- CSS purging and minification
- Bundle size analysis

**Server Optimizations:**
- TypeScript compilation
- Environment-specific configurations
- Production error handling
- Performance monitoring

## 🔍 Health Monitoring

### Health Check Endpoint
```
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "version": "1.0.0",
  "environment": "production"
}
```

### Monitoring Recommendations

**Application Metrics:**
- Response times for story generation (target: <30s)
- Quiz completion rates
- File upload success rates
- Error rates by endpoint

**System Metrics:**
- CPU usage (story generation is intensive)
- Memory usage (file processing)
- Disk space (uploads and stories)
- Network I/O

**Business Metrics:**
- Daily active users
- Stories generated per day
- Quiz completion rates
- User retention rates

## 🔒 Security Configuration

### Production Security Checklist

- [ ] **API Security:**
  - [ ] OpenAI API key is secure and not exposed
  - [ ] Rate limiting configured for story generation
  - [ ] File upload limits enforced (10MB max)
  - [ ] CORS configured for specific domains only

- [ ] **Application Security:**
  - [ ] HTTPS enabled (recommended)
  - [ ] Security headers configured
  - [ ] Input validation on all endpoints
  - [ ] Error messages don't expose sensitive info

- [ ] **Infrastructure Security:**
  - [ ] Regular security updates applied
  - [ ] Firewall configured properly
  - [ ] Monitoring and alerting set up
  - [ ] Backup and recovery procedures tested

### File Security

**Upload Restrictions:**
- File types: `.txt`, `.pdf`, plain text only
- Size limit: 10MB maximum
- No executable files accepted
- Automatic virus scanning (recommended)

**Data Retention:**
- Uploaded files: Deleted after processing
- Generated stories: 30-day retention
- User progress: Stored locally in browser
- No sensitive personal data collected

## 🚨 Troubleshooting

### Common Issues

**1. OpenAI API Errors:**
```bash
# Check API key validity
curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models

# Common solutions:
- Verify API key format (starts with sk-)
- Check billing and quota limits
- Monitor rate limits (3 requests/minute for free tier)
```

**2. File Upload Issues:**
```bash
# Check upload directory permissions
ls -la server/uploads/

# Common solutions:
- Ensure upload directory exists and is writable
- Check disk space availability
- Verify file size limits in configuration
```

**3. Build Failures:**
```bash
# Clear node modules and reinstall
rm -rf node_modules client/node_modules server/node_modules
npm run install:all

# Check Node.js version
node --version  # Should be 18+
```

**4. Performance Issues:**
```bash
# Monitor memory usage
top -p $(pgrep node)

# Check story generation times
tail -f server/logs/app.log | grep "story_generation"
```

### Debug Mode

Enable detailed logging:
```bash
# Development
DEBUG=spooky:* npm run dev

# Production
LOG_LEVEL=debug npm run start:prod
```

**Key Log Patterns:**
- `story_generation_start` - Story generation initiated
- `story_generation_complete` - Story generation finished
- `quiz_generation` - Quiz creation process
- `file_upload` - File upload events
- `cleanup_job` - Automatic cleanup execution

## 📊 Performance Optimization

### Scaling Recommendations

**Small Scale (< 100 users/day):**
- Single server instance
- Basic health monitoring
- Daily cleanup jobs
- Local file storage

**Medium Scale (100-1000 users/day):**
- Load balancer with 2-3 instances
- Redis for session storage
- Hourly cleanup jobs
- CDN for static assets
- Database for story persistence

**Large Scale (> 1000 users/day):**
- Auto-scaling deployment
- Queue system for story generation
- Distributed file storage
- Advanced monitoring and alerting
- Caching layers (Redis/Memcached)

### Performance Tuning

**Story Generation Optimization:**
```javascript
// Implement request queuing
const queue = new Queue('story-generation', {
  concurrency: 3,  // Limit concurrent OpenAI requests
  timeout: 45000   // 45 second timeout
});
```

**Caching Strategy:**
```javascript
// Cache frequently requested stories
const cache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
```

**Database Optimization:**
```sql
-- Index for story lookups
CREATE INDEX idx_stories_created_at ON stories(created_at);
CREATE INDEX idx_stories_share_id ON stories(share_id);
```

## 🔄 Maintenance & Updates

### Regular Maintenance Tasks

**Daily:**
- Monitor error logs
- Check disk usage
- Verify backup processes
- Review performance metrics

**Weekly:**
- Update dependencies (security patches)
- Review user feedback
- Analyze usage patterns
- Clean up old files

**Monthly:**
- Full security audit
- Performance optimization review
- Capacity planning assessment
- Disaster recovery testing

### Update Process

**1. Preparation:**
```bash
# Backup current deployment
docker-compose exec app npm run backup

# Test updates in staging
git checkout staging
npm run test
npm run build:prod
```

**2. Deployment:**
```bash
# Zero-downtime deployment
docker-compose pull
docker-compose up -d --no-deps app

# Verify deployment
curl http://localhost:3001/api/health
```

**3. Rollback (if needed):**
```bash
# Quick rollback to previous version
docker-compose down
docker-compose up -d --scale app=0
docker-compose up -d
```

## 📈 Analytics & Monitoring

### Recommended Monitoring Tools

**Application Monitoring:**
- New Relic or DataDog for APM
- Sentry for error tracking
- LogRocket for user session replay

**Infrastructure Monitoring:**
- Prometheus + Grafana
- AWS CloudWatch
- Google Cloud Monitoring

**Custom Metrics:**
```javascript
// Track story generation metrics
metrics.histogram('story_generation_duration', duration);
metrics.counter('stories_generated_total').inc();
metrics.gauge('active_users', activeUserCount);
```

### Key Performance Indicators

**Technical KPIs:**
- Average story generation time: < 30 seconds
- API response time: < 2 seconds
- Error rate: < 1%
- Uptime: > 99.9%

**Business KPIs:**
- Daily active users
- Story completion rate
- Quiz completion rate
- User retention (7-day, 30-day)

## 🆘 Emergency Procedures

### Incident Response

**1. Service Outage:**
```bash
# Quick health check
curl -f http://localhost:3001/api/health || echo "Service down"

# Check logs
docker-compose logs --tail=100 app

# Restart service
docker-compose restart app
```

**2. High Error Rate:**
```bash
# Check OpenAI API status
curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models

# Temporary disable story generation
export MAINTENANCE_MODE=true
docker-compose restart app
```

**3. Resource Exhaustion:**
```bash
# Check disk space
df -h

# Clean up old files
npm run cleanup:force

# Scale down if needed
docker-compose scale app=1
```

### Contact Information

**Emergency Contacts:**
- Technical Lead: [Your contact info]
- DevOps Team: [Team contact info]
- OpenAI Support: https://help.openai.com/

**Escalation Path:**
1. Check automated monitoring alerts
2. Review application logs
3. Contact technical lead
4. Escalate to DevOps team if infrastructure issue
5. Contact OpenAI support if API issue

---

## 📚 Additional Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Node.js Production Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [React Production Build Guide](https://create-react-app.dev/docs/production-build/)

For more help, check the project's GitHub issues or contact the development team.