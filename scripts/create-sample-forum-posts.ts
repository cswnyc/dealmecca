import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleForumPosts = [
  // Hot Opportunities
  {
    title: "🔥 URGENT: Major automotive client looking for CTV partners in Detroit",
    content: `Just got word that a major automotive OEM (think top 3) is looking for Connected TV partners for their Q1 2025 campaign. 

**Details:**
- $2.5M budget for Detroit/Michigan market
- Looking for premium inventory (Hulu, Roku, Samsung TV+)
- Need demo targeting: Adults 25-54, HHI $75K+
- Campaign starts Feb 1st, need responses by Monday

Anyone have strong CTV relationships in automotive? This could be a great opportunity to break into their national media planning. DM me if interested - need to move fast on this one!`,
    categorySlug: "hot-opportunities",
    urgency: "HIGH" as const,
    dealSize: "LARGE" as const,
    tags: "automotive, CTV, Detroit, Q1-2025, urgent",
    location: "Detroit, MI"
  },
  
  {
    title: "Fortune 500 Retail Chain - Digital Video RFP ($8M)",
    content: `Major retail chain issuing RFP for national digital video campaign. They're consolidating from 3 agencies down to 1 preferred partner.

**Campaign Overview:**
- $8M total budget across 12 months
- Focus on YouTube, Facebook/Instagram, TikTok
- Must have retail vertical experience
- Looking for data-driven creative optimization
- RFP due December 15th

**What they're looking for:**
- Case studies in retail/e-commerce
- Proprietary audience data
- Creative production capabilities
- Real-time optimization platform

This is a relationship I've been building for 2 years. Happy to make intros for the right partner. Must have serious retail chops though - they'll see right through generic pitches.`,
    categorySlug: "hot-opportunities",
    urgency: "MEDIUM" as const,
    dealSize: "ENTERPRISE" as const,
    tags: "retail, digital-video, RFP, 8M-budget, december-deadline"
  },

  // Account Intelligence
  {
    title: "📊 Procter & Gamble restructuring their media team - what we know",
    content: `Getting interesting signals from P&G about major changes coming to their media operations. Thought I'd share what I'm hearing:

**Key Changes:**
- Consolidating 5 regional media leads into 3 global roles
- New Head of Programmatic hired from Google (starts January)
- Shifting 40% more budget to digital (up from current 60% to projected 85%)
- Exploring in-housing more programmatic buying

**People Moves:**
- Sarah Chen (former GroupM) joining as VP Digital Strategy
- Tom Rodriguez moving from brand side to consultancy role
- Media budget decision-making becoming more centralized

**What this means:**
- Existing agency relationships under review
- More emphasis on data/measurement
- Opportunity for specialists vs. generalist agencies

Anyone else hearing similar? This could signal broader industry trend toward in-housing.`,
    categorySlug: "account-intelligence",
    urgency: "LOW" as const,
    tags: "P&G, restructuring, programmatic, in-housing, people-moves"
  },

  {
    title: "Disney's Q1 2025 upfront strategy - insider perspective",
    content: `Just wrapped a strategy session with Disney's media investment team. Sharing some insights that might help everyone prepare:

**Budget Increases:**
- Theatrical marketing up 25% YoY
- Disney+ acquisition spend increasing 40%
- Park/Experience marketing flat (focusing on yield optimization)

**Channel Strategy:**
- Heavy investment in YouTube Shorts & TikTok
- Pulling back on traditional linear for non-sports content
- Testing retail media partnerships (Amazon DSP, Walmart Connect)

**Partnership Priorities:**
- Looking for agencies with strong influencer relationships
- Data clean room capabilities are table stakes now
- Creative production speed/agility more important than perfection

**Timeline:**
- Upfront meetings start February 1st
- Looking to finalize partners by March 15th
- Q2 activation begins immediately after

This is based on a conversation with their SVP of Media Investment. Take it with appropriate grain of salt, but seems legit to me.`,
    categorySlug: "account-intelligence",
    urgency: "LOW" as const,
    tags: "Disney, upfront, Q1-2025, streaming, theatrical, budget-increase"
  },

  // Success Stories
  {
    title: "🎯 How we won a $15M CPG account with creative data storytelling",
    content: `Wanted to share a recent win that might help others. We just landed a major CPG account ($15M AOR) by completely reimagining how we present campaign performance.

**The Challenge:**
- Incumbent agency had the relationship for 8 years
- Client felt "data overwhelmed" by traditional reporting
- CMO wanted "stories, not spreadsheets"

**Our Approach:**
- Created interactive campaign narratives instead of static reports
- Used video testimonials from consumers who engaged with ads
- Built custom dashboard showing customer journey in real-time
- Presented insights as business recommendations, not media metrics

**The Winning Moment:**
During final presentation, we showed how a "failed" Facebook campaign actually drove the highest quality leads - just to a different product line. Previous agency had marked it as underperforming. Client realized they'd been optimizing for wrong KPIs.

**Key Learnings:**
1. Data visualization matters more than data volume
2. Consumer voice + performance data = powerful combination
3. Sometimes "failing" campaigns reveal bigger opportunities
4. CMOs want strategic partners, not just execution teams

Happy to share more details if helpful. This approach has now worked for 3 major pitches.`,
    categorySlug: "success-stories",
    urgency: "LOW" as const,
    dealSize: "ENTERPRISE" as const,
    tags: "CPG, 15M-AOR, data-storytelling, pitch-win, creative-approach"
  },

  {
    title: "Closed $3.2M automotive deal by solving their attribution problem",
    content: `Quick win story that demonstrates the power of understanding client pain points beyond media execution.

**The Setup:**
- Automotive dealer group struggling with digital attribution
- Previous agency focused only on last-click metrics
- Dealership visits weren't connecting to digital touchpoints
- Client considered pulling digital budget back to traditional

**Our Solution:**
- Implemented cross-device tracking with their CRM
- Created "digital test drives" campaign linking online to showroom
- Built custom attribution model including foot traffic data
- Showed true customer journey from awareness to purchase

**Results:**
- Proved digital drove 40% of showroom visits (not just 8% last-click)
- Increased digital budget allocation from 35% to 65%
- Won 3-year contract extension worth $3.2M
- Client now advocates for our approach to other dealer groups

**Takeaway:**
Sometimes the biggest opportunity isn't winning new business - it's solving the problem that's frustrating your current client. Attribution challenges are everywhere in automotive. Solve it once, and it becomes a repeatable competitive advantage.`,
    categorySlug: "success-stories",
    urgency: "LOW" as const,
    dealSize: "LARGE" as const,
    tags: "automotive, attribution, 3.2M-deal, cross-device, foot-traffic"
  },

  // Networking
  {
    title: "🤝 Who's attending Advertising Week NYC? Let's connect!",
    content: `Planning for Advertising Week NYC (Oct 21-24) and would love to connect with fellow DealMecca members!

**My Schedule:**
- Monday: Programmatic Summit (morning)
- Tuesday: Connected TV panels + Client meetings
- Wednesday: Available for coffee/drinks
- Thursday: Retail Media Summit

**Looking to Connect With:**
- Agency leaders exploring AI/automation tools
- Brand marketers interested in first-party data solutions
- Anyone working in automotive or financial services verticals

**What I Can Share:**
- Insights from recent Disney/Netflix partnership discussions
- New measurement approaches we're testing with major CPG clients
- Programmatic supply path optimization strategies

**Coffee Spots I'll Be Near:**
- Blue Bottle (Hudson Yards) - Wednesday 9-11am
- Ralph's Coffee (Times Square) - Thursday 2-4pm

Drop a comment or DM if you'd like to meet up! Always great to put faces to names from our community discussions.

PS - Happy to share my contact list of must-attend parties if you're looking for good networking events 🎉`,
    categorySlug: "networking",
    urgency: "LOW" as const,
    tags: "advertising-week, NYC, networking, coffee-meetings, events"
  },

  {
    title: "Denver Media Professionals - Monthly Meetup Tomorrow!",
    content: `Monthly Denver Media Meetup is tomorrow (Thursday) at 6pm! 

**Location:** Ratio Beerworks (RiNo District)
**Time:** 6:00-8:30pm
**Topic:** "Navigating Economic Uncertainty in Media Planning"

**Guest Speaker:** Maria Santos, VP Media Investment at Carat
She'll be sharing strategies for budget optimization during economic downturns + Q&A session.

**Who Should Come:**
- Media planners/buyers from agency or brand side
- AdTech professionals
- Anyone interested in connecting with Denver media community

**What to Expect:**
- 30min presentation + discussion
- Casual networking with local professionals
- Happy hour pricing on drinks
- No sales pitches (strictly enforced!)

This group has led to several job opportunities and business partnerships. Last month we had 35 people including folks from GroupM, Horizon, and local agencies.

RSVP in comments so I can give restaurant accurate headcount. Looking forward to seeing everyone!`,
    categorySlug: "networking",
    urgency: "HIGH" as const,
    tags: "Denver, meetup, tomorrow, monthly, networking, happy-hour",
    location: "Denver, CO"
  },

  // Quick Questions
  {
    title: "⚡ Quick help: Best CTV measurement partners for automotive?",
    content: `Need fast advice from the community!

Working on CTV proposal for major automotive client. They want third-party measurement beyond standard platform reporting.

**Requirements:**
- Brand lift studies
- Foot traffic attribution to dealerships
- Cross-device/cross-platform deduplication
- Automotive vertical experience

**Considering:**
- Nielsen Catalina Solutions
- Comscore
- iSpot.tv
- Upwave

Anyone have recent experience with these vendors in automotive? Which one gave you best insights for dealership attribution?

Need to submit vendor recommendation by EOD Friday. Thanks in advance! 🙏`,
    categorySlug: "quick-questions",
    urgency: "HIGH" as const,
    tags: "CTV, measurement, automotive, vendor-recommendation, urgent"
  },

  {
    title: "Retail Media budgets - what % are you seeing?",
    content: `Quick survey question for the community:

What percentage of total digital budgets are your retail clients allocating to retail media networks (Amazon DSP, Walmart Connect, Target Roundel, etc.) in 2024?

**Context:** 
- Working on 2025 planning with major CPG client
- They're currently at 15% of digital going to retail media
- Wondering if they're behind or ahead of curve

**Quick poll in comments:**
- Less than 10%
- 10-20%
- 20-30%  
- 30%+

Also curious - are you seeing this trend accelerate or plateau? Client is debating whether to double down or hold steady.

Thanks for quick feedback! 📊`,
    categorySlug: "quick-questions",
    urgency: "MEDIUM" as const,
    tags: "retail-media, budget-allocation, 2025-planning, CPG, poll"
  },

  // Industry Insights
  {
    title: "📈 The death of third-party cookies: what we learned from Chrome's latest delay",
    content: `Chrome just delayed third-party cookie deprecation (again) until Q3 2025. Here's what this means for our industry and how agencies should prepare:

**Why the Delay Matters:**
- Gives more time to test cookieless solutions without pressure
- Allows proper measurement of Privacy Sandbox performance
- Reduces client panic about "cookie apocalypse"

**What We're Seeing in Testing:**
- Topics API showing 65-80% reach vs. cookie targeting
- FLEDGE remarketing performing 40-60% of cookie-based campaigns  
- First-party data strategies becoming table stakes, not competitive advantage

**Client Implications:**
- Stop treating this as urgent crisis, start treating as strategic evolution
- Focus on data collection and clean room partnerships now
- Test cookieless campaigns at 10-20% budget allocation

**Agency Preparedness:**
- Invest in identity resolution partnerships (LiveRamp, InfoSum)
- Build first-party data consulting capabilities
- Create cookieless measurement frameworks

**Prediction:** This delay means we'll see more gradual adoption rather than "big bang" transition. Smart agencies will use this time to become cookieless experts before clients are forced to change.

What are you seeing in your cookieless testing? Results better or worse than expected?`,
    categorySlug: "industry-insights",
    urgency: "LOW" as const,
    tags: "third-party-cookies, chrome-delay, privacy-sandbox, cookieless, first-party-data"
  }
];

