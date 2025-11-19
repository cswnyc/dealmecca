/**
 * SellerCrowd People Scraper v7 - SIMPLE APPROACH
 *
 * FIXED: Stop trying to validate containers - just walk up 6 levels and use that
 * The data parsing will handle the rest
 *
 * USAGE:
 * 1. Go to: https://www.sellercrowd.com/people
 * 2. Open console and paste this
 * 3. Scroll down as it extracts
 * 4. stopExtraction() when done
 */

(function() {
  console.log('🚀 SellerCrowd People Scraper v7 - SIMPLE APPROACH');
  console.log('=' .repeat(80) + '\n');

  if (!window.scrapedPeople) {
    window.scrapedPeople = [];
    window.processedPeopleNames = new Set();
  }

  let isRunning = true;
  const PROCESS_INTERVAL = 1000;
  const AUTO_DOWNLOAD_INTERVAL = 50;

  function extractPersonData(linkElement) {
    // Get the person name from the link
    const name = linkElement.textContent.trim();

    // Simple approach: just walk up 6 levels to get the card container
    let container = linkElement;
    for (let i = 0; i < 6; i++) {
      if (container.parentElement) {
        container = container.parentElement;
      }
    }

    if (!container) {
      return null;
    }

    const fullText = container.textContent;

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
    // Pattern: "Name[Title] @ [Company]"
    // The text after the name and before @ is the title
    const nameIndex = fullText.indexOf(name);
    if (nameIndex >= 0) {
      const textAfterName = fullText.substring(nameIndex + name.length);

      // Look for @ pattern
      const atMatch = textAfterName.match(/@\s*([^@]+?)(?:Handles:|Last activity:|\w+@)/i);
      if (atMatch) {
        // Company is after @
        data.company = atMatch[1].trim().split(/\s+(?=[A-Z][a-z])/)[0];

        // Title is between name and @
        const beforeAt = textAfterName.split('@')[0];
        if (beforeAt) {
          data.title = beforeAt.trim();
        }
      }
    }

    // Extract advertiser from image
    const img = container.querySelector('img[alt]');
    if (img && img.alt) {
      data.advertiser = img.alt;
    }

    // Extract handles (if present)
    const handlesMatch = fullText.match(/Handles:\s*([^]+?)(?=\w+@|\d+\s+hrs?|Last activity)/i);
    if (handlesMatch) {
      const handlesText = handlesMatch[1].trim();
      if (handlesText && handlesText.length > 0) {
        // Split by comma or just take as single handle
        if (handlesText.includes(',')) {
          data.handles = handlesText.split(',').map(h => h.trim()).filter(h => h.length > 0);
        } else {
          data.handles = [handlesText];
        }
      }
    }

    // Extract emails
    const emailRegex = /[\w\.-]+@[\w\.-]+\.\w+/g;
    const emails = fullText.match(emailRegex);
    if (emails) {
      data.emails = [...new Set(emails)];
    }

    // Extract LinkedIn
    const linkedinLink = container.querySelector('a[href*="linkedin"]');
    if (linkedinLink) {
      data.linkedinUrl = linkedinLink.href;
    }

    // Extract last activity
    const activityMatch = fullText.match(/Last activity:\s*(.+?)(?=\s*$|Skipping|Found)/i);
    if (activityMatch) {
      data.lastActivity = activityMatch[1].trim();
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
    a.download = `sellercrowd-people-${Date.now()}.json`;
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
