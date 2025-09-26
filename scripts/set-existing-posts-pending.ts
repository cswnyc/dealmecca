import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function setExistingPostsPending() {
  try {
    console.log('Finding existing forum posts...')

    // First, let's see what posts exist
    const allPosts = await prisma.forumPost.findMany({
      select: {
        id: true,
        title: true,
        content: true,
        status: true,
        createdAt: true
      }
    })

    console.log(`Found ${allPosts.length} posts:`)
    allPosts.forEach(post => {
      console.log(`- ${post.title} (${post.status}) - ${post.createdAt}`)
    })

    // Update all APPROVED posts to PENDING for moderation
    const result = await prisma.forumPost.updateMany({
      where: {
        status: 'APPROVED'
      },
      data: {
        status: 'PENDING',
        approvedAt: null,
        approvedBy: null
      }
    })

    console.log(`\nUpdated ${result.count} posts to PENDING status`)
    console.log('These posts will now appear in the moderation queue.')

  } catch (error) {
    console.error('Error updating posts:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setExistingPostsPending()