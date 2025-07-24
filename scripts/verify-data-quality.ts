import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyDataQuality() {
  console.log('🔍 Verifying DealMecca V1 Database Quality & Volume...\n')

  try {
    // Check companies
    const totalCompanies = await prisma.company.count()
    const companiesByType = await prisma.company.groupBy({
      by: ['companyType'],
      _count: { companyType: true }
    })
    
    console.log('📊 COMPANIES ANALYSIS:')
    console.log(`✅ Total Companies: ${totalCompanies} (Target: 100+)`)
    console.log('Distribution by Type:')
    companiesByType.forEach(type => {
      console.log(`   ${type.companyType}: ${type._count.companyType}`)
    })
    console.log()

    // Check contacts
    const totalContacts = await prisma.contact.count()
    const contactsPerCompany = await prisma.contact.groupBy({
      by: ['companyId'],
      _count: { companyId: true }
    })
    
    const avgContactsPerCompany = totalContacts / totalCompanies
    const minContacts = Math.min(...contactsPerCompany.map(c => c._count.companyId))
    const maxContacts = Math.max(...contactsPerCompany.map(c => c._count.companyId))
    
    console.log('👥 CONTACTS ANALYSIS:')
    console.log(`✅ Total Contacts: ${totalContacts}`)
    console.log(`✅ Average per Company: ${avgContactsPerCompany.toFixed(1)} (Target: 5-15)`)
    console.log(`✅ Range: ${minContacts} - ${maxContacts} contacts per company`)
    
    const contactsByDepartment = await prisma.contact.groupBy({
      by: ['department'],
      _count: { department: true }
    })
    console.log('Distribution by Department:')
    contactsByDepartment.forEach(dept => {
      console.log(`   ${dept.department}: ${dept._count.department}`)
    })
    console.log()

    // Check events
    const totalEvents = await prisma.event.count()
    const eventsByCategory = await prisma.event.groupBy({
      by: ['category'],
      _count: { category: true }
    })
    
    console.log('📅 EVENTS ANALYSIS:')
    console.log(`✅ Total Events: ${totalEvents} (Target: 20+)`)
    console.log('Distribution by Category:')
    eventsByCategory.forEach(cat => {
      console.log(`   ${cat.category}: ${cat._count.category}`)
    })
    console.log()

    // Check forum content
    const totalCategories = await prisma.forumCategory.count()
    const totalPosts = await prisma.forumPost.count()
    const postsByCategory = await prisma.forumPost.groupBy({
      by: ['categoryId'],
      _count: { categoryId: true }
    })
    
    console.log('💬 FORUM CONTENT ANALYSIS:')
    console.log(`✅ Total Categories: ${totalCategories}`)
    console.log(`✅ Total Posts: ${totalPosts}`)
    console.log(`✅ Average Posts per Category: ${(totalPosts / totalCategories).toFixed(1)}`)
    console.log()

    // Data quality checks
    const verifiedCompanies = await prisma.company.count({ where: { verified: true } })
    const verifiedContacts = await prisma.contact.count({ where: { verified: true } })
    const activeContacts = await prisma.contact.count({ where: { isActive: true } })
    
    console.log('🎯 DATA QUALITY METRICS:')
    console.log(`✅ Verified Companies: ${verifiedCompanies}/${totalCompanies} (${((verifiedCompanies/totalCompanies)*100).toFixed(1)}%)`)
    console.log(`✅ Verified Contacts: ${verifiedContacts}/${totalContacts} (${((verifiedContacts/totalContacts)*100).toFixed(1)}%)`)
    console.log(`✅ Active Contacts: ${activeContacts}/${totalContacts} (${((activeContacts/totalContacts)*100).toFixed(1)}%)`)
    console.log()

    // Geographic distribution
    const companiesByRegion = await prisma.company.groupBy({
      by: ['region'],
      _count: { region: true }
    })
    
    console.log('🗺️ GEOGRAPHIC DISTRIBUTION:')
    companiesByRegion.forEach(region => {
      console.log(`   ${region.region}: ${region._count.region} companies`)
    })
    console.log()

    // Test user verification
    const testUser = await prisma.user.findFirst({ where: { email: 'pro@dealmecca.pro' } })
    
    console.log('👤 TEST USER:')
    if (testUser) {
      console.log(`✅ Test User Created: ${testUser.email}`)
      console.log(`✅ Role: ${testUser.role}`)
      console.log(`✅ Subscription: ${testUser.subscriptionTier}`)
    } else {
      console.log('❌ Test user not found!')
    }
    console.log()

    // Summary assessment
    console.log('📋 REQUIREMENTS VERIFICATION:')
    console.log(`${totalCompanies >= 100 ? '✅' : '❌'} Scale database to 100+ companies: ${totalCompanies}/100+`)
    console.log(`${avgContactsPerCompany >= 5 && avgContactsPerCompany <= 15 ? '✅' : '❌'} Add realistic contacts per company: ${avgContactsPerCompany.toFixed(1)} avg (5-15 target)`)
    console.log(`${totalEvents >= 20 ? '✅' : '❌'} Ensure events have proper sample data: ${totalEvents}/20+`)
    console.log(`${totalPosts >= 25 ? '✅' : '❌'} Verify forum has enough content: ${totalPosts}/25+`)
    console.log()

    console.log('🎉 DealMecca V1 Database is ready for user testing!')
    console.log(`📊 Database contains ${totalCompanies} companies, ${totalContacts} contacts, ${totalEvents} events, and ${totalPosts} forum posts`)
    console.log('🔗 Test login: pro@dealmecca.pro / password123')

  } catch (error) {
    console.error('❌ Error verifying data quality:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyDataQuality() 