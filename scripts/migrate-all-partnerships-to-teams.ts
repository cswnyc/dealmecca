import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface MigrationLog {
  partnershipId: string
  teamId: string
  agencyName: string
  clientName: string
  contactsMigrated: number
  dutiesMigrated: number
}

async function main() {
  console.log('🚀 Starting migration of all partnerships to teams...\n')

  const migrationLog: MigrationLog[] = []
  let totalPartnerships = 0
  let totalTeamsCreated = 0
  let totalContactsMigrated = 0
  let totalDutiesMigrated = 0
  let errors: Array<{ partnershipId: string; error: string }> = []

  try {
    // Step 1: Query all active AGENCY_CLIENT partnerships
    console.log('📊 Querying active partnerships...')
    const partnerships = await prisma.companyPartnership.findMany({
      where: {
        isActive: true,
        relationshipType: 'AGENCY_CLIENT'
      },
      include: {
        agency: {
          select: {
            id: true,
            name: true,
            companyType: true
          }
        },
        advertiser: {
          select: {
            id: true,
            name: true,
            companyType: true,
            logoUrl: true,
            industry: true
          }
        },
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
    })

    totalPartnerships = partnerships.length
    console.log(`✅ Found ${totalPartnerships} active partnerships to migrate\n`)

    // Step 2: Migrate each partnership
    for (const partnership of partnerships) {
      try {
        console.log(`\n📦 Processing: ${partnership.agency.name} → ${partnership.advertiser.name}`)

        // Build team description from partnership metadata
        const descriptionParts: string[] = []

        if (partnership.relationshipType) {
          descriptionParts.push(`Relationship: ${partnership.relationshipType.replace(/_/g, ' ')}`)
        }

        if (partnership.isAOR) {
          descriptionParts.push('Agency of Record (AOR)')
        }

        if (partnership.services) {
          descriptionParts.push(`Services: ${partnership.services}`)
        }

        if (partnership.startDate) {
          descriptionParts.push(`Start Date: ${partnership.startDate.toISOString().split('T')[0]}`)
        }

        if (partnership.endDate) {
          descriptionParts.push(`End Date: ${partnership.endDate.toISOString().split('T')[0]}`)
        }

        if (partnership.contractValue) {
          descriptionParts.push(`Contract Value: $${partnership.contractValue.toLocaleString()}`)
        }

        if (partnership.notes) {
          descriptionParts.push(`Notes: ${partnership.notes}`)
        }

        const description = descriptionParts.length > 0
          ? descriptionParts.join(' | ')
          : `Client team for ${partnership.advertiser.name}`

        // Check if team already exists (in case script is re-run)
        const existingTeam = await prisma.team.findFirst({
          where: {
            companyId: partnership.agencyId,
            clientCompanyId: partnership.advertiserId,
            type: 'ADVERTISER_TEAM'
          }
        })

        let team
        if (existingTeam) {
          console.log(`   ⚠️  Team already exists (ID: ${existingTeam.id}), skipping creation`)
          team = existingTeam
        } else {
          // Create the team
          team = await prisma.team.create({
            data: {
              name: partnership.advertiser.name,
              companyId: partnership.agencyId,
              clientCompanyId: partnership.advertiserId,
              type: 'ADVERTISER_TEAM',
              description: description,
              isActive: partnership.isActive,
              createdAt: partnership.createdAt,
              updatedAt: partnership.updatedAt
            }
          })
          totalTeamsCreated++
          console.log(`   ✅ Created team (ID: ${team.id})`)
        }

        let contactsMigrated = 0
        let dutiesMigrated = 0

        // Migrate PartnershipContact → ContactTeam
        for (const partnershipContact of partnership.PartnershipContact) {
          // Check if already migrated
          const existingContactTeam = await prisma.contactTeam.findFirst({
            where: {
              contactId: partnershipContact.contactId,
              teamId: team.id
            }
          })

          if (!existingContactTeam) {
            await prisma.contactTeam.create({
              data: {
                contactId: partnershipContact.contactId,
                teamId: team.id,
                role: partnershipContact.role,
                isPrimary: partnershipContact.isPrimary || false
              }
            })
            contactsMigrated++
            totalContactsMigrated++
          }
        }

        if (contactsMigrated > 0) {
          console.log(`   👥 Migrated ${contactsMigrated} contact(s)`)
        }

        // Migrate PartnershipDuty → TeamDuty
        for (const partnershipDuty of partnership.PartnershipDuty) {
          // Check if already migrated
          const existingTeamDuty = await prisma.teamDuty.findFirst({
            where: {
              dutyId: partnershipDuty.dutyId,
              teamId: team.id
            }
          })

          if (!existingTeamDuty) {
            await prisma.teamDuty.create({
              data: {
                dutyId: partnershipDuty.dutyId,
                teamId: team.id
              }
            })
            dutiesMigrated++
            totalDutiesMigrated++
          }
        }

        if (dutiesMigrated > 0) {
          console.log(`   🎯 Migrated ${dutiesMigrated} duty/duties`)
        }

        // Mark original partnership as inactive
        await prisma.companyPartnership.update({
          where: { id: partnership.id },
          data: { isActive: false }
        })
        console.log(`   🔒 Marked partnership as inactive`)

        // Log this migration
        migrationLog.push({
          partnershipId: partnership.id,
          teamId: team.id,
          agencyName: partnership.agency.name,
          clientName: partnership.advertiser.name,
          contactsMigrated,
          dutiesMigrated
        })

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        console.error(`   ❌ Error migrating partnership ${partnership.id}: ${errorMsg}`)
        errors.push({
          partnershipId: partnership.id,
          error: errorMsg
        })
      }
    }

    // Step 3: Print summary
    console.log('\n\n' + '='.repeat(80))
    console.log('📊 MIGRATION SUMMARY')
    console.log('='.repeat(80))
    console.log(`Total partnerships processed:  ${totalPartnerships}`)
    console.log(`Teams created:                 ${totalTeamsCreated}`)
    console.log(`Contacts migrated:             ${totalContactsMigrated}`)
    console.log(`Duties migrated:               ${totalDutiesMigrated}`)
    console.log(`Errors:                        ${errors.length}`)
    console.log('='.repeat(80))

    if (errors.length > 0) {
      console.log('\n❌ ERRORS:')
      errors.forEach(e => {
        console.log(`   Partnership ${e.partnershipId}: ${e.error}`)
      })
    }

    // Step 4: Save migration log to file
    const fs = require('fs')
    const logFilename = `migration-log-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
    fs.writeFileSync(
      logFilename,
      JSON.stringify({
        timestamp: new Date().toISOString(),
        summary: {
          totalPartnerships,
          totalTeamsCreated,
          totalContactsMigrated,
          totalDutiesMigrated,
          errors: errors.length
        },
        migrations: migrationLog,
        errors
      }, null, 2)
    )
    console.log(`\n💾 Migration log saved to: ${logFilename}`)

    // Step 5: Verification queries
    console.log('\n\n' + '='.repeat(80))
    console.log('🔍 POST-MIGRATION VERIFICATION')
    console.log('='.repeat(80))

    const totalTeams = await prisma.team.count()
    const advertiserTeams = await prisma.team.count({
      where: { type: 'ADVERTISER_TEAM' }
    })
    const activePartnerships = await prisma.companyPartnership.count({
      where: { isActive: true }
    })
    const inactivePartnerships = await prisma.companyPartnership.count({
      where: { isActive: false }
    })
    const totalContactTeams = await prisma.contactTeam.count()
    const totalTeamDuties = await prisma.teamDuty.count()

    console.log(`Total teams in database:              ${totalTeams}`)
    console.log(`ADVERTISER_TEAM teams:                ${advertiserTeams}`)
    console.log(`Active partnerships remaining:        ${activePartnerships}`)
    console.log(`Inactive partnerships (migrated):     ${inactivePartnerships}`)
    console.log(`Total ContactTeam records:            ${totalContactTeams}`)
    console.log(`Total TeamDuty records:               ${totalTeamDuties}`)
    console.log('='.repeat(80))

    console.log('\n✅ Migration completed successfully!')

  } catch (error) {
    console.error('\n❌ Fatal error during migration:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
