/**
 * SellerCrowd Stealth Scraper - Human-like behavior version
 *
 * USAGE RECOMMENDATIONS TO AVOID DETECTION:
 * - Wait 24-48 hours between scraping sessions
 * - Limit to 1-2 companies per session
 * - Use during business hours (9am-5pm EST)
 * - Clear cookies between sessions if possible
 * - Don't run multiple times in quick succession
 *
 * HOW TO USE:
 * 1. Navigate to company page (e.g., https://app.sellercrowd.com/companies/...)
 * 2. Open browser console (F12 or Cmd+Option+J)
 * 3. Copy and paste this entire script
 * 4. Press Enter and wait for completion
 * 5. Copy the JSON output from console
 * 6. Import via admin bulk import interface
 */

const CONFIG = {
  // Randomized delays to simulate human behavior
  initialDelay: () => 5000 + Math.random() * 5000,  // 5-10 seconds initial wait
  scrollDelay: () => 3000 + Math.random() * 4000,   // 3-7 seconds between scrolls
  pauseDelay: () => 10000 + Math.random() * 10000,  // 10-20 seconds for random pauses

  // Natural scrolling behavior
  minScrollPercent: 70,    // Sometimes don't scroll all the way
  maxScrollPercent: 95,    // Leave some room at bottom
  scrollBackChance: 0.10,  // 10% chance to scroll back up occasionally

  // Pause behavior
  pauseFrequency: () => 20 + Math.floor(Math.random() * 10),  // Pause every 20-30 scrolls

  // Safety limits
  maxScrollAttempts: 250,
  scrollStableCount: 5,
  maxContactsRecommended: 500,  // Recommendation for single session

  // Smooth scrolling
  scrollDuration: () => 500 + Math.random() * 1000,  // 0.5-1.5 seconds scroll animation
};

