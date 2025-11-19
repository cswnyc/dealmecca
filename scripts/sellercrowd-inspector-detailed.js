/**
 * SellerCrowd Detailed Structure Inspector
 *
 * Shows the actual HTML content of cards
 */

(function() {
  console.log('🔍 SellerCrowd Detailed Inspector');
  console.log('='.repeat(80));

  // Use the correct selector we found
  const cards = document.querySelectorAll('.org-charts-advertisers-tab-list-item, [class*="org-charts-advertisers-tab-list-item"]');

  console.log(`\nFound ${cards.length} advertiser cards\n`);

  // Inspect first 3 cards in detail
  Array.from(cards).slice(0, 3).forEach((card, idx) => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`CARD ${idx + 1}:`);
    console.log('='.repeat(80));

    // Show full HTML (truncated to 500 chars)
    const html = card.innerHTML.substring(0, 800);
    console.log('\nHTML Preview:');
    console.log(html + '...\n');

    // Show text content
    console.log('Text Content:');
    console.log(card.textContent.substring(0, 300));

    // Find all links
    const links = card.querySelectorAll('a');
    console.log(`\n\nFound ${links.length} links:`);
    links.forEach((link, i) => {
      if (i < 10) { // Show first 10 links
        console.log(`   ${i + 1}. href: ${link.href}`);
        console.log(`      text: "${link.textContent.trim().substring(0, 50)}"`);
      }
    });

    // Check for expansion pattern in raw HTML
    if (card.innerHTML.includes('teams') || card.innerHTML.includes('Teams')) {
      console.log('\n✓ Contains "teams" text');
    }
  });

  console.log('\n' + '='.repeat(80));
  console.log('✓ Inspection complete - share this output with Claude');
  console.log('='.repeat(80));
})();
