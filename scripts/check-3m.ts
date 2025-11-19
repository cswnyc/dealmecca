import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Search for 3M
  const companies = await prisma.company.findMany({
    where: {
      name: {
        contains: '3M',
        mode: 'insensitive'
      }
    },
    select: {
      id: true,
      name: true,
      companyType: true,
      verified: true
    }
  })

  console.log(`Found ${companies.length} companies matching '3M':`)
  companies.forEach(c => {
    console.log(`  - ${c.name} (${c.companyType}) - ${c.verified ? 'Verified' : 'Not verified'}`)
  })

  // Also check total advertiser count
  const advertiserCount = await prisma.company.count({
    where: {
      companyType: 'ADVERTISER'
    }
  })

  console.log(`\nTotal advertisers in database: ${advertiserCount}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
