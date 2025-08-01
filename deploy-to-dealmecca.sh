#!/bin/bash

# Deploy to dealmecca project
echo "Starting deployment to dealmecca project..."

# Use expect to automate the vercel deployment
expect << 'EOF'
spawn vercel --prod --scope cws-projects-e62034bb
expect "Set up and deploy"
send "yes\r"
expect "Which scope do you want to deploy to?"
send "cws-projects-e62034bb\r"
expect "Link to existing project?"
send "yes\r"
expect "What's the name of your existing project?"
send "dealmecca\r"
expect eof
EOF