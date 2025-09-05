import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const newCategories = [
  {
    name: "💡 Product Feedback",
    slug: "product-feedback",
    description: "Suggestions and feedback about platform features and improvements",
    color: "#10B981",
    icon: "💡",
    order: 8,
    isActive: true
  },
  {
    name: "🏆 Awards & Recognition", 
    slug: "awards-recognition",
    description: "Celebrate wins, awards, and professional achievements",
    color: "#F59E0B",
    icon: "🏆",
    order: 9,
    isActive: true
  },
  {
    name: "🔧 Technical Help",
    slug: "technical-help", 
    description: "Technical questions about tools, platforms, and integrations",
    color: "#6366F1",
    icon: "🔧",
    order: 10,
    isActive: true
  },
  {
    name: "🎓 Learning & Development",
    slug: "learning-development",
    description: "Training resources, certifications, and skill development",
    color: "#8B5CF6",
    icon: "🎓", 
    order: 11,
    isActive: true
  }
];

const samplePostsForNewCategories = [
  // Product Feedback
  {
    title: "💡 Feature Request: Advanced Search Filters",
    content: `Would love to see more granular search filters in the platform. Currently missing:

**Suggested Filters:**
- Company size (startup, mid-market, enterprise)
- Geographic region (beyond just city/state)  
- Industry sub-categories (e.g. automotive → luxury vs. mass market)
- Contact seniority levels
- Last activity date

**Use Case:**
When prospecting for automotive clients, I need to distinguish between luxury brands (BMW, Mercedes) vs. mass market (Toyota, Honda) as the approach is completely different.

**Priority:** Medium - would significantly improve prospecting efficiency

Anyone else find the current filters limiting? What other filters would be helpful?`,
    categorySlug: "product-feedback",
    urgency: "LOW",
    tags: "feature-request, search-filters, prospecting, user-experience"
  },
  {
    title: "Bug Report: Mobile search results not loading",
    content: `Experiencing issues with search on mobile (iPhone Safari):

**Problem:** Search results not loading properly on mobile devices
**Steps to reproduce:** 
1. Open platform on iPhone Safari
2. Search for any company name
3. Results show loading spinner indefinitely

**Workaround:** Works fine in desktop browser and Chrome mobile

**Impact:** High - can't use platform effectively on mobile

Anyone else seeing this? Is there a fix coming?`,
    categorySlug: "product-feedback", 
    urgency: "HIGH",
    tags: "bug-report, mobile, search-results, iPhone, Safari"
  },

  // Awards & Recognition
  {
    title: "🏆 Just won Agency of the Year at AdTech Awards!",
    content: `Incredible news - our team just took home Agency of the Year at the AdTech Innovation Awards! 

**Categories we won:**
- Best Use of Data in Advertising
- Most Innovative Campaign (automotive sector)
- Rising Agency of the Year

**What got us there:**
- Our cookieless attribution solution for major CPG clients
- Cross-platform measurement framework
- 340% average ROAS improvement across portfolio

**Team celebration:** Drinks at Broken Shaker tonight if anyone wants to join!

Huge thanks to this community - so many insights and connections that helped make this possible. The collaborative spirit here is amazing! 🎉

Special shoutout to @sarah-media-maven for the intro to our biggest client win this year.`,
    categorySlug: "awards-recognition",
    urgency: "LOW", 
    tags: "awards, agency-of-the-year, adtech, team-celebration, ROAS"
  },
  {
    title: "Team member featured in AdAge 40 Under 40!",
    content: `So proud - our VP of Strategy just made AdAge's 40 Under 40 list! 

**Recognition highlights:**
- Led $50M+ in new business wins this year
- Pioneered our AI-driven creative optimization platform
- Mentored 12 junior staff members
- Speaking at 8 industry conferences

**Quote from the article:** "Her innovative approach to performance creative has redefined how we think about programmatic advertising."

**What's next:** She's keynoting the Programmatic Summit in March and launching our new AI tools publicly.

Amazing to see talent in our industry getting recognized! Who else from the community has been featured recently? Let's celebrate each other! 👏`,
    categorySlug: "awards-recognition",
    urgency: "LOW",
    tags: "AdAge-40-under-40, recognition, VP-strategy, AI-creative, programmatic"
  },

  // Technical Help  
  {
    title: "🔧 Help: Google Analytics 4 to Facebook Conversions API setup",
    content: `Struggling with GA4 → Facebook CAPI integration. Getting conversion data into GA4 fine, but Facebook side isn't receiving properly.

**Current setup:**
- GA4 Enhanced Ecommerce tracking ✅
- Google Tag Manager implementation ✅  
- Facebook Pixel + CAPI integration ❌

**Error message:**
"Invalid hashed email parameter - must be SHA256 encoded"

**What I've tried:**
- Double-checked email hashing (using SHA256)
- Verified server-side setup matches Facebook documentation
- Tested with Facebook's Event Testing tool

**Question:** Anyone successfully set this up recently? The Facebook documentation seems outdated.

**Urgency:** High - client launch is Monday and conversion tracking is critical for campaign optimization.`,
    categorySlug: "technical-help",
    urgency: "HIGH",
    tags: "GA4, Facebook-CAPI, conversion-tracking, integration, SHA256, urgent"
  },
  {
    title: "Best practices for Amazon DSP API integration?",
    content: `Building custom reporting dashboard that pulls from Amazon DSP API. Looking for best practices and gotchas.

**Requirements:**
- Daily campaign performance pulls
- Attribution data for retail media campaigns  
- Cross-reference with internal client data

**Questions:**
1. Rate limiting - what's the practical limit for API calls?
2. Data freshness - how delayed is DSP reporting data?
3. Authentication - best practices for token management?
4. Error handling - common failure modes to plan for?

**Current approach:** Planning to use Node.js with scheduled cron jobs, storing data in PostgreSQL.

Anyone built something similar? Would love to learn from your experience before diving deep into development.`,
    categorySlug: "technical-help",
    urgency: "MEDIUM", 
    tags: "Amazon-DSP, API-integration, reporting-dashboard, NodeJS, PostgreSQL"
  },

  // Learning & Development
  {
    title: "🎓 Google Analytics 4 Certification Study Group?",
    content: `Planning to tackle the GA4 certification exam next month. Anyone interested in forming a study group?

**Proposed format:**
- Weekly 1-hour video calls
- Shared resource document
- Practice questions and mock exams
- Real-world implementation discussions

**Topics to cover:**
- Enhanced Ecommerce setup
- Custom dimensions and metrics
- Audience building and activation
- Cross-platform attribution  
- Data Studio integration

**Schedule:** Thinking Thursday evenings, 6-7pm EST

**Study materials I've found:**
- Google's official learning path
- Analytics Academy courses
- Measure School YouTube series

Reply if interested! Hoping to get 4-6 people for good discussion dynamics. 📚`,
    categorySlug: "learning-development",
    urgency: "LOW",
    tags: "GA4-certification, study-group, Google-Analytics, learning, certification"
  },
  {
    title: "Recommended courses for programmatic advertising?",
    content: `Looking to level up my programmatic knowledge. Currently managing $2M+ in programmatic spend but feel like I'm missing some fundamentals.

**Background:** 
- 3 years in paid social
- Recently moved to programmatic team
- Strong on campaign setup/optimization
- Weak on technical/bidding strategy side

**Specific areas to strengthen:**
- Header bidding and supply path optimization
- Advanced audience modeling
- Cross-device attribution
- Brand safety and fraud prevention

**Considering:**
- Trade Desk Edge Academy
- Google Marketing Platform certification
- IAB programmatic certification
- Local university digital marketing program

**Budget:** Company will cover up to $2,000 for professional development

Anyone taken these courses? Which ones actually helped in day-to-day work vs. just certification collecting?`,
    categorySlug: "learning-development", 
    urgency: "LOW",
    tags: "programmatic-advertising, professional-development, Trade-Desk, certification, header-bidding"
  }
];

