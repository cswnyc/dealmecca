/**
 * SellerCrowd People Scraper v10 - TEXT PARSING APPROACH
 *
 * COMPLETELY NEW STRATEGY:
 * - Get ALL person links (names) on the page
 * - Get the entire page text
 * - For each person, extract text between their name and the next person's name
 * - Parse that isolated text chunk
 *
 * This avoids the container problem entirely!
 *
 * USAGE:
 * 1. Go to: https://www.sellercrowd.com/people
 * 2. Open console and paste this
 * 3. Scroll down as it extracts
 * 4. stopExtraction() when done
 */

(function() {
  console.log('🚀 SellerCrowd People Scraper v10 - TEXT PARSING APPROACH');
  console.log('=' .repeat(80) + '\n');

  if (!window.scrapedPeople) {
    window.scrapedPeople = [];
    window.processedPeopleNames = new Set();
  }

  let isRunning = true;
  const PROCESS_INTERVAL = 1000;
  const AUTO_DOWNLOAD_INTERVAL = 50;

  function extractPersonData(linkElement, allLinks) {
    const name = linkElement.textContent.trim();

    // Get the full page text from the main container
    let mainContainer = linkElement;
    for (let i = 0; i < 20; i++) {
      if (mainContainer.parentElement) {
        mainContainer = mainContainer.parentElement;
      } else {
        break;
      }
    }

    const fullPageText = mainContainer.textContent;

    // Find where this person's name appears
    const nameIndex = fullPageText.indexOf(name);
    if (nameIndex < 0) {
      return null;
    }

    // Find where the NEXT person's name appears (to know where this person's data ends)
    const allNames = Array.from(allLinks).map(link => link.textContent.trim());
    const thisNameIdx = allNames.indexOf(name);

    let endIndex = fullPageText.length;
    if (thisNameIdx + 1 < allNames.length) {
      const nextName = allNames[thisNameIdx + 1];
      const nextNameIdx = fullPageText.indexOf(nextName, nameIndex + name.length);
      if (nextNameIdx > nameIndex) {
        endIndex = nextNameIdx;
      }
    }

    // Extract just this person's text chunk
    const personText = fullPageText.substring(nameIndex, endIndex);

    // Now parse this isolated text
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

    // Extract title (between name and @)
    const afterName = personText.substring(name.length);
    const atIndex = afterName.indexOf('@');
    if (atIndex > 0 && atIndex < 150) {
      data.title = afterName.substring(0, atIndex).trim();

      // Extract company (after @ until Handles: or email)
      const afterAt = afterName.substring(atIndex + 1);
      const companyMatch = afterAt.match(/^([^@]+?)(?:Handles:|Last activity:|\w+\.?\w*@)/i);
      if (companyMatch) {
        data.company = companyMatch[1].trim();
      }
    }

    // Extract advertiser from image within this person's card
    const img = linkElement.closest('div').querySelector('img[alt]');
    if (img && img.alt) {
      data.advertiser = img.alt;
    }

    // Extract handles
    const handlesMatch = personText.match(/Handles:\s*(.+?)(?:\w+@|Last activity)/i);
    if (handlesMatch) {
      const handlesText = handlesMatch[1].trim();
      if (handlesText.length > 0 && handlesText.length < 200) {
        // Split by capital letters or commas
        if (handlesText.includes(',')) {
          data.handles = handlesText.split(',').map(h => h.trim()).filter(h => h.length > 0 && h.length < 50);
        } else {
          // Split on capital letters followed by lowercase
          const handles = handlesText.split(/(?=[A-Z][a-z])/);
          data.handles = handles.map(h => h.trim()).filter(h => h.length > 2 && h.length < 50).slice(0, 5);
        }
      }
    }

    // Extract emails from this person's text
    const emailRegex = /[\w\.-]+@[\w\.-]+\.\w+/g;
    const emails = personText.match(emailRegex);
    if (emails) {
      data.emails = [...new Set(emails)]
        .filter(e => e.length < 60 && !e.includes('Last') && !e.includes('Handles'))
        .slice(0, 3);
    }

    // Extract LinkedIn
    const linkedinLink = linkElement.closest('div').querySelector('a[href*="linkedin"]');
    if (linkedinLink) {
      data.linkedinUrl = linkedinLink.href;
    }

    // Extract last activity
    const activityMatch = personText.match(/Last activity:\s*(\d+\s+\w+)/i);
    if (activityMatch) {
      data.lastActivity = activityMatch[1];
    }

    return data;
  }

  function processVisible() {
    if (!isRunning) return;

    // Find all people links
    const allLinks = Array.from(document.querySelectorAll('a[href^="/people/"]'));

    if (allLinks.length === 0) {
      console.log('⚠️  No people found. Make sure page has loaded.');
      return;
    }

    // Filter to visible ones
    const visibleLinks = allLinks.filter(link => {
      const rect = link.getBoundingClientRect();
      return rect.top >= -200 && rect.top <= window.innerHeight + 200;
    });

    console.log(`📍 Found ${allLinks.length} total, ${visibleLinks.length} visible`);

    let newCount = 0;

    visibleLinks.forEach((link, idx) => {
      try {
        const personData = extractPersonData(link, visibleLinks);

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
    a.download = `sellercrowd-people-v10-${Date.now()}.json`;
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
    const allLinks = Array.from(document.querySelectorAll('a[href^="/people/"]'));
    if (allLinks.length > 0) {
      console.log('Testing extraction on first person...');
      const result = extractPersonData(allLinks[0], allLinks);
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
