#!/usr/bin/env npx tsx

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import Papa from 'papaparse';

const prisma = new PrismaClient();

interface CSVRow {
  companyName: string;
  firstName: string;
  lastName: string;
  title: string;
  website: string;
  industry: string;
  employeeCount: string;
  headquarters: string;
}

// Helper to generate slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Helper to parse location from headquarters string
function parseLocation(headquarters: string): { city?: string; state?: string; country: string } {
  // Handle format like "New York NY", "Los Angeles CA", "London", etc.
  const parts = headquarters.trim().split(/\s+/);

  if (parts.length === 1) {
    // Just a city name (international)
    return {
      city: parts[0],
      country: parts[0] === 'London' ? 'United Kingdom' :
              parts[0] === 'Paris' ? 'France' :
              parts[0] === 'Tokyo' ? 'Japan' :
              parts[0] === 'Sydney' ? 'Australia' :
              parts[0] === 'Singapore' ? 'Singapore' :
              parts[0] === 'Dubai' ? 'United Arab Emirates' :
              parts[0] === 'Montreal' || parts[0] === 'Toronto' || parts[0] === 'Vancouver' ? 'Canada' :
              parts[0] === 'Amsterdam' ? 'Netherlands' :
              parts[0] === 'Brussels' ? 'Belgium' :
              parts[0] === 'Dublin' ? 'Ireland' :
              parts[0] === 'Vienna' ? 'Austria' :
              parts[0] === 'Moscow' ? 'Russia' :
              parts[0] === 'Bangkok' ? 'Thailand' :
              parts[0] === 'Melbourne' ? 'Australia' :
              parts[0] === 'Auckland' ? 'New Zealand' :
              parts[0] === 'Bogota' ? 'Colombia' :
              parts[0] === 'Doha' ? 'Qatar' :
              parts[0] === 'Riyadh' ? 'Saudi Arabia' :
              parts[0] === 'Istanbul' ? 'Turkey' :
              parts[0] === 'Frankfurt' ? 'Germany' :
              parts[0] === 'Dusseldorf' ? 'Germany' :
              parts[0] === 'Edinburgh' ? 'United Kingdom' :
              parts[0] === 'Leeds' ? 'United Kingdom' :
              parts[0] === 'Manchester' ? 'United Kingdom' :
              parts[0] === 'Birmingham' ? 'United Kingdom' :
              parts[0] === 'Gothenburg' ? 'Sweden' :
              parts[0] === 'Lausanne' ? 'Switzerland' :
              parts[0] === 'Lisbon' ? 'Portugal' :
              parts[0] === 'Shanghai' ? 'China' :
              parts[0] === 'Seoul' ? 'South Korea' :
              parts[0] === 'Zurich' ? 'Switzerland' :
              parts[0] === 'Cairo' ? 'Egypt' :
              parts[0] === 'Brisbane' ? 'Australia' :
              parts[0] === 'Wellington' ? 'New Zealand' :
              'US'
    };
  } else {
    // Format like "New York NY" or "Los Angeles CA"
    const state = parts[parts.length - 1];
    const city = parts.slice(0, -1).join(' ');
    return {
      city,
      state,
      country: 'United States'
    };
  }
}

// Extract base network name (e.g., "Mindshare" from "Mindshare LA")
function getNetworkName(companyName: string): string {
  const networkPatterns = [
    'GroupM', 'Mindshare', 'Wavemaker', 'EssenceMediacom', 'WPP Media',
    'Neo Media World', 'Choreograph', 'Kinesso', 'Xaxis', 'Ogilvy',
    'AKQA', 'David', 'Geometry', 'Grey', 'HHCL', 'Hogarth', 'Landor',
    'Mirum', 'Possible', 'Quirks', 'Ritual', 'Superunion', 'VML',
    'Wunderman Thompson', 'Hill+Knowlton', 'Burson', 'BCW',
    'Finsbury Glover Hering', 'Buchanan', 'Cohn & Wolfe', 'Social.Lab',
    'T&Pm', 'OpenMind', 'Eightbar', 'GTB', 'Grey Group', 'Theo',
    'VML Health', 'Village Marketing', 'Zubi', 'Catalyst Digital',
    'Taxi', 'HudsonRouge', 'SJR', 'Hogarth Worldwide', 'MFUSE',
    'Red Fuse', 'Global Strategies International', 'Candyspace',
    'Spafax', 'Media Futures Group', 'L\'Atelier', 'Groupm Nexus'
  ];

  for (const pattern of networkPatterns) {
    if (companyName.startsWith(pattern)) {
      return pattern;
    }
  }

  return companyName;
}

// Check if this is a location/branch (has location suffix)
function isLocationBranch(companyName: string, networkName: string): boolean {
  return companyName !== networkName && companyName.startsWith(networkName);
}

