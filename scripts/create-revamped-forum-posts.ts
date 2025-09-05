import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Concise, question-style forum posts
const revampedForumPosts = [
  {
    content: "Anyone have CTV inventory for automotive in Detroit? $2.5M budget, need responses by Monday.",
    authorEmail: "sarah.chen@publicis.com",
    categorySlug: "hot-opportunities",
    urgency: "HIGH" as const,
    dealSize: "LARGE" as const,
    tags: "automotive, CTV, Detroit, urgent",
    location: "Detroit, MI"
  },
  {
    content: "Major retail chain consolidating to one agency partner - $8M digital video budget. Who's pitching?",
    authorEmail: "christian.juhl@groupm.com",
    categorySlug: "hot-opportunities", 
    urgency: "MEDIUM" as const,
    dealSize: "ENTERPRISE" as const,
    tags: "retail, digital-video, RFP, 8M-budget"
  },
  {
    content: "What's everyone hearing about P&G's media team restructure and in-housing plans?",
    authorEmail: "lisa.anderson@pg.com",
    categorySlug: "account-intelligence",
    urgency: "LOW" as const,
    tags: "P&G, restructuring, programmatic, in-housing"
  },
  {
    content: "Disney shifting 40% more budget to digital for 2025 - anyone have the inside scoop on partnerships?",
    authorEmail: "james.wilson@disney.com",
    categorySlug: "account-intelligence",
    urgency: "LOW" as const,
    tags: "Disney, upfront, 2025, streaming, budget-increase"
  },
  {
    content: "Closed a $15M CPG account using data storytelling instead of traditional reporting - happy to share approach.",
    authorEmail: "amanda.foster@starcom.com",
    categorySlug: "success-stories",
    urgency: "LOW" as const,
    dealSize: "ENTERPRISE" as const,
    tags: "CPG, 15M-AOR, data-storytelling, pitch-win"
  },
  {
    content: "Attribution problem cost us automotive deal - how do you prove digital drives showroom visits?",
    authorEmail: "robert.kim@wavemaker.com",
    categorySlug: "success-stories",
    urgency: "LOW" as const,
    dealSize: "LARGE" as const,
    tags: "automotive, attribution, cross-device, foot-traffic"
  },
  {
    content: "Who's going to Advertising Week NYC? Let's grab coffee - I'll be at Blue Bottle Wednesday 9am.",
    authorEmail: "jessica.williams@mediacom.com",
    categorySlug: "networking",
    urgency: "LOW" as const,
    tags: "advertising-week, NYC, networking, coffee-meetings"
  },
  {
    content: "Denver media folks - monthly meetup tomorrow at 6pm. Who's in?",
    authorEmail: "michael.rodriguez@dentsu.com", 
    categorySlug: "networking",
    urgency: "LOW" as const,
    tags: "Denver, meetup, networking, monthly"
  },
  {
    content: "Best CTV measurement partners for automotive campaigns?",
    authorEmail: "ryan.oconnor@nike.com",
    categorySlug: "quick-questions",
    urgency: "LOW" as const,
    tags: "CTV, measurement, automotive, partners"
  },
  {
    content: "What % of retail media budgets are you seeing this quarter?",
    authorEmail: "maria.gonzalez@coca-cola.com",
    categorySlug: "quick-questions",
    urgency: "LOW" as const, 
    tags: "retail-media, budgets, Q4, percentage"
  },
  {
    content: "Chrome delayed cookies again - anyone else relieved or just frustrated?",
    authorEmail: "emily.thompson@havas.com",
    categorySlug: "industry-insights",
    urgency: "LOW" as const,
    tags: "third-party-cookies, chrome-delay, privacy-sandbox"
  },
  {
    content: "YouTube Shorts vs TikTok for CPG brands - which is performing better?",
    authorEmail: "david.park@zenith.com",
    categorySlug: "industry-insights",
    urgency: "LOW" as const,
    tags: "YouTube-Shorts, TikTok, CPG, performance"
  },
  {
    content: "Anyone using AI for media planning yet? What tools are actually worth it?",
    authorEmail: "kieley.taylor@groupm.com", 
    categorySlug: "quick-questions",
    urgency: "LOW" as const,
    tags: "AI, media-planning, tools, automation"
  },
  {
    content: "Programmatic fees getting out of hand - how are you negotiating with DSPs?",
    authorEmail: "adam.gerhart@mindshare.com",
    categorySlug: "quick-questions", 
    urgency: "MEDIUM" as const,
    tags: "programmatic, fees, DSP, negotiation"
  },
  {
    content: "Just launched first cookieless campaign - reach down 30% but quality up. Worth the trade-off?",
    authorEmail: "rachel.davis@unilever.com",
    categorySlug: "industry-insights",
    urgency: "LOW" as const,
    tags: "cookieless, first-party-data, reach, quality"
  },
  {
    content: "Retail media networks consolidating - which ones are worth the investment?",
    authorEmail: "carlos.martinez@omg.com",
    categorySlug: "industry-insights",
    urgency: "MEDIUM" as const,
    tags: "retail-media, consolidation, investment, networks"
  },
  {
    content: "Client asking for linear TV alternatives - what's working for awareness campaigns?",
    authorEmail: "mark.read@wpp.com",
    categorySlug: "quick-questions",
    urgency: "LOW" as const,
    tags: "linear-TV, alternatives, awareness, campaigns"
  },
  {
    content: "Connected TV pricing up 40% this quarter - anyone finding better inventory sources?",
    authorEmail: "john.wren@omnicom.com",
    categorySlug: "quick-questions",
    urgency: "MEDIUM" as const,
    tags: "CTV, pricing, inventory, Q4"
  }
];

