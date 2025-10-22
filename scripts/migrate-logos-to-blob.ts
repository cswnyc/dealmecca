#!/usr/bin/env tsx
/**
 * Migration Script: Upload Local Logos to Vercel Blob Storage
 *
 * This script:
 * 1. Finds all companies with local logo URLs (starting with /uploads/)
 * 2. Uploads those files to Vercel Blob Storage
 * 3. Updates the database with the new Blob URLs
 *
 * Usage:
 *   BLOB_READ_WRITE_TOKEN=your_token npx tsx scripts/migrate-logos-to-blob.ts
 */

import { PrismaClient } from '@prisma/client';
import { put } from '@vercel/blob';
import { readFile } from 'fs/promises';
import { join } from 'path';

const prisma = new PrismaClient();

async function migrateLogos() {
  console.log('🚀 Starting logo migration to Vercel Blob Storage...\n');

  // Check for required environment variable
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('❌ Error: BLOB_READ_WRITE_TOKEN environment variable is required');
    console.error('   Get your token from: https://vercel.com/dashboard/stores');
    process.exit(1);
  }

  try {
    // Find all companies with local logos (starting with /uploads/)
    const companiesWithLocalLogos = await prisma.company.findMany({
      where: {
        logoUrl: {
          startsWith: '/uploads/'
        }
      },
      select: {
        id: true,
        name: true,
        logoUrl: true
      }
    });

    console.log(`📊 Found ${companiesWithLocalLogos.length} companies with local logos\n`);

    if (companiesWithLocalLogos.length === 0) {
      console.log('✅ No logos to migrate!');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const company of companiesWithLocalLogos) {
      try {
        console.log(`📤 Migrating: ${company.name}`);
        console.log(`   Current URL: ${company.logoUrl}`);

        // Read the local file
        const localPath = join(process.cwd(), 'public', company.logoUrl);
        const fileBuffer = await readFile(localPath);

        // Extract file extension
        const fileExtension = company.logoUrl.split('.').pop();

        // Determine content type
        const contentTypeMap: Record<string, string> = {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'webp': 'image/webp',
          'gif': 'image/gif'
        };
        const contentType = contentTypeMap[fileExtension || 'jpeg'] || 'image/jpeg';

        // Create blob filename (preserve company ID from path)
        const filename = `company/${company.id}-${Date.now()}.${fileExtension}`;

        // Upload to Vercel Blob
        const blob = await put(filename, fileBuffer, {
          access: 'public',
          contentType,
          addRandomSuffix: false,
        });

        console.log(`   New URL: ${blob.url}`);

        // Update database with new URL
        await prisma.company.update({
          where: { id: company.id },
          data: { logoUrl: blob.url }
        });

        console.log(`   ✅ Success!\n`);
        successCount++;

      } catch (error: any) {
        console.error(`   ❌ Error: ${error.message}\n`);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Migration Summary:');
    console.log(`   Total companies: ${companiesWithLocalLogos.length}`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateLogos()
  .then(() => {
    console.log('\n✅ Migration complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
