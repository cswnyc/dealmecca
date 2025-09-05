import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleComments = [
  // Comments for Hot Opportunities posts
  {
    postTitle: "URGENT: Major automotive client",
    comments: [
      {
        content: "This sounds exactly like what we've been working on with Ford! Our CTV campaigns in Detroit showed 35% higher showroom visits than traditional media. Happy to share case studies if helpful.",
        isAnonymous: false
      },
      {
        content: "Reach out if you need premium inventory connections. We have direct relationships with Roku and Samsung TV+ that could fast-track this.",
        isAnonymous: false
      },
      {
        content: "Anonymous tip: The OEM is likely GM based on the timing and budget. They've been testing CTV heavily in Q4. Foot traffic measurement will be key to winning this.",
        isAnonymous: true,
        anonymousHandle: "DetroitInsider"
      }
    ]
  },
  {
    postTitle: "Fortune 500 Retail Chain",
    comments: [
      {
        content: "We just completed a similar engagement with a major retailer. Data-driven creative optimization was the game changer - increased ROAS by 240%. The key was real-time creative testing across TikTok and YouTube.",
        isAnonymous: false
      },
      {
        content: "Retail media experience is absolutely crucial here. Make sure your case studies show incremental lift, not just attribution. That's what they really care about.",
        isAnonymous: false
      }
    ]
  },

  // Comments for Account Intelligence posts  
  {
    postTitle: "Procter & Gamble restructuring",
    comments: [
      {
        content: "Can confirm the Sarah Chen hire - she's brilliant. Worked with her at GroupM on several P&G campaigns. She's big on measurement and will push for much more sophisticated attribution models.",
        isAnonymous: false
      },
      {
        content: "This mirrors what we're seeing at Unilever. Big CPG companies are all moving toward centralized digital operations. The agencies that adapt to this consultative model will win big.",
        isAnonymous: false
      },
      {
        content: "Tom Rodriguez was actually my contact there. Super collaborative guy. If you worked with him, you'll want to maintain that relationship as he transitions to consulting.",
        isAnonymous: false
      }
    ]
  },
  {
    postTitle: "Disney's Q1 2025 upfront strategy",
    comments: [
      {
        content: "The retail media piece is huge. Disney+ subscriber data combined with Amazon DSP targeting is incredibly powerful for CPG brands. We've seen 3x engagement rates.",
        isAnonymous: false
      },
      {
        content: "YouTube Shorts investment makes total sense. Their user-generated content strategy for Marvel and Star Wars has been crushing it. Agencies need creator network capabilities.",
        isAnonymous: false
      }
    ]
  },

  // Comments for Success Stories
  {
    postTitle: "15M CPG account with creative data storytelling",
    comments: [
      {
        content: "This is brilliant! We've been struggling with similar client feedback about being 'data overwhelmed.' Mind sharing more details about your interactive narrative approach?",
        isAnonymous: false
      },
      {
        content: "The consumer testimonial integration is genius. We did something similar with video case studies and it completely changed how clients viewed our performance data.",
        isAnonymous: false
      },
      {
        content: "That insight about the 'failed' Facebook campaign is so valuable. It shows how important it is to look beyond surface-level metrics and understand the full customer journey.",
        isAnonymous: false
      }
    ]
  },

  // Comments for Networking posts
  {
    postTitle: "Advertising Week NYC",
    comments: [
      {
        content: "I'll be there! Definitely interested in the Disney/Netflix partnership insights. Let's grab coffee at Blue Bottle on Wednesday morning.",
        isAnonymous: false
      },
      {
        content: "Would love to connect! Working on similar supply path optimization challenges with major automotive clients. Will DM you my contact info.",
        isAnonymous: false
      }
    ]
  },

  // Comments for Quick Questions
  {
    postTitle: "Best CTV measurement partners",
    comments: [
      {
        content: "We've had great success with iSpot.tv for automotive. Their foot traffic attribution is solid and they have specific dealership visit tracking. Nielsen is more expensive but has the brand lift studies you mentioned.",
        isAnonymous: false
      },
      {
        content: "Upwave is fantastic for brand lift but weaker on foot traffic. For automotive specifically, I'd go with iSpot or Comscore. Both have good automotive vertical expertise.",
        isAnonymous: false
      },
      {
        content: "Used Nielsen Catalina for a major auto client last year. Expensive but the attribution modeling was spot-on. ROI justified the cost when we proved digital drove 45% of dealership visits.",
        isAnonymous: false
      }
    ]
  },
  {
    postTitle: "Retail Media budgets",
    comments: [
      {
        content: "We're seeing 25-30% for most CPG clients in 2024. It's definitely accelerating - up from 15-20% just last year. Amazon DSP performance has been the main driver.",
        isAnonymous: false
      },
      {
        content: "Our retail clients are at about 20% but planning to hit 35% by end of 2025. Walmart Connect and Target Roundel are getting more budget as they improve their targeting capabilities.",
        isAnonymous: false
      }
    ]
  },

  // Comments for Industry Insights  
  {
    postTitle: "death of third-party cookies",
    comments: [
      {
        content: "Great analysis! We've been testing Privacy Sandbox with 3 major clients and seeing similar results. Topics API is performing better than expected, but FLEDGE still needs work.",
        isAnonymous: false
      },
      {
        content: "The gradual transition approach is smart. We're advising clients to allocate 20% of programmatic budget to cookieless testing now rather than waiting for the forced transition.",
        isAnonymous: false
      },
      {
        content: "First-party data partnerships are becoming incredibly valuable. We've seen CPMs drop 30-40% for clients with strong zero-party data collection strategies.",
        isAnonymous: false
      },
      {
        content: "Identity resolution partnerships are the key. LiveRamp and InfoSum integration should be every agency's priority right now. The agencies that figure this out first will have a huge competitive advantage.",
        isAnonymous: false
      }
    ]
  }
];

