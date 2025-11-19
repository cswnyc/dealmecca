/**
 * SellerCrowd Advertiser Scraper v12 - Final Working Version
 *
 * Based on actual HTML structure inspection
 *
 * USAGE:
 * 1. Navigate to: https://www.sellercrowd.com/teams
 * 2. Scroll to your starting position
 * 3. Open browser console (F12)
 * 4. Paste this entire script and press Enter
 */

(async function() {
  console.log('🚀 SellerCrowd Advertiser Scraper v12 - Final Working Version');
  console.log('================================================================================\n');

  // Configuration
  const DELAY_BETWEEN_ADVERTISERS = 500;
  const EXPANSION_DELAY = 400;
  const SCROLL_DELAY = 200;
  const AUTO_SAVE_INTERVAL = 50;

  // Initialize or retrieve existing data
  if (!window.scrapedAdvertisers) {
    window.scrapedAdvertisers = [];
    window.processedAdvertiserNames = new Set();
  }

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  function scrollToElement(element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Expand advertiser by clicking on +N teams text
  async function expandAdvertiser(card) {
    // Find the teams list container
    const teamsListContainer = card.querySelector('[data-testid="teams-list"]');
    if (!teamsListContainer) return false;

    // Check if there's "+N teams" text
    const text = teamsListContainer.textContent;
    const match = text.match(/\+(\d+)\s+teams?/i);

    if (match) {
      // Find all child elements and look for one containing the "+N teams" text
      const allDivs = teamsListContainer.querySelectorAll('div');
      for (const div of allDivs) {
        if (div.textContent.trim().match(/^\+\d+\s+teams?$/i)) {
          console.log(`   📂 Expanding "${div.textContent.trim()}"...`);
          div.click();
          await sleep(EXPANSION_DELAY);
          return true;
        }
      }

      // Fallback: Click on the container itself
      console.log(`   📂 Attempting expansion by clicking container...`);
      teamsListContainer.click();
      await sleep(EXPANSION_DELAY);
      return true;
    }

    return false;
  }

  // Extract agencies from card
  function extractAgencies(card) {
    const agencies = [];
    const teamsListContainer = card.querySelector('[data-testid="teams-list"]');

    if (!teamsListContainer) {
      return agencies;
    }

    // Find all agency items by data-label attribute
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

  // Main processing function
  async function processAdvertisers() {
    // Find all advertiser cards
    const allCards = Array.from(document.querySelectorAll('.org-charts-advertisers-tab-list-item'));

    if (allCards.length === 0) {
      console.error('❌ No advertiser cards found! Make sure you\'re on the teams page.');
      return;
    }

    console.log(`📋 Found ${allCards.length} advertiser cards in viewport\n`);
    console.log('Starting sequential processing with expansion...\n');

    let processed = 0;
    let skipped = 0;
    let errors = 0;

    for (let i = 0; i < allCards.length; i++) {
      const card = allCards[i];

      try {
        // Scroll card into view
        scrollToElement(card);
        await sleep(SCROLL_DELAY);

        // Extract advertiser name
        const advertiserName = extractAdvertiserName(card);

        if (!advertiserName) {
          console.log(`⚠️  [${i + 1}/${allCards.length}] Could not extract advertiser name, skipping...`);
          skipped++;
          continue;
        }

        // Skip if already processed
        if (window.processedAdvertiserNames.has(advertiserName)) {
          console.log(`⏭️  [${i + 1}/${allCards.length}] Already processed: ${advertiserName}`);
          skipped++;
          continue;
        }

        console.log(`📦 [${i + 1}/${allCards.length}] Processing: ${advertiserName}`);

        // Try to expand
        const wasExpanded = await expandAdvertiser(card);

        // Extract agencies
        const agencies = extractAgencies(card);

        if (agencies.length === 0) {
          console.log(`   ⚠️  No agencies found for: ${advertiserName}`);
          errors++;
          continue;
        }

        // Save the data
        window.scrapedAdvertisers.push({
          name: advertiserName,
          agencies: agencies
        });
        window.processedAdvertiserNames.add(advertiserName);

        console.log(`   ✅ Captured ${agencies.length} agencies${wasExpanded ? ' (expanded)' : ''}`);
        processed++;

        // Auto-save
        if (processed % AUTO_SAVE_INTERVAL === 0) {
          console.log(`\n💾 Auto-save: ${processed} advertisers processed so far...\n`);
        }

        await sleep(DELAY_BETWEEN_ADVERTISERS);

      } catch (error) {
        console.error(`❌ Error processing advertiser at index ${i}:`, error);
        errors++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 SCRAPING SUMMARY');
    console.log('='.repeat(80));
    console.log(`Advertisers processed:     ${processed}`);
    console.log(`Already in dataset:        ${skipped}`);
    console.log(`Errors:                    ${errors}`);
    console.log(`Total in dataset:          ${window.scrapedAdvertisers.length}`);
    console.log('='.repeat(80));

    downloadData();
  }

  function downloadData() {
    console.log('\n📥 Downloading scraped data...');

    const dataStr = JSON.stringify(window.scrapedAdvertisers, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sellercrowd-batch-v12-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log('✅ Download initiated!');
    console.log('\n💡 TIP: Scroll down and run this script again to continue scraping.');
    console.log('         Already processed advertisers will be skipped automatically.\n');
  }

  await processAdvertisers();

})();
