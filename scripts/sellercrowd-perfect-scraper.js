// SellerCrowd Perfect Scraper
// Customized for SellerCrowd's exact HTML structure
// Based on actual DOM analysis

(function() {
  console.clear();
  console.log('\n' + '═'.repeat(70));
  console.log('  SELLERCROWD PERFECT SCRAPER');
  console.log('═'.repeat(70) + '\n');

  // Configuration
  const CONFIG = {
    scrollDelay: 2000,           // 2 seconds between scrolls
    maxScrollAttempts: 250,      // High limit for 309 contacts
    scrollStableCount: 5,        // Stop after 5 unchanged counts
  };

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Auto-scroll to load all contacts
  async function autoScroll() {
    console.log('📜 Auto-scrolling to load all 309 contacts...\n');

    let lastCount = 0;
    let currentCount = 0;
    let unchangedCount = 0;
    let scrollAttempt = 0;

    while (scrollAttempt < CONFIG.maxScrollAttempts) {
      // Scroll to bottom
      window.scrollTo(0, document.body.scrollHeight);
      scrollAttempt++;

      // Wait for lazy loading
      await sleep(CONFIG.scrollDelay);

      // Count contact cards
      currentCount = document.querySelectorAll('[data-testid="entity-title"]').length;

      if (currentCount === lastCount) {
        unchangedCount++;
        console.log(`   Scroll ${scrollAttempt}: ${currentCount} contacts (stable ${unchangedCount}/${CONFIG.scrollStableCount})`);

        if (unchangedCount >= CONFIG.scrollStableCount) {
          console.log(`\n✅ Loaded ${currentCount} contacts after ${scrollAttempt} scrolls\n`);
          break;
        }
      } else {
        console.log(`   Scroll ${scrollAttempt}: ${currentCount} contacts (+${currentCount - lastCount} new)`);
        unchangedCount = 0;
      }

      lastCount = currentCount;
    }

    if (scrollAttempt >= CONFIG.maxScrollAttempts) {
      console.warn(`⚠️  Reached max scroll attempts (${CONFIG.maxScrollAttempts})\n`);
    }

    // Scroll back to top
    window.scrollTo(0, 0);
    await sleep(500);

    return currentCount;
  }

  // Extract single contact from card element
  function extractContact(cardElement) {
    const contact = {
      firstName: '',
      lastName: '',
      title: '',
      company: '',
      email: '',
      linkedinUrl: '',
      phone: '',
      department: '',
    };

    try {
      // Extract name from [data-testid="entity-title"]
      const nameContainer = cardElement.querySelector('[data-testid="entity-title"]');
      if (nameContainer) {
        // Name is in first div inside NameCont
        const nameDiv = nameContainer.querySelector('.styled__NameCont-eMPfXV > div');
        if (nameDiv) {
          const fullName = nameDiv.textContent.trim();
          const nameParts = fullName.split(' ');
          contact.firstName = nameParts[0] || '';
          contact.lastName = nameParts.slice(1).join(' ') || '';
        }

        // LinkedIn URL
        const linkedInLink = nameContainer.querySelector('a[href*="linkedin.com"]');
        if (linkedInLink) {
          contact.linkedinUrl = linkedInLink.href;
        }
      }

      // Extract "Title @ Company"
      const titleElement = cardElement.querySelector('.styled__PersonTitleCont-iuwunE, [class*="PersonTitleCont"]');
      if (titleElement) {
        const titleText = titleElement.textContent.trim();
        if (titleText.includes(' @ ')) {
          const [title, company] = titleText.split(' @ ').map(s => s.trim());
          contact.title = title;
          contact.company = company;
        } else {
          contact.title = titleText;
        }
      }

      // Extract emails from [data-testid="org-charts-person-email"]
      const emailElements = cardElement.querySelectorAll('[data-testid="org-charts-person-email"]');
      const emails = [];

      emailElements.forEach(emailEl => {
        // Email text is in .styled__OverflowText-gaZPKG or similar
        const emailTextEl = emailEl.querySelector('[class*="OverflowText"]');
        if (emailTextEl) {
          const emailText = emailTextEl.textContent.trim();
          // Validate it's an email format
          if (emailText.includes('@') && emailText.includes('.')) {
            emails.push(emailText);
          }
        }
      });

      // Prioritize @wpp.com over @groupm.com
      if (emails.length > 0) {
        contact.email = emails.find(e => e.includes('@wpp.com')) ||
                       emails.find(e => !e.includes('@groupm.com')) ||
                       emails[0];
      }

      // Extract phone if present (rare but check)
      const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
      const cardText = cardElement.textContent;
      const phoneMatch = cardText.match(phoneRegex);
      if (phoneMatch) {
        contact.phone = phoneMatch[0];
      }

    } catch (error) {
      console.error('Error extracting contact:', error);
    }

    return contact;
  }

  // Extract all contacts
  function extractAllContacts() {
    console.log('🔍 Extracting contact data...\n');

    // Find all contact cards using the FirstCell container
    const cardElements = document.querySelectorAll('.styled__FirstCell-hsaGXP, [class*="FirstCell"]');
    console.log(`📊 Found ${cardElements.length} contact cards\n`);

    if (cardElements.length === 0) {
      // Fallback: find by entity-title and traverse up
      const titleElements = document.querySelectorAll('[data-testid="entity-title"]');
      console.log(`📊 Fallback: Found ${titleElements.length} contacts by title\n`);

      if (titleElements.length === 0) {
        console.error('❌ Could not find any contact elements\n');
        return [];
      }

      const contacts = [];
      titleElements.forEach((titleEl, index) => {
        // Traverse up to find container
        let container = titleEl.closest('.styled__Cont-hgzjvH, [class*="TextCont"]')?.parentElement?.parentElement;
        if (!container) {
          container = titleEl.closest('div[class*="Cell"]');
        }

        if (container) {
          const contact = extractContact(container);
          if (contact.firstName || contact.email) {
            contacts.push(contact);
          }
        }

        if ((index + 1) % 25 === 0) {
          console.log(`   ✓ Processed ${index + 1} contacts...`);
        }
      });

      console.log(`\n✅ Extracted ${contacts.length} valid contacts\n`);
      return contacts;
    }

    const contacts = [];
    let processed = 0;

    cardElements.forEach((card, index) => {
      const contact = extractContact(card);

      // Only include if we have at least a name or email
      if (contact.firstName || contact.email) {
        contacts.push(contact);
        processed++;

        if (processed % 50 === 0) {
          console.log(`   ✓ Processed ${processed} contacts...`);
        }
      }
    });

    console.log(`\n✅ Extracted ${contacts.length} valid contacts\n`);
    return contacts;
  }

  // Generate CSV
  function generateCSV(contacts, companyName, parentCompanyId, website, companyType) {
    console.log('📄 Generating CSV...\n');

    const headers = [
      'companyName', 'firstName', 'lastName', 'title', 'email', 'phone',
      'linkedinUrl', 'department', 'industry', 'employeeCount', 'revenue',
      'headquarters', 'description', 'website', 'domain', 'companyType', 'parentCompanyId'
    ];

    const rows = [headers];

    contacts.forEach(contact => {
      rows.push([
        companyName,
        contact.firstName,
        contact.lastName,
        contact.title,
        contact.email,
        contact.phone,
        contact.linkedinUrl,
        contact.department,
        '', // industry
        '', // employeeCount
        '', // revenue
        '', // headquarters
        '', // description
        website || '',
        '', // domain
        companyType || 'AGENCY', // Use provided companyType
        parentCompanyId
      ]);
    });

    // Convert to CSV with proper escaping
    const csvContent = rows.map(row =>
      row.map(cell => {
        const value = String(cell || '');
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return '"' + value.replace(/"/g, '""') + '"';
        }
        return value;
      }).join(',')
    ).join('\n');

    return csvContent;
  }

  // Download CSV
  function downloadCSV(csvContent, filename) {
    console.log('💾 Downloading CSV...\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  // Main execution
  async function main() {
    const startTime = Date.now();

    // Get company info
    const companyName = prompt('📝 Enter company name (e.g., "WPP Media NY"):');
    if (!companyName) {
      console.error('❌ Company name is required');
      return;
    }

    const parentCompanyId = prompt('📝 Enter parent company ID (optional):\n(Press OK to skip)') || '';
    const website = prompt('📝 Enter company website (optional):\n(e.g., "https://www.wppmedia.com/")') || '';

    // Prompt for company type
    const companyTypeInput = prompt('📝 Enter company type:\n\n1 = AGENCY (default - for agency branches)\n2 = HOLDING_COMPANY (for WPP, Omnicom, etc.)\n3 = ADVERTISER (for brand clients)\n\nEnter 1, 2, or 3 (or press OK for AGENCY):') || '1';

    const companyTypeMap = {
      '1': 'AGENCY',
      '2': 'HOLDING_COMPANY',
      '3': 'ADVERTISER'
    };
    const companyType = companyTypeMap[companyTypeInput] || 'AGENCY';

    console.log(`📋 Company: ${companyName}`);
    console.log(`📋 Company Type: ${companyType}`);
    if (parentCompanyId) console.log(`📋 Parent ID: ${parentCompanyId}`);
    if (website) console.log(`📋 Website: ${website}\n`);

    // Step 1: Auto-scroll
    const shouldScroll = confirm('🔄 Auto-scroll to load all contacts?\n\n✅ Click OK to scroll (recommended for 309 contacts)\n❌ Click Cancel if already fully loaded');

    let loadedCount = 0;
    if (shouldScroll) {
      loadedCount = await autoScroll();
    }

    // Step 2: Extract
    const contacts = extractAllContacts();

    if (contacts.length === 0) {
      console.error('❌ No contacts extracted\n');
      console.log('💡 TIP: Make sure you scrolled to load all contacts first.\n');
      return;
    }

    // Step 3: Quality check
    const withEmails = contacts.filter(c => c.email).length;
    const withTitles = contacts.filter(c => c.title).length;
    const withNames = contacts.filter(c => c.firstName).length;
    const withLinkedIn = contacts.filter(c => c.linkedinUrl).length;

    console.log('📊 DATA QUALITY REPORT:\n');
    console.log(`   Names:     ${withNames}/${contacts.length} (${Math.round(withNames/contacts.length*100)}%)`);
    console.log(`   Emails:    ${withEmails}/${contacts.length} (${Math.round(withEmails/contacts.length*100)}%)`);
    console.log(`   Titles:    ${withTitles}/${contacts.length} (${Math.round(withTitles/contacts.length*100)}%)`);
    console.log(`   LinkedIn:  ${withLinkedIn}/${contacts.length} (${Math.round(withLinkedIn/contacts.length*100)}%)`);
    console.log('');

    // Show preview
    console.log('👀 Sample of first 3 contacts:');
    console.table(contacts.slice(0, 3));
    console.log('');

    // Step 4: Generate CSV
    const csvContent = generateCSV(contacts, companyName, parentCompanyId, website, companyType);

    // Step 5: Download
    const timestamp = Date.now();
    const safeName = companyName.replace(/[^a-z0-9]/gi, '_');
    const filename = `${safeName}_contacts_${timestamp}.csv`;

    downloadCSV(csvContent, filename);

    // Summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log('═'.repeat(70));
    console.log('✅ EXTRACTION COMPLETE!');
    console.log('═'.repeat(70));
    console.log(`📊 Total contacts extracted: ${contacts.length}`);
    console.log(`📧 Contacts with emails: ${withEmails}`);
    console.log(`📁 CSV filename: ${filename}`);
    console.log(`⏱️  Time taken: ${duration} seconds`);
    console.log('═'.repeat(70) + '\n');

    console.log('📋 NEXT STEPS:\n');
    console.log('   1. ✅ Check Downloads folder for CSV file');
    console.log('   2. ✅ Open CSV and verify data looks correct');
    console.log('   3. ✅ Upload to bulk import in admin panel');
    console.log('   4. ✅ Repeat for next agency!\n');

    // Return for inspection
    return {
      contacts,
      csvContent,
      filename,
      stats: {
        total: contacts.length,
        withEmails,
        withTitles,
        withNames,
        withLinkedIn
      }
    };
  }

  // Run it!
  main().catch(error => {
    console.error('\n❌ SCRIPT ERROR:', error);
    console.log('\n💡 Try refreshing the page and running again.\n');
  });

})();
