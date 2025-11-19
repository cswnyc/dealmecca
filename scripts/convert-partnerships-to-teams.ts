import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting partnership to team conversion...\n');

  try {
    // Find WPP Media London
    const wppLondon = await prisma.company.findFirst({
      where: { name: 'WPP Media London' }
    });

    if (!wppLondon) {
      console.error('WPP Media London not found!');
      return;
    }

    console.log(`Found WPP Media London: ${wppLondon.id}\n`);

    // Find all active partnerships where WPP London is the agency
    const partnerships = await prisma.companyPartnership.findMany({
      where: {
        agencyId: wppLondon.id,
        isActive: true
      },
      include: {
        advertiser: true,
        PartnershipContact: {
          include: {
            contact: true
          }
        },
        PartnershipDuty: {
          include: {
            duty: true
          }
        }
      }
    });

    console.log(`Found ${partnerships.length} active partnerships to convert:\n`);

    for (const partnership of partnerships) {
      console.log(`\n=== Converting ${partnership.advertiser.name} ===`);

      // 1. Create the Team record
      const team = await prisma.team.create({
        data: {
          name: partnership.advertiser.name,
          companyId: wppLondon.id,
          clientCompanyId: partnership.advertiserId,
          type: 'ADVERTISER_TEAM',
          description: buildTeamDescription(partnership),
          isActive: true
        }
      });

      console.log(`✓ Created team: ${team.name} (${team.id})`);

      // 2. Migrate PartnershipContact to ContactTeam
      let contactCount = 0;
      for (const pc of partnership.PartnershipContact) {
        await prisma.contactTeam.create({
          data: {
            contactId: pc.contactId,
            teamId: team.id,
            role: pc.role || undefined,
            isPrimary: pc.isPrimary
          }
        });
        contactCount++;
      }
      console.log(`✓ Migrated ${contactCount} contacts to team`);

      // 3. Migrate PartnershipDuty to TeamDuty
      let dutyCount = 0;
      for (const pd of partnership.PartnershipDuty) {
        await prisma.teamDuty.create({
          data: {
            teamId: team.id,
            dutyId: pd.dutyId
          }
        });
        dutyCount++;
      }
      console.log(`✓ Migrated ${dutyCount} duties to team`);

      // 4. Mark the partnership as inactive
      await prisma.companyPartnership.update({
        where: { id: partnership.id },
        data: { isActive: false }
      });
      console.log(`✓ Marked partnership as inactive`);
    }

    console.log('\n\n=== Conversion Summary ===');
    console.log(`Converted ${partnerships.length} partnerships to teams`);

    // Verify the results
    const teams = await prisma.team.findMany({
      where: {
        companyId: wppLondon.id,
        isActive: true
      },
      include: {
        clientCompany: {
          select: {
            id: true,
            name: true,
            logoUrl: true
          }
        },
        _count: {
          select: {
            ContactTeam: true,
            TeamDuty: true
          }
        }
      }
    });

    console.log(`\n${wppLondon.name} now has ${teams.length} active teams:`);
    for (const team of teams) {
      console.log(`\n  - ${team.name} (${team.type})`);
      if (team.clientCompany) {
        console.log(`    Client: ${team.clientCompany.name}`);
      }
      console.log(`    Members: ${team._count.ContactTeam}`);
      console.log(`    Duties: ${team._count.TeamDuty}`);
    }

  } catch (error) {
    console.error('Error during conversion:', error);
    throw error;
  }
}

function buildTeamDescription(partnership: any): string {
  const parts: string[] = [];

  if (partnership.relationshipType) {
    parts.push(`Type: ${partnership.relationshipType}`);
  }

  if (partnership.isAOR) {
    parts.push('Agency of Record (AOR)');
  }

  if (partnership.services && partnership.services.length > 0) {
    parts.push(`Services: ${partnership.services.join(', ')}`);
  }

  if (partnership.notes) {
    parts.push(partnership.notes);
  }

  if (partnership.startDate) {
    parts.push(`Started: ${new Date(partnership.startDate).toLocaleDateString()}`);
  }

  return parts.join(' | ') || 'Client team';
}

main()
  .then(async () => {
    console.log('\n✅ Migration completed successfully!');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Migration failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
