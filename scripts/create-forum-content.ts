#!/usr/bin/env npx tsx
/**
 * Forum Content Generation Script
 * Creates realistic forum posts and comments with mixed anonymous content
 */

import { PrismaClient } from '@prisma/client';
import { USER_TEMPLATES, ADDITIONAL_ANONYMOUS_HANDLES } from './create-forum-users';

const prisma = new PrismaClient();

// Sample forum content templates
const POST_TEMPLATES = {
  deals: [
    {
      title: "{COMPANY_NAME} x {AGENCY_NAME}: New Partnership Deal",
      content: "Major partnership announced between {COMPANY_NAME} and {AGENCY_NAME} - they're expanding their {MEDIA_TYPE} capabilities with a {DEAL_SIZE} budget allocation. This could impact {VERTICAL} pricing across {PLATFORM_TYPE}.",
      tags: ["Partnership", "Media", "Budget", "Strategy"],
      urgency: "MEDIUM"
    },
    {
      title: "Office Space Available - {LOCATION}",
      content: "We have a {SIZE} office space available for sublease in downtown {LOCATION}. Great for startups or small teams. Comes with {AMENITIES}. Contact me if interested!",
      tags: ["Office Space", "Real Estate", "Sublease"],
      urgency: "LOW"
    },
    {
      title: "Equipment Sale - {EQUIPMENT_TYPE}",
      content: "Selling our {EQUIPMENT_TYPE} as we're transitioning to a different setup. Excellent condition, barely used. Originally paid ${ORIGINAL_PRICE}, asking ${ASKING_PRICE}. Includes {INCLUDED_ITEMS}.",
      tags: ["Equipment", "Sales", "Business Assets"],
      urgency: "MEDIUM"
    }
  ],
  networking: [
    {
      title: "{DSP_NAME} Integration with {SSP_NAME}",
      content: "{DSP_NAME} just announced direct integration with {SSP_NAME} for {MEDIA_TYPE} inventory. This should improve {VERTICAL} campaign performance and reduce latency. Beta access rolling out to select {AGENCY_NAME} clients first.",
      tags: ["DSP", "SSP", "Integration", "Performance"],
      urgency: "HIGH"
    },
    {
      title: "{VERTICAL} Upfronts: {COMPANY_NAME} Budget Shift",
      content: "{COMPANY_NAME} moving {DEAL_SIZE} from traditional TV to {MEDIA_TYPE} this upfront season. Big opportunity for {PLATFORM_TYPE} deals. Hearing similar moves from other {VERTICAL} brands.",
      tags: ["Upfronts", "Budget", "CTV", "Shift"],
      urgency: "LOW"
    },
    {
      title: "New {MEDIA_TYPE} Inventory from {SSP_NAME}",
      content: "{SSP_NAME} launching premium {MEDIA_TYPE} inventory partnership with major {VERTICAL} publisher. Looking for {AGENCY_NAME} buyers interested in private marketplace deals starting at {DEAL_SIZE}.",
      tags: ["Inventory", "PMP", "Premium", "Launch"],
      urgency: "MEDIUM"
    }
  ],
  questions: [
    {
      title: "{MEDIA_TYPE} CPM Trends in Q4?",
      content: "Anyone seeing unusual {MEDIA_TYPE} CPM fluctuations in {VERTICAL}? Our {PLATFORM_TYPE} campaigns through {DSP_NAME} are showing higher costs than expected. Is this market-wide or platform-specific?",
      tags: ["CPM", "Q4", "Pricing", "Market"],
      urgency: "MEDIUM"
    },
    {
      title: "Attribution Modeling for {VERTICAL} Campaigns",
      content: "Struggling with attribution for cross-platform {VERTICAL} campaigns. Running {MEDIA_TYPE} and {MEDIA_TYPE} simultaneously through {AGENCY_NAME}. What attribution models work best for {DEAL_SIZE} spends?",
      tags: ["Attribution", "Cross-platform", "Modeling"],
      urgency: "HIGH"
    },
    {
      title: "First-Party Data Strategy with {SSP_NAME}",
      content: "Looking to leverage first-party data through {SSP_NAME} for {VERTICAL} targeting. What's the setup process like? Any {AGENCY_NAME} teams had success with similar {DEAL_SIZE} implementations?",
      tags: ["First-party", "Data", "Targeting"],
      urgency: "HIGH"
    }
  ],
  general: [
    {
      title: "{VERTICAL} Advertising Trends in 2024",
      content: "What shifts are you seeing in {VERTICAL} advertising? Noticing more budget moving from linear to {MEDIA_TYPE}, especially through {PLATFORM_TYPE}. {COMPANY_NAME} and other major brands seem to be testing {DSP_NAME} integrations.",
      tags: ["Trends", "Budget", "Advertising", "2024"],
      urgency: "LOW"
    },
    {
      title: "Cookieless Future: {SSP_NAME} Solutions",
      content: "{SSP_NAME} just released their cookieless targeting solution for {MEDIA_TYPE} campaigns. Early tests with {AGENCY_NAME} showing promising results for {VERTICAL} clients. Anyone else piloting this?",
      tags: ["Cookieless", "Privacy", "Targeting", "Solution"],
      urgency: "LOW"
    },
    {
      title: "Q4 Success: {COMPANY_NAME} Campaign Results",
      content: "Major win for {COMPANY_NAME}'s Q4 {VERTICAL} campaign through {DSP_NAME}! {DEAL_SIZE} spend delivered exceptional ROAS using {MEDIA_TYPE} and {PLATFORM_TYPE} strategy. Happy to share learnings.",
      tags: ["Q4", "Success", "ROAS", "Campaign"],
      urgency: "LOW"
    }
  ]
};

