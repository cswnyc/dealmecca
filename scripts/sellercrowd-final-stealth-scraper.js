/**
 * SellerCrowd Final Stealth Scraper
 * Combines correct selectors + human-like behavior
 *
 * USAGE RECOMMENDATIONS (IMPORTANT - READ BEFORE USING):
 * - Wait 24-48 hours since last scraping session
 * - Limit to 1-2 companies per session
 * - Use during business hours (9am-5pm EST)
 * - Clear cookies between sessions if possible
 *
 * HOW TO USE:
 * 1. Navigate to company People tab
 * 2. Open browser console (F12 or Cmd+Option+J)
 * 3. Copy and paste this entire script
 * 4. Press Enter and wait for completion
 * 5. Copy the JSON output and import via bulk import interface
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

  // Safety
  maxScrollAttempts: 250,
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

// Main scraper
async function scrapeSellerCrowdContacts() {
  console.log('🕵️  SellerCrowd Stealth Scraper Starting...');
  console.log('================================================================================\n');

  // Get company info
  const companyNameElement = document.querySelector('h1') || document.querySelector('[data-testid="company-name"]');
  const companyName = companyNameElement?.textContent?.trim() || 'Unknown Company';
  console.log(`🎯 Target Company: ${companyName}`);
  console.log(`📅 Scraping started at: ${new Date().toLocaleString()}\n`);

  console.log('⏳ Initial delay (simulating page reading)...');
  await randomDelay(CONFIG.initialDelay);

  let scrollAttempts = 0;
  let stableCount = 0;
  let previousContactCount = 0;
  let scrollsSincePause = 0;
  let nextPauseAt = CONFIG.pauseFrequency();

  console.log('🔄 Beginning natural scroll pattern...\n');

  // Scroll to load all contacts
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

    // Count contacts
    const currentCount = document.querySelectorAll('[data-testid="entity-title"]').length;

    // Scroll to random position
    const scrollTarget = getRandomScrollTarget();
    const scrollDuration = CONFIG.scrollDuration();

    console.log(`📜 Scroll ${scrollAttempts}: ${currentCount} contacts loaded`);
    await smoothScrollTo(scrollTarget, scrollDuration);
    await randomDelay(CONFIG.scrollDelay);

    // Check stability
    if (currentCount === previousContactCount) {
      stableCount++;
      console.log(`✅ Contact count stable (${stableCount}/${CONFIG.scrollStableCount})`);
    } else {
      stableCount = 0;
    }
    previousContactCount = currentCount;
  }

  console.log(`\n✨ Scrolling complete after ${scrollAttempts} attempts`);
  console.log('📊 Extracting contact data...\n');

  // Extract contacts
  const contactElements = document.querySelectorAll('[data-testid="entity-title"]');
  const contacts = [];

  contactElements.forEach((titleElement, index) => {
    try {
      const cardContainer = titleElement.closest('div[class*="FirstCell"]') ||
                           titleElement.parentElement.parentElement.parentElement;

      if (!cardContainer) return;

      const fullText = cardContainer.textContent || '';

      // Extract name
      const nameElement = titleElement.querySelector('div[class*="NameCont"]') || titleElement;
      const name = nameElement.textContent?.trim() || '';
      if (!name) return;

      const nameParts = name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Extract title - look for text between name and "@"
      let title = '';
      const titleMatch = fullText.match(new RegExp(`${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^@]+)@`));
      if (titleMatch) {
        title = titleMatch[1].trim();
      }

      // Extract email - find proper email pattern
      const emailMatches = fullText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]{2,})/g);
      // Filter out malformed emails and pick the cleanest one
      const validEmails = emailMatches ? emailMatches.filter(e =>
        e.length < 50 && // Not too long
        !e.includes('convention') && // Skip "convention" emails
        e.match(/^[a-z0-9._-]+@[a-z0-9._-]+\.[a-z]{2,}$/i) // Proper format
      ) : [];
      const email = validEmails[0] || '';

      // Extract location - look for city names before email
      // Common pattern: "Toronto", "New York", etc.
      const locationMatch = fullText.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*[a-z0-9._-]+@/);
      let location = locationMatch ? locationMatch[1] : '';
      // Clean up if location got merged with email
      location = location.replace(/[a-z0-9._-]+$/, '').trim();

      // LinkedIn URL
      const linkedinLink = cardContainer.querySelector('a[href*="linkedin.com"]');
      const linkedinUrl = linkedinLink ? linkedinLink.href : '';

      const contact = {
        firstName,
        lastName,
        title: title || undefined,
        email: email || undefined,
        linkedinUrl: linkedinUrl || undefined,
        location: location || undefined,
        companyName
      };

      // Remove undefined fields
      Object.keys(contact).forEach(key => {
        if (contact[key] === undefined) delete contact[key];
      });

      contacts.push(contact);
      console.log(`✅ ${index + 1}. ${firstName} ${lastName}${title ? ` - ${title}` : ''}${email ? ` (${email})` : ''}`);

    } catch (error) {
      console.warn(`⚠️  Error parsing contact ${index + 1}:`, error.message);
    }
  });

  // Results
  console.log('\n' + '='.repeat(80));
  console.log('✅ SCRAPING COMPLETE');
  console.log('='.repeat(80));
  console.log(`📊 Total contacts extracted: ${contacts.length}`);
  console.log(`📧 Contacts with email: ${contacts.filter(c => c.email).length}`);
  console.log(`🔗 Contacts with LinkedIn: ${contacts.filter(c => c.linkedinUrl).length}`);

  console.log('\n💡 USAGE RECOMMENDATIONS:');
  console.log('   • Wait 24-48 hours before next scraping session');
  console.log('   • Limit to 1-2 companies per session');
  console.log('   • Use during business hours (9am-5pm EST)');
  console.log('   • Clear cookies between sessions if possible');

  console.log('\n📋 JSON OUTPUT (copy everything between the lines):');
  console.log('='.repeat(80));
  console.log(JSON.stringify(contacts, null, 2));
  console.log('='.repeat(80));

  window.scrapedContacts = contacts;
  console.log('\n💾 Contacts also stored in: window.scrapedContacts');
  console.log('   Access anytime with: copy(JSON.stringify(window.scrapedContacts, null, 2))');

  return contacts;
}

// Auto-execute
(async () => {
  try {
    await scrapeSellerCrowdContacts();
  } catch (error) {
    console.error('❌ Scraping failed:', error);
  }
})();