async function importWPPHoldingCompany() {
  console.log('🚀 Starting WPP Holding Company import...\n');

  try {
    // 1. Find or create WPP holding company
    console.log('Step 1: Setting up WPP holding company...');
    let wppHoldingCompany = await prisma.company.findFirst({
      where: { name: 'WPP' }
    });

    if (!wppHoldingCompany) {
      wppHoldingCompany = await prisma.company.create({
        data: {
          id: `wpp-${Date.now()}`,
          name: 'WPP',
          slug: 'wpp',
          website: 'https://www.wpp.com',
          companyType: 'MEDIA_HOLDING_COMPANY',
          industry: 'ENTERTAINMENT_MEDIA',
          employeeCount: 'MEGA_5000_PLUS',
          city: 'London',
          country: 'United Kingdom',
          verified: true,
          description: 'WPP is a creative transformation company that uses the power of creativity to build better futures for our people, planet, clients, and communities.',
          updatedAt: new Date(),
        }
      });
      console.log('✅ Created WPP holding company');
    } else {
      console.log('✅ WPP holding company already exists');
    }

    // 2. Read both CSV files
    console.log('\nStep 2: Reading CSV files...');
    const csv1Path = path.join(process.cwd(), 'wpp-holding-company-agencies-import.csv');
    const csv2Path = path.join(process.cwd(), 'wpp-holding-company-agencies-import-2.csv');

    const csv1Data = fs.readFileSync(csv1Path, 'utf-8');
    const csv2Data = fs.readFileSync(csv2Path, 'utf-8');

    const parsedCsv1 = Papa.parse<CSVRow>(csv1Data, { header: true, skipEmptyLines: true });
    const parsedCsv2 = Papa.parse<CSVRow>(csv2Data, { header: true, skipEmptyLines: true });

    const allRows = [...parsedCsv1.data, ...parsedCsv2.data].filter(row =>
      row.companyName && row.companyName !== 'WPP'
    );

    console.log(`✅ Found ${allRows.length} agencies to process\n`);

    // 3. Group companies by network
    console.log('Step 3: Organizing agencies by network...');
    const networkMap = new Map<string, CSVRow[]>();

    for (const row of allRows) {
      const networkName = getNetworkName(row.companyName);
      if (!networkMap.has(networkName)) {
        networkMap.set(networkName, []);
      }
      networkMap.get(networkName)!.push(row);
    }

    console.log(`✅ Found ${networkMap.size} unique networks\n`);

    // 4. Import each network and its locations
    let networksCreated = 0;
    let locationsCreated = 0;
    let skipped = 0;

    for (const [networkName, rows] of networkMap.entries()) {
      console.log(`\n📍 Processing network: ${networkName}`);

      // Find the main network entry (the one without location suffix)
      const mainNetworkRow = rows.find(r => r.companyName === networkName) || rows[0];
      const location = parseLocation(mainNetworkRow.headquarters);

      // Create or find network agency
      let networkAgency = await prisma.company.findFirst({
        where: {
          name: networkName,
        }
      });

      if (!networkAgency) {
        const timestamp = Date.now();
        const baseSlug = generateSlug(networkName);
        networkAgency = await prisma.company.create({
          data: {
            id: `${baseSlug}-${timestamp}`,
            name: networkName,
            slug: `${baseSlug}-${timestamp}`,
            website: mainNetworkRow.website || undefined,
            companyType: 'HOLDING_COMPANY_AGENCY',
            industry: 'ENTERTAINMENT_MEDIA',
            employeeCount: mainNetworkRow.employeeCount as any || 'MEGA_5000_PLUS',
            city: location.city,
            state: location.state,
            country: location.country,
            parentCompanyId: wppHoldingCompany.id,
            verified: false,
            updatedAt: new Date(),
          }
        });
        networksCreated++;
        console.log(`  ✅ Created network: ${networkName}`);
      } else {
        // Update parent company if not already set to WPP
        if (networkAgency.parentCompanyId !== wppHoldingCompany.id) {
          await prisma.company.update({
            where: { id: networkAgency.id },
            data: {
              parentCompanyId: wppHoldingCompany.id,
              updatedAt: new Date(),
            }
          });
          console.log(`  ✅ Updated network parent: ${networkName}`);
          networksCreated++;
        } else {
          console.log(`  ⏭️  Network already exists: ${networkName}`);
        }
      }

      // Create location branches
      const locationRows = rows.filter(r => isLocationBranch(r.companyName, networkName));

      for (const locRow of locationRows) {
        const locData = parseLocation(locRow.headquarters);

        // Check if location already exists (by name anywhere)
        const existingLocation = await prisma.company.findFirst({
          where: {
            name: locRow.companyName,
          }
        });

        if (!existingLocation) {
          const timestamp = Date.now();
          const baseSlug = generateSlug(locRow.companyName);
          await prisma.company.create({
            data: {
              id: `${baseSlug}-${timestamp}`,
              name: locRow.companyName,
              slug: `${baseSlug}-${timestamp}`,
              website: locRow.website || undefined,
              companyType: 'HOLDING_COMPANY_AGENCY',
              industry: 'ENTERTAINMENT_MEDIA',
              employeeCount: locRow.employeeCount as any || 'MEGA_5000_PLUS',
              city: locData.city,
              state: locData.state,
              country: locData.country,
              parentCompanyId: networkAgency.id,
              verified: false,
              updatedAt: new Date(),
            }
          });
          locationsCreated++;
          console.log(`    ✅ Created location: ${locRow.companyName}`);
        } else {
          // Update parent if needed
          if (existingLocation.parentCompanyId !== networkAgency.id) {
            await prisma.company.update({
              where: { id: existingLocation.id },
              data: {
                parentCompanyId: networkAgency.id,
                updatedAt: new Date(),
              }
            });
            locationsCreated++;
            console.log(`    ✅ Updated location parent: ${locRow.companyName}`);
          } else {
            skipped++;
          }
        }
      }
    }

    console.log('\n\n✨ Import complete!');
    console.log('═══════════════════════════════════════');
    console.log(`✅ Networks created: ${networksCreated}`);
    console.log(`✅ Locations created: ${locationsCreated}`);
    console.log(`⏭️  Skipped (already exist): ${skipped}`);
    console.log(`📊 Total subsidiaries: ${networksCreated + locationsCreated}`);
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error during import:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importWPPHoldingCompany()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
