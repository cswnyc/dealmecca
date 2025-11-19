/**
 * SellerCrowd Manual Extraction Scraper
 *
 * IMPORTANT: This scraper does NOT auto-expand!
 * You must manually expand advertisers before running.
 *
 * WORKFLOW:
 * 1. Navigate to: https://www.sellercrowd.com/teams
 * 2. Scroll through and MANUALLY CLICK each "+N teams" to expand them
 * 3. Once a section is expanded, open console (F12)
 * 4. Paste this script and press Enter
 * 5. It will extract only from the visible expanded advertisers
 * 6. Repeat for next section
 */

(async function() {
  console.log('🚀 SellerCrowd Manual Extraction Scraper');
  console.log('================================================================================');
  console.log('⚠️  This scraper extracts from visible advertisers WITHOUT expanding');
  console.log('    Make sure you manually expanded them first!');
  console.log('================================================================================\n');

  // Configuration
  const DELAY_BETWEEN_ADVERTISERS = 200; // Fast since no expansion

  // Initialize or retrieve existing data
  if (!window.scrapedAdvertisers) {
    window.scrapedAdvertisers = [];
    window.processedAdvertiserNames = new Set();
  }

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Extract agencies from card
  function extractAgencies(card) {
    const agencies = [];
    const teamsListContainer = card.querySelector('[data-testid="teams-list"]');

    if (!teamsListContainer) return agencies;

    const agencyItems = teamsListContainer.querySelectorAll('div[data-label]');
    agencyItems.forEach(item => {
      const agencyName = item.getAttribute('data-label');
      if (agencyName && !agencies.includes(agencyName)) {
        agencies.push(agencyName);
      }
    });

    return agencies;
  }

  // Extract advertiser name
  function extractAdvertiserName(card) {
    const nameElement = card.querySelector('[data-testid="entity-title"]');
    return nameElement ? nameElement.textContent.trim() : null;
  }

  // Check if advertiser is expanded
  function isExpanded(card) {
    const teamsListContainer = card.querySelector('[data-testid="teams-list"]');
    if (!teamsListContainer) return false;

    const text = teamsListContainer.textContent;
    const hasExpandText = text.match(/\+(\d+)\s+teams?/i);

    return !hasExpandText; // If no "+N teams" text, it's expanded
  }

  // Check if element is visible in viewport
  function isElementVisible(element) {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    return (
      rect.top >= -200 && // Allow some margin above
      rect.top <= viewportHeight + 200 && // Allow some margin below
      rect.height > 0 &&
      rect.width > 0
    );
  }

  // Main processing function
  async function processVisibleAdvertisers() {
    const allCards = Array.from(document.querySelectorAll('.org-charts-advertisers-tab-list-item'));

    // Filter to only visible cards
    const visibleCards = allCards.filter(card => isElementVisible(card));

    console.log(`📋 Found ${allCards.length} total cards, ${visibleCards.length} visible in viewport\n`);

    let processed = 0;
    let skipped = 0;
    let needsExpansion = 0;

    for (let i = 0; i < visibleCards.length; i++) {
      const card = visibleCards[i];

      try {
        const advertiserName = extractAdvertiserName(card);

        if (!advertiserName) {
          continue;
        }

        // Skip if already processed (silently)
        if (window.processedAdvertiserNames.has(advertiserName)) {
          skipped++;
          continue;
        }

        // Check if expanded
        const expanded = isExpanded(card);
        const agencies = extractAgencies(card);

        if (!expanded && agencies.length === 3) {
          console.log(`⚠️  [${i + 1}/${visibleCards.length}] ${advertiserName} - NOT EXPANDED (has 3 agencies, probably minimized)`);
          needsExpansion++;
          continue;
        }

        console.log(`📦 [${i + 1}/${visibleCards.length}] ${advertiserName} - ✅ Captured ${agencies.length} agencies`);

        // Save the data
        window.scrapedAdvertisers.push({
          name: advertiserName,
          agencies: agencies
        });
        window.processedAdvertiserNames.add(advertiserName);
        processed++;

        await sleep(DELAY_BETWEEN_ADVERTISERS);

      } catch (error) {
        console.error(`❌ Error processing advertiser at index ${i}:`, error);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 EXTRACTION SUMMARY');
    console.log('='.repeat(80));
    console.log(`Advertisers processed:      ${processed}`);
    console.log(`Already in dataset:         ${skipped}`);
    console.log(`Need manual expansion:      ${needsExpansion}`);
    console.log(`Total in dataset:           ${window.scrapedAdvertisers.length}`);
    console.log('='.repeat(80));

    if (needsExpansion > 0) {
      console.log(`\n⚠️  ${needsExpansion} advertisers were not expanded!`);
      console.log('   Go back, manually expand them, and run this script again.');
      console.log('   Already processed advertisers will be skipped automatically.\n');
    }

    if (processed > 0) {
      downloadData();
    } else {
      console.log('\n💡 No new advertisers extracted. Did you manually expand them first?');
    }
  }

  function downloadData() {
    console.log('\n📥 Downloading scraped data...');

    const dataStr = JSON.stringify(window.scrapedAdvertisers, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sellercrowd-manual-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log('✅ Download initiated!');
    console.log('\n💡 NEXT STEPS:');
    console.log('   1. Scroll to next section');
    console.log('   2. Manually expand advertisers');
    console.log('   3. Run this script again');
    console.log('   4. Already processed advertisers will be skipped\n');
  }

  await processVisibleAdvertisers();

})();
