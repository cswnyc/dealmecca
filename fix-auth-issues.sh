#!/bin/bash

# Find all API routes that have userId checks but no declarations
find app/api -name "*.ts" -exec grep -l "if (!userId ||" {} \; | while read file; do
    echo "Fixing userId declarations in: $file"
    
    # Check if the file already has userId declaration
    if ! grep -q "const userId = request.headers.get('x-user-id');" "$file"; then
        # Add userId and userRole declarations before the first if (!userId || check
        sed -i '' '/if (!userId ||/{
            i\
  // Check authentication and admin role\
  // Session data now comes from middleware headers (x-user-id, x-user-email, x-user-role)\
  const userId = request.headers.get('"'"'x-user-id'"'"');\
  const userRole = request.headers.get('"'"'x-user-role'"'"');
        }' "$file"
        
        # Replace the check to use userRole instead of request.headers.get('x-user-role')
        sed -i '' 's/request\.headers\.get('\''x-user-role'\'')' !== '\''ADMIN'\''/userRole !== '\''ADMIN'\''/g' "$file"
    fi
done

# Find files that still have session references
find app/api -name "*.ts" -exec grep -l "session" {} \; | while read file; do
    echo "Fixing session references in: $file"
    
    # Replace session checks with userId checks
    sed -i '' 's/if (!session ||/if (!userId ||/g' "$file"
    sed -i '' 's/session?.user?.role/userRole/g' "$file"
    sed -i '' 's/session?.user/userId/g' "$file"
done

echo "Auth fixes complete!"