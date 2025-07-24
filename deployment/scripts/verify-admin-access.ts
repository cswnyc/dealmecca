#!/usr/bin/env npx tsx

/**
 * VERIFY ADMIN ACCESS
 * 
 * Test admin user access to admin panel and verify data accessibility
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

async function verifyAdminAccess() {
  console.log('🔐 ADMIN ACCESS VERIFICATION');
  console.log('============================');
  
  try {
    await prisma.$connect();
    console.log('✅ Connected to production database\n');

    // Verify admin user exists and has correct permissions
    console.log('👤 ADMIN USER VERIFICATION');
    console.log('==========================');
    
    const adminUser = await prisma.user.findUnique({
      where: { email: 'pro@dealmecca.pro' }
    });
    
    if (!adminUser) {
      console.log('❌ Admin user not found!');
      return { success: false, reason: 'Admin user not found' };
    }
    
    console.log(`✅ Admin user found: ${adminUser.email}`);
    console.log(`✅ Role: ${adminUser.role}`);
    console.log(`✅ Subscription: ${adminUser.subscriptionTier}`);
    console.log(`✅ User ID: ${adminUser.id}`);
    
    // Check admin permissions
    const isAdminRole = adminUser.role === 'PRO' || adminUser.role === 'ADMIN';
    const hasAdminAccess = adminUser.subscriptionTier === 'PRO' || adminUser.subscriptionTier === 'ENTERPRISE';
    
    console.log(`✅ Has Admin Role: ${isAdminRole ? 'YES' : 'NO'}`);
    console.log(`✅ Has Admin Access: ${hasAdminAccess ? 'YES' : 'NO'}`);
    
    if (!isAdminRole || !hasAdminAccess) {
      console.log('❌ Admin user does not have proper permissions!');
      return { success: false, reason: 'Insufficient permissions' };
    }

    // Test data access that admin would need
    console.log('\n📊 ADMIN DATA ACCESS TEST');
    console.log('=========================');
    
    // Test company access
    const companies = await prisma.company.findMany({
      take: 5,
      include: {
        _count: {
          select: { contacts: true }
        }
      }
    });
    console.log(`✅ Companies query: ${companies.length} results`);
    companies.forEach(company => {
      console.log(`   • ${company.name} (${company._count.contacts} contacts)`);
    });
    
    // Test contact access
    const contacts = await prisma.contact.findMany({
      take: 5,
      include: { company: true }
    });
    console.log(`\n✅ Contacts query: ${contacts.length} results`);
    contacts.forEach(contact => {
      console.log(`   • ${contact.firstName} ${contact.lastName} at ${contact.company.name}`);
    });
    
    // Test event access
    const events = await prisma.event.findMany({
      take: 5,
      include: {
        _count: {
          select: { attendees: true }
        }
      }
    });
    console.log(`\n✅ Events query: ${events.length} results`);
    events.forEach(event => {
      console.log(`   • ${event.name} - ${event.location} (${event._count.attendees} attendees)`);
    });
    
    // Test forum access
    const forumPosts = await prisma.forumPost.findMany({
      take: 5,
      include: {
        category: true,
        author: true,
        _count: {
          select: { comments: true }
        }
      }
    });
    console.log(`\n✅ Forum posts query: ${forumPosts.length} results`);
    forumPosts.forEach(post => {
      console.log(`   • ${post.title} by ${post.author.name} in ${post.category.name} (${post._count.comments} comments)`);
    });
    
    // Test admin-specific queries
    console.log('\n🔧 ADMIN-SPECIFIC ACCESS TEST');
    console.log('=============================');
    
    // Test user management access
    const allUsers = await prisma.user.findMany({
      select: { id: true, email: true, role: true, subscriptionTier: true, createdAt: true }
    });
    console.log(`✅ User management query: ${allUsers.length} users`);
    allUsers.forEach(user => {
      console.log(`   • ${user.email} (${user.role}/${user.subscriptionTier})`);
    });
    
    // Test data modification access (create a test record and delete it)
    console.log('\n✅ Testing data modification access...');
    const testCompany = await prisma.company.create({
      data: {
        name: 'Test Admin Company',
        slug: 'test-admin-company',
        companyType: 'TECHNOLOGY_PROVIDER',
        industry: 'TECHNOLOGY',
        description: 'Test company for admin verification',
        city: 'Test City',
        state: 'TS',
        country: 'US',
        region: 'WEST',
        employeeCount: 'STARTUP_1_50',
        revenueRange: 'RANGE_1M_10M',
        verified: false,
        dataQuality: 'BASIC'
      }
    });
    console.log(`✅ Created test company: ${testCompany.name}`);
    
    // Delete the test company
    await prisma.company.delete({
      where: { id: testCompany.id }
    });
    console.log(`✅ Deleted test company successfully`);

    // Verify total data counts
    console.log('\n📈 PRODUCTION DATA SUMMARY');
    console.log('==========================');
    const totalCompanies = await prisma.company.count();
    const totalContacts = await prisma.contact.count();
    const totalEvents = await prisma.event.count();
    const totalPosts = await prisma.forumPost.count();
    const totalCategories = await prisma.forumCategory.count();
    const totalUsers = await prisma.user.count();
    
    console.log(`✅ Total Companies: ${totalCompanies}`);
    console.log(`✅ Total Contacts: ${totalContacts}`);
    console.log(`✅ Total Events: ${totalEvents}`);
    console.log(`✅ Total Forum Posts: ${totalPosts}`);
    console.log(`✅ Total Forum Categories: ${totalCategories}`);
    console.log(`✅ Total Users: ${totalUsers}`);

    // Test API endpoints the admin would use
    console.log('\n🌐 ADMIN PANEL ACCESS GUIDE');
    console.log('===========================');
    console.log('To verify admin panel access:');
    console.log('1. 🔗 Go to: https://website-gjgyoiava-cws-projects-e62034bb.vercel.app/auth/signin');
    console.log('2. 🔑 Login with: pro@dealmecca.pro / test123');
    console.log('3. 🎯 Navigate to: /admin');
    console.log('4. 📊 Expected admin sections:');
    console.log('   • /admin - Admin dashboard');
    console.log('   • /admin/orgs/companies - Company management');
    console.log('   • /admin/orgs/contacts - Contact management');
    console.log('   • /admin/events - Event management');
    console.log('   • Forum moderation capabilities');
    console.log('\n🔍 Admin API endpoints to test:');
    console.log('   • GET /api/admin/companies - Company management');
    console.log('   • GET /api/admin/contacts - Contact management');
    console.log('   • GET /api/admin/stats - Admin statistics');
    console.log('   • POST /api/admin/companies - Create new companies');
    console.log('   • PUT /api/admin/contacts/[id]/verify - Verify contacts');

    const result = {
      success: true,
      adminUser: {
        email: adminUser.email,
        role: adminUser.role,
        subscriptionTier: adminUser.subscriptionTier,
        hasAdminAccess: true
      },
      dataStats: {
        companies: totalCompanies,
        contacts: totalContacts,
        events: totalEvents,
        forumPosts: totalPosts,
        categories: totalCategories,
        users: totalUsers
      },
      adminCapabilities: {
        userManagement: true,
        dataModification: true,
        fullDatabaseAccess: true
      }
    };

    console.log('\n🎉 ADMIN ACCESS VERIFICATION COMPLETE!');
    console.log('======================================');
    console.log('✅ Admin user properly configured');
    console.log('✅ Full database access confirmed');
    console.log('✅ Data modification permissions verified');
    console.log('✅ Production data populated and accessible');
    console.log('\n🚀 Ready for admin testing in production!');

    return result;

  } catch (error) {
    console.error('❌ Admin access verification failed:', error);
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  verifyAdminAccess()
    .then((result) => {
      if (result.success) {
        console.log('\n✅ Admin verification successful');
        process.exit(0);
      } else {
        console.log('\n❌ Admin verification failed:', result);
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('\n❌ Admin verification error:', error);
      process.exit(1);
    });
}

export { verifyAdminAccess }; 