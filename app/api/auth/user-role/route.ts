import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Look up user in Prisma database by email
    let user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, role: true, subscriptionTier: true }
    });

    // If user doesn't exist, create them with default role
    if (!user) {
      // Check if this email should have admin privileges
      const adminEmails = ['admin@dealmecca.pro', 'chris@dealmecca.com', 'csw@dealmecca.com', 'cswnyc@gmail.com'];
      const isAdmin = adminEmails.includes(email.toLowerCase());

      user = await prisma.user.create({
        data: {
          email,
          name: body.name || 'New User',
          role: isAdmin ? 'ADMIN' : 'FREE',
          subscriptionTier: isAdmin ? 'PRO' : 'FREE'
        },
        select: { id: true, email: true, name: true, role: true, subscriptionTier: true }
      });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        subscriptionTier: user.subscriptionTier
      }
    });

  } catch (error) {
    console.error('Error fetching user role:', error);
    return NextResponse.json({ error: 'Failed to fetch user role' }, { status: 500 });
  }
}