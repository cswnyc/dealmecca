#!/bin/bash

echo "🔥 Removing NextAuth from API routes..."

# Find all files that import getServerSession and fix them
find app/api -name "*.ts" -exec grep -l "getServerSession" {} \; | while read file; do
    echo "Fixing: $file"
    
    # Replace getServerSession import
    sed -i '' 's/import { getServerSession } from '\''next-auth'\'';/\/\/ Removed getServerSession - using Firebase auth via middleware headers/g' "$file"
    
    # Replace getServerSession usage patterns
    sed -i '' 's/const session = await getServerSession(.*)/\/\/ Session data now comes from middleware headers (x-user-id, x-user-email, x-user-role)/g' "$file"
    sed -i '' 's/if (!session) {/\/\/ Check if user is authenticated via middleware headers\n  const userId = request.headers.get('\''x-user-id'\'');\n  if (!userId) {/g' "$file"
    sed -i '' 's/session\.user\.id/request.headers.get('\''x-user-id'\'')/g' "$file"
    sed -i '' 's/session\.user\.email/request.headers.get('\''x-user-email'\'')/g' "$file"
    sed -i '' 's/session\.user\.role/request.headers.get('\''x-user-role'\'')/g' "$file"
done

echo "✅ NextAuth removal complete!"
