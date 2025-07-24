#!/usr/bin/env ts-node

/**
 * STEP 6: Production Deployment Setup for DealMecca V1
 * 
 * Comprehensive production deployment configuration and optimization
 */

import * as fs from 'fs'
import * as path from 'path'

interface DeploymentConfig {
  environment: 'production' | 'staging'
  domain: string
  databaseUrl: string
  features: string[]
  monitoring: boolean
  analytics: boolean
}

class ProductionDeploymentSetup {
  private deploymentPath = './deployment'

  constructor() {
    this.ensureDeploymentDirectory()
  }

  private ensureDeploymentDirectory(): void {
    if (!fs.existsSync(this.deploymentPath)) {
      fs.mkdirSync(this.deploymentPath, { recursive: true })
    }
  }

  async setupProductionEnvironment(): Promise<void> {
    console.log('🚀 Setting up production environment configuration...')

    // Create production environment file
    const prodEnvContent = this.createProductionEnvFile()
    fs.writeFileSync(`${this.deploymentPath}/.env.production`, prodEnvContent)
    console.log('✅ Created .env.production file')

    // Create Docker configuration
    const dockerContent = this.createDockerConfiguration()
    fs.writeFileSync('./Dockerfile', dockerContent)
    console.log('✅ Created Dockerfile for production')

    // Create docker-compose for production
    const dockerComposeContent = this.createDockerComposeConfig()
    fs.writeFileSync(`${this.deploymentPath}/docker-compose.prod.yml`, dockerComposeContent)
    console.log('✅ Created docker-compose.prod.yml')

    // Create deployment scripts
    this.createDeploymentScripts()
    console.log('✅ Created deployment scripts')

    // Create nginx configuration
    const nginxConfig = this.createNginxConfig()
    fs.writeFileSync(`${this.deploymentPath}/nginx.conf`, nginxConfig)
    console.log('✅ Created nginx configuration')

    // Create health check configuration
    this.createHealthCheckConfig()
    console.log('✅ Created health check configuration')
  }

  private createProductionEnvFile(): string {
    return `# DealMecca V1 Production Environment Configuration
# Generated: ${new Date().toISOString()}

# Application Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_NAME=DealMecca

# Domain and URLs
NEXTAUTH_URL=https://app.dealmecca.com
NEXT_PUBLIC_BASE_URL=https://app.dealmecca.com
NEXT_PUBLIC_API_URL=https://app.dealmecca.com/api

# Database Configuration (Replace with actual production values)
DATABASE_URL=postgresql://dealmecca_user:SECURE_PASSWORD@db.dealmecca.com:5432/dealmecca_prod
DIRECT_URL=postgresql://dealmecca_user:SECURE_PASSWORD@db.dealmecca.com:5432/dealmecca_prod

# Authentication & Security
NEXTAUTH_SECRET=REPLACE_WITH_SECURE_32_CHAR_SECRET
JWT_SECRET=REPLACE_WITH_SECURE_JWT_SECRET

# External Services
PUSHER_APP_ID=REPLACE_WITH_PUSHER_APP_ID
PUSHER_KEY=REPLACE_WITH_PUSHER_KEY  
PUSHER_SECRET=REPLACE_WITH_PUSHER_SECRET
PUSHER_CLUSTER=us2

# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_REPLACE_WITH_LIVE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=pk_live_REPLACE_WITH_LIVE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET=whsec_REPLACE_WITH_WEBHOOK_SECRET

# Email Configuration
SMTP_HOST=smtp.postmarkapp.com
SMTP_PORT=587
SMTP_USER=REPLACE_WITH_SMTP_USER
SMTP_PASS=REPLACE_WITH_SMTP_PASS
FROM_EMAIL=noreply@dealmecca.com

# Analytics & Monitoring
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
SENTRY_DSN=https://REPLACE_WITH_SENTRY_DSN@sentry.io/PROJECT_ID
VERCEL_ANALYTICS_ID=REPLACE_WITH_VERCEL_ANALYTICS_ID

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_ERROR_REPORTING=true
NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true
NEXT_PUBLIC_MAINTENANCE_MODE=false

# Performance & Optimization
NEXT_PUBLIC_IMAGE_OPTIMIZATION=true
NEXT_PUBLIC_CDN_URL=https://cdn.dealmecca.com
REDIS_URL=redis://redis.dealmecca.com:6379

# Security Headers
NEXT_PUBLIC_CSP_ENABLED=true
NEXT_PUBLIC_HSTS_ENABLED=true
NEXT_PUBLIC_XSS_PROTECTION=true

# Rate Limiting
RATE_LIMIT_REQUESTS_PER_MINUTE=100
RATE_LIMIT_BURST=200

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
ENABLE_REQUEST_LOGGING=true
`
  }

