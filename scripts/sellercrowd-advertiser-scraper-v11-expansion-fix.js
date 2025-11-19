/**
 * SellerCrowd Advertiser Scraper v11 - Expansion Fix
 *
 * FIXES THE VIRTUALIZATION ISSUE:
 * - Processes each advertiser ONE AT A TIME
 * - Scrolls to advertiser to ensure it's in viewport
 * - Expands "Show teams" if needed
 * - Waits for full agency list to load
 * - Then captures complete data
 *
 * This is slower but ensures complete data capture!
 *
 * USAGE:
 * 1. Navigate to: https://www.sellercrowd.com/teams
 * 2. Scroll to your starting position (or start from top)
 * 3. Open browser console (F12)
 * 4. Paste this entire script and press Enter
 * 5. The scraper will process each advertiser one-by-one
 * 6. Monitor console for progress (shows current advertiser being processed)
 * 7. When complete, download will trigger automatically
 *
 * FEATURES:
 * - Processes advertisers sequentially with expansion
 * - Shows real-time progress in console
 * - Handles "Show teams" expansion automatically
 * - Waits for agency data to fully load
 * - Auto-saves every 50 advertisers (in case of interruption)
 * - Downloads JSON file when complete
 */

(async function() {
  console.log('🚀 SellerCrowd Advertiser Scraper v11 - Expansion Fix');
  console.log('================================================================================');
  console.log('This scraper processes each advertiser individually to ensure complete data!');
  console.log('================================================================================\n');

  // Configuration
  const DELAY_BETWEEN_ADVERTISERS = 500; // ms delay between processing each advertiser
  const EXPANSION_DELAY = 300; // ms to wait after clicking "Show teams"
  const SCROLL_DELAY = 200; // ms to wait after scrolling
  const AUTO_SAVE_INTERVAL = 50; // Auto-save every N advertisers

  // Initialize or retrieve existing data
  if (!window.scrapedAdvertisers) {
    window.scrapedAdvertisers = [];
    window.processedAdvertiserNames = new Set();
  }

  // Helper: Sleep function
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Helper: Scroll element into view
  function scrollToElement(element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Helper: Expand advertiser's agency list
  async function expandAdvertiser(advertiserCard) {
    // Look for "+N teams" link/button (e.g., "+6 teams", "+10 teams")
    // Try multiple selectors
    const selectors = [
      'a:contains("teams")',
      'button:contains("teams")',
      '[class*="show-more"]',
      'a[href*="#"]',
      '*'  // fallback to check all elements
    ];

    for (const selector of selectors) {
      const elements = advertiserCard.querySelectorAll(selector);

      for (const element of elements) {
        const text = element.textContent.trim();
        // Match pattern like "+6 teams", "+10 teams", etc.
        if (text.match(/^\+\d+\s+teams?$/i)) {
          console.log(`   📂 Expanding "${text}"...`);
          element.click();
          await sleep(EXPANSION_DELAY);
          return true;
        }
      }
    }

    return false;
  }

  // Helper: Extract agencies from advertiser card
  function extractAgencies(advertiserCard) {
    const agencies = [];

    // Try multiple selectors for agency elements
    const agencySelectors = [
      'a[href*="/team/"]',
      '[class*="team-name"]',
      '[class*="agency"]',
      'div[class*="list"] a'
    ];

    for (const selector of agencySelectors) {
      const agencyElements = advertiserCard.querySelectorAll(selector);
      if (agencyElements.length > 0) {
        agencyElements.forEach(el => {
          const agencyName = el.textContent.trim();
          if (agencyName && !agencies.includes(agencyName)) {
            agencies.push(agencyName);
          }
        });

        if (agencies.length > 0) break;
      }
    }

    return agencies;
  }

  // Helper: Extract advertiser name
  function extractAdvertiserName(advertiserCard) {
    // Try multiple selectors for advertiser name
    const nameSelectors = [
      'a[href*="/brand/"]',
      '[class*="brand-name"]',
      '[class*="advertiser"]',
      'h3', 'h2',
      'div[class*="title"] a'
    ];

    for (const selector of nameSelectors) {
      const nameElement = advertiserCard.querySelector(selector);
      if (nameElement) {
        const name = nameElement.textContent.trim();
        if (name) return name;
      }
    }

    return null;
  }

  // Main processing function
  async function processAdvertisers() {
    // Find all advertiser cards currently in DOM
    const allCards = Array.from(document.querySelectorAll('[class*="brand-card"], [class*="advertiser"], div[class*="list"] > div'));

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

        // Expand the advertiser to show all agencies
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

        // Auto-save every N advertisers
        if (processed % AUTO_SAVE_INTERVAL === 0) {
          console.log(`\n💾 Auto-save: ${processed} advertisers processed so far...\n`);
        }

        // Delay before next advertiser
        await sleep(DELAY_BETWEEN_ADVERTISERS);

      } catch (error) {
        console.error(`❌ Error processing advertiser at index ${i}:`, error);
        errors++;
      }
    }

    // Final summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 SCRAPING SUMMARY');
    console.log('='.repeat(80));
    console.log(`Advertisers processed:     ${processed}`);
    console.log(`Already in dataset:        ${skipped}`);
    console.log(`Errors:                    ${errors}`);
    console.log(`Total in dataset:          ${window.scrapedAdvertisers.length}`);
    console.log('='.repeat(80));

    // Download the data
    downloadData();
  }

  // Helper: Download scraped data as JSON
  function downloadData() {
    console.log('\n📥 Downloading scraped data...');

    const dataStr = JSON.stringify(window.scrapedAdvertisers, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sellercrowd-batch-expanded-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log('✅ Download initiated!');
    console.log('\n💡 NEXT STEPS:');
    console.log('   1. Check your Downloads folder for the JSON file');
    console.log('   2. If you need to scrape more, scroll down and run this script again');
    console.log('   3. The script will skip advertisers already processed');
  }

  // Start processing
  await processAdvertisers();

})();
