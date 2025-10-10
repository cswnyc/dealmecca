import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';

// Generate a random ID similar to CUID format
const generateId = () => {
  return `cmg${randomBytes(12).toString('base64url')}`;
};

export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.forumCategory.findMany({
      where: {
        isActive: true
      },
      include: {
        _count: {
          select: {
            ForumPost: true
          }
        }
      },
      orderBy: {
        order: 'asc'
      }
    });

    // Transform data to match frontend expectations
    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description || '',
      slug: category.slug,
      icon: category.icon || 'MessageSquare',
      color: category.color || '#3B82F6',
      isActive: category.isActive,
      _count: {
        posts: category._count.ForumPost
      },
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString()
    }));

    return NextResponse.json(formattedCategories);
  } catch (error) {
    console.error('Error fetching forum categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, icon, color, slug } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    const category = await prisma.forumCategory.create({
      data: {
        id: generateId(),
        name,
        description,
        icon: icon || 'MessageSquare',
        color: color || '#3B82F6',
        slug
      }
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating forum category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}