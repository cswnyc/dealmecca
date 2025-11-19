/**
 * SellerCrowd Auto-Expand All Agency Teams
 * Automatically clicks "Show teams" / "Hide teams" links to reveal all agencies
 *
 * HOW TO USE:
 * 1. Navigate to SellerCrowd Advertisers tab
 * 2. Scroll down to load the advertisers you want to expand (200-500)
 * 3. Open browser console (F12 or Cmd+Option+J)
 * 4. Copy and paste this script
 * 5. Press Enter - it will expand all visible "Hide teams" links
 * 6. Wait for completion (30-60 seconds)
 * 7. Then run the scraper script
 */

async function expandAllTeams() {
  console.log('🔓 Auto-Expanding All Agency Teams...');
  console.log('================================================================================\n');

  // Delay between clicks to appear more natural
  const delayBetweenClicks = 100; // 100ms between clicks
  const randomDelay = () => delayBetweenClicks + Math.random() * 100; // 100-200ms

  // Find all "Hide teams" links
  // They might have text like "Hide teams", "Show teams", etc.
  const possibleTexts = ['Hide teams', 'Show teams', 'teams'];
  let expandLinks = [];

  possibleTexts.forEach(text => {
    const links = Array.from(document.querySelectorAll('a, button, span[class*="link"]'))
      .filter(el => el.textContent.toLowerCase().includes(text.toLowerCase()));
    expandLinks.push(...links);
  });

  // Remove duplicates
  expandLinks = [...new Set(expandLinks)];

  console.log(`🔍 Found ${expandLinks.length} expandable team links\n`);

  if (expandLinks.length === 0) {
    console.log('⚠️  No "Hide teams" links found. Either:');
    console.log('   - All teams are already expanded');
    console.log('   - Need to scroll to load more advertisers');
    console.log('   - The selector needs adjustment');
    return;
  }

  let expanded = 0;
  let failed = 0;

  for (let i = 0; i < expandLinks.length; i++) {
    const link = expandLinks[i];

    try {
      // Scroll element into view
      link.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, randomDelay()));

      // Click it
      link.click();
      expanded++;

      console.log(`✅ [${i + 1}/${expandLinks.length}] Expanded team list`);

      // Longer pause every 20 clicks to be more natural
      if (expanded % 20 === 0) {
        console.log('😴 Brief pause...');
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
      }

    } catch (error) {
      failed++;
      console.warn(`⚠️  [${i + 1}/${expandLinks.length}] Failed to expand:`, error.message);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ EXPANSION COMPLETE');
  console.log('='.repeat(80));
  console.log(`✅ Successfully expanded: ${expanded}`);
  console.log(`⚠️  Failed: ${failed}`);
  console.log('\n💡 Now you can run the scraper to collect all agency relationships!');
}

// Auto-execute
(async () => {
  try {
    await expandAllTeams();
  } catch (error) {
    console.error('❌ Expansion failed:', error);
  }
})();
