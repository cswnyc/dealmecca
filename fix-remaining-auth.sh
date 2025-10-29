#!/bin/bash

# List of files with broken auth (missing userId/userRole declarations)
FILES=(
    "app/api/admin/bulk-import/enhanced/route.ts"
    "app/api/admin/bulk-process/route.ts"
    "app/api/admin/companies/[id]/partnerships/route.ts"
    "app/api/admin/companies/[id]/verify/route.ts"
    "app/api/admin/companies/search/route.ts"
    "app/api/admin/contacts/[id]/route.ts"
    "app/api/admin/contacts/[id]/verify/route.ts"
    "app/api/admin/contacts/bulk-import/route.ts"
    "app/api/admin/contacts/bulk/route.ts"
    "app/api/admin/companies/[id]/logo/route.ts"
    "app/api/admin/contacts/[id]/logo/route.ts"
)

# Add userId and userRole declarations to each function that needs them
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "Fixing auth in: $file"
        
        # Add userId/userRole declarations before each if (!userId || check
        sed -i '' '/if (!userId ||/{
            i\
  const userId = request.headers.get('"'"'x-user-id'"'"');\
  const userRole = request.headers.get('"'"'x-user-role'"'"');
        }' "$file"
    fi
done

echo "Fixed auth declarations!"