const VARIABLES = {
  COMPANY_NAME: ["Google", "Meta", "Amazon", "Microsoft", "Apple", "Netflix", "Disney", "Nike", "McDonald's", "Walmart"],
  AGENCY_NAME: ["WPP", "Omnicom", "Publicis", "IPG", "Havas", "Dentsu", "GroupM", "Mindshare", "MediaCom", "Zenith"],
  DSP_NAME: ["The Trade Desk", "Amazon DSP", "Google DV360", "Adobe DSP", "Verizon DSP", "Samsung DSP", "Roku DSP"],
  SSP_NAME: ["Google Ad Manager", "Amazon Publisher Services", "PubMatic", "Magnite", "OpenX", "Xandr", "Index Exchange"],
  MEDIA_TYPE: ["CTV", "Display", "Video", "Audio", "Native", "Mobile", "DOOH", "Search"],
  PLATFORM_TYPE: ["programmatic", "direct", "private marketplace", "open exchange", "preferred deals"],
  VERTICAL: ["automotive", "CPG", "retail", "financial services", "healthcare", "travel", "entertainment"],
  DEAL_SIZE: ["$50M", "$100M", "$25M", "$75M", "$150M", "$200M"],
  LOCATION: ["New York", "San Francisco", "Austin", "Chicago", "Denver", "Seattle", "Miami", "Boston"],
  SIZE: ["1,000 sq ft", "1,500 sq ft", "2,000 sq ft", "800 sq ft", "1,200 sq ft"],
  AMENITIES: ["parking, conference room", "kitchen, high-speed internet", "24/7 access, security", "gym access, rooftop"],
  EQUIPMENT_TYPE: ["MacBook Pro setup", "Dell workstation", "Herman Miller chairs", "4K monitors", "podcast equipment"],
  ORIGINAL_PRICE: ["2,500", "3,000", "1,800", "4,200", "1,500"],
  ASKING_PRICE: ["1,800", "2,200", "1,200", "3,000", "1,000"],
  INCLUDED_ITEMS: ["cables, stand, warranty", "keyboard, mouse, adapter", "carrying case, documentation"],
  ROLE: ["Senior Developer", "Marketing Manager", "Sales Director", "Product Manager", "UX Designer", "Data Analyst"],
  COMPANY_SIZE: ["50-person", "startup", "mid-size", "growing", "established"],
  PROJECT_TYPE: ["SaaS platform", "mobile app", "AI solutions", "e-commerce platform", "fintech product"],
  SKILLS: ["React/Node.js", "Python/ML", "SQL/Analytics", "AWS/DevOps", "Figma/Design", "Salesforce"],
  DATE: ["next Friday", "this Saturday", "next Tuesday", "this weekend"],
  VENUE: ["Starbucks downtown", "Blue Bottle Coffee", "local co-working space", "The Coffee Bean"],
  COMPANY_TYPE: ["SaaS startup", "consulting firm", "e-commerce business", "tech company", "marketing agency"],
  CUSTOMER_BASE: ["SMBs", "enterprise clients", "developers", "marketers", "healthcare providers"],
  OPTIONS: ["Salesforce, HubSpot", "Pipedrive, Monday", "Zoho, Freshsales", "ActiveCampaign, ConvertKit"],
  BUDGET: ["10k", "15k", "5k", "25k", "8k"],
  BUSINESS_CHALLENGE: ["customer acquisition", "team scaling", "cash flow", "product-market fit", "competition"],
  BUSINESS_TYPE: ["SaaS startup", "e-commerce store", "consulting business", "mobile app", "marketplace"],
  REVENUE: ["500k", "1.2M", "750k", "2M", "300k"],
  FUNDING_AMOUNT: ["2M", "5M", "1M", "3M", "500k"],
  USE_OF_FUNDS: ["hiring", "marketing", "product development", "expansion", "inventory"],
  TREND_OBSERVATION: ["increased demand for AI tools", "shift to remote work", "focus on sustainability", "emphasis on data privacy"],
  ACHIEVEMENT: ["hit $1M ARR", "launched our mobile app", "closed our Series A", "expanded to Europe", "reached 10k users"]
};

