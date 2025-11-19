/**
 * SellerCrowd Advertiser Scraper v8 - No Line Breaks Edition
 * Handles text with no newlines by using DOM structure
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

async function scrapeSellerCrowdAdvertisersV8() {
  console.log('🎯 SellerCrowd Advertiser Scraper v8 (No Line Breaks)...');
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

  // Find "Hide teams" links
  const hideTeamsLinks = Array.from(document.querySelectorAll('*'))
    .filter(el => {
      const text = el.textContent?.trim() || '';
      return (text === 'Hide teams' || text === 'Show teams') && el.tagName !== 'BODY';
    });

  console.log(`🔍 Found ${hideTeamsLinks.length} "Hide/Show teams" links\n`);

  if (hideTeamsLinks.length === 0) {
    console.log('⚠️  No team toggle links found. Try expanding some advertisers first.');
    return [];
  }

  const processedCards = new Set();

  for (const teamLink of hideTeamsLinks) {
    try {
      // Traverse UP to find card (depth 4 based on debug)
      let cardContainer = teamLink;
      for (let i = 0; i < 4; i++) {
        if (!cardContainer.parentElement) break;
        cardContainer = cardContainer.parentElement;
      }

      if (processedCards.has(cardContainer)) {
        continue;
      }
      processedCards.add(cardContainer);

      const cardText = cardContainer.textContent || '';

      // Validation: must have location and "Last activity:"
      if (!cardText.includes('Last activity:')) continue;

      const locationMatch = cardText.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),\s*([A-Z]{2})/);
      if (!locationMatch) continue;

      const city = locationMatch[1];
      const state = locationMatch[2];

      // Extract agencies first (they have styled__Item class)
      const agencies = [];
      const agencyElements = cardContainer.querySelectorAll('[class*="styled__Item"]');
      agencyElements.forEach(el => {
        const agencyName = el.textContent?.trim();
        if (agencyName && agencyName.length > 2 && agencyName.length < 100) {
          agencies.push(agencyName);
        }
      });

      // Extract advertiser name
      // Strategy: It's the text that appears BEFORE the first agency in the concatenated string
      let advertiserName = null;

      if (agencies.length > 0) {
        // Find where the first agency appears in the text
        const firstAgency = agencies[0];
        const firstAgencyIndex = cardText.indexOf(firstAgency);

        if (firstAgencyIndex > 0) {
          // Everything before the first agency
          const textBeforeAgencies = cardText.substring(0, firstAgencyIndex);

          // Clean up and extract name
          // Remove common non-name text
          const cleanText = textBeforeAgencies
            .replace(/Hide teams/g, '')
            .replace(/Show teams/g, '')
            .replace(/Last activity:?/g, '')
            .trim();

          // The advertiser name should be what's left
          // It might be concatenated with the city/state, so remove those
          advertiserName = cleanText
            .replace(city, '')
            .replace(state, '')
            .replace(/,/g, '')
            .trim();
        }
      } else {
        // No agencies, try to extract from before location
        const locationIndex = cardText.indexOf(locationMatch[0]);
        if (locationIndex > 0) {
          const textBeforeLocation = cardText.substring(0, locationIndex);
          advertiserName = textBeforeLocation
            .replace(/Hide teams/g, '')
            .replace(/Show teams/g, '')
            .replace(/Last activity:?/g, '')
            .trim();
        }
      }

      if (!advertiserName || advertiserName.length < 2 || advertiserName.length > 80) {
        continue;
      }

      // Clean up advertiser name (might have extra characters)
      advertiserName = advertiserName.trim();

      if (seenNames.has(advertiserName)) {
        continue;
      }
      seenNames.add(advertiserName);

      // Extract last activity
      const activityMatch = cardText.match(/Last activity:\s*(.+?)(?=$|[A-Z][a-z]+,\s*[A-Z]{2})/);
      const lastActivity = activityMatch ? activityMatch[1].trim() : '';

      const advertiser = {
        name: advertiserName,
        city: city,
        state: state,
        agencies: agencies.length > 0 ? agencies : undefined,
        lastActivity: lastActivity || undefined,
      };

      Object.keys(advertiser).forEach(key => {
        if (advertiser[key] === undefined) delete advertiser[key];
      });

      advertisers.push(advertiser);

      const agencyInfo = agencies.length > 0 ? ` (${agencies.length} agencies)` : '';
      console.log(`✅ ${advertisers.length}. ${advertiserName} - ${city}, ${state}${agencyInfo}`);

    } catch (error) {
      console.warn('⚠️  Error processing card:', error.message);
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
    await scrapeSellerCrowdAdvertisersV8();
  } catch (error) {
    console.error('❌ Scraping failed:', error);
    console.error('Stack:', error.stack);
  }
})();
