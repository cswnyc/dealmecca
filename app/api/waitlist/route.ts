import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { subscribeUserToWaitlist } from '@/lib/mailerlite';

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

    // Sync to MailerLite (non-blocking - don't fail request if MailerLite fails)
    try {
      await subscribeUserToWaitlist(email, source);
      console.log(`✅ MailerLite sync successful for: ${email}`);
    } catch (mailerLiteError) {
      console.error('⚠️ MailerLite sync failed (email still saved to database):', mailerLiteError);
      // Continue - database save was successful
    }

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

      // Check each email against existing users to flag duplicates
      const emailsWithDuplicateCheck = await Promise.all(
        emails.map(async (entry) => {
          const existingUser = await prisma.user.findUnique({
            where: { email: entry.email },
            select: {
              id: true,
              role: true,
              accountStatus: true,
              createdAt: true,
            },
          });

          return {
            ...entry,
            isDuplicate: !!existingUser,
            existingUser: existingUser || undefined,
          };
        })
      );

      response.emails = emailsWithDuplicateCheck;
      response.duplicateCount = emailsWithDuplicateCheck.filter(e => e.isDuplicate).length;
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

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Waitlist entry ID is required' },
        { status: 400 }
      );
    }

    await prisma.waitlistEmail.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Waitlist entry deleted successfully' });
  } catch (error) {
    console.error('Delete waitlist entry error:', error);
    return NextResponse.json(
      { error: 'Failed to delete waitlist entry' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Waitlist entry ID is required' },
        { status: 400 }
      );
    }

    if (action === 'convert') {
      // Get the waitlist entry
      const waitlistEntry = await prisma.waitlistEmail.findUnique({
        where: { id }
      });

      if (!waitlistEntry) {
        return NextResponse.json(
          { error: 'Waitlist entry not found' },
          { status: 404 }
        );
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: waitlistEntry.email }
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'User with this email already exists', userId: existingUser.id },
          { status: 400 }
        );
      }

      // Create user account
      const newUser = await prisma.user.create({
        data: {
          email: waitlistEntry.email,
          role: 'FREE',
          subscriptionTier: 'FREE',
          subscriptionStatus: 'ACTIVE',
          accountStatus: 'APPROVED',
          approvedAt: new Date(),
          isAnonymous: false,
          publicHandle: `user-${Date.now()}`,
        }
      });

      // Update waitlist status
      await prisma.waitlistEmail.update({
        where: { id },
        data: { status: 'REGISTERED' }
      });

      return NextResponse.json({
        success: true,
        message: 'User created successfully',
        user: {
          id: newUser.id,
          email: newUser.email
        }
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Convert waitlist entry error:', error);
    return NextResponse.json(
      { error: 'Failed to convert waitlist entry' },
      { status: 500 }
    );
  }
}