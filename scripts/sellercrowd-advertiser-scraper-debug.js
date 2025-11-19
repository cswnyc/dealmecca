/**
 * SellerCrowd Advertiser Scraper - DEBUG VERSION
 * This will inspect the page and show us the actual HTML structure
 */

console.clear();
console.log('🔍 DEBUGGING SellerCrowd Page Structure...');
console.log('================================================================================\n');

// 1. Find the advertiser list container
console.log('1️⃣ Looking for advertiser list container...\n');

const possibleContainers = [
  document.querySelector('main'),
  document.querySelector('[role="main"]'),
  document.querySelector('[class*="list"]'),
  document.querySelector('[class*="List"]'),
  document.querySelector('[class*="content"]'),
  document.querySelector('[class*="Content"]'),
].filter(el => el !== null);

console.log(`   Found ${possibleContainers.length} possible containers`);

// 2. Look for advertiser name elements
console.log('\n2️⃣ Looking for advertiser names...\n');

// These are the advertiser names we saw: "Acne Studios", "Aldi", "Hackensack Meridian Health"
const testNames = ['Acne Studios', 'Aldi', 'Hackensack'];

testNames.forEach(name => {
  const elements = Array.from(document.querySelectorAll('*'))
    .filter(el => el.textContent?.includes(name) && el.children.length < 5);

  if (elements.length > 0) {
    const el = elements[0];
    console.log(`   ✓ Found "${name}":`);
    console.log(`      Tag: ${el.tagName}`);
    console.log(`      Classes: ${el.className}`);
    console.log(`      Parent tag: ${el.parentElement?.tagName}`);
    console.log(`      Parent classes: ${el.parentElement?.className}`);
    console.log(`      Grandparent tag: ${el.parentElement?.parentElement?.tagName}`);
    console.log(`      Grandparent classes: ${el.parentElement?.parentElement?.className}`);
    console.log('');
  }
});

// 3. Look for "Last activity" text (this appears on each advertiser card)
console.log('3️⃣ Looking for "Last activity" patterns...\n');

const lastActivityElements = Array.from(document.querySelectorAll('*'))
  .filter(el => el.textContent?.includes('Last activity') && el.children.length === 0);

if (lastActivityElements.length > 0) {
  const el = lastActivityElements[0];
  console.log(`   ✓ Found "Last activity" (${lastActivityElements.length} total):`);
  console.log(`      Tag: ${el.tagName}`);
  console.log(`      Classes: ${el.className}`);
  console.log(`      Parent tag: ${el.parentElement?.tagName}`);
  console.log(`      Parent classes: ${el.parentElement?.className}`);

  // Try to find the card container
  let cardContainer = el;
  let depth = 0;
  while (cardContainer && depth < 10) {
    if (cardContainer.textContent?.includes('Acne Studios') ||
        cardContainer.textContent?.includes('Aldi') ||
        cardContainer.textContent?.includes('Hide teams')) {
      console.log(`      Card container (${depth} levels up):`);
      console.log(`         Tag: ${cardContainer.tagName}`);
      console.log(`         Classes: ${cardContainer.className}`);
      break;
    }
    cardContainer = cardContainer.parentElement;
    depth++;
  }
  console.log('');
}

// 4. Look for agency names (they have logos before them)
console.log('4️⃣ Looking for agency names...\n');

// We know "Billups LA", "Billups NY" are agencies under Acne Studios
const testAgencies = ['Billups LA', 'Billups NY', 'Digitas Chicago'];

testAgencies.forEach(name => {
  const elements = Array.from(document.querySelectorAll('*'))
    .filter(el => el.textContent?.trim() === name);

  if (elements.length > 0) {
    const el = elements[0];
    console.log(`   ✓ Found agency "${name}":`);
    console.log(`      Tag: ${el.tagName}`);
    console.log(`      Classes: ${el.className}`);
    console.log('');
  }
});

// 5. Show all unique class names on the page (for pattern matching)
console.log('5️⃣ All unique class name patterns on this page:\n');

const allClasses = new Set();
document.querySelectorAll('[class]').forEach(el => {
  el.className.split(' ').forEach(cls => {
    if (cls.trim()) allClasses.add(cls.trim());
  });
});

const sortedClasses = Array.from(allClasses).sort();
const relevantClasses = sortedClasses.filter(cls =>
  cls.toLowerCase().includes('card') ||
  cls.toLowerCase().includes('item') ||
  cls.toLowerCase().includes('row') ||
  cls.toLowerCase().includes('list') ||
  cls.toLowerCase().includes('advertiser') ||
  cls.toLowerCase().includes('company')
);

console.log('   Relevant class names (card/item/row/list/company):');
relevantClasses.slice(0, 20).forEach(cls => {
  console.log(`      - ${cls}`);
});

// 6. Test selector that finds all advertiser rows
console.log('\n6️⃣ Testing different selectors to find advertiser rows...\n');

const testSelectors = [
  'div[class*="Card"]',
  'div[class*="card"]',
  'div[class*="Row"]',
  'div[class*="row"]',
  'div[class*="Item"]',
  'div[class*="item"]',
  '[data-testid*="card"]',
  '[data-testid*="row"]',
  '[data-testid*="item"]',
];

testSelectors.forEach(selector => {
  try {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      // Check if any of these contain advertiser names
      const hasAdvertiser = Array.from(elements).some(el =>
        el.textContent?.includes('Last activity') &&
        (el.textContent?.includes('Acne') || el.textContent?.includes('Aldi'))
      );

      if (hasAdvertiser) {
        console.log(`   ✅ MATCH: "${selector}" found ${elements.length} elements with advertiser data`);
      } else {
        console.log(`   ⚠️  "${selector}" found ${elements.length} elements (but no advertiser data)`);
      }
    }
  } catch (e) {
    // Invalid selector
  }
});

console.log('\n' + '='.repeat(80));
console.log('📋 SUMMARY');
console.log('='.repeat(80));
console.log('Copy the above information and share it.');
console.log('I will then create a working scraper with the correct selectors!');
