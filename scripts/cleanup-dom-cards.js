document.querySelectorAll('.org-charts-advertisers-tab-list-item').forEach(card => {
  const nameEl = card.querySelector('[data-testid="entity-title"]');
  if (nameEl) {
    const name = nameEl.textContent.trim();
    const firstLetter = name[0].toUpperCase();
    if (['A', 'B', '&', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(firstLetter)) {
      card.remove();
    }
  }
});
