/**
 * SellerCrowd Auto-Expand All Agency Teams (v2)
 * Improved selector targeting for "Hide teams" links
 *
 * HOW TO USE:
 * 1. Navigate to SellerCrowd Advertisers tab
 * 2. Scroll down to load the advertisers you want to expand (50-200)
 * 3. Open browser console (F12 or Cmd+Option+J)
 * 4. Copy and paste this entire script
 * 5. Press Enter
 * 6. Watch the console output
 */

async function expandAllTeamsV2() {
  console.clear(); // Clear console for clean output
  console.log('🔓 Auto-Expanding All Agency Teams (v2)...');
  console.log('================================================================================\n');

  // First, let's find what we're working with
  console.log('🔍 Searching for "Hide teams" links...\n');

  // Strategy 1: Find all links/buttons containing "Hide teams" text
  let hideTeamsLinks = [];

  // Check all clickable elements
  const allClickables = document.querySelectorAll('a, button, span[role="button"], div[role="button"]');

  console.log(`   Found ${allClickables.length} total clickable elements`);

  allClickables.forEach(el => {
    const text = el.textContent?.trim().toLowerCase() || '';
    // Look for "Hide teams" specifically (case-insensitive)
    if (text.includes('hide') && text.includes('team')) {
      hideTeamsLinks.push(el);
      console.log(`   ✓ Found: "${el.textContent.trim()}"`);
    }
  });

  console.log(`\n📊 Found ${hideTeamsLinks.length} "Hide teams" links to expand\n`);

  if (hideTeamsLinks.length === 0) {
    console.log('❌ No "Hide teams" links found!');
    console.log('\n🔍 Debugging - Let me check what links ARE available:');

    // Show some sample link text for debugging
    const sampleLinks = Array.from(document.querySelectorAll('a'))
      .slice(0, 20)
      .map(a => a.textContent?.trim())
      .filter(text => text && text.length > 0 && text.length < 50);

    console.log('Sample links found on page:');
    sampleLinks.forEach((text, i) => {
      console.log(`   ${i + 1}. "${text}"`);
    });

    console.log('\n💡 Possible reasons:');
    console.log('   1. Already expanded all teams');
    console.log('   2. Need to scroll to load more advertisers first');
    console.log('   3. SellerCrowd changed their HTML structure');
    return;
  }

  // Now expand them one by one
  let expanded = 0;
  let failed = 0;

  for (let i = 0; i < hideTeamsLinks.length; i++) {
    const link = hideTeamsLinks[i];

    try {
      // Scroll into view
      link.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Small delay to appear natural
      await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 100));

      // Click it
      link.click();
      expanded++;

      console.log(`✅ [${i + 1}/${hideTeamsLinks.length}] Clicked "${link.textContent.trim()}"`);

      // Pause every 10 clicks
      if (expanded % 10 === 0) {
        console.log('   😴 Brief pause...');
        await new Promise(resolve => setTimeout(resolve, 500));
      }

    } catch (error) {
      failed++;
      console.warn(`⚠️  [${i + 1}/${hideTeamsLinks.length}] Failed:`, error.message);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ EXPANSION COMPLETE');
  console.log('='.repeat(80));
  console.log(`✅ Successfully clicked: ${expanded}`);
  console.log(`⚠️  Failed: ${failed}`);

  if (expanded > 0) {
    console.log('\n💡 Next step: Run the scraper script to collect all data!');
  }

  console.log('\n📝 Note: The links might now say "Show teams" (collapsed state)');
  console.log('   This is normal - they toggle between Hide/Show');
}

// Auto-execute
(async () => {
  try {
    await expandAllTeamsV2();
  } catch (error) {
    console.error('❌ Script error:', error);
    console.error('Stack trace:', error.stack);
  }
})();
