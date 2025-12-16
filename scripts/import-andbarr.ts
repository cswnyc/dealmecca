import { PrismaClient } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';

const prisma = new PrismaClient();

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + createId().slice(0, 8);
}

// Infer seniority from title
function inferSeniority(title: string): string {
  const titleLower = title.toLowerCase();

  if (titleLower.includes('chief') || titleLower.includes('ceo') || titleLower.includes('cmo') ||
      titleLower.includes('cfo') || titleLower.includes('coo') || titleLower.includes('president') ||
      titleLower.includes('evp')) {
    return 'C_LEVEL';
  }
  if (titleLower.includes('svp') || titleLower.includes('senior vice president')) {
    return 'SVP';
  }
  if (titleLower.includes('vp') || titleLower.includes('vice president')) {
    return 'VP';
  }
  if (titleLower.includes('director')) {
    return 'DIRECTOR';
  }
  if (titleLower.includes('senior') || titleLower.includes('manager') || titleLower.includes('supervisor') ||
      titleLower.includes('group media')) {
    return 'MANAGER';
  }
  if (titleLower.includes('buyer') || titleLower.includes('planner')) {
    return 'SPECIALIST';
  }
  if (titleLower.includes('coordinator') || titleLower.includes('assistant') || titleLower.includes('associate')) {
    return 'COORDINATOR';
  }
  return 'SPECIALIST';
}

async function main() {
  console.log('Importing &Barr agency with teams and contacts...\n');

  // Check if &Barr already exists
  let andBarr = await prisma.company.findFirst({
    where: { name: { equals: '&Barr', mode: 'insensitive' } }
  });

  if (andBarr) {
    console.log(`&Barr already exists (${andBarr.id})`);
  } else {
    // Create &Barr agency
    andBarr = await prisma.company.create({
      data: {
        id: createId(),
        name: '&Barr',
        slug: generateSlug('&Barr'),
        companyType: 'AGENCY',
        headquarters: 'Orlando, FL',
        website: 'https://andbarr.co',
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    console.log(`CREATED Agency: ${andBarr.name} (${andBarr.id})`);
  }

  // Define advertisers/clients
  const advertisers = [
    { name: 'Space Coast Credit Union', companyType: 'ADVERTISER' as const },
    { name: 'Rosen Hotels & Resorts', companyType: 'ADVERTISER' as const }
  ];

  const teamMap: Record<string, string> = {};

  // Create advertisers and teams
  for (const adv of advertisers) {
    let advertiser = await prisma.company.findFirst({
      where: { name: { equals: adv.name, mode: 'insensitive' } }
    });

    if (!advertiser) {
      advertiser = await prisma.company.create({
        data: {
          id: createId(),
          name: adv.name,
          slug: generateSlug(adv.name),
          companyType: adv.companyType,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      console.log(`CREATED Advertiser: ${advertiser.name}`);
    }

    // Create team for this agency-advertiser relationship
    let team = await prisma.team.findFirst({
      where: {
        companyId: andBarr.id,
        clientCompanyId: advertiser.id
      }
    });

    if (!team) {
      team = await prisma.team.create({
        data: {
          id: createId(),
          name: `${advertiser.name} Team`,
          companyId: andBarr.id,
          clientCompanyId: advertiser.id,
          type: 'AGENCY_TEAM',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      console.log(`CREATED Team: ${team.name}`);
    }

    teamMap[adv.name] = team.id;
  }

  // Define contacts
  const contacts = [
    {
      firstName: 'Will',
      lastName: 'Hornbeck',
      title: 'Integrated Media Buyer and Planner',
      email: 'will.hornbeck@andbarr.co',
      teams: [], // No specific team shown
      duties: ['Convention']
    },
    {
      firstName: 'Lorena',
      lastName: 'Bergan',
      title: 'Director of Digital Ad Operations',
      email: 'lorena.bergan@andbarr.co',
      teams: ['Rosen Hotels & Resorts'],
      duties: []
    },
    {
      firstName: 'Dana',
      lastName: 'Montalto',
      title: 'Media Buyer',
      email: 'dana.montalto@andbarr.co',
      teams: [],
      duties: []
    },
    {
      firstName: 'Dianne',
      lastName: 'Smith',
      title: 'Senior Group Media Director',
      email: null, // Not provided
      teams: [],
      duties: []
    }
  ];

  let contactsCreated = 0;
  let contactTeamsCreated = 0;

  for (const c of contacts) {
    const fullName = `${c.firstName} ${c.lastName}`;

    // Check if contact exists
    let contact = await prisma.contact.findFirst({
      where: {
        OR: [
          { email: c.email || undefined },
          { fullName, companyId: andBarr.id }
        ]
      }
    });

    if (contact) {
      console.log(`SKIP Contact: ${fullName} (already exists)`);
    } else {
      contact = await prisma.contact.create({
        data: {
          id: createId(),
          firstName: c.firstName,
          lastName: c.lastName,
          fullName,
          title: c.title,
          email: c.email,
          companyId: andBarr.id,
          verified: true,
          seniority: inferSeniority(c.title) as any,
          updatedAt: new Date()
        }
      });
      console.log(`CREATED Contact: ${fullName} (${contact.id})`);
      contactsCreated++;
    }

    // Add to teams
    for (const teamName of c.teams) {
      const teamId = teamMap[teamName];
      if (teamId) {
        const existing = await prisma.contactTeam.findFirst({
          where: { contactId: contact.id, teamId }
        });

        if (!existing) {
          await prisma.contactTeam.create({
            data: {
              id: createId(),
              contactId: contact.id,
              teamId,
              isPrimary: false,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });
          console.log(`  + Added to team: ${teamName}`);
          contactTeamsCreated++;
        }
      }
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Agency: ${andBarr.name}`);
  console.log(`Contacts created: ${contactsCreated}`);
  console.log(`Contact-Team links created: ${contactTeamsCreated}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