async function createNewCategories() {
  console.log('📁 Creating additional forum categories...\n');

  try {
    // Create new categories
    for (const category of newCategories) {
      try {
        const newCategory = await prisma.forumCategory.create({
          data: category
        });
        console.log(`✅ Created category: ${newCategory.name}`);
      } catch (error: any) {
        if (error.code === 'P2002') {
          console.log(`⚠️  Category already exists: ${category.name}`);
        } else {
          throw error;
        }
      }
    }

    console.log('\n📝 Creating sample posts for new categories...\n');

    // Get admin user and categories
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    
    if (!adminUser) {
      console.error('No admin user found.');
      return;
    }

    const categories = await prisma.forumCategory.findMany();
    const categoryMap = new Map(categories.map(cat => [cat.slug, cat.id]));

    // Create sample posts
    for (const postData of samplePostsForNewCategories) {
      const categoryId = categoryMap.get(postData.categorySlug);
      if (!categoryId) {
        console.warn(`Category not found: ${postData.categorySlug}`);
        continue;
      }

      try {
        const post = await prisma.forumPost.create({
          data: {
            title: postData.title,
            content: postData.content,
            categoryId: categoryId,
            authorId: adminUser.id,
            urgency: postData.urgency as any,
            tags: postData.tags,
            slug: postData.title.toLowerCase()
              .replace(/[^\w\s-]/g, '')
              .replace(/\s+/g, '-')
              .substring(0, 100) + '-' + Date.now(),
            views: Math.floor(Math.random() * 100) + 10,
            upvotes: Math.floor(Math.random() * 25) + 1,
            downvotes: Math.floor(Math.random() * 3),
            mediaType: 'text'
          }
        });

        console.log(`✅ Created post: ${post.title}`);
      } catch (error: any) {
        if (error.code === 'P2002') {
          console.log(`⚠️  Post already exists: ${postData.title}`);
        } else {
          throw error;
        }
      }
    }

    console.log('\n🎉 Successfully created new categories and posts!');
    
    // Show final summary
    const totalCategories = await prisma.forumCategory.count();
    const totalPosts = await prisma.forumPost.count();
    const totalComments = await prisma.forumComment.count();
    
    console.log(`\n📊 Updated Forum Summary:`);
    console.log(`- Total categories: ${totalCategories}`);
    console.log(`- Total posts: ${totalPosts}`);
    console.log(`- Total comments: ${totalComments}`);
    
    const categoriesWithCounts = await prisma.forumCategory.findMany({
      include: {
        _count: { select: { posts: true } }
      },
      orderBy: { order: 'asc' }
    });
    
    console.log(`\nCategories with post counts:`);
    categoriesWithCounts.forEach(cat => {
      console.log(`- ${cat.name}: ${cat._count.posts} posts`);
    });
    
  } catch (error) {
    console.error('❌ Error creating categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createNewCategories();