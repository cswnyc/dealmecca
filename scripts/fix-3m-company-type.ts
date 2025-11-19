import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Fixing 3M company type from TECH_VENDOR to ADVERTISER...')

  const result = await prisma.company.updateMany({
    where: {
      name: {
        contains: '3M',
        mode: 'insensitive'
      },
      companyType: 'TECH_VENDOR'
    },
    data: {
      companyType: 'ADVERTISER'
    }
  })

  console.log(`✅ Updated ${result.count} company(ies)`)

  // Verify the update
  const updated = await prisma.company.findMany({
    where: {
      name: {
        contains: '3M',
        mode: 'insensitive'
      }
    },
    select: {
      id: true,
      name: true,
      companyType: true
    }
  })

  console.log('\nUpdated companies:')
  updated.forEach(c => {
    console.log(`  - ${c.name}: ${c.companyType}`)
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
