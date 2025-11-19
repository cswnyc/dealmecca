/**
 * SellerCrowd Advertiser Scraper - DEBUG v2
 * Shows exactly why cards are being rejected
 */

console.clear();
console.log('🔍 DEBUGGING Card Detection...\n');

// Find "Last activity:" elements
const lastActivityCandidates = Array.from(document.querySelectorAll('*'))
  .filter(el => {
    const text = el.textContent || '';
    const textLength = text.length;
    return text.includes('Last activity:') &&
           textLength < 500 &&
           el.children.length < 5;
  });

console.log(`Found ${lastActivityCandidates.length} "Last activity:" candidates\n`);

// Test the first 5 candidates
const testCandidates = lastActivityCandidates.slice(0, 5);

for (let i = 0; i < testCandidates.length; i++) {
  const activityEl = testCandidates[i];
  console.log(`\n${'='.repeat(80)}`);
  console.log(`CANDIDATE ${i + 1}:`);
  console.log(`${'='.repeat(80)}`);
  console.log(`Element text: "${activityEl.textContent.substring(0, 100)}..."`);
  console.log(`Element text length: ${activityEl.textContent.length}`);
  console.log(`Element children count: ${activityEl.children.length}`);

  // Try to find card container
  let cardContainer = activityEl;
  let depth = 0;
  let foundCard = false;

  console.log('\nTraversing up the DOM:');

  while (cardContainer && depth < 20) {
    const text = cardContainer.textContent || '';
    const textLength = text.length;
    const lastActivityCount = (text.match(/Last activity:/g) || []).length;
    const hasLocation = /[A-Z][a-z]+,\s*[A-Z]{2}/.test(text);

    console.log(`  Depth ${depth}:`);
    console.log(`    - Length: ${textLength} (need 200-2000)`);
    console.log(`    - Last activity count: ${lastActivityCount} (need exactly 1)`);
    console.log(`    - Has location: ${hasLocation} (need true)`);
    console.log(`    - Tag: ${cardContainer.tagName}`);

    if (textLength >= 200 &&
        textLength <= 2000 &&
        lastActivityCount === 1 &&
        hasLocation) {
      console.log(`    ✅ VALID CARD FOUND at depth ${depth}!`);
      foundCard = true;

      // Show the text
      console.log(`\n    Card text preview:`);
      console.log(`    ${text.substring(0, 300).replace(/\n/g, ' ')}...`);

      // Try to extract location
      const locationMatch = text.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),\s*([A-Z]{2})/);
      if (locationMatch) {
        console.log(`\n    Location found: ${locationMatch[1]}, ${locationMatch[2]}`);
      }

      // Try to extract name
      const locationIndex = text.indexOf(locationMatch[0]);
      const textBeforeLocation = text.substring(0, locationIndex);
      const cleanText = textBeforeLocation
        .replace(/Last activity:?/g, '')
        .replace(/Hide teams/g, '')
        .replace(/Show teams/g, '');
      const lines = cleanText.split('\n')
        .map(l => l.trim())
        .filter(l => l.length >= 3 && l.length <= 80 && !/^\d+$/.test(l));

      console.log(`\n    Potential name lines:`);
      lines.slice(-5).forEach(line => console.log(`      - "${line}"`));

      break;
    }

    cardContainer = cardContainer.parentElement;
    depth++;
  }

  if (!foundCard) {
    console.log(`\n  ❌ No valid card found (stopped at depth ${depth})`);
  }
}

console.log('\n\n' + '='.repeat(80));
console.log('SUMMARY');
console.log('='.repeat(80));
console.log('If you see "No valid card found" for all candidates, the issue is:');
console.log('- Cards are too large (>2000 chars) - need to increase limit');
console.log('- Cards have multiple "Last activity:" texts - need different approach');
console.log('- Cards don\'t have location pattern - need to handle non-US advertisers');
console.log('\nShare this debug output!');