async function createRevampedForumPosts() {
  try {
    console.log('🚀 Creating revamped forum posts...');
    
    // Clear existing forum posts
    console.log('🗑️  Clearing existing forum posts...');
    await prisma.forumPost.deleteMany();
    
    // Get all categories
    const categories = await prisma.forumCategory.findMany();
    const categoryMap = categories.reduce((acc: any, cat) => {
      acc[cat.slug] = cat.id;
      return acc;
    }, {});
    
    // Get all users we created
    const users = await prisma.user.findMany({
      include: { company: true }
    });
    const userMap = users.reduce((acc: any, user) => {
      if (user.email) {
        acc[user.email] = user;
      }
      return acc;
    }, {});
    
    let successCount = 0;
    
    for (const postData of revampedForumPosts) {
      try {
        const author = userMap[postData.authorEmail];
        const categoryId = categoryMap[postData.categorySlug];
        
        if (!author) {
          console.log(`⚠️  Author not found: ${postData.authorEmail}`);
          continue;
        }
        
        if (!categoryId) {
          console.log(`⚠️  Category not found: ${postData.categorySlug}`);
          continue;
        }
        
        // Create slug from content (first 50 chars, cleaned)
        const slug = postData.content
          .toLowerCase()
          .substring(0, 50)
          .replace(/[^a-z0-9\s]/g, '')
          .trim()
          .replace(/\s+/g, '-');
        
        const post = await prisma.forumPost.create({
          data: {
            title: postData.content.substring(0, 100), // Keep title for database compatibility but we won't display it
            content: postData.content,
            slug: slug + '-' + Date.now(), // Add timestamp to ensure uniqueness
            authorId: author.id,
            categoryId: categoryId,
            isAnonymous: false,
            urgency: postData.urgency,
            dealSize: postData.dealSize || null,
            tags: postData.tags,
            location: postData.location || null,
            mediaType: 'text',
            views: Math.floor(Math.random() * 200) + 10, // Random views between 10-200
            upvotes: Math.floor(Math.random() * 50) + 1, // Random upvotes
            downvotes: Math.floor(Math.random() * 5), // Random downvotes
            postType: 'post',
            createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time within last 7 days
          }
        });
        
        console.log(`✅ Created post by ${author.name} (${author.company?.name || 'No company'}): ${postData.content.substring(0, 50)}...`);
        successCount++;
        
      } catch (error) {
        console.error(`❌ Failed to create post: ${postData.content.substring(0, 30)}...`, error);
      }
    }
    
    console.log(`🎉 Successfully created ${successCount} revamped forum posts!`);
    
  } catch (error) {
    console.error('❌ Error creating revamped forum posts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createRevampedForumPosts();