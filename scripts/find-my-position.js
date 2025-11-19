// Quick script to see what section you're in
var cards = document.querySelectorAll('.org-charts-advertisers-tab-list-item');
var letters = {};

cards.forEach(function(card) {
  var nameEl = card.querySelector('[data-testid="entity-title"]');
  if (nameEl) {
    var name = nameEl.textContent.trim();
    var firstChar = name[0].toUpperCase();
    letters[firstChar] = (letters[firstChar] || 0) + 1;
  }
});

console.log('Cards currently visible by first letter:');
Object.keys(letters).sort().forEach(function(letter) {
  console.log(letter + ': ' + letters[letter] + ' cards');
});
