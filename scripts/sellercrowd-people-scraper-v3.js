/**
 * SellerCrowd People Continuous Extraction Scraper v3
 *
 * IMPROVED: Better card detection using unique anchors
 *
 * WORKFLOW:
 * 1. Navigate to: https://www.sellercrowd.com/people
 * 2. Open console (F12) and paste this script
 * 3. Scroll down and watch it extract
 * 4. Type: stopExtraction() to stop
 * 5. Type: downloadData() to download anytime
 */

(function() {
  console.log('🚀 SellerCrowd People Extraction v3 - IMPROVED Card Detection');
  console.log('================================================================================\n');

  // Initialize or retrieve existing data
  if (!window.scrapedPeople) {
    window.scrapedPeople = [];
    window.processedPeopleNames = new Set();
  }

  let isRunning = true;
  const PROCESS_INTERVAL = 1000;
  const AUTO_DOWNLOAD_INTERVAL = 50;

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

    const cardText = card.textContent;

    // Extract name - look for links to /people/
    const nameLinks = card.querySelectorAll('a[href^="/people/"]');
    if (nameLinks.length > 0) {
      data.name = nameLinks[0].textContent.trim();
    }

    // Extract title and company - look for "@ " pattern
    // But make sure we get the first occurrence (closest to name)
    const lines = cardText.split('\n').map(l => l.trim()).filter(l => l);
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('@') && !lines[i].includes('Last activity')) {
        const parts = lines[i].split('@');
        if (parts.length === 2) {
          data.title = parts[0].trim();
          data.company = parts[1].trim();
          break;
        }
      }
    }

    // Extract advertiser
    const advertiserImages = card.querySelectorAll('img[alt]');
    if (advertiserImages.length > 0) {
      data.advertiser = advertiserImages[0].alt;
    }

    // Extract handles - improved parsing
    const handlesMatch = cardText.match(/Handles:\s*([^\n]+?)(?=\n|$)/);
    if (handlesMatch) {
      const handlesText = handlesMatch[1];
      // Split by comma but filter out anything that looks like an email or "Last activity"
      data.handles = handlesText
        .split(',')
        .map(h => h.trim())
        .filter(h => h && !h.includes('@') && !h.includes('Last activity') && h.length > 2);
    }

    // Extract emails
    const emailRegex = /[\w\.-]+@[\w\.-]+\.\w+/g;
    const emailMatches = cardText.match(emailRegex);
    if (emailMatches) {
      data.emails = [...new Set(emailMatches)];
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

  // IMPROVED: Find person cards using a different strategy
  function findPersonCards() {
    // Strategy: Each person card has action buttons (checkmark, edit, bookmark)
    // Look for elements with these action buttons as anchors

    const cards = [];
    const seenCards = new Set();

    // Find all "Last activity:" text nodes as they appear once per card
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null
    );

    const activityNodes = [];
    let node;
    while (node = walker.nextNode()) {
      if (node.textContent.includes('Last activity:')) {
        activityNodes.push(node);
      }
    }

    // For each "Last activity" text, find the containing card
    activityNodes.forEach(activityNode => {
      let currentElement = activityNode.parentElement;

      // Walk up to find the card container
      for (let i = 0; i < 15; i++) {
        if (!currentElement) break;

        const text = currentElement.textContent;

        // A valid card should have:
        // - A person link (/people/)
        // - Handles:
        // - Last activity:
        // - And should NOT contain multiple "Last activity:" (that means it's too high up)

        const hasPeopleLink = currentElement.querySelector('a[href^="/people/"]');
        const hasHandles = text.includes('Handles:');
        const activityCount = (text.match(/Last activity:/g) || []).length;

        if (hasPeopleLink && hasHandles && activityCount === 1) {
          // This is likely our card!
          const cardId = currentElement.innerHTML.substring(0, 100);
          if (!seenCards.has(cardId)) {
            seenCards.add(cardId);
            cards.push(currentElement);
          }
          break;
        }

        currentElement = currentElement.parentElement;
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
      console.log('⚠️  No people cards found yet.');
      return;
    }

    const visibleCards = allCards.filter(card => isElementVisible(card));

    console.log(`📍 Found ${allCards.length} total cards, ${visibleCards.length} visible`);

    let newProcessed = 0;

    visibleCards.forEach(card => {
      const personData = extractPersonData(card);

      if (!personData.name) {
        return;
      }

      // Check if we already have this person
      if (window.processedPeopleNames.has(personData.name)) {
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
  }

  // Download function
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

  // Stop function
  window.stopExtraction = function() {
    isRunning = false;
    console.log('\n🛑 Extraction stopped');
    console.log(`📊 Total extracted: ${window.scrapedPeople.length} people`);
    console.log('💾 Downloading final data...\n');
    window.downloadData();
  };

  // Inspect function
  window.inspectCard = function() {
    console.log('\n🔍 Inspecting cards...\n');
    const cards = findPersonCards();
    console.log(`Found ${cards.length} total cards`);
    if (cards.length > 0) {
      console.log('\nFirst card data:');
      console.log(extractPersonData(cards[0]));
      if (cards.length > 1) {
        console.log('\nSecond card data:');
        console.log(extractPersonData(cards[1]));
      }
    }
  };

  // Start
  console.log('✅ Extraction started!\n');
  processVisible();

  const intervalId = setInterval(() => {
    if (!isRunning) {
      clearInterval(intervalId);
      return;
    }
    processVisible();
  }, PROCESS_INTERVAL);

  console.log('💡 CONTROLS:');
  console.log('   • Scroll down to load more');
  console.log('   • stopExtraction() to stop');
  console.log('   • downloadData() to download');
  console.log('   • inspectCard() to debug\n');
  console.log(`📊 Currently in dataset: ${window.scrapedPeople.length} people\n`);

})();
