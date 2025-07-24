import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const forumCategories = [
  {
    name: "🔥 Hot Opportunities",
    description: "Active RFPs, urgent needs, and time-sensitive deals",
    slug: "hot-opportunities",
    color: "#ef4444",
    icon: "🔥",
    order: 1
  },
  {
    name: "💼 Account Intelligence", 
    description: "Company moves, budget intel, and account insights",
    slug: "account-intelligence",
    color: "#3b82f6",
    icon: "💼",
    order: 2
  },
  {
    name: "📈 Industry Insights",
    description: "Market trends, predictions, and analysis",
    slug: "industry-insights", 
    color: "#8b5cf6",
    icon: "📈",
    order: 3
  },
  {
    name: "🎯 Success Stories",
    description: "Deals closed, strategies that worked, wins to celebrate",
    slug: "success-stories",
    color: "#10b981",
    icon: "🎯",
    order: 4
  },
  {
    name: "🤝 Networking",
    description: "Introductions, meetups, and professional connections",
    slug: "networking",
    color: "#f59e0b",
    icon: "🤝",
    order: 5
  },
  {
    name: "⚡ Quick Questions",
    description: "Fast answers needed - community help wanted",
    slug: "quick-questions",
    color: "#06b6d4",
    icon: "⚡",
    order: 6
  },
  {
    name: "📚 Resources",
    description: "Templates, guides, tools, and helpful materials",
    slug: "resources",
    color: "#6b7280",
    icon: "📚",
    order: 7
  }
];

export async function seedForumCategories() {
  console.log('Seeding forum categories...');
  
  for (const category of forumCategories) {
    await prisma.forumCategory.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }
  
  console.log('Forum categories seeded successfully!');
}

export default seedForumCategories; 