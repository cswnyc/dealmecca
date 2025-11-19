/**
 * SellerCrowd Advertiser List Scraper
 * Extracts advertisers and their associated agencies from the Advertisers tab
 *
 * IMPORTANT - USAGE RECOMMENDATIONS:
 * - This scrapes the LIST page (not individual profiles)
 * - Can collect 100-500 advertisers per session
 * - Includes advertiser names, locations, and associated agencies
 * - Wait 24-48 hours between scraping sessions
 * - Use during business hours (9am-5pm EST)
 *
 * HOW TO USE:
 * 1. Navigate to SellerCrowd Advertisers tab
 * 2. Open browser console (F12 or Cmd+Option+J)
 * 3. Copy and paste this entire script
 * 4. Press Enter and wait for completion
 * 5. Copy the JSON output
 *
 * BATCH PROCESSING:
 * - For 16k advertisers, split into multiple sessions
 * - Session 1: First 500 advertisers
 * - Wait 48 hours
 * - Session 2: Next 500 advertisers
 * - Etc.
 */

const CONFIG = {
  // Randomized delays for stealth
  initialDelay: () => 5000 + Math.random() * 5000,  // 5-10 seconds
  scrollDelay: () => 3000 + Math.random() * 4000,   // 3-7 seconds
  pauseDelay: () => 10000 + Math.random() * 10000,  // 10-20 seconds

  // Natural scrolling
  minScrollPercent: 70,
  maxScrollPercent: 95,
  scrollBackChance: 0.10,

  // Pause behavior
  pauseFrequency: () => 20 + Math.floor(Math.random() * 10),

  // Safety - adjust based on how many you want per session
  maxScrollAttempts: 100, // ~100-500 advertisers per session
  scrollStableCount: 5,

  // Smooth scrolling
  scrollDuration: () => 500 + Math.random() * 1000,
};

// Utility: Smooth scroll
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

