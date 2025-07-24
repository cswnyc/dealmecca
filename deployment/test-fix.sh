#!/bin/bash

echo "🧪 Testing DealMecca Production Fix..."
echo "====================================="

echo "📊 Health Check:"
curl -s https://website-incne6jv0-cws-projects-e62034bb.vercel.app/api/health | jq .

echo ""
echo "🎯 Expected Result: {\"status\": \"healthy\"}"
echo ""
echo "✅ If status = healthy: Dashboard, Organizations, and Search will work!"
echo "❌ If status = unhealthy: Environment variables need to be set in Vercel" 