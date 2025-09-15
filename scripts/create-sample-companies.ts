import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleCompanies = [
  // Major Ad Agencies
  {
    name: "Wieden+Kennedy",
    slug: "wieden-kennedy",
    website: "https://www.wk.com",
    logoUrl: "https://logo.clearbit.com/wk.com",
    description: "Independent advertising agency known for creative excellence and brand building for Nike, Coca-Cola, and other major brands.",
    companyType: "INDEPENDENT_AGENCY",
    agencyType: "CREATIVE_SPECIALIST",
    industry: "ENTERTAINMENT_MEDIA",
    city: "Portland",
    state: "OR",
    country: "US",
    employeeCount: "MEDIUM_51_200",
    foundedYear: 1982,
    linkedinUrl: "https://www.linkedin.com/company/wieden-kennedy",
    twitterHandle: "@wk",
    verified: true,
    dataQuality: "VERIFIED"
  },

  {
    name: "GroupM",
    slug: "groupm",
    website: "https://www.groupm.com",
    logoUrl: "https://logo.clearbit.com/groupm.com",
    description: "The world's largest media investment company, part of WPP. Manages over $50 billion in annual media investment.",
    companyType: "HOLDING_COMPANY_AGENCY",
    agencyType: "MEDIA_SPECIALIST",
    industry: "ENTERTAINMENT_MEDIA",
    city: "New York",
    state: "NY",
    country: "US",
    employeeCount: "MEGA_5000_PLUS",
    foundedYear: 2003,
    linkedinUrl: "https://www.linkedin.com/company/groupm",
    twitterHandle: "@GroupMWorldwide",
    verified: true,
    dataQuality: "VERIFIED"
  },

  {
    name: "Dentsu",
    slug: "dentsu",
    website: "https://www.dentsu.com",
    logoUrl: "https://logo.clearbit.com/dentsu.com",
    description: "Leading global media and digital marketing communications company.",
    companyType: "HOLDING_COMPANY_AGENCY",
    agencyType: "FULL_SERVICE",
    industry: "ENTERTAINMENT_MEDIA",
    city: "Tokyo",
    state: "Tokyo",
    country: "JP",
    employeeCount: "MEGA_5000_PLUS",
    foundedYear: 1901,
    linkedinUrl: "https://www.linkedin.com/company/dentsu",
    verified: true,
    dataQuality: "VERIFIED"
  },

  // Major Advertisers
  {
    name: "Procter & Gamble",
    slug: "procter-gamble",
    website: "https://www.pg.com",
    logoUrl: "https://logo.clearbit.com/pg.com",
    description: "Multinational consumer goods corporation. One of the largest advertisers in the world with brands like Tide, Crest, and Pampers.",
    companyType: "NATIONAL_ADVERTISER",
    industry: "CPG_HOUSEHOLD",
    city: "Cincinnati",
    state: "OH",
    country: "US",
    employeeCount: "MEGA_5000_PLUS",
    foundedYear: 1837,
    linkedinUrl: "https://www.linkedin.com/company/procter-and-gamble",
    twitterHandle: "@ProcterGamble",
    verified: true,
    dataQuality: "VERIFIED"
  },

  {
    name: "Nike",
    slug: "nike",
    website: "https://www.nike.com",
    logoUrl: "https://logo.clearbit.com/nike.com",
    description: "Global leader in athletic footwear, apparel, equipment, and accessories.",
    companyType: "NATIONAL_ADVERTISER",
    industry: "SPORTS_FITNESS",
    city: "Beaverton",
    state: "OR",
    country: "US",
    employeeCount: "MEGA_5000_PLUS",
    foundedYear: 1964,
    linkedinUrl: "https://www.linkedin.com/company/nike",
    twitterHandle: "@Nike",
    verified: true,
    dataQuality: "VERIFIED"
  },

  {
    name: "Coca-Cola Company",
    slug: "coca-cola",
    website: "https://www.coca-colacompany.com",
    logoUrl: "https://logo.clearbit.com/coca-colacompany.com",
    description: "The world's largest beverage company, refreshing consumers with more than 500 sparkling and still brands.",
    companyType: "NATIONAL_ADVERTISER",
    industry: "CPG_FOOD_BEVERAGE",
    city: "Atlanta",
    state: "GA",
    country: "US",
    employeeCount: "MEGA_5000_PLUS",
    foundedYear: 1886,
    linkedinUrl: "https://www.linkedin.com/company/the-coca-cola-company",
    twitterHandle: "@CocaCola",
    verified: true,
    dataQuality: "VERIFIED"
  },

  // AdTech Companies
  {
    name: "The Trade Desk",
    slug: "the-trade-desk",
    website: "https://www.thetradedesk.com",
    logoUrl: "https://logo.clearbit.com/thetradedesk.com",
    description: "Leading independent demand-side platform (DSP) that enables buyers to manage data-driven digital advertising campaigns.",
    companyType: "ADTECH_VENDOR",
    industry: "TECHNOLOGY",
    city: "Ventura",
    state: "CA",
    country: "US",
    employeeCount: "LARGE_201_1000",
    foundedYear: 2009,
    linkedinUrl: "https://www.linkedin.com/company/the-trade-desk",
    twitterHandle: "@TheTradeDesk",
    verified: true,
    dataQuality: "VERIFIED"
  },

  {
    name: "Google Ad Manager",
    slug: "google-ad-manager",
    website: "https://admanager.google.com",
    logoUrl: "https://logo.clearbit.com/google.com",
    description: "Complete platform to grow ad revenue and protect your brand wherever people are watching, playing, or engaging.",
    companyType: "ADTECH_VENDOR",
    industry: "TECHNOLOGY",
    city: "Mountain View",
    state: "CA",
    country: "US",
    employeeCount: "MEGA_5000_PLUS",
    foundedYear: 1998,
    linkedinUrl: "https://www.linkedin.com/company/google",
    twitterHandle: "@Google",
    verified: true,
    dataQuality: "VERIFIED"
  },

  {
    name: "Amazon DSP",
    slug: "amazon-dsp",
    website: "https://advertising.amazon.com/solutions/products/dsp",
    logoUrl: "https://logo.clearbit.com/amazon.com",
    description: "Demand-side platform that allows advertisers to buy display and video ads programmatically.",
    companyType: "ADTECH_VENDOR",
    industry: "TECHNOLOGY",
    city: "Seattle",
    state: "WA",
    country: "US",
    employeeCount: "MEGA_5000_PLUS",
    foundedYear: 1994,
    linkedinUrl: "https://www.linkedin.com/company/amazon",
    twitterHandle: "@Amazon",
    verified: true,
    dataQuality: "VERIFIED"
  },

  // Publishers
  {
    name: "The New York Times",
    slug: "new-york-times",
    website: "https://www.nytimes.com",
    logoUrl: "https://logo.clearbit.com/nytimes.com",
    description: "American newspaper based in New York City with worldwide influence and readership.",
    companyType: "PUBLISHER",
    industry: "ENTERTAINMENT_MEDIA",
    city: "New York",
    state: "NY",
    country: "US",
    employeeCount: "LARGE_201_1000",
    foundedYear: 1851,
    linkedinUrl: "https://www.linkedin.com/company/the-new-york-times",
    twitterHandle: "@nytimes",
    verified: true,
    dataQuality: "VERIFIED"
  },

  {
    name: "BuzzFeed",
    slug: "buzzfeed",
    website: "https://www.buzzfeed.com",
    logoUrl: "https://logo.clearbit.com/buzzfeed.com",
    description: "Digital media company known for digital journalism, entertainment content, and quizzes.",
    companyType: "PUBLISHER",
    industry: "ENTERTAINMENT_MEDIA",
    city: "New York",
    state: "NY",
    country: "US",
    employeeCount: "MEDIUM_51_200",
    foundedYear: 2006,
    linkedinUrl: "https://www.linkedin.com/company/buzzfeed",
    twitterHandle: "@BuzzFeed",
    verified: true,
    dataQuality: "VERIFIED"
  },

  {
    name: "Vox Media",
    slug: "vox-media",
    website: "https://www.voxmedia.com",
    logoUrl: "https://logo.clearbit.com/voxmedia.com",
    description: "Modern media company with brands including Vox, The Verge, SB Nation, Eater, and more.",
    companyType: "PUBLISHER",
    industry: "ENTERTAINMENT_MEDIA",
    city: "Washington",
    state: "DC",
    country: "US",
    employeeCount: "LARGE_201_1000",
    foundedYear: 2005,
    linkedinUrl: "https://www.linkedin.com/company/vox-media-inc-",
    twitterHandle: "@VoxMedia",
    verified: true,
    dataQuality: "VERIFIED"
  },

  // Media Companies/Broadcasters
  {
    name: "NBCUniversal",
    slug: "nbcuniversal",
    website: "https://www.nbcuniversal.com",
    logoUrl: "https://logo.clearbit.com/nbcuniversal.com",
    description: "American media and entertainment conglomerate owned by Comcast.",
    companyType: "BROADCASTER",
    industry: "ENTERTAINMENT_MEDIA",
    city: "New York",
    state: "NY",
    country: "US",
    employeeCount: "MEGA_5000_PLUS",
    foundedYear: 2004,
    linkedinUrl: "https://www.linkedin.com/company/nbcuniversal-inc-",
    twitterHandle: "@NBCUniversal",
    verified: true,
    dataQuality: "VERIFIED"
  },

  {
    name: "ViacomCBS",
    slug: "viacomcbs",
    website: "https://www.viacomcbs.com",
    logoUrl: "https://logo.clearbit.com/viacomcbs.com",
    description: "Leading global media and entertainment company creating premium content and experiences.",
    companyType: "BROADCASTER",
    industry: "ENTERTAINMENT_MEDIA",
    city: "New York",
    state: "NY",
    country: "US",
    employeeCount: "MEGA_5000_PLUS",
    foundedYear: 2019,
    linkedinUrl: "https://www.linkedin.com/company/viacomcbs",
    twitterHandle: "@ViacomCBS",
    verified: true,
    dataQuality: "VERIFIED"
  },

  // Consultancies
  {
    name: "Accenture Interactive",
    slug: "accenture-interactive",
    website: "https://www.accenture.com/us-en/services/interactive-index",
    logoUrl: "https://logo.clearbit.com/accenture.com",
    description: "Experience agency that helps the world's leading brands transform their customer experiences.",
    companyType: "CONSULTANCY",
    industry: "TECHNOLOGY",
    city: "Chicago",
    state: "IL",
    country: "US",
    employeeCount: "MEGA_5000_PLUS",
    foundedYear: 2009,
    linkedinUrl: "https://www.linkedin.com/company/accenture-interactive",
    twitterHandle: "@AccentureACTIV",
    verified: true,
    dataQuality: "VERIFIED"
  },

  {
    name: "Deloitte Digital",
    slug: "deloitte-digital",
    website: "https://www.deloittedigital.com",
    logoUrl: "https://logo.clearbit.com/deloitte.com",
    description: "Creative digital consultancy that brings together creative and technology capabilities.",
    companyType: "CONSULTANCY",
    industry: "TECHNOLOGY",
    city: "New York",
    state: "NY",
    country: "US",
    employeeCount: "MEGA_5000_PLUS",
    foundedYear: 2012,
    linkedinUrl: "https://www.linkedin.com/company/deloitte-digital",
    twitterHandle: "@DeloitteDigital",
    verified: true,
    dataQuality: "VERIFIED"
  },

  // Smaller Independent Agencies
  {
    name: "72andSunny",
    slug: "72andsunny",
    website: "https://www.72andsunny.com",
    logoUrl: "https://logo.clearbit.com/72andsunny.com",
    description: "Creative agency that partners with bold brands including Google, Samsung, and Adidas.",
    companyType: "INDEPENDENT_AGENCY",
    agencyType: "CREATIVE_SPECIALIST",
    industry: "ENTERTAINMENT_MEDIA",
    city: "Los Angeles",
    state: "CA",
    country: "US",
    employeeCount: "MEDIUM_51_200",
    foundedYear: 2004,
    linkedinUrl: "https://www.linkedin.com/company/72andsunny",
    twitterHandle: "@72andsunny",
    verified: true,
    dataQuality: "VERIFIED"
  },

  {
    name: "R/GA",
    slug: "r-ga",
    website: "https://www.rga.com",
    logoUrl: "https://logo.clearbit.com/rga.com",
    description: "Digital agency that creates products, services, and communications that transform businesses.",
    companyType: "INDEPENDENT_AGENCY",
    agencyType: "DIGITAL_SPECIALIST",
    industry: "ENTERTAINMENT_MEDIA",
    city: "New York",
    state: "NY",
    country: "US",
    employeeCount: "LARGE_201_1000",
    foundedYear: 1977,
    linkedinUrl: "https://www.linkedin.com/company/r-ga",
    twitterHandle: "@RGA",
    verified: true,
    dataQuality: "VERIFIED"
  },

  // Local Advertisers
  {
    name: "Joe's Auto Dealership",
    slug: "joes-auto-dealership",
    website: "https://www.joesauto.com",
    description: "Leading automotive dealership serving the greater Austin area with new and used vehicles.",
    companyType: "LOCAL_ADVERTISER",
    industry: "AUTOMOTIVE",
    city: "Austin",
    state: "TX",
    country: "US",
    employeeCount: "SMALL_11_50",
    foundedYear: 1995,
    verified: false,
    dataQuality: "BASIC"
  },

  {
    name: "Metro Health Hospital",
    slug: "metro-health-hospital",
    website: "https://www.metrohealth.org",
    description: "Community hospital providing comprehensive healthcare services to local residents.",
    companyType: "LOCAL_ADVERTISER",
    industry: "HEALTHCARE_PHARMA",
    city: "Denver",
    state: "CO",
    country: "US",
    employeeCount: "LARGE_201_1000",
    foundedYear: 1987,
    verified: false,
    dataQuality: "BASIC"
  },

  // MarTech Companies
  {
    name: "Salesforce Marketing Cloud",
    slug: "salesforce-marketing-cloud",
    website: "https://www.salesforce.com/products/marketing-cloud",
    logoUrl: "https://logo.clearbit.com/salesforce.com",
    description: "Digital marketing platform that enables marketers to create and manage customer relationships.",
    companyType: "MARTECH_VENDOR",
    industry: "TECHNOLOGY",
    city: "San Francisco",
    state: "CA",
    country: "US",
    employeeCount: "MEGA_5000_PLUS",
    foundedYear: 1999,
    linkedinUrl: "https://www.linkedin.com/company/salesforce",
    twitterHandle: "@salesforce",
    verified: true,
    dataQuality: "VERIFIED"
  },

  {
    name: "HubSpot",
    slug: "hubspot",
    website: "https://www.hubspot.com",
    logoUrl: "https://logo.clearbit.com/hubspot.com",
    description: "Inbound marketing, sales, and customer service platform that helps companies attract visitors and convert leads.",
    companyType: "MARTECH_VENDOR",
    industry: "TECHNOLOGY",
    city: "Cambridge",
    state: "MA",
    country: "US",
    employeeCount: "LARGE_201_1000",
    foundedYear: 2006,
    linkedinUrl: "https://www.linkedin.com/company/hubspot",
    twitterHandle: "@HubSpot",
    verified: true,
    dataQuality: "VERIFIED"
  }
];

