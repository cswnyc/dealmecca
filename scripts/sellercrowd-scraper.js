// SellerCrowd Contact Scraper
// Run this in the browser console while viewing a SellerCrowd contact list
// This will extract all visible contacts and download as CSV

(function() {
  console.log('🚀 Starting SellerCrowd contact extraction...');

  // Configuration - Update these selectors if needed
  const SELECTORS = {
    // Adjust these selectors based on SellerCrowd's HTML structure
    contactCard: '[class*="contact"]', // Generic selector - will need refinement
    name: 'h3, [class*="name"]',
    title: '[class*="title"]',
    company: '[class*="company"]',
    email: 'a[href^="mailto:"]',
    linkedin: 'a[href*="linkedin.com"]',
  };

  // Step 1: Scroll to load all contacts (infinite scroll)
  async function scrollToLoadAll() {
    console.log('📜 Scrolling to load all contacts...');
    let lastHeight = document.body.scrollHeight;
    let scrollAttempts = 0;
    const maxAttempts = 100; // Safety limit

    while (scrollAttempts < maxAttempts) {
      window.scrollTo(0, document.body.scrollHeight);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for load

      const newHeight = document.body.scrollHeight;
      if (newHeight === lastHeight) {
        console.log('✅ Reached end of list');
        break;
      }
      lastHeight = newHeight;
      scrollAttempts++;
      console.log(`   Scroll ${scrollAttempts}...`);
    }

    // Scroll back to top
    window.scrollTo(0, 0);
  }

  // Step 2: Extract contact data
  function extractContacts() {
    console.log('🔍 Extracting contact data...');
    const contacts = [];

    // OPTION 1: Try to find contact cards
    let contactElements = document.querySelectorAll(SELECTORS.contactCard);

    // OPTION 2: If no cards found, look for common patterns
    if (contactElements.length === 0) {
      console.log('⚠️ No contact cards found with default selector');
      console.log('🔧 Trying alternative selectors...');

      // Try finding all elements that might be contact containers
      const possibleContainers = [
        'div[class*="ContactCard"]',
        'div[class*="contact-card"]',
        'div[class*="ContactItem"]',
        'div[class*="contact-item"]',
        'li[class*="contact"]',
        '[data-testid*="contact"]',
        'div[role="listitem"]',
      ];

      for (const selector of possibleContainers) {
        contactElements = document.querySelectorAll(selector);
        if (contactElements.length > 0) {
          console.log(`✅ Found ${contactElements.length} contacts using: ${selector}`);
          break;
        }
      }
    }

    if (contactElements.length === 0) {
      console.error('❌ Could not find contact elements. Please inspect the page and update SELECTORS.');
      console.log('💡 Open DevTools, inspect a contact card, and note the class names/structure.');
      return null;
    }

    console.log(`📊 Found ${contactElements.length} contact elements`);

    // Extract data from each contact
    contactElements.forEach((element, index) => {
      try {
        // Extract name
        let name = '';
        const nameEl = element.querySelector(SELECTORS.name);
        if (nameEl) {
          name = nameEl.textContent.trim();
        }

        // Parse name into first/last
        const nameParts = name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        // Extract title and company
        let title = '';
        let company = '';

        const titleEl = element.querySelector(SELECTORS.title);
        if (titleEl) {
          const titleText = titleEl.textContent.trim();
          // Format: "Title @ Company" or just "Title"
          if (titleText.includes('@')) {
            const parts = titleText.split('@');
            title = parts[0].trim();
            company = parts[1].trim();
          } else {
            title = titleText;
          }
        }

        // Extract emails (may have multiple)
        const emailElements = element.querySelectorAll(SELECTORS.email);
        const emails = Array.from(emailElements).map(el => {
          const href = el.getAttribute('href');
          return href ? href.replace('mailto:', '').trim() : '';
        }).filter(Boolean);
        const email = emails[0] || ''; // Use first email

        // Extract LinkedIn URL
        let linkedinUrl = '';
        const linkedinEl = element.querySelector(SELECTORS.linkedin);
        if (linkedinEl) {
          linkedinUrl = linkedinEl.getAttribute('href') || '';
        }

        // Only add if we have at least a name
        if (firstName || lastName) {
          contacts.push({
            firstName,
            lastName,
            title,
            company,
            email,
            linkedinUrl,
            phone: '', // Not available in SellerCrowd
            department: '', // Will be filled manually or via bulk import
          });

          if ((index + 1) % 50 === 0) {
            console.log(`   Processed ${index + 1} contacts...`);
          }
        }
      } catch (error) {
        console.error(`Error processing contact ${index}:`, error);
      }
    });

    return contacts;
  }

  // Step 3: Convert to CSV
  function convertToCSV(contacts, companyName, parentCompanyId) {
    console.log('📄 Converting to CSV format...');

    // CSV Headers matching bulk import template
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

    const rows = [headers];

    contacts.forEach(contact => {
      rows.push([
        companyName, // Will be prompted
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
        '', // website
        '', // domain
        '', // companyType
        parentCompanyId // Will be prompted
      ]);
    });

    // Escape CSV values
    const csvContent = rows.map(row =>
      row.map(cell => {
        const cellStr = String(cell || '');
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return '"' + cellStr.replace(/"/g, '""') + '"';
        }
        return cellStr;
      }).join(',')
    ).join('\n');

    return csvContent;
  }

  // Step 4: Download CSV
  function downloadCSV(csvContent, filename) {
    console.log('💾 Downloading CSV...');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('✅ Download started!');
  }

  // Main execution
  async function main() {
    console.log('\n' + '='.repeat(60));
    console.log('   SELLERCROWD CONTACT SCRAPER');
    console.log('='.repeat(60) + '\n');

    // Prompt for company details
    const companyName = prompt('Enter company name (e.g., "WPP Media NY"):');
    if (!companyName) {
      console.error('❌ Company name is required');
      return;
    }

    const parentCompanyId = prompt('Enter parent company ID (optional, press OK to skip):') || '';

    // Step 1: Scroll to load all
    const shouldScroll = confirm('Scroll to load all contacts? (Click OK to scroll, Cancel to skip if already loaded)');
    if (shouldScroll) {
      await scrollToLoadAll();
    }

    // Step 2: Extract
    const contacts = extractContacts();
    if (!contacts || contacts.length === 0) {
      console.error('❌ No contacts extracted');
      console.log('\n💡 TROUBLESHOOTING:');
      console.log('1. Open DevTools (F12)');
      console.log('2. Inspect a contact card');
      console.log('3. Update the SELECTORS object at the top of this script');
      console.log('4. Run the script again');
      return;
    }

    console.log(`\n✅ Successfully extracted ${contacts.length} contacts`);
    console.log('\nSample of first contact:');
    console.log(contacts[0]);

    // Step 3: Convert to CSV
    const csvContent = convertToCSV(contacts, companyName, parentCompanyId);

    // Step 4: Download
    const filename = `${companyName.replace(/[^a-z0-9]/gi, '_')}_contacts_${Date.now()}.csv`;
    downloadCSV(csvContent, filename);

    console.log('\n' + '='.repeat(60));
    console.log('✅ EXTRACTION COMPLETE!');
    console.log(`📊 Total contacts: ${contacts.length}`);
    console.log(`📁 Filename: ${filename}`);
    console.log('='.repeat(60) + '\n');

    console.log('📋 Next steps:');
    console.log('1. Open the downloaded CSV file');
    console.log('2. Review and clean up the data if needed');
    console.log('3. Upload to bulk import in your admin panel');
  }

  // Run it!
  main().catch(error => {
    console.error('❌ Script error:', error);
  });

})();
