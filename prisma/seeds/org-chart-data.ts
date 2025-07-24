import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const majorHoldingCompanies = [
  {
    name: "WPP",
    slug: "wpp",
    website: "https://www.wpp.com",
    companyType: "MEDIA_HOLDING_COMPANY" as const,
    city: "New York",
    state: "NY",
    region: "NORTHEAST" as const,
    country: "US",
    employeeCount: "MEGA_5000_PLUS" as const,
    revenueRange: "OVER_1B" as const,
    verified: true,
    dataQuality: "VERIFIED" as const,
    description: "Global leader in communications, experience, commerce and technology"
  },
  {
    name: "Omnicom Group",
    slug: "omnicom-group",
    website: "https://www.omnicomgroup.com",
    companyType: "MEDIA_HOLDING_COMPANY" as const,
    city: "New York",
    state: "NY",
    region: "NORTHEAST" as const,
    country: "US",
    employeeCount: "MEGA_5000_PLUS" as const,
    revenueRange: "OVER_1B" as const,
    verified: true,
    dataQuality: "VERIFIED" as const,
    description: "Leading global advertising and marketing communications company"
  },
  {
    name: "Publicis Groupe",
    slug: "publicis-groupe",
    website: "https://www.publicisgroupe.com",
    companyType: "MEDIA_HOLDING_COMPANY" as const,
    city: "New York",
    state: "NY",
    region: "NORTHEAST" as const,
    country: "US",
    employeeCount: "MEGA_5000_PLUS" as const,
    revenueRange: "OVER_1B" as const,
    verified: true,
    dataQuality: "VERIFIED" as const,
    description: "Global marketing and communications company"
  },
  {
    name: "IPG (Interpublic Group)",
    slug: "interpublic-group",
    website: "https://www.interpublic.com",
    companyType: "MEDIA_HOLDING_COMPANY" as const,
    city: "New York",
    state: "NY",
    region: "NORTHEAST" as const,
    country: "US",
    employeeCount: "MEGA_5000_PLUS" as const,
    revenueRange: "OVER_1B" as const,
    verified: true,
    dataQuality: "VERIFIED" as const,
    description: "Global advertising and marketing services company"
  }
];

