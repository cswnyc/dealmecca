#!/usr/bin/env npx tsx
/**
 * Custom Import Script for Independent Agencies with Advertiser Partnerships
 *
 * This script:
 * 1. Reads independent-agencies-import.csv (109 agencies)
 * 2. Reads independent-agencies-advertisers-import.csv (250+ advertisers)
 * 3. Reads independent-agencies-advertiser-mappings.csv (advertiser-to-agency relationships)
 * 4. Creates all companies in the database
 * 5. Automatically creates CompanyPartnership records linking advertisers to agencies
 *
 * Safe to run multiple times - handles duplicates gracefully
 */

import { prisma } from '@/lib/prisma';
import { createId } from '@paralleldrive/cuid2';
import * as fs from 'fs';
import * as path from 'path';
import Papa from 'papaparse';
import { getCompanyLogoUrl } from '@/lib/logo-utils';

interface AgencyRow {
  companyName: string;
  companyType: string;
  industry: string;
  website: string;
  city: string;
  state: string;
  country: string;
  parentCompanyName: string;
}

interface AdvertiserRow {
  companyName: string;
  companyType: string;
  industry: string;
  website: string;
  city: string;
  state: string;
  country: string;
  parentCompanyName: string;
}

interface MappingRow {
  advertiserName: string;
  agencyName: string;
}

// Industry mapping to match Prisma enum
const mapIndustry = (industry: string): string | undefined => {
  if (!industry) return undefined;

  const industryMap: Record<string, string> = {
    'Advertising & Marketing': 'ENTERTAINMENT_MEDIA',
    'Media Planning & Buying': 'ENTERTAINMENT_MEDIA',
    'Digital Marketing': 'ENTERTAINMENT_MEDIA',
    'Public Relations': 'ENTERTAINMENT_MEDIA',
    'Healthcare Marketing': 'HEALTHCARE_PHARMA',
    'Healthcare Communications': 'HEALTHCARE_PHARMA',
    'B2B Marketing': 'B2B_SERVICES',
    'Financial Marketing': 'FINANCIAL_SERVICES',
    'Tourism Marketing': 'TRAVEL_HOSPITALITY',
    'Out-of-Home Advertising': 'ENTERTAINMENT_MEDIA',
    'Political & Public Affairs': 'GOVERNMENT_NONPROFIT',
    'Location-Based Marketing': 'ENTERTAINMENT_MEDIA',
    'Creative Agency': 'ENTERTAINMENT_MEDIA',
    'Marketing Services': 'ENTERTAINMENT_MEDIA',
    'Digital Experience': 'TECHNOLOGY',
    'Retail Marketing': 'RETAIL_ECOMMERCE',
    'Audio Advertising': 'ENTERTAINMENT_MEDIA',
    'Podcast Advertising': 'ENTERTAINMENT_MEDIA',
    'Entertainment Marketing': 'ENTERTAINMENT_MEDIA',
    'Chemicals & Materials': 'ENERGY',
    'Food & Beverage': 'CPG_FOOD_BEVERAGE',
    'Consumer Products': 'CPG_FOOD_BEVERAGE',
    'Health & Wellness': 'HEALTHCARE_PHARMA',
    'Retail & Footwear': 'RETAIL_ECOMMERCE',
    'Government & Public Sector': 'GOVERNMENT_NONPROFIT',
    'Sports & Entertainment': 'ENTERTAINMENT_MEDIA',
    'Financial Services': 'FINANCIAL_SERVICES',
    'Retail & Home Improvement': 'RETAIL_ECOMMERCE',
    'Technology': 'TECHNOLOGY',
    'Retail & Fashion': 'RETAIL_ECOMMERCE',
    'Technology & Retail': 'TECHNOLOGY',
    'Entertainment & Media': 'ENTERTAINMENT_MEDIA',
    'Automotive': 'AUTOMOTIVE',
    'Pharmaceuticals & Healthcare': 'HEALTHCARE_PHARMA',
    'Travel & Hospitality': 'TRAVEL_HOSPITALITY',
    'Telecommunications': 'TELECOM',
    'Healthcare & Pharmacy': 'HEALTHCARE_PHARMA',
    'Logistics & Transportation': 'LOGISTICS',
    'Industrial & Technology': 'TECHNOLOGY',
    'Retail & Electronics': 'RETAIL_ECOMMERCE',
    'Technology & Electronics': 'TECHNOLOGY',
    'Insurance': 'INSURANCE',
    'Consulting & Technology': 'PROFESSIONAL_SERVICES',
    'Luxury & Fashion': 'FASHION_BEAUTY',
    'Real Estate': 'REAL_ESTATE',
    'Technology & Social Media': 'TECHNOLOGY',
    'Transportation & Ridesharing': 'LOGISTICS',
    'Energy & Oil': 'ENERGY',
    'Beauty & Personal Care': 'FASHION_BEAUTY',
    'Toys & Games': 'RETAIL_ECOMMERCE',
    'Retail & Furniture': 'RETAIL_ECOMMERCE',
    'Professional Services': 'PROFESSIONAL_SERVICES',
    'Defense & Aerospace': 'TECHNOLOGY',
    'Luxury & Watches': 'FASHION_BEAUTY',
    'Enterprise Software': 'TECHNOLOGY',
    'Retail & Beauty': 'FASHION_BEAUTY',
    'Retail & Food': 'RETAIL_ECOMMERCE',
    'Financial Services & Insurance': 'FINANCIAL_SERVICES',
    'Luxury & Jewelry': 'FASHION_BEAUTY',
    'Retail & Sports Apparel': 'FASHION_BEAUTY',
    'Entertainment & Streaming': 'ENTERTAINMENT_MEDIA',
    'Technology & Gaming': 'GAMING',
    'Financial Services & Technology': 'FINANCIAL_SERVICES',
    'Real Estate & Coworking': 'REAL_ESTATE',
    'Consumer Appliances': 'CPG_FOOD_BEVERAGE',
    'Technology & Office Solutions': 'TECHNOLOGY',
    'Retail & Pet Care': 'RETAIL_ECOMMERCE',
    'Automotive & Motorcycles': 'AUTOMOTIVE',
    'Healthcare & Medical Devices': 'HEALTHCARE_PHARMA',
    'Travel & Airlines': 'TRAVEL_HOSPITALITY',
    'Government & Aerospace': 'GOVERNMENT_NONPROFIT',
    'Retail & Outdoor Apparel': 'FASHION_BEAUTY'
  };

  return industryMap[industry] || undefined;
};

