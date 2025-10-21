/**
 * Generate realistic bulk CSV data for companies and contacts
 *
 * Usage: npx tsx scripts/generate-bulk-data.ts
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

// Helper to generate random item from array
const random = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Helper to generate random number in range
const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// Agency name prefixes/suffixes
const agencyPrefixes = ['Blue', 'Red', 'Green', 'Yellow', 'Purple', 'Orange', 'Silver', 'Gold', 'Digital', 'Creative', 'Media', 'Strategic', 'Global', 'United', 'Prime', 'Apex', 'Summit', 'Peak', 'Bright', 'Bold', 'Smart', 'Next', 'Future', 'Modern', 'Dynamic', 'Elite', 'Premier', 'Pro', 'Max', 'Core', 'True', 'Pure', 'First', 'Alpha', 'Omega', 'Delta', 'Sigma'];
const agencySuffixes = ['Agency', 'Media', 'Partners', 'Group', 'Communications', 'Marketing', 'Interactive', 'Digital', 'Creative', 'Studios', 'Labs', 'Solutions', 'Strategies', 'Collective', 'Network', 'Alliance', 'Associates', 'Ventures'];
const agencyTypes = ['Media', 'Creative', 'Digital', 'Social', 'Strategic', 'Performance', 'Brand', 'Influencer', 'Content', 'Search', 'Programmatic'];

// Advertiser industries and name patterns
const advertiserIndustries = [
  'Automotive', 'CPG_FOOD_BEVERAGE', 'CPG_PERSONAL_CARE', 'CPG_HOUSEHOLD',
  'FINANCIAL_SERVICES', 'HEALTHCARE_PHARMA', 'RETAIL_ECOMMERCE', 'TECHNOLOGY',
  'ENTERTAINMENT_MEDIA', 'TRAVEL_HOSPITALITY', 'TELECOM', 'FASHION_BEAUTY',
  'SPORTS_FITNESS', 'EDUCATION', 'REAL_ESTATE', 'GAMING', 'INSURANCE'
];

const advertiserPrefixes = ['American', 'Global', 'National', 'United', 'Premier', 'First', 'Pacific', 'Atlantic', 'Midwest', 'Western', 'Eastern', 'Northern', 'Southern', 'Central', 'Metro', 'Urban'];
const advertiserTypes = ['Foods', 'Motors', 'Bank', 'Insurance', 'Healthcare', 'Retail', 'Technologies', 'Media', 'Travel', 'Wireless', 'Fashion', 'Fitness', 'Gaming', 'Education'];

// US Cities and States
const cities = [
  { city: 'New York', state: 'NY', region: 'Northeast' },
  { city: 'Los Angeles', state: 'CA', region: 'West' },
  { city: 'Chicago', state: 'IL', region: 'Midwest' },
  { city: 'Dallas', state: 'TX', region: 'South' },
  { city: 'San Francisco', state: 'CA', region: 'West' },
  { city: 'Miami', state: 'FL', region: 'South' },
  { city: 'Atlanta', state: 'GA', region: 'South' },
  { city: 'Boston', state: 'MA', region: 'Northeast' },
  { city: 'Seattle', state: 'WA', region: 'West' },
  { city: 'Denver', state: 'CO', region: 'West' },
  { city: 'Minneapolis', state: 'MN', region: 'Midwest' },
  { city: 'Phoenix', state: 'AZ', region: 'West' },
  { city: 'Philadelphia', state: 'PA', region: 'Northeast' },
  { city: 'Detroit', state: 'MI', region: 'Midwest' },
  { city: 'Portland', state: 'OR', region: 'West' },
  { city: 'Austin', state: 'TX', region: 'South' },
  { city: 'Nashville', state: 'TN', region: 'South' },
  { city: 'Charlotte', state: 'NC', region: 'South' },
  { city: 'San Diego', state: 'CA', region: 'West' },
  { city: 'Las Vegas', state: 'NV', region: 'West' }
];

// First and Last Names
const firstNames = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'William', 'Barbara', 'David', 'Elizabeth', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa',
  'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
  'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle',
  'Kenneth', 'Carol', 'Kevin', 'Amanda', 'Brian', 'Dorothy', 'George', 'Melissa',
  'Edward', 'Deborah', 'Ronald', 'Stephanie', 'Timothy', 'Rebecca', 'Jason', 'Sharon',
  'Jeffrey', 'Laura', 'Ryan', 'Cynthia', 'Jacob', 'Kathleen', 'Gary', 'Amy',
  'Nicholas', 'Angela', 'Eric', 'Shirley', 'Jonathan', 'Anna', 'Stephen', 'Brenda'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
  'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
  'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
  'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
  'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker',
  'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris', 'Morales', 'Murphy'
];

// Job Titles by Department
const titlesByDepartment: Record<string, string[]> = {
  MEDIA_PLANNING: ['Media Planner', 'Senior Media Planner', 'Media Planning Director', 'VP of Media Planning', 'Associate Media Planner'],
  MEDIA_BUYING: ['Media Buyer', 'Senior Media Buyer', 'Media Buying Director', 'VP of Media Buying', 'Associate Media Buyer'],
  DIGITAL_MARKETING: ['Digital Marketing Manager', 'Digital Marketing Director', 'VP of Digital', 'Digital Strategist', 'Digital Marketing Specialist'],
  PROGRAMMATIC: ['Programmatic Manager', 'Programmatic Director', 'VP of Programmatic', 'Programmatic Specialist', 'Programmatic Trader'],
  SOCIAL_MEDIA: ['Social Media Manager', 'Social Media Director', 'VP of Social', 'Social Media Strategist', 'Social Media Specialist'],
  SEARCH_MARKETING: ['Search Marketing Manager', 'SEM Director', 'VP of Search', 'SEM Specialist', 'Search Strategist'],
  STRATEGY_PLANNING: ['Strategist', 'Senior Strategist', 'Strategy Director', 'VP of Strategy', 'Strategic Planner'],
  ANALYTICS_INSIGHTS: ['Analytics Manager', 'Analytics Director', 'VP of Analytics', 'Data Analyst', 'Senior Analyst'],
  CREATIVE_SERVICES: ['Creative Director', 'Senior Creative Director', 'VP of Creative', 'Art Director', 'Copywriter'],
  ACCOUNT_MANAGEMENT: ['Account Manager', 'Senior Account Manager', 'Account Director', 'VP of Accounts', 'Account Executive'],
  BUSINESS_DEVELOPMENT: ['Business Development Manager', 'BD Director', 'VP of Business Development', 'BD Executive'],
  LEADERSHIP: ['CEO', 'President', 'COO', 'CMO', 'Managing Director', 'Partner', 'Founder']
};

const departments = Object.keys(titlesByDepartment);
const seniorities = ['EXECUTIVE', 'VP', 'DIRECTOR', 'MANAGER', 'COORDINATOR', 'ASSOCIATE'];

/**
 * Generate company name
 */
