const fs = require('fs');

// Read the cleaned JSON
const jsonData = fs.readFileSync('/tmp/wpp-toronto-cleaned.json', 'utf8');
const contacts = JSON.parse(jsonData);

// CSV header
const header = 'firstName,lastName,title,email,linkedinUrl,location,companyName';

// Convert to CSV rows
const rows = contacts.map(c => {
  const fields = [
    c.firstName || '',
    c.lastName || '',
    (c.title || '').replace(/,/g, ';').replace(/"/g, '""'), // Escape commas and quotes
    c.email || '',
    c.linkedinUrl || '',
    c.location || '',
    c.companyName || ''
  ];

  // Wrap each field in quotes
  return fields.map(field => `"${field}"`).join(',');
});

// Combine header and rows
const csv = [header, ...rows].join('\n');

// Write to file
fs.writeFileSync('/tmp/wpp-toronto.csv', csv);

console.log('✅ CSV file created: /tmp/wpp-toronto.csv');
console.log(`📊 Total contacts: ${contacts.length}`);
console.log('\nFirst 3 rows:');
console.log(header);
rows.slice(0, 3).forEach(row => console.log(row));
