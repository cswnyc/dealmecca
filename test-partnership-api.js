const DATABASE_URL = process.env.DATABASE_URL || "file:./dev.db";

// Simple test to verify partnership API functionality
async function testPartnershipCreation() {
  const { PrismaClient } = require('@prisma/client');
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: DATABASE_URL,
      },
    },
  });

  try {
    console.log('🧪 Testing CompanyPartnership model access...');
    
    // Test if we can access the companyPartnership model
    const partnerships = await prisma.companyPartnership.findMany({
      take: 1,
      include: {
        agency: {
          select: { id: true, name: true }
        },
        advertiser: {
          select: { id: true, name: true }
        }
      }
    });
    
    console.log('✅ SUCCESS: CompanyPartnership model is accessible');
    console.log('📊 Found partnerships:', partnerships.length);
    
    // Let's also test finding some companies for partnership creation
    const companies = await prisma.company.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        companyType: true
      }
    });
    
    console.log('📋 Available companies for partnerships:');
    companies.forEach(company => {
      console.log(`  - ${company.name} (${company.companyType}) - ID: ${company.id}`);
    });
    
  } catch (error) {
    console.error('❌ ERROR testing CompanyPartnership:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testPartnershipCreation();