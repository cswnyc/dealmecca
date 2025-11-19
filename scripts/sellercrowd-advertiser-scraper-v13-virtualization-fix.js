/**
 * SellerCrowd Advertiser Scraper v13 - Virtualization Fix
 *
 * FIXES:
 * - Handles virtualized scrolling properly
 * - Re-queries cards on each iteration (no stale references)
 * - Validates card visibility before processing
 * - Filters out phantom/duplicate elements
 * - Better error handling and progress tracking
 *
 * USAGE:
 * 1. Navigate to: https://www.sellercrowd.com/teams
 * 2. Scroll to top (or your starting position)
 * 3. Open browser console (F12)
 * 4. Paste this entire script and press Enter
 * 5. Script will process visible cards and automatically scroll down
 * 6. When complete, downloads JSON file
 */

(async function() {
  console.log('🚀 SellerCrowd Advertiser Scraper v13 - Virtualization Fix');
  console.log('================================================================================');
  console.log('This version properly handles virtualized scrolling!');
  console.log('================================================================================\n');

  // Configuration
  const DELAY_BETWEEN_ADVERTISERS = 600; // Slower for virtualization
  const EXPANSION_DELAY = 500;
  const SCROLL_DELAY = 300;
  const AUTO_SAVE_INTERVAL = 25;
  const SCROLL_AMOUNT = 400; // Pixels to scroll down

  // Initialize or retrieve existing data
  if (!window.scrapedAdvertisers) {
    window.scrapedAdvertisers = [];
    window.processedAdvertiserNames = new Set();
  }

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Check if element is actually visible in viewport
  function isElementVisible(element) {
    if (!element) return false;

    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    // Element must be at least partially in viewport
    return (
      rect.top >= -100 && // Allow some margin above
      rect.top <= viewportHeight + 100 && // Allow some margin below
      rect.height > 0 && // Has height
      rect.width > 0 // Has width
    );
  }

  // Validate that card is fully rendered and has required elements
  function isCardValid(card) {
    if (!card) return false;

    // Must have entity-title
    const titleElement = card.querySelector('[data-testid="entity-title"]');
    if (!titleElement || !titleElement.textContent.trim()) {
      return false;
    }

    // Must have teams-list (even if empty)
    const teamsListContainer = card.querySelector('[data-testid="teams-list"]');
    if (!teamsListContainer) {
      return false;
    }

    return true;
  }

  function scrollToElement(element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Expand advertiser by clicking on +N teams text
  async function expandAdvertiser(card) {
    const teamsListContainer = card.querySelector('[data-testid="teams-list"]');
    if (!teamsListContainer) return false;

    // Check if there's "+N teams" text
    const text = teamsListContainer.textContent;
    const match = text.match(/\+(\d+)\s+teams?/i);

    if (match) {
      const expectedTotal = parseInt(match[1]) + 3; // +N means N more beyond the 3 shown

      // Find all child elements and look for one containing the "+N teams" text
      const allDivs = teamsListContainer.querySelectorAll('div');
      for (const div of allDivs) {
        if (div.textContent.trim().match(/^\+\d+\s+teams?$/i)) {
          console.log(`   📂 Expanding "${div.textContent.trim()}" (expecting ~${expectedTotal} total agencies)...`);
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

  // Get currently visible and valid cards
  function getVisibleValidCards() {
    const allCards = Array.from(document.querySelectorAll('.org-charts-advertisers-tab-list-item'));

    return allCards.filter(card => {
      // Must be visible in viewport
      if (!isElementVisible(card)) return false;

      // Must be valid (have required elements)
      if (!isCardValid(card)) return false;

      return true;
    });
  }

  // Main processing function
  async function processVisibleAdvertisers() {
    let totalProcessed = 0;
    let totalSkipped = 0;
    let totalErrors = 0;
    let consecutiveNoNewCards = 0;
    const MAX_NO_NEW_CARDS = 5; // Stop after 5 scrolls with no new cards

    console.log('📋 Starting to process visible advertisers...\n');
    console.log('⚠️  IMPORTANT: Do not interact with the page while scraping!\n');

    while (consecutiveNoNewCards < MAX_NO_NEW_CARDS) {
      // Re-query cards each iteration (fresh DOM references)
      const visibleCards = getVisibleValidCards();

      console.log(`\n🔄 Scan: Found ${visibleCards.length} visible, valid cards in viewport`);

      if (visibleCards.length === 0) {
        console.log('   No valid cards found, scrolling down...');
        window.scrollBy(0, SCROLL_AMOUNT);
        await sleep(SCROLL_DELAY);
        consecutiveNoNewCards++;
        continue;
      }

      let processedThisRound = 0;

      for (let i = 0; i < visibleCards.length; i++) {
        const card = visibleCards[i];

        try {
          // Scroll card into view
          scrollToElement(card);
          await sleep(SCROLL_DELAY);

          // Extract advertiser name
          const advertiserName = extractAdvertiserName(card);

          if (!advertiserName) {
            console.log(`⚠️  Could not extract advertiser name, skipping...`);
            totalSkipped++;
            continue;
          }

          // Skip if already processed
          if (window.processedAdvertiserNames.has(advertiserName)) {
            console.log(`⏭️  Already processed: ${advertiserName}`);
            totalSkipped++;
            continue;
          }

          console.log(`📦 [${totalProcessed + 1}] Processing: ${advertiserName}`);

          // Try to expand
          const wasExpanded = await expandAdvertiser(card);

          // Extract agencies
          const agencies = extractAgencies(card);

          if (agencies.length === 0) {
            console.log(`   ⚠️  No agencies found for: ${advertiserName}`);
            totalErrors++;
            continue;
          }

          // Save the data
          window.scrapedAdvertisers.push({
            name: advertiserName,
            agencies: agencies
          });
          window.processedAdvertiserNames.add(advertiserName);

          console.log(`   ✅ Captured ${agencies.length} agencies${wasExpanded ? ' (expanded)' : ''}`);
          totalProcessed++;
          processedThisRound++;

          // Auto-save
          if (totalProcessed % AUTO_SAVE_INTERVAL === 0) {
            console.log(`\n💾 Progress: ${totalProcessed} advertisers processed, ${window.scrapedAdvertisers.length} total in dataset\n`);
          }

          await sleep(DELAY_BETWEEN_ADVERTISERS);

        } catch (error) {
          console.error(`❌ Error processing advertiser:`, error);
          totalErrors++;
        }
      }

      // If we processed cards this round, reset the counter
      if (processedThisRound > 0) {
        consecutiveNoNewCards = 0;
      } else {
        consecutiveNoNewCards++;
        console.log(`   No new cards processed this round (${consecutiveNoNewCards}/${MAX_NO_NEW_CARDS})`);
      }

      // Scroll down to load more cards
      console.log('\n⬇️  Scrolling down to load more advertisers...');
      window.scrollBy(0, SCROLL_AMOUNT);
      await sleep(SCROLL_DELAY);
    }

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 SCRAPING SUMMARY');
    console.log('='.repeat(80));
    console.log(`Advertisers processed:     ${totalProcessed}`);
    console.log(`Already in dataset:        ${totalSkipped}`);
    console.log(`Errors:                    ${totalErrors}`);
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
    link.download = `sellercrowd-v13-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log('✅ Download initiated!');
    console.log('\n💡 TIPS:');
    console.log('   • Check Downloads folder for JSON file');
    console.log('   • If you need to continue, scroll to a new section and run script again');
    console.log('   • Already processed advertisers are automatically skipped');
    console.log('   • To reset and start fresh: delete window.scrapedAdvertisers\n');
  }

  await processVisibleAdvertisers();

})();
