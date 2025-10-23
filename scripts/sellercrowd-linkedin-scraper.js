// SellerCrowd Scraper - LinkedIn-Based Approach
// Works backwards from LinkedIn links to find contact data
// Use this if emails are plain text (not mailto: links)

(function() {
  console.clear();
  console.log('\n' + '═'.repeat(70));
  console.log('  SELLERCROWD SCRAPER - LINKEDIN-BASED EXTRACTION');
  console.log('═'.repeat(70) + '\n');

  // Config
  const CONFIG = {
    scrollDelay: 2000,        // Slower scroll for more reliable loading
    maxScrollAttempts: 200,   // Higher limit for 309 contacts
    scrollStableCount: 5,     // Consider done after 5 unchanged scrolls
  };

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Enhanced auto-scroll for lazy loading
  async function autoScroll() {
    console.log('📜 Aggressive auto-scrolling to load ALL contacts...\n');

    let lastCount = 0;
    let currentCount = 0;
    let unchangedCount = 0;
    let scrollAttempt = 0;

    while (scrollAttempt < CONFIG.maxScrollAttempts) {
      // Scroll to bottom
      window.scrollTo(0, document.body.scrollHeight);
      scrollAttempt++;

      // Wait for new content
      await sleep(CONFIG.scrollDelay);

      // Count LinkedIn links to track loading
      currentCount = document.querySelectorAll('a[href*="linkedin.com"]').length;

      if (currentCount === lastCount) {
        unchangedCount++;
        console.log(`   Scroll ${scrollAttempt}: ${currentCount} contacts (no change ${unchangedCount}/${CONFIG.scrollStableCount})`);

        if (unchangedCount >= CONFIG.scrollStableCount) {
          console.log(`\n✅ Stable at ${currentCount} contacts after ${scrollAttempt} scrolls\n`);
          break;
        }
      } else {
        console.log(`   Scroll ${scrollAttempt}: ${currentCount} contacts (+${currentCount - lastCount})`);
        unchangedCount = 0;
      }

      lastCount = currentCount;
    }

    // Scroll back to top
    window.scrollTo(0, 0);
    await sleep(500);

    return currentCount;
  }

  // Extract contact from LinkedIn link's parent elements
  function extractContactFromLinkedIn(linkedInLink) {
    const contact = {
      firstName: '',
      lastName: '',
      title: '',
      company: '',
      email: '',
      linkedinUrl: linkedInLink.href,
      phone: '',
      department: '',
    };

    try {
      // Strategy: Find the parent container that holds all contact info
      // Usually within 3-5 levels up from the LinkedIn link
      let currentElement = linkedInLink;
      let searchDepth = 0;
      const maxDepth = 10;

      while (currentElement && searchDepth < maxDepth) {
        const text = currentElement.textContent;

        // Look for contact card indicators
        const hasName = linkedInLink.textContent?.length > 2;
        const hasAtSymbol = text.includes(' @ ');
        const hasActivity = text.includes('Last activity') || text.includes('activity');

        // If this element has all contact info, use it
        if (hasName && hasAtSymbol && hasActivity) {
          // This is likely the contact card container
          const cardText = text;

          // Extract name from LinkedIn link
          const nameText = linkedInLink.textContent.trim();
          if (nameText) {
            const nameParts = nameText.split(' ');
            contact.firstName = nameParts[0] || '';
            contact.lastName = nameParts.slice(1).join(' ') || '';
          }

          // Extract title and company (look for "Title @ Company" pattern)
          const lines = cardText.split('\n').map(l => l.trim()).filter(Boolean);
          const titleLine = lines.find(line => line.includes(' @ ') && !line.includes('Last activity'));

          if (titleLine) {
            const [title, company] = titleLine.split(' @ ').map(s => s.trim());
            contact.title = title || '';
            contact.company = company || '';
          }

          // Extract email - look for email patterns in text
          // Format: word@domain.com or text might say "convention" as tag
          const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
          const emailMatches = cardText.match(emailRegex);
          if (emailMatches && emailMatches.length > 0) {
            // Prefer @wpp.com over @groupm.com
            const emails = emailMatches.map(e => e.toLowerCase());
            contact.email = emails.find(e => e.includes('@wpp.com')) ||
                           emails.find(e => e.includes('@groupm.com')) ||
                           emails[0] || '';
          }

          // Extract phone if present
          const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
          const phoneMatch = cardText.match(phoneRegex);
          if (phoneMatch) {
            contact.phone = phoneMatch[0];
          }

          break; // Found the card, stop searching
        }

        currentElement = currentElement.parentElement;
        searchDepth++;
      }

      // If we couldn't find full info, at least try to get name from link
      if (!contact.firstName && linkedInLink.textContent) {
        const nameText = linkedInLink.textContent.trim();
        const nameParts = nameText.split(' ');
        contact.firstName = nameParts[0] || '';
        contact.lastName = nameParts.slice(1).join(' ') || '';
      }

    } catch (error) {
      console.error('Error extracting contact:', error);
    }

    return contact;
  }

  // Main extraction
  function extractAllContacts() {
    console.log('🔍 Extracting contacts from LinkedIn links...\n');

    const linkedInLinks = document.querySelectorAll('a[href*="linkedin.com"]');
    console.log(`📊 Found ${linkedInLinks.length} LinkedIn links\n`);

    const contacts = [];
    let processed = 0;

    linkedInLinks.forEach((link, index) => {
      const contact = extractContactFromLinkedIn(link);

      // Only include if we have at least a name or LinkedIn
      if (contact.firstName || contact.linkedinUrl) {
        contacts.push(contact);
        processed++;

        if (processed % 25 === 0) {
          console.log(`   ✓ Processed ${processed} contacts...`);
        }
      }
    });

    console.log(`\n✅ Extracted ${contacts.length} contacts\n`);
    return contacts;
  }

  // Generate CSV
  function generateCSV(contacts, companyName, parentCompanyId, website) {
    const headers = [
      'companyName', 'firstName', 'lastName', 'title', 'email', 'phone',
      'linkedinUrl', 'department', 'industry', 'employeeCount', 'revenue',
      'headquarters', 'description', 'website', 'domain', 'companyType', 'parentCompanyId'
    ];

    const rows = [headers];
    contacts.forEach(c => {
      rows.push([
        companyName, c.firstName, c.lastName, c.title, c.email, c.phone,
        c.linkedinUrl, c.department, '', '', '', '', '', website || '', '', '', parentCompanyId
      ]);
    });

    return rows.map(row =>
      row.map(cell => {
        const value = String(cell || '');
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return '"' + value.replace(/"/g, '""') + '"';
        }
        return value;
      }).join(',')
    ).join('\n');
  }

  // Download CSV
  function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Main
  async function main() {
    const startTime = Date.now();

    const companyName = prompt('📝 Enter company name (e.g., "WPP Media NY"):');
    if (!companyName) {
      console.error('❌ Company name required');
      return;
    }

    const parentCompanyId = prompt('📝 Parent company ID (optional):') || '';
    const website = prompt('📝 Company website (optional):') || '';

    console.log(`📋 Company: ${companyName}`);
    if (parentCompanyId) console.log(`📋 Parent ID: ${parentCompanyId}`);
    if (website) console.log(`📋 Website: ${website}\n`);

    // Auto-scroll
    const shouldScroll = confirm('🔄 Auto-scroll to load all contacts?\n\n✅ OK = Scroll\n❌ Cancel = Skip');

    let totalContacts = 0;
    if (shouldScroll) {
      totalContacts = await autoScroll();
    }

    // Extract
    const contacts = extractAllContacts();

    if (contacts.length === 0) {
      console.error('❌ No contacts extracted\n');
      return;
    }

    // Preview
    console.log('👀 Sample contacts:');
    console.table(contacts.slice(0, 3));
    console.log('');

    // Check data quality
    const withEmails = contacts.filter(c => c.email).length;
    const withTitles = contacts.filter(c => c.title).length;
    const withNames = contacts.filter(c => c.firstName).length;

    console.log('📊 DATA QUALITY:');
    console.log(`   ✅ ${withNames}/${contacts.length} have names (${Math.round(withNames/contacts.length*100)}%)`);
    console.log(`   ✅ ${withTitles}/${contacts.length} have titles (${Math.round(withTitles/contacts.length*100)}%)`);
    console.log(`   ✅ ${withEmails}/${contacts.length} have emails (${Math.round(withEmails/contacts.length*100)}%)`);
    console.log('');

    if (withEmails === 0) {
      console.warn('⚠️  WARNING: No emails found!');
      console.log('   Emails may not be visible on this page.');
      console.log('   You may need to click on contacts to see email addresses.\n');
    }

    // Generate CSV
    const csvContent = generateCSV(contacts, companyName, parentCompanyId, website);

    // Download
    const filename = `${companyName.replace(/[^a-z0-9]/gi, '_')}_contacts_${Date.now()}.csv`;
    downloadCSV(csvContent, filename);

    // Summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log('═'.repeat(70));
    console.log('✅ EXTRACTION COMPLETE!');
    console.log('═'.repeat(70));
    console.log(`📊 Total contacts: ${contacts.length}`);
    console.log(`📁 Filename: ${filename}`);
    console.log(`⏱️  Time: ${duration}s`);
    console.log('═'.repeat(70) + '\n');

    return { contacts, csvContent, filename };
  }

  main().catch(error => {
    console.error('\n❌ ERROR:', error);
  });

})();
