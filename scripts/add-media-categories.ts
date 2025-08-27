import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const mediaCategories = [
  // Media Types
  { name: 'Digital', slug: 'digital', description: 'Digital advertising and online marketing', color: '#3B82F6', icon: '💻', order: 1 },
  { name: 'OOH', slug: 'ooh', description: 'Out-of-home advertising and billboards', color: '#EF4444', icon: '🏢', order: 2 },
  { name: 'TV', slug: 'tv', description: 'Television advertising and broadcast', color: '#8B5CF6', icon: '📺', order: 3 },
  { name: 'Print', slug: 'print', description: 'Print advertising and publications', color: '#F59E0B', icon: '📰', order: 4 },
  { name: 'Programmatic', slug: 'programmatic', description: 'Programmatic advertising and automated buying', color: '#10B981', icon: '🤖', order: 5 },
  { name: 'Radio', slug: 'radio', description: 'Radio advertising and audio marketing', color: '#F97316', icon: '📻', order: 6 },
  
  // Industry Verticals
  { name: 'CPG', slug: 'cpg', description: 'Consumer Packaged Goods', color: '#06B6D4', icon: '🛍️', order: 10 },
  { name: 'Retail', slug: 'retail', description: 'Retail and e-commerce', color: '#84CC16', icon: '🏪', order: 11 },
  { name: 'Health', slug: 'health', description: 'Healthcare and pharmaceutical', color: '#EC4899', icon: '🏥', order: 12 },
  { name: 'Telecom/Cable', slug: 'telecom-cable', description: 'Telecommunications and cable services', color: '#6366F1', icon: '📡', order: 13 },
  { name: 'Financial', slug: 'financial', description: 'Financial services and banking', color: '#059669', icon: '🏦', order: 14 },
  { name: 'Automotive', slug: 'automotive', description: 'Automotive and transportation', color: '#DC2626', icon: '🚗', order: 15 },
  { name: 'Technology', slug: 'technology', description: 'Technology and software', color: '#7C3AED', icon: '💻', order: 16 },
  { name: 'Entertainment', slug: 'entertainment', description: 'Entertainment and media', color: '#F59E0B', icon: '🎬', order: 17 },
  { name: 'Travel', slug: 'travel', description: 'Travel and hospitality', color: '#0891B2', icon: '✈️', order: 18 },
  { name: 'Real Estate', slug: 'real-estate', description: 'Real estate and property', color: '#65A30D', icon: '🏠', order: 19 },
  
  // Post Types
  { name: 'Opportunities', slug: 'opportunities', description: 'Business opportunities and deals', color: '#16A34A', icon: '💼', order: 20 },
  { name: 'Insights', slug: 'insights', description: 'Industry insights and analysis', color: '#2563EB', icon: '💡', order: 21 },
  { name: 'Q&A', slug: 'qa', description: 'Questions and answers', color: '#DC2626', icon: '❓', order: 22 },
  { name: 'News', slug: 'news', description: 'Industry news and updates', color: '#7C2D12', icon: '📰', order: 23 },
  { name: 'Events', slug: 'events', description: 'Industry events and conferences', color: '#BE185D', icon: '📅', order: 24 },
];

async function addMediaCategories() {
  console.log('🏗️  Adding media-specific forum categories...');
  
  try {
    // Add categories one by one to avoid conflicts
    for (const category of mediaCategories) {
      const existing = await prisma.forumCategory.findUnique({
        where: { slug: category.slug }
      });
      
      if (!existing) {
        await prisma.forumCategory.create({
          data: {
            ...category,
            isActive: true
          }
        });
        console.log(`✅ Added category: ${category.name}`);
      } else {
        console.log(`⏭️  Category already exists: ${category.name}`);
      }
    }
    
    console.log('\n📊 Forum categories summary:');
    const allCategories = await prisma.forumCategory.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });
    
    console.log(`Total active categories: ${allCategories.length}`);
    allCategories.forEach(cat => {
      console.log(`  ${cat.icon} ${cat.name} (${cat._count.posts} posts)`);
    });
    
  } catch (error) {
    console.error('❌ Error adding categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
addMediaCategories();
