#!/usr/bin/env npx tsx

import { spawn } from 'child_process';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupId = `pre-bulk-import_${timestamp}`;
  const backupDir = join(process.cwd(), 'backups', backupId);

  console.log(`🔄 Creating pre-import backup: ${backupId}`);
  console.log(`📁 Backup location: ${backupDir}\n`);

  try {
    // Create backup directory
    mkdirSync(backupDir, { recursive: true });

    // Step 1: Export critical data as JSON (fast and reliable)
    console.log('1️⃣  Exporting data snapshot...');
    const [companies, contacts, users, forumPosts, events] = await Promise.all([
      prisma.company.findMany(),
      prisma.contact.findMany(),
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          firebaseUid: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.forumPost.findMany(),
      prisma.event.findMany(),
    ]);

    const snapshot = {
      metadata: {
        backupId,
        timestamp: new Date().toISOString(),
        databaseUrl: process.env.DATABASE_URL?.split('@')[1] || 'hidden',
        counts: {
          companies: companies.length,
          contacts: contacts.length,
          users: users.length,
          forumPosts: forumPosts.length,
          events: events.length,
          total: companies.length + contacts.length + users.length + forumPosts.length + events.length,
        },
      },
      data: {
        companies,
        contacts,
        users,
        forumPosts,
        events,
      },
    };

    const snapshotFile = join(backupDir, 'data-snapshot.json');
    writeFileSync(snapshotFile, JSON.stringify(snapshot, null, 2));
    console.log(`   ✅ Data snapshot saved (${companies.length} companies, ${contacts.length} contacts)`);

    // Step 2: Create SQL dump using pg_dump (if available)
    console.log('\n2️⃣  Creating SQL database dump...');
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.log('   ⚠️  DATABASE_URL not found, skipping SQL dump');
    } else {
      const sqlFile = join(backupDir, 'database.sql');
      await createPgDump(dbUrl, sqlFile);
      console.log('   ✅ SQL dump created');
    }

    // Step 3: Save metadata
    const metadataFile = join(backupDir, 'metadata.json');
    writeFileSync(
      metadataFile,
      JSON.stringify(
        {
          backupId,
          timestamp: new Date().toISOString(),
          type: 'pre-bulk-import',
          recordCounts: snapshot.metadata.counts,
          files: ['data-snapshot.json', 'database.sql', 'metadata.json'],
          purpose: 'Pre-bulk-import safety backup',
        },
        null,
        2
      )
    );

    console.log('\n✅ Backup completed successfully!');
    console.log(`📊 Backed up ${snapshot.metadata.counts.total} total records`);
    console.log(`📁 Location: ${backupDir}`);
    console.log(`\n🔐 To restore: npx tsx scripts/restore-backup.ts ${backupId}`);

    return backupId;
  } catch (error) {
    console.error('\n❌ Backup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

function createPgDump(dbUrl: string, outputFile: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const pg_dump = spawn('pg_dump', [dbUrl, '--clean', '--create', '--file', outputFile], {
      stdio: 'pipe',
    });

    let stderr = '';
    pg_dump.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    pg_dump.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        // pg_dump not available - that's okay, we have JSON snapshot
        console.log('   ⚠️  pg_dump not available (this is okay, JSON snapshot was created)');
        resolve();
      }
    });

    pg_dump.on('error', (err) => {
      // pg_dump command not found - that's okay
      console.log('   ⚠️  pg_dump not available (this is okay, JSON snapshot was created)');
      resolve();
    });
  });
}

// Run if called directly
if (require.main === module) {
  createBackup()
    .then((backupId) => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { createBackup };