function generateCompanyName(type: 'AGENCY' | 'ADVERTISER' | 'VENDOR'): string {
  if (type === 'AGENCY') {
    return `${random(agencyPrefixes)} ${random(agencyTypes)} ${random(agencySuffixes)}`;
  } else if (type === 'ADVERTISER') {
    return `${random(advertiserPrefixes)} ${random(advertiserTypes)}`;
  } else {
    return `${random(agencyPrefixes)} ${random(['Technologies', 'Solutions', 'Systems', 'Software', 'Platforms'])}`;
  }
}

/**
 * Generate companies CSV data
 */
function generateCompanies(count: number): string {
  const headers = 'name,website,type,agencyType,industry,city,state,country,description,logoUrl,linkedinUrl';
  const rows: string[] = [headers];

  // 600 agencies, 300 advertisers, 100 vendors
  const agencies = Math.floor(count * 0.6);
  const advertisers = Math.floor(count * 0.3);
  const vendors = count - agencies - advertisers;

  // Generate agencies
  for (let i = 0; i < agencies; i++) {
    const name = generateCompanyName('AGENCY');
    const location = random(cities);
    const agencyType = random([
      'FULL_SERVICE', 'MEDIA_SPECIALIST', 'CREATIVE_SPECIALIST', 'DIGITAL_SPECIALIST',
      'PROGRAMMATIC_SPECIALIST', 'SOCIAL_MEDIA_SPECIALIST', 'SEARCH_SPECIALIST',
      'PERFORMANCE_MARKETING', 'BRAND_STRATEGY'
    ]);

    rows.push([
      `"${name}"`,
      `https://${name.toLowerCase().replace(/\s+/g, '')}.com`,
      'AGENCY',
      agencyType,
      '', // No industry for agencies
      location.city,
      location.state,
      'United States',
      `"${name} is a ${agencyType.replace(/_/g, ' ').toLowerCase()} based in ${location.city}, ${location.state}."`,
      '', // Logo will be generated by backend
      `https://linkedin.com/company/${name.toLowerCase().replace(/\s+/g, '-')}`
    ].join(','));
  }

  // Generate advertisers
  for (let i = 0; i < advertisers; i++) {
    const name = generateCompanyName('ADVERTISER');
    const location = random(cities);
    const industry = random(advertiserIndustries);
    const advertisingModel = random(['AGENCY_MANAGED', 'IN_HOUSE', 'HYBRID']);

    rows.push([
      `"${name}"`,
      `https://${name.toLowerCase().replace(/\s+/g, '')}.com`,
      'ADVERTISER',
      '', // No agency type for advertisers
      industry,
      location.city,
      location.state,
      'United States',
      `"${name} is a leading ${industry.replace(/_/g, ' ').toLowerCase()} company headquartered in ${location.city}, ${location.state}."`,
      '',
      `https://linkedin.com/company/${name.toLowerCase().replace(/\s+/g, '-')}`
    ].join(','));
  }

  // Generate vendors (AdTech, Publishers, etc.)
  for (let i = 0; i < vendors; i++) {
    const name = generateCompanyName('VENDOR');
    const location = random(cities);
    const vendorType = random(['ADTECH_PLATFORM', 'DSP_SSP', 'PUBLISHER', 'MARTECH_VENDOR']);

    rows.push([
      `"${name}"`,
      `https://${name.toLowerCase().replace(/\s+/g, '')}.com`,
      vendorType,
      '',
      'TECHNOLOGY',
      location.city,
      location.state,
      'United States',
      `"${name} provides technology solutions for the advertising industry."`,
      '',
      `https://linkedin.com/company/${name.toLowerCase().replace(/\s+/g, '-')}`
    ].join(','));
  }

  return rows.join('\n');
}

