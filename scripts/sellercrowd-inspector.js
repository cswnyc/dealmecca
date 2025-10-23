// SellerCrowd HTML Inspector
// Run this if the main scraper doesn't work
// This will help you identify the correct CSS selectors

(function() {
  console.clear();
  console.log('\n' + '═'.repeat(70));
  console.log('  SELLERCROWD HTML INSPECTOR');
  console.log('═'.repeat(70) + '\n');

  console.log('This tool will help you find the correct CSS selectors.\n');

  // Function to count elements
  function testSelector(selector, description) {
    try {
      const elements = document.querySelectorAll(selector);
      const count = elements.length;

      if (count > 0) {
        console.log(`✅ ${description}`);
        console.log(`   Selector: ${selector}`);
        console.log(`   Found: ${count} elements`);

        // Show sample of first element's text content
        if (elements[0]) {
          const preview = elements[0].textContent.trim().substring(0, 100);
          console.log(`   Preview: "${preview}..."`);
        }
        console.log('');
        return { selector, count, elements };
      } else {
        console.log(`❌ ${description}`);
        console.log(`   Selector: ${selector}`);
        console.log(`   Found: 0 elements\n`);
        return { selector, count: 0, elements: [] };
      }
    } catch (error) {
      console.log(`⚠️  ${description}`);
      console.log(`   Selector: ${selector}`);
      console.log(`   Error: ${error.message}\n`);
      return { selector, count: 0, elements: [] };
    }
  }

  console.log('📋 Testing Common Contact Card Selectors:\n');
  console.log('─'.repeat(70) + '\n');

  // Test contact card patterns
  const cardResults = [
    testSelector('[class*="ContactCard"]', 'Contact Card (React style)'),
    testSelector('[class*="contact-card"]', 'Contact Card (kebab-case)'),
    testSelector('[class*="Contact-card"]', 'Contact Card (mixed case)'),
    testSelector('[data-testid*="contact"]', 'Contact (data-testid)'),
    testSelector('li[class*="contact"]', 'Contact List Items'),
    testSelector('div[role="listitem"]', 'List Item (ARIA role)'),
    testSelector('article', 'Article Elements'),
    testSelector('[class*="card"]', 'Generic Card Elements'),
  ];

  console.log('─'.repeat(70) + '\n');
  console.log('📧 Testing Email Link Patterns:\n');
  console.log('─'.repeat(70) + '\n');

  const emailResults = [
    testSelector('a[href^="mailto:"]', 'Email Links (mailto:)'),
    testSelector('a[href*="@"]', 'Email Links (contains @)'),
  ];

  console.log('─'.repeat(70) + '\n');
  console.log('🔗 Testing LinkedIn Link Patterns:\n');
  console.log('─'.repeat(70) + '\n');

  const linkedinResults = [
    testSelector('a[href*="linkedin.com"]', 'LinkedIn Links'),
    testSelector('a[href*="linkedin"]', 'LinkedIn Links (partial)'),
  ];

  console.log('─'.repeat(70) + '\n');
  console.log('📊 ANALYSIS:\n');

  // Find best candidate for contact cards
  const validCards = cardResults.filter(r => r.count > 0);

  if (validCards.length === 0) {
    console.log('❌ Could not find any contact card elements.\n');
    console.log('💡 NEXT STEPS:');
    console.log('   1. Right-click on a contact card');
    console.log('   2. Select "Inspect" or "Inspect Element"');
    console.log('   3. Look at the HTML in DevTools');
    console.log('   4. Find the outermost <div> or element that wraps ONE contact');
    console.log('   5. Note the class names or attributes');
    console.log('   6. Test manually: document.querySelectorAll("YOUR-SELECTOR")\n');
  } else {
    console.log(`✅ Found ${validCards.length} potential contact card selector(s)\n`);

    // Show recommendation
    const best = validCards[0];
    console.log('🎯 RECOMMENDED SELECTOR:');
    console.log(`   const contactCards = document.querySelectorAll('${best.selector}');`);
    console.log(`   // This will select ${best.count} elements\n`);

    // Check for LinkedIn and email within cards
    console.log('🔍 Validating selector quality...\n');

    let cardsWithEmail = 0;
    let cardsWithLinkedIn = 0;
    let cardsWithBoth = 0;

    best.elements.forEach((card, index) => {
      const hasEmail = card.querySelector('a[href^="mailto:"]') !== null;
      const hasLinkedIn = card.querySelector('a[href*="linkedin"]') !== null;

      if (hasEmail) cardsWithEmail++;
      if (hasLinkedIn) cardsWithLinkedIn++;
      if (hasEmail && hasLinkedIn) cardsWithBoth++;

      // Show first 3 samples
      if (index < 3) {
        console.log(`   Card ${index + 1}:`);
        console.log(`   - Has email: ${hasEmail ? '✅' : '❌'}`);
        console.log(`   - Has LinkedIn: ${hasLinkedIn ? '✅' : '❌'}`);
        console.log(`   - Text preview: "${card.textContent.trim().substring(0, 60)}..."`);
        console.log('');
      }
    });

    console.log('📊 SUMMARY:');
    console.log(`   Total cards found: ${best.count}`);
    console.log(`   Cards with email: ${cardsWithEmail} (${Math.round(cardsWithEmail/best.count*100)}%)`);
    console.log(`   Cards with LinkedIn: ${cardsWithLinkedIn} (${Math.round(cardsWithLinkedIn/best.count*100)}%)`);
    console.log(`   Cards with both: ${cardsWithBoth} (${Math.round(cardsWithBoth/best.count*100)}%)\n`);

    if (cardsWithBoth / best.count > 0.8) {
      console.log('✅ Selector looks EXCELLENT! ~80%+ of cards have both email and LinkedIn.\n');
    } else if (cardsWithEmail / best.count > 0.5) {
      console.log('⚠️  Selector looks GOOD, but some cards may be missing data.\n');
    } else {
      console.log('❌ Selector may not be optimal. Consider trying another selector.\n');
    }

    // Generate custom scraper code
    console.log('─'.repeat(70) + '\n');
    console.log('💻 CUSTOM SCRAPER CODE:\n');
    console.log('Copy and paste this into the scraper where it says SELECTORS:\n');
    console.log('─'.repeat(70));
    console.log(`
const SELECTORS = {
  contactCard: '${best.selector}',
  name: 'a[href*="linkedin"]',          // Usually contains or near name
  email: 'a[href^="mailto:"]',          // Email links
  linkedin: 'a[href*="linkedin.com"]',  // LinkedIn profile links
};
    `.trim());
    console.log('─'.repeat(70) + '\n');
  }

  // Additional diagnostics
  console.log('\n📋 ADDITIONAL DIAGNOSTICS:\n');

  // Check for common patterns in text
  const bodyText = document.body.textContent;
  const hasAtSymbol = bodyText.includes(' @ ');
  const hasLastActivity = bodyText.includes('Last activity');
  const hasConvention = bodyText.includes('convention');

  console.log(`   "Title @ Company" pattern: ${hasAtSymbol ? '✅ Found' : '❌ Not found'}`);
  console.log(`   "Last activity" text: ${hasLastActivity ? '✅ Found' : '❌ Not found'}`);
  console.log(`   "convention" tags: ${hasConvention ? '✅ Found' : '❌ Not found'}\n`);

  // Check page structure
  console.log('📐 PAGE STRUCTURE:\n');
  const allDivs = document.querySelectorAll('div').length;
  const allArticles = document.querySelectorAll('article').length;
  const allLis = document.querySelectorAll('li').length;

  console.log(`   Total <div> elements: ${allDivs}`);
  console.log(`   Total <article> elements: ${allArticles}`);
  console.log(`   Total <li> elements: ${allLis}\n`);

  console.log('═'.repeat(70));
  console.log('✅ INSPECTION COMPLETE');
  console.log('═'.repeat(70) + '\n');

  console.log('💡 NEXT STEPS:\n');
  console.log('   1. Review the recommended selector above');
  console.log('   2. Update the scraper with the custom SELECTORS code');
  console.log('   3. Run the main scraper script');
  console.log('   4. If still having issues, manually inspect HTML and adjust\n');

  // Return results for further inspection
  return {
    cardResults,
    emailResults,
    linkedinResults,
    recommendation: validCards.length > 0 ? validCards[0].selector : null
  };

})();
