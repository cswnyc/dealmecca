import { PrismaClient } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';

const prisma = new PrismaClient();

// Team data from screenshot
const teamData = [
  {
    teamName: 'Bleecker Street',
    people: [
      'Caroline Wilkinson',
      'Christina Panico',
      'Connor Colandrea',
      'Curtis Curlo',
      'David Ehrenthal',
      'DeAndra Norman',
      'Ishita Sharma',
      'Jackie Lenane',
      'Jocelyn C. Rodenstein',
      'Kyra Min',
      'Margaret Mandarano',
    ],
    duties: ['Buying', 'Digital', 'Display', 'DOOH', 'OOH', 'OTT / CTV', 'Planning', 'Programmatic', 'Strategy', 'Video'],
  },
  {
    teamName: 'Madison Square Garden Group',
    people: [
      'Adam Gerber',
      'Alisa Suarez',
      'Christopher Rynn',
      'Danielle Marble',
      'Gaëtane Bastien',
      'Gregory Bedik',
      'Justin Barton',
      'Katelyn Pulling',
      'Kathryn Ernst',
      'Mary Hutson',
      'Maura Vananzo Abdulkarim',
      'Melissa Rubio',
      'Vanessa Robins',
    ],
    duties: ['Digital', 'MSG Sphere Las Vegas', 'OTT / CTV', 'Programmatic', 'Social Media'],
  },
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

  console.log('Found Horizon Media NY: ' + horizonNY.id + '\n');

  for (const data of teamData) {
    console.log('=== ' + data.teamName + ' ===');

    // Find the team
    const team = await prisma.team.findFirst({
      where: {
        companyId: horizonNY.id,
        name: data.teamName
      }
    });

    if (!team) {
      console.log('Team not found: ' + data.teamName);
      continue;
    }

    console.log('Team ID: ' + team.id);

    // Add people to team
    console.log('\nAdding people:');
    for (const personName of data.people) {
      const nameParts = personName.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');

      // Find or create contact
      let contact = await prisma.contact.findFirst({
        where: {
          firstName: { equals: firstName, mode: 'insensitive' },
          lastName: { equals: lastName, mode: 'insensitive' },
          companyId: horizonNY.id
        }
      });

      if (!contact) {
        // Try finding without company restriction
        contact = await prisma.contact.findFirst({
          where: {
            firstName: { equals: firstName, mode: 'insensitive' },
            lastName: { equals: lastName, mode: 'insensitive' }
          }
        });
      }

      if (!contact) {
        // Create new contact
        contact = await prisma.contact.create({
          data: {
            id: createId(),
            firstName,
            lastName,
            fullName: personName,
            title: '',
            seniority: 'SPECIALIST',
            companyId: horizonNY.id,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        console.log('  Created contact: ' + personName);
      }

      // Link contact to team
      const existingLink = await prisma.contactTeam.findFirst({
        where: {
          contactId: contact.id,
          teamId: team.id
        }
      });

      if (!existingLink) {
        await prisma.contactTeam.create({
          data: {
            id: createId(),
            contactId: contact.id,
            teamId: team.id,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        console.log('  Linked: ' + personName);
      } else {
        console.log('  Already linked: ' + personName);
      }
    }

    // Add duties to team
    console.log('\nAdding duties:');
    for (const dutyName of data.duties) {
      // Determine category - most are MEDIA_TYPE, but specific things like "MSG Sphere Las Vegas" are BRAND
      const category = dutyName === 'MSG Sphere Las Vegas' ? 'BRAND' : 'MEDIA_TYPE';

      // Find or create duty
      let duty = await prisma.duty.findFirst({
        where: {
          name: { equals: dutyName, mode: 'insensitive' }
        }
      });

      if (!duty) {
        duty = await prisma.duty.create({
          data: {
            id: createId(),
            name: dutyName,
            category: category,
            isGlobal: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        console.log('  Created duty: ' + dutyName);
      }

      // Link duty to team
      const existingDutyLink = await prisma.teamDuty.findFirst({
        where: {
          teamId: team.id,
          dutyId: duty.id
        }
      });

      if (!existingDutyLink) {
        await prisma.teamDuty.create({
          data: {
            id: createId(),
            teamId: team.id,
            dutyId: duty.id,
            createdAt: new Date()
          }
        });
        console.log('  Linked duty: ' + dutyName);
      } else {
        console.log('  Already linked: ' + dutyName);
      }
    }

    console.log('');
  }

  // Summary
  for (const data of teamData) {
    const team = await prisma.team.findFirst({
      where: { companyId: horizonNY.id, name: data.teamName },
      include: {
        _count: {
          select: {
            ContactTeam: true,
            TeamDuty: true
          }
        }
      }
    });
    if (team) {
      console.log(data.teamName + ': ' + team._count.ContactTeam + ' people, ' + team._count.TeamDuty + ' duties');
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
