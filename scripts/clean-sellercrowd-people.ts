import fs from 'fs';
import path from 'path';

/**
 * Clean SellerCrowd People Data
 *
 * The v7 scraper extracted data but it's concatenated in the name field.
 * This script parses the concatenated text to extract clean fields.
 *
 * USAGE:
 * npx tsx scripts/clean-sellercrowd-people.ts /Users/csw/Downloads/sellercrowd-people-1762475167205.json
 */

interface RawPerson {
  name: string;
  title: string | null;
  company: string | null;
  advertiser: string | null;
  handles: string[];
  emails: string[];
  linkedinUrl: string | null;
  lastActivity: string | null;
}

interface CleanPerson {
  name: string;
  title: string | null;
  company: string | null;
  location: string | null;
  advertiser: string | null;
  handles: string[];
  emails: string[];
  linkedinUrl: string | null;
  lastActivity: string | null;
}

function cleanPerson(raw: RawPerson): CleanPerson | null {
  // The concatenated text is in the 'name' field
  const concatenatedText = raw.name;

  // Initialize clean data
  const clean: CleanPerson = {
    name: '',
    title: null,
    company: null,
    location: null,
    advertiser: null,
    handles: [],
    emails: [],
    linkedinUrl: raw.linkedinUrl,
    lastActivity: null
  };

  // Pattern: [Name][Title] @ [Company] [Location][Advertiser]Handles:[Handles][Emails]Last activity: [Time]

  // Extract name - everything before @ symbol
  const atIndex = concatenatedText.indexOf('@');
  if (atIndex < 0) {
    console.log(`⚠️  Skipping - no @ found: ${concatenatedText.substring(0, 50)}`);
    return null;
  }

  const beforeAt = concatenatedText.substring(0, atIndex);

  // Name is the first capitalized word sequence
  // Pattern: Name is usually 2-3 words, followed by title
  // Look for pattern: [Name] (2-3 words) followed by capital letters (title)
  const nameMatch = beforeAt.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/);
  if (nameMatch) {
    clean.name = nameMatch[1].trim();

    // Title is everything after the name until @
    const afterName = beforeAt.substring(nameMatch[1].length).trim();
    if (afterName) {
      clean.title = afterName;
    }
  } else {
    // Fallback: take first 2-3 words as name
    const words = beforeAt.trim().split(/\s+/);
    if (words.length >= 2) {
      clean.name = words.slice(0, 2).join(' ');
      clean.title = words.slice(2).join(' ');
    } else {
      clean.name = beforeAt.trim();
    }
  }

  // Extract company and location - after @ until Handles: or email pattern
  const afterAt = concatenatedText.substring(atIndex + 1);
  const companyMatch = afterAt.match(/^([^@]+?)(?:Handles:|\w+@)/i);
  if (companyMatch) {
    const companyText = companyMatch[1].trim();

    // Try to split company and location
    // Common patterns: "Company Location" or "Company"
    // Location is often: NYC, Chicago, LA, etc or "New York", "San Francisco"
    const locationPattern = /\s+(NYC|NY|LA|Chicago|Detroit|Miami|Denver|Dallas|London|Burbank|Orange|Atlanta)\s*$/i;
    const locationMatch = companyText.match(locationPattern);

    if (locationMatch) {
      clean.location = locationMatch[1];
      clean.company = companyText.substring(0, locationMatch.index).trim();
    } else {
      // Try to find location before advertiser (capital word at end)
      const parts = companyText.split(/(?=[A-Z][a-z]+$)/);
      if (parts.length > 1) {
        clean.company = parts[0].trim();
        // Last part might be advertiser, check if it's reasonable
        const lastPart = parts[parts.length - 1].trim();
        if (lastPart.length > 2 && lastPart.length < 30) {
          clean.advertiser = lastPart;
        }
      } else {
        clean.company = companyText;
      }
    }
  }

  // Extract handles - between "Handles:" and email or "Last activity"
  const handlesMatch = concatenatedText.match(/Handles:\s*([^]+?)(?:\w+@|Last activity)/i);
  if (handlesMatch) {
    const handlesText = handlesMatch[1].trim();

    // Handles are concatenated like: "ABC Entertainmentjenny."
    // Split by capital letters followed by lowercase
    const handlesList = handlesText.split(/(?=[A-Z][a-z])/)
      .map(h => h.trim())
      .filter(h => h.length > 2 && h.length < 50 && !h.includes('@'));

    clean.handles = handlesList.slice(0, 10); // Max 10 handles
  }

  // Extract emails - find all email patterns
  const emailRegex = /[\w\.-]+@[\w\.-]+\.\w+/g;
  const emails = concatenatedText.match(emailRegex);
  if (emails) {
    clean.emails = [...new Set(emails)]
      .filter(e =>
        e.length < 60 &&
        !e.toLowerCase().includes('last') &&
        !e.toLowerCase().includes('handles')
      )
      .slice(0, 5); // Max 5 emails
  }

  // Extract last activity - find "Last activity: X hrs/days"
  const activityMatch = concatenatedText.match(/Last activity:\s*(\d+\s+\w+)/i);
  if (activityMatch) {
    clean.lastActivity = activityMatch[1];
  }

  return clean;
}

async function main() {
  const inputFile = process.argv[2];

  if (!inputFile) {
    console.error('❌ Please provide input file path');
    console.error('Usage: npx tsx scripts/clean-sellercrowd-people.ts <input-file>');
    process.exit(1);
  }

  if (!fs.existsSync(inputFile)) {
    console.error(`❌ File not found: ${inputFile}`);
    process.exit(1);
  }

  console.log('🧹 Cleaning SellerCrowd People Data\n');
  console.log(`📂 Input: ${inputFile}`);

  // Read raw data
  const rawData: RawPerson[] = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
  console.log(`📊 Found ${rawData.length} raw records\n`);

  // Clean each person
  const cleanData: CleanPerson[] = [];
  let skipped = 0;

  for (let i = 0; i < rawData.length; i++) {
    const raw = rawData[i];
    const clean = cleanPerson(raw);

    if (clean) {
      cleanData.push(clean);

      if ((i + 1) % 100 === 0) {
        console.log(`✅ Cleaned ${i + 1}/${rawData.length} records`);
      }
    } else {
      skipped++;
    }
  }

  console.log(`\n✅ Cleaned ${cleanData.length} records`);
  console.log(`⚠️  Skipped ${skipped} records\n`);

  // Write clean data
  const outputFile = inputFile.replace('.json', '-cleaned.json');
  fs.writeFileSync(outputFile, JSON.stringify(cleanData, null, 2));
  console.log(`💾 Saved to: ${outputFile}\n`);

  // Show sample
  console.log('📋 Sample cleaned record:');
  console.log(JSON.stringify(cleanData[0], null, 2));
  console.log('');

  // Stats
  console.log('📊 Statistics:');
  console.log(`   Total: ${cleanData.length}`);
  console.log(`   With titles: ${cleanData.filter(p => p.title).length}`);
  console.log(`   With companies: ${cleanData.filter(p => p.company).length}`);
  console.log(`   With emails: ${cleanData.filter(p => p.emails.length > 0).length}`);
  console.log(`   With LinkedIn: ${cleanData.filter(p => p.linkedinUrl).length}`);
}

main().catch(console.error);
