/**
 * SellerCrowd People Scraper v9 - REALISTIC CONTAINER SIZE
 *
 * PROBLEM WITH V8: MAX_CONTAINER_SIZE of 800 was too small - real person cards are bigger
 *
 * FIX: Increased to 2000 characters and improved parsing to extract only relevant data
 *
 * USAGE:
 * 1. Go to: https://www.sellercrowd.com/people
 * 2. Open console and paste this
 * 3. Scroll down as it extracts
 * 4. stopExtraction() when done
 */

(function() {
  console.log('🚀 SellerCrowd People Scraper v9 - REALISTIC CONTAINER SIZE');
  console.log('=' .repeat(80) + '\n');

  if (!window.scrapedPeople) {
    window.scrapedPeople = [];
    window.processedPeopleNames = new Set();
  }

  let isRunning = true;
  const PROCESS_INTERVAL = 1000;
  const AUTO_DOWNLOAD_INTERVAL = 50;
  const MAX_CONTAINER_SIZE = 2000;  // Increased from 800

  function extractPersonData(linkElement) {
    // Get the person name from the link
    const name = linkElement.textContent.trim();

    // Find the SMALLEST container that has "Last activity:" and is under max size
    let bestContainer = null;
    let smallestSize = Infinity;

    let container = linkElement;
    for (let i = 0; i < 15; i++) {
      if (!container.parentElement) break;
      container = container.parentElement;

      const text = container.textContent;
      const textSize = text.length;

      // Check if this container has what we need
      if (text.includes('Last activity:') && textSize < MAX_CONTAINER_SIZE) {
        // This is a candidate - is it smaller than what we found?
        if (textSize < smallestSize) {
          bestContainer = container;
          smallestSize = textSize;
        }
      }
    }

    if (!bestContainer) {
      // Fallback: just walk up 6 levels and hope for the best
      container = linkElement;
      for (let i = 0; i < 6; i++) {
        if (container.parentElement) {
          container = container.parentElement;
        }
      }
      bestContainer = container;
    }

    const fullText = bestContainer.textContent;

    const data = {
      name: name,
      title: null,
      company: null,
      advertiser: null,
      handles: [],
      emails: [],
      linkedinUrl: null,
      lastActivity: null
    };

    // Extract title and company
    // Find where this person's name appears, then extract data until we hit another person's name or end
    const nameIndex = fullText.indexOf(name);
    if (nameIndex >= 0) {
      const afterName = fullText.substring(nameIndex + name.length);

      // Find the end of this person's data (where next person starts or "Last activity:" appears)
      let endIndex = afterName.length;

      // Look for "Last activity:" as end marker
      const activityIndex = afterName.indexOf('Last activity:');
      if (activityIndex > 0) {
        // Include the activity text
        const activityEndMatch = afterName.substring(activityIndex).match(/Last activity:\s*\d+\s+\w+/);
        if (activityEndMatch) {
          endIndex = activityIndex + activityEndMatch[0].length;
        } else {
          endIndex = activityIndex + 30; // Take 30 chars after "Last activity:"
        }
      }

      const personText = afterName.substring(0, endIndex);

      // Extract title (between name and @)
      const atIndex = personText.indexOf('@');
      if (atIndex > 0 && atIndex < 200) {
        data.title = personText.substring(0, atIndex).trim();

        // Extract company (after @ until Handles: or email or Last activity)
        const afterAt = personText.substring(atIndex + 1);
        const companyMatch = afterAt.match(/^([^@]+?)(?:Handles:|Last activity:|\w+@)/i);
        if (companyMatch) {
          data.company = companyMatch[1].trim().split(/\s+(?=[A-Z][a-z])/)[0];
        }
      }
    }

    // Extract advertiser from image
    const img = bestContainer.querySelector('img[alt]');
    if (img && img.alt) {
      data.advertiser = img.alt;
    }

    // Extract handles - look for "Handles:" in the full text
    const handlesMatch = fullText.match(/Handles:\s*(.+?)(?:\w+@|Last activity)/i);
    if (handlesMatch) {
      const handlesText = handlesMatch[1].trim();
      // Only accept if reasonably short (not concatenated with next person)
      if (handlesText.length > 0 && handlesText.length < 150) {
        if (handlesText.includes(',')) {
          data.handles = handlesText.split(',').map(h => h.trim()).filter(h => h.length > 0 && h.length < 50);
        } else {
          // Split on capital letters that start new words
          const handles = handlesText.split(/(?=[A-Z][a-z])/);
          data.handles = handles.map(h => h.trim()).filter(h => h.length > 0 && h.length < 50).slice(0, 5);
        }
      }
    }

    // Extract emails - but only reasonable looking ones near this person's name
    const namePos = fullText.indexOf(name);
    if (namePos >= 0) {
      const textWindow = fullText.substring(Math.max(0, namePos - 50), Math.min(fullText.length, namePos + 500));
      const emailRegex = /[\w\.-]+@[\w\.-]+\.\w+/g;
      const emails = textWindow.match(emailRegex);
      if (emails) {
        data.emails = [...new Set(emails)]
          .filter(e => e.length < 60 && !e.includes('Last') && !e.includes('Handles'))
          .slice(0, 3); // Max 3 emails
      }
    }

    // Extract LinkedIn
    const linkedinLink = bestContainer.querySelector('a[href*="linkedin"]');
    if (linkedinLink) {
      data.linkedinUrl = linkedinLink.href;
    }

    // Extract last activity - look for pattern near this person
    const activityMatch = fullText.match(/Last activity:\s*(\d+\s+\w+)/i);
    if (activityMatch) {
      data.lastActivity = activityMatch[1];
    }

    return data;
  }

  function processVisible() {
    if (!isRunning) return;

    // Find all people links that are visible
    const allLinks = Array.from(document.querySelectorAll('a[href^="/people/"]'));

    if (allLinks.length === 0) {
      console.log('⚠️  No people found. Make sure page has loaded.');
      return;
    }

    // Filter to only visible ones
    const visibleLinks = allLinks.filter(link => {
      const rect = link.getBoundingClientRect();
      return rect.top >= -200 && rect.top <= window.innerHeight + 200;
    });

    console.log(`📍 Found ${allLinks.length} total, ${visibleLinks.length} visible`);

    let newCount = 0;

    visibleLinks.forEach(link => {
      try {
        const personData = extractPersonData(link);

        // Skip if extraction failed or already processed
        if (!personData || !personData.name || window.processedPeopleNames.has(personData.name)) {
          return;
        }

        window.scrapedPeople.push(personData);
        window.processedPeopleNames.add(personData.name);

        console.log(`✅ [${window.scrapedPeople.length}] ${personData.name} - ${personData.title || 'No title'}`);
        newCount++;

        if (window.scrapedPeople.length % AUTO_DOWNLOAD_INTERVAL === 0) {
          console.log(`\n💾 Auto-downloading (${window.scrapedPeople.length} total)...\n`);
          window.downloadData();
        }
      } catch (err) {
        console.error('Error extracting:', err);
      }
    });
  }

  window.downloadData = function() {
    const data = JSON.stringify(window.scrapedPeople, null, 2);
    const blob = new Blob([data], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sellercrowd-people-v9-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log(`✅ Downloaded ${window.scrapedPeople.length} people`);
  };

  window.stopExtraction = function() {
    isRunning = false;
    console.log('\n🛑 Stopped');
    console.log(`📊 Total: ${window.scrapedPeople.length} people`);
    window.downloadData();
  };

  window.testOne = function() {
    const link = document.querySelector('a[href^="/people/"]');
    if (link) {
      console.log('Testing extraction on first person...');
      const result = extractPersonData(link);
      console.log(JSON.stringify(result, null, 2));
      return result;
    }
  };

  console.log('✅ Started!\n');
  processVisible();

  const interval = setInterval(() => {
    if (!isRunning) {
      clearInterval(interval);
      return;
    }
    processVisible();
  }, PROCESS_INTERVAL);

  console.log('💡 CONTROLS:');
  console.log('   • Scroll down to load more');
  console.log('   • stopExtraction() - stop and download');
  console.log('   • downloadData() - download current data');
  console.log('   • testOne() - test extraction on first person\n');
  console.log(`📊 Current: ${window.scrapedPeople.length} people\n`);

})();