/**
 * Generate contacts CSV data
 */
function generateContacts(companyNames: string[], contactsPerCompany: number = 3): string {
  const headers = 'firstName,lastName,email,phone,title,companyName,department,seniority,linkedinUrl';
  const rows: string[] = [headers];

  for (const companyName of companyNames) {
    const numContacts = randomInt(2, contactsPerCompany + 1); // 2-4 contacts per company

    for (let i = 0; i < numContacts; i++) {
      const firstName = random(firstNames);
      const lastName = random(lastNames);
      const department = random(departments);
      const title = random(titlesByDepartment[department]);
      const seniority = random(seniorities);

      // Generate email
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${companyName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}.com`;

      // Generate phone (US format)
      const phone = `+1-${randomInt(200, 999)}-${randomInt(200, 999)}-${randomInt(1000, 9999)}`;

      // LinkedIn URL
      const linkedinUrl = `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}-${randomInt(1000, 9999)}`;

      rows.push([
        firstName,
        lastName,
        email,
        phone,
        `"${title}"`,
        `"${companyName}"`,
        department,
        seniority,
        linkedinUrl
      ].join(','));
    }
  }

  return rows.join('\n');
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Generating bulk data for import...\n');

  // Generate companies
  console.log('📊 Generating 1000 companies...');
  const companiesCSV = generateCompanies(1000);
  const companiesPath = join(process.cwd(), 'bulk-data-companies.csv');
  writeFileSync(companiesPath, companiesCSV, 'utf-8');
  console.log(`✅ Companies CSV saved: ${companiesPath}`);
  console.log(`   - ${companiesCSV.split('\n').length - 1} companies generated\n`);

  // Extract company names for contact generation
  const companyLines = companiesCSV.split('\n').slice(1); // Skip header
  const companyNames = companyLines.map(line => {
    const match = line.match(/^"([^"]+)"/);
    return match ? match[1] : '';
  }).filter(Boolean);

  // Generate contacts
  console.log('👥 Generating contacts (avg 3 per company)...');
  const contactsCSV = generateContacts(companyNames, 3);
  const contactsPath = join(process.cwd(), 'bulk-data-contacts.csv');
  writeFileSync(contactsPath, contactsCSV, 'utf-8');
  console.log(`✅ Contacts CSV saved: ${contactsPath}`);
  console.log(`   - ${contactsCSV.split('\n').length - 1} contacts generated\n`);

  console.log('✅ Bulk data generation complete!');
  console.log('\n📋 Next steps:');
  console.log('   1. Navigate to http://localhost:3000/admin/bulk-import');
  console.log('   2. Upload bulk-data-companies.csv first');
  console.log('   3. Upload bulk-data-contacts.csv second');
  console.log('   4. Monitor import progress and verify results');
}

main().catch(console.error);
