// SellerCrowd Contact Scraper v2 - Optimized for visible structure
// Based on screenshot analysis showing contact cards with:
// - Name + LinkedIn icon
// - Title @ Company format
// - Multiple email addresses with tags
// - Last activity timestamp

(function() {
  console.log('🚀 SellerCrowd Contact Scraper v2 - Starting...\n');

  // ==================== CONFIGURATION ====================

  const CONFIG = {
    scrollDelay: 1500,        // Time to wait between scrolls (ms)
    maxScrollAttempts: 150,   // Safety limit for infinite scroll
    batchLogInterval: 25,     // Log progress every N contacts
  };

  // ==================== HELPER FUNCTIONS ====================

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function cleanText(text) {
    return text ? text.trim().replace(/\s+/g, ' ') : '';
  }

  function parseFullName(fullName) {
    const parts = cleanText(fullName).split(' ');
    return {
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ') || ''
    };
  }

  function parseTitleCompany(text) {
    const cleaned = cleanText(text);
    if (cleaned.includes(' @ ')) {
      const [title, company] = cleaned.split(' @ ');
      return { title: title.trim(), company: company.trim() };
    }
    return { title: cleaned, company: '' };
  }

  // ==================== STEP 1: AUTO-SCROLL ====================

  async function autoScroll() {
    console.log('📜 Auto-scrolling to load all contacts...');
    console.log('   (This may take 1-2 minutes for large lists)\n');

    let previousHeight = 0;
    let currentHeight = document.documentElement.scrollHeight;
    let unchangedCount = 0;
    let scrollCount = 0;

    while (scrollCount < CONFIG.maxScrollAttempts) {
      // Scroll to bottom
      window.scrollTo(0, currentHeight);
      scrollCount++;

      // Wait for content to load
      await sleep(CONFIG.scrollDelay);

      // Check if height changed
      previousHeight = currentHeight;
      currentHeight = document.documentElement.scrollHeight;

      if (currentHeight === previousHeight) {
        unchangedCount++;
        // If height hasn't changed 3 times in a row, we've reached the end
        if (unchangedCount >= 3) {
          console.log(`✅ Reached end of list after ${scrollCount} scrolls\n`);
          break;
        }
      } else {
        unchangedCount = 0;
        if (scrollCount % 5 === 0) {
          console.log(`   Scrolled ${scrollCount} times...`);
        }
      }
    }

    // Scroll back to top
    window.scrollTo(0, 0);
    await sleep(500);
  }

  // ==================== STEP 2: FIND CONTACT ELEMENTS ====================

  function findContactElements() {
    console.log('🔍 Searching for contact elements...\n');

    // Try multiple selector strategies
    const strategies = [
      // Strategy 1: Common React/modern patterns
      () => document.querySelectorAll('[class*="ContactCard"]'),
      () => document.querySelectorAll('[class*="contact-card"]'),
      () => document.querySelectorAll('[class*="Contact-card"]'),
      () => document.querySelectorAll('[data-testid*="contact"]'),

      // Strategy 2: List item patterns
      () => document.querySelectorAll('li[class*="contact"]'),
      () => document.querySelectorAll('div[role="listitem"]'),
      () => document.querySelectorAll('article[class*="card"]'),

      // Strategy 3: Structural patterns
      () => {
        // Find all elements containing LinkedIn links and emails
        const allDivs = document.querySelectorAll('div');
        const contactDivs = [];
        allDivs.forEach(div => {
          const hasLinkedIn = div.querySelector('a[href*="linkedin"]');
          const hasEmail = div.querySelector('a[href^="mailto:"]');
          if (hasLinkedIn && hasEmail) {
            contactDivs.push(div);
          }
        });
        return contactDivs;
      },

      // Strategy 4: Look for cards with specific structure
      () => {
        const containers = document.querySelectorAll('div[class*="card"], div[class*="Card"]');
        return Array.from(containers).filter(el => {
          const text = el.textContent;
          return text.includes('@') && text.includes('Last activity');
        });
      }
    ];

    // Try each strategy
    for (let i = 0; i < strategies.length; i++) {
      const elements = strategies[i]();
      if (elements && elements.length > 0) {
        console.log(`✅ Found ${elements.length} contacts using strategy ${i + 1}\n`);
        return elements;
      }
    }

    console.error('❌ Could not find contact elements\n');
    console.log('💡 MANUAL INSPECTION NEEDED:');
    console.log('   1. Right-click on a contact card');
    console.log('   2. Select "Inspect"');
    console.log('   3. Look for unique class names or data attributes');
    console.log('   4. Run: document.querySelectorAll("YOUR-SELECTOR-HERE")\n');

    return [];
  }

  // ==================== STEP 3: EXTRACT DATA ====================

  function extractContactData(element) {
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
      // Extract LinkedIn URL and name
      const linkedInLink = element.querySelector('a[href*="linkedin.com"]');
      if (linkedInLink) {
        contact.linkedinUrl = linkedInLink.href;

        // Name is often in or near the LinkedIn link
        const nameText = linkedInLink.textContent ||
                        linkedInLink.closest('div')?.textContent ||
                        linkedInLink.parentElement?.textContent;

        if (nameText) {
          // Extract just the name (first line usually)
          const lines = nameText.split('\n').map(l => l.trim()).filter(Boolean);
          const nameLine = lines[0];

          // Parse first/last name
          const { firstName, lastName } = parseFullName(nameLine);
          contact.firstName = firstName;
          contact.lastName = lastName;
        }
      }

      // Extract title and company (format: "Title @ Company")
      const textContent = element.textContent;
      const lines = textContent.split('\n').map(l => l.trim()).filter(Boolean);

      // Look for line with " @ " pattern
      const titleLine = lines.find(line => line.includes(' @ '));
      if (titleLine) {
        const { title, company } = parseTitleCompany(titleLine);
        contact.title = title;
        contact.company = company;
      }

      // Extract email addresses (may have multiple)
      const emailLinks = element.querySelectorAll('a[href^="mailto:"]');
      if (emailLinks.length > 0) {
        // Prefer corporate email over groupm email if both present
        const emails = Array.from(emailLinks).map(a =>
          a.href.replace('mailto:', '').trim()
        );

        // Sort to prefer @wpp.com over @groupm.com, or take first
        emails.sort((a, b) => {
          if (a.includes('@wpp.com')) return -1;
          if (b.includes('@wpp.com')) return 1;
          if (a.includes('@groupm.com')) return 1;
          return 0;
        });

        contact.email = emails[0];
      }

      // Extract phone if present (format varies)
      const phonePattern = /(\+?\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}/;
      const phoneMatch = textContent.match(phonePattern);
      if (phoneMatch) {
        contact.phone = phoneMatch[0];
      }

    } catch (error) {
      console.error('Error extracting contact:', error);
    }

    return contact;
  }

  function extractAllContacts(elements) {
    console.log('📊 Extracting data from contacts...\n');

    const contacts = [];
    let skipped = 0;

    elements.forEach((element, index) => {
      const contact = extractContactData(element);

      // Only include if we have at least a name or email
      if (contact.firstName || contact.email) {
        contacts.push(contact);

        // Log progress
        if ((contacts.length) % CONFIG.batchLogInterval === 0) {
          console.log(`   ✓ Processed ${contacts.length} contacts...`);
        }
      } else {
        skipped++;
      }
    });

    if (skipped > 0) {
      console.log(`   ⚠️  Skipped ${skipped} incomplete records\n`);
    }

    console.log(`✅ Extracted ${contacts.length} valid contacts\n`);
    return contacts;
  }

  // ==================== STEP 4: GENERATE CSV ====================

  function generateCSV(contacts, companyName, parentCompanyId, website) {
    console.log('📄 Generating CSV...\n');

    // CSV headers matching bulk import template
    const headers = [
      'companyName',
      'firstName',
      'lastName',
      'title',
      'email',
      'phone',
      'linkedinUrl',
      'department',
      'industry',
      'employeeCount',
      'revenue',
      'headquarters',
      'description',
      'website',
      'domain',
      'companyType',
      'parentCompanyId'
    ];

    // Build rows
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
        website || '', // website
        '', // domain
        '', // companyType
        parentCompanyId
      ]);
    });

    // Convert to CSV string with proper escaping
    const csvContent = rows.map(row =>
      row.map(cell => {
        const value = String(cell || '');
        // Escape if contains comma, quote, or newline
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return '"' + value.replace(/"/g, '""') + '"';
        }
        return value;
      }).join(',')
    ).join('\n');

    return csvContent;
  }

  // ==================== STEP 5: DOWNLOAD CSV ====================

  function downloadCSV(csvContent, filename) {
    console.log('💾 Initiating download...\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  // ==================== MAIN EXECUTION ====================

  async function main() {
    const startTime = Date.now();

    console.clear();
    console.log('\n' + '═'.repeat(70));
    console.log('  SELLERCROWD CONTACT SCRAPER v2');
    console.log('═'.repeat(70) + '\n');

    // Get company info from user
    const companyName = prompt('📝 Enter company name (e.g., "WPP Media NY"):');
    if (!companyName) {
      console.error('❌ Company name is required');
      return;
    }

    const parentCompanyId = prompt('📝 Enter parent company ID (optional):\n(Press OK to skip)') || '';
    const website = prompt('📝 Enter company website (optional):\n(Press OK to skip)') || '';

    console.log(`📋 Company: ${companyName}`);
    if (parentCompanyId) console.log(`📋 Parent ID: ${parentCompanyId}`);
    if (website) console.log(`📋 Website: ${website}`);
    console.log('');

    // Step 1: Auto-scroll
    const shouldScroll = confirm('🔄 Auto-scroll to load all contacts?\n\n✅ Click OK to scroll\n❌ Click Cancel if already loaded');
    if (shouldScroll) {
      await autoScroll();
    }

    // Step 2: Find contact elements
    const elements = findContactElements();
    if (elements.length === 0) {
      console.error('❌ Extraction failed - no contacts found\n');
      return;
    }

    // Step 3: Extract data
    const contacts = extractAllContacts(elements);
    if (contacts.length === 0) {
      console.error('❌ No valid contacts extracted\n');
      return;
    }

    // Show preview
    console.log('👀 Sample of first contact:');
    console.table([contacts[0]]);
    console.log('');

    // Step 4: Generate CSV
    const csvContent = generateCSV(contacts, companyName, parentCompanyId, website);

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
    console.log(`📁 Filename: ${filename}`);
    console.log(`⏱️  Time taken: ${duration} seconds`);
    console.log('═'.repeat(70) + '\n');

    console.log('📋 Next Steps:');
    console.log('   1. Check your Downloads folder for the CSV file');
    console.log('   2. Open and review the data');
    console.log('   3. Upload to bulk import in admin panel');
    console.log('   4. Verify import success\n');

    // Return data for further inspection if needed
    return { contacts, csvContent, filename };
  }

  // ==================== RUN ====================

  main().catch(error => {
    console.error('\n❌ SCRIPT ERROR:');
    console.error(error);
    console.log('\n💡 Try refreshing the page and running again.\n');
  });

})();
