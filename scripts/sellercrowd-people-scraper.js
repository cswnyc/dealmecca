/**
 * SellerCrowd People Continuous Extraction Scraper
 *
 * Automatically extracts people as you scroll!
 *
 * WORKFLOW:
 * 1. Navigate to: https://www.sellercrowd.com/people
 * 2. Open console (F12) and paste this script
 * 3. The script will extract visible people
 * 4. As you scroll down, it auto-extracts new ones
 * 5. Type: stopExtraction() to stop
 * 6. Type: downloadData() to download anytime
 */

(function() {
  console.log('🚀 SellerCrowd People Continuous Extraction - Auto-Scroll Mode');
  console.log('================================================================================');
  console.log('This script extracts people as you scroll!');
  console.log('================================================================================\n');

  // Initialize or retrieve existing data
  if (!window.scrapedPeople) {
    window.scrapedPeople = [];
    window.processedPeopleNames = new Set();
  }

  let isRunning = true;
  let lastProcessTime = Date.now();
  const PROCESS_INTERVAL = 1000; // Check for new cards every 1 second
  const AUTO_DOWNLOAD_INTERVAL = 50; // Auto-download every 50 new people

  // Extract person data from card
  function extractPersonData(card) {
    const data = {
      name: null,
      title: null,
      company: null,
      advertiser: null,
      handles: [],
      emails: [],
      linkedinUrl: null,
      lastActivity: null
    };

    // Extract name (look for the main heading)
    const nameElement = card.querySelector('h3, [class*="name"]');
    if (nameElement) {
      // Name might be in a link or direct text
      const nameLink = nameElement.querySelector('a');
      data.name = nameLink ? nameLink.textContent.trim() : nameElement.textContent.trim();
    }

    // Extract title and company (usually together like "Title @ Company")
    const titleElements = card.querySelectorAll('p, div[class*="title"], div[class*="role"]');
    for (const el of titleElements) {
      const text = el.textContent.trim();
      if (text.includes('@')) {
        // Split on @ to get title and company
        const parts = text.split('@').map(p => p.trim());
        data.title = parts[0];
        data.company = parts[1];
        break;
      }
    }

    // Extract advertiser (look for logo or advertiser name)
    const advertiserElement = card.querySelector('[class*="advertiser"], [data-testid*="advertiser"]');
    if (advertiserElement) {
      data.advertiser = advertiserElement.textContent.trim();
    }

    // Extract handles (agencies)
    const handlesSection = card.querySelector('[class*="handles"]');
    if (handlesSection) {
      const handlesText = handlesSection.textContent;
      const handlesMatch = handlesText.match(/Handles:\s*(.+)/);
      if (handlesMatch) {
        data.handles = handlesMatch[1].split(',').map(h => h.trim()).filter(h => h);
      }
    }

    // Extract emails (look for email patterns)
    const allText = card.textContent;
    const emailRegex = /[\w\.-]+@[\w\.-]+\.\w+/g;
    const emailMatches = allText.match(emailRegex);
    if (emailMatches) {
      data.emails = [...new Set(emailMatches)]; // Remove duplicates
    }

    // Extract LinkedIn URL
    const linkedinLink = card.querySelector('a[href*="linkedin.com"]');
    if (linkedinLink) {
      data.linkedinUrl = linkedinLink.href;
    }

    // Extract last activity
    const activityElement = card.querySelector('[class*="activity"], [class*="last-activity"]');
    if (activityElement) {
      const activityText = activityElement.textContent;
      const activityMatch = activityText.match(/Last activity:\s*(.+)/);
      if (activityMatch) {
        data.lastActivity = activityMatch[1].trim();
      }
    }

    return data;
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

  // Process visible people
  function processVisible() {
    if (!isRunning) return;

    // Try multiple possible selectors for people cards
    const possibleSelectors = [
      '.org-charts-people-tab-list-item',
      '[class*="people-tab-list-item"]',
      '[class*="person-card"]',
      '[data-testid*="person-card"]'
    ];

    let allCards = [];
    for (const selector of possibleSelectors) {
      const cards = Array.from(document.querySelectorAll(selector));
      if (cards.length > 0) {
        allCards = cards;
        console.log(`📍 Using selector: ${selector} (found ${cards.length} cards)`);
        break;
      }
    }

    if (allCards.length === 0) {
      console.log('⚠️  No people cards found. The page structure might have changed.');
      console.log('📋 Page HTML structure:');
      console.log(document.querySelector('main')?.innerHTML.substring(0, 500));
      return;
    }

    const visibleCards = allCards.filter(card => isElementVisible(card));
    let newProcessed = 0;

    visibleCards.forEach(card => {
      const personData = extractPersonData(card);

      if (!personData.name) {
        console.log('⚠️  Skipping card - no name found');
        return;
      }

      // Check if we already have this person
      const existingIndex = window.scrapedPeople.findIndex(p => p.name === personData.name);

      if (existingIndex >= 0) {
        // Already captured - check if we should update
        const existing = window.scrapedPeople[existingIndex];
        const hasMoreData =
          personData.emails.length > existing.emails.length ||
          personData.handles.length > existing.handles.length;

        if (hasMoreData) {
          // Update with more complete data
          window.scrapedPeople[existingIndex] = personData;
          console.log(`🔄 [${window.scrapedPeople.length}] ${personData.name} - UPDATED`);
          newProcessed++;
        }
        return; // Already processed
      }

      // New person
      window.scrapedPeople.push(personData);
      window.processedPeopleNames.add(personData.name);

      console.log(`✅ [${window.scrapedPeople.length}] ${personData.name} - ${personData.title || 'No title'} @ ${personData.company || 'No company'}`);
      newProcessed++;

      // Auto-download every N people
      if (window.scrapedPeople.length % AUTO_DOWNLOAD_INTERVAL === 0) {
        console.log(`\n💾 Auto-downloading progress (${window.scrapedPeople.length} total)...\n`);
        window.downloadData();
      }
    });

    if (newProcessed > 0) {
      lastProcessTime = Date.now();
    }
  }

  // Download function (exposed globally)
  window.downloadData = function() {
    console.log('📥 Downloading scraped data...');

    const dataStr = JSON.stringify(window.scrapedPeople, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sellercrowd-people-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log(`✅ Downloaded ${window.scrapedPeople.length} people`);
  };

  // Stop function (exposed globally)
  window.stopExtraction = function() {
    isRunning = false;
    console.log('\n🛑 Extraction stopped');
    console.log(`📊 Total extracted: ${window.scrapedPeople.length} people`);
    console.log('💾 Downloading final data...\n');
    window.downloadData();
  };

  // Inspect card function (for debugging)
  window.inspectCard = function() {
    console.log('\n🔍 Inspecting first visible person card...\n');
    const possibleSelectors = [
      '.org-charts-people-tab-list-item',
      '[class*="people-tab-list-item"]',
      '[class*="person-card"]',
      '[data-testid*="person-card"]'
    ];

    let card = null;
    for (const selector of possibleSelectors) {
      card = document.querySelector(selector);
      if (card) {
        console.log(`Found card with selector: ${selector}`);
        break;
      }
    }

    if (!card) {
      console.log('❌ No person card found. Trying to find any card-like element...');
      // Try to find any card in the main content
      const possibleCards = document.querySelectorAll('[class*="card"], [class*="item"], [class*="list-item"]');
      console.log(`Found ${possibleCards.length} possible card elements`);
      if (possibleCards.length > 0) {
        card = possibleCards[0];
      }
    }

    if (card) {
      console.log('Card HTML:');
      console.log(card.outerHTML.substring(0, 1000));
      console.log('\nExtracted data:');
      console.log(extractPersonData(card));
    } else {
      console.log('❌ Could not find any card element');
    }
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
  console.log('   • Scroll down to load more people');
  console.log('   • Type: stopExtraction() to stop');
  console.log('   • Type: downloadData() to download anytime');
  console.log('   • Type: inspectCard() to debug card structure');
  console.log('   • Auto-downloads every 50 people\n');
  console.log(`📊 Currently in dataset: ${window.scrapedPeople.length} people\n`);

})();