// Utility: Random delay
function randomDelay(delayFn) {
  const ms = typeof delayFn === 'function' ? delayFn() : delayFn;
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Utility: Get random scroll position
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

// Extract agency names from an advertiser card
function extractAgencies(cardElement) {
  const agencies = [];

  // Look for agency names - they appear after the advertiser name
  // Pattern: agency names with small logos/icons before them
  const textContent = cardElement.textContent || '';

  // Try to find all text that looks like agency names
  // They typically have emoji/icons before them and commas between
  const agencyPattern = /[\u{1F300}-\u{1F9FF}]?\s*([A-Za-z0-9\s&\-]+?)(?=,|\s+Hide teams|Last activity|$)/gu;
  const matches = [...textContent.matchAll(agencyPattern)];

  matches.forEach(match => {
    const agencyName = match[1].trim();
    // Filter out non-agency text (location, dates, etc.)
    if (agencyName &&
        agencyName.length > 2 &&
        !agencyName.match(/^(New|Last|Hide|mins?|hrs?|days?|ago|activity)$/i) &&
        !agencyName.match(/^\d+$/) &&
        !agencyName.match(/^[A-Z]{2}$/)) { // Not just state abbreviations
      agencies.push(agencyName);
    }
  });

  return [...new Set(agencies)]; // Remove duplicates
}

// Main scraper
async function scrapeSellerCrowdAdvertisers() {
  console.log('🎯 SellerCrowd Advertiser Scraper Starting...');
  console.log('================================================================================\n');

  // Check total count
  const countElement = document.querySelector('h2, div[class*="count"], div[class*="total"]');
  const totalText = countElement?.textContent || '';
  const totalMatch = totalText.match(/([0-9,]+)\s*Advertisers?/i);
  const totalAdvertisers = totalMatch ? totalMatch[1] : 'Unknown';
  console.log(`📊 Total Advertisers in Database: ${totalAdvertisers}`);
  console.log(`📅 Scraping started at: ${new Date().toLocaleString()}\n`);

  console.log('⏳ Initial delay (simulating page reading)...');
  await randomDelay(CONFIG.initialDelay);

  let scrollAttempts = 0;
  let stableCount = 0;
  let previousAdvertiserCount = 0;
  let scrollsSincePause = 0;
  let nextPauseAt = CONFIG.pauseFrequency();

  console.log('🔄 Beginning natural scroll pattern...\n');

  // Scroll to load advertisers
  while (scrollAttempts < CONFIG.maxScrollAttempts && stableCount < CONFIG.scrollStableCount) {
    scrollAttempts++;
    scrollsSincePause++;

    // Random pause
    if (scrollsSincePause >= nextPauseAt) {
      const pauseDuration = CONFIG.pauseDelay();
      console.log(`😴 Taking a natural break for ${Math.round(pauseDuration/1000)}s...`);
      await randomDelay(pauseDuration);
      scrollsSincePause = 0;
      nextPauseAt = CONFIG.pauseFrequency();
    }

    // Occasional scroll back
    if (Math.random() < CONFIG.scrollBackChance && scrollAttempts > 5) {
      const currentScroll = window.scrollY;
      const scrollBackAmount = Math.floor(Math.random() * 500) + 200;
      const scrollBackTarget = Math.max(0, currentScroll - scrollBackAmount);
      console.log(`⬆️  Scrolling back up briefly...`);
      await smoothScrollTo(scrollBackTarget, CONFIG.scrollDuration());
      await randomDelay(CONFIG.scrollDelay);
    }

    // Count advertiser cards (look for company names)
    // Advertisers appear as cards with company names as headers
    const advertiserCards = document.querySelectorAll('[class*="Card"], [class*="row"]');
    const currentCount = advertiserCards.length;

    // Scroll to random position
    const scrollTarget = getRandomScrollTarget();
    const scrollDuration = CONFIG.scrollDuration();

    console.log(`📜 Scroll ${scrollAttempts}: ~${currentCount} advertiser cards visible`);
    await smoothScrollTo(scrollTarget, scrollDuration);
    await randomDelay(CONFIG.scrollDelay);

    // Check stability
    if (currentCount === previousAdvertiserCount) {
      stableCount++;
      console.log(`✅ Count stable (${stableCount}/${CONFIG.scrollStableCount})`);
    } else {
      stableCount = 0;
    }
    previousAdvertiserCount = currentCount;
  }

  console.log(`\n✨ Scrolling complete after ${scrollAttempts} attempts`);
  console.log('📊 Extracting advertiser data...\n');

  // Extract advertisers
  // Look for advertiser cards - they have company logos, names, locations
  const allCards = document.querySelectorAll('[class*="Card"], [class*="row"], div[class*="item"]');
  const advertisers = [];
  const seenNames = new Set();

  allCards.forEach((card, index) => {
    try {
      const cardText = card.textContent || '';

      // Skip if this doesn't look like an advertiser card
      if (!cardText.includes('Last activity') && !cardText.includes('mins') && !cardText.includes('hr')) {
        return;
      }

      // Extract advertiser name (usually the largest text/heading in the card)
      const nameElement = card.querySelector('h3, h2, strong, [class*="name"], [class*="title"]');
      const name = nameElement?.textContent?.trim() || '';

      if (!name || name.length < 2 || seenNames.has(name)) return;
      seenNames.add(name);

      // Extract location (city, state)
      // Usually appears as "City, State" pattern
      const locationMatch = cardText.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),\s*([A-Z]{2})/);
      const city = locationMatch ? locationMatch[1].trim() : '';
      const state = locationMatch ? locationMatch[2].trim() : '';

      // Extract associated agencies
      const agencies = extractAgencies(card);

      // Extract last activity
      const activityMatch = cardText.match(/Last activity:\s*(.+?)(?=\n|$)/i);
      const lastActivity = activityMatch ? activityMatch[1].trim() : '';

      const advertiser = {
        name,
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

      const agencyInfo = agencies.length > 0 ? ` (${agencies.length} agencies)` : '';
      const locationInfo = city && state ? ` - ${city}, ${state}` : '';
      console.log(`✅ ${advertisers.length}. ${name}${locationInfo}${agencyInfo}`);

    } catch (error) {
      console.warn(`⚠️  Error parsing advertiser ${index + 1}:`, error.message);
    }
  });

  // Results
  console.log('\n' + '='.repeat(80));
  console.log('✅ SCRAPING COMPLETE');
  console.log('='.repeat(80));
  console.log(`📊 Total advertisers extracted: ${advertisers.length}`);
  console.log(`📍 Advertisers with location: ${advertisers.filter(a => a.city && a.state).length}`);
  console.log(`🤝 Advertisers with agencies: ${advertisers.filter(a => a.agencies && a.agencies.length > 0).length}`);

  const totalAgencyLinks = advertisers.reduce((sum, a) => sum + (a.agencies?.length || 0), 0);
  console.log(`🔗 Total agency relationships found: ${totalAgencyLinks}`);

  console.log('\n💡 BATCH PROCESSING RECOMMENDATIONS:');
  console.log(`   • You extracted ${advertisers.length} advertisers this session`);
  console.log(`   • Total remaining: ~${parseInt(totalAdvertisers.replace(/,/g, '')) - advertisers.length}`);
  console.log('   • Wait 48 hours before next session');
  console.log('   • Limit to 200-500 advertisers per session');
  console.log('   • Consider scraping at different times of day');

  console.log('\n📋 JSON OUTPUT (copy everything between the lines):');
  console.log('='.repeat(80));
  console.log(JSON.stringify(advertisers, null, 2));
  console.log('='.repeat(80));

  window.scrapedAdvertisers = advertisers;
  console.log('\n💾 Data also stored in: window.scrapedAdvertisers');
  console.log('   Access anytime with: copy(JSON.stringify(window.scrapedAdvertisers, null, 2))');

  return advertisers;
}

// Auto-execute
(async () => {
  try {
    await scrapeSellerCrowdAdvertisers();
  } catch (error) {
    console.error('❌ Scraping failed:', error);
  }
})();
