/**
 * SellerCrowd Advertiser Scraper v7 - Different Strategy
 * Uses "Hide teams" links as anchor points instead of "Last activity"
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

async function scrapeSellerCrowdAdvertisersV7() {
  console.log('🎯 SellerCrowd Advertiser Scraper v7 (Hide Teams Strategy)...');
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

  // NEW STRATEGY: Find "Hide teams" or "Show teams" links
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
      // Traverse UP from the link to find the advertiser card container
      let cardContainer = teamLink;
      let depth = 0;

      while (cardContainer && depth < 25) {
        const text = cardContainer.textContent || '';
        const textLength = text.length;

        // A card should have:
        // - "Last activity:"
        // - Location pattern OR substantial content
        // - Reasonable size
        const hasLastActivity = text.includes('Last activity:');
        const hasLocation = /[A-Z][a-z]+,\s*[A-Z]{2}/.test(text);

        if (hasLastActivity &&
            textLength >= 150 &&
            textLength <= 10000 &&
            (hasLocation || textLength > 300)) {
          // Found the card!
          break;
        }

        cardContainer = cardContainer.parentElement;
        depth++;
      }

      if (!cardContainer || depth >= 25) {
        continue;
      }

      if (processedCards.has(cardContainer)) {
        continue;
      }
      processedCards.add(cardContainer);

      const cardText = cardContainer.textContent || '';

      // Extract location
      const locationMatch = cardText.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)?),\s*([A-Z]{2})/);
      const city = locationMatch ? locationMatch[1] : '';
      const state = locationMatch ? locationMatch[2] : '';

      // Extract advertiser name
      // The name should appear BEFORE the first agency name or before the location
      let advertiserName = null;

      // Find all agency names first
      const agencyNames = [];
      const agencyElements = cardContainer.querySelectorAll('[class*="styled__Item"]');
      agencyElements.forEach(el => {
        const name = el.textContent?.trim();
        if (name && name.length > 2 && name.length < 100) {
          agencyNames.push(name);
        }
      });

      // Now find the advertiser name
      // It should be prominent text that appears before agencies and location
      const lines = cardText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

      for (const line of lines) {
        // Skip short lines, numbers, and known non-name text
        if (line.length < 2 || line.length > 80) continue;
        if (/^\d+$/.test(line)) continue;
        if (line.includes('Last activity')) continue;
        if (line.includes('Hide teams') || line.includes('Show teams')) continue;
        if (line === city || line === state) continue;

        // Skip if it's an agency name
        if (agencyNames.includes(line)) continue;

        // Skip if it's a location pattern
        if (/^[A-Z][a-z]+,\s*[A-Z]{2}$/.test(line)) continue;

        // This looks like the advertiser name!
        advertiserName = line;
        break;
      }

      if (!advertiserName || seenNames.has(advertiserName)) {
        continue;
      }

      seenNames.add(advertiserName);

      // Extract last activity
      const activityMatch = cardText.match(/Last activity:\s*([^\n]+)/);
      const lastActivity = activityMatch ? activityMatch[1].trim() : '';

      // Use the agencies we already found
      const agencies = agencyNames.length > 0 ? agencyNames : undefined;

      const advertiser = {
        name: advertiserName,
        city: city || undefined,
        state: state || undefined,
        agencies: agencies,
        lastActivity: lastActivity || undefined,
      };

      Object.keys(advertiser).forEach(key => {
        if (advertiser[key] === undefined) delete advertiser[key];
      });

      advertisers.push(advertiser);

      const locationInfo = city && state ? ` - ${city}, ${state}` : '';
      const agencyInfo = agencies ? ` (${agencies.length} agencies)` : '';
      console.log(`✅ ${advertisers.length}. ${advertiserName}${locationInfo}${agencyInfo}`);

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
    await scrapeSellerCrowdAdvertisersV7();
  } catch (error) {
    console.error('❌ Scraping failed:', error);
    console.error('Stack:', error.stack);
  }
})();
