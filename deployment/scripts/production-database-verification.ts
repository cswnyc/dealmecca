#!/usr/bin/env npx tsx

/**
 * PRODUCTION DATABASE VERIFICATION
 * 
 * Immediate verification of production database state and data
 */

import { PrismaClient } from '@prisma/client'

const PROD_DATABASE_URL = 'postgresql://neondb_owner:npg_B3Sdq4aviYgN@ep-wild-lake-afcy495t-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: PROD_DATABASE_URL
    }
  }
});

async function verifyProductionDatabase() {
  console.log('🔍 PRODUCTION DATABASE VERIFICATION');
  console.log('===================================');
  console.log(`📅 Time: ${new Date().toLocaleString()}`);
  console.log(`🌐 Database: Neon PostgreSQL Production\n`);

  try {
    await prisma.$connect();
    console.log('✅ Connected to production database\n');

    // Check if tables exist by running queries
    console.log('📊 TABLE EXISTENCE & DATA VERIFICATION');
    console.log('======================================');

    // 1. Companies table verification
    try {
      const companiesCount = await prisma.company.count();
      const companiesSample = await prisma.company.findMany({ 
        take: 5,
        select: { id: true, name: true, industry: true, verified: true }
      });
      
      console.log(`✅ COMPANIES TABLE: EXISTS`);
      console.log(`   📊 Total Count: ${companiesCount}`);
      console.log(`   📋 Sample Companies:`);
      companiesSample.forEach((company: any) => {
        console.log(`      • ${company.name} (${company.industry}) - ${company.verified ? 'Verified' : 'Unverified'}`);
      });
      
      if (companiesCount >= 10) {
        console.log(`   🎯 Status: GOOD (${companiesCount} companies >= 10 expected)`);
      } else {
        console.log(`   ⚠️  Status: LOW (${companiesCount} companies < 10 expected)`);
      }
      
    } catch (error) {
      console.log(`❌ COMPANIES TABLE: ERROR - ${error}`);
    }

    console.log();

    // 2. Contacts table verification  
    try {
      const contactsCount = await prisma.contact.count();
      const contactsSample = await prisma.contact.findMany({
        take: 5,
        include: { company: { select: { name: true } } }
      });
      
      console.log(`✅ CONTACTS TABLE: EXISTS`);
      console.log(`   📊 Total Count: ${contactsCount}`);
      console.log(`   📋 Sample Contacts:`);
      contactsSample.forEach((contact: any) => {
        console.log(`      • ${contact.firstName} ${contact.lastName} at ${contact.company.name}`);
      });
      
    } catch (error) {
      console.log(`❌ CONTACTS TABLE: ERROR - ${error}`);
    }

    console.log();

    // 3. Events table verification
    try {
      const eventsCount = await prisma.event.count();
      const eventsSample = await prisma.event.findMany({
        take: 5,
        select: { id: true, name: true, location: true, startDate: true }
      });
      
      console.log(`✅ EVENTS TABLE: EXISTS`);
      console.log(`   📊 Total Count: ${eventsCount}`);
      console.log(`   📋 Sample Events:`);
      eventsSample.forEach(event => {
        console.log(`      • ${event.name} - ${event.location} (${event.startDate.toDateString()})`);
      });
      
      if (eventsCount >= 5) {
        console.log(`   🎯 Status: GOOD (${eventsCount} events)`);
      } else {
        console.log(`   ⚠️  Status: EMPTY (${eventsCount} events - should have sample events)`);
      }
      
    } catch (error) {
      console.log(`❌ EVENTS TABLE: ERROR - ${error}`);
    }

    console.log();

    // 4. Forum Posts table verification
    try {
      const postsCount = await prisma.forumPost.count();
      const postsSample = await prisma.forumPost.findMany({
        take: 5,
        include: { 
          category: { select: { name: true } },
          author: { select: { name: true } }
        }
      });
      
      console.log(`✅ FORUM POSTS TABLE: EXISTS`);
      console.log(`   📊 Total Count: ${postsCount}`);
      console.log(`   📋 Sample Posts:`);
      postsSample.forEach(post => {
        console.log(`      • ${post.title} by ${post.author.name} in ${post.category.name}`);
      });
      
    } catch (error) {
      console.log(`❌ FORUM POSTS TABLE: ERROR - ${error}`);
    }

    console.log();

    // 5. Forum Categories table verification
    try {
      const categoriesCount = await prisma.forumCategory.count();
      const categoriesSample = await prisma.forumCategory.findMany({
        take: 5,
        select: { name: true, description: true }
      });
      
      console.log(`✅ FORUM CATEGORIES TABLE: EXISTS`);
      console.log(`   📊 Total Count: ${categoriesCount}`);
      console.log(`   📋 Sample Categories:`);
      categoriesSample.forEach(category => {
        console.log(`      • ${category.name}: ${category.description}`);
      });
      
    } catch (error) {
      console.log(`❌ FORUM CATEGORIES TABLE: ERROR - ${error}`);
    }

    console.log();

    // 6. Users table verification
    try {
      const usersCount = await prisma.user.count();
      const usersSample = await prisma.user.findMany({
        select: { email: true, role: true, subscriptionTier: true, createdAt: true }
      });
      
      console.log(`✅ USERS TABLE: EXISTS`);
      console.log(`   📊 Total Count: ${usersCount}`);
      console.log(`   📋 All Users:`);
      usersSample.forEach(user => {
        console.log(`      • ${user.email} (${user.role}/${user.subscriptionTier}) - ${user.createdAt.toDateString()}`);
      });
      
    } catch (error) {
      console.log(`❌ USERS TABLE: ERROR - ${error}`);
    }

    // Overall database summary
    console.log('\n📈 PRODUCTION DATABASE SUMMARY');
    console.log('==============================');
    
    const totalCompanies = await prisma.company.count();
    const totalContacts = await prisma.contact.count();
    const totalEvents = await prisma.event.count();
    const totalPosts = await prisma.forumPost.count();
    const totalCategories = await prisma.forumCategory.count();
    const totalUsers = await prisma.user.count();
    
    console.log(`📊 Database Totals:`);
    console.log(`   🏢 Companies: ${totalCompanies}`);
    console.log(`   👥 Contacts: ${totalContacts}`);
    console.log(`   📅 Events: ${totalEvents}`);
    console.log(`   💬 Forum Posts: ${totalPosts}`);
    console.log(`   📂 Forum Categories: ${totalCategories}`);
    console.log(`   👤 Users: ${totalUsers}`);

    // Data quality assessment
    console.log('\n🎯 DATA QUALITY ASSESSMENT');
    console.log('==========================');
    
    let quality = 'EXCELLENT';
    const issues = [];
    
    if (totalCompanies < 10) {
      quality = 'POOR';
      issues.push(`Low company count (${totalCompanies} < 10 expected)`);
    }
    
    if (totalEvents === 0) {
      quality = quality === 'EXCELLENT' ? 'GOOD' : 'POOR';
      issues.push(`No events in database (should have sample events)`);
    }
    
    if (totalPosts === 0) {
      quality = quality === 'EXCELLENT' ? 'GOOD' : 'POOR';
      issues.push(`No forum posts (should have sample posts)`);
    }
    
    if (totalUsers < 2) {
      quality = 'POOR';
      issues.push(`Insufficient users (${totalUsers} < 2 expected)`);
    }

    console.log(`🎯 Overall Quality: ${quality}`);
    
    if (issues.length > 0) {
      console.log(`⚠️  Issues Found:`);
      issues.forEach(issue => console.log(`   • ${issue}`));
    } else {
      console.log(`✅ No issues found - database is well populated`);
    }

    // Test database queries that the API uses
    console.log('\n🧪 API QUERY TESTING');
    console.log('====================');
    
    try {
      // Test company search query
      const searchResults = await prisma.company.findMany({
        where: {
          OR: [
            { name: { contains: 'WPP', mode: 'insensitive' } },
            { industry: { equals: 'ENTERTAINMENT_MEDIA' } }
          ]
        },
        take: 3
      });
      console.log(`✅ Company search query: ${searchResults.length} results`);
      
      // Test events query
      const upcomingEvents = await prisma.event.findMany({
        where: {
          startDate: { gte: new Date() }
        },
        take: 3
      });
      console.log(`✅ Upcoming events query: ${upcomingEvents.length} results`);
      
      // Test forum posts with relations
      const forumData = await prisma.forumPost.findMany({
        include: {
          category: true,
          author: true
        },
        take: 3
      });
      console.log(`✅ Forum posts with relations query: ${forumData.length} results`);
      
    } catch (error) {
      console.log(`❌ API query testing failed: ${error}`);
    }

    console.log('\n🎉 DATABASE VERIFICATION COMPLETE');
    console.log('=================================');

    const dbStatus = {
      connected: true,
      tablesExist: true,
      companies: totalCompanies,
      contacts: totalContacts,
      events: totalEvents,
      forumPosts: totalPosts,
      categories: totalCategories,
      users: totalUsers,
      quality,
      hasMinimumData: totalCompanies >= 5 && totalUsers >= 1,
      readyForTesting: quality !== 'POOR'
    };

    if (dbStatus.readyForTesting) {
      console.log(`✅ DATABASE STATUS: READY FOR PRODUCTION TESTING`);
      console.log(`🎯 Your production database is properly populated and functional`);
    } else {
      console.log(`❌ DATABASE STATUS: NEEDS ATTENTION`);
      console.log(`⚠️  Issues found that may affect production functionality`);
    }

    return dbStatus;

  } catch (error) {
    console.error('❌ Database connection or verification failed:', error);
    return {
      connected: false,
      error: error.message,
      tablesExist: false,
      readyForTesting: false
    };
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  verifyProductionDatabase()
    .then((result) => {
      if (result.readyForTesting) {
        console.log('\n✅ Database verification successful');
        process.exit(0);
      } else {
        console.log('\n❌ Database verification found issues');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('\n❌ Database verification error:', error);
      process.exit(1);
    });
}

export { verifyProductionDatabase }; 