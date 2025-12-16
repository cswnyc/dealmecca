import { PrismaClient } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';

const prisma = new PrismaClient();

// Horizon Media NY teams/clients from screenshot
const clients = [
  'A Place for Mom',
  'A+E Global Media',
  'ADT',
  'Adtalem Global Education',
  'Altice',
  'AMC Networks',
  'Amerisave',
  'Amplifon',
  'Annapurna Pictures',
  'Atlantis Bahamas',
  'Authentic Brands Group',
  'Bleecker Street',
  'Blockchains',
  "Boar's Head",
  "Bob's Discount Furniture",
  'Bombas',
  'Brightstar Care',
  'BSC Pet Treats',
  'California Lottery',
  'Capital One',
  'Care.com',
  'Carvana',
  'Charlotte Tilbury',
  'Charter Communications',
  'CHI Health',
  'Chiquita',
  'CHS Inc',
  'Cirque du Soleil',
  'CommonSpirit Health',
  'Credit Karma',
  'Dish Network',
  'DriveTime',
  'Earnest',
  'Earnin',
  'eHarmony',
  'Essentia Water',
  'Fanatics',
  'Fanduel',
  'Fisher Investments',
  'Flavortown Kitchen',
  'Gametime United',
  'Genentech',
  'Glanbia Performance Nutrition',
  'Golden Corral',
  'Great Wolf Resorts',
  'GW Laboratories',
  'Honda',
  'Impossible Foods',
  'INSP',
  'Kensington Tours',
  "Kohl's",
  'La Colombe Coffee Roasters',
  'Leaf Home Solutions',
  'Lionsgate',
  'Live Nation',
  'Livekindly',
  'Madison Square Garden Group',
  'Materne',
  'Mayo Clinic',
  'MGA Entertainment',
  'MGM Studios',
  'MSG Network',
  'NetJets',
  'New Jersey Lottery',
  'Newfold Digital',
  'NFL',
  'Noom Inc.',
  'Northwell Health',
  'Pandora',
  'Patio Enclosures by Great Day Improvements',
  'Pizza Pizza Limited',
  'Primo Brands',
  'PrizePicks',
  'PurposeBuilt Brands',
  'Redfin',
  'Regeneron Pharmaceuticals',
  'Revlon',
  'Rollins Inc',
  'Rover.com',
  'Safelite Auto Glass',
  'SailGP',
  'SeaWorld Parks & Entertainment',
  'SharkNinja',
  'ShipStation',
  'SiriusXM',
  'Sleep Number Corporation',
  'Spectrum Brands',
  'SquareSpace',
  'Stamps.com',
  'Starkist',
  'Surest',
  'Swatch',
  'The Goddard School',
  'The Lincoln Project',
  'TIAA',
  'Tropical Smoothie Cafe',
  'Turo',
  'United Artists Releasing',
  'Urban One',
  'VICE Media',
  'Vytalogy Wellness',
  'Warby Parker',
  'Wegmans',
  'Wildlife Conservation Society',
  'Wind Creek Hospitality',
];

async function main() {
  // Find Horizon Media NY
  const horizonNY = await prisma.company.findFirst({
    where: { name: 'Horizon Media NY' }
  });

  if (!horizonNY) {
    console.log('Horizon Media NY not found');
    return;
  }

  console.log('Found Horizon Media NY: ' + horizonNY.id);

  // Check existing teams
  const existingTeams = await prisma.team.findMany({
    where: { companyId: horizonNY.id }
  });
  console.log('Existing teams: ' + existingTeams.length);

  let created = 0;
  let skipped = 0;

  for (const clientName of clients) {
    // Check if team already exists
    const existingTeam = await prisma.team.findFirst({
      where: {
        companyId: horizonNY.id,
        name: clientName
      }
    });

    if (existingTeam) {
      skipped++;
      continue;
    }

    // Find the client company if it exists
    const clientCompany = await prisma.company.findFirst({
      where: { name: { equals: clientName, mode: 'insensitive' } }
    });

    // Create the team
    await prisma.team.create({
      data: {
        id: createId(),
        name: clientName,
        companyId: horizonNY.id,
        clientCompanyId: clientCompany?.id || null,
        type: 'ADVERTISER_TEAM',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log('Created team: ' + clientName + (clientCompany ? ' (linked to company)' : ''));
    created++;
  }

  console.log('\nCreated: ' + created + ', Skipped: ' + skipped);

  // Show total teams
  const totalTeams = await prisma.team.count({
    where: { companyId: horizonNY.id }
  });
  console.log('Total Horizon Media NY teams: ' + totalTeams);
}

main().catch(console.error).finally(() => prisma.$disconnect());
