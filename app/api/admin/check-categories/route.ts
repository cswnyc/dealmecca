import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get all categories (including inactive)
    const allCategories = await prisma.forumCategory.findMany({
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      },
      orderBy: {
        order: 'asc'
      }
    });

    // Get active categories only
    const activeCategories = allCategories.filter(c => c.isActive);

    return NextResponse.json({
      total: allCategories.length,
      active: activeCategories.length,
      inactive: allCategories.length - activeCategories.length,
      categories: allCategories.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        isActive: c.isActive,
        order: c.order,
        postCount: c._count.posts,
        color: c.color,
        icon: c.icon
      }))
    });
  } catch (error) {
    console.error('Error checking categories:', error);
    return NextResponse.json(
      {
        error: 'Failed to check categories',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
