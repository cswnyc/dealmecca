import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

// Utility function
function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function randomChoices<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

async function main() {
  console.log('🚀 Starting Enhanced Database Seeding for DealMecca V1...')
  
  try {
    // Clear existing data
    console.log('🗑️ Clearing existing data...')
    await prisma.forumPost.deleteMany()
    await prisma.forumCategory.deleteMany()
    await prisma.event.deleteMany()
    await prisma.contact.deleteMany()
    await prisma.company.deleteMany()
    await prisma.user.deleteMany()
    console.log('✅ Cleared existing data')
    
    // Create test user
    console.log('Creating test user...')
    const hashedPassword = await hash('password123', 12)
    
    await prisma.user.create({
      data: {
        email: 'pro@dealmecca.pro',
        name: 'Pro User',
        password: hashedPassword,
        role: 'PRO',
        subscriptionTier: 'PRO',
      }
    })
    console.log('✅ Created test user: pro@dealmecca.pro')
    
    // Create companies
    console.log('Creating 110 companies...')
    const companies = []
    
    // Create realistic company distribution
    const companyData = [
      // Holding Companies (8)
      { name: 'WPP Group', type: 'MEDIA_HOLDING_COMPANY', employees: 'MEGA_5000_PLUS', revenue: 'OVER_1B' },
      { name: 'Omnicom Group', type: 'MEDIA_HOLDING_COMPANY', employees: 'MEGA_5000_PLUS', revenue: 'OVER_1B' },
      { name: 'Publicis Groupe', type: 'MEDIA_HOLDING_COMPANY', employees: 'MEGA_5000_PLUS', revenue: 'OVER_1B' },
      { name: 'IPG', type: 'MEDIA_HOLDING_COMPANY', employees: 'MEGA_5000_PLUS', revenue: 'OVER_1B' },
      { name: 'Dentsu', type: 'MEDIA_HOLDING_COMPANY', employees: 'MEGA_5000_PLUS', revenue: 'OVER_1B' },
      { name: 'Havas', type: 'MEDIA_HOLDING_COMPANY', employees: 'ENTERPRISE_1001_5000', revenue: 'RANGE_500M_1B' },
      { name: 'MDC Partners', type: 'MEDIA_HOLDING_COMPANY', employees: 'LARGE_201_1000', revenue: 'RANGE_100M_500M' },
      { name: 'Engine Group', type: 'MEDIA_HOLDING_COMPANY', employees: 'LARGE_201_1000', revenue: 'RANGE_100M_500M' },
      
      // Independent Agencies (25)
      { name: 'Horizon Media', type: 'INDEPENDENT_AGENCY', employees: 'LARGE_201_1000', revenue: 'RANGE_100M_500M' },
      { name: 'Mindshare', type: 'INDEPENDENT_AGENCY', employees: 'LARGE_201_1000', revenue: 'RANGE_500M_1B' },
      { name: 'MediaCom', type: 'INDEPENDENT_AGENCY', employees: 'LARGE_201_1000', revenue: 'RANGE_500M_1B' },
      { name: 'OMD', type: 'INDEPENDENT_AGENCY', employees: 'LARGE_201_1000', revenue: 'RANGE_500M_1B' },
      { name: 'PHD', type: 'INDEPENDENT_AGENCY', employees: 'MEDIUM_51_200', revenue: 'RANGE_100M_500M' },
      { name: 'Zenith', type: 'INDEPENDENT_AGENCY', employees: 'MEDIUM_51_200', revenue: 'RANGE_100M_500M' },
      { name: 'Starcom', type: 'INDEPENDENT_AGENCY', employees: 'LARGE_201_1000', revenue: 'RANGE_100M_500M' },
      { name: 'Spark Foundry', type: 'INDEPENDENT_AGENCY', employees: 'MEDIUM_51_200', revenue: 'RANGE_100M_500M' },
    ]
    
    // Add more companies programmatically
    for (let i = companyData.length; i < 110; i++) {
      const types = ['INDEPENDENT_AGENCY', 'NATIONAL_ADVERTISER', 'PUBLISHER', 'ADTECH_VENDOR', 'BROADCASTER']
      const employees = ['SMALL_11_50', 'MEDIUM_51_200', 'LARGE_201_1000', 'ENTERPRISE_1001_5000']
      const revenues = ['RANGE_1M_5M', 'RANGE_5M_25M', 'RANGE_25M_100M', 'RANGE_100M_500M']
      
      companyData.push({
        name: `Company ${i + 1}`,
        type: randomChoice(types),
        employees: randomChoice(employees),
        revenue: randomChoice(revenues)
      })
    }
    
    for (const data of companyData) {
      const regions = ['NORTHEAST', 'SOUTHEAST', 'MIDWEST', 'SOUTHWEST', 'WEST']
      const states = ['NY', 'CA', 'TX', 'FL', 'IL']
      const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami']
      
      const company = await prisma.company.create({
        data: {
          name: data.name,
          slug: data.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          companyType: data.type as any,
          industry: 'ENTERTAINMENT_MEDIA',
          description: `Leading ${data.type.toLowerCase()} company`,
          website: `https://www.${data.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
          city: randomChoice(cities),
          state: randomChoice(states),
          region: randomChoice(regions) as any,
          country: 'US',
          employeeCount: data.employees as any,
          revenueRange: data.revenue as any,
          verified: Math.random() > 0.2,
          dataQuality: randomChoice(['BASIC', 'VERIFIED', 'PREMIUM']) as any,
        }
      })
      companies.push(company)
    }
    
    console.log(`✅ Created ${companies.length} companies`)
    
    // Create contacts (5-15 per company)
    console.log('Creating contacts...')
    let totalContacts = 0
    
    const firstNames = ['Sarah', 'Michael', 'Jessica', 'David', 'Amanda', 'Robert', 'Lisa', 'James', 'Emily', 'Christopher']
    const lastNames = ['Johnson', 'Smith', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez']
    const titles = ['CEO', 'VP of Marketing', 'Media Director', 'Account Manager', 'Senior Analyst', 'Marketing Manager']
    const departments = ['LEADERSHIP', 'SALES', 'MARKETING', 'MEDIA_PLANNING', 'STRATEGY_PLANNING']
    const seniorities = ['C_LEVEL', 'VP', 'DIRECTOR', 'MANAGER', 'SENIOR_SPECIALIST', 'SPECIALIST']
    
    for (const company of companies) {
      const contactCount = Math.floor(Math.random() * 11) + 5 // 5-15 contacts
      const contacts = []
      
      for (let i = 0; i < contactCount; i++) {
        const firstName = randomChoice(firstNames)
        const lastName = randomChoice(lastNames)
        
        contacts.push({
          firstName,
          lastName,
          fullName: `${firstName} ${lastName}`,
          title: randomChoice(titles),
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
          companyId: company.id,
          department: randomChoice(departments) as any,
          seniority: randomChoice(seniorities) as any,
          primaryRole: randomChoice(['DECISION_MAKER', 'INFLUENCER', 'STRATEGIST', 'MEDIA_PLANNER', 'ACCOUNT_MANAGER', 'BUDGET_HOLDER']) as any,
          verified: Math.random() > 0.3,
          dataQuality: randomChoice(['BASIC', 'VERIFIED', 'PREMIUM']) as any,
          isActive: Math.random() > 0.1,
        })
      }
      
      await prisma.contact.createMany({ data: contacts })
      totalContacts += contacts.length
    }
    
    console.log(`✅ Created ${totalContacts} contacts`)
    
    // Create events
    console.log('Creating events...')
    const eventNames = [
      'Advertising Week New York 2024', 'CES 2024', 'NAB Show 2024', 'SXSW 2024', 'Cannes Lions 2024',
      'NewFronts 2024', 'Upfronts 2024', 'Digital Marketing Summit', 'Media Innovation Conference',
      'AdTech Summit', 'Programmatic Pioneers', 'Social Media Marketing World', 'Content Marketing Conference',
      'MarTech Conference', 'Brand Summit', 'Retail Media Summit', 'Connected TV Summit', 'Performance Marketing Expo'
    ]
    
    for (let i = 0; i < 25; i++) {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 365))
      
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 3) + 1)
      
      await prisma.event.create({
        data: {
          name: i < eventNames.length ? eventNames[i] : `Industry Event ${i + 1}`,
          description: 'Premier industry event bringing together media professionals and marketers.',
          website: `https://event${i + 1}.com`,
          startDate,
          endDate,
          location: 'Convention Center, New York, NY',
          venue: 'Convention Center',
          category: randomChoice(['CONFERENCE', 'TRADE_SHOW', 'NETWORKING', 'WORKSHOP']) as any,
          industry: 'DIGITAL_ADVERTISING,PROGRAMMATIC,ADTECH',
          estimatedCost: Math.floor(Math.random() * 2000) + 500,
          attendeeCount: Math.floor(Math.random() * 5000) + 1000,
          capacity: Math.floor(Math.random() * 8000) + 2000,
          isVirtual: Math.random() > 0.8,
          isHybrid: Math.random() > 0.7,
          status: randomChoice(['PUBLISHED', 'COMPLETED']) as any,
          eventType: randomChoice(['CONFERENCE', 'WORKSHOP', 'NETWORKING']) as any,
        }
      })
    }
    
    console.log(`✅ Created 25 events`)
    
    // Create forum categories
    console.log('Creating forum content...')
    const categories = [
      { name: 'Industry News', slug: 'industry-news', description: 'Latest updates from the media industry' },
      { name: 'Deal Discussions', slug: 'deal-discussions', description: 'Share and discuss media deals' },
      { name: 'Career Advice', slug: 'career-advice', description: 'Professional development and networking' },
      { name: 'Technology & Innovation', slug: 'tech-innovation', description: 'AdTech, MarTech, and digital transformation' },
      { name: 'Market Intelligence', slug: 'market-intelligence', description: 'Data, trends, and market insights' }
    ]
    
    const createdCategories: any[] = []
    for (const category of categories) {
      const created = await prisma.forumCategory.create({
        data: {
          name: category.name,
          slug: category.slug,
          description: category.description,
          icon: 'message-square',
          color: '#3B82F6',
          order: createdCategories.length + 1,
          isActive: true
        }
      })
      createdCategories.push(created)
    }
    
    // Create forum posts
    const user = await prisma.user.findFirst({ where: { email: 'pro@dealmecca.pro' } })
    const postTitles = [
      'Q1 2024 Media Spending Trends - What We\'re Seeing',
      'Best Practices for CTV Advertising in 2024',
      'How AI is Changing Media Planning',
      'Programmatic vs Direct Deals: ROI Analysis',
      'Building Relationships with Key Decision Makers',
      'Upcoming Industry Events Worth Attending',
      'New Privacy Regulations Impact on Targeting',
      'Social Media Advertising Benchmarks',
      'Negotiating Better Rates with Publishers',
      'Cross-Platform Attribution Challenges'
    ]
    
    let totalPosts = 0
    for (const category of createdCategories) {
      const postCount = Math.floor(Math.random() * 8) + 3 // 3-10 posts per category
      
      for (let i = 0; i < postCount; i++) {
        const title = randomChoice(postTitles)
        
                  await prisma.forumPost.create({
            data: {
              title,
              content: `This is a detailed discussion about ${title.toLowerCase()}. Looking forward to hearing everyone's thoughts and experiences on this topic.`,
              slug: `${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}-${i}`,
              authorId: user!.id,
              categoryId: category.id,
            isAnonymous: Math.random() > 0.8,
            tags: JSON.stringify(['media', 'advertising', 'strategy']),
            mediaType: JSON.stringify([]),
            urgency: randomChoice(['LOW', 'MEDIUM', 'HIGH']) as any,
            views: Math.floor(Math.random() * 500),
            upvotes: Math.floor(Math.random() * 50),
            downvotes: Math.floor(Math.random() * 5),
          }
        })
        
        totalPosts++
      }
    }
    
    console.log(`✅ Created ${createdCategories.length} forum categories and ${totalPosts} posts`)
    
    // Final stats
    console.log('\n📊 Final Database Stats:')
    console.log(`Companies: ${await prisma.company.count()}`)
    console.log(`Contacts: ${await prisma.contact.count()}`)
    console.log(`Events: ${await prisma.event.count()}`)
    console.log(`Forum Categories: ${await prisma.forumCategory.count()}`)
    console.log(`Forum Posts: ${await prisma.forumPost.count()}`)
    console.log(`Users: ${await prisma.user.count()}`)
    
    console.log('\n🎉 Enhanced database seeding completed successfully!')
    console.log('🔗 Test login: pro@dealmecca.pro / password123')
    
  } catch (error) {
    console.error('❌ Error during enhanced seeding:', error)
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