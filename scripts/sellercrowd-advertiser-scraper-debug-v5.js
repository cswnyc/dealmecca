/**
 * Debug Script v5 - Test the exact selectors and extraction logic
 *
 * USAGE:
 * Paste into browser console on SellerCrowd advertisers page
 */

(function() {
  console.log('🔍 Debug v5 - Testing v10 selectors and extraction...\n');

  // Test 1: Find activity containers using v10 selector
  const activityContainers = Array.from(document.querySelectorAll('[class*="styled__Cont-ekjWEI"]'))
    .filter(el => el.textContent && el.textContent.includes('Last activity:'));

  console.log(`📊 Found ${activityContainers.length} activity containers using v10 selector\n`);

  if (activityContainers.length === 0) {
    console.log('❌ No containers found! Let me try alternative approaches...\n');

    // Alternative 1: Try XPath
    const xpath = "//text()[contains(., 'Last activity:')]";
    const textNodes = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    console.log(`📊 XPath found ${textNodes.snapshotLength} text nodes with "Last activity:"`);

    if (textNodes.snapshotLength > 0) {
      console.log('\nUsing first text node as test case:');
      const firstNode = textNodes.snapshotItem(0);
      console.log('Parent element:', firstNode.parentElement);
      console.log('Parent class:', firstNode.parentElement?.className);
    }

    // Alternative 2: Find all divs with the class pattern
    const allStyled = document.querySelectorAll('[class*="styled__Cont-ekjWEI"]');
    console.log(`\n📊 Total elements with styled__Cont-ekjWEI class: ${allStyled.length}`);

    if (allStyled.length > 0) {
      console.log('\nFirst 3 elements with this class:');
      Array.from(allStyled).slice(0, 3).forEach((el, i) => {
        console.log(`  ${i + 1}. Text: ${el.textContent?.substring(0, 50)}...`);
        console.log(`     Class: ${el.className}`);
      });
    }

    return;
  }

  // Test 2: Try extraction on first 3 containers
  console.log('='.repeat(80));
  console.log('EXTRACTION TEST - First 3 Advertisers');
  console.log('='.repeat(80));

  activityContainers.slice(0, 3).forEach((activityEl, index) => {
    console.log(`\n--- Test ${index + 1} ---`);

    // Go up 5 levels
    let cardContainer = activityEl;
    for (let i = 0; i < 5; i++) {
      if (!cardContainer.parentElement) break;
      cardContainer = cardContainer.parentElement;
    }

    const cardText = cardContainer.textContent || '';
    console.log(`Card text length: ${cardText.length}`);
    console.log(`Card text (first 200 chars): ${cardText.substring(0, 200)}`);

    // Extract agencies
    const agencyElements = cardContainer.querySelectorAll('[class*="styled__Item"]');
    console.log(`Agency elements found: ${agencyElements.length}`);

    const agencies = [];
    agencyElements.forEach(el => {
      const agencyName = el.textContent?.trim();
      if (agencyName && agencyName.length > 2 && agencyName.length < 100) {
        if (!agencyName.includes('Last activity') &&
            !agencyName.includes('Not specified') &&
            !agencyName.includes('ADVERTISER')) {
          agencies.push(agencyName);
        }
      }
    });
    console.log(`Agencies extracted: ${agencies.length}`);
    if (agencies.length > 0) {
      console.log(`First agency: "${agencies[0]}"`);
    }

    // Extract location
    const locationMatch = cardText.match(/([A-Z][a-z]+(?:[\s\-][A-Z][a-z]+)*),\s*([A-Z]{2})/);
    console.log(`Location match: ${locationMatch ? `${locationMatch[1]}, ${locationMatch[2]}` : 'none'}`);

    // Extract advertiser name
    let advertiserName = null;

    if (agencies.length > 0) {
      const firstAgency = agencies[0];
      const firstAgencyIndex = cardText.indexOf(firstAgency);
      console.log(`First agency index in text: ${firstAgencyIndex}`);

      if (firstAgencyIndex > 0) {
        let textBeforeAgencies = cardText.substring(0, firstAgencyIndex);
        console.log(`Text before agencies (first 100): ${textBeforeAgencies.substring(0, 100)}`);

        textBeforeAgencies = textBeforeAgencies
          .replace(/Hide teams/g, '')
          .replace(/Show teams/g, '')
          .replace(/Last activity:?[^\n]*/g, '')
          .replace(/ADVERTISER/g, '')
          .replace(/Not specified/g, '')
          .trim();

        const lines = textBeforeAgencies.split('\n').filter(l => l.trim());
        if (lines.length > 0) {
          advertiserName = lines[0].trim();
        } else {
          advertiserName = textBeforeAgencies.trim();
        }
      }
    } else {
      let textBeforeLocation = cardText;

      if (locationMatch) {
        const locationIndex = cardText.indexOf(locationMatch[0]);
        textBeforeLocation = cardText.substring(0, locationIndex);
      }

      textBeforeLocation = textBeforeLocation
        .replace(/Hide teams/g, '')
        .replace(/Show teams/g, '')
        .replace(/Last activity:?[^\n]*/g, '')
        .replace(/ADVERTISER/g, '')
        .replace(/Not specified/g, '')
        .replace(/0\s*cat/g, '')
        .trim();

      const lines = textBeforeLocation.split('\n').filter(l => l.trim());
      if (lines.length > 0) {
        advertiserName = lines[0].trim();
      } else {
        advertiserName = textBeforeLocation.trim();
      }
    }

    if (advertiserName) {
      advertiserName = advertiserName
        .replace(/[,\s]+$/, '')
        .replace(/^\d+\s*/, '')
        .trim();
    }

    console.log(`✅ EXTRACTED NAME: "${advertiserName}"`);
  });

  console.log('\n✅ Debug complete!');
})();
