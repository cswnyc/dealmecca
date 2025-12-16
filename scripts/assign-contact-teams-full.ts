import { PrismaClient } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';

const prisma = new PrismaClient();

// Complete contact to advertiser/client mappings from SellerCrowd screenshots
const contactTeamAssignments: Record<string, string[]> = {
  // From first screenshot set
  'Natalyah Morgam': ['Spectrum Brands'],
  'Kristen Milea': ['Capital One'],
  'Gabrielle Taragano': ["Bob's Discount Furniture", 'Fanduel', 'Redfin'],
  'John Cappabianca': ["Bob's Discount Furniture", 'Fanduel'],
  'Christopher Rynn': [
    'Atlantis Bahamas',
    'Glanbia Performance Nutrition',
    'Impossible Foods',
    'Madison Square Garden Group',
    'Primo Brands',
    'SiriusXM',
    'Sleep Number Corporation',
    'The Goddard School',
    'Vytalogy Wellness',
    'Wegmans'
  ],
  'Madinah Patterson': [
    'ADT',
    'Adtalem Global Education',
    'Charlotte Tilbury',
    'Charter Communications',
    'Earnest',
    'eHarmony',
    'Leaf Home Solutions',
    'Newfold Digital',
    'Rover.com'
  ],
  'Truman Imbo': ['SquareSpace', "Bob's Discount Furniture", 'Fanduel', 'Redfin'],
  'Jillian Mizner': ['AMC Networks'],
};

async function main() {
  console.log('Assigning contacts to teams based on advertiser relationships...\n');

  // Find Horizon Media NY
  const horizonNY = await prisma.company.findFirst({
    where: { name: 'Horizon Media NY' }
  });

  if (!horizonNY) {
    console.error('Horizon Media NY not found!');
    return;
  }

  console.log(`Agency: ${horizonNY.name} (${horizonNY.id})\n`);

  let teamsCreated = 0;
  let advertisersCreated = 0;
  let contactTeamsCreated = 0;
  let skipped = 0;

  for (const [contactName, advertisers] of Object.entries(contactTeamAssignments)) {
    // Find the contact
    const contact = await prisma.contact.findFirst({
      where: {
        fullName: contactName,
        companyId: horizonNY.id
      }
    });

    if (!contact) {
      console.log(`SKIP: Contact "${contactName}" not found`);
      skipped++;
      continue;
    }

    console.log(`\n--- ${contact.fullName} ---`);

    for (const advertiserName of advertisers) {
      // Find or create the advertiser company
      let advertiser = await prisma.company.findFirst({
        where: {
          name: { equals: advertiserName, mode: 'insensitive' }
        }
      });

      if (!advertiser) {
        // Create the advertiser
        const slug = advertiserName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + createId().slice(0, 8);
        advertiser = await prisma.company.create({
          data: {
            id: createId(),
            name: advertiserName,
            slug,
            type: 'ADVERTISER',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        advertisersCreated++;
        console.log(`  Created advertiser: ${advertiser.name}`);
      }

      // Find or create a team for this agency-advertiser relationship
      let team = await prisma.team.findFirst({
        where: {
          companyId: horizonNY.id,
          clientCompanyId: advertiser.id
        }
      });

      if (!team) {
        team = await prisma.team.create({
          data: {
            id: createId(),
            name: `${advertiser.name} Team`,
            companyId: horizonNY.id,
            clientCompanyId: advertiser.id,
            type: 'AGENCY_TEAM',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        teamsCreated++;
        console.log(`  Created team: ${team.name}`);
      }

      // Check if ContactTeam already exists
      const existingContactTeam = await prisma.contactTeam.findFirst({
        where: {
          contactId: contact.id,
          teamId: team.id
        }
      });

      if (existingContactTeam) {
        console.log(`  SKIP: Already on ${team.name}`);
        continue;
      }

      // Create ContactTeam record
      await prisma.contactTeam.create({
        data: {
          id: createId(),
          contactId: contact.id,
          teamId: team.id,
          isPrimary: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      contactTeamsCreated++;
      console.log(`  + Added to: ${team.name}`);
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Advertisers created: ${advertisersCreated}`);
  console.log(`Teams created: ${teamsCreated}`);
  console.log(`Contact-Team links created: ${contactTeamsCreated}`);
  console.log(`Contacts skipped: ${skipped}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