async function createSampleCompanies() {
  console.log('🏢 Creating sample companies...\\n');

  try {
    // Create companies
    for (const companyData of sampleCompanies) {
      // Check if company already exists
      const existing = await prisma.company.findFirst({
        where: {
          OR: [
            { name: companyData.name },
            { slug: companyData.slug }
          ]
        }
      });

      if (existing) {
        console.log(`⏭️  Skipping existing company: ${companyData.name}`);
        continue;
      }

      const company = await prisma.company.create({
        data: {
          ...companyData,
          normalizedName: companyData.name.toLowerCase(),
          normalizedWebsite: companyData.website?.toLowerCase()
        }
      });

      console.log(`✅ Created company: ${company.name} (${company.companyType})`);
    }

    console.log('\\n🎉 Sample companies created successfully!');
    
    // Show summary
    const companyCount = await prisma.company.count();
    const companiesByType = await prisma.company.groupBy({
      by: ['companyType'],
      _count: { companyType: true }
    });
    
    console.log(`\\n📊 Companies Summary:`);
    console.log(`- ${companyCount} total companies`);
    companiesByType.forEach(group => {
      console.log(`- ${group.companyType}: ${group._count.companyType} companies`);
    });
    
  } catch (error) {
    console.error('❌ Error creating sample companies:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleCompanies();