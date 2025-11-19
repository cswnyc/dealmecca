/**
 * SellerCrowd People Scraper v8 - FIXED DATA QUALITY
 *
 * PROBLEM WITH V7: Walking up exactly 6 levels captured containers with MULTIPLE people
 *
 * NEW APPROACH: Find the smallest container that:
 * - Contains the person link
 * - Contains "Last activity:"
 * - Is smaller than 500 characters (to avoid multi-person containers)
 *
 * USAGE:
 * 1. Go to: https://www.sellercrowd.com/people
 * 2. Open console and paste this
 * 3. Scroll down as it extracts
 * 4. stopExtraction() when done
 */

(function() {
  console.log('🚀 SellerCrowd People Scraper v8 - FIXED DATA QUALITY');
  console.log('=' .repeat(80) + '\n');

  if (!window.scrapedPeople) {
    window.scrapedPeople = [];
    window.processedPeopleNames = new Set();
  }

  let isRunning = true;
  const PROCESS_INTERVAL = 1000;
  const AUTO_DOWNLOAD_INTERVAL = 50;
  const MAX_CONTAINER_SIZE = 800;  // Max characters for single person card

  function extractPersonData(linkElement) {
    // Get the person name from the link
    const name = linkElement.textContent.trim();

    // Find the SMALLEST container that has "Last activity:"
    // This should be the individual person card
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
      console.log(`⚠️  Skipping ${name} - could not find small enough container`);
      return null;
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

    // Extract title and company from text between name and "@"
    const nameIndex = fullText.indexOf(name);
    if (nameIndex >= 0) {
      const afterName = fullText.substring(nameIndex + name.length);

      // Look for @ symbol
      const atIndex = afterName.indexOf('@');
      if (atIndex > 0) {
        // Title is between name and @
        const titlePart = afterName.substring(0, atIndex).trim();
        data.title = titlePart;

        // Company is after @ until we hit "Handles:", "Last activity:", or email
        const afterAt = afterName.substring(atIndex + 1);
        const companyMatch = afterAt.match(/^([^@]+?)(?:Handles:|Last activity:|\w+@)/i);
        if (companyMatch) {
          data.company = companyMatch[1].trim();
        }
      }
    }

    // Extract advertiser from image
    const img = bestContainer.querySelector('img[alt]');
    if (img && img.alt) {
      data.advertiser = img.alt;
    }

    // Extract handles
    const handlesMatch = fullText.match(/Handles:\s*(.+?)(?:\w+@|Last activity)/i);
    if (handlesMatch) {
      const handlesText = handlesMatch[1].trim();
      if (handlesText.length > 0 && handlesText.length < 200) {
        if (handlesText.includes(',')) {
          data.handles = handlesText.split(',').map(h => h.trim()).filter(h => h.length > 0);
        } else {
          data.handles = [handlesText];
        }
      }
    }

    // Extract emails - but only from bestContainer
    const emailRegex = /[\w\.-]+@[\w\.-]+\.\w+/g;
    const emails = fullText.match(emailRegex);
    if (emails) {
      // Filter to reasonable looking emails
      data.emails = [...new Set(emails)].filter(e =>
        e.length < 50 && !e.includes('Last') && !e.includes('Handles')
      );
    }

    // Extract LinkedIn
    const linkedinLink = bestContainer.querySelector('a[href*="linkedin"]');
    if (linkedinLink) {
      data.linkedinUrl = linkedinLink.href;
    }

    // Extract last activity - should be at the end
    const activityMatch = fullText.match(/Last activity:\s*([^]*?)$/i);
    if (activityMatch) {
      const activity = activityMatch[1].trim();
      // Extract just the time part (e.g., "3 hrs")
      const timeMatch = activity.match(/^(\d+\s+\w+)/);
      if (timeMatch) {
        data.lastActivity = timeMatch[1];
      } else {
        data.lastActivity = activity.substring(0, 20); // First 20 chars
      }
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
    a.download = `sellercrowd-people-v8-${Date.now()}.json`;
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
