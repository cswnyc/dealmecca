import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { requireAdmin } from '@/server/requireAdmin';

// Generate a random ID similar to CUID format
const generateId = () => {
  return `cmg${randomBytes(12).toString('base64url')}`;
};

// GET - List all categories
export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (admin instanceof NextResponse) return admin;

    const categories = await prisma.forumCategory.findMany({
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

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST - Create new category
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (admin instanceof NextResponse) return admin;

    const body = await request.json();
    const { name, description, slug, icon, color, order, isActive } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existing = await prisma.forumCategory.findUnique({
      where: { slug }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A category with this slug already exists' },
        { status: 409 }
      );
    }

    // Get the highest order number and add 1
    const maxOrder = await prisma.forumCategory.findFirst({
      orderBy: { order: 'desc' },
      select: { order: true }
    });

    const category = await prisma.forumCategory.create({
      data: {
        id: generateId(),
        name,
        description: description || '',
        slug,
        icon: icon || '📁',
        color: color || '#3b82f6',
        order: order ?? (maxOrder?.order ?? 0) + 1,
        isActive: isActive ?? true
      },
      include: {
        _count: {
          select: {
            ForumPost: true
          }
        }
      }
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
