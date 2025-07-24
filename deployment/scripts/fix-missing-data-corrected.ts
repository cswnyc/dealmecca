#!/usr/bin/env npx tsx

/**
 * FIX MISSING DATA - CORRECTED VERSION
 * 
 * Targeted fix for missing events and forum posts with correct schema fields
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

async function fixMissingDataCorrected() {
  console.log('🔧 FIXING MISSING DATA - CORRECTED VERSION');
  console.log('==========================================');
  
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

    // Force create events with correct schema
    if (currentEvents === 0) {
      console.log('📅 Creating events with correct schema...');
      
      const events = [
        {
          name: 'Cannes Lions 2025',
          description: 'Premier global event for creative communications industry',
          startDate: new Date('2025-06-16'),
          endDate: new Date('2025-06-20'),
          location: 'Cannes, France',
          venue: 'Palais des Festivals',
          category: 'CONFERENCE' as const,
          industry: '["ENTERTAINMENT_MEDIA"]',
          capacity: 15000,
          isVirtual: false,
          isHybrid: false,
          organizerName: 'Cannes Lions',
          organizerUrl: 'https://www.canneslions.com',
          registrationUrl: 'https://www.canneslions.com/register',
          eventType: 'CONFERENCE',
          status: 'PUBLISHED' as const,
          createdBy: adminUser.id,
          estimatedCost: 5000,
          attendeeCount: 15000
        },
        {
          name: 'Advertising Week New York 2025',
          description: 'Premier event for marketing and advertising professionals',
          startDate: new Date('2025-09-22'),
          endDate: new Date('2025-09-26'),
          location: 'New York, NY',
          venue: 'Times Square',
          category: 'CONFERENCE' as const,
          industry: '["ENTERTAINMENT_MEDIA"]',
          capacity: 10000,
          isVirtual: false,
          isHybrid: true,
          organizerName: 'Advertising Week',
          organizerUrl: 'https://www.advertisingweek.com',
          registrationUrl: 'https://www.advertisingweek.com/register',
          eventType: 'CONFERENCE',
          status: 'PUBLISHED' as const,
          createdBy: adminUser.id,
          estimatedCost: 2500,
          attendeeCount: 10000
        },
        {
          name: 'Marketing Technology Summit 2025',
          description: 'Leading conference for marketing technology professionals',
          startDate: new Date('2025-04-15'),
          endDate: new Date('2025-04-17'),
          location: 'San Francisco, CA',
          venue: 'Moscone Center',
          category: 'CONFERENCE' as const,
          industry: '["TECHNOLOGY"]',
          capacity: 5000,
          isVirtual: false,
          isHybrid: false,
          organizerName: 'MarTech Alliance',
          organizerUrl: 'https://www.martech.org',
          registrationUrl: 'https://www.martech.org/register',
          eventType: 'CONFERENCE',
          status: 'PUBLISHED' as const,
          createdBy: adminUser.id,
          estimatedCost: 1500,
          attendeeCount: 5000
        },
        {
          name: 'Digital Marketing Innovation Awards',
          description: 'Annual awards for innovative digital marketing campaigns',
          startDate: new Date('2025-11-10'),
          endDate: new Date('2025-11-10'),
          location: 'London, UK',
          venue: 'Royal Festival Hall',
          category: 'AWARDS' as const,
          industry: '["TECHNOLOGY", "ENTERTAINMENT_MEDIA"]',
          capacity: 2000,
          isVirtual: false,
          isHybrid: false,
          organizerName: 'Digital Marketing Institute',
          organizerUrl: 'https://www.dmiawards.com',
          registrationUrl: 'https://www.dmiawards.com/register',
          eventType: 'AWARDS',
          status: 'PUBLISHED' as const,
          createdBy: adminUser.id,
          estimatedCost: 500,
          attendeeCount: 2000
        },
        {
          name: 'Content Marketing World 2025',
          description: 'Largest content marketing event in the world',
          startDate: new Date('2025-08-05'),
          endDate: new Date('2025-08-08'),
          location: 'Cleveland, OH',
          venue: 'Huntington Convention Center',
          category: 'CONFERENCE' as const,
          industry: '["ENTERTAINMENT_MEDIA"]',
          capacity: 8000,
          isVirtual: false,
          isHybrid: true,
          organizerName: 'Content Marketing Institute',
          organizerUrl: 'https://www.contentmarketingworld.com',
          registrationUrl: 'https://www.contentmarketingworld.com/register',
          eventType: 'CONFERENCE',
          status: 'PUBLISHED' as const,
          createdBy: adminUser.id,
          estimatedCost: 2000,
          attendeeCount: 8000
        }
      ];

      for (const event of events) {
        try {
          await prisma.event.create({ data: event });
          console.log(`   ✅ Created: ${event.name}`);
        } catch (error) {
          console.log(`   ❌ Failed: ${event.name} - ${error}`);
        }
      }
    }

    // Force create forum posts with correct schema
    if (currentPosts === 0) {
      console.log('\n💬 Creating forum posts with correct schema...');
      
      // Get categories
      const categories = await prisma.forumCategory.findMany();
      console.log(`   Found ${categories.length} categories`);
      
      if (categories.length > 0) {
        const posts = [
          {
            title: 'AI in Creative Advertising Discussion',
            slug: 'ai-creative-advertising-discussion',
            content: 'What are your thoughts on how AI tools like ChatGPT and DALL-E are changing the creative process? Are we seeing the beginning of AI-human collaborative creativity, or should we be concerned about job displacement?',
            authorId: adminUser.id,
            categoryId: categories[0].id,
            tags: '["AI", "Creative", "Advertising", "Technology"]',
            mediaType: '["DIGITAL"]',
            urgency: 'MEDIUM' as const,
            location: 'Global',
            isAnonymous: false
          },
          {
            title: 'Remote Agency Culture Best Practices',
            slug: 'remote-agency-culture-best-practices',
            content: 'Since COVID, many agencies have gone remote or hybrid. What are the best practices you\'ve seen for maintaining creative collaboration and agency culture in a distributed workforce?',
            authorId: adminUser.id,
            categoryId: categories[1] ? categories[1].id : categories[0].id,
            tags: '["Remote Work", "Agency Culture", "Collaboration", "Best Practices"]',
            mediaType: '["DIGITAL"]',
            urgency: 'MEDIUM' as const,
            location: 'Global',
            isAnonymous: false
          },
          {
            title: 'Latest Nike Campaign Analysis',
            slug: 'latest-nike-campaign-analysis',
            content: 'Just saw Nike\'s latest "Just Do It" evolution campaign. The way they\'re leveraging user-generated content while maintaining brand consistency is masterful. What are your thoughts on the creative strategy and execution?',
            authorId: adminUser.id,
            categoryId: categories[2] ? categories[2].id : categories[0].id,
            tags: '["Nike", "Campaign Analysis", "Creative Strategy", "Branding"]',
            mediaType: '["DIGITAL", "TV"]',
            urgency: 'MEDIUM' as const,
            location: 'Global',
            isAnonymous: false
          },
          {
            title: 'Marketing Attribution in Cookie-less World',
            slug: 'marketing-attribution-cookie-less-world',
            content: 'With third-party cookies going away, how are you all handling marketing attribution and measurement? What tools and methodologies are working best for multi-touch attribution in this new landscape?',
            authorId: adminUser.id,
            categoryId: categories[3] ? categories[3].id : categories[0].id,
            tags: '["Attribution", "Data Analytics", "Privacy", "Measurement"]',
            mediaType: '["DIGITAL"]',
            urgency: 'HIGH' as const,
            location: 'Global',
            isAnonymous: false
          },
          {
            title: 'Career Transition: Traditional to Digital',
            slug: 'career-transition-traditional-digital',
            content: 'I\'ve been working in traditional advertising for 15 years and want to transition more into digital marketing. What skills should I focus on developing, and what certifications are most valuable in the current market?',
            authorId: adminUser.id,
            categoryId: categories[4] ? categories[4].id : categories[0].id,
            tags: '["Career Development", "Digital Marketing", "Skills", "Transition"]',
            mediaType: '["DIGITAL"]',
            urgency: 'MEDIUM' as const,
            location: 'Global',
            isAnonymous: false
          },
          {
            title: 'Brand Purpose vs Performance Marketing',
            slug: 'brand-purpose-vs-performance-marketing',
            content: 'There\'s always tension between brand-building campaigns and performance marketing. How do you balance long-term brand building with short-term ROI demands from leadership? What frameworks work best?',
            authorId: adminUser.id,
            categoryId: categories[5] ? categories[5].id : categories[0].id,
            tags: '["Brand Strategy", "Performance Marketing", "ROI", "Brand Building"]',
            mediaType: '["DIGITAL", "TV"]',
            urgency: 'MEDIUM' as const,
            location: 'Global',
            isAnonymous: false
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
    console.log('\n📊 VERIFICATION AFTER CORRECTED FIX');
    console.log('===================================');
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

    // Test sample queries with actual data
    console.log('\n🧪 TESTING SAMPLE QUERIES WITH DATA');
    console.log('===================================');
    
    const sampleCompanies = await prisma.company.findMany({ take: 3 });
    console.log(`✅ Sample companies query: ${sampleCompanies.length} results`);
    sampleCompanies.forEach(company => {
      console.log(`   • ${company.name} (${company.industry})`);
    });
    
    const sampleEvents = await prisma.event.findMany({ take: 3 });
    console.log(`\n✅ Sample events query: ${sampleEvents.length} results`);
    sampleEvents.forEach(event => {
      console.log(`   • ${event.name} - ${event.location} (${event.startDate.toDateString()})`);
    });
    
    const samplePosts = await prisma.forumPost.findMany({ 
      take: 3,
      include: { category: true, author: true }
    });
    console.log(`\n✅ Sample posts query: ${samplePosts.length} results`);
    samplePosts.forEach(post => {
      console.log(`   • ${post.title} by ${post.author.name} in ${post.category.name}`);
    });

    console.log('\n🎉 CORRECTED MISSING DATA FIX COMPLETE!');
    console.log('=======================================');
    console.log('✅ Production database now has:');
    console.log(`   • ${finalCompanies} companies`);
    console.log(`   • ${finalContacts} contacts`);
    console.log(`   • ${finalEvents} events`);
    console.log(`   • ${finalCategories} forum categories`);
    console.log(`   • ${finalPosts} forum posts`);
    console.log('\n🚀 Ready for full API testing!');
    console.log('\n🌐 Test URLs:');
    console.log('   Production: https://website-gjgyoiava-cws-projects-e62034bb.vercel.app');
    console.log('   Login: pro@dealmecca.pro / test123');
    console.log('   Test sections: /events, /forum, /orgs/companies, /search');

    return {
      success: true,
      events: finalEvents,
      posts: finalPosts,
      companies: finalCompanies,
      contacts: finalContacts
    };

  } catch (error) {
    console.error('❌ Error in corrected fix:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  fixMissingDataCorrected()
    .then((result) => {
      console.log('✅ Corrected fix completed:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Corrected fix failed:', error);
      process.exit(1);
    });
}

export { fixMissingDataCorrected }; 