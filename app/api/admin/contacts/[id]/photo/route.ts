// 📸 Contact Photo Upload API
// Handles actual file uploads to Vercel Blob Storage with image optimization

import { NextRequest, NextResponse } from 'next/server';
import { put, del } from '@vercel/blob';
import sharp from 'sharp';
import { requireAuth } from '@/server/requireAuth';
import { prisma } from '@/lib/prisma';

// Configuration
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const OPTIMIZED_SIZE = 400; // 400x400 pixels

/**
 * POST - Upload contact photo
 * Accepts multipart/form-data with a 'photo' file field
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication and ensure user exists in database
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth; // Auth failed

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: auth.dbUserId },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const { id } = await params;

    // Validate contact exists
    const contact = await prisma.contact.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        logoUrl: true
      }
    });

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('photo') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No photo file provided' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({
        error: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}`
      }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({
        error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`
      }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Optimize image with sharp
    const optimizedBuffer = await sharp(buffer)
      .resize(OPTIMIZED_SIZE, OPTIMIZED_SIZE, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 85 })
      .toBuffer();

    // Delete old photo from Vercel Blob if it exists and is a Blob URL
    if (contact.logoUrl && (
      contact.logoUrl.includes('vercel-storage') ||
      contact.logoUrl.includes('blob.vercel-storage')
    )) {
      try {
        await del(contact.logoUrl);
        console.log('🗑️ Deleted old photo:', contact.logoUrl);
      } catch (error) {
        console.warn('⚠️ Failed to delete old photo (may not exist):', error);
      }
    }

    // Upload to Vercel Blob Storage
    const filename = `contacts/${id}/${Date.now()}.jpg`;
    const blob = await put(filename, optimizedBuffer, {
      access: 'public',
      contentType: 'image/jpeg',
    });

    console.log('✅ Uploaded photo to Vercel Blob:', blob.url);

    // Update contact with new photo URL
    const updatedContact = await prisma.contact.update({
      where: { id },
      data: {
        logoUrl: blob.url,
        updatedAt: new Date()
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        fullName: true,
        logoUrl: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Photo uploaded successfully',
      contact: updatedContact,
      photo: {
        url: blob.url,
        size: optimizedBuffer.length,
        originalSize: file.size,
        dimensions: `${OPTIMIZED_SIZE}x${OPTIMIZED_SIZE}`
      }
    });

  } catch (error) {
    console.error('❌ Error uploading contact photo:', error);
    return NextResponse.json({
      error: 'Failed to upload photo',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * DELETE - Remove contact photo
 * Deletes photo from Vercel Blob and resets to auto-generated avatar
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication and ensure user exists in database
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth; // Auth failed

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: auth.dbUserId },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const { id } = await params;

    // Fetch contact to get current photo URL
    const contact = await prisma.contact.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        logoUrl: true
      }
    });

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // Delete photo from Vercel Blob if it's a Blob URL
    if (contact.logoUrl && (
      contact.logoUrl.includes('vercel-storage') ||
      contact.logoUrl.includes('blob.vercel-storage')
    )) {
      try {
        await del(contact.logoUrl);
        console.log('🗑️ Deleted photo from Vercel Blob:', contact.logoUrl);
      } catch (error) {
        console.warn('⚠️ Failed to delete photo (may not exist):', error);
      }
    }

    // Reset to auto-generated avatar (Gravatar or DiceBear)
    const { getContactPhotoUrl } = await import('@/lib/logo-utils');
    const fallbackPhotoUrl = getContactPhotoUrl(
      contact.firstName,
      contact.lastName,
      contact.email || undefined
    );

    // Update contact with fallback photo
    const updatedContact = await prisma.contact.update({
      where: { id },
      data: {
        logoUrl: fallbackPhotoUrl,
        updatedAt: new Date()
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        fullName: true,
        logoUrl: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Photo removed successfully',
      contact: updatedContact
    });

  } catch (error) {
    console.error('❌ Error removing contact photo:', error);
    return NextResponse.json({
      error: 'Failed to remove photo',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