const COMMENT_TEMPLATES = [
  "Great post! We've had similar experiences with {TOPIC}.",
  "Thanks for sharing this. Have you considered {SUGGESTION}?",
  "I'd be interested in learning more about this. DMing you now.",
  "We implemented something similar last year and saw {RESULT}.",
  "This is exactly what we've been looking for! Bookmarking this.",
  "Have you tried {ALTERNATIVE}? Might be worth comparing.",
  "Solid advice. We're dealing with the same challenge at our {COMPANY_TYPE}.",
  "Thanks for the heads up on this deal!",
  "Count me in! This sounds like a great opportunity.",
  "Would love to connect and discuss further."
];

function replaceVariables(text: string): string {
  let result = text;
  
  Object.entries(VARIABLES).forEach(([key, values]) => {
    const placeholder = `{${key}}`;
    if (result.includes(placeholder)) {
      const randomValue = values[Math.floor(Math.random() * values.length)];
      result = result.replace(new RegExp(placeholder, 'g'), randomValue);
    }
  });
  
  return result;
}

function selectRandomTemplate(category: keyof typeof POST_TEMPLATES) {
  const templates = POST_TEMPLATES[category];
  return templates[Math.floor(Math.random() * templates.length)];
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50) + '-' + Math.random().toString(36).substring(2, 8);
}

