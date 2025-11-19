/**
 * Merge multiple SellerCrowd extraction JSON files
 * Removes duplicates based on advertiser name
 */

import fs from 'fs';
import path from 'path';

interface Advertiser {
  name: string;
  agencies: string[];
}

async function mergeExtractions(filePaths: string[], outputPath: string) {
  console.log('🔄 Merging SellerCrowd extraction files...\n');

  const advertisersMap = new Map<string, Advertiser>();

  // Process each file
  for (const filePath of filePaths) {
    console.log(`📁 Reading: ${path.basename(filePath)}`);

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const advertisers: Advertiser[] = JSON.parse(fileContent);

    console.log(`   Found ${advertisers.length} advertisers`);

    // Add or update advertisers
    for (const advertiser of advertisers) {
      const existing = advertisersMap.get(advertiser.name);

      if (!existing) {
        // New advertiser
        advertisersMap.set(advertiser.name, advertiser);
      } else {
        // Advertiser exists - keep the one with MORE agencies
        if (advertiser.agencies.length > existing.agencies.length) {
          advertisersMap.set(advertiser.name, advertiser);
          console.log(`   🔄 Updated ${advertiser.name}: ${existing.agencies.length} → ${advertiser.agencies.length} agencies`);
        }
      }
    }
  }

  // Convert to array and sort alphabetically
  const mergedAdvertisers = Array.from(advertisersMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  // Write merged file
  fs.writeFileSync(outputPath, JSON.stringify(mergedAdvertisers, null, 2));

  console.log('\n' + '='.repeat(80));
  console.log('📊 MERGE SUMMARY');
  console.log('='.repeat(80));
  console.log(`Files processed:        ${filePaths.length}`);
  console.log(`Total advertisers:      ${mergedAdvertisers.length}`);
  console.log(`First advertiser:       ${mergedAdvertisers[0].name}`);
  console.log(`Last advertiser:        ${mergedAdvertisers[mergedAdvertisers.length - 1].name}`);
  console.log(`Output file:            ${outputPath}`);
  console.log('='.repeat(80));
}

// Get file paths from command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('Usage: npx tsx merge-sellercrowd-extractions.ts <file1> <file2> [file3...] --output <merged.json>');
  console.error('\nExample:');
  console.error('  npx tsx merge-sellercrowd-extractions.ts \\');
  console.error('    file1.json file2.json file3.json \\');
  console.error('    --output merged-sellercrowd.json');
  process.exit(1);
}

// Find output flag
const outputIndex = args.indexOf('--output');
if (outputIndex === -1) {
  console.error('Error: --output flag required');
  process.exit(1);
}

const outputPath = args[outputIndex + 1];
const filePaths = args.slice(0, outputIndex);

mergeExtractions(filePaths, outputPath);