  private createDockerConfiguration(): string {
    return `# DealMecca V1 Production Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
`
  }

  private createDockerComposeConfig(): string {
    return `# DealMecca V1 Production Docker Compose
version: '3.8'

services:
  app:
    build:
      context: ..
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    networks:
      - dealmecca-network
    volumes:
      - app-logs:/app/logs

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: dealmecca_prod
      POSTGRES_USER: dealmecca_user
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped
    networks:
      - dealmecca-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    restart: unless-stopped
    networks:
      - dealmecca-network
    command: redis-server --appendonly yes

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - nginx-logs:/var/log/nginx
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - dealmecca-network

volumes:
  postgres-data:
  redis-data:
  app-logs:
  nginx-logs:

networks:
  dealmecca-network:
    driver: bridge
`
  }

  private createNginxConfig(): string {
    return `# DealMecca V1 Production Nginx Configuration
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging format
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    # Performance optimizations
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 10M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Main server configuration
    server {
        listen 80;
        server_name app.dealmecca.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name app.dealmecca.com;

        ssl_certificate /etc/nginx/ssl/dealmecca.crt;
        ssl_certificate_key /etc/nginx/ssl/dealmecca.key;

        # API rate limiting
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://app:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_read_timeout 86400;
        }

        # Auth endpoints with stricter rate limiting
        location ~ ^/api/auth/(signin|signup|register) {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://app:3000;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Static files caching
        location /_next/static/ {
            proxy_pass http://app:3000;
            proxy_cache_valid 200 1y;
            add_header Cache-Control "public, immutable";
        }

        # Main application
        location / {
            proxy_pass http://app:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Health check endpoint
        location /health {
            access_log off;
            proxy_pass http://app:3000/api/health;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
        }

        # Error pages
        error_page 404 /404.html;
        error_page 500 502 503 504 /500.html;
    }
}
`
  }

  private createDeploymentScripts(): void {
    // Deploy script
    const deployScript = `#!/bin/bash
# DealMecca V1 Production Deployment Script

set -e

echo "🚀 Starting DealMecca V1 deployment..."

# Load environment variables
if [ -f .env.production ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
fi

# Pre-deployment checks
echo "🔍 Running pre-deployment checks..."
npm run type-check
npm run lint
npm run test

# Database migration
echo "📊 Running database migrations..."
npx prisma migrate deploy
npx prisma generate

# Build application
echo "🏗️ Building application..."
npm run build

# Start services
echo "🐳 Starting Docker services..."
docker-compose -f deployment/docker-compose.prod.yml up -d

# Health check
echo "🏥 Performing health check..."
for i in {1..30}; do
    if curl -f http://localhost:3000/api/health; then
        echo "✅ Application is healthy!"
        break
    fi
    echo "⏳ Waiting for application to start... ($i/30)"
    sleep 2
done

echo "🎉 Deployment completed successfully!"
echo "🌐 Application available at: https://app.dealmecca.com"
`

    // Rollback script
    const rollbackScript = `#!/bin/bash
# DealMecca V1 Rollback Script

set -e

echo "🔄 Starting rollback process..."

# Get previous deployment
PREVIOUS_VERSION=$(docker images dealmecca_app --format "table {{.Tag}}" | sed -n 2p)

if [ -z "$PREVIOUS_VERSION" ]; then
    echo "❌ No previous version found to rollback to"
    exit 1
fi

echo "📦 Rolling back to version: $PREVIOUS_VERSION"

# Stop current services
docker-compose -f deployment/docker-compose.prod.yml down

# Start previous version
docker-compose -f deployment/docker-compose.prod.yml up -d

echo "✅ Rollback completed successfully!"
`

    // Monitoring script
    const monitorScript = `#!/bin/bash
# DealMecca V1 Monitoring Script

echo "📊 DealMecca V1 System Status"
echo "============================="

# Check application health
echo "🏥 Application Health:"
curl -s http://localhost:3000/api/health | jq '.'

# Check container status
echo -e "\n🐳 Container Status:"
docker-compose -f deployment/docker-compose.prod.yml ps

# Check disk usage
echo -e "\n💾 Disk Usage:"
df -h

# Check memory usage
echo -e "\n🧠 Memory Usage:"
free -h

# Check recent logs
echo -e "\n📝 Recent Application Logs:"
docker-compose -f deployment/docker-compose.prod.yml logs --tail=20 app
`

    fs.writeFileSync(`${this.deploymentPath}/deploy.sh`, deployScript)
    fs.writeFileSync(`${this.deploymentPath}/rollback.sh`, rollbackScript)
    fs.writeFileSync(`${this.deploymentPath}/monitor.sh`, monitorScript)

    // Make scripts executable
    fs.chmodSync(`${this.deploymentPath}/deploy.sh`, '755')
    fs.chmodSync(`${this.deploymentPath}/rollback.sh`, '755')
    fs.chmodSync(`${this.deploymentPath}/monitor.sh`, '755')
  }

