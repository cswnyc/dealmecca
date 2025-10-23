#!/usr/bin/env npx tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyData() {
  console.log('🔍 Analyzing current database to identify what to keep...\n');

  try {
    // Check users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    console.log('👥 USERS (KEEP):');
    users.forEach((user) => {
      console.log(`   - ${user.email} (${user.role}) - Created: ${user.createdAt.toLocaleDateString()}`);
    });
    console.log(`   Total: ${users.length} users\n`);

    // Check forum posts
    const forumPosts = await prisma.forumPost.findMany({
      select: {
        id: true,
        title: true,
        authorId: true,
        User: {
          select: {
            email: true,
          },
        },
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('📝 FORUM POSTS (REVIEW):');
    if (forumPosts.length > 0) {
      forumPosts.forEach((post) => {
        console.log(`   - "${post.title}" by ${post.User.email}`);
      });
      console.log(`   Total: ${forumPosts.length} posts`);
      console.log('   ❓ Decision needed: Keep or delete forum posts?\n');
    } else {
      console.log('   No forum posts found\n');
    }

    // Check test data to DELETE
    const [companyCount, contactCount, eventCount] = await Promise.all([
      prisma.company.count(),
      prisma.contact.count(),
      prisma.event.count(),
    ]);

    console.log('🗑️  TEST DATA TO DELETE:');
    console.log(`   - Companies: ${companyCount}`);
    console.log(`   - Contacts: ${contactCount}`);
    console.log(`   - Events: ${eventCount}`);
    console.log(`   Total test records to delete: ${companyCount + contactCount + eventCount}\n`);

    // Sample companies to verify they're test data
    const sampleCompanies = await prisma.company.findMany({
      take: 5,
      select: {
        name: true,
        companyType: true,
      },
    });

    console.log('📊 Sample companies (verify these are test data):');
    sampleCompanies.forEach((company) => {
      console.log(`   - ${company.name} (${company.companyType})`);
    });

    console.log('\n✅ Verification complete!');
    console.log('\n📋 SUMMARY:');
    console.log(`   KEEP: ${users.length} users, ${forumPosts.length} forum posts (if real)`);
    console.log(`   DELETE: ${companyCount + contactCount + eventCount} test records`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyData();
