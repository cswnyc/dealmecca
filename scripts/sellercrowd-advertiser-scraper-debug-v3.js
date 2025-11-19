/**
 * Debug v3 - Inspect the "Hide teams" card structure
 */

console.clear();
console.log('🔍 DEBUGGING "Hide teams" Cards...\n');

// Find "Hide teams" links
const hideTeamsLinks = Array.from(document.querySelectorAll('*'))
  .filter(el => {
    const text = el.textContent?.trim() || '';
    return (text === 'Hide teams' || text === 'Show teams') && el.tagName !== 'BODY';
  });

console.log(`Found ${hideTeamsLinks.length} "Hide/Show teams" links\n`);

// Inspect first 3
for (let i = 0; i < Math.min(3, hideTeamsLinks.length); i++) {
  const teamLink = hideTeamsLinks[i];

  console.log(`\n${'='.repeat(80)}`);
  console.log(`LINK ${i + 1}: "${teamLink.textContent}"`);
  console.log(`${'='.repeat(80)}`);

  // Traverse up
  let current = teamLink;
  let depth = 0;

  console.log('\nTraversing UP the DOM:');

  while (current && depth < 10) {
    const text = current.textContent || '';
    const textLength = text.length;
    const hasLastActivity = text.includes('Last activity:');
    const hasLocation = /[A-Z][a-z]+,\s*[A-Z]{2}/.test(text);
    const locationMatch = text.match(/([A-Z][a-z]+),\s*([A-Z]{2})/);

    console.log(`\n  Depth ${depth}:`);
    console.log(`    Tag: ${current.tagName}`);
    console.log(`    Text length: ${textLength}`);
    console.log(`    Has "Last activity:": ${hasLastActivity}`);
    console.log(`    Has location: ${hasLocation}`);
    if (locationMatch) {
      console.log(`    Location: ${locationMatch[1]}, ${locationMatch[2]}`);
    }

    // Show first 200 chars of text
    const preview = text.substring(0, 200).replace(/\n/g, ' ');
    console.log(`    Text preview: "${preview}..."`);

    // Check validation
    if (hasLastActivity &&
        textLength >= 150 &&
        textLength <= 10000 &&
        (hasLocation || textLength > 300)) {
      console.log(`    ✅ PASSES VALIDATION!`);

      // Try to extract name
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      console.log(`\n    First 10 lines:`);
      lines.slice(0, 10).forEach((line, idx) => {
        console.log(`      ${idx + 1}. "${line}"`);
      });

      break;
    }

    current = current.parentElement;
    depth++;
  }
}

console.log('\n\n' + '='.repeat(80));
console.log('Share this output!');
