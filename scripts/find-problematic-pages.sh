#!/bin/bash

# Script to identify all pages with problematic imports for Vercel deployment
echo "🔍 Scanning for pages with problematic imports..."

# Create output file
OUTPUT_FILE="problematic-pages.txt"
> "$OUTPUT_FILE"

# Define problematic import patterns
PATTERNS=(
    "@/components/ui/"
    "@/lib/auth/firebase-auth"
    "@/hooks/useFirebaseSession"
    "@/components/layout/ForumLayout"
    "@/components/dashboard/"
    "@/components/events/"
    "@/components/admin/"
)

echo "📋 Problematic Pages Found:" | tee "$OUTPUT_FILE"
echo "=========================" | tee -a "$OUTPUT_FILE"

# Search for pages with problematic imports
for pattern in "${PATTERNS[@]}"; do
    echo "" | tee -a "$OUTPUT_FILE"
    echo "🚨 Pages with $pattern imports:" | tee -a "$OUTPUT_FILE"
    echo "---" | tee -a "$OUTPUT_FILE"
    
    # Find TypeScript/React files with the pattern
    find app -name "*.tsx" -type f | xargs grep -l "$pattern" 2>/dev/null | while read file; do
        echo "  ❌ $file" | tee -a "$OUTPUT_FILE"
    done
done

echo "" | tee -a "$OUTPUT_FILE"
echo "📊 Summary:" | tee -a "$OUTPUT_FILE"
echo "----------" | tee -a "$OUTPUT_FILE"

# Count unique files
UNIQUE_FILES=$(find app -name "*.tsx" -type f | xargs grep -l "@/components/ui/\|@/lib/auth/firebase-auth\|@/hooks/useFirebaseSession\|@/components/layout/ForumLayout\|@/components/dashboard/\|@/components/events/\|@/components/admin/" 2>/dev/null | sort | uniq | wc -l)

echo "📈 Total problematic pages: $UNIQUE_FILES" | tee -a "$OUTPUT_FILE"
echo "💾 Full list saved to: $OUTPUT_FILE"

# Also show the actual list of unique problematic files
echo "" | tee -a "$OUTPUT_FILE"
echo "📄 Complete List of Files to Fix:" | tee -a "$OUTPUT_FILE"
echo "=================================" | tee -a "$OUTPUT_FILE"

find app -name "*.tsx" -type f | xargs grep -l "@/components/ui/\|@/lib/auth/firebase-auth\|@/hooks/useFirebaseSession\|@/components/layout/ForumLayout\|@/components/dashboard/\|@/components/events/\|@/components/admin/" 2>/dev/null | sort | uniq | while read file; do
    echo "  📄 $file" | tee -a "$OUTPUT_FILE"
done

echo ""
echo "✅ Scan complete! Check $OUTPUT_FILE for full results."