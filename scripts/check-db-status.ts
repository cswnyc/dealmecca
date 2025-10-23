#!/usr/bin/env npx tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    // Check connection
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Count records in key tables
    const [companies, contacts, users, forumPosts, events] = await Promise.all([
      prisma.company.count(),
      prisma.contact.count(),
      prisma.user.count(),
      prisma.forumPost.count(),
      prisma.event.count(),
    ]);

    console.log('\n📊 Current Database Stats:');
    console.log('   Companies:', companies);
    console.log('   Contacts:', contacts);
    console.log('   Users:', users);
    console.log('   Forum Posts:', forumPosts);
    console.log('   Events:', events);
    console.log('   Total Records:', companies + contacts + users + forumPosts + events);

  } catch (error) {
    console.error('❌ Database check failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