// Utility: Smooth scroll animation
function smoothScrollTo(targetY, duration) {
  return new Promise((resolve) => {
    const startY = window.scrollY;
    const distance = targetY - startY;
    const startTime = performance.now();

    function animation(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for natural movement
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

// Main scraper function
async function scrapeSellerCrowdContacts() {
  console.log('🕵️  Stealth SellerCrowd Scraper Starting...');
  console.log('⏳ Initial delay (simulating page reading)...');

  // Initial "reading" delay
  await randomDelay(CONFIG.initialDelay);

  let scrollAttempts = 0;
  let stableCount = 0;
  let previousContactCount = 0;
  let scrollsSincePause = 0;
  let nextPauseAt = CONFIG.pauseFrequency();

  console.log('🔄 Beginning natural scroll pattern...');

  // Scroll until we've loaded all contacts
  while (scrollAttempts < CONFIG.maxScrollAttempts && stableCount < CONFIG.scrollStableCount) {
    scrollAttempts++;
    scrollsSincePause++;

    // Check if we should take a random pause (simulate distraction)
    if (scrollsSincePause >= nextPauseAt) {
      const pauseDuration = CONFIG.pauseDelay();
      console.log(`😴 Taking a natural break for ${Math.round(pauseDuration/1000)}s (scroll ${scrollAttempts})...`);
      await randomDelay(pauseDuration);
      scrollsSincePause = 0;
      nextPauseAt = CONFIG.pauseFrequency();
    }

    // Occasionally scroll back up (simulate re-reading)
    if (Math.random() < CONFIG.scrollBackChance && scrollAttempts > 5) {
      const currentScroll = window.scrollY;
      const scrollBackAmount = Math.floor(Math.random() * 500) + 200;
      const scrollBackTarget = Math.max(0, currentScroll - scrollBackAmount);

      console.log(`⬆️  Scrolling back up briefly (simulating re-reading)...`);
      await smoothScrollTo(scrollBackTarget, CONFIG.scrollDuration());
      await randomDelay(CONFIG.scrollDelay);
    }

    // Get current contact count
    const currentCount = document.querySelectorAll('[data-contact-card]').length;

    // Scroll to random position (not always 100%)
    const scrollTarget = getRandomScrollTarget();
    const scrollDuration = CONFIG.scrollDuration();

    console.log(`📜 Scroll ${scrollAttempts}: ${currentCount} contacts loaded, scrolling to ${Math.round((scrollTarget / (document.documentElement.scrollHeight - window.innerHeight)) * 100)}% over ${Math.round(scrollDuration/1000)}s...`);

    await smoothScrollTo(scrollTarget, scrollDuration);

    // Random delay before next scroll
    const delay = CONFIG.scrollDelay();
    console.log(`⏱️  Waiting ${Math.round(delay/1000)}s before next scroll...`);
    await randomDelay(delay);

    // Check if count is stable
    if (currentCount === previousContactCount) {
      stableCount++;
      console.log(`✅ Contact count stable (${stableCount}/${CONFIG.scrollStableCount})`);
    } else {
      stableCount = 0;
    }

    previousContactCount = currentCount;
  }

  console.log(`✨ Scrolling complete after ${scrollAttempts} attempts`);
  console.log('📊 Extracting contact data...');

  // Extract all contacts
  const contacts = [];
  const contactCards = document.querySelectorAll('[data-contact-card]');

  contactCards.forEach((card, index) => {
    try {
      // Extract name (always present)
      const nameElement = card.querySelector('[data-name]');
      const name = nameElement?.textContent?.trim() || '';

      // Extract title (optional)
      const titleElement = card.querySelector('[data-title]');
      const title = titleElement?.textContent?.trim() || '';

      // Extract email (optional)
      const emailElement = card.querySelector('[data-email]');
      const email = emailElement?.textContent?.trim() || '';

      // Extract LinkedIn URL (optional)
      const linkedinElement = card.querySelector('a[href*="linkedin.com"]');
      const linkedinUrl = linkedinElement?.href || '';

      // Extract location (optional)
      const locationElement = card.querySelector('[data-location]');
      const location = locationElement?.textContent?.trim() || '';

      // Only add if we have at least a name
      if (name) {
        contacts.push({
          name,
          title: title || undefined,
          email: email || undefined,
          linkedinUrl: linkedinUrl || undefined,
          location: location || undefined,
        });
      }
    } catch (error) {
      console.warn(`⚠️  Error parsing contact ${index + 1}:`, error);
    }
  });

  // Results and recommendations
  console.log('\n' + '='.repeat(80));
  console.log('✅ SCRAPING COMPLETE');
  console.log('='.repeat(80));
  console.log(`📊 Total contacts extracted: ${contacts.length}`);
  console.log(`🔄 Total scroll attempts: ${scrollAttempts}`);

  if (contacts.length > CONFIG.maxContactsRecommended) {
    console.log(`\n⚠️  WARNING: Extracted ${contacts.length} contacts in one session.`);
    console.log(`   Recommendation: Limit to ${CONFIG.maxContactsRecommended} per session to stay under radar.`);
  }

  console.log('\n💡 USAGE RECOMMENDATIONS:');
  console.log('   • Wait 24-48 hours before next scraping session');
  console.log('   • Limit to 1-2 companies per session');
  console.log('   • Use during business hours (9am-5pm EST)');
  console.log('   • Clear cookies between sessions if possible');
  console.log('   • Vary your access patterns');

  console.log('\n📋 JSON OUTPUT (copy everything between the lines):');
  console.log('='.repeat(80));
  console.log(JSON.stringify(contacts, null, 2));
  console.log('='.repeat(80));

  // Also return for programmatic access
  return contacts;
}

// Auto-execute
(async () => {
  try {
    // Get company info from page
    const companyNameElement = document.querySelector('h1, [data-company-name]');
    const companyName = companyNameElement?.textContent?.trim() || 'Unknown Company';

    console.log(`\n🎯 Target Company: ${companyName}`);
    console.log(`📅 Scraping started at: ${new Date().toLocaleString()}`);
    console.log('\n' + '='.repeat(80));

    const contacts = await scrapeSellerCrowdContacts();

    // Store in window for easy access
    window.scrapedContacts = contacts;
    console.log('\n💾 Contacts also stored in: window.scrapedContacts');
    console.log('   Access anytime with: copy(JSON.stringify(window.scrapedContacts, null, 2))');

  } catch (error) {
    console.error('❌ Scraping failed:', error);
    console.error('Stack trace:', error.stack);
  }
})();
