/**
 * Debug Script v4 - Find "Last activity:" Element Structure
 *
 * USAGE:
 * Paste into browser console on SellerCrowd advertisers page
 */

(function() {
  console.log('🔍 Debug v4 - Analyzing "Last activity:" structure...\n');

  // Method 1: Find all elements containing the text
  const allElements = document.querySelectorAll('*');
  const elementsWithActivity = [];

  allElements.forEach(el => {
    const text = el.textContent || '';
    const ownText = el.innerText || '';

    // Check if this element directly contains "Last activity:"
    if (text.includes('Last activity:')) {
      elementsWithActivity.push(el);
    }
  });

  console.log(`📊 Total elements containing "Last activity:": ${elementsWithActivity.length}`);

  // Method 2: Use XPath to find text nodes
  const xpath = "//text()[contains(., 'Last activity:')]";
  const textNodes = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

  console.log(`📊 Text nodes containing "Last activity:" (XPath): ${textNodes.snapshotLength}\n`);

  if (textNodes.snapshotLength > 0) {
    console.log('='.repeat(80));
    console.log('SAMPLE TEXT NODE ANALYSIS (first 3)');
    console.log('='.repeat(80));

    for (let i = 0; i < Math.min(3, textNodes.snapshotLength); i++) {
      const node = textNodes.snapshotItem(i);
      console.log(`\n--- Text Node ${i + 1} ---`);
      console.log('Text content:', node.textContent.substring(0, 100));
      console.log('Parent element:', node.parentElement?.tagName);
      console.log('Parent class:', node.parentElement?.className);

      // Traverse up to find card
      let current = node.parentElement;
      for (let depth = 0; depth < 8 && current; depth++) {
        const text = current.textContent || '';
        const hasLocation = /[A-Z][a-z]+(?:[\s\-][A-Z][a-z]+)*,\s*[A-Z]{2}/.test(text);
        const hasNotSpecified = text.includes('Not specified');
        const hasAdvertiser = text.includes('ADVERTISER');

        console.log(`  Depth ${depth}: ${current.tagName}.${current.className?.substring(0, 30)} ` +
                    `[len=${text.length}, loc=${hasLocation}, notSpec=${hasNotSpecified}, adv=${hasAdvertiser}]`);

        current = current.parentElement;
      }
    }
  }

  // Method 3: Try to find common parent class pattern
  if (elementsWithActivity.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('ELEMENT TAG AND CLASS ANALYSIS');
    console.log('='.repeat(80));

    const tagCounts = {};
    const classCounts = {};

    elementsWithActivity.forEach(el => {
      const tag = el.tagName;
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;

      if (el.className && typeof el.className === 'string') {
        const firstClass = el.className.split(' ')[0];
        if (firstClass) {
          classCounts[firstClass] = (classCounts[firstClass] || 0) + 1;
        }
      }
    });

    console.log('\nTop tags containing "Last activity:":');
    Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([tag, count]) => {
        console.log(`  ${tag}: ${count}`);
      });

    console.log('\nTop classes containing "Last activity:":');
    Object.entries(classCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([className, count]) => {
        console.log(`  ${className}: ${count}`);
      });
  }

  // Method 4: Find innermost elements (leaf-like)
  const innermostElements = elementsWithActivity.filter(el => {
    const text = el.textContent || '';
    const childrenWithActivity = Array.from(el.children).filter(child =>
      child.textContent?.includes('Last activity:')
    );

    // This is innermost if none of its children contain "Last activity:"
    return childrenWithActivity.length === 0;
  });

  console.log(`\n📊 Innermost elements with "Last activity:": ${innermostElements.length}`);

  if (innermostElements.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('SAMPLE INNERMOST ELEMENTS (first 3)');
    console.log('='.repeat(80));

    innermostElements.slice(0, 3).forEach((el, i) => {
      console.log(`\n--- Innermost Element ${i + 1} ---`);
      console.log('Tag:', el.tagName);
      console.log('Class:', el.className);
      console.log('Text (first 100 chars):', el.textContent?.substring(0, 100));
      console.log('Children count:', el.children.length);
    });
  }

  console.log('\n✅ Debug complete!');
})();
