#!/usr/bin/env npx tsx

/**
 * Seed Missing Production Data
 * 
 * Populate events, forum posts, and other missing data in production
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedMissingData() {
  console.log(`🌱 SEEDING MISSING PRODUCTION DATA`);
  console.log(`================================`);
  console.log(`📅 Time: ${new Date().toLocaleString()}\n`);

  try {
    // Seed Events
    console.log(`📅 SEEDING EVENTS DATA`);
    console.log(`====================`);
    
    const eventsToCreate = [
      {
        title: "Advertising Week New York 2025",
        description: "The premier global event for marketing, advertising, and technology professionals.",
        startDate: new Date('2025-09-29T09:00:00Z'),
        endDate: new Date('2025-10-02T18:00:00Z'),
        location: "New York, NY",
        venue: "Hudson Yards",
        category: "CONFERENCE",
        industry: "ADVERTISING",
        ticketPrice: 1500.00,
        maxAttendees: 5000,
        isVirtual: false,
        status: "PUBLISHED",
        organizer: "Advertising Week",
        website: "https://advertisingweek.com",
        description_long: "Join thousands of marketing and advertising professionals for the most important week in the industry calendar.",
        targetAudience: ["CMO", "VP_MARKETING", "CREATIVE_DIRECTOR", "MEDIA_PLANNER"],
        topics: ["Digital Transformation", "AI in Marketing", "Brand Strategy", "Media Planning"],
        speakers: ["Industry Leaders", "CMOs", "Creative Directors"],
        highlights: ["Keynote Sessions", "Networking Events", "Product Showcases"],
        contactEmail: "info@advertisingweek.com",
        contactPhone: "+1-212-555-0100"
      },
      {
        title: "Cannes Lions International Festival 2025",
        description: "The world's biggest celebration of creativity in communications.",
        startDate: new Date('2025-06-16T09:00:00Z'),
        endDate: new Date('2025-06-20T18:00:00Z'),
        location: "Cannes, France",
        venue: "Palais des Festivals",
        category: "FESTIVAL",
        industry: "ADVERTISING",
        ticketPrice: 2500.00,
        maxAttendees: 15000,
        isVirtual: false,
        status: "PUBLISHED",
        organizer: "Cannes Lions",
        website: "https://canneslions.com",
        description_long: "Five days of inspiring sessions, networking and screenings showcasing the very best creative work from around the world.",
        targetAudience: ["CREATIVE_DIRECTOR", "CMO", "BRAND_MANAGER", "AGENCY_OWNER"],
        topics: ["Creative Excellence", "Brand Innovation", "Global Campaigns", "Future of Advertising"],
        speakers: ["Global Creative Leaders", "Award Winners", "Industry Pioneers"],
        highlights: ["Lions Awards", "Creative Showcases", "Beach Networking"],
        contactEmail: "info@canneslions.com",
        contactPhone: "+33-4-92-99-84-00"
      },
      {
        title: "Digital Marketing Summit 2025",
        description: "Advanced strategies for modern digital marketing.",
        startDate: new Date('2025-03-15T10:00:00Z'),
        endDate: new Date('2025-03-16T17:00:00Z'),
        location: "San Francisco, CA",
        venue: "Moscone Center",
        category: "CONFERENCE",
        industry: "DIGITAL_MARKETING",
        ticketPrice: 899.00,
        maxAttendees: 2000,
        isVirtual: true,
        status: "PUBLISHED",
        organizer: "Digital Marketing Institute",
        website: "https://digitalmarketingsummit.com",
        description_long: "Two days of intensive training on the latest digital marketing strategies and technologies.",
        targetAudience: ["DIGITAL_MARKETER", "VP_MARKETING", "MARKETING_MANAGER"],
        topics: ["SEO/SEM", "Social Media Marketing", "Email Marketing", "Analytics"],
        speakers: ["Digital Marketing Experts", "Platform Representatives", "Analytics Specialists"],
        highlights: ["Hands-on Workshops", "Platform Updates", "Case Studies"],
        contactEmail: "contact@digitalmarketingsummit.com",
        contactPhone: "+1-415-555-0200"
      },
      {
        title: "Brand Strategy Workshop: NYC",
        description: "Intensive workshop on building powerful brand strategies.",
        startDate: new Date('2025-02-28T09:00:00Z'),
        endDate: new Date('2025-02-28T17:00:00Z'),
        location: "New York, NY",
        venue: "WeWork Hudson Square",
        category: "WORKSHOP",
        industry: "BRANDING",
        ticketPrice: 450.00,
        maxAttendees: 50,
        isVirtual: false,
        status: "PUBLISHED",
        organizer: "Brand Strategy Institute",
        website: "https://brandstrategyworkshop.com",
        description_long: "Learn from industry experts how to develop compelling brand strategies that drive business growth.",
        targetAudience: ["BRAND_MANAGER", "MARKETING_DIRECTOR", "CMO"],
        topics: ["Brand Positioning", "Brand Architecture", "Brand Measurement"],
        speakers: ["Brand Strategy Consultants", "Fortune 500 CMOs"],
        highlights: ["Interactive Exercises", "Real Case Studies", "Networking Lunch"],
        contactEmail: "info@brandstrategyworkshop.com",
        contactPhone: "+1-212-555-0300"
      },
      {
        title: "Media Planning & Buying Conference 2025",
        description: "The future of media planning in a data-driven world.",
        startDate: new Date('2025-05-12T08:30:00Z'),
        endDate: new Date('2025-05-14T18:00:00Z'),
        location: "Chicago, IL",
        venue: "McCormick Place",
        category: "CONFERENCE",
        industry: "MEDIA",
        ticketPrice: 1200.00,
        maxAttendees: 3000,
        isVirtual: true,
        status: "PUBLISHED",
        organizer: "Media Planning Association",
        website: "https://mediaplanningconf.com",
        description_long: "Three days of insights into programmatic advertising, cross-platform planning, and measurement.",
        targetAudience: ["MEDIA_PLANNER", "MEDIA_BUYER", "MEDIA_DIRECTOR"],
        topics: ["Programmatic Advertising", "Cross-Platform Planning", "Attribution Modeling"],
        speakers: ["Media Agency Leaders", "Platform Executives", "Research Directors"],
        highlights: ["Vendor Expo", "Live Demos", "Certification Courses"],
        contactEmail: "contact@mediaplanningconf.com",
        contactPhone: "+1-312-555-0400"
      }
    ];

    let eventsCreated = 0;
    for (const eventData of eventsToCreate) {
      try {
        const event = await prisma.event.create({
          data: eventData
        });
        console.log(`   ✅ Created event: ${event.title}`);
        eventsCreated++;
      } catch (error) {
        console.log(`   ⚠️ Event may already exist: ${eventData.title}`);
      }
    }

    console.log(`\n📊 Events Created: ${eventsCreated}/${eventsToCreate.length}`);

    // Seed Forum Posts
    console.log(`\n💬 SEEDING FORUM POSTS DATA`);
    console.log(`===========================`);

    // First, get or create a user for posts
    let defaultUser;
    try {
      defaultUser = await prisma.user.findFirst();
      if (!defaultUser) {
        defaultUser = await prisma.user.create({
          data: {
            email: 'admin@dealmecca.pro',
            name: 'DealMecca Admin',
            role: 'ADMIN',
            subscriptionTier: 'PRO'
          }
        });
      }
    } catch (error) {
      console.log(`   ⚠️ Using existing user for posts`);
      defaultUser = await prisma.user.findFirst();
    }

    // Get forum categories
    const categories = await prisma.forumCategory.findMany();
    
    if (categories.length === 0) {
      console.log(`   ⚠️ No forum categories found, creating basic categories...`);
      const basicCategories = [
        {
          name: "General Discussion",
          slug: "general",
          description: "General industry discussions",
          color: "#3b82f6"
        },
        {
          name: "Industry News",
          slug: "news",
          description: "Latest industry news and updates",
          color: "#10b981"
        },
        {
          name: "Job Opportunities",
          slug: "jobs",
          description: "Job postings and career discussions",
          color: "#f59e0b"
        }
      ];

      for (const cat of basicCategories) {
        try {
          await prisma.forumCategory.create({ data: cat });
          console.log(`   ✅ Created category: ${cat.name}`);
        } catch (error) {
          console.log(`   ⚠️ Category may exist: ${cat.name}`);
        }
      }
    }

    const updatedCategories = await prisma.forumCategory.findMany();
    
    const forumPostsToCreate = [
      {
        title: "Welcome to DealMecca Community!",
        content: "Welcome to the DealMecca professional community! This is a place for advertising, marketing, and media professionals to connect, share insights, and discover opportunities.\n\nFeel free to introduce yourself and let us know what brings you here!",
        categoryId: updatedCategories[0]?.id,
        authorId: defaultUser?.id,
        status: "PUBLISHED",
        isPinned: true,
        tags: ["welcome", "introduction", "community"]
      },
      {
        title: "Advertising Week 2025 - Who's Attending?",
        content: "Advertising Week is coming up in September! Who else is planning to attend? Would love to connect with fellow DealMecca members.\n\nI'm particularly interested in the AI and Marketing sessions. Anyone else excited about those?",
        categoryId: updatedCategories[0]?.id,
        authorId: defaultUser?.id,
        status: "PUBLISHED",
        tags: ["advertising-week", "networking", "events"]
      },
      {
        title: "Industry Trend: Rise of Connected TV Advertising",
        content: "Connected TV advertising spend is projected to reach $40+ billion this year. What are your thoughts on this shift?\n\nHow are you adapting your media strategies to include more CTV? Any recommended platforms or measurement approaches?",
        categoryId: updatedCategories[1]?.id,
        authorId: defaultUser?.id,
        status: "PUBLISHED",
        tags: ["ctv", "trends", "media-planning"]
      },
      {
        title: "Hiring: Senior Media Planner - WPP Group",
        content: "We're looking for a Senior Media Planner to join our team at WPP Group in New York.\n\n**Requirements:**\n- 5+ years media planning experience\n- Programmatic expertise\n- Cross-platform campaign management\n\nDM me for more details or apply through our careers page.",
        categoryId: updatedCategories[2]?.id,
        authorId: defaultUser?.id,
        status: "PUBLISHED",
        tags: ["jobs", "media-planner", "wpp", "hiring"]
      },
      {
        title: "Best Practices for Brand Safety in Programmatic",
        content: "With the growth of programmatic advertising, brand safety has become increasingly important. What tools and strategies are you using?\n\nI've been exploring contextual targeting as an alternative to behavioral targeting. Anyone else going down this path?",
        categoryId: updatedCategories[0]?.id,
        authorId: defaultUser?.id,
        status: "PUBLISHED",
        tags: ["brand-safety", "programmatic", "best-practices"]
      },
      {
        title: "Cannes Lions 2025 - Campaign Predictions",
        content: "Cannes Lions submissions are due soon! What campaigns from this year do you think will take home Gold?\n\nI'm excited to see how AI-driven creative campaigns perform this year. The work I've seen so far has been impressive.",
        categoryId: updatedCategories[1]?.id,
        authorId: defaultUser?.id,
        status: "PUBLISHED",
        tags: ["cannes-lions", "creative", "campaigns", "awards"]
      }
    ];

    let postsCreated = 0;
    for (const postData of forumPostsToCreate) {
      if (postData.categoryId && postData.authorId) {
        try {
          const post = await prisma.forumPost.create({
            data: postData
          });
          console.log(`   ✅ Created post: ${post.title}`);
          postsCreated++;
        } catch (error) {
          console.log(`   ⚠️ Post may already exist: ${postData.title}`);
        }
      }
    }

    console.log(`\n📊 Forum Posts Created: ${postsCreated}/${forumPostsToCreate.length}`);

    // Final data count verification
    console.log(`\n📊 FINAL DATA VERIFICATION`);
    console.log(`=========================`);
    
    const finalCounts = await Promise.all([
      prisma.companies.count(),
      prisma.contacts.count(), 
      prisma.event.count(),
      prisma.forumPost.count(),
      prisma.forumCategory.count(),
      prisma.user.count()
    ]);

    console.log(`   Companies: ${finalCounts[0]}`);
    console.log(`   Contacts: ${finalCounts[1]}`);
    console.log(`   Events: ${finalCounts[2]}`);
    console.log(`   Forum Posts: ${finalCounts[3]}`);
    console.log(`   Forum Categories: ${finalCounts[4]}`);
    console.log(`   Users: ${finalCounts[5]}`);

    console.log(`\n✅ DATA SEEDING COMPLETE!`);
    console.log(`\n🎯 NEXT STEPS:`);
    console.log(`   1. Test Events: https://website-gjgyoiava-cws-projects-e62034bb.vercel.app/events`);
    console.log(`   2. Test Forum: https://website-gjgyoiava-cws-projects-e62034bb.vercel.app/forum`);
    console.log(`   3. Test Search: Sign in and search for companies`);
    console.log(`   4. Verify all functionality is now working with data`);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedMissingData().catch(console.error); 