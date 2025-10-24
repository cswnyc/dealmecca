/**
 * SellerCrowd DOM Inspector
 * Run this on a company page to identify the correct selectors for contacts
 */

console.log('🔍 SellerCrowd DOM Inspector');
console.log('================================================================================');

// Check for various possible contact card selectors
const possibleSelectors = [
  '[data-contact-card]',
  '[data-contact]',
  '.contact-card',
  '.contact',
  '[class*="contact"]',
  '[class*="Contact"]',
  '[class*="person"]',
  '[class*="Person"]',
  '[class*="member"]',
  '[class*="Member"]',
  '[class*="team"]',
  '[class*="Team"]',
  'article',
  '[role="article"]',
  '.card',
  '[class*="Card"]'
];

console.log('🔎 Testing possible selectors...\n');

possibleSelectors.forEach(selector => {
  try {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      console.log(`✅ Found ${elements.length} elements with: ${selector}`);

      // Show first element's structure
      if (elements.length > 0) {
        const first = elements[0];
        console.log(`   Sample HTML:`, first.outerHTML.substring(0, 200) + '...');
        console.log(`   Classes:`, first.className);
        console.log(`   Data attributes:`, Object.keys(first.dataset).join(', '));
        console.log('');
      }
    }
  } catch (e) {
    // Invalid selector, skip
  }
});

console.log('\n================================================================================');
console.log('📊 Page Structure Analysis');
console.log('================================================================================\n');

// Check main content area
const mainContent = document.querySelector('main') || document.querySelector('[role="main"]') || document.body;
console.log('Main content element:', mainContent.tagName, mainContent.className);

// Find all headings (company name, section titles, etc.)
const headings = document.querySelectorAll('h1, h2, h3');
console.log('\n📝 Headings found:');
headings.forEach(h => {
  console.log(`  ${h.tagName}: ${h.textContent.trim().substring(0, 80)}`);
});

// Look for any elements with person names (likely contacts)
console.log('\n👤 Looking for person-like content...');
const allText = Array.from(document.querySelectorAll('*')).filter(el => {
  const text = el.textContent;
  // Look for patterns like "FirstName LastName" or titles
  return text.match(/^[A-Z][a-z]+ [A-Z][a-z]+$/) ||
         text.match(/Manager|Director|VP|President|Analyst|Coordinator/);
});

console.log(`Found ${allText.length} elements with person/title content`);
if (allText.length > 0) {
  console.log('Sample elements:');
  allText.slice(0, 5).forEach(el => {
    console.log(`  ${el.tagName}.${el.className}: ${el.textContent.substring(0, 60)}`);
    console.log(`    Parent: ${el.parentElement?.tagName}.${el.parentElement?.className}`);
  });
}

console.log('\n================================================================================');
console.log('🎯 Next Steps:');
console.log('================================================================================');
console.log('1. Review the selectors above that found elements');
console.log('2. Inspect the HTML structure in DevTools');
console.log('3. Update the scraper with the correct selectors');
console.log('\nYou can also manually inspect an element by running:');
console.log('  document.querySelectorAll("YOUR_SELECTOR_HERE")');
console.log('================================================================================');
