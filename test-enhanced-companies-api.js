// Test the enhanced companies API with partnership data
const DATABASE_URL = process.env.DATABASE_URL || "file:./dev.db";

async function testEnhancedCompaniesAPI() {
  const { PrismaClient } = require('@prisma/client');
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: DATABASE_URL,
      },
    },
  });

  try {
    console.log('🧪 Testing enhanced companies API with partnerships...');
    
    // Simulate the API call that should be made by the frontend
    const companies = await prisma.company.findMany({
      include: {
        _count: {
          select: { 
            contacts: true,
            agencyPartnerships: { where: { isActive: true } },
            advertiserPartnerships: { where: { isActive: true } }
          }
        },
        agencyPartnerships: {
          where: { isActive: true },
          include: {
            advertiser: {
              select: {
                id: true,
                name: true,
                companyType: true,
                logoUrl: true,
                city: true,
                state: true,
                verified: true
              }
            }
          },
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        advertiserPartnerships: {
          where: { isActive: true },
          include: {
            agency: {
              select: {
                id: true,
                name: true,
                companyType: true,
                logoUrl: true,
                city: true,
                state: true,
                verified: true
              }
            }
          },
          take: 10,
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { name: 'asc' },
      take: 10  // Limit for testing
    });
    
    console.log(`✅ Found ${companies.length} companies`);
    
    // Show companies with partnerships
    const companiesWithPartnerships = companies.filter(c => 
      c._count.agencyPartnerships > 0 || c._count.advertiserPartnerships > 0
    );
    
    console.log(`🤝 ${companiesWithPartnerships.length} companies have partnerships`);
    
    companiesWithPartnerships.forEach(company => {
      const totalPartnerships = (company._count.agencyPartnerships || 0) + (company._count.advertiserPartnerships || 0);
      console.log(`\n📊 ${company.name} (${company.companyType})`);
      console.log(`   └─ ${totalPartnerships} total partnerships`);
      
      if (company.agencyPartnerships.length > 0) {
        console.log(`   └─ Agency partnerships:`);
        company.agencyPartnerships.forEach(p => {
          console.log(`      • ${p.advertiser.name} (${p.advertiser.city}, ${p.advertiser.state})`);
        });
      }
      
      if (company.advertiserPartnerships.length > 0) {
        console.log(`   └─ Advertiser partnerships:`);
        company.advertiserPartnerships.forEach(p => {
          console.log(`      • ${p.agency.name} (${p.agency.city}, ${p.agency.state})`);
        });
      }
      
      // This demonstrates the expandable UI logic
      const allPartnerships = [...company.agencyPartnerships, ...company.advertiserPartnerships];
      const visiblePartners = allPartnerships.slice(0, 3);
      const remainingCount = Math.max(0, totalPartnerships - 3);
      
      if (remainingCount > 0) {
        console.log(`   🔄 UI would show first 3 partners + "${remainingCount} more" expand button`);
      }
    });
    
  } catch (error) {
    console.error('❌ ERROR testing enhanced companies API:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testEnhancedCompaniesAPI();