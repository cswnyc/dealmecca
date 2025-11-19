/**
 * SellerCrowd Advertiser Scraper v2 - Working Version
 * Based on actual page structure analysis
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

async function scrapeSellerCrowdAdvertisersV2() {
  console.log('🎯 SellerCrowd Advertiser Scraper v2...');
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

  // Count using agency elements as proxy
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

    // Count advertiser sections (look for "Last activity" text)
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

  // Extract advertisers
  const advertisers = [];
  const seenNames = new Set();

  // Find all text nodes that look like advertiser names
  // They appear as large text above "Last activity"
  const allText = document.body.textContent;
  const lines = allText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // Pattern: Advertiser name appears right before location and "Last activity"
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip if it's not a potential advertiser name
    if (line.length < 3 || line.length > 100) continue;
    if (line.includes('Last activity')) continue;
    if (line.includes('Hide teams')) continue;
    if (line.includes('Show teams')) continue;
    if (line.match(/^\d+$/)) continue; // Just numbers
    if (line.match(/^[0-9,]+ Advertiser/)) continue; // The count

    // Check if this line is followed by location/activity info
    const next5Lines = lines.slice(i + 1, i + 6).join(' ');
    if (!next5Lines.includes('Last activity')) continue;

    // This looks like an advertiser name!
    const name = line;
    if (seenNames.has(name)) continue;
    seenNames.add(name);

    // Extract location (city, state)
    const locationMatch = next5Lines.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),\s*([A-Z]{2})/);
    const city = locationMatch ? locationMatch[1] : '';
    const state = locationMatch ? locationMatch[2] : '';

    // Extract last activity
    const activityMatch = next5Lines.match(/Last activity:\s*(.+?)(?=\s|$)/i);
    const lastActivity = activityMatch ? activityMatch[1].trim() : '';

    // Extract agencies - look for agency names after the advertiser name
    const agenciesSection = lines.slice(i + 1, i + 20).join(' ');
    const agencies = [];

    // Find all agency elements with the specific class
    const agencyElements = document.querySelectorAll('[class*="styled__Item"]');
    agencyElements.forEach(el => {
      const agencyName = el.textContent?.trim();
      if (agencyName && agencyName.length > 2 && agencyName.length < 100) {
        // Check if this agency appears near our advertiser in the text
        const advertiserIndex = allText.indexOf(name);
        const agencyIndex = allText.indexOf(agencyName, advertiserIndex);
        const nextAdvertiserIndex = allText.indexOf('Last activity', advertiserIndex + name.length + 50);

        // Agency should be between advertiser name and next "Last activity"
        if (agencyIndex > advertiserIndex &&
            agencyIndex < nextAdvertiserIndex &&
            !agencies.includes(agencyName)) {
          agencies.push(agencyName);
        }
      }
    });

    const advertiser = {
      name,
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
    console.log(`✅ ${advertisers.length}. ${name}${locationInfo}${agencyInfo}`);
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
    await scrapeSellerCrowdAdvertisersV2();
  } catch (error) {
    console.error('❌ Scraping failed:', error);
    console.error('Stack:', error.stack);
  }
})();
