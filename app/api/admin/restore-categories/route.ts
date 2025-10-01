import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const forumCategories = [
  {
    name: "🔥 Hot Opportunities",
    description: "Active RFPs, urgent needs, and time-sensitive deals",
    slug: "hot-opportunities",
    color: "#ef4444",
    icon: "🔥",
    order: 1,
    isActive: true
  },
  {
    name: "💼 Account Intelligence",
    description: "Company moves, budget intel, and account insights",
    slug: "account-intelligence",
    color: "#3b82f6",
    icon: "💼",
    order: 2,
    isActive: true
  },
  {
    name: "📈 Industry Insights",
    description: "Market trends, predictions, and analysis",
    slug: "industry-insights",
    color: "#8b5cf6",
    icon: "📈",
    order: 3,
    isActive: true
  },
  {
    name: "🎯 Success Stories",
    description: "Deals closed, strategies that worked, wins to celebrate",
    slug: "success-stories",
    color: "#10b981",
    icon: "🎯",
    order: 4,
    isActive: true
  },
  {
    name: "🤝 Networking",
    description: "Introductions, meetups, and professional connections",
    slug: "networking",
    color: "#f59e0b",
    icon: "🤝",
    order: 5,
    isActive: true
  },
  {
    name: "⚡ Quick Questions",
    description: "Fast answers needed - community help wanted",
    slug: "quick-questions",
    color: "#06b6d4",
    icon: "⚡",
    order: 6,
    isActive: true
  },
  {
    name: "📚 Resources",
    description: "Templates, guides, tools, and helpful materials",
    slug: "resources",
    color: "#6b7280",
    icon: "📚",
    order: 7,
    isActive: true
  }
];

export async function POST() {
  try {
    console.log('Restoring forum categories...');

    const results = [];

    for (const category of forumCategories) {
      const result = await prisma.forumCategory.upsert({
        where: { slug: category.slug },
        update: {
          ...category,
          isActive: true // Ensure they're active
        },
        create: category,
      });
      results.push({
        id: result.id,
        name: result.name,
        slug: result.slug,
        isActive: result.isActive
      });
      console.log(`✅ Restored: ${result.name}`);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully restored ${results.length} forum categories`,
      categories: results
    });

  } catch (error) {
    console.error('❌ Error restoring categories:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to restore categories',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
