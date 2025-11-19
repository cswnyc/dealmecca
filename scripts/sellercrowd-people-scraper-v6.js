/**
 * SellerCrowd People Scraper v6 - FLEXIBLE VALIDATION
 *
 * FIXED: Relaxed container validation - only requires "Last activity:" not "Handles:"
 * Some people don't have handles, so we can't require it
 *
 * USAGE:
 * 1. Go to: https://www.sellercrowd.com/people
 * 2. Open console and paste this
 * 3. Scroll down as it extracts
 * 4. stopExtraction() when done
 */

(function() {
  console.log('🚀 SellerCrowd People Scraper v6 - FLEXIBLE VALIDATION');
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

    // Find the container that has all the person's info
    // Go up the DOM until we find an element with "Last activity:"
    let container = linkElement;
    let foundValidContainer = false;

    for (let i = 0; i < 20; i++) {
      container = container.parentElement;
      if (!container) break;

      const text = container.textContent;

      // A valid container should have:
      // - "Last activity:" (all people have this)
      // - But NOT multiple "Last activity:" (too high up)
      // Note: NOT requiring "Handles:" because not all people have handles

      const activityCount = (text.match(/Last activity:/g) || []).length;

      if (text.includes('Last activity:') && activityCount === 1) {
        foundValidContainer = true;
        break;
      }
    }

    // If we didn't find a valid container, skip this person
    if (!foundValidContainer || !container) {
      console.log(`⚠️  Skipping ${name} - could not find valid container`);
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
    // Pattern: "NameTitle @ CompanyAdvertiser"
    // Remove the name first, then look for @ pattern
    const textAfterName = fullText.substring(fullText.indexOf(name) + name.length);
    const atMatch = textAfterName.match(/^([^@]+?)\s*@\s*([^@]+?)(?:Handles:|Last activity:|[a-z0-9._%+-]+@)/i);
    if (atMatch) {
      data.title = atMatch[1].trim();
      const companyPart = atMatch[2].trim();
      // Clean up company name - remove any text after email or "Last activity"
      const cleanCompany = companyPart.split(/(?=[A-Z][a-z]+@)|(?=Last activity)/)[0].trim();
      data.company = cleanCompany;
    }

    // Extract advertiser from image
    const img = container.querySelector('img[alt]');
    if (img) {
      data.advertiser = img.alt;
    }

    // Extract handles (if present)
    const handlesMatch = fullText.match(/Handles:\s*([^]+?)(?=\s*[a-z0-9._%+-]+@|Last activity:|$)/i);
    if (handlesMatch) {
      const handlesText = handlesMatch[1];
      // Handles might be comma-separated or just run together
      if (handlesText.includes(',')) {
        data.handles = handlesText.split(',').map(h => h.trim()).filter(h => h && h.length > 0 && !h.includes('Last activity'));
      } else {
        data.handles = [handlesText.trim()].filter(h => h && h.length > 0 && !h.includes('Last activity'));
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
    const activityMatch = fullText.match(/Last activity:\s*([^\n]+?)(?:\s*$|$)/);
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
      console.log(result);
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
