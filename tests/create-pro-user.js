const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createProUser() {
  try {
    // Create/update pro user with correct credentials
    const hashedPassword = await bcrypt.hash('test123', 12)
    
    const proUser = await prisma.user.upsert({
      where: { email: 'pro@dealmecca.pro' },
      update: { 
        password: hashedPassword,
        role: 'PRO',
        subscriptionTier: 'PRO',
        subscriptionStatus: 'ACTIVE'
      },
      create: {
        email: 'pro@dealmecca.pro',
        name: 'Pro User',
        password: hashedPassword,
        role: 'PRO',
        subscriptionTier: 'PRO',
        subscriptionStatus: 'ACTIVE',
      }
    })
    
    console.log('✅ Pro user created/updated:', {
      email: proUser.email,
      role: proUser.role,
      subscriptionTier: proUser.subscriptionTier
    })
    
  } catch (error) {
    console.error('❌ Error creating pro user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createProUser()