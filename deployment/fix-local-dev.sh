#!/bin/bash

echo "🔧 FIXING LOCAL DEVELOPMENT ENVIRONMENT"
echo "======================================="

# Stop any running processes
echo "1. Stopping any running Node processes..."
pkill -f node 2>/dev/null || true
pkill -f next 2>/dev/null || true

# Clear all caches
echo "2. Clearing Next.js and Node caches..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .swc

# Clear browser-related caches
echo "3. Clearing additional caches..."
rm -rf public/sw.js.cache
rm -rf .vercel

# Reinstall dependencies cleanly
echo "4. Reinstalling dependencies..."
npm ci

echo "5. Starting development server..."
echo "   The server will start on port 3000"
echo "   If port 3000 is busy, try: npm run dev -- -p 3001"
echo ""
echo "✅ Environment fixed! Run: npm run dev"
echo ""
echo "🔍 SEARCH TESTING:"
echo "   1. Go to: http://localhost:3000/auth/signin"
echo "   2. Sign in with your credentials"
echo "   3. Go to: http://localhost:3000/search"
echo "   4. Search for: WPP, Omnicom, CEO, advertising"
echo ""
echo "⚠️  If local dev still has issues, use production:"
echo "   https://website-gjgyoiava-cws-projects-e62034bb.vercel.app/search" 