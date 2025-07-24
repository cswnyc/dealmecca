import { hash } from 'bcryptjs'
import { prisma } from '../lib/prisma'
import { seedForumCategories } from './seeds/forum-categories'

async function main() {
  console.log('Starting to seed the database...')

  try {
    // First clear existing data
    console.log('Clearing existing data...')
    await prisma.contact.deleteMany()
    await prisma.company.deleteMany()
    console.log('✅ Cleared existing data')
    
    console.log('Creating companies...')
    
    // Create major holding companies
    console.log('Creating WPP Group...')
    const wpp = await prisma.company.create({
      data: {
        name: 'WPP Group',
        slug: 'wpp-group',
        companyType: 'MEDIA_HOLDING_COMPANY',
        industry: 'ENTERTAINMENT_MEDIA',
        description: 'Global advertising and marketing services company',
        website: 'https://www.wpp.com',
        city: 'New York',
        state: 'NY',
        region: 'NORTHEAST',
        country: 'US',
        employeeCount: 'ENTERPRISE_1001_5000',
        revenueRange: 'OVER_1B',
        verified: true,
        dataQuality: 'PREMIUM',
        lastVerified: new Date(),
      },
    })
    console.log('✅ Created WPP Group')

    console.log('Creating Omnicom Group...')
    const omnicom = await prisma.company.create({
      data: {
        name: 'Omnicom Group',
        slug: 'omnicom-group',
        companyType: 'MEDIA_HOLDING_COMPANY',
        industry: 'ENTERTAINMENT_MEDIA',
        description: 'Global advertising and marketing communications company',
        website: 'https://www.omnicomgroup.com',
        city: 'New York',
        state: 'NY',
        region: 'NORTHEAST',
        country: 'US',
        employeeCount: 'ENTERPRISE_1001_5000',
        revenueRange: 'OVER_1B',
        verified: true,
        dataQuality: 'PREMIUM',
        lastVerified: new Date(),
      },
    })
    console.log('✅ Created Omnicom Group')

    const publicis = await prisma.company.create({
      data: {
        name: 'Publicis Groupe',
        slug: 'publicis-groupe',
        companyType: 'MEDIA_HOLDING_COMPANY',
        industry: 'ENTERTAINMENT_MEDIA',
        description: 'French multinational advertising and public relations company',
        website: 'https://www.publicisgroupe.com',
        city: 'New York',
        state: 'NY',
        region: 'NORTHEAST',
        country: 'US',
        employeeCount: 'ENTERPRISE_1001_5000',
        revenueRange: 'OVER_1B',
        verified: true,
        dataQuality: 'PREMIUM',
        lastVerified: new Date(),
      },
    })

    const interpublic = await prisma.company.create({
      data: {
        name: 'Interpublic Group',
        slug: 'interpublic-group',
        companyType: 'MEDIA_HOLDING_COMPANY',
        industry: 'ENTERTAINMENT_MEDIA',
        description: 'American publicly traded advertising company',
        website: 'https://www.interpublic.com',
        city: 'New York',
        state: 'NY',
        region: 'NORTHEAST',
        country: 'US',
        employeeCount: 'ENTERPRISE_1001_5000',
        revenueRange: 'OVER_1B',
        verified: true,
        dataQuality: 'PREMIUM',
        lastVerified: new Date(),
      },
    })

    // Create subsidiary agencies
    const groupm = await prisma.company.create({
      data: {
        name: 'GroupM',
        slug: 'groupm',
        companyType: 'INDEPENDENT_AGENCY',
        agencyType: 'MEDIA_PLANNING',
        industry: 'ENTERTAINMENT_MEDIA',
        description: 'Media investment group and subsidiary of WPP',
        website: 'https://www.groupm.com',
        city: 'New York',
        state: 'NY',
        region: 'NORTHEAST',
        country: 'US',
        employeeCount: 'LARGE_201_1000',
        revenueRange: 'RANGE_500M_1B',
        parentCompanyId: wpp.id,
        verified: true,
        dataQuality: 'VERIFIED',
        lastVerified: new Date(),
      },
    })

    const mindshare = await prisma.company.create({
      data: {
        name: 'Mindshare',
        slug: 'mindshare',
        companyType: 'INDEPENDENT_AGENCY',
        agencyType: 'MEDIA_PLANNING',
        industry: 'ENTERTAINMENT_MEDIA',
        description: 'Global media agency network, part of GroupM',
        website: 'https://www.mindshareworld.com',
        city: 'New York',
        state: 'NY',
        region: 'NORTHEAST',
        country: 'US',
        employeeCount: 'LARGE_201_1000',
        revenueRange: 'RANGE_500M_1B',
        parentCompanyId: groupm.id,
        verified: true,
        dataQuality: 'VERIFIED',
        lastVerified: new Date(),
      },
    })

    const mediacom = await prisma.company.create({
      data: {
        name: 'MediaCom',
        slug: 'mediacom',
        companyType: 'INDEPENDENT_AGENCY',
        agencyType: 'MEDIA_PLANNING',
        industry: 'ENTERTAINMENT_MEDIA',
        description: 'Global media communications specialist, part of GroupM',
        website: 'https://www.mediacom.com',
        city: 'New York',
        state: 'NY',
        region: 'NORTHEAST',
        country: 'US',
        employeeCount: 'LARGE_201_1000',
        revenueRange: 'RANGE_500M_1B',
        parentCompanyId: groupm.id,
        verified: true,
        dataQuality: 'VERIFIED',
        lastVerified: new Date(),
      },
    })

    const omg = await prisma.company.create({
      data: {
        name: 'Omnicom Media Group',
        slug: 'omnicom-media-group',
        companyType: 'INDEPENDENT_AGENCY',
        agencyType: 'MEDIA_PLANNING',
        industry: 'ENTERTAINMENT_MEDIA',
        description: 'Media services division of Omnicom Group',
        website: 'https://www.omglobal.com',
        city: 'New York',
        state: 'NY',
        region: 'NORTHEAST',
        country: 'US',
        employeeCount: 'LARGE_201_1000',
        revenueRange: 'RANGE_500M_1B',
        parentCompanyId: omnicom.id,
        verified: true,
        dataQuality: 'VERIFIED',
        lastVerified: new Date(),
      },
    })

    const phd = await prisma.company.create({
      data: {
        name: 'PHD Media',
        slug: 'phd-media',
        companyType: 'INDEPENDENT_AGENCY',
        agencyType: 'MEDIA_PLANNING',
        industry: 'ENTERTAINMENT_MEDIA',
        description: 'Global media communications agency, part of Omnicom Media Group',
        website: 'https://www.phdmedia.com',
        city: 'New York',
        state: 'NY',
        region: 'NORTHEAST',
        country: 'US',
        employeeCount: 'MEDIUM_51_200',
        revenueRange: 'RANGE_5M_25M',
        parentCompanyId: omg.id,
        verified: true,
        dataQuality: 'VERIFIED',
        lastVerified: new Date(),
      },
    })

    console.log('Creating contacts...')

    // Create contacts for companies
    await prisma.contact.createMany({
      data: [
        // WPP Group contacts
        {
          firstName: 'Mark',
          lastName: 'Read',
          fullName: 'Mark Read',
          title: 'CEO',
          email: 'mark.read@wpp.com',
          companyId: wpp.id,
          department: 'LEADERSHIP',
          seniority: 'C_LEVEL',
          primaryRole: 'DECISION_MAKER',
          verified: true,
          dataQuality: 'PREMIUM',
          isActive: true,
        },
        {
          firstName: 'John',
          lastName: 'Rogers',
          fullName: 'John Rogers',
          title: 'CFO',
          email: 'john.rogers@wpp.com',
          companyId: wpp.id,
          department: 'FINANCE',
          seniority: 'C_LEVEL',
          primaryRole: 'BUDGET_HOLDER',
          verified: true,
          dataQuality: 'PREMIUM',
          isActive: true,
        },
        // GroupM contacts
        {
          firstName: 'Christian',
          lastName: 'Juhl',
          fullName: 'Christian Juhl',
          title: 'Global CEO',
          email: 'christian.juhl@groupm.com',
          companyId: groupm.id,
          department: 'LEADERSHIP',
          seniority: 'C_LEVEL',
          primaryRole: 'DECISION_MAKER',
          verified: true,
          dataQuality: 'VERIFIED',
          isActive: true,
        },
        {
          firstName: 'Kieley',
          lastName: 'Taylor',
          fullName: 'Kieley Taylor',
          title: 'North America CEO',
          email: 'kieley.taylor@groupm.com',
          companyId: groupm.id,
          department: 'LEADERSHIP',
          seniority: 'VP',
          primaryRole: 'STRATEGIST',
          verified: true,
          dataQuality: 'VERIFIED',
          isActive: true,
        },
        // Mindshare contacts
        {
          firstName: 'Adam',
          lastName: 'Gerhart',
          fullName: 'Adam Gerhart',
          title: 'US CEO',
          email: 'adam.gerhart@mindshare.com',
          companyId: mindshare.id,
          department: 'LEADERSHIP',
          seniority: 'C_LEVEL',
          primaryRole: 'DECISION_MAKER',
          verified: true,
          dataQuality: 'VERIFIED',
          isActive: true,
        },
        // Omnicom contacts
        {
          firstName: 'John',
          lastName: 'Wren',
          fullName: 'John Wren',
          title: 'Chairman & CEO',
          email: 'john.wren@omnicom.com',
          companyId: omnicom.id,
          department: 'LEADERSHIP',
          seniority: 'C_LEVEL',
          primaryRole: 'DECISION_MAKER',
          verified: true,
          dataQuality: 'PREMIUM',
          isActive: true,
        },
        {
          firstName: 'George',
          lastName: 'Manas',
          fullName: 'George Manas',
          title: 'Global CEO',
          email: 'george.manas@omglobal.com',
          companyId: omg.id,
          department: 'LEADERSHIP',
          seniority: 'C_LEVEL',
          primaryRole: 'DECISION_MAKER',
          verified: true,
          dataQuality: 'VERIFIED',
          isActive: true,
        },
        // PHD contacts
        {
          firstName: 'Mike',
          lastName: 'Cooper',
          fullName: 'Mike Cooper',
          title: 'US CEO',
          email: 'mike.cooper@phdmedia.com',
          companyId: phd.id,
          department: 'LEADERSHIP',
          seniority: 'C_LEVEL',
          primaryRole: 'DECISION_MAKER',
          verified: true,
          dataQuality: 'VERIFIED',
          isActive: true,
        },
      ],
    })

    // Seed forum categories
    await seedForumCategories()

    console.log('Database seeding completed successfully')
    console.log(`Created ${await prisma.company.count()} companies`)
    console.log(`Created ${await prisma.contact.count()} contacts`)
  } catch (error) {
    console.error('Error seeding database:', error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  }) 