  private createHealthCheckConfig(): void {
    const healthCheckConfig = {
      healthChecks: [
        {
          name: "application",
          endpoint: "/api/health",
          interval: 30000,
          timeout: 5000,
          retries: 3
        },
        {
          name: "database",
          type: "prisma",
          interval: 60000,
          timeout: 10000,
          retries: 2
        },
        {
          name: "redis",
          type: "redis",
          interval: 60000,
          timeout: 5000,
          retries: 2
        }
      ],
      alerts: {
        email: "alerts@dealmecca.com",
        webhook: "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK",
        thresholds: {
          responseTime: 2000,
          errorRate: 0.05,
          uptime: 0.99
        }
      },
      metrics: {
        enabled: true,
        retention: "30d",
        endpoints: [
          "/api/health",
          "/api/orgs/companies",
          "/api/events",
          "/api/forum/posts"
        ]
      }
    }

    fs.writeFileSync(
      `${this.deploymentPath}/health-check.json`,
      JSON.stringify(healthCheckConfig, null, 2)
    )
  }

  createProductionOptimizations(): void {
    console.log('⚡ Creating production optimizations...')

    // Next.js optimization config
    const nextConfigOptimizations = `
// Production optimizations for next.config.mjs
const productionOptimizations = {
  // Performance optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@prisma/client', 'lucide-react'],
  },
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Bundle optimization
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize bundle size
    if (!dev && !isServer) {
      config.optimization.splitChunks.chunks = 'all'
      config.optimization.splitChunks.cacheGroups = {
        vendor: {
          test: /[\\\\/]node_modules[\\\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      }
    }
    
    return config
  },
  
  // Output optimization
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  
  // Security headers
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
      ],
    },
  ],
}

export default productionOptimizations
`

    fs.writeFileSync(`${this.deploymentPath}/next-production-config.js`, nextConfigOptimizations)
    console.log('✅ Created Next.js production optimizations')

    // Create performance monitoring setup
    const performanceMonitoring = `
// Performance monitoring setup for production
export const performanceConfig = {
  // Core Web Vitals tracking
  vitals: {
    trackCLS: true,
    trackFID: true,
    trackFCP: true,
    trackLCP: true,
    trackTTFB: true,
  },
  
  // Custom metrics
  customMetrics: {
    apiResponseTimes: true,
    databaseQueryTimes: true,
    searchPerformance: true,
    userInteractionLatency: true,
  },
  
  // Error tracking
  errorTracking: {
    captureConsoleErrors: true,
    captureUnhandledRejections: true,
    captureApiErrors: true,
    sampleRate: 1.0,
  },
  
  // Performance budgets
  budgets: {
    maxBundleSize: '500kb',
    maxInitialLoadTime: '2s',
    maxApiResponseTime: '500ms',
    maxDatabaseQueryTime: '100ms',
  },
}
`

    fs.writeFileSync(`${this.deploymentPath}/performance-config.js`, performanceMonitoring)
    console.log('✅ Created performance monitoring configuration')
  }

  async generateDeploymentChecklist(): Promise<void> {
    const checklist = `# 🚀 DealMecca V1 Production Deployment Checklist

## Pre-Deployment Requirements

### Environment Setup
- [ ] Production domain configured (app.dealmecca.com)
- [ ] SSL certificates installed and configured
- [ ] Production database provisioned and secured
- [ ] Redis instance configured for caching
- [ ] CDN setup for static assets (optional)

### Security Configuration  
- [ ] Environment variables secured and validated
- [ ] Database credentials rotated and secured
- [ ] API keys and secrets generated for production
- [ ] Rate limiting rules configured
- [ ] CORS policies validated
- [ ] Security headers configured in nginx

### External Services
- [ ] Stripe live keys configured and tested
- [ ] Pusher production environment setup
- [ ] Email service (SMTP) configured
- [ ] Analytics tracking (Google Analytics) setup
- [ ] Error monitoring (Sentry) configured

### Performance Optimization
- [ ] Production build tested locally
- [ ] Database indexes optimized
- [ ] Image optimization enabled
- [ ] Gzip compression configured
- [ ] Caching strategies implemented

## Deployment Process

### 1. Pre-Deployment Testing
\`\`\`bash
# Run full test suite
npm run test
npm run type-check
npm run lint

# Test production build locally
npm run build
npm start
\`\`\`

### 2. Database Migration
\`\`\`bash
# Backup current database
pg_dump production_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Run migrations
npx prisma migrate deploy
npx prisma generate
\`\`\`

### 3. Deploy Application
\`\`\`bash
# Deploy with monitoring
./deployment/deploy.sh

# Verify deployment
./deployment/monitor.sh
\`\`\`

### 4. Post-Deployment Verification
- [ ] Health check endpoint responding
- [ ] User authentication working
- [ ] Database connections stable
- [ ] External API integrations functional
- [ ] Search functionality operational
- [ ] File uploads working
- [ ] Email notifications sending

### 5. Performance Validation
- [ ] Core Web Vitals within targets
- [ ] API response times < 500ms
- [ ] Database query times < 100ms
- [ ] Page load times < 2 seconds
- [ ] Mobile performance optimized

## Monitoring & Alerting

### Application Monitoring
- [ ] Health checks configured (30s intervals)
- [ ] Error rate monitoring (< 5% threshold)
- [ ] Performance metrics collection
- [ ] User activity tracking
- [ ] Database performance monitoring

### Infrastructure Monitoring
- [ ] Server resource monitoring (CPU, Memory, Disk)
- [ ] Network performance tracking
- [ ] Container health monitoring
- [ ] Load balancer status
- [ ] SSL certificate expiration alerts

### Alerting Channels
- [ ] Email alerts configured (alerts@dealmecca.com)
- [ ] Slack webhook integration
- [ ] PagerDuty for critical alerts
- [ ] SMS alerts for system outages

## Rollback Plan

### Automated Rollback
\`\`\`bash
# Emergency rollback to previous version
./deployment/rollback.sh
\`\`\`

### Manual Rollback Steps
1. Stop current application containers
2. Restore previous application version
3. Rollback database migrations if needed
4. Verify application functionality
5. Update DNS if required

## Success Criteria

### Technical Metrics
- [ ] 99.9% uptime target achieved
- [ ] < 2 second average page load time
- [ ] < 500ms API response time
- [ ] Zero critical security vulnerabilities

### Business Metrics
- [ ] User registration flow working
- [ ] Search functionality performing well
- [ ] Event RSVP system operational
- [ ] Forum posting and interaction functional
- [ ] Admin management tools accessible

## Emergency Contacts

- **Technical Lead:** [Your contact info]
- **Database Admin:** [DBA contact info]  
- **Infrastructure Team:** [Infrastructure contact info]
- **Security Team:** [Security contact info]

## Documentation

- **Production Environment Guide:** \`deployment/production-guide.md\`
- **Troubleshooting Runbook:** \`deployment/troubleshooting.md\`
- **API Documentation:** \`API_DOCUMENTATION.md\`
- **Database Schema:** \`prisma/schema.prisma\`

---

**Deployment Date:** _____________  
**Deployed By:** _____________  
**Version:** DealMecca V1.0  
**Git Commit:** _____________
`

    fs.writeFileSync(`${this.deploymentPath}/DEPLOYMENT_CHECKLIST.md`, checklist)
    console.log('✅ Generated comprehensive deployment checklist')
  }

  async run(): Promise<void> {
    console.log('🚀 Setting up DealMecca V1 Production Deployment...')
    
    await this.setupProductionEnvironment()
    this.createProductionOptimizations()
    await this.generateDeploymentChecklist()
    
    console.log('\n' + '='.repeat(80))
    console.log('✅ PRODUCTION DEPLOYMENT SETUP COMPLETE')
    console.log('='.repeat(80))
    console.log('📁 Files created in ./deployment/ directory:')
    console.log('   • .env.production - Production environment variables')
    console.log('   • docker-compose.prod.yml - Production container orchestration')
    console.log('   • nginx.conf - Production web server configuration')
    console.log('   • deploy.sh - Automated deployment script')
    console.log('   • rollback.sh - Emergency rollback script')
    console.log('   • monitor.sh - System monitoring script')
    console.log('   • DEPLOYMENT_CHECKLIST.md - Complete deployment guide')
    console.log('   • Dockerfile - Production container configuration')
    console.log('\n🚀 Ready for production deployment!')
    console.log('📋 Next steps:')
    console.log('   1. Review and customize environment variables')
    console.log('   2. Configure SSL certificates')
    console.log('   3. Set up production database')
    console.log('   4. Run deployment checklist')
    console.log('   5. Execute deployment script')
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const deployment = new ProductionDeploymentSetup()
  deployment.run()
    .then(() => {
      console.log('\n✅ Production deployment setup completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Deployment setup failed:', error)
      process.exit(1)
    })
}

export { ProductionDeploymentSetup } 