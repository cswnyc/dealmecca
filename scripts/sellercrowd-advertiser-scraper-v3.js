/**
 * SellerCrowd Advertiser Scraper v3 - DOM-Based Extraction
 * Uses the 371 "Last activity" elements as anchors to find advertiser data
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

async function scrapeSellerCrowdAdvertisersV3() {
  console.log('🎯 SellerCrowd Advertiser Scraper v3 (DOM-Based)...');
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

  // Count using "Last activity" text as proxy
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

    // Count advertiser sections
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

  // Extract advertisers using DOM traversal
  const advertisers = [];
  const seenNames = new Set();

  // Find all "Last activity" elements - these are our anchors
  const lastActivityElements = Array.from(document.querySelectorAll('*'))
    .filter(el => {
      const text = el.textContent || '';
      return text.includes('Last activity:') && el.children.length < 3;
    });

  console.log(`🔍 Found ${lastActivityElements.length} "Last activity" anchor elements\n`);

  // For each anchor, traverse up to find the advertiser card container
  for (const activityEl of lastActivityElements) {
    try {
      // Traverse up the DOM to find the card container
      // The card should contain: advertiser name, location, "Last activity", agencies
      let cardContainer = activityEl;
      let depth = 0;

      // Go up max 15 levels to find a container with substantial content
      while (cardContainer && depth < 15) {
        const text = cardContainer.textContent || '';
        const childDivCount = cardContainer.querySelectorAll(':scope > div').length;

        // A card should have:
        // - "Last activity" text
        // - Substantial content (100-2000 chars)
        // - Multiple child divs
        if (text.includes('Last activity') &&
            text.length > 100 &&
            text.length < 2000 &&
            childDivCount >= 3) {
          break;
        }

        cardContainer = cardContainer.parentElement;
        depth++;
      }

      if (!cardContainer) continue;

      // Extract all text from the card
      const cardText = cardContainer.textContent || '';

      // Find advertiser name - it's usually the largest/boldest text before location
      // Try to find it by looking for text nodes with specific characteristics
      const allTextNodes = [];
      const walker = document.createTreeWalker(
        cardContainer,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );

      let node;
      while (node = walker.nextNode()) {
        const text = node.textContent.trim();
        if (text.length > 2 && text.length < 100 &&
            !text.includes('Last activity') &&
            !text.includes('Hide teams') &&
            !text.includes('Show teams')) {
          allTextNodes.push({
            text: text,
            element: node.parentElement
          });
        }
      }

      // The advertiser name is likely one of the first substantial text nodes
      let advertiserName = null;
      for (const textNode of allTextNodes) {
        const text = textNode.text;
        // Skip if it looks like a location (City, ST pattern)
        if (/^[A-Z][a-z]+,\s*[A-Z]{2}$/.test(text)) continue;
        // Skip if it's just numbers
        if (/^\d+$/.test(text)) continue;
        // Skip if it contains "activity"
        if (text.toLowerCase().includes('activity')) continue;

        // This looks like a name
        if (text.length >= 3 && text.length <= 80) {
          advertiserName = text;
          break;
        }
      }

      if (!advertiserName || seenNames.has(advertiserName)) continue;
      seenNames.add(advertiserName);

      // Extract location
      const locationMatch = cardText.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),\s*([A-Z]{2})/);
      const city = locationMatch ? locationMatch[1] : '';
      const state = locationMatch ? locationMatch[2] : '';

      // Extract last activity
      const activityMatch = cardText.match(/Last activity:\s*(.+?)(?=\n|$)/i);
      const lastActivity = activityMatch ? activityMatch[1].trim() : '';

      // Extract agencies - find all elements with the "styled__Item" class within this card
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

      // Remove undefined fields
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
    await scrapeSellerCrowdAdvertisersV3();
  } catch (error) {
    console.error('❌ Scraping failed:', error);
    console.error('Stack:', error.stack);
  }
})();
