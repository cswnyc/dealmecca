// Debug script to see what's on the page
console.log('=== DOM DEBUGGING ===');

// Check how many cards exist
const cards = document.querySelectorAll('.org-charts-advertisers-tab-list-item');
console.log('Total cards found:', cards.length);

// Check first 5 cards
console.log('\nFirst 5 cards:');
for (let i = 0; i < Math.min(5, cards.length); i++) {
  const card = cards[i];
  const nameEl = card.querySelector('[data-testid="entity-title"]');
  if (nameEl) {
    console.log(`Card ${i}: ${nameEl.textContent.trim()}`);
  } else {
    console.log(`Card ${i}: NO NAME ELEMENT FOUND`);
    console.log('Card HTML:', card.innerHTML.substring(0, 200));
  }
}

// Try alternative selectors
console.log('\n=== TRYING ALTERNATIVE SELECTORS ===');
console.log('Items with data-testid="entity-title":', document.querySelectorAll('[data-testid="entity-title"]').length);
console.log('Divs with class containing "list-item":', document.querySelectorAll('div[class*="list-item"]').length);
console.log('Divs with class containing "advertiser":', document.querySelectorAll('div[class*="advertiser"]').length);
