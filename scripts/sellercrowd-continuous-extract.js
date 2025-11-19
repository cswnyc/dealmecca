/**
 * SellerCrowd Continuous Extraction Scraper
 *
 * Automatically extracts as you scroll!
 *
 * WORKFLOW:
 * 1. Navigate to: https://www.sellercrowd.com/teams
 * 2. Manually expand visible advertisers (click "+N teams")
 * 3. Open console (F12) and paste this script
 * 4. The script will extract visible advertisers
 * 5. As you scroll down, it auto-extracts new ones
 * 6. Type: stopExtraction() to stop
 * 7. Type: downloadData() to download anytime
 */

(function() {
  console.log('🚀 SellerCrowd Continuous Extraction - Auto-Scroll Mode');
  console.log('================================================================================');
  console.log('This script extracts advertisers as you scroll!');
  console.log('================================================================================\n');

  // Initialize or retrieve existing data
  if (!window.scrapedAdvertisers) {
    window.scrapedAdvertisers = [];
    window.processedAdvertiserNames = new Set();
  }

  let isRunning = true;
  let lastProcessTime = Date.now();
  const PROCESS_INTERVAL = 1000; // Check for new cards every 1 second
  const AUTO_DOWNLOAD_INTERVAL = 50; // Auto-download every 50 new advertisers

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
    return !text.match(/\+(\d+)\s+teams?/i);
  }

  // Check if element is visible in viewport
  function isElementVisible(element) {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    return (
      rect.top >= -200 &&
      rect.top <= viewportHeight + 200 &&
      rect.height > 0 &&
      rect.width > 0
    );
  }

  // Process visible advertisers
  function processVisible() {
    if (!isRunning) return;

    const allCards = Array.from(document.querySelectorAll('.org-charts-advertisers-tab-list-item'));
    const visibleCards = allCards.filter(card => isElementVisible(card));

    let newProcessed = 0;
    let needExpansion = 0;

    visibleCards.forEach(card => {
      const advertiserName = extractAdvertiserName(card);
      if (!advertiserName) return;

      // Check if expanded
      const expanded = isExpanded(card);
      const agencies = extractAgencies(card);

      // Check if we already have this advertiser
      const existingIndex = window.scrapedAdvertisers.findIndex(a => a.name === advertiserName);

      if (existingIndex >= 0) {
        // Already captured - check if we should update (more agencies now)
        const existing = window.scrapedAdvertisers[existingIndex];
        if (agencies.length > existing.agencies.length) {
          // Update with more complete data
          window.scrapedAdvertisers[existingIndex] = {
            name: advertiserName,
            agencies: agencies
          };
          console.log(`🔄 [${window.scrapedAdvertisers.length}] ${advertiserName} - UPDATED: ${existing.agencies.length} → ${agencies.length} agencies`);
          newProcessed++;
        }
        return; // Already processed, no update needed
      }

      // New advertiser
      if (!expanded && agencies.length === 3) {
        needExpansion++;
        return; // Wait for expansion
      }

      // Save the data
      window.scrapedAdvertisers.push({
        name: advertiserName,
        agencies: agencies
      });
      window.processedAdvertiserNames.add(advertiserName);

      console.log(`✅ [${window.scrapedAdvertisers.length}] ${advertiserName} - ${agencies.length} agencies`);
      newProcessed++;

      // Auto-download every N advertisers
      if (window.scrapedAdvertisers.length % AUTO_DOWNLOAD_INTERVAL === 0) {
        console.log(`\n💾 Auto-downloading progress (${window.scrapedAdvertisers.length} total)...\n`);
        window.downloadData();
      }
    });

    if (needExpansion > 0) {
      console.log(`⚠️  ${needExpansion} visible advertisers need expansion - click their "+N teams" links`);
    }

    if (newProcessed > 0) {
      lastProcessTime = Date.now();
    }
  }

  // Download function (exposed globally)
  window.downloadData = function() {
    console.log('📥 Downloading scraped data...');

    const dataStr = JSON.stringify(window.scrapedAdvertisers, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sellercrowd-continuous-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log(`✅ Downloaded ${window.scrapedAdvertisers.length} advertisers`);
  };

  // Stop function (exposed globally)
  window.stopExtraction = function() {
    isRunning = false;
    console.log('\n🛑 Extraction stopped');
    console.log(`📊 Total extracted: ${window.scrapedAdvertisers.length} advertisers`);
    console.log('💾 Downloading final data...\n');
    window.downloadData();
  };

  // Start continuous processing
  console.log('✅ Continuous extraction started!');
  console.log('📋 Initial scan...\n');

  // Initial process
  processVisible();

  // Set up continuous monitoring
  const intervalId = setInterval(() => {
    if (!isRunning) {
      clearInterval(intervalId);
      return;
    }
    processVisible();
  }, PROCESS_INTERVAL);

  console.log('\n💡 CONTROLS:');
  console.log('   • Scroll down and expand advertisers as you go');
  console.log('   • Type: stopExtraction() to stop');
  console.log('   • Type: downloadData() to download anytime');
  console.log('   • Auto-downloads every 50 advertisers\n');
  console.log(`📊 Currently in dataset: ${window.scrapedAdvertisers.length} advertisers\n`);

})();
