#!/usr/bin/env npx tsx

/**
 * FIX MISSING DATA
 * 
 * Targeted fix for missing events and forum posts in production database
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

async function fixMissingData() {
  console.log('🔧 FIXING MISSING DATA IN PRODUCTION');
  console.log('====================================');
  
  try {
    await prisma.$connect();
    console.log('✅ Connected to production database\n');

    // Check current state
    const currentEvents = await prisma.event.count();
    const currentPosts = await prisma.forumPost.count();
    const currentCategories = await prisma.forumCategory.count();
    
    console.log('📊 Current state:');
    console.log(`   • Events: ${currentEvents}`);
    console.log(`   • Forum Posts: ${currentPosts}`);
    console.log(`   • Forum Categories: ${currentCategories}\n`);

    // Get admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'pro@dealmecca.pro' }
    });

    if (!adminUser) {
      throw new Error('Admin user not found');
    }

    // Force create events with unique slugs
    if (currentEvents === 0) {
      console.log('📅 Creating events...');
      
      const events = [
        {
          title: 'Cannes Lions 2025',
          slug: 'cannes-lions-2025',
          description: 'Premier global event for creative communications industry',
          startDate: new Date('2025-06-16'),
          endDate: new Date('2025-06-20'),
          location: 'Cannes, France',
          eventType: 'CONFERENCE' as const,
          industry: 'ENTERTAINMENT_MEDIA' as const,
          capacity: 15000,
          isVirtual: false,
          organizer: 'Cannes Lions',
          status: 'PUBLISHED' as const,
          visibility: 'PUBLIC' as const,
          registrationUrl: 'https://www.canneslions.com'
        },
        {
          title: 'Advertising Week NY 2025',
          slug: 'advertising-week-ny-2025',
          description: 'Premier event for marketing and advertising professionals',
          startDate: new Date('2025-09-22'),
          endDate: new Date('2025-09-26'),
          location: 'New York, NY',
          eventType: 'CONFERENCE' as const,
          industry: 'ENTERTAINMENT_MEDIA' as const,
          capacity: 10000,
          isVirtual: false,
          organizer: 'Advertising Week',
          status: 'PUBLISHED' as const,
          visibility: 'PUBLIC' as const,
          registrationUrl: 'https://www.advertisingweek.com'
        },
        {
          title: 'Marketing Tech Summit 2025',
          slug: 'marketing-tech-summit-2025',
          description: 'Leading conference for marketing technology professionals',
          startDate: new Date('2025-04-15'),
          endDate: new Date('2025-04-17'),
          location: 'San Francisco, CA',
          eventType: 'CONFERENCE' as const,
          industry: 'TECHNOLOGY' as const,
          capacity: 5000,
          isVirtual: false,
          organizer: 'MarTech Alliance',
          status: 'PUBLISHED' as const,
          visibility: 'PUBLIC' as const,
          registrationUrl: 'https://www.martech.org'
        },
        {
          title: 'Digital Marketing Awards 2025',
          slug: 'digital-marketing-awards-2025',
          description: 'Annual awards for innovative digital marketing campaigns',
          startDate: new Date('2025-11-10'),
          endDate: new Date('2025-11-10'),
          location: 'London, UK',
          eventType: 'AWARDS' as const,
          industry: 'TECHNOLOGY' as const,
          capacity: 2000,
          isVirtual: false,
          organizer: 'Digital Marketing Institute',
          status: 'PUBLISHED' as const,
          visibility: 'PUBLIC' as const,
          registrationUrl: 'https://www.dmiawards.com'
        },
        {
          title: 'Content Marketing World 2025',
          slug: 'content-marketing-world-2025',
          description: 'Largest content marketing event in the world',
          startDate: new Date('2025-08-05'),
          endDate: new Date('2025-08-08'),
          location: 'Cleveland, OH',
          eventType: 'CONFERENCE' as const,
          industry: 'ENTERTAINMENT_MEDIA' as const,
          capacity: 8000,
          isVirtual: false,
          organizer: 'Content Marketing Institute',
          status: 'PUBLISHED' as const,
          visibility: 'PUBLIC' as const,
          registrationUrl: 'https://www.contentmarketingworld.com'
        }
      ];

      for (const event of events) {
        try {
          await prisma.event.create({ data: event });
          console.log(`   ✅ Created: ${event.title}`);
        } catch (error) {
          console.log(`   ❌ Failed: ${event.title} - ${error}`);
        }
      }
    }

    // Force create forum posts
    if (currentPosts === 0) {
      console.log('\n💬 Creating forum posts...');
      
      // Get categories
      const categories = await prisma.forumCategory.findMany();
      console.log(`   Found ${categories.length} categories`);
      
      if (categories.length > 0) {
        const posts = [
          {
            title: 'AI in Creative Advertising Discussion',
            slug: 'ai-creative-advertising-discussion',
            content: 'What are your thoughts on how AI tools like ChatGPT and DALL-E are changing the creative process? Are we seeing the beginning of AI-human collaborative creativity?',
            authorId: adminUser.id,
            categoryId: categories[0].id,
            status: 'PUBLISHED' as const,
            visibility: 'PUBLIC' as const
          },
          {
            title: 'Remote Agency Culture Best Practices',
            slug: 'remote-agency-culture-best-practices',
            content: 'Since COVID, many agencies have gone remote or hybrid. What are the best practices for maintaining creative collaboration and agency culture?',
            authorId: adminUser.id,
            categoryId: categories[1] ? categories[1].id : categories[0].id,
            status: 'PUBLISHED' as const,
            visibility: 'PUBLIC' as const
          },
          {
            title: 'Latest Nike Campaign Analysis',
            slug: 'latest-nike-campaign-analysis',
            content: 'Just saw Nike\'s latest campaign evolution. The way they\'re leveraging user-generated content while maintaining brand consistency is masterful.',
            authorId: adminUser.id,
            categoryId: categories[2] ? categories[2].id : categories[0].id,
            status: 'PUBLISHED' as const,
            visibility: 'PUBLIC' as const
          },
          {
            title: 'Marketing Attribution Without Cookies',
            slug: 'marketing-attribution-without-cookies',
            content: 'With third-party cookies going away, how are you handling marketing attribution? What tools and methodologies are working for multi-touch attribution?',
            authorId: adminUser.id,
            categoryId: categories[3] ? categories[3].id : categories[0].id,
            status: 'PUBLISHED' as const,
            visibility: 'PUBLIC' as const
          },
          {
            title: 'Career Transition to Digital Marketing',
            slug: 'career-transition-digital-marketing',
            content: 'I\'ve been in traditional advertising for 15 years and want to transition to digital. What skills should I focus on developing?',
            authorId: adminUser.id,
            categoryId: categories[4] ? categories[4].id : categories[0].id,
            status: 'PUBLISHED' as const,
            visibility: 'PUBLIC' as const
          }
        ];

        for (const post of posts) {
          try {
            await prisma.forumPost.create({ data: post });
            console.log(`   ✅ Created: ${post.title}`);
          } catch (error) {
            console.log(`   ❌ Failed: ${post.title} - ${error}`);
          }
        }
      } else {
        console.log('   ❌ No categories found for posts');
      }
    }

    // Verify final state
    console.log('\n📊 VERIFICATION AFTER FIX');
    console.log('=========================');
    const finalEvents = await prisma.event.count();
    const finalPosts = await prisma.forumPost.count();
    const finalCategories = await prisma.forumCategory.count();
    const finalCompanies = await prisma.company.count();
    const finalContacts = await prisma.contact.count();
    
    console.log(`✅ Events: ${finalEvents}`);
    console.log(`✅ Forum Posts: ${finalPosts}`);
    console.log(`✅ Forum Categories: ${finalCategories}`);
    console.log(`✅ Companies: ${finalCompanies}`);
    console.log(`✅ Contacts: ${finalContacts}`);

    // Test a sample query
    console.log('\n🧪 TESTING SAMPLE QUERIES');
    console.log('=========================');
    
    const sampleCompanies = await prisma.company.findMany({ take: 3 });
    console.log(`✅ Sample companies query: ${sampleCompanies.length} results`);
    
    const sampleEvents = await prisma.event.findMany({ take: 3 });
    console.log(`✅ Sample events query: ${sampleEvents.length} results`);
    
    const samplePosts = await prisma.forumPost.findMany({ 
      take: 3,
      include: { category: true }
    });
    console.log(`✅ Sample posts query: ${samplePosts.length} results`);

    if (sampleEvents.length > 0) {
      console.log(`   Sample event: ${sampleEvents[0].title}`);
    }
    
    if (samplePosts.length > 0) {
      console.log(`   Sample post: ${samplePosts[0].title}`);
    }

    console.log('\n🎉 MISSING DATA FIX COMPLETE!');
    console.log('=============================');
    console.log('✅ Production database now has:');
    console.log(`   • ${finalCompanies} companies`);
    console.log(`   • ${finalContacts} contacts`);
    console.log(`   • ${finalEvents} events`);
    console.log(`   • ${finalCategories} forum categories`);
    console.log(`   • ${finalPosts} forum posts`);
    console.log('\n🚀 Ready for API testing!');

    return {
      success: true,
      events: finalEvents,
      posts: finalPosts,
      companies: finalCompanies,
      contacts: finalContacts
    };

  } catch (error) {
    console.error('❌ Error fixing missing data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  fixMissingData()
    .then((result) => {
      console.log('✅ Fix completed:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Fix failed:', error);
      process.exit(1);
    });
}

export { fixMissingData }; 