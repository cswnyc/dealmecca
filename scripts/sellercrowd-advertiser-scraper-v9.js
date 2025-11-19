/**
 * SellerCrowd Advertiser Scraper v9 - Extract ALL Advertisers
 *
 * IMPROVEMENTS FROM V8:
 * - Captures ALL advertisers on page (not just those with expanded teams)
 * - Uses "Last activity:" as anchor point instead of "Hide teams" links
 * - Extracts data from both expanded and non-expanded advertiser cards
 *
 * USAGE:
 * 1. Go to https://sellercrowd.com/advertisers (logged in)
 * 2. Scroll to load all advertisers you want to scrape
 * 3. Manually expand teams for advertisers you want agency data (optional)
 * 4. Paste this script into browser console and press Enter
 * 5. Wait for processing (shows progress)
 * 6. Run: copy(JSON.stringify(window.scrapedAdvertisers, null, 2))
 * 7. Paste into a file and save as JSON
 */

(function() {
  console.log('🚀 SellerCrowd Advertiser Scraper v9 Starting...');
  console.log('================================================================================\n');

  // Find all "Last activity:" text nodes
  const allText = document.querySelectorAll('*');
  const activityElements = [];

  allText.forEach(el => {
    if (el.textContent && el.textContent.includes('Last activity:') && el.children.length === 0) {
      activityElements.push(el);
    }
  });

  console.log(`📊 Found ${activityElements.length} "Last activity:" elements`);

  window.scrapedAdvertisers = [];
  let processed = 0;
  let extracted = 0;
  let errors = 0;

  activityElements.forEach((activityEl, index) => {
    try {
      processed++;

      // Traverse up to find card container
      // Based on v8 debug: cards are typically 6-8 levels up from activity text
      let cardContainer = activityEl;
      let foundCard = false;

      // Try up to 12 levels (be generous)
      for (let depth = 0; depth < 12; depth++) {
        if (!cardContainer.parentElement) break;
        cardContainer = cardContainer.parentElement;

        const cardText = cardContainer.textContent || '';

        // Validation: card should have "Last activity:" and reasonable size
        if (cardText.includes('Last activity:') &&
            cardText.length > 30 &&
            cardText.length < 5000) {

          // Check if this looks like a complete card
          // Should have either location pattern (City, ST) or "Not specified"
          const hasLocation = /[A-Z][a-z]+(?:[\s\-][A-Z][a-z]+)*,\s*[A-Z]{2}/.test(cardText) ||
                             cardText.includes('Not specified');

          if (hasLocation) {
            foundCard = true;
            break;
          }
        }
      }

      if (!foundCard) {
        // Skip this one - couldn't find valid card container
        return;
      }

      const cardText = cardContainer.textContent || '';

      // Extract agencies (if expanded)
      const agencies = [];
      const agencyElements = cardContainer.querySelectorAll('[class*="styled__Item"]');
      agencyElements.forEach(el => {
        const agencyName = el.textContent?.trim();
        if (agencyName && agencyName.length > 2 && agencyName.length < 100) {
          agencies.push(agencyName);
        }
      });

      // Extract location (City, ST pattern or "Not specified")
      let city = undefined;
      let state = undefined;

      const locationMatch = cardText.match(/([A-Z][a-z]+(?:[\s\-][A-Z][a-z]+)*),\s*([A-Z]{2})/);
      if (locationMatch) {
        city = locationMatch[1];
        state = locationMatch[2];
      }

      // Extract last activity
      let lastActivity = undefined;
      const activityMatch = cardText.match(/Last activity:?\s*([^A-Z]+?)(?=[A-Z]|$)/);
      if (activityMatch) {
        lastActivity = activityMatch[1].trim();
      }

      // Extract advertiser name
      let advertiserName = null;

      if (agencies.length > 0) {
        // Case 1: Has expanded agencies - name is before first agency
        const firstAgency = agencies[0];
        const firstAgencyIndex = cardText.indexOf(firstAgency);

        if (firstAgencyIndex > 0) {
          const textBeforeAgencies = cardText.substring(0, firstAgencyIndex);
          advertiserName = textBeforeAgencies
            .replace(/Hide teams/g, '')
            .replace(/Show teams/g, '')
            .replace(/Last activity:?/g, '')
            .replace(/ADVERTISER/g, '')
            .replace(/Not specified/g, '')
            .trim();

          // Clean up any trailing commas or extra whitespace
          advertiserName = advertiserName.replace(/[,\s]+$/, '').trim();
        }
      } else {
        // Case 2: No expanded agencies - name is before location or "Not specified"
        let textBeforeLocation = cardText;

        if (locationMatch) {
          const locationIndex = cardText.indexOf(locationMatch[0]);
          textBeforeLocation = cardText.substring(0, locationIndex);
        } else if (cardText.includes('Not specified')) {
          const notSpecifiedIndex = cardText.indexOf('Not specified');
          textBeforeLocation = cardText.substring(0, notSpecifiedIndex);
        }

        advertiserName = textBeforeLocation
          .replace(/Hide teams/g, '')
          .replace(/Show teams/g, '')
          .replace(/Last activity:?/g, '')
          .replace(/ADVERTISER/g, '')
          .replace(/Not specified/g, '')
          .trim();

        // Clean up any trailing commas or extra whitespace
        advertiserName = advertiserName.replace(/[,\s]+$/, '').trim();
      }

      // Validation: advertiser name should be reasonable
      if (!advertiserName ||
          advertiserName.length < 2 ||
          advertiserName.length > 200 ||
          advertiserName === 'ADVERTISER') {
        console.log(`⚠️  [${processed}/${activityElements.length}] Skipping - invalid name: "${advertiserName}"`);
        return;
      }

      // Create advertiser object
      const advertiser = {
        name: advertiserName,
        ...(city && { city }),
        ...(state && { state }),
        ...(agencies.length > 0 && { agencies }),
        ...(lastActivity && { lastActivity })
      };

      window.scrapedAdvertisers.push(advertiser);
      extracted++;

      // Log progress
      if (extracted % 10 === 0 || extracted <= 5) {
        const agencyInfo = agencies.length > 0 ? ` with ${agencies.length} agencies` : '';
        console.log(`✅ [${processed}/${activityElements.length}] Extracted: ${advertiserName}${agencyInfo}`);
      }

    } catch (error) {
      errors++;
      console.error(`❌ [${processed}/${activityElements.length}] Error: ${error.message}`);
    }
  });

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 SCRAPING COMPLETE');
  console.log('='.repeat(80));
  console.log(`Total activity elements found:  ${activityElements.length}`);
  console.log(`Elements processed:             ${processed}`);
  console.log(`Advertisers extracted:          ${extracted}`);
  console.log(`Errors:                         ${errors}`);

  if (extracted > 0) {
    const withAgencies = window.scrapedAdvertisers.filter(a => a.agencies && a.agencies.length > 0).length;
    const totalAgencies = window.scrapedAdvertisers.reduce((sum, a) => sum + (a.agencies?.length || 0), 0);

    console.log(`Advertisers with agencies:      ${withAgencies}`);
    console.log(`Total agency relationships:     ${totalAgencies}`);
    console.log('\n✅ Data saved to window.scrapedAdvertisers');
    console.log('\n📋 To copy to clipboard, run:');
    console.log('   copy(JSON.stringify(window.scrapedAdvertisers, null, 2))');
  } else {
    console.log('\n⚠️  No advertisers extracted. Check the page structure.');
  }
})();
