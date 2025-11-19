/**
 * Output scraped advertisers to console for manual copy
 *
 * USAGE:
 * After running the scraper, paste this into console to see the JSON output
 * Then manually select and copy the output
 */

(function() {
  if (!window.scrapedAdvertisers || window.scrapedAdvertisers.length === 0) {
    console.error('❌ No data found in window.scrapedAdvertisers');
    console.log('Make sure you run the scraper first!');
    return;
  }

  console.log('\n' + '='.repeat(80));
  console.log('📋 COPY THE JSON BELOW (click to expand if collapsed)');
  console.log('='.repeat(80) + '\n');

  // Output the JSON
  console.log(JSON.stringify(window.scrapedAdvertisers, null, 2));

  console.log('\n' + '='.repeat(80));
  console.log(`✅ ${window.scrapedAdvertisers.length} advertisers ready to copy`);
  console.log('='.repeat(80));
})();