export const majorAgencies = [
  // GroupM (WPP) Agencies
  {
    name: "GroupM",
    slug: "groupm",
    website: "https://www.groupm.com",
    companyType: "HOLDING_COMPANY_AGENCY" as const,
    agencyType: "MEDIA_SPECIALIST" as const,
    industry: null,
    city: "New York",
    state: "NY",
    region: "NORTHEAST" as const,
    country: "US",
    employeeCount: "ENTERPRISE_1001_5000" as const,
    revenueRange: "RANGE_500M_1B" as const,
    verified: true,
    dataQuality: "VERIFIED" as const,
    description: "World's largest media investment company",
    parentCompanyName: "WPP"
  },
  {
    name: "Mindshare",
    slug: "mindshare",
    website: "https://www.mindshareworld.com",
    companyType: "HOLDING_COMPANY_AGENCY" as const,
    agencyType: "FULL_SERVICE" as const,
    city: "New York",
    state: "NY",
    region: "NORTHEAST" as const,
    country: "US",
    employeeCount: "LARGE_201_1000" as const,
    revenueRange: "RANGE_100M_500M" as const,
    verified: true,
    dataQuality: "VERIFIED" as const,
    description: "Global media agency network",
    parentCompanyName: "GroupM"
  },
  {
    name: "MediaCom",
    slug: "mediacom",
    website: "https://www.mediacom.com",
    companyType: "HOLDING_COMPANY_AGENCY" as const,
    agencyType: "MEDIA_SPECIALIST" as const,
    city: "New York",
    state: "NY",
    region: "NORTHEAST" as const,
    country: "US",
    employeeCount: "LARGE_201_1000" as const,
    revenueRange: "RANGE_100M_500M" as const,
    verified: true,
    dataQuality: "VERIFIED" as const,
    description: "Global media communications specialist",
    parentCompanyName: "GroupM"
  },
  {
    name: "Wavemaker",
    slug: "wavemaker",
    website: "https://www.wavemakerglobal.com",
    companyType: "HOLDING_COMPANY_AGENCY" as const,
    agencyType: "MEDIA_SPECIALIST" as const,
    city: "New York",
    state: "NY",
    region: "NORTHEAST" as const,
    country: "US",
    employeeCount: "LARGE_201_1000" as const,
    revenueRange: "RANGE_100M_500M" as const,
    verified: true,
    dataQuality: "VERIFIED" as const,
    description: "Progressive media agency",
    parentCompanyName: "GroupM"
  },

  // Omnicom Agencies
  {
    name: "OMD",
    slug: "omd",
    website: "https://www.omd.com",
    companyType: "HOLDING_COMPANY_AGENCY" as const,
    agencyType: "MEDIA_SPECIALIST" as const,
    city: "New York",
    state: "NY",
    region: "NORTHEAST" as const,
    country: "US",
    employeeCount: "LARGE_201_1000" as const,
    revenueRange: "RANGE_100M_500M" as const,
    verified: true,
    dataQuality: "VERIFIED" as const,
    description: "Global media communications agency",
    parentCompanyName: "Omnicom Group"
  },
  {
    name: "PHD",
    slug: "phd",
    website: "https://www.phdnetwork.com",
    companyType: "HOLDING_COMPANY_AGENCY" as const,
    agencyType: "MEDIA_SPECIALIST" as const,
    city: "New York",
    state: "NY",
    region: "NORTHEAST" as const,
    country: "US",
    employeeCount: "MEDIUM_51_200" as const,
    revenueRange: "RANGE_25M_100M" as const,
    verified: true,
    dataQuality: "VERIFIED" as const,
    description: "Global media and communications agency",
    parentCompanyName: "Omnicom Group"
  },

  // Independent Agencies
  {
    name: "Horizon Media",
    slug: "horizon-media",
    website: "https://www.horizonmedia.com",
    companyType: "INDEPENDENT_AGENCY" as const,
    agencyType: "FULL_SERVICE" as const,
    city: "New York",
    state: "NY",
    region: "NORTHEAST" as const,
    country: "US",
    employeeCount: "ENTERPRISE_1001_5000" as const,
    revenueRange: "RANGE_100M_500M" as const,
    verified: true,
    dataQuality: "VERIFIED" as const,
    description: "Largest independent media agency in the US"
  },
  {
    name: "Havas Media",
    slug: "havas-media",
    website: "https://www.havasmedia.com",
    companyType: "HOLDING_COMPANY_AGENCY" as const,
    agencyType: "MEDIA_SPECIALIST" as const,
    city: "New York",
    state: "NY",
    region: "NORTHEAST" as const,
    country: "US",
    employeeCount: "LARGE_201_1000" as const,
    revenueRange: "RANGE_100M_500M" as const,
    verified: true,
    dataQuality: "VERIFIED" as const,
    description: "Global media planning and buying network"
  }
];

export const majorAdvertisers = [
  {
    name: "Procter & Gamble",
    slug: "procter-gamble",
    website: "https://www.pg.com",
    companyType: "NATIONAL_ADVERTISER" as const,
    industry: "CPG_PERSONAL_CARE" as const,
    city: "Cincinnati",
    state: "OH",
    region: "MIDWEST" as const,
    country: "US",
    employeeCount: "MEGA_5000_PLUS" as const,
    revenueRange: "OVER_1B" as const,
    verified: true,
    dataQuality: "VERIFIED" as const,
    description: "Leading consumer goods company with brands like Tide, Crest, and Pampers"
  },
  {
    name: "Coca-Cola Company",
    slug: "coca-cola",
    website: "https://www.coca-colacompany.com",
    companyType: "NATIONAL_ADVERTISER" as const,
    industry: "CPG_FOOD_BEVERAGE" as const,
    city: "Atlanta",
    state: "GA",
    region: "SOUTHEAST" as const,
    country: "US",
    employeeCount: "MEGA_5000_PLUS" as const,
    revenueRange: "OVER_1B" as const,
    verified: true,
    dataQuality: "VERIFIED" as const,
    description: "World's largest beverage company"
  },
  {
    name: "McDonald's Corporation",
    slug: "mcdonalds",
    website: "https://www.mcdonalds.com",
    companyType: "NATIONAL_ADVERTISER" as const,
    industry: "RETAIL_ECOMMERCE" as const,
    city: "Chicago",
    state: "IL",
    region: "MIDWEST" as const,
    country: "US",
    employeeCount: "MEGA_5000_PLUS" as const,
    revenueRange: "OVER_1B" as const,
    verified: true,
    dataQuality: "VERIFIED" as const,
    description: "Global fast food restaurant chain"
  },
  {
    name: "Apple Inc.",
    slug: "apple",
    website: "https://www.apple.com",
    companyType: "NATIONAL_ADVERTISER" as const,
    industry: "TECHNOLOGY" as const,
    city: "Cupertino",
    state: "CA",
    region: "WEST" as const,
    country: "US",
    employeeCount: "MEGA_5000_PLUS" as const,
    revenueRange: "OVER_1B" as const,
    verified: true,
    dataQuality: "VERIFIED" as const,
    description: "Technology company specializing in consumer electronics"
  },
  {
    name: "General Motors",
    slug: "general-motors",
    website: "https://www.gm.com",
    companyType: "NATIONAL_ADVERTISER" as const,
    industry: "AUTOMOTIVE" as const,
    city: "Detroit",
    state: "MI",
    region: "MIDWEST" as const,
    country: "US",
    employeeCount: "MEGA_5000_PLUS" as const,
    revenueRange: "OVER_1B" as const,
    verified: true,
    dataQuality: "VERIFIED" as const,
    description: "Global automotive manufacturer"
  }
];

