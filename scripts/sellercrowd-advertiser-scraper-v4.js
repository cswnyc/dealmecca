/**
 * SellerCrowd Advertiser Scraper v4 - Better Card Boundary Detection
 * Finds individual advertiser cards by looking for patterns
 */

const CONFIG = {
  initialDelay: () => 5000 + Math.random() * 5000,
  scrollDelay: () => 3000 + Math.random() * 4000,
  pauseDelay: () => 10000 + Math.random() * 10000,
  minScrollPercent: 70,
  maxScrollPercent: 95,
  scrollBackChance: 0.10,
  pauseFrequency: () => 20 + Math.floor(Math.random() * 10),
  maxScrollAttempts: 100,
  scrollStableCount: 5,
  scrollDuration: () => 500 + Math.random() * 1000,
};

function smoothScrollTo(targetY, duration) {
  return new Promise((resolve) => {
    const startY = window.scrollY;
    const distance = targetY - startY;
    const startTime = performance.now();

    function animation(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeInOutQuad = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      window.scrollTo(0, startY + distance * easeInOutQuad);
      if (progress < 1) {
        requestAnimationFrame(animation);
      } else {
        resolve();
      }
    }
    requestAnimationFrame(animation);
  });
}

function randomDelay(delayFn) {
  const ms = typeof delayFn === 'function' ? delayFn() : delayFn;
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomScrollTarget() {
  const docHeight = Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight
  );
  const windowHeight = window.innerHeight;
  const maxScroll = docHeight - windowHeight;
  const scrollPercent = CONFIG.minScrollPercent +
    Math.random() * (CONFIG.maxScrollPercent - CONFIG.minScrollPercent);
  return Math.floor(maxScroll * (scrollPercent / 100));
}

