/**
 * SellerCrowd Advertiser Scraper v15 - SPAN Click with Mouse Events
 *
 * FIXES:
 * - Clicks the SPAN element (not div)
 * - Simulates real mouse events (mousedown, mouseup, click)
 * - Provides coordinates and event properties
 *
 * USAGE:
 * 1. Navigate to: https://www.sellercrowd.com/teams
 * 2. Scroll to top
 * 3. Open browser console (F12)
 * 4. Paste this entire script and press Enter
 */

(async function() {
  console.log('🚀 SellerCrowd Advertiser Scraper v15 - SPAN Click');
  console.log('================================================================================');
  console.log('This version simulates real mouse events on SPAN elements!');
  console.log('================================================================================\n');

  // Configuration
  const DELAY_BETWEEN_ADVERTISERS = 600;
  const EXPANSION_DELAY = 700; // Longer to ensure expansion completes
  const SCROLL_DELAY = 300;
  const AUTO_SAVE_INTERVAL = 25;
  const SCROLL_AMOUNT = 400;

  // Initialize or retrieve existing data
  if (!window.scrapedAdvertisers) {
    window.scrapedAdvertisers = [];
    window.processedAdvertiserNames = new Set();
  }

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Simulate realistic mouse click with full event sequence
  function simulateRealClick(element) {
    if (!element) return false;

    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const eventOptions = {
      view: window,
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y,
      screenX: x,
      screenY: y,
      button: 0,
      buttons: 1
    };

    // Full mouse event sequence like a real click
    const mousedownEvent = new MouseEvent('mousedown', eventOptions);
    const mouseupEvent = new MouseEvent('mouseup', eventOptions);
    const clickEvent = new MouseEvent('click', eventOptions);

    element.dispatchEvent(mousedownEvent);
    element.dispatchEvent(mouseupEvent);
    element.dispatchEvent(clickEvent);

    return true;
  }

  // Check if element is visible in viewport
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

  // Validate card structure
  function isCardValid(card) {
    if (!card) return false;
    const titleElement = card.querySelector('[data-testid="entity-title"]');
    if (!titleElement || !titleElement.textContent.trim()) return false;
    const teamsListContainer = card.querySelector('[data-testid="teams-list"]');
    if (!teamsListContainer) return false;
    return true;
  }

  function scrollToElement(element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Expand advertiser by clicking SPAN element
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
      console.log('   ℹ️  Already expanded');
      return false;
    }

    const expectedTotal = parseInt(match[1]) + 3;
    console.log(`   📂 Found "${match[0]}" - expecting ~${expectedTotal} agencies`);

    // Count before expansion
    const agenciesBefore = teamsListContainer.querySelectorAll('div[data-label]').length;
    console.log(`   📊 Currently showing: ${agenciesBefore} agencies`);

    // Find the SPAN element with the expansion text
    const allSpans = teamsListContainer.querySelectorAll('span');
    let foundSpan = null;

    for (const span of allSpans) {
      const spanText = span.textContent.trim();
      if (spanText.match(/^\+\d+\s+teams?$/i)) {
        foundSpan = span;
        break;
      }
    }

    if (!foundSpan) {
      console.log('   ❌ Could not find SPAN with expansion text');
      return false;
    }

    console.log(`   🎯 Found SPAN element, simulating click...`);

    // Simulate real click
    simulateRealClick(foundSpan);

    // Wait for expansion
    await sleep(EXPANSION_DELAY);

    // Verify expansion worked
    const agenciesAfter = teamsListContainer.querySelectorAll('div[data-label]').length;
    console.log(`   📊 After click: ${agenciesAfter} agencies`);

    if (agenciesAfter > agenciesBefore) {
      console.log(`   ✅ Expansion WORKED! (+${agenciesAfter - agenciesBefore} agencies)`);
      return true;
    } else {
      console.log(`   ❌ Expansion failed (still ${agenciesAfter} agencies)`);
      return false;
    }
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
    console.log('⚠️  IMPORTANT: Do not interact with the page while scraping!\n');

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
          // Extract advertiser name FIRST
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

          // Scroll card into view
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
    link.download = `sellercrowd-v15-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log('✅ Download initiated!');
    console.log('\n💡 TIPS:');
    console.log('   • Check Downloads folder for JSON file');
    console.log('   • Expansion success will show "+N agencies" in logs');
    console.log('   • If still getting 3 agencies, try manual extraction script\n');
  }

  await processVisibleAdvertisers();

})();
