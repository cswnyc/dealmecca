const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash('password123', 12)
    
    // Create the user
    const user = await prisma.user.create({
      data: {
        email: 'admin@dealmecca.pro',
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
        subscriptionTier: 'TEAM',
        subscriptionStatus: 'ACTIVE',
      }
    })
    
    console.log('✅ Test user created successfully:', {
      id: user.id,
      email: user.email,
      role: user.role,
      subscriptionTier: user.subscriptionTier
    })
    
    // Create a sample company and contact for testing
    const company = await prisma.company.create({
      data: {
        name: 'Test Agency',
        slug: 'test-agency',
        companyType: 'INDEPENDENT_AGENCY',
        city: 'New York',
        state: 'NY',
        country: 'US',
        verified: true
      }
    })
    
    const contact = await prisma.contact.create({
      data: {
        firstName: 'John',
        lastName: 'Doe',
        fullName: 'John Doe',
        title: 'Media Director',
        email: 'john.doe@testagency.com',
        companyId: company.id,
        seniority: 'DIRECTOR',
        department: 'MEDIA_PLANNING',
        verified: true
      }
    })
    
    console.log('✅ Sample data created:', {
      company: company.name,
      contact: contact.fullName
    })
    
  } catch (error) {
    console.error('❌ Error creating test user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()