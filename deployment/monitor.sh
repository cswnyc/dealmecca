#!/bin/bash
# DealMecca V1 Monitoring Script

echo "📊 DealMecca V1 System Status"
echo "============================="

# Check application health
echo "🏥 Application Health:"
curl -s http://localhost:3000/api/health | jq '.'

# Check container status
echo -e "
🐳 Container Status:"
docker-compose -f deployment/docker-compose.prod.yml ps

# Check disk usage
echo -e "
💾 Disk Usage:"
df -h

# Check memory usage
echo -e "
🧠 Memory Usage:"
free -h

# Check recent logs
echo -e "
📝 Recent Application Logs:"
docker-compose -f deployment/docker-compose.prod.yml logs --tail=20 app