async function createSampleComments() {
  console.log('🗨️ Creating sample comments...\n');

  try {
    // Get admin user to author comments
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    
    if (!adminUser) {
      console.error('No admin user found. Please create an admin user first.');
      return;
    }

    // Get all posts
    const posts = await prisma.forumPost.findMany({
      select: { id: true, title: true }
    });

    let totalCommentsCreated = 0;

    for (const commentData of sampleComments) {
      // Find the post that matches this comment set
      const post = posts.find(p => p.title.includes(commentData.postTitle.substring(0, 20)));
      
      if (!post) {
        console.warn(`Post not found for: ${commentData.postTitle}`);
        continue;
      }

      console.log(`Adding comments to: ${post.title}`);

      // Create comments for this post
      for (const comment of commentData.comments) {
        await prisma.forumComment.create({
          data: {
            content: comment.content,
            postId: post.id,
            authorId: adminUser.id,
            isAnonymous: comment.isAnonymous || false,
            anonymousHandle: comment.anonymousHandle || null
          }
        });
        
        totalCommentsCreated++;
        console.log(`  ✅ Added comment (${comment.isAnonymous ? 'anonymous' : 'signed'})`);
      }
    }

    console.log(`\n🎉 Created ${totalCommentsCreated} sample comments!`);
    
    // Show final summary
    const finalCommentCount = await prisma.forumComment.count();
    const postsWithComments = await prisma.forumPost.findMany({
      include: {
        _count: { select: { comments: true } }
      },
      where: {
        comments: {
          some: {}
        }
      }
    });
    
    console.log(`\n📊 Forum Summary:`);
    console.log(`- Total comments: ${finalCommentCount}`);
    console.log(`- Posts with comments: ${postsWithComments.length}`);
    
    console.log(`\nPosts with comment counts:`);
    postsWithComments.forEach(post => {
      console.log(`- ${post.title}: ${post._count.comments} comments`);
    });
    
  } catch (error) {
    console.error('❌ Error creating comments:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleComments();