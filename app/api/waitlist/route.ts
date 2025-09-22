import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const WaitlistEmailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  source: z.string().optional().default('invite-only'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    const validationResult = WaitlistEmailSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid email format',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const { email, source } = validationResult.data;

    // Check if email already exists
    const existingEmail = await prisma.waitlistEmail.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return NextResponse.json(
        {
          message: 'Email already registered',
          status: 'already_exists'
        },
        { status: 200 }
      );
    }

    // Create new waitlist entry
    const waitlistEntry = await prisma.waitlistEmail.create({
      data: {
        email,
        source,
      },
    });

    // Log successful signup for analytics
    console.log(`New waitlist signup: ${email} from ${source}`);

    return NextResponse.json(
      {
        message: 'Successfully added to waitlist',
        status: 'success',
        id: waitlistEntry.id
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Waitlist signup error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to add email to waitlist'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Simple endpoint to get waitlist stats (for admin use)
    const searchParams = request.nextUrl.searchParams;
    const includeEmails = searchParams.get('include_emails') === 'true';

    // Basic stats
    const stats = await prisma.waitlistEmail.aggregate({
      _count: {
        id: true,
      },
    });

    const statusCounts = await prisma.waitlistEmail.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    const response: any = {
      total: stats._count.id,
      byStatus: statusCounts.reduce((acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {} as Record<string, number>),
    };

    // Only include emails if explicitly requested (for admin panel)
    if (includeEmails) {
      const emails = await prisma.waitlistEmail.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          source: true,
          status: true,
          createdAt: true,
        },
      });
      response.emails = emails;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Waitlist stats error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to fetch waitlist data'
      },
      { status: 500 }
    );
  }
}