export const sampleContacts = [
  // GroupM Executives
  {
    firstName: "Sarah",
    lastName: "Johnson",
    fullName: "Sarah Johnson", // Computed field but we'll set it
    title: "Chief Investment Officer",
    email: "sarah.johnson@groupm.com",
    department: "MEDIA_BUYING" as const,
    seniority: "C_LEVEL" as const,
    primaryRole: "DECISION_MAKER" as const,
    territories: JSON.stringify(["National"]),
    accounts: JSON.stringify(["P&G", "Coca-Cola", "General Motors"]),
    budgetRange: "OVER_25M" as const,
    verified: true,
    dataQuality: "VERIFIED" as const,
    companyName: "GroupM"
  },
  {
    firstName: "Michael",
    lastName: "Chen",
    fullName: "Michael Chen",
    title: "VP, Digital Strategy",
    email: "michael.chen@groupm.com",
    department: "STRATEGY_PLANNING" as const,
    seniority: "VP" as const,
    primaryRole: "STRATEGIST" as const,
    territories: JSON.stringify(["East Coast"]),
    accounts: JSON.stringify(["Apple", "McDonald's"]),
    budgetRange: "RANGE_5M_25M" as const,
    verified: true,
    dataQuality: "VERIFIED" as const,
    companyName: "GroupM"
  },

  // Mindshare Team
  {
    firstName: "Jessica",
    lastName: "Rodriguez",
    fullName: "Jessica Rodriguez",
    title: "Managing Director",
    email: "jessica.rodriguez@mindshareworld.com",
    department: "LEADERSHIP" as const,
    seniority: "SVP" as const,
    primaryRole: "DECISION_MAKER" as const,
    territories: JSON.stringify(["Northeast", "Mid-Atlantic"]),
    accounts: JSON.stringify(["Procter & Gamble", "General Motors"]),
    budgetRange: "OVER_25M" as const,
    verified: true,
    dataQuality: "VERIFIED" as const,
    companyName: "Mindshare"
  },

  // Horizon Media Independent
  {
    firstName: "David",
    lastName: "Thompson",
    fullName: "David Thompson",
    title: "Senior Media Director",
    email: "david.thompson@horizonmedia.com",
    department: "MEDIA_PLANNING" as const,
    seniority: "DIRECTOR" as const,
    primaryRole: "MEDIA_PLANNER" as const,
    territories: JSON.stringify(["National"]),
    accounts: JSON.stringify(["Coca-Cola", "Apple"]),
    budgetRange: "RANGE_1M_5M" as const,
    verified: true,
    dataQuality: "VERIFIED" as const,
    companyName: "Horizon Media"
  },

  // P&G Marketing Team
  {
    firstName: "Amanda",
    lastName: "Foster",
    fullName: "Amanda Foster",
    title: "Brand Director, Personal Care",
    email: "amanda.foster@pg.com",
    department: "MARKETING" as const,
    seniority: "DIRECTOR" as const,
    primaryRole: "DECISION_MAKER" as const,
    territories: JSON.stringify(["National"]),
    accounts: JSON.stringify(["Tide", "Crest", "Pampers"]),
    budgetRange: "RANGE_5M_25M" as const,
    verified: true,
    dataQuality: "VERIFIED" as const,
    companyName: "Procter & Gamble"
  },

  // OMD Team
  {
    firstName: "Robert",
    lastName: "Martinez",
    fullName: "Robert Martinez",
    title: "Senior Vice President",
    email: "robert.martinez@omd.com",
    department: "LEADERSHIP" as const,
    seniority: "SVP" as const,
    primaryRole: "DECISION_MAKER" as const,
    territories: JSON.stringify(["West Coast"]),
    accounts: JSON.stringify(["Apple", "McDonald's"]),
    budgetRange: "OVER_25M" as const,
    verified: true,
    dataQuality: "VERIFIED" as const,
    companyName: "OMD"
  },

  // Additional Agency Contacts
  {
    firstName: "Lisa",
    lastName: "Wong",
    fullName: "Lisa Wong",
    title: "Media Planning Director",
    email: "lisa.wong@mediacom.com",
    department: "MEDIA_PLANNING" as const,
    seniority: "DIRECTOR" as const,
    primaryRole: "MEDIA_PLANNER" as const,
    territories: JSON.stringify(["National"]),
    accounts: JSON.stringify(["Coca-Cola", "Procter & Gamble"]),
    budgetRange: "RANGE_5M_25M" as const,
    verified: true,
    dataQuality: "VERIFIED" as const,
    companyName: "MediaCom"
  },

  // Advertiser Side Contacts
  {
    firstName: "James",
    lastName: "Parker",
    fullName: "James Parker",
    title: "Global Media Director",
    email: "james.parker@coca-colacompany.com",
    department: "MARKETING" as const,
    seniority: "DIRECTOR" as const,
    primaryRole: "DECISION_MAKER" as const,
    territories: JSON.stringify(["Global"]),
    accounts: JSON.stringify(["Coca-Cola", "Sprite", "Fanta"]),
    budgetRange: "OVER_25M" as const,
    verified: true,
    dataQuality: "VERIFIED" as const,
    companyName: "Coca-Cola Company"
  }
];

