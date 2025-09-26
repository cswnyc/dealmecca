import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updatePostsToPending() {
  try {
    // Update all existing posts to PENDING status if they're not already approved
    const result = await prisma.forumPost.updateMany({
      where: {
        status: {
          notIn: ['APPROVED', 'REJECTED']
        }
      },
      data: {
        status: 'PENDING'
      }
    })

    console.log(`Updated ${result.count} posts to PENDING status`)

    // Get admin users to approve their own posts
    const adminUsers = await prisma.user.findMany({
      where: {
        role: 'ADMIN'
      }
    })

    if (adminUsers.length > 0) {
      const adminApprovalResult = await prisma.forumPost.updateMany({
        where: {
          authorId: {
            in: adminUsers.map(user => user.id)
          },
          status: 'PENDING'
        },
        data: {
          status: 'APPROVED',
          approvedAt: new Date(),
          approvedBy: 'system'
        }
      })

      console.log(`Auto-approved ${adminApprovalResult.count} posts from admin users`)
    }

    console.log('Post approval system setup complete!')
  } catch (error) {
    console.error('Error updating posts:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updatePostsToPending()