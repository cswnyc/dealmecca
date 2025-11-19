/**
 * SellerCrowd Card Validator
 *
 * Diagnoses why the scraper finds 871 cards but can't extract names
 *
 * USAGE:
 * 1. Navigate to: https://www.sellercrowd.com/teams
 * 2. Open browser console (F12)
 * 3. Paste this script and press Enter
 */

(function() {
  console.log('🔬 SellerCrowd Card Validator');
  console.log('='.repeat(80));

  // Check what the scraper is finding
  const allCards = document.querySelectorAll('.org-charts-advertisers-tab-list-item');
  console.log(`\n📊 Found ${allCards.length} elements with class 'org-charts-advertisers-tab-list-item'`);

  // Check first 10 cards in detail
  console.log('\n🔍 Checking first 10 cards:\n');

  let validCards = 0;
  let invalidCards = 0;

  Array.from(allCards).slice(0, 10).forEach((card, idx) => {
    console.log(`Card ${idx + 1}:`);
    console.log(`  Class: ${card.className}`);

    // Check for entity-title
    const titleEl = card.querySelector('[data-testid="entity-title"]');
    if (titleEl) {
      console.log(`  ✅ Has entity-title: "${titleEl.textContent.trim()}"`);
      validCards++;
    } else {
      console.log(`  ❌ Missing entity-title`);
      invalidCards++;
    }

    // Check for teams-list
    const teamsEl = card.querySelector('[data-testid="teams-list"]');
    if (teamsEl) {
      const agencies = teamsEl.querySelectorAll('div[data-label]');
      console.log(`  ✅ Has teams-list with ${agencies.length} agencies`);

      // Show first 3 agencies
      Array.from(agencies).slice(0, 3).forEach(ag => {
        console.log(`     - ${ag.getAttribute('data-label')}`);
      });
    } else {
      console.log(`  ❌ Missing teams-list`);
    }

    // Show element depth/nesting
    let depth = 0;
    let parent = card.parentElement;
    while (parent && depth < 10) {
      depth++;
      parent = parent.parentElement;
    }
    console.log(`  Nesting depth: ${depth}`);

    console.log('');
  });

  console.log('='.repeat(80));
  console.log(`Summary from first 10 cards:`);
  console.log(`  Valid cards (with entity-title): ${validCards}`);
  console.log(`  Invalid cards (missing entity-title): ${invalidCards}`);

  // Check if cards are unique or duplicates
  console.log('\n🔍 Checking for duplicates...');
  const cardIds = new Set();
  const duplicateCount = Array.from(allCards).filter(card => {
    const id = card.getAttribute('data-id') || card.innerHTML.substring(0, 100);
    if (cardIds.has(id)) return true;
    cardIds.add(id);
    return false;
  }).length;

  console.log(`  Duplicate cards: ${duplicateCount}`);
  console.log(`  Unique cards: ${allCards.length - duplicateCount}`);

  // Alternative selector suggestions
  console.log('\n💡 Testing alternative selectors:');

  const alternatives = [
    '.org-charts-advertisers-tab-list-item:not(.nested)',
    '.org-charts-advertisers-tab-list-item[data-testid]',
    '.org-charts-advertisers-tab-list-item:has([data-testid="entity-title"])',
    'div.org-charts-advertisers-tab-list-item > [data-testid="entity-title"]'
  ];

  alternatives.forEach(selector => {
    try {
      const found = document.querySelectorAll(selector);
      console.log(`  ${selector}: ${found.length} found`);
    } catch (e) {
      console.log(`  ${selector}: ERROR - ${e.message}`);
    }
  });

  console.log('\n='.repeat(80));
  console.log('💡 RECOMMENDATION:');
  console.log('   Share this output to help diagnose the issue.');
  console.log('='.repeat(80));
})();