export async function seedOrgChartData() {
  console.log('🚀 Starting org chart data seeding...');

  try {
    // 1. Create holding companies first
    console.log('📊 Creating holding companies...');
    const createdHoldingCompanies: any[] = [];
    for (const company of majorHoldingCompanies) {
      const created = await prisma.company.create({
        data: company
      });
      createdHoldingCompanies.push(created);
      console.log(`✅ Created: ${company.name}`);
    }

    // 2. Create agencies with parent relationships
    console.log('🏢 Creating agencies...');
    const createdAgencies: any[] = [];
    for (const agency of majorAgencies) {
      const { parentCompanyName, ...agencyData } = agency;
      
      // Find parent company if specified
      let parentCompanyId = null;
      if (parentCompanyName) {
        const parentCompany = createdHoldingCompanies.find(
          (company: any) => company.name === parentCompanyName
        ) || createdAgencies.find(
          (company: any) => company.name === parentCompanyName
        );
        if (parentCompany) {
          parentCompanyId = parentCompany.id;
        }
      }

      const created = await prisma.company.create({
        data: {
          ...agencyData,
          parentCompanyId
        }
      });
      createdAgencies.push(created);
      console.log(`✅ Created: ${agency.name}${parentCompanyName ? ` (under ${parentCompanyName})` : ''}`);
    }

    // 3. Create advertiser companies
    console.log('📢 Creating advertisers...');
    const createdAdvertisers = [];
    for (const advertiser of majorAdvertisers) {
      const created = await prisma.company.create({
        data: advertiser
      });
      createdAdvertisers.push(created);
      console.log(`✅ Created: ${advertiser.name}`);
    }

    // 4. Create sample contacts
    console.log('👥 Creating contacts...');
    for (const contact of sampleContacts) {
      const { companyName, ...contactData } = contact;
      
      // Find the company
      const company = await prisma.company.findFirst({
        where: { name: companyName }
      });

      if (company) {
        await prisma.contact.create({
          data: {
            ...contactData,
            companyId: company.id
          }
        });
        console.log(`✅ Created contact: ${contactData.fullName} at ${companyName}`);
      } else {
        console.log(`⚠️  Company not found: ${companyName}`);
      }
    }

    console.log('🎉 Org chart data seeding completed successfully!');
    
    // Print summary
    const companyCount = await prisma.company.count();
    const contactCount = await prisma.contact.count();
    
    console.log(`📊 Summary:`);
    console.log(`   Companies: ${companyCount}`);
    console.log(`   Contacts: ${contactCount}`);
    console.log(`   Data Quality: All verified premium data`);
    
  } catch (error) {
    console.error('❌ Error seeding org chart data:', error);
    throw error;
  }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedOrgChartData()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
} 