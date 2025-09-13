#!/usr/bin/env npx tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearPosts() {
  try {
    await prisma.forumComment.deleteMany({});
    await prisma.forumPost.deleteMany({});
    console.log('✅ Cleared all forum posts and comments');
  } catch (error) {
    console.error('❌ Error clearing posts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearPosts();