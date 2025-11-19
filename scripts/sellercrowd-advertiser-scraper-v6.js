/**
 * SellerCrowd Advertiser Scraper v6 - Relaxed Constraints
 * Handles larger cards, multiple "Last activity", and non-US advertisers
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

async function scrapeSellerCrowdAdvertisersV6() {
  console.log('🎯 SellerCrowd Advertiser Scraper v6 (Relaxed Constraints)...');
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

  // Find "Last activity:" elements (small leaf nodes)
  const lastActivityCandidates = Array.from(document.querySelectorAll('*'))
    .filter(el => {
      const text = el.textContent || '';
      const textLength = text.length;
      return text.includes('Last activity:') &&
             textLength < 500 &&
             el.children.length < 5;
    });

  console.log(`🔍 Found ${lastActivityCandidates.length} "Last activity:" candidates\n`);

  const processedCards = new Set();

  for (const activityEl of lastActivityCandidates) {
    try {
      // Traverse up to find card container
      let cardContainer = activityEl;
      let depth = 0;

      while (cardContainer && depth < 20) {
        const text = cardContainer.textContent || '';
        const textLength = text.length;

        // RELAXED constraints:
        // 1. Size: 150-10000 chars (was 200-2000)
        // 2. Location: Optional (handle non-US)
        // 3. "Last activity" count: At least 1 (was exactly 1)
        const lastActivityCount = (text.match(/Last activity:/g) || []).length;
        const hasLocation = /[A-Z][a-z]+,\s*[A-Z]{2}/.test(text);
        const hasHideTeams = text.includes('Hide teams') || text.includes('Show teams');

        // A card is identified by:
        // - Being a reasonable size (not tiny, not the whole page)
        // - Having "Last activity:"
        // - Having "Hide teams" or "Show teams" (indicates it's an advertiser card)
        if (textLength >= 150 &&
            textLength <= 10000 &&
            lastActivityCount >= 1 &&
            (hasLocation || hasHideTeams)) {

          // Additional validation: Check if it contains navigation text
          if (text.includes('By Geography') ||
              text.includes('By Industry') ||
              text.includes('Quick actions') ||
              text.includes('Org Charts')) {
            cardContainer = cardContainer.parentElement;
            depth++;
            continue;
          }

          // This is likely a valid card
          break;
        }

        cardContainer = cardContainer.parentElement;
        depth++;
      }

      if (!cardContainer || depth >= 20) {
        continue;
      }

      if (processedCards.has(cardContainer)) {
        continue;
      }
      processedCards.add(cardContainer);

      const cardText = cardContainer.textContent || '';

      // Extract location (US format)
      const locationMatch = cardText.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),\s*([A-Z]{2})/);
      const city = locationMatch ? locationMatch[1] : '';
      const state = locationMatch ? locationMatch[2] : '';

      // Extract advertiser name
      let advertiserName = null;

      if (locationMatch) {
        // Name is before location
        const locationIndex = cardText.indexOf(locationMatch[0]);
        const textBeforeLocation = cardText.substring(0, locationIndex);

        const cleanText = textBeforeLocation
          .replace(/Last activity:?/g, '')
          .replace(/Hide teams/g, '')
          .replace(/Show teams/g, '');

        const lines = cleanText.split('\n')
          .map(l => l.trim())
          .filter(l => {
            return l.length >= 2 &&
                   l.length <= 80 &&
                   !/^\d+$/.test(l) &&
                   !l.includes('activity') &&
                   l !== city;
          });

        // Get the last line before location (likely the name)
        for (let i = lines.length - 1; i >= 0; i--) {
          const line = lines[i];
          // Skip agency names
          const hasStyledClass = Array.from(cardContainer.querySelectorAll('[class*="styled__Item"]'))
            .some(el => el.textContent?.trim() === line);

          if (!hasStyledClass && line.length >= 2) {
            advertiserName = line;
            break;
          }
        }
      } else {
        // No location, try to find name another way
        // Look for first bold/prominent text
        const firstLines = cardText.split('\n')
          .map(l => l.trim())
          .filter(l => l.length >= 2 && l.length <= 80 && !/^\d+$/.test(l));

        if (firstLines.length > 0) {
          advertiserName = firstLines[0];
        }
      }

      if (!advertiserName || seenNames.has(advertiserName)) {
        continue;
      }

      seenNames.add(advertiserName);

      // Extract last activity
      const activityMatch = cardText.match(/Last activity:\s*([^\n]+)/);
      const lastActivity = activityMatch ? activityMatch[1].trim() : '';

      // Extract agencies
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
    await scrapeSellerCrowdAdvertisersV6();
  } catch (error) {
    console.error('❌ Scraping failed:', error);
    console.error('Stack:', error.stack);
  }
})();
