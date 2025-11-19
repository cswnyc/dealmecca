/**
 * Download scraped advertisers as JSON file
 *
 * USAGE:
 * After running the scraper, paste this into console to download the JSON file
 */

(function() {
  if (!window.scrapedAdvertisers || window.scrapedAdvertisers.length === 0) {
    console.error('❌ No data found in window.scrapedAdvertisers');
    console.log('Make sure you run the scraper first!');
    return;
  }

  console.log(`📦 Preparing to download ${window.scrapedAdvertisers.length} advertisers...`);

  // Create JSON string
  const jsonString = JSON.stringify(window.scrapedAdvertisers, null, 2);

  // Create blob
  const blob = new Blob([jsonString], { type: 'application/json' });

  // Create download link
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sellercrowd-batch-${Date.now()}.json`;

  // Trigger download
  document.body.appendChild(a);
  a.click();

  // Cleanup
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  console.log(`✅ Download started: ${a.download}`);
  console.log(`📊 File contains ${window.scrapedAdvertisers.length} advertisers`);
})();
