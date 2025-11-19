// EMERGENCY DOWNLOAD - Run this immediately to save your current progress
if (window.scrapedAdvertisers && window.scrapedAdvertisers.length > 0) {
  var data = JSON.stringify(window.scrapedAdvertisers, null, 2);
  var blob = new Blob([data], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'sellercrowd-emergency-' + Date.now() + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  console.log('✅ Downloaded ' + window.scrapedAdvertisers.length + ' advertisers!');
} else {
  console.log('❌ No data found in window.scrapedAdvertisers');
}
