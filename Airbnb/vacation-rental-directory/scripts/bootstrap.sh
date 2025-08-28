#!/bin/bash
set -e

echo "🏗️ Bootstrapping Vacation Rental Directory..."
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm i

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run migrations
echo "🗄️ Running database migrations..."
npx prisma migrate dev --name init || true

# Seed database
echo "🌱 Seeding database..."
npm run seed

echo ""
echo "✅ Bootstrap complete!"
echo "🚀 Run 'npm run dev' to start the development server"
echo "💳 Run 'npm run stripe:seed' to setup Stripe products (requires STRIPE_SECRET_KEY)"
echo ""