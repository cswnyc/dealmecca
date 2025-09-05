import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'logos', entityType);
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Generate unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${entityId}-${Date.now()}.${fileExtension}`;
    const filePath = join(uploadDir, fileName);

    // Write file
    await writeFile(filePath, buffer);

    // Return the public URL
    const publicUrl = `/uploads/logos/${entityType}/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
      fileSize: file.size,
      fileType: file.type
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