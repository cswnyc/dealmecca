import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/firebase-admin';

async function verifyFirebaseToken(request: NextRequest): Promise<string | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    console.error('Firebase token verification failed:', error);
    return null;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: companyId } = await params;
    const body = await request.json();
    const { userId, follow } = body;

    // Verify Firebase token if provided
    const firebaseUid = await verifyFirebaseToken(request);

    if (!companyId || !userId) {
      return NextResponse.json(
        { error: 'Company ID and user ID are required' },
        { status: 400 }
      );
    }

    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Check if follow relationship already exists
    const existingFollow = await prisma.companyFollow.findUnique({
      where: {
        userId_companyId: {
          userId,
          companyId
        }
      }
    });

    if (follow === false || (existingFollow && follow !== true)) {
      // Remove follow
      if (existingFollow) {
        await prisma.companyFollow.delete({
          where: { id: existingFollow.id }
        });
      }
    } else {
      // Add follow
      if (!existingFollow) {
        await prisma.companyFollow.create({
          data: {
            userId,
            companyId
          }
        });
      }
    }

    // Get updated follow count
    const followCount = await prisma.companyFollow.count({
      where: { companyId }
    });

    const isFollowing = follow !== false && (existingFollow || follow === true);

    return NextResponse.json({
      success: true,
      isFollowing,
      followCount,
      company: {
        id: company.id,
        name: company.name,
        logoUrl: company.logoUrl
      }
    });

  } catch (error) {
    console.error('Error processing company follow:', error);
    return NextResponse.json(
      { error: 'Failed to process company follow' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = params.id;
    const userId = request.nextUrl.searchParams.get('userId');

    // Verify Firebase token if provided
    const firebaseUid = await verifyFirebaseToken(request);

    if (!companyId || !userId) {
      return NextResponse.json(
        { error: 'Company ID and user ID are required' },
        { status: 400 }
      );
    }

    // Remove follow
    await prisma.companyFollow.deleteMany({
      where: {
        userId,
        companyId
      }
    });

    // Get updated follow count
    const followCount = await prisma.companyFollow.count({
      where: { companyId }
    });

    return NextResponse.json({
      success: true,
      isFollowing: false,
      followCount
    });

  } catch (error) {
    console.error('Error removing company follow:', error);
    return NextResponse.json(
      { error: 'Failed to remove company follow' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = params.id;
    const userId = request.nextUrl.searchParams.get('userId');

    // Get follow count
    const followCount = await prisma.companyFollow.count({
      where: { companyId }
    });

    let isFollowing = false;
    if (userId) {
      const existingFollow = await prisma.companyFollow.findUnique({
        where: {
          userId_companyId: {
            userId,
            companyId
          }
        }
      });
      isFollowing = !!existingFollow;
    }

    // Get company info
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        logoUrl: true,
        verified: true,
        companyType: true
      }
    });

    return NextResponse.json({
      isFollowing,
      followCount,
      company
    });

  } catch (error) {
    console.error('Error fetching company follow data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company follow data' },
      { status: 500 }
    );
  }
}