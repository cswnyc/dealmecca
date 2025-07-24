# 🚀 DealMecca Production Deployment Guide

## 📋 Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Database Migration](#database-migration)
4. [SSL Certificate Setup](#ssl-certificate-setup)
5. [Docker Deployment](#docker-deployment)
6. [Nginx Configuration](#nginx-configuration)
7. [Monitoring Setup](#monitoring-setup)
8. [Security Configuration](#security-configuration)
9. [Post-Deployment Verification](#post-deployment-verification)
10. [Rollback Procedures](#rollback-procedures)
11. [Maintenance Procedures](#maintenance-procedures)

## 🔍 Pre-Deployment Checklist

### ✅ Prerequisites
- [ ] Production server with Docker and Docker Compose installed
- [ ] Domain name configured and DNS pointing to server
- [ ] SSL certificate obtained (Let's Encrypt or commercial)
- [ ] Database server accessible (PostgreSQL 14+)
- [ ] Environment variables configured
- [ ] Backup strategy implemented
- [ ] Monitoring tools ready

### ✅ Code Preparation
- [ ] All tests passing
- [ ] Production build working
- [ ] Database migrations tested
- [ ] Environment variables validated
- [ ] Security configurations verified

### ✅ Infrastructure Requirements
- **Minimum Server Specs:**
  - 2 CPU cores
  - 4GB RAM
  - 50GB storage
  - Ubuntu 20.04+ or CentOS 8+

## 🔧 Environment Setup

### 1. Create Production Environment File
```bash
# Copy example environment file
cp deployment/production.env.example .env.production

# Edit with your production values
nano .env.production
```

### 2. Essential Environment Variables
```bash
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-super-secure-secret-32-chars-min

# Database
DATABASE_URL=postgresql://user:password@host:5432/dealmecca?sslmode=require

# Security
JWT_SECRET=your-jwt-secret-32-chars-min

# External Services
STRIPE_SECRET_KEY=sk_live_your_stripe_key
PUSHER_SECRET=your-pusher-secret
```

### 3. Set File Permissions
```bash
chmod 600 .env.production
chown root:root .env.production
```

## 🗄️ Database Migration

### 1. Run Migration Tests
```bash
# Test migrations in development first
npx tsx deployment/scripts/production-migration-test.ts
```

### 2. Backup Existing Database
```bash
# Create backup before migration
pg_dump -h host -U user -d database > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 3. Deploy Migrations
```bash
# Deploy to production database
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Verify migration status
npx prisma migrate status
```

### 4. Seed Production Data (if needed)
```bash
# Only if starting fresh
npx prisma db seed
```

## 🔐 SSL Certificate Setup

### Option A: Let's Encrypt (Recommended)
```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Verify auto-renewal
sudo certbot renew --dry-run
```

### Option B: Commercial Certificate
```bash
# Create certificate directory
sudo mkdir -p /etc/nginx/ssl

# Copy certificates
sudo cp your-domain.crt /etc/nginx/ssl/
sudo cp your-domain.key /etc/nginx/ssl/
sudo cp ca-bundle.crt /etc/nginx/ssl/

# Set permissions
sudo chmod 644 /etc/nginx/ssl/*.crt
sudo chmod 600 /etc/nginx/ssl/*.key
```

## 🐳 Docker Deployment

### 1. Build Production Image
```bash
# Build the application
docker build -f Dockerfile --target production -t dealmecca:latest .
```

### 2. Deploy with Docker Compose
```bash
# Start production services
docker-compose -f deployment/docker-compose.production.yml up -d

# Check service status
docker-compose -f deployment/docker-compose.production.yml ps

# View logs
docker-compose -f deployment/docker-compose.production.yml logs -f app
```

### 3. Service Management
```bash
# Restart specific service
docker-compose -f deployment/docker-compose.production.yml restart app

# Scale application (if needed)
docker-compose -f deployment/docker-compose.production.yml up -d --scale app=3

# Stop all services
docker-compose -f deployment/docker-compose.production.yml down
```

## 🌐 Nginx Configuration

### 1. Install Nginx
```bash
sudo apt-get update
sudo apt-get install nginx
```

### 2. Configure Nginx
```bash
# Copy configuration
sudo cp deployment/nginx/nginx.conf /etc/nginx/nginx.conf
sudo cp deployment/nginx/conf.d/* /etc/nginx/conf.d/

# Update domain in configuration
sudo sed -i 's/your-domain.com/yourdomain.com/g' /etc/nginx/nginx.conf

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 3. Enable Nginx
```bash
sudo systemctl enable nginx
sudo systemctl start nginx
```

## 📊 Monitoring Setup

### 1. Health Checks
```bash
# Test application health
curl https://your-domain.com/api/health

# Test database health
curl https://your-domain.com/api/health?check=db
```

### 2. Prometheus & Grafana
```bash
# Access monitoring dashboards
# Prometheus: http://your-domain.com:9090
# Grafana: http://your-domain.com:3001
```

### 3. Log Monitoring
```bash
# View application logs
docker logs dealmecca-app -f

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🔒 Security Configuration

### 1. Run Security Check
```bash
npx tsx deployment/scripts/ssl-security-check.ts
```

### 2. Firewall Setup
```bash
# Install and configure UFW
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny 3000/tcp  # Block direct app access
```

### 3. Fail2Ban (Optional)
```bash
# Install Fail2Ban
sudo apt-get install fail2ban

# Configure for Nginx
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
# Edit jail.local to enable nginx filters
```

## ✅ Post-Deployment Verification

### 1. Automated Verification
```bash
# Run all verification tests
npx tsx deployment/scripts/post-deployment-verification.ts
```

### 2. Manual Checks
- [ ] Website loads correctly: https://your-domain.com
- [ ] HTTPS redirect working: http://your-domain.com → https://your-domain.com
- [ ] SSL certificate valid and secure
- [ ] User registration/login working
- [ ] Database connections healthy
- [ ] API endpoints responding
- [ ] Admin panel accessible
- [ ] Email notifications working
- [ ] Payment processing functional (if enabled)

### 3. Performance Testing
```bash
# Load testing with Apache Bench
ab -n 1000 -c 10 https://your-domain.com/

# Check response times
curl -w "@curl-format.txt" -o /dev/null -s https://your-domain.com/
```

## 🔄 Rollback Procedures

### 1. Database Rollback
```bash
# Restore from backup
psql -h host -U user -d database < backup_YYYYMMDD_HHMMSS.sql

# Revert migrations (if needed)
npx prisma migrate reset --force
```

### 2. Application Rollback
```bash
# Rollback to previous image
docker tag dealmecca:previous dealmecca:latest
docker-compose -f deployment/docker-compose.production.yml up -d

# Or pull previous version from registry
docker pull your-registry/dealmecca:previous
docker tag your-registry/dealmecca:previous dealmecca:latest
```

### 3. Configuration Rollback
```bash
# Restore previous configuration
sudo cp /etc/nginx/nginx.conf.backup /etc/nginx/nginx.conf
sudo nginx -t && sudo systemctl reload nginx
```

## 🛠️ Maintenance Procedures

### 1. Regular Updates
```bash
# Update system packages
sudo apt-get update && sudo apt-get upgrade

# Update Docker images
docker-compose -f deployment/docker-compose.production.yml pull
docker-compose -f deployment/docker-compose.production.yml up -d
```

### 2. Database Maintenance
```bash
# Backup database (daily)
pg_dump -h host -U user -d database | gzip > backup_$(date +%Y%m%d).sql.gz

# Analyze database performance
npx prisma db execute --stdin <<< "ANALYZE;"

# Check database size
npx prisma db execute --stdin <<< "SELECT pg_size_pretty(pg_database_size('dealmecca'));"
```

### 3. Log Rotation
```bash
# Configure logrotate for Nginx
sudo nano /etc/logrotate.d/nginx

# Configure logrotate for application
sudo nano /etc/logrotate.d/dealmecca
```

### 4. SSL Certificate Renewal
```bash
# Let's Encrypt auto-renewal (already configured)
sudo certbot renew --dry-run

# Manual renewal if needed
sudo certbot renew
sudo systemctl reload nginx
```

### 5. Security Updates
```bash
# Update security configurations
npx tsx deployment/scripts/ssl-security-check.ts

# Check for vulnerabilities
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image dealmecca:latest
```

## 🚨 Troubleshooting

### Common Issues

#### Application Won't Start
```bash
# Check logs
docker logs dealmecca-app

# Check environment variables
docker exec dealmecca-app env | grep NODE_ENV

# Check database connection
docker exec dealmecca-app npx prisma db execute --stdin <<< "SELECT 1;"
```

#### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Test SSL configuration
openssl s_client -connect your-domain.com:443 -servername your-domain.com

# Check Nginx SSL configuration
sudo nginx -t
```

#### Database Connection Issues
```bash
# Test database connection
psql -h host -U user -d database -c "SELECT 1;"

# Check database logs
docker logs dealmecca-postgres

# Verify environment variables
echo $DATABASE_URL
```

#### Performance Issues
```bash
# Check resource usage
docker stats

# Check database performance
npx prisma db execute --stdin <<< "SELECT * FROM pg_stat_activity;"

# Check Nginx access logs
sudo tail -f /var/log/nginx/access.log | grep "POST\|PUT\|DELETE"
```

## 📞 Support Contacts

- **Technical Issues**: tech-support@your-domain.com
- **Security Issues**: security@your-domain.com
- **Emergency Contact**: +1-XXX-XXX-XXXX

## 📚 Additional Resources

- [Next.js Production Deployment](https://nextjs.org/docs/deployment)
- [Prisma Production Best Practices](https://www.prisma.io/docs/guides/deployment)
- [Docker Production Guide](https://docs.docker.com/engine/reference/builder/)
- [Nginx Security Guide](https://nginx.org/en/docs/http/securing_http.html)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

---

**Last Updated**: January 20, 2025  
**Version**: 1.0.0  
**Maintainer**: DealMecca DevOps Team 