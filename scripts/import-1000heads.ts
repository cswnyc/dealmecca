import { PrismaClient } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';

const prisma = new PrismaClient();

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + createId().slice(0, 8);
}

async function main() {
  console.log('Importing 1000heads LA agency...\n');

  // Check if 1000heads LA exists
  let agency = await prisma.company.findFirst({
    where: { name: { equals: '1000heads LA', mode: 'insensitive' } }
  });

  if (!agency) {
    agency = await prisma.company.create({
      data: {
        id: createId(),
        name: '1000heads LA',
        slug: generateSlug('1000heads LA'),
        companyType: 'AGENCY',
        headquarters: 'Los Angeles, CA',
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    console.log(`CREATED Agency: 1000heads LA (${agency.id})`);
  } else {
    console.log(`1000heads LA already exists (${agency.id})`);
  }

  // Create advertiser teams - Google and Amazon
  const advertisers = [
    { name: 'Google', duties: ['Google Pixel', 'Influencer Marketing'] },
    { name: 'Amazon', duties: ['Amazon Prime Video', 'Influencer Marketing'] }
  ];

  for (const adv of advertisers) {
    // Find or create advertiser
    let advertiser = await prisma.company.findFirst({
      where: { name: { equals: adv.name, mode: 'insensitive' } }
    });

    if (!advertiser) {
      advertiser = await prisma.company.create({
        data: {
          id: createId(),
          name: adv.name,
          slug: generateSlug(adv.name),
          companyType: 'ADVERTISER',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      console.log(`CREATED Advertiser: ${advertiser.name}`);
    } else {
      console.log(`Advertiser ${advertiser.name} already exists`);
    }

    // Find or create team
    let team = await prisma.team.findFirst({
      where: {
        companyId: agency.id,
        clientCompanyId: advertiser.id
      }
    });

    if (!team) {
      team = await prisma.team.create({
        data: {
          id: createId(),
          name: `${advertiser.name} Team`,
          companyId: agency.id,
          clientCompanyId: advertiser.id,
          type: 'AGENCY_TEAM',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      console.log(`CREATED Team: ${team.name}`);
    } else {
      console.log(`Team for ${advertiser.name} already exists`);
    }
  }

  // Add Influencer Marketing duty to the agency
  const influencerDuty = await prisma.duty.findFirst({
    where: { name: { equals: 'Influencer Marketing', mode: 'insensitive' } }
  });

  if (influencerDuty) {
    const existingDuty = await prisma.companyDuty.findFirst({
      where: { companyId: agency.id, dutyId: influencerDuty.id }
    });

    if (!existingDuty) {
      await prisma.companyDuty.create({
        data: {
          companyId: agency.id,
          dutyId: influencerDuty.id
        }
      });
      console.log(`Added duty: Influencer Marketing`);
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Agency: ${agency.name}`);
  console.log(`Teams: Google, Amazon`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