async function createSamplePosts() {
  console.log('🚀 Creating sample forum posts...\n');

  try {
    // Get forum categories
    const categories = await prisma.forumCategory.findMany();
    const categoryMap = new Map(categories.map(cat => [cat.slug, cat.id]));

    // Get a sample user to author posts
    const users = await prisma.user.findMany({ take: 1 });
    if (users.length === 0) {
      console.error('No users found. Please create a user first.');
      return;
    }
    const authorId = users[0].id;

    // Create posts
    for (const postData of sampleForumPosts) {
      const categoryId = categoryMap.get(postData.categorySlug);
      if (!categoryId) {
        console.warn(`Category not found: ${postData.categorySlug}`);
        continue;
      }

      const post = await prisma.forumPost.create({
        data: {
          title: postData.title,
          content: postData.content,
          categoryId: categoryId,
          authorId: authorId,
          urgency: postData.urgency,
          dealSize: postData.dealSize || null,
          tags: postData.tags,
          location: postData.location || null,
          slug: postData.title.toLowerCase()
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .substring(0, 100), // Limit length
          views: Math.floor(Math.random() * 200) + 10, // Random views
          upvotes: Math.floor(Math.random() * 50) + 1, // Random upvotes
          downvotes: Math.floor(Math.random() * 5), // Few downvotes
          mediaType: 'text'
        }
      });

      console.log(`✅ Created post: ${post.title}`);
    }

    console.log('\n🎉 Sample forum posts created successfully!');
    
    // Show summary
    const postCount = await prisma.forumPost.count();
    const categoryCount = await prisma.forumCategory.count();
    
    console.log(`\n📊 Forum Summary:`);
    console.log(`- ${categoryCount} categories`);
    console.log(`- ${postCount} posts`);
    
  } catch (error) {
    console.error('❌ Error creating sample posts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSamplePosts();