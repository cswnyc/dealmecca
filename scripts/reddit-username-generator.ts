#!/usr/bin/env npx tsx
/**
 * Reddit-Style Username Generator for Ad Tech Forum
 * Generates authentic-looking Reddit usernames for advertising professionals
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Reddit-style username components
const AD_TECH_PREFIXES = [
  'DataDriven', 'ProgrammaticPro', 'CTVExpert', 'MediaBuyer', 'AdTechGuru',
  'DSPMaster', 'SSPSpecialist', 'ViewabilityPro', 'BrandSafety', 'Analytics',
  'Attribution', 'Audience', 'Campaign', 'Creative', 'Demand',
  'Exchange', 'Frequency', 'Geo', 'Header', 'Identity',
  'Journey', 'Keyword', 'Lookalike', 'Media', 'Native',
  'Omnichannel', 'Performance', 'Quality', 'Retargeting', 'Segment',
  'Targeting', 'Unified', 'Video', 'Waterfall', 'Yield'
];

const TECH_SUFFIXES = [
  'Ninja', 'Pro', 'Expert', 'Master', 'Guru', 'Ace', 'Elite', 'Prime',
  'Leader', 'Chief', 'Boss', 'King', 'Queen', 'Star', 'Hero',
  'Legend', 'Wizard', 'Sage', 'Oracle', 'Titan', 'Giant'
];

const INDUSTRY_TERMS = [
  'CTV', 'OTT', 'RTB', 'DMP', 'DSP', 'SSP', 'CDP', 'DCO', 'DTC',
  'PMPs', 'PII', 'ROAS', 'CPM', 'CPC', 'CPA', 'LTV', 'CAC', 'AOV',
  'Attribution', 'Viewability', 'Fraud', 'Privacy', 'Cookieless'
];

// Generate Reddit-style usernames with industry focus
function generateRedditUsernames(count: number): string[] {
  const usernames: string[] = [];
  const usedNames = new Set<string>();

  while (usernames.length < count) {
    let username = '';
    const style = Math.random();

    if (style < 0.4) {
      // Style 1: Prefix + Number (40%)
      const prefix = AD_TECH_PREFIXES[Math.floor(Math.random() * AD_TECH_PREFIXES.length)];
      const number = Math.floor(Math.random() * 99) + 1;
      username = `${prefix}${number}`;
    } else if (style < 0.7) {
      // Style 2: Industry Term + Suffix (30%)
      const term = INDUSTRY_TERMS[Math.floor(Math.random() * INDUSTRY_TERMS.length)];
      const suffix = TECH_SUFFIXES[Math.floor(Math.random() * TECH_SUFFIXES.length)];
      username = `${term}${suffix}`;
    } else if (style < 0.85) {
      // Style 3: Prefix + Industry Term + Number (15%)
      const prefix = AD_TECH_PREFIXES[Math.floor(Math.random() * AD_TECH_PREFIXES.length)];
      const term = INDUSTRY_TERMS[Math.floor(Math.random() * INDUSTRY_TERMS.length)];
      const number = Math.floor(Math.random() * 9) + 1;
      username = `${prefix}${term}${number}`;
    } else {
      // Style 4: Industry Term + Year (15%)
      const term = INDUSTRY_TERMS[Math.floor(Math.random() * INDUSTRY_TERMS.length)];
      const year = 2020 + Math.floor(Math.random() * 5); // 2020-2024
      username = `${term}${year}`;
    }

    // Add Reddit-style prefix occasionally (20% chance)
    if (Math.random() < 0.2) {
      username = `u/${username}`;
    }

    // Ensure uniqueness and reasonable length
    if (!usedNames.has(username.toLowerCase()) && username.length <= 20 && username.length >= 6) {
      usedNames.add(username.toLowerCase());
      usernames.push(username);
    }
  }

  return usernames;
}

async function generateUsernamesForUsers() {
  try {
    console.log('🚀 Generating Reddit-style usernames for Ad Tech forum...');

    // Get all current users
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' }
    });

    console.log(`📊 Found ${users.length} users to update`);

    // Generate unique usernames
    const redditUsernames = generateRedditUsernames(users.length + 10); // Generate extras

    // Create mapping
    const usernameMappings = users.map((user, index) => ({
      id: user.id,
      oldName: user.name,
      email: user.email,
      newName: redditUsernames[index]
    }));

    console.log('\n🎯 Generated Reddit-style usernames:');
    console.log('=====================================');
    usernameMappings.forEach(mapping => {
      console.log(`${mapping.oldName} → ${mapping.newName}`);
    });

    console.log('\n📝 Username Statistics:');
    console.log(`   • Total users: ${usernameMappings.length}`);
    console.log(`   • With u/ prefix: ${usernameMappings.filter(m => m.newName.startsWith('u/')).length}`);
    console.log(`   • Industry-focused: ${usernameMappings.filter(m => 
      INDUSTRY_TERMS.some(term => m.newName.toLowerCase().includes(term.toLowerCase()))
    ).length}`);
    console.log(`   • With numbers: ${usernameMappings.filter(m => /\d/.test(m.newName)).length}`);

    // Save mappings to a JSON file for reference
    const fs = require('fs');
    fs.writeFileSync(
      '/Users/csw/website/scripts/reddit-username-mappings.json',
      JSON.stringify(usernameMappings, null, 2)
    );

    console.log('\n✅ Reddit username mappings generated and saved to reddit-username-mappings.json');
    console.log('   Next step: Run the update script to apply these usernames to the database');

    return usernameMappings;

  } catch (error) {
    console.error('❌ Error generating Reddit usernames:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  generateUsernamesForUsers()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { generateUsernamesForUsers };