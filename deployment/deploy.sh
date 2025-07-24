#!/bin/bash
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
