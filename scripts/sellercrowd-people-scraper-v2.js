/**
 * SellerCrowd People Continuous Extraction Scraper v2
 *
 * Updated to work with SellerCrowd's actual HTML structure
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
  console.log('🚀 SellerCrowd People Continuous Extraction v2 - Auto-Scroll Mode');
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

  // Extract person data from a card element
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

    // Get all text content to parse
    const cardText = card.textContent;

    // Extract name - look for links to /people/ or bold text at the top
    const nameLinks = card.querySelectorAll('a[href^="/people/"]');
    if (nameLinks.length > 0) {
      data.name = nameLinks[0].textContent.trim();
    }

    // Extract title and company - look for "@ " pattern
    const titleMatch = cardText.match(/([^@\n]+)\s+@\s+([^\n]+)/);
    if (titleMatch) {
      data.title = titleMatch[1].trim();
      data.company = titleMatch[2].trim();
    }

    // Extract advertiser - usually appears with a logo/icon
    const advertiserImages = card.querySelectorAll('img[alt]');
    if (advertiserImages.length > 0) {
      data.advertiser = advertiserImages[0].alt;
    }

    // Extract handles
    const handlesMatch = cardText.match(/Handles:\s*([^\n]+)/);
    if (handlesMatch) {
      const handlesText = handlesMatch[1];
      data.handles = handlesText.split(/,\s*/).map(h => h.trim()).filter(h => h && !h.includes('Last activity'));
    }

    // Extract emails - look for email patterns
    const emailRegex = /[\w\.-]+@[\w\.-]+\.\w+/g;
    const emailMatches = cardText.match(emailRegex);
    if (emailMatches) {
      data.emails = [...new Set(emailMatches)]; // Remove duplicates
    }

    // Extract LinkedIn URL
    const linkedinLink = card.querySelector('a[href*="linkedin.com"]');
    if (linkedinLink) {
      data.linkedinUrl = linkedinLink.href;
    }

    // Extract last activity
    const activityMatch = cardText.match(/Last activity:\s*([^\n]+)/);
    if (activityMatch) {
      data.lastActivity = activityMatch[1].trim();
    }

    return data;
  }

  // Find all person card elements on the page
  function findPersonCards() {
    // Strategy: Look for elements that contain person-specific patterns
    // In the screenshot, each person card has:
    // - A name link (href="/people/...")
    // - "Handles:" text
    // - An email
    // - "Last activity:" text

    // First, try to find all links to /people/ pages
    const peopleLinks = document.querySelectorAll('a[href^="/people/"]');
    const cards = [];

    peopleLinks.forEach(link => {
      // Find the parent container that holds the full card
      let currentElement = link;
      let foundCard = null;

      // Go up the DOM tree to find the container that has all person info
      for (let i = 0; i < 10; i++) {
        currentElement = currentElement.parentElement;
        if (!currentElement) break;

        const text = currentElement.textContent;

        // Check if this element contains the full person card data
        const hasHandles = text.includes('Handles:');
        const hasActivity = text.includes('Last activity:');

        if (hasHandles && hasActivity) {
          foundCard = currentElement;
          break;
        }
      }

      if (foundCard && !cards.includes(foundCard)) {
        cards.push(foundCard);
      }
    });

    return cards;
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

    const allCards = findPersonCards();

    if (allCards.length === 0) {
      console.log('⚠️  No people cards found yet. Make sure the page has loaded.');
      return;
    }

    const visibleCards = allCards.filter(card => isElementVisible(card));
    let newProcessed = 0;

    console.log(`📍 Found ${allCards.length} total cards, ${visibleCards.length} visible`);

    visibleCards.forEach(card => {
      const personData = extractPersonData(card);

      if (!personData.name) {
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

      const titleDisplay = personData.title || 'No title';
      const companyDisplay = personData.company || 'No company';
      console.log(`✅ [${window.scrapedPeople.length}] ${personData.name} - ${titleDisplay} @ ${companyDisplay}`);
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

    const cards = findPersonCards();
    if (cards.length > 0) {
      const card = cards[0];
      console.log('Card HTML (first 1000 chars):');
      console.log(card.outerHTML.substring(0, 1000));
      console.log('\nExtracted data:');
      console.log(extractPersonData(card));
    } else {
      console.log('❌ No person cards found');
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
