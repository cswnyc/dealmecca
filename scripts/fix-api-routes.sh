#!/bin/bash

echo "🔧 Fixing API routes to remove NextAuth dependencies..."

# Find all files that still have authOptions import and fix them
find app/api -name "*.ts" -exec grep -l "authOptions" {} \; | while read file; do
    echo "Fixing authOptions import in: $file"
    sed -i '' '/import.*authOptions.*from.*@\/lib\/auth/d' "$file"
done

# Fix session variable references that are now undefined
find app/api -name "*.ts" -exec grep -l "!session" {} \; | while read file; do
    echo "Fixing session references in: $file"
    sed -i '' 's/if (!session || session\.user\.role/const userRole = request.headers.get('\''x-user-role'\'');\n  if (!userRole || userRole/g' "$file"
    sed -i '' 's/if (!session || session\.user\.id/const userId = request.headers.get('\''x-user-id'\'');\n  if (!userId || userId/g' "$file"
    sed -i '' 's/session\.user\.id/request.headers.get('\''x-user-id'\'')/g' "$file"
    sed -i '' 's/session\.user\.email/request.headers.get('\''x-user-email'\'')/g' "$file"
    sed -i '' 's/session\.user\.role/request.headers.get('\''x-user-role'\'')/g' "$file"
done

echo "✅ API routes fixed!"
