/**
 * SellerCrowd Expansion Element Tester
 *
 * Tests clicking on expansion elements to understand the structure
 *
 * USAGE:
 * 1. Navigate to: https://www.sellercrowd.com/teams
 * 2. Scroll to an advertiser with "+N teams"
 * 3. Open browser console (F12)
 * 4. Paste this script and press Enter
 */

(function() {
  console.log('🔬 SellerCrowd Expansion Element Tester');
  console.log('='.repeat(80));

  // Find first card with "+N teams"
  const allCards = Array.from(document.querySelectorAll('.org-charts-advertisers-tab-list-item'));
  console.log(`\n📋 Found ${allCards.length} total cards\n`);

  for (let i = 0; i < Math.min(5, allCards.length); i++) {
    const card = allCards[i];

    const advertiserName = card.querySelector('[data-testid="entity-title"]')?.textContent.trim();
    const teamsListContainer = card.querySelector('[data-testid="teams-list"]');

    if (!advertiserName || !teamsListContainer) continue;

    const text = teamsListContainer.textContent;
    const match = text.match(/\+(\d+)\s+teams?/i);

    if (match) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`CARD: ${advertiserName}`);
      console.log(`Expansion text found: "${match[0]}"`);
      console.log('='.repeat(80));

      // Find ALL elements in teams-list
      const allElements = teamsListContainer.querySelectorAll('*');
      console.log(`\nTotal elements in teams-list: ${allElements.length}`);

      // Find elements containing the exact text
      let foundElements = [];
      allElements.forEach((el, idx) => {
        const elText = el.textContent.trim();
        if (elText.match(/^\+\d+\s+teams?$/i)) {
          foundElements.push(el);
          console.log(`\n✓ Element ${idx} matches pattern:`);
          console.log(`  Tag: ${el.tagName}`);
          console.log(`  Classes: ${el.className}`);
          console.log(`  Text: "${elText}"`);
          console.log(`  Inner HTML (first 200 chars): ${el.innerHTML.substring(0, 200)}`);

          // Check parent
          const parent = el.parentElement;
          console.log(`  Parent tag: ${parent?.tagName}`);
          console.log(`  Parent classes: ${parent?.className}`);

          // Check if clickable
          const computed = window.getComputedStyle(el);
          console.log(`  Cursor: ${computed.cursor}`);
          console.log(`  Pointer events: ${computed.pointerEvents}`);
          console.log(`  Has onclick: ${!!el.onclick}`);
          console.log(`  Has click listeners: ${!!el.addEventListener}`);
        }
      });

      if (foundElements.length > 0) {
        console.log(`\n\n🎯 Found ${foundElements.length} matching elements. Testing click on first one...`);
        console.log(`\n⚠️  WATCH THE PAGE - the expansion should happen now!\n`);

        const testElement = foundElements[0];

        // Try multiple click methods
        console.log('Method 1: Regular click()');
        testElement.click();

        setTimeout(() => {
          const agenciesAfter = teamsListContainer.querySelectorAll('div[data-label]').length;
          console.log(`\n📊 Result: Now showing ${agenciesAfter} agencies`);

          if (agenciesAfter === 3) {
            console.log('❌ Click did not work - still showing 3 agencies');
            console.log('\nTrying Method 2: Click on parent...');
            testElement.parentElement?.click();

            setTimeout(() => {
              const agenciesAfter2 = teamsListContainer.querySelectorAll('div[data-label]').length;
              console.log(`📊 Result after parent click: ${agenciesAfter2} agencies`);

              if (agenciesAfter2 === 3) {
                console.log('❌ Parent click also did not work');
                console.log('\n💡 The element might need a different interaction (hover, double-click, etc.)');
              } else {
                console.log('✅ Parent click WORKED!');
              }
            }, 500);
          } else {
            console.log('✅ Click WORKED!');
          }
        }, 500);

        return; // Stop after first test
      } else {
        console.log('❌ No matching elements found in this card');
      }
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('Test complete');
  console.log('='.repeat(80));
})();
