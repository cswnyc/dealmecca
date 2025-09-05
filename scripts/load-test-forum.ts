/**
 * Forum Load Testing Script
 * Creates large datasets to test UI performance with many posts and comments
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Large dataset for stress testing
const loadTestPosts = [
  {
    title: "Q4 2024 Media Budget Trends - What We're Seeing",
    content: "Based on conversations with 50+ CMOs this quarter, here are the major budget allocation trends for Q4 and early 2025...",
    categorySlug: "industry-insights",
    tags: "Q4-budgets, media-planning, CMO-insights, 2025-trends"
  },
  {
    title: "BREAKING: Major Agency Merger Announced",
    content: "Just heard through industry contacts that two major holding companies are in advanced merger talks...",
    categorySlug: "industry-insights", 
    tags: "merger, acquisition, holding-companies, industry-news"
  },
  {
    title: "Urgent: Fortune 100 CPG Client RFP Due Friday",
    content: "Major consumer goods company looking for new media AOR. $25M+ annual budget...",
    categorySlug: "hot-opportunities",
    tags: "CPG, RFP, 25M-budget, AOR, urgent"
  },
  {
    title: "Disney+ Password Sharing Impact on Ad Strategy",
    content: "With Disney+ cracking down on password sharing, what does this mean for addressable advertising strategies?",
    categorySlug: "industry-insights",
    tags: "Disney+, password-sharing, addressable-advertising, streaming"
  },
  {
    title: "Won $8M Automotive Account - Attribution Strategy That Worked",
    content: "After 6 months of pitching, finally landed this major automotive account. The key was our cross-device attribution approach...",
    categorySlug: "success-stories",
    tags: "automotive, 8M-account, attribution, cross-device, win"
  }
];

const commentTemplates = [
  "This is exactly what we're seeing with our clients too. The {topic} trend is accelerating faster than expected.",
  "Great insights! We just implemented something similar and saw {percentage}% improvement in {metric}.",
  "Anyone else finding {challenge} to be a major obstacle? We've tried {solution} but results have been mixed.",
  "Totally agree on the {point} aspect. Our {client_type} clients are asking for this constantly now.",
  "We had a similar situation with {company_type}. What worked for us was {approach} - might be worth trying.",
  "This reminds me of the {industry} challenges from {time_period}. History tends to repeat itself in {context}.",
  "Has anyone tested {technology} for this use case? Considering it for our {client_size} client portfolio.",
  "The {metric} numbers are impressive! What attribution model did you use to measure {outcome}?",
  "Similar experience here. {Challenge} was our biggest hurdle, but {solution} made all the difference.",
  "Thanks for sharing! The {insight} about {topic} is particularly valuable for {audience} marketers."
];

const anonymousHandles = [
  "AdTechInsider", "MediaMaven", "ProgrammaticPro", "DataDriven", "CreativeDirector",
  "PerformanceMarketer", "BrandStrategist", "DigitalNative", "CampaignGuru", "MetricsExpert",
  "InnovationLead", "GrowthHacker", "ConversionOptimizer", "AudienceBuilder", "RetargetingPro"
];

async function createLoadTestData() {
  console.log('⚡ Creating load test data for forum performance testing...\n');

  try {
    // Get categories and admin user
    const categories = await prisma.forumCategory.findMany();
    const categoryMap = new Map(categories.map(cat => [cat.slug, cat.id]));
    
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    
    if (!adminUser) {
      console.error('❌ No admin user found');
      return;
    }

    console.log('📝 Step 1: Creating additional posts...');

    // Create multiple variations of each post template
    const postsToCreate = [];
    for (let variation = 1; variation <= 5; variation++) {
      for (const postTemplate of loadTestPosts) {
        postsToCreate.push({
          ...postTemplate,
          title: `[${variation}] ${postTemplate.title}`,
          content: `${postTemplate.content}\n\n**Update ${variation}:** Additional context and insights for this iteration of the discussion.`,
          tags: `${postTemplate.tags}, variation-${variation}`
        });
      }
    }

    let createdPosts = 0;
    for (const postData of postsToCreate) {
      const categoryId = categoryMap.get(postData.categorySlug);
      if (!categoryId) continue;

      try {
        await prisma.forumPost.create({
          data: {
            title: postData.title,
            content: postData.content,
            categoryId: categoryId,
            authorId: adminUser.id,
            urgency: 'MEDIUM',
            tags: postData.tags,
            slug: postData.title.toLowerCase()
              .replace(/[^\w\s-]/g, '')
              .replace(/\s+/g, '-')
              .substring(0, 80) + '-' + Date.now() + '-' + Math.random().toString(36).substring(7),
            views: Math.floor(Math.random() * 500) + 50,
            upvotes: Math.floor(Math.random() * 75) + 5,
            downvotes: Math.floor(Math.random() * 10),
            mediaType: 'text'
          }
        });
        createdPosts++;
      } catch (error: any) {
        if (error.code !== 'P2002') { // Ignore duplicate key errors
          console.warn(`Warning: Could not create post "${postData.title}"`);
        }
      }
    }

    console.log(`✅ Created ${createdPosts} additional posts`);

    console.log('\n💬 Step 2: Creating bulk comments...');

    // Get all posts to add comments to
    const allPosts = await prisma.forumPost.findMany({
      select: { id: true, title: true }
    });

    let createdComments = 0;
    const targetCommentsPerPost = 8; // Create many comments per post

    for (const post of allPosts) {
      const existingComments = await prisma.forumComment.count({
        where: { postId: post.id }
      });

      const commentsToCreate = Math.max(0, targetCommentsPerPost - existingComments);
      
      for (let i = 0; i < commentsToCreate; i++) {
        const template = commentTemplates[Math.floor(Math.random() * commentTemplates.length)];
        const isAnonymous = Math.random() > 0.7; // 30% anonymous
        
        // Replace template variables with realistic values
        const content = template
          .replace('{topic}', ['programmatic', 'CTV', 'attribution', 'measurement'][Math.floor(Math.random() * 4)])
          .replace('{percentage}', (Math.floor(Math.random() * 200) + 50).toString())
          .replace('{metric}', ['ROAS', 'CTR', 'conversion rate', 'brand lift'][Math.floor(Math.random() * 4)])
          .replace('{challenge}', ['attribution', 'measurement', 'fraud', 'targeting'][Math.floor(Math.random() * 4)])
          .replace('{solution}', ['first-party data', 'clean rooms', 'server-side tracking'][Math.floor(Math.random() * 3)])
          .replace('{point}', ['measurement', 'targeting', 'creative', 'budget'][Math.floor(Math.random() * 4)])
          .replace('{client_type}', ['enterprise', 'mid-market', 'startup'][Math.floor(Math.random() * 3)])
          .replace('{company_type}', ['retail', 'automotive', 'CPG', 'financial'][Math.floor(Math.random() * 4)])
          .replace('{approach}', ['incremental testing', 'phased rollout', 'A/B testing'][Math.floor(Math.random() * 3)])
          .replace('{industry}', ['retail', 'automotive', 'finance'][Math.floor(Math.random() * 3)])
          .replace('{time_period}', ['2020', 'pre-iOS 14.5', 'early pandemic'][Math.floor(Math.random() * 3)])
          .replace('{context}', ['digital advertising', 'media planning', 'programmatic'][Math.floor(Math.random() * 3)])
          .replace('{technology}', ['GA4', 'server-side tracking', 'privacy sandbox'][Math.floor(Math.random() * 3)])
          .replace('{client_size}', ['enterprise', 'mid-market'][Math.floor(Math.random() * 2)])
          .replace('{insight}', ['data point', 'analysis', 'strategy'][Math.floor(Math.random() * 3)])
          .replace('{outcome}', ['lift', 'attribution', 'ROI'][Math.floor(Math.random() * 3)])
          .replace('{audience}', ['B2B', 'B2C', 'e-commerce'][Math.floor(Math.random() * 3)]);

        try {
          await prisma.forumComment.create({
            data: {
              content,
              postId: post.id,
              authorId: adminUser.id,
              isAnonymous,
              anonymousHandle: isAnonymous ? 
                anonymousHandles[Math.floor(Math.random() * anonymousHandles.length)] : null
            }
          });
          createdComments++;
        } catch (error) {
          // Skip errors and continue
        }
      }
    }

    console.log(`✅ Created ${createdComments} additional comments`);

    console.log('\n📊 Step 3: Final statistics...');

    // Get final statistics
    const finalStats = {
      categories: await prisma.forumCategory.count(),
      posts: await prisma.forumPost.count(),
      comments: await prisma.forumComment.count(),
      users: await prisma.user.count()
    };

    // Get category breakdown
    const categoryBreakdown = await Promise.all(
      categories.map(async (cat) => ({
        name: cat.name,
        posts: await prisma.forumPost.count({ where: { categoryId: cat.id } }),
        comments: await prisma.forumComment.count({
          where: { post: { categoryId: cat.id } }
        })
      }))
    );

    console.log('🎉 Load test data creation complete!');
    console.log('=====================================');
    console.log(`📁 Total categories: ${finalStats.categories}`);
    console.log(`📝 Total posts: ${finalStats.posts}`);
    console.log(`💬 Total comments: ${finalStats.comments}`);
    console.log(`👥 Total users: ${finalStats.users}`);

    const avgCommentsPerPost = Math.round((finalStats.comments / finalStats.posts) * 10) / 10;
    console.log(`📈 Average comments per post: ${avgCommentsPerPost}`);

    console.log('\n📋 Category breakdown (sorted by activity):');
    categoryBreakdown
      .sort((a, b) => (b.posts + b.comments) - (a.posts + a.comments))
      .forEach(cat => {
        console.log(`   ${cat.name}: ${cat.posts} posts, ${cat.comments} comments`);
      });

    console.log('\n🎯 Performance Testing Ready!');
    console.log('=============================');
    console.log('Now you can test the forum management interface with substantial data:');
    console.log('');
    console.log('1. 📱 Navigate to: http://localhost:3000/admin/forum-categories');
    console.log('2. 🔍 Test category expansion with many posts');
    console.log('3. ✏️  Test post editing with realistic content'); 
    console.log('4. 💬 Test comment expansion with many comments');
    console.log('5. 📊 Verify performance remains smooth with large datasets');
    console.log('');
    console.log('✅ The UI should handle:');
    console.log('   - Categories with 5+ posts each');
    console.log('   - Posts with 8+ comments each');  
    console.log('   - Mix of signed and anonymous comments');
    console.log('   - Realistic industry content');

  } catch (error) {
    console.error('❌ Error creating load test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createLoadTestData();