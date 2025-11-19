// Remove all cards that DON'T start with C (since we're in C section)
var removed = 0;
var kept = 0;

document.querySelectorAll('.org-charts-advertisers-tab-list-item').forEach(function(card) {
  var nameEl = card.querySelector('[data-testid="entity-title"]');
  if (nameEl) {
    var name = nameEl.textContent.trim();
    var firstChar = name[0].toUpperCase();

    // Keep only C cards
    if (firstChar === 'C') {
      kept++;
    } else {
      card.remove();
      removed++;
    }
  }
});

console.log('✅ Cleanup complete!');
console.log('Removed: ' + removed + ' cards');
console.log('Kept: ' + kept + ' C-section cards');
