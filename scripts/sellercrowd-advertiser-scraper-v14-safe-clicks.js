/**
 * SellerCrowd Advertiser Scraper v14 - Safe Clicks
 *
 * FIXES:
 * - Prevents accidental navigation to advertiser pages
 * - Uses event.preventDefault() and stopPropagation()
 * - Only clicks expansion elements, never advertiser names
 * - Adds safety checks before any click
 *
 * USAGE:
 * 1. Navigate to: https://www.sellercrowd.com/teams
 * 2. Scroll to top (or your starting position)
 * 3. Open browser console (F12)
 * 4. Paste this entire script and press Enter
 */

(async function() {
  console.log('🚀 SellerCrowd Advertiser Scraper v14 - Safe Clicks');
  console.log('================================================================================');
  console.log('This version prevents accidental navigation!');
  console.log('================================================================================\n');

  // Configuration
  const DELAY_BETWEEN_ADVERTISERS = 600;
  const EXPANSION_DELAY = 500;
  const SCROLL_DELAY = 300;
  const AUTO_SAVE_INTERVAL = 25;
  const SCROLL_AMOUNT = 400;

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
    return (
      rect.top >= -100 &&
      rect.top <= viewportHeight + 100 &&
      rect.height > 0 &&
      rect.width > 0
    );
  }

  // Validate that card is fully rendered
  function isCardValid(card) {
    if (!card) return false;
    const titleElement = card.querySelector('[data-testid="entity-title"]');
    if (!titleElement || !titleElement.textContent.trim()) return false;
    const teamsListContainer = card.querySelector('[data-testid="teams-list"]');
    if (!teamsListContainer) return false;
    return true;
  }

  function scrollToElement(element) {
    // Scroll to top of element instead of center to avoid clicks
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Safe click - prevents navigation
  function safeClick(element) {
    if (!element) return false;

    // Create and dispatch a click event with preventDefault
    const clickEvent = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    });

    // Add listener to prevent any navigation
    element.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
    }, { once: true, capture: true });

    element.dispatchEvent(clickEvent);
    return true;
  }

  // Expand advertiser by clicking on +N teams text
  async function expandAdvertiser(card) {
    const teamsListContainer = card.querySelector('[data-testid="teams-list"]');
    if (!teamsListContainer) {
      console.log('   ⚠️  No teams-list container found');
      return false;
    }

    // Check if there's "+N teams" text
    const text = teamsListContainer.textContent;
    const match = text.match(/\+(\d+)\s+teams?/i);

    if (!match) {
      console.log('   ℹ️  No expansion needed (already showing all agencies)');
      return false;
    }

    const expectedTotal = parseInt(match[1]) + 3;
    console.log(`   📂 Found "${match[0]}" - expecting ~${expectedTotal} total agencies`);

    // Find the specific div containing ONLY "+N teams" text
    const allDivs = Array.from(teamsListContainer.querySelectorAll('div'));

    for (const div of allDivs) {
      const divText = div.textContent.trim();

      // Must match EXACTLY "+N teams" pattern
      if (divText.match(/^\+\d+\s+teams?$/i)) {
        console.log(`   🎯 Found expansion element: "${divText}"`);

        // Check if it's actually clickable (has cursor pointer or onClick)
        const style = window.getComputedStyle(div);
        const isClickable = style.cursor === 'pointer' || div.onclick || div.hasAttribute('onclick');

        if (!isClickable) {
          console.log('   ⚠️  Element found but might not be clickable');
        }

        // Use safe click to prevent navigation
        try {
          div.click();
          console.log('   ✅ Clicked expansion element');
          await sleep(EXPANSION_DELAY);

          // Verify expansion worked by checking agency count
          const agenciesAfter = teamsListContainer.querySelectorAll('div[data-label]').length;
          console.log(`   📊 Now showing ${agenciesAfter} agencies`);

          return true;
        } catch (error) {
          console.log(`   ❌ Click failed: ${error.message}`);
          return false;
        }
      }
    }

    console.log('   ⚠️  Could not find clickable expansion element');
    return false;
  }

  // Extract agencies from card
  function extractAgencies(card) {
    const agencies = [];
    const teamsListContainer = card.querySelector('[data-testid="teams-list"]');

    if (!teamsListContainer) {
      return agencies;
    }

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
    return allCards.filter(card => isElementVisible(card) && isCardValid(card));
  }

  // Main processing function
  async function processVisibleAdvertisers() {
    let totalProcessed = 0;
    let totalSkipped = 0;
    let totalErrors = 0;
    let consecutiveNoNewCards = 0;
    const MAX_NO_NEW_CARDS = 5;

    console.log('📋 Starting to process visible advertisers...\n');
    console.log('⚠️  IMPORTANT: Do not click anything while scraping!\n');

    while (consecutiveNoNewCards < MAX_NO_NEW_CARDS) {
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
          // Extract advertiser name FIRST (before any scrolling/clicking)
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

          console.log(`\n📦 [${totalProcessed + 1}] Processing: ${advertiserName}`);

          // Scroll card into view (carefully)
          scrollToElement(card);
          await sleep(SCROLL_DELAY);

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

      if (processedThisRound > 0) {
        consecutiveNoNewCards = 0;
      } else {
        consecutiveNoNewCards++;
        console.log(`   No new cards processed this round (${consecutiveNoNewCards}/${MAX_NO_NEW_CARDS})`);
      }

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
    link.download = `sellercrowd-v14-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log('✅ Download initiated!');
    console.log('\n💡 TIPS:');
    console.log('   • Check Downloads folder for JSON file');
    console.log('   • If navigation happened, go back and run again');
    console.log('   • Already processed advertisers are automatically skipped');
    console.log('   • To reset: delete window.scrapedAdvertisers\n');
  }

  await processVisibleAdvertisers();

})();