async function createForumContent() {
  try {
    console.log('🚀 Starting Forum Content Generation...');
    
    // Get all users and categories
    const users = await prisma.user.findMany({
      select: { 
        id: true, 
        name: true, 
        email: true, 
        anonymousHandle: true 
      }
    });
    
    const categories = await prisma.forumCategory.findMany({
      select: { id: true, name: true, slug: true }
    });
    
    if (users.length === 0) {
      console.error('❌ No users found. Run create-forum-users.ts first.');
      return;
    }
    
    if (categories.length === 0) {
      console.error('❌ No forum categories found. Please create some categories first.');
      return;
    }
    
    console.log(`📊 Found ${users.length} users and ${categories.length} categories`);
    
    const createdPosts = [];
    const targetPosts = 80; // Number of posts to create
    
    for (let i = 0; i < targetPosts; i++) {
      try {
        // Select random user and category
        const user = users[Math.floor(Math.random() * users.length)];
        const category = categories[Math.floor(Math.random() * categories.length)];
        
        // Determine if post should be anonymous (30% chance)
        const isAnonymous = Math.random() < 0.3;
        
        // Select appropriate template based on category
        let templateCategory: keyof typeof POST_TEMPLATES = 'general';
        if (category.name.toLowerCase().includes('deal') || category.name.toLowerCase().includes('sale')) {
          templateCategory = 'deals';
        } else if (category.name.toLowerCase().includes('network') || category.name.toLowerCase().includes('job')) {
          templateCategory = 'networking';
        } else if (category.name.toLowerCase().includes('question') || category.name.toLowerCase().includes('help')) {
          templateCategory = 'questions';
        }
        
        const template = selectRandomTemplate(templateCategory);
        
        // Replace variables in template
        const title = replaceVariables(template.title);
        const content = replaceVariables(template.content);
        
        // Generate anonymous handle if needed
        let anonymousHandle = null;
        if (isAnonymous) {
          if (user.anonymousHandle) {
            anonymousHandle = user.anonymousHandle;
          } else {
            // Use a random handle from our list
            anonymousHandle = ADDITIONAL_ANONYMOUS_HANDLES[Math.floor(Math.random() * ADDITIONAL_ANONYMOUS_HANDLES.length)];
          }
        }
        
        // Create the post
        const post = await prisma.forumPost.create({
          data: {
            title,
            content,
            slug: generateSlug(title),
            authorId: user.id,
            categoryId: category.id,
            isAnonymous,
            anonymousHandle,
            tags: template.tags.join(', '),
            urgency: template.urgency,
            mediaType: 'TEXT', // Set default media type
            upvotes: Math.floor(Math.random() * 20),
            downvotes: Math.floor(Math.random() * 3),
            views: Math.floor(Math.random() * 100) + 10,
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)), // Last 7 days
          }
        });
        
        createdPosts.push({
          id: post.id,
          title: post.title,
          isAnonymous: post.isAnonymous,
          anonymousHandle: post.anonymousHandle,
          category: category.name
        });
        
        console.log(`✅ Created post ${i + 1}/${targetPosts}: "${title.substring(0, 50)}..." ${isAnonymous ? '(Anonymous)' : ''}`);
        
        // Create 0-3 comments for each post
        const commentCount = Math.floor(Math.random() * 4);
        for (let j = 0; j < commentCount; j++) {
          const commentUser = users[Math.floor(Math.random() * users.length)];
          const commentIsAnonymous = Math.random() < 0.25; // 25% chance for anonymous comments
          
          let commentAnonymousHandle = null;
          if (commentIsAnonymous) {
            if (commentUser.anonymousHandle) {
              commentAnonymousHandle = commentUser.anonymousHandle;
            } else {
              commentAnonymousHandle = ADDITIONAL_ANONYMOUS_HANDLES[Math.floor(Math.random() * ADDITIONAL_ANONYMOUS_HANDLES.length)];
            }
          }
          
          const commentTemplate = COMMENT_TEMPLATES[Math.floor(Math.random() * COMMENT_TEMPLATES.length)];
          const commentContent = replaceVariables(commentTemplate.replace('{TOPIC}', template.tags[0]).replace('{SUGGESTION}', 'automation tools').replace('{RESULT}', 'great results').replace('{ALTERNATIVE}', 'Zapier').replace('{COMPANY_TYPE}', 'startup'));
          
          await prisma.forumComment.create({
            data: {
              content: commentContent,
              authorId: commentUser.id,
              postId: post.id,
              isAnonymous: commentIsAnonymous,
              anonymousHandle: commentAnonymousHandle,
              upvotes: Math.floor(Math.random() * 10),
              downvotes: Math.floor(Math.random() * 2),
            }
          });
        }
        
      } catch (error) {
        console.error(`❌ Failed to create post ${i + 1}:`, error);
      }
    }
    
    console.log('\n🎉 Forum Content Generation Complete!');
    console.log(`📈 Statistics:`);
    console.log(`   - Created: ${createdPosts.length} posts`);
    
    const anonymousCount = createdPosts.filter(p => p.isAnonymous).length;
    console.log(`   - Anonymous: ${anonymousCount} posts (${Math.round(anonymousCount / createdPosts.length * 100)}%)`);
    
    // Category breakdown
    const categoryBreakdown = createdPosts.reduce((acc, post) => {
      acc[post.category] = (acc[post.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('\n📂 Posts by Category:');
    Object.entries(categoryBreakdown).forEach(([category, count]) => {
      console.log(`   - ${category}: ${count} posts`);
    });
    
    console.log('\n✨ Sample Anonymous Handles Used:');
    const anonymousHandles = [...new Set(createdPosts.filter(p => p.anonymousHandle).map(p => p.anonymousHandle))].slice(0, 10);
    anonymousHandles.forEach(handle => {
      console.log(`   - "${handle}"`);
    });
    
    return createdPosts;
    
  } catch (error) {
    console.error('❌ Error creating forum content:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  createForumContent()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { createForumContent };