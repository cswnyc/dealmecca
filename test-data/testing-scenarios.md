# 🧪 DealMecca Testing Scenarios

## Quick Start Testing

### 1. **Immediate Visual Test** (5 minutes)
```bash
npm run dev
```
Visit these pages to see components in action:
- **Demo Page**: http://localhost:3000/orgs/enhanced
- **Admin Interface**: http://localhost:3000/admin/data-management

### 2. **Mobile Testing** (10 minutes)
1. Open Chrome DevTools (F12)
2. Click device toggle (Ctrl+Shift+M)
3. Test these breakpoints:
   - iPhone 12 Pro (390px)
   - iPad (768px)  
   - Desktop (1024px+)

### 3. **Data Upload Testing** (15 minutes)
1. Go to `/admin/data-management`
2. Upload `test-data/sample-companies.csv`
3. Test drag & drop functionality
4. Verify progress tracking works

---

## Detailed Testing Scenarios

### A. Component Stress Testing

#### EnhancedCompanyGrid
```javascript
// Test with different data scenarios:

// 1. Empty state
<EnhancedCompanyGrid companies={[]} loading={false} />

// 2. Loading state  
<EnhancedCompanyGrid companies={[]} loading={true} />

// 3. Single company
<EnhancedCompanyGrid companies={[mockCompanies[0]]} />

// 4. Large dataset (50+ companies)
<EnhancedCompanyGrid companies={largeMockData} />

// 5. Missing data fields
const incompleteCompany = {
  id: "test",
  name: "Test Company",
  // Missing: logoUrl, location, teamCount, etc.
}
```

#### EnhancedContactCard
```javascript
// Test scenarios:

// 1. Complete contact data
const completeContact = {
  fullName: "John Doe",
  title: "CEO", 
  email: "john@test.com",
  phone: "+1-555-0123",
  linkedinUrl: "https://linkedin.com/in/johndoe",
  seniority: "C-Level",
  company: { name: "Test Corp", verified: true }
}

// 2. Minimal contact data
const minimalContact = {
  fullName: "Jane Smith",
  title: "Manager"
  // Missing: email, phone, linkedin, etc.
}

// 3. Long names/titles (test overflow)
const longDataContact = {
  fullName: "Dr. Elizabeth Alexandra Catherine Smith-Johnson-Williams",
  title: "Senior Vice President of International Business Development and Strategic Partnerships"
}
```

### B. CSV Upload Testing

#### Valid CSV Files
- **Small file**: 10 companies (`sample-companies.csv`)
- **Medium file**: 100 companies
- **Large file**: 1000+ companies

#### Invalid CSV Files
```csv
# Test malformed-data.csv
company_name,industry,city
"Nike"  # Missing columns
,"Technology","SF"  # Missing name
"Test Company","","" # Empty fields
```

#### Error Scenarios
- Upload non-CSV file (try .txt, .pdf)
- Upload extremely large file (>50MB)
- Upload with special characters
- Upload with different encodings (UTF-8, Latin-1)

### C. Responsive Testing Checklist

#### Breakpoints to Test
- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px  
- **Desktop**: 1024px+

#### Elements to Verify
- [ ] Company cards stack properly on mobile
- [ ] Action buttons remain clickable (44px min)
- [ ] Text doesn't overflow containers
- [ ] Images load and scale correctly
- [ ] Navigation remains accessible
- [ ] Touch targets are appropriate size

### D. Performance Testing

#### Load Testing
```javascript
// Test with large datasets
const companies = Array.from({length: 500}, (_, i) => ({
  id: `company-${i}`,
  name: `Company ${i}`,
  // ... other fields
}));

// Measure performance
console.time('EnhancedCompanyGrid render');
// Render component
console.timeEnd('EnhancedCompanyGrid render');
```

#### Memory Testing
- Monitor DevTools Performance tab
- Check for memory leaks during navigation
- Verify image loading doesn't cause issues

### E. Cross-Browser Testing

#### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)  
- [ ] Edge (latest)

#### Mobile Browsers
- [ ] iOS Safari
- [ ] Chrome Mobile
- [ ] Samsung Internet
- [ ] Firefox Mobile

#### Common Issues to Check
- CSS Grid/Flexbox compatibility
- Touch event handling
- File upload functionality
- Animation performance

---

## Testing Tools & Commands

### Development Server
```bash
npm run dev          # Start development server
npm run build        # Test production build
npm run start        # Test production server
```

### Browser Testing
```bash
# Install browser testing tools
npm install -D @playwright/test
npx playwright install

# Run automated tests
npx playwright test
```

### Mobile Testing
```bash
# Use Chrome DevTools device simulation
# Or test on real devices:
# - Connect via USB debugging (Android)
# - Use Safari Web Inspector (iOS)
```

### Performance Testing
```bash
# Lighthouse testing
npm install -g lighthouse
lighthouse http://localhost:3000/orgs/enhanced --view
```

---

## Expected Results

### ✅ Success Criteria
- All components render without console errors
- Mobile interface is fully functional  
- CSV upload processes correctly
- Page load times under 3 seconds
- No accessibility warnings
- Works across all target browsers

### ⚠️ Known Limitations
- Logo loading depends on external CDN
- CSV processing limited to 100k records
- Mobile gestures require touch-enabled device
- Some animations may be reduced on low-end devices

---

## Bug Reporting Template

When testing, report issues using this format:

```
**Bug Title**: Brief description

**Environment**: 
- Browser: Chrome 119
- Device: iPhone 12 Pro  
- OS: iOS 16.5
- Screen size: 390x844

**Steps to Reproduce**:
1. Navigate to /orgs/enhanced
2. Click on company card
3. Observe issue

**Expected**: Component should...
**Actual**: Component does...

**Screenshot**: [attach image]
```

This comprehensive testing approach ensures your enhanced DealMecca components are rock-solid before deployment! 🚀