async function scrapeSellerCrowdAdvertisersV4() {
  console.log('🎯 SellerCrowd Advertiser Scraper v4 (Better Boundaries)...');
  console.log('================================================================================\n');

  const totalText = document.body.textContent || '';
  const totalMatch = totalText.match(/([0-9,]+)\s*Advertisers?/i);
  const totalAdvertisers = totalMatch ? totalMatch[1] : 'Unknown';
  console.log(`📊 Total Advertisers: ${totalAdvertisers}`);
  console.log(`📅 Started: ${new Date().toLocaleString()}\n`);

  console.log('⏳ Initial delay...');
  await randomDelay(CONFIG.initialDelay);

  let scrollAttempts = 0;
  let stableCount = 0;
  let previousCount = 0;
  let scrollsSincePause = 0;
  let nextPauseAt = CONFIG.pauseFrequency();

  console.log('🔄 Scrolling to load advertisers...\n');

  while (scrollAttempts < CONFIG.maxScrollAttempts && stableCount < CONFIG.scrollStableCount) {
    scrollAttempts++;
    scrollsSincePause++;

    if (scrollsSincePause >= nextPauseAt) {
      const pauseDuration = CONFIG.pauseDelay();
      console.log(`😴 Pause for ${Math.round(pauseDuration/1000)}s...`);
      await randomDelay(pauseDuration);
      scrollsSincePause = 0;
      nextPauseAt = CONFIG.pauseFrequency();
    }

    if (Math.random() < CONFIG.scrollBackChance && scrollAttempts > 5) {
      const scrollBackAmount = Math.floor(Math.random() * 500) + 200;
      const scrollBackTarget = Math.max(0, window.scrollY - scrollBackAmount);
      console.log(`⬆️  Scroll back...`);
      await smoothScrollTo(scrollBackTarget, CONFIG.scrollDuration());
      await randomDelay(CONFIG.scrollDelay);
    }

    const lastActivityElements = Array.from(document.querySelectorAll('*'))
      .filter(el => {
        const text = el.textContent || '';
        return text.includes('Last activity') && !text.includes('minutes');
      });
    const currentCount = lastActivityElements.length;

    const scrollTarget = getRandomScrollTarget();
    console.log(`📜 Scroll ${scrollAttempts}: ${currentCount} advertiser sections visible`);
    await smoothScrollTo(scrollTarget, CONFIG.scrollDuration());
    await randomDelay(CONFIG.scrollDelay);

    if (currentCount === previousCount) {
      stableCount++;
      console.log(`✅ Stable (${stableCount}/${CONFIG.scrollStableCount})`);
    } else {
      stableCount = 0;
    }
    previousCount = currentCount;
  }

  console.log(`\n✨ Scrolling complete after ${scrollAttempts} attempts`);
  console.log('📊 Extracting data...\n');

  const advertisers = [];
  const seenNames = new Set();

  // Find all "Last activity:" text nodes
  const allElements = document.querySelectorAll('*');
  const lastActivityElements = [];

  for (const el of allElements) {
    if (el.children.length === 0) { // Text node
      const text = el.textContent?.trim() || '';
      if (text.startsWith('Last activity:') || text === 'Last activity:') {
        lastActivityElements.push(el);
      }
    }
  }

  console.log(`🔍 Found ${lastActivityElements.length} "Last activity:" text nodes\n`);

  for (const activityEl of lastActivityElements) {
    try {
      // Find the card by going up and looking for a reasonably-sized container
      let cardContainer = activityEl;
      let depth = 0;

      while (cardContainer && depth < 20) {
        const textLength = (cardContainer.textContent || '').length;
        const text = cardContainer.textContent || '';

        // A valid card should:
        // 1. Contain "Last activity"
        // 2. Be 200-2000 characters (not the whole page)
        // 3. Contain either "Hide teams" or not have multiple "Last activity" occurrences
        const lastActivityCount = (text.match(/Last activity:/g) || []).length;

        if (text.includes('Last activity:') &&
            textLength >= 200 &&
            textLength <= 2000 &&
            lastActivityCount === 1) {
          // This looks like a single card!
          break;
        }

        cardContainer = cardContainer.parentElement;
        depth++;
      }

      if (!cardContainer || depth >= 20) {
        continue; // Couldn't find a reasonable card
      }

      const cardText = cardContainer.textContent || '';

      // Skip if this looks like a page element (contains nav text, filters, etc.)
      if (cardText.includes('By Geography') ||
          cardText.includes('By Industry') ||
          cardText.includes('By Agency Partner') ||
          cardText.includes('Quick actions') ||
          cardText.includes('Org Charts')) {
        continue;
      }

      // Extract advertiser name
      // The name should be one of the first bold/large text elements
      // Let's find all direct text children and pick the first substantial one

      let advertiserName = null;

      // Strategy: Look for the first text that appears BEFORE the location pattern
      const locationMatch = cardText.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),\s*([A-Z]{2})/);

      if (locationMatch) {
        const locationIndex = cardText.indexOf(locationMatch[0]);
        const textBeforeLocation = cardText.substring(0, locationIndex).trim();

        // Split by common delimiters and get the last chunk before location
        const chunks = textBeforeLocation.split(/\n|Last activity/).filter(s => s.trim());

        // The advertiser name is likely the last substantial chunk before the location
        for (let i = chunks.length - 1; i >= 0; i--) {
          const chunk = chunks[i].trim();
          if (chunk.length >= 3 &&
              chunk.length <= 80 &&
              !chunk.includes('Hide teams') &&
              !chunk.includes('Show teams') &&
              !/^\d+$/.test(chunk) &&
              !chunk.includes('activity')) {
            advertiserName = chunk;
            break;
          }
        }
      } else {
        // No location found, try to extract name another way
        // Get first substantial text node
        const walker = document.createTreeWalker(
          cardContainer,
          NodeFilter.SHOW_TEXT,
          null,
          false
        );

        let node;
        while (node = walker.nextNode()) {
          const text = node.textContent.trim();
          if (text.length >= 3 &&
              text.length <= 80 &&
              !text.includes('Last activity') &&
              !text.includes('Hide teams') &&
              !text.includes('Show teams') &&
              !/^\d+$/.test(text)) {
            advertiserName = text;
            break;
          }
        }
      }

      if (!advertiserName || seenNames.has(advertiserName)) {
        continue;
      }

      seenNames.add(advertiserName);

      // Extract location
      const locationPattern = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),\s*([A-Z]{2})/;
      const locMatch = cardText.match(locationPattern);
      const city = locMatch ? locMatch[1] : '';
      const state = locMatch ? locMatch[2] : '';

      // Extract last activity
      const activityMatch = cardText.match(/Last activity:\s*(.+?)(?=\n|$)/i);
      const lastActivity = activityMatch ? activityMatch[1].trim() : '';

      // Extract agencies from within this card only
      const agencies = [];
      const agencyElements = cardContainer.querySelectorAll('[class*="styled__Item"]');

      agencyElements.forEach(el => {
        const agencyName = el.textContent?.trim();
        if (agencyName &&
            agencyName.length > 2 &&
            agencyName.length < 100 &&
            !agencies.includes(agencyName) &&
            agencyName !== advertiserName) {
          agencies.push(agencyName);
        }
      });

      const advertiser = {
        name: advertiserName,
        city: city || undefined,
        state: state || undefined,
        agencies: agencies.length > 0 ? agencies : undefined,
        lastActivity: lastActivity || undefined,
      };

      Object.keys(advertiser).forEach(key => {
        if (advertiser[key] === undefined) delete advertiser[key];
      });

      advertisers.push(advertiser);

      const locationInfo = city && state ? ` - ${city}, ${state}` : '';
      const agencyInfo = agencies.length > 0 ? ` (${agencies.length} agencies)` : '';
      console.log(`✅ ${advertisers.length}. ${advertiserName}${locationInfo}${agencyInfo}`);

    } catch (error) {
      console.warn('⚠️  Error processing element:', error.message);
    }
  }

  // Results
  console.log('\n' + '='.repeat(80));
  console.log('✅ SCRAPING COMPLETE');
  console.log('='.repeat(80));
  console.log(`📊 Total advertisers: ${advertisers.length}`);
  console.log(`📍 With location: ${advertisers.filter(a => a.city && a.state).length}`);
  console.log(`🤝 With agencies: ${advertisers.filter(a => a.agencies && a.agencies.length > 0).length}`);

  const totalAgencyLinks = advertisers.reduce((sum, a) => sum + (a.agencies?.length || 0), 0);
  console.log(`🔗 Total agency relationships: ${totalAgencyLinks}`);

  console.log('\n📋 JSON OUTPUT (copy between the lines):');
  console.log('='.repeat(80));
  console.log(JSON.stringify(advertisers, null, 2));
  console.log('='.repeat(80));

  window.scrapedAdvertisers = advertisers;
  console.log('\n💾 Also stored in: window.scrapedAdvertisers');

  return advertisers;
}

// Auto-execute
(async () => {
  try {
    await scrapeSellerCrowdAdvertisersV4();
  } catch (error) {
    console.error('❌ Scraping failed:', error);
    console.error('Stack:', error.stack);
  }
})();
