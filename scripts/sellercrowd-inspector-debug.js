/**
 * SellerCrowd Structure Inspector
 *
 * This debug script helps us understand the HTML structure
 * so we can build correct selectors
 *
 * USAGE:
 * 1. Navigate to: https://www.sellercrowd.com/teams
 * 2. Open console (F12)
 * 3. Paste this script and press Enter
 * 4. Check the console output to see the structure
 */

(function() {
  console.log('🔍 SellerCrowd Structure Inspector');
  console.log('='.repeat(80));

  // Try to find the main container
  console.log('\n1. Looking for main container...');
  const possibleContainers = [
    { selector: '[class*="list"]', desc: 'Elements with "list" in class' },
    { selector: '[class*="grid"]', desc: 'Elements with "grid" in class' },
    { selector: 'main', desc: 'Main element' },
    { selector: '[role="main"]', desc: 'Role=main' },
    { selector: 'div[class*="container"]', desc: 'Container divs' }
  ];

  possibleContainers.forEach(({ selector, desc }) => {
    const found = document.querySelectorAll(selector);
    if (found.length > 0) {
      console.log(`   ✓ Found ${found.length} ${desc}`);
    }
  });

  // Try to find advertiser cards
  console.log('\n2. Looking for advertiser cards...');
  const cardSelectors = [
    '[class*="card"]',
    '[class*="item"]',
    '[class*="brand"]',
    '[class*="advertiser"]',
    '[data-testid*="card"]',
    '[data-testid*="item"]'
  ];

  let bestCardSelector = null;
  let bestCardCount = 0;

  cardSelectors.forEach(selector => {
    const found = document.querySelectorAll(selector);
    if (found.length > 0) {
      console.log(`   Found ${found.length} elements with selector: ${selector}`);
      if (found.length > bestCardCount && found.length < 500) {
        bestCardCount = found.length;
        bestCardSelector = selector;
      }
    }
  });

  if (bestCardSelector) {
    console.log(`\n   → Best guess for cards: ${bestCardSelector} (${bestCardCount} elements)`);

    // Inspect first 3 cards
    console.log('\n3. Inspecting first 3 cards...');
    const cards = Array.from(document.querySelectorAll(bestCardSelector)).slice(0, 3);

    cards.forEach((card, idx) => {
      console.log(`\n   Card ${idx + 1}:`);
      console.log(`   ─────────────────────────────────────────────────────────────`);

      // Try to find advertiser name
      const nameSelectors = [
        { selector: 'a[href*="/brand/"]', desc: 'Link to /brand/' },
        { selector: 'h1', desc: 'H1' },
        { selector: 'h2', desc: 'H2' },
        { selector: 'h3', desc: 'H3' },
        { selector: '[class*="title"]', desc: 'Title class' },
        { selector: '[class*="name"]', desc: 'Name class' },
        { selector: '[class*="brand"]', desc: 'Brand class' }
      ];

      nameSelectors.forEach(({ selector, desc }) => {
        const nameEl = card.querySelector(selector);
        if (nameEl) {
          console.log(`   ✓ ${desc}: "${nameEl.textContent.trim().substring(0, 50)}"`);
        }
      });

      // Try to find agencies
      const agencySelectors = [
        { selector: 'a[href*="/team/"]', desc: 'Links to /team/' },
        { selector: '[class*="team"]', desc: 'Team class' },
        { selector: '[class*="agency"]', desc: 'Agency class' }
      ];

      agencySelectors.forEach(({ selector, desc }) => {
        const agencies = card.querySelectorAll(selector);
        if (agencies.length > 0) {
          console.log(`   ✓ ${desc}: ${agencies.length} found`);
          console.log(`      First agency: "${agencies[0].textContent.trim().substring(0, 40)}"`);
        }
      });

      // Look for +N teams pattern
      const allText = card.textContent;
      const teamsMatch = allText.match(/\+(\d+)\s+teams?/i);
      if (teamsMatch) {
        console.log(`   ✓ Found expansion link: "${teamsMatch[0]}"`);
      }

      // Show element structure
      console.log(`   Element tag: ${card.tagName}`);
      console.log(`   Element classes: ${card.className}`);
      if (card.id) console.log(`   Element ID: ${card.id}`);
    });
  } else {
    console.log('\n   ❌ Could not identify card selector');
    console.log('\n4. Showing all elements in viewport with text content:');

    const allElements = document.querySelectorAll('div, article, section');
    const filtered = Array.from(allElements)
      .filter(el => {
        const text = el.textContent.trim();
        return text.length > 20 && text.length < 200;
      })
      .slice(0, 5);

    filtered.forEach((el, idx) => {
      console.log(`\n   Element ${idx + 1}:`);
      console.log(`   Tag: ${el.tagName}, Class: ${el.className}`);
      console.log(`   Text: ${el.textContent.trim().substring(0, 100)}`);
    });
  }

  console.log('\n' + '='.repeat(80));
  console.log('💡 NEXT STEPS:');
  console.log('   1. Review the output above');
  console.log('   2. Share the console output with Claude');
  console.log('   3. We\'ll update the scraper with correct selectors');
  console.log('='.repeat(80));

})();