async function readCSV<T>(filePath: string): Promise<T[]> {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  return new Promise((resolve, reject) => {
    Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data as T[]),
      error: (error: Error) => reject(error)
    });
  });
}

async function main() {
  console.log('🚀 Starting Independent Agencies Import with Partnerships...\n');

  const stats = {
    agenciesCreated: 0,
    agenciesSkipped: 0,
    advertisersCreated: 0,
    advertisersSkipped: 0,
    partnershipsCreated: 0,
    partnershipsSkipped: 0,
    errors: [] as string[]
  };

  try {
    // =========================================================================
    // STEP 1: Read all CSV files
    // =========================================================================
    console.log('📂 Reading CSV files...');

    const agenciesPath = path.join(process.cwd(), 'independent-agencies-import.csv');
    const advertisersPath = path.join(process.cwd(), 'independent-agencies-advertisers-import.csv');
    const mappingsPath = path.join(process.cwd(), 'independent-agencies-advertiser-mappings.csv');

    const agencies = await readCSV<AgencyRow>(agenciesPath);
    const advertisers = await readCSV<AdvertiserRow>(advertisersPath);
    const mappings = await readCSV<MappingRow>(mappingsPath);

    console.log(`✅ Found ${agencies.length} agencies`);
    console.log(`✅ Found ${advertisers.length} advertisers`);
    console.log(`✅ Found ${mappings.length} advertiser-agency mappings\n`);

    // =========================================================================
    // STEP 2: Create/Update Agencies
    // =========================================================================
    console.log('🏢 Creating agencies...');

    const agencyIdMap = new Map<string, string>(); // name (lowercase) -> id

    for (const agency of agencies) {
      try {
        const normalizedName = agency.companyName.toLowerCase();

        // Check if agency already exists
        const existing = await prisma.company.findFirst({
          where: {
            name: { equals: agency.companyName, mode: 'insensitive' }
          }
        });

        if (existing) {
          agencyIdMap.set(normalizedName, existing.id);
          stats.agenciesSkipped++;
          console.log(`  ⏭️  Skipped (exists): ${agency.companyName}`);
          continue;
        }

        // Create new agency
        const logoUrl = getCompanyLogoUrl(agency.website, agency.companyName);
        const slug = agency.companyName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');

        const newAgency = await prisma.company.create({
          data: {
            id: createId(),
            name: agency.companyName,
            slug,
            companyType: 'AGENCY',
            industry: mapIndustry(agency.industry),
            website: agency.website || undefined,
            logoUrl,
            city: agency.city || undefined,
            state: agency.state || undefined,
            country: agency.country || undefined,
            dataQuality: 'BASIC',
            verified: false,
            updatedAt: new Date()
          }
        });

        agencyIdMap.set(normalizedName, newAgency.id);
        stats.agenciesCreated++;
        console.log(`  ✅ Created: ${agency.companyName}`);

      } catch (error: any) {
        const msg = `Agency "${agency.companyName}": ${error.message}`;
        stats.errors.push(msg);
        console.error(`  ❌ Error: ${msg}`);
      }
    }

    console.log(`\n📊 Agencies: ${stats.agenciesCreated} created, ${stats.agenciesSkipped} skipped\n`);

    // =========================================================================
    // STEP 3: Create/Update Advertisers
    // =========================================================================
    console.log('🎯 Creating advertisers...');

    const advertiserIdMap = new Map<string, string>(); // name (lowercase) -> id

    for (const advertiser of advertisers) {
      try {
        const normalizedName = advertiser.companyName.toLowerCase();

        // Check if advertiser already exists
        const existing = await prisma.company.findFirst({
          where: {
            name: { equals: advertiser.companyName, mode: 'insensitive' }
          }
        });

        if (existing) {
          advertiserIdMap.set(normalizedName, existing.id);
          stats.advertisersSkipped++;
          console.log(`  ⏭️  Skipped (exists): ${advertiser.companyName}`);
          continue;
        }

        // Create new advertiser
        const logoUrl = getCompanyLogoUrl(advertiser.website, advertiser.companyName);
        const slug = advertiser.companyName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');

        const newAdvertiser = await prisma.company.create({
          data: {
            id: createId(),
            name: advertiser.companyName,
            slug,
            companyType: 'ADVERTISER',
            industry: mapIndustry(advertiser.industry),
            website: advertiser.website || undefined,
            logoUrl,
            city: advertiser.city || undefined,
            state: advertiser.state || undefined,
            country: advertiser.country || undefined,
            dataQuality: 'BASIC',
            verified: false,
            updatedAt: new Date()
          }
        });

        advertiserIdMap.set(normalizedName, newAdvertiser.id);
        stats.advertisersCreated++;
        console.log(`  ✅ Created: ${advertiser.companyName}`);

      } catch (error: any) {
        const msg = `Advertiser "${advertiser.companyName}": ${error.message}`;
        stats.errors.push(msg);
        console.error(`  ❌ Error: ${msg}`);
      }
    }

    console.log(`\n📊 Advertisers: ${stats.advertisersCreated} created, ${stats.advertisersSkipped} skipped\n`);

    // =========================================================================
    // STEP 4: Create Agency-Advertiser Partnerships
    // =========================================================================
    console.log('🤝 Creating agency partnerships...');

    for (const mapping of mappings) {
      try {
        const agencyNormalized = mapping.agencyName.toLowerCase();
        const advertiserNormalized = mapping.advertiserName.toLowerCase();

        // Get agency ID
        let agencyId = agencyIdMap.get(agencyNormalized);
        if (!agencyId) {
          // Try to find in database
          const agency = await prisma.company.findFirst({
            where: { name: { equals: mapping.agencyName, mode: 'insensitive' } }
          });
          if (agency) {
            agencyId = agency.id;
            agencyIdMap.set(agencyNormalized, agency.id);
          }
        }

        // Get advertiser ID
        let advertiserId = advertiserIdMap.get(advertiserNormalized);
        if (!advertiserId) {
          // Try to find in database
          const advertiser = await prisma.company.findFirst({
            where: { name: { equals: mapping.advertiserName, mode: 'insensitive' } }
          });
          if (advertiser) {
            advertiserId = advertiser.id;
            advertiserIdMap.set(advertiserNormalized, advertiser.id);
          }
        }

        if (!agencyId) {
          stats.errors.push(`Partnership: Agency "${mapping.agencyName}" not found`);
          console.error(`  ❌ Agency not found: ${mapping.agencyName}`);
          continue;
        }

        if (!advertiserId) {
          stats.errors.push(`Partnership: Advertiser "${mapping.advertiserName}" not found`);
          console.error(`  ❌ Advertiser not found: ${mapping.advertiserName}`);
          continue;
        }

        // Check if partnership already exists
        const existingPartnership = await prisma.companyPartnership.findFirst({
          where: {
            agencyId,
            advertiserId
          }
        });

        if (existingPartnership) {
          stats.partnershipsSkipped++;
          console.log(`  ⏭️  Skipped (exists): ${mapping.agencyName} ↔ ${mapping.advertiserName}`);
          continue;
        }

        // Create partnership
        await prisma.companyPartnership.create({
          data: {
            id: createId(),
            agencyId,
            advertiserId,
            relationshipType: 'AGENCY_CLIENT',
            isAOR: false,
            isActive: true,
            updatedAt: new Date()
          }
        });

        stats.partnershipsCreated++;
        console.log(`  ✅ Created: ${mapping.agencyName} ↔ ${mapping.advertiserName}`);

      } catch (error: any) {
        const msg = `Partnership "${mapping.agencyName} ↔ ${mapping.advertiserName}": ${error.message}`;
        stats.errors.push(msg);
        console.error(`  ❌ Error: ${msg}`);
      }
    }

    console.log(`\n📊 Partnerships: ${stats.partnershipsCreated} created, ${stats.partnershipsSkipped} skipped\n`);

    // =========================================================================
    // FINAL SUMMARY
    // =========================================================================
    console.log('=' .repeat(60));
    console.log('✨ IMPORT COMPLETE\n');
    console.log(`Agencies:     ${stats.agenciesCreated} created, ${stats.agenciesSkipped} skipped`);
    console.log(`Advertisers:  ${stats.advertisersCreated} created, ${stats.advertisersSkipped} skipped`);
    console.log(`Partnerships: ${stats.partnershipsCreated} created, ${stats.partnershipsSkipped} skipped`);
    console.log(`Errors:       ${stats.errors.length}`);

    if (stats.errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      stats.errors.forEach(err => console.log(`   - ${err}`));
    }

    console.log('=' .repeat(60));

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
