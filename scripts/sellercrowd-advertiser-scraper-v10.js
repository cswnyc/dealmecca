/**
 * SellerCrowd Advertiser Scraper v10 - Using Correct DOM Structure
 *
 * BASED ON DEBUG V4 FINDINGS:
 * - "Last activity:" is in DIV.styled__Cont-ekjWEI jCMUls
 * - Card container is at depth 4-5 (A.CleanLink-kezGCh styled__RowLi)
 * - Page uses virtualized scrolling (only visible items in DOM)
 *
 * USAGE:
 * 1. Go to https://sellercrowd.com/advertisers (logged in)
 * 2. Scroll down to load advertisers into viewport
 * 3. Optionally expand teams for advertisers you want agency data
 * 4. Paste this script into browser console and press Enter
 * 5. Wait for processing
 * 6. Run: copy(JSON.stringify(window.scrapedAdvertisers, null, 2))
 * 7. Paste into a file and save as JSON
 *
 * NOTE: Due to virtualized scrolling, you'll need to scroll through the list
 * and run the script multiple times to capture all 16k advertisers.
 */

(function() {
  console.log('🚀 SellerCrowd Advertiser Scraper v10 Starting...');
  console.log('================================================================================\n');

  // Find all "Last activity:" innermost containers
  const activityContainers = Array.from(document.querySelectorAll('[class*="styled__Cont-ekjWEI"]'))
    .filter(el => el.textContent && el.textContent.includes('Last activity:'));

  console.log(`📊 Found ${activityContainers.length} "Last activity:" containers`);

  window.scrapedAdvertisers = [];
  let processed = 0;
  let extracted = 0;
  let errors = 0;

  activityContainers.forEach((activityEl, index) => {
    try {
      processed++;

      // Based on debug: card is at depth 4-5 from activity container
      // Depth 0: DIV.styled__Cont-ekjWEI (current)
      // Depth 1: DIV.styled__LastInfo-qGavb
      // Depth 2: DIV.styled__FirstCell-hsaGXP
      // Depth 3: DIV.styled__CellsCont-eMhEoQ
      // Depth 4: DIV.styled__Cont-gzGLHZ (has location)
      // Depth 5: A.CleanLink-kezGCh (the row/card link)

      let cardContainer = activityEl;

      // Go up 5 levels to reach the A.CleanLink card
      for (let i = 0; i < 5; i++) {
        if (!cardContainer.parentElement) break;
        cardContainer = cardContainer.parentElement;
      }

      const cardText = cardContainer.textContent || '';

      // Validation: should have reasonable length and location info
      if (cardText.length < 30 || cardText.length > 5000) {
        console.log(`⚠️  [${processed}/${activityContainers.length}] Skipping - invalid card length: ${cardText.length}`);
        return;
      }

      // Extract agencies (if expanded) - using the styled__Item pattern from v8
      const agencies = [];
      const agencyElements = cardContainer.querySelectorAll('[class*="styled__Item"]');
      agencyElements.forEach(el => {
        const agencyName = el.textContent?.trim();
        if (agencyName && agencyName.length > 2 && agencyName.length < 100) {
          // Filter out common non-agency text
          if (!agencyName.includes('Last activity') &&
              !agencyName.includes('Not specified') &&
              !agencyName.includes('ADVERTISER')) {
            agencies.push(agencyName);
          }
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

      // Extract last activity time
      let lastActivity = undefined;
      const activityMatch = cardText.match(/Last activity:?\s*([^\n]+?)(?=\s*(?:[A-Z]|$))/);
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
          let textBeforeAgencies = cardText.substring(0, firstAgencyIndex);

          // Remove common UI text
          textBeforeAgencies = textBeforeAgencies
            .replace(/Hide teams/g, '')
            .replace(/Show teams/g, '')
            .replace(/Last activity:?[^\n]*/g, '')
            .replace(/ADVERTISER/g, '')
            .replace(/Not specified/g, '')
            .trim();

          // The name should be at the very beginning after cleanup
          // Extract first line/segment
          const lines = textBeforeAgencies.split('\n').filter(l => l.trim());
          if (lines.length > 0) {
            advertiserName = lines[0].trim();
          } else {
            advertiserName = textBeforeAgencies.trim();
          }
        }
      } else {
        // Case 2: No expanded agencies - name is at the beginning
        let textBeforeLocation = cardText;

        // Remove location if present
        if (locationMatch) {
          const locationIndex = cardText.indexOf(locationMatch[0]);
          textBeforeLocation = cardText.substring(0, locationIndex);
        }

        // Remove common UI text
        textBeforeLocation = textBeforeLocation
          .replace(/Hide teams/g, '')
          .replace(/Show teams/g, '')
          .replace(/Last activity:?[^\n]*/g, '')
          .replace(/ADVERTISER/g, '')
          .replace(/Not specified/g, '')
          .replace(/0\s*cat/g, '')
          .trim();

        // Extract first line/segment as name
        const lines = textBeforeLocation.split('\n').filter(l => l.trim());
        if (lines.length > 0) {
          advertiserName = lines[0].trim();
        } else {
          advertiserName = textBeforeLocation.trim();
        }
      }

      // Clean up name - remove any trailing punctuation or numbers
      if (advertiserName) {
        advertiserName = advertiserName
          .replace(/[,\s]+$/, '')
          .replace(/^\d+\s*/, '') // Remove leading numbers
          .trim();
      }

      // Validation: advertiser name should be reasonable
      if (!advertiserName ||
          advertiserName.length < 2 ||
          advertiserName.length > 200 ||
          advertiserName === 'ADVERTISER' ||
          advertiserName.includes('Last activity') ||
          advertiserName.includes('Not specified')) {
        console.log(`⚠️  [${processed}/${activityContainers.length}] Skipping - invalid name: "${advertiserName}"`);
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
      const agencyInfo = agencies.length > 0 ? ` [${agencies.length} agencies]` : '';
      const locationInfo = city && state ? ` (${city}, ${state})` : '';
      console.log(`✅ [${extracted}] ${advertiserName}${locationInfo}${agencyInfo}`);

    } catch (error) {
      errors++;
      console.error(`❌ [${processed}/${activityContainers.length}] Error: ${error.message}`);
    }
  });

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 SCRAPING COMPLETE');
  console.log('='.repeat(80));
  console.log(`Containers found:               ${activityContainers.length}`);
  console.log(`Containers processed:           ${processed}`);
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
    console.log('\n💡 TIP: Due to virtualized scrolling, scroll down to load more advertisers');
    console.log('    then run this script again to capture the next batch.');
  } else {
    console.log('\n⚠️  No advertisers extracted. Try:');
    console.log('   1. Scroll down to load advertisers into viewport');
    console.log('   2. Expand some advertiser teams to verify data structure');
    console.log('   3. Run script again');
  }
})();
