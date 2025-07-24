#!/bin/bash
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
