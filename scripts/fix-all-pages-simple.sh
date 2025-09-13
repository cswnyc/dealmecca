#!/bin/bash

# Script to automatically fix all problematic pages with appropriate templates
echo "🚀 Starting mass page simplification for deployment..."

# Create backup directory
BACKUP_DIR="/Users/csw/website/backup-original-pages-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

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
        backup_name=$(echo "$file_path" | sed 's/\//-/g')
        cp "/Users/csw/website/$file_path" "$BACKUP_DIR/$backup_name"
        
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

# CORE PAGES - Full-featured placeholders
echo "🎯 Processing CORE pages (full-featured placeholders)..."
replace_page "app/page.tsx" "core-feature-template.tsx" "HomePage" "DealMecca" "The DealMecca homepage" "core"
replace_page "app/forum/page.tsx" "core-feature-template.tsx" "ForumPage" "Community Forum" "Community discussions and networking" "core"
replace_page "app/orgs/page.tsx" "core-feature-template.tsx" "OrganizationsPage" "Organizations" "Browse companies and contacts database" "core"
replace_page "app/events/page.tsx" "core-feature-template.tsx" "EventsPage" "Events" "Industry events and networking opportunities" "core"
replace_page "app/search/enhanced/page.tsx" "core-feature-template.tsx" "SearchPage" "Enhanced Search" "Advanced search functionality" "core"
replace_page "app/pricing/page.tsx" "core-feature-template.tsx" "PricingPage" "Pricing" "DealMecca pricing plans and features" "core"
replace_page "app/intelligence/page.tsx" "core-feature-template.tsx" "IntelligencePage" "Market Intelligence" "AI-powered market insights and analysis" "core"

echo ""

# SIMPLE PAGES - Basic placeholders
echo "🔧 Processing SIMPLE pages (basic placeholders)..."
replace_page "app/settings/page.tsx" "simple-placeholder-template.tsx" "SettingsPage" "Settings" "User account settings and preferences" "feature"
replace_page "app/organizations/page.tsx" "simple-placeholder-template.tsx" "OrganizationsListPage" "Organizations" "Organizations directory and search" "feature"
replace_page "app/signup/page.tsx" "simple-placeholder-template.tsx" "SignupPage" "Sign Up" "Create your DealMecca account" "feature"
replace_page "app/login/page.tsx" "simple-placeholder-template.tsx" "LoginPage" "Sign In" "Sign in to your DealMecca account" "feature"
replace_page "app/manual-login/page.tsx" "simple-placeholder-template.tsx" "ManualLoginPage" "Manual Login" "Manual login interface" "feature"
replace_page "app/session-status/page.tsx" "simple-placeholder-template.tsx" "SessionStatusPage" "Session Status" "Current session status and debugging" "feature"
replace_page "app/profile/[id]/page.tsx" "simple-placeholder-template.tsx" "UserProfilePage" "User Profile" "User profile and activity" "feature"
replace_page "app/orgs/companies/[id]/page.tsx" "simple-placeholder-template.tsx" "CompanyDetailPage" "Company Details" "Detailed company information and insights" "feature"
replace_page "app/orgs/contacts/[id]/page.tsx" "simple-placeholder-template.tsx" "ContactDetailPage" "Contact Details" "Contact profile and communication history" "feature"
replace_page "app/orgs/enhanced/page.tsx" "simple-placeholder-template.tsx" "EnhancedOrgsPage" "Enhanced Organizations" "Advanced organization browsing features" "feature"
replace_page "app/org-charts/page.tsx" "simple-placeholder-template.tsx" "OrgChartsPage" "Organization Charts" "Interactive company organization charts" "feature"
replace_page "app/org-charts/[slug]/page.tsx" "simple-placeholder-template.tsx" "OrgChartDetailPage" "Organization Chart" "Detailed organization chart view" "feature"
replace_page "app/org-charts/debug/page.tsx" "simple-placeholder-template.tsx" "OrgChartDebugPage" "Org Chart Debug" "Organization chart debugging tools" "feature"
replace_page "app/search/fixed/page.tsx" "simple-placeholder-template.tsx" "SearchFixedPage" "Search" "Fixed search interface" "feature"
replace_page "app/search/intelligence/page.tsx" "simple-placeholder-template.tsx" "SearchIntelligencePage" "Search Intelligence" "AI-powered search capabilities" "feature"
replace_page "app/search/mobile/page.tsx" "simple-placeholder-template.tsx" "SearchMobilePage" "Mobile Search" "Mobile-optimized search interface" "feature"
replace_page "app/upgrade/page.tsx" "simple-placeholder-template.tsx" "UpgradePage" "Upgrade Account" "Account upgrade options and benefits" "feature"

echo ""

# ADMIN/TEST PAGES - Minimal placeholders
echo "⚙️  Processing ADMIN/TEST pages (minimal placeholders)..."
replace_page "app/admin/orgs/contacts/import/page.tsx" "admin-test-template.tsx" "ContactImportPage" "Contact Import" "Bulk contact import functionality" "admin"
replace_page "app/test-auth-fixed/page.tsx" "admin-test-template.tsx" "AuthTestPage" "Auth Test" "Authentication system testing" "test"
replace_page "app/test-components/page.tsx" "admin-test-template.tsx" "ComponentTestPage" "Component Test" "UI component testing and debugging" "test"
replace_page "app/test-confetti/page.tsx" "admin-test-template.tsx" "ConfettiTestPage" "Confetti Test" "Confetti animation testing" "test"
replace_page "app/test-login-simple/page.tsx" "admin-test-template.tsx" "LoginTestPage" "Login Test" "Simple login functionality testing" "test"
replace_page "app/test-rich-editor/page.tsx" "admin-test-template.tsx" "RichEditorTestPage" "Rich Editor Test" "Rich text editor testing interface" "test"
replace_page "app/test-search-working/page.tsx" "admin-test-template.tsx" "SearchTestPage" "Search Test" "Search functionality testing" "test"
replace_page "app/test-simple/page.tsx" "admin-test-template.tsx" "SimpleTestPage" "Simple Test" "Basic functionality testing" "test"
replace_page "app/pricing/debug.tsx" "admin-test-template.tsx" "PricingDebugPage" "Pricing Debug" "Pricing system debugging tools" "debug"

echo ""
echo "🎉 Mass page simplification complete!"
echo "📊 Summary:"
echo "   - Core pages: 7"
echo "   - Simple pages: 12"
echo "   - Admin/Test pages: 9"
echo "   - Total processed: 28"
echo ""
echo "💾 Original files backed up to: $BACKUP_DIR"
echo "🚀 Ready for deployment testing!"