const DATABASE_URL = process.env.DATABASE_URL || "file:./dev.db";

// Create test partnerships to demonstrate the expandable UI
async function createTestPartnerships() {
  const { PrismaClient } = require('@prisma/client');
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: DATABASE_URL,
      },
    },
  });

  try {
    console.log('🎯 Creating test partnerships...');
    
    // Get available companies
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        companyType: true
      }
    });
    
    console.log(`📋 Found ${companies.length} companies`);
    
    // Find agencies and advertisers
    const agencies = companies.filter(c => 
      c.companyType.includes('AGENCY') || c.companyType === 'HOLDING_COMPANY_AGENCY'
    );
    const advertisers = companies.filter(c => 
      c.companyType.includes('ADVERTISER') || c.companyType === 'NATIONAL_ADVERTISER'
    );
    
    console.log(`🏢 Found ${agencies.length} agencies, ${advertisers.length} advertisers`);
    
    if (agencies.length === 0 || advertisers.length === 0) {
      console.log('❌ Need at least 1 agency and 1 advertiser to create partnerships');
      return;
    }
    
    // Create partnerships - let's make the first agency have many advertiser partners
    const primaryAgency = agencies[0];
    const partnerships = [];
    
    // Create 6 partnerships so we can test the "show 3 + expand" functionality
    for (let i = 0; i < Math.min(6, advertisers.length); i++) {
      const advertiser = advertisers[i];
      
      const partnershipData = {
        agencyId: primaryAgency.id,
        advertiserId: advertiser.id,
        relationshipType: 'AGENCY_CLIENT',
        isActive: true,
        notes: `Partnership between ${primaryAgency.name} and ${advertiser.name}`,
        contractValue: Math.floor(Math.random() * 1000000) + 50000, // Random value between 50K-1M
        startDate: new Date(2024, Math.floor(Math.random() * 12), 1),
      };
      
      partnerships.push(partnershipData);
    }
    
    // Create all partnerships
    const createdPartnerships = await prisma.companyPartnership.createMany({
      data: partnerships,
      skipDuplicates: true
    });
    
    console.log(`✅ Created ${createdPartnerships.count} partnerships`);
    
    // Now let's verify what we created
    const verification = await prisma.companyPartnership.findMany({
      include: {
        agency: {
          select: { id: true, name: true, companyType: true }
        },
        advertiser: {
          select: { id: true, name: true, companyType: true }
        }
      }
    });
    
    console.log('📊 Partnership verification:');
    verification.forEach((p, index) => {
      console.log(`  ${index + 1}. ${p.agency.name} ←→ ${p.advertiser.name} (${p.relationshipType})`);
    });
    
    // Show the primary agency with its partnerships
    const agencyWithPartnerships = await prisma.company.findUnique({
      where: { id: primaryAgency.id },
      include: {
        agencyPartnerships: {
          include: {
            advertiser: {
              select: {
                id: true,
                name: true,
                city: true,
                state: true,
                verified: true,
                companyType: true
              }
            }
          }
        },
        _count: {
          select: {
            agencyPartnerships: { where: { isActive: true } },
            contacts: true
          }
        }
      }
    });
    
    console.log(`\n🎯 ${primaryAgency.name} now has ${agencyWithPartnerships._count.agencyPartnerships} active partnerships!`);
    console.log('This should trigger the expandable UI (3 shown + expand for more)');
    
  } catch (error) {
    console.error('❌ ERROR creating partnerships:', error.message);
    if (error.message.includes('unique constraint')) {
      console.log('💡 Some partnerships may already exist - this is normal');
    }
  } finally {
    await prisma.$disconnect();
  }
}

createTestPartnerships();