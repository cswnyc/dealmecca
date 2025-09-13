#!/bin/bash

# Script to automatically fix all problematic pages with appropriate templates
echo "🚀 Starting mass page simplification for deployment..."

# Create backup directory
BACKUP_DIR="/Users/csw/website/backup-original-pages-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Define page categories
declare -A CORE_PAGES=(
    ["app/page.tsx"]="HomePage|DealMecca Homepage"
    ["app/forum/page.tsx"]="ForumPage|Community Forum"
    ["app/orgs/page.tsx"]="OrganizationsPage|Organizations Directory"
    ["app/events/page.tsx"]="EventsPage|Events Listing"
    ["app/search/enhanced/page.tsx"]="SearchPage|Enhanced Search"
    ["app/pricing/page.tsx"]="PricingPage|Pricing Plans"
    ["app/intelligence/page.tsx"]="IntelligencePage|Market Intelligence"
)

declare -A SIMPLE_PAGES=(
    ["app/settings/page.tsx"]="SettingsPage|User Settings"
    ["app/organizations/page.tsx"]="OrganizationsListPage|Organizations Browser"
    ["app/signup/page.tsx"]="SignupPage|Create Account"
    ["app/login/page.tsx"]="LoginPage|Sign In"
    ["app/manual-login/page.tsx"]="ManualLoginPage|Manual Login"
    ["app/session-status/page.tsx"]="SessionStatusPage|Session Status"
    ["app/profile/[id]/page.tsx"]="UserProfilePage|User Profile"
    ["app/orgs/companies/[id]/page.tsx"]="CompanyDetailPage|Company Details"
    ["app/orgs/contacts/[id]/page.tsx"]="ContactDetailPage|Contact Details"
    ["app/orgs/enhanced/page.tsx"]="EnhancedOrgsPage|Enhanced Organizations"
    ["app/org-charts/page.tsx"]="OrgChartsPage|Organization Charts"
    ["app/org-charts/[slug]/page.tsx"]="OrgChartDetailPage|Organization Chart"
    ["app/org-charts/debug/page.tsx"]="OrgChartDebugPage|Org Chart Debug"
    ["app/search/fixed/page.tsx"]="SearchFixedPage|Search (Fixed)"
    ["app/search/intelligence/page.tsx"]="SearchIntelligencePage|Search Intelligence"
    ["app/search/mobile/page.tsx"]="SearchMobilePage|Mobile Search"
    ["app/upgrade/page.tsx"]="UpgradePage|Upgrade Account"
)

declare -A ADMIN_TEST_PAGES=(
    ["app/admin/orgs/contacts/import/page.tsx"]="ContactImportPage|Contact Import|admin"
    ["app/test-auth-fixed/page.tsx"]="AuthTestPage|Authentication Test|test"
    ["app/test-components/page.tsx"]="ComponentTestPage|Component Test|test"
    ["app/test-confetti/page.tsx"]="ConfettiTestPage|Confetti Test|test"
    ["app/test-login-simple/page.tsx"]="LoginTestPage|Login Test|test"
    ["app/test-rich-editor/page.tsx"]="RichEditorTestPage|Rich Editor Test|test"
    ["app/test-search-working/page.tsx"]="SearchTestPage|Search Test|test"
    ["app/test-simple/page.tsx"]="SimpleTestPage|Simple Test|test"
    ["app/pricing/debug.tsx"]="PricingDebugPage|Pricing Debug|debug"
)

# Function to backup and replace a file
replace_page() {
    local file_path="$1"
    local template_file="$2"
    local component_name="$3"
    local page_title="$4"
    local page_description="$5"
    local page_type="$6"
    
    # Create backup
    if [ -f "/Users/csw/website/$file_path" ]; then
        echo "📦 Backing up $file_path"
        cp "/Users/csw/website/$file_path" "$BACKUP_DIR/$(basename "$file_path")-$(echo "$file_path" | sed 's/\//-/g')"
        
        # Replace placeholders in template
        echo "🔄 Replacing $file_path with $template_file template"
        sed -e "s/REPLACE_COMPONENT_NAME/$component_name/g" \
            -e "s/REPLACE_PAGE_TITLE/$page_title/g" \
            -e "s/REPLACE_PAGE_DESCRIPTION/$page_description/g" \
            -e "s/REPLACE_PAGE_TYPE/$page_type/g" \
            "/Users/csw/website/scripts/templates/$template_file" > "/Users/csw/website/$file_path"
            
        echo "✅ Fixed $file_path"
    else
        echo "⚠️  File not found: $file_path"
    fi
}

echo "📂 Backup directory: $BACKUP_DIR"
echo ""

# Process core pages
echo "🎯 Processing CORE pages (full-featured placeholders)..."
for page in "${!CORE_PAGES[@]}"; do
    IFS='|' read -r component_name page_title <<< "${CORE_PAGES[$page]}"
    replace_page "$page" "core-feature-template.tsx" "$component_name" "$page_title" "$page_title" "core"
done

echo ""

# Process simple pages
echo "🔧 Processing SIMPLE pages (basic placeholders)..."
for page in "${!SIMPLE_PAGES[@]}"; do
    IFS='|' read -r component_name page_title <<< "${SIMPLE_PAGES[$page]}"
    replace_page "$page" "simple-placeholder-template.tsx" "$component_name" "$page_title" "$page_title" "feature"
done

echo ""

# Process admin/test pages
echo "⚙️  Processing ADMIN/TEST pages (minimal placeholders)..."
for page in "${!ADMIN_TEST_PAGES[@]}"; do
    IFS='|' read -r component_name page_title page_type <<< "${ADMIN_TEST_PAGES[$page]}"
    replace_page "$page" "admin-test-template.tsx" "$component_name" "$page_title" "$page_title" "$page_type"
done

echo ""
echo "🎉 Mass page simplification complete!"
echo "📊 Summary:"
echo "   - Core pages: ${#CORE_PAGES[@]}"
echo "   - Simple pages: ${#SIMPLE_PAGES[@]}"
echo "   - Admin/Test pages: ${#ADMIN_TEST_PAGES[@]}"
echo "   - Total fixed: $((${#CORE_PAGES[@]} + ${#SIMPLE_PAGES[@]} + ${#ADMIN_TEST_PAGES[@]}))"
echo ""
echo "💾 Original files backed up to: $BACKUP_DIR"
echo "🚀 Ready for deployment testing!"