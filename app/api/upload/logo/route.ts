import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    // Check authentication - try Authorization header first, then cookies
    let authToken: string | undefined;

    // Try Authorization header
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      authToken = authHeader.substring(7);
    }

    // Fallback to cookie
    if (!authToken) {
      const cookieStore = cookies();
      authToken = cookieStore.get('__session')?.value;
    }

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized - No auth token' }, { status: 401 });
    }

    // Verify Firebase token and get user info
    let firebaseUid: string;
    try {
      const { auth } = await import('@/lib/firebase-admin');
      const decodedToken = await auth.verifyIdToken(authToken);
      firebaseUid = decodedToken.uid;
    } catch (error) {
      console.error('Firebase token verification failed:', error);
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }

    // Get user from database and check if admin
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
      select: { id: true, role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const entityType = formData.get('entityType') as string; // 'company', 'contact', etc.
    const entityId = formData.get('entityId') as string;

    if (!file || !entityType || !entityId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' 
      }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({
        error: 'File too large. Maximum size is 5MB.'
      }, { status: 400 });
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `${entityType}/${entityId}-${Date.now()}.${fileExtension}`;

    // Check if we're in production (Vercel) or development (local)
    const isProduction = process.env.VERCEL_ENV === 'production';

    let publicUrl: string;

    if (isProduction) {
      // Production: Upload to Vercel Blob Storage
      try {
        const blob = await put(fileName, file, {
          access: 'public',
          addRandomSuffix: false,
        });
        publicUrl = blob.url;
        console.log('✅ Uploaded to Vercel Blob:', publicUrl);
      } catch (error) {
        console.error('Vercel Blob upload error:', error);
        throw new Error('Failed to upload to cloud storage');
      }
    } else {
      // Development: Use local file system
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'logos', entityType);
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (error) {
        // Directory might already exist
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const localFileName = `${entityId}-${Date.now()}.${fileExtension}`;
      const filePath = join(uploadDir, localFileName);

      await writeFile(filePath, buffer);
      publicUrl = `/uploads/logos/${entityType}/${localFileName}`;
      console.log('✅ Uploaded to local storage:', publicUrl);
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: fileName.split('/').pop(),
      fileSize: file.size,
      fileType: file.type,
      storage: isProduction ? 'vercel-blob' : 'local'
    });

  } catch (error) {
    console.error('Logo upload error:', error);
    return NextResponse.json({ 
      error: 'Failed to upload logo' 
    }, { status: 500 });
  }
}

// Handle GET requests to show upload form
export async function GET() {
  return NextResponse.json({
    message: 'Logo upload endpoint',
    supportedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    maxSize: '5MB',
    usage: 'POST with form-data: file, entityType, entityId'
  });
}