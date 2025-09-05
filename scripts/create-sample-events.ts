import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleEvents = [
  // Major Industry Conferences
  {
    name: "Advertising Week New York 2025",
    description: "The world's premier advertising and marketing event, bringing together industry leaders, brands, agencies, and technology providers for five days of networking, learning, and inspiration.",
    website: "https://advertisingweek.com/new-york",
    startDate: new Date('2025-10-20'),
    endDate: new Date('2025-10-24'),
    location: "New York, NY",
    venue: "Multiple venues across NYC (Times Square, Hudson Yards, etc.)",
    category: "CONFERENCE" as const,
    industry: "ENTERTAINMENT_MEDIA",
    estimatedCost: 1500,
    attendeeCount: 120000,
    isVirtual: false,
    isHybrid: true,
    organizerName: "Stillwell Partners",
    organizerUrl: "https://stillwellpartners.com",
    registrationUrl: "https://advertisingweek.com/new-york/registration",
    callForSpeakers: true,
    sponsorshipAvailable: true,
    status: "PUBLISHED" as const,
    capacity: 130000,
    registrationDeadline: new Date('2025-10-15'),
    eventType: "Multi-day Conference",
    avgOverallRating: 4.3,
    avgNetworkingRating: 4.6,
    avgContentRating: 4.1,
    avgROIRating: 4.0,
    totalRatings: 1847
  },

  {
    name: "IAB NewFronts 2025",
    description: "The premier showcase of digital video programming and advertising opportunities from leading publishers and platforms. Essential for media buyers and advertisers planning their digital video investments.",
    website: "https://www.iab.com/newfronts",
    startDate: new Date('2025-05-05'),
    endDate: new Date('2025-05-09'),
    location: "New York, NY",
    venue: "Various venues in Manhattan",
    category: "CONFERENCE" as const,
    industry: "ENTERTAINMENT_MEDIA",
    estimatedCost: 800,
    attendeeCount: 15000,
    isVirtual: false,
    isHybrid: true,
    organizerName: "Interactive Advertising Bureau (IAB)",
    organizerUrl: "https://www.iab.com",
    registrationUrl: "https://www.iab.com/newfronts/registration",
    callForSpeakers: false,
    sponsorshipAvailable: true,
    status: "PUBLISHED" as const,
    capacity: 16000,
    registrationDeadline: new Date('2025-04-28'),
    eventType: "Upfront Presentations",
    avgOverallRating: 4.5,
    avgNetworkingRating: 4.8,
    avgContentRating: 4.4,
    avgROIRating: 4.7,
    totalRatings: 923
  },

  {
    name: "Programmatic I/O 2025",
    description: "The leading conference for programmatic advertising professionals. Deep dive into the latest trends, technology, and strategies shaping automated media buying.",
    website: "https://programmatic-io.com",
    startDate: new Date('2025-09-24'),
    endDate: new Date('2025-09-25'),
    location: "San Francisco, CA",
    venue: "Moscone Center",
    category: "CONFERENCE" as const,
    industry: "ENTERTAINMENT_MEDIA",
    estimatedCost: 1200,
    attendeeCount: 8500,
    isVirtual: false,
    isHybrid: true,
    organizerName: "AdExchanger",
    organizerUrl: "https://adexchanger.com",
    registrationUrl: "https://programmatic-io.com/register",
    callForSpeakers: true,
    sponsorshipAvailable: true,
    status: "PUBLISHED" as const,
    capacity: 9000,
    registrationDeadline: new Date('2025-09-20'),
    eventType: "Programmatic Focus",
    avgOverallRating: 4.4,
    avgNetworkingRating: 4.2,
    avgContentRating: 4.6,
    avgROIRating: 4.3,
    totalRatings: 654
  },

  // Trade Shows
  {
    name: "NAB Show 2025",
    description: "The ultimate event for media, entertainment and technology professionals. Explore cutting-edge broadcast technology, network with industry leaders, and discover solutions for content creation and distribution.",
    website: "https://nabshow.com",
    startDate: new Date('2025-04-12'),
    endDate: new Date('2025-04-17'),
    location: "Las Vegas, NV",
    venue: "Las Vegas Convention Center",
    category: "TRADE_SHOW" as const,
    industry: "ENTERTAINMENT_MEDIA",
    estimatedCost: 2000,
    attendeeCount: 91000,
    isVirtual: false,
    isHybrid: false,
    organizerName: "National Association of Broadcasters",
    organizerUrl: "https://www.nab.org",
    registrationUrl: "https://nabshow.com/attend/registration",
    callForSpeakers: true,
    sponsorshipAvailable: true,
    status: "PUBLISHED" as const,
    capacity: 95000,
    registrationDeadline: new Date('2025-04-10'),
    eventType: "Technology Showcase",
    avgOverallRating: 4.2,
    avgNetworkingRating: 4.0,
    avgContentRating: 4.3,
    avgROIRating: 4.1,
    totalRatings: 2156
  },

  {
    name: "Digital Marketing Expo 2025",
    description: "North America's premier digital marketing trade show. Connect with vendors, discover new technologies, and explore innovative marketing solutions across all digital channels.",
    website: "https://digitalmarketingexpo.com",
    startDate: new Date('2025-03-18'),
    endDate: new Date('2025-03-19'),
    location: "Chicago, IL",
    venue: "McCormick Place",
    category: "TRADE_SHOW" as const,
    industry: "ENTERTAINMENT_MEDIA",
    estimatedCost: 600,
    attendeeCount: 22000,
    isVirtual: false,
    isHybrid: true,
    organizerName: "Digital Marketing Institute",
    organizerUrl: "https://digitalmarketinginstitute.com",
    registrationUrl: "https://digitalmarketingexpo.com/register",
    callForSpeakers: true,
    sponsorshipAvailable: true,
    status: "PUBLISHED" as const,
    capacity: 25000,
    registrationDeadline: new Date('2025-03-15'),
    eventType: "Technology Exhibition",
    avgOverallRating: 3.9,
    avgNetworkingRating: 4.1,
    avgContentRating: 3.8,
    avgROIRating: 3.9,
    totalRatings: 1134
  },

  // Summits & Specialized Events
  {
    name: "Connected TV World Summit 2025",
    description: "The definitive gathering for CTV and streaming advertising professionals. Deep dive into audience targeting, measurement, and the future of television advertising.",
    website: "https://ctvworldsummit.com",
    startDate: new Date('2025-06-11'),
    endDate: new Date('2025-06-12'),
    location: "Los Angeles, CA",
    venue: "Beverly Hills Hotel",
    category: "SUMMIT" as const,
    industry: "ENTERTAINMENT_MEDIA",
    estimatedCost: 1800,
    attendeeCount: 1500,
    isVirtual: false,
    isHybrid: false,
    organizerName: "Streaming Media Events",
    organizerUrl: "https://streamingmediaevents.com",
    registrationUrl: "https://ctvworldsummit.com/registration",
    callForSpeakers: true,
    sponsorshipAvailable: true,
    status: "PUBLISHED" as const,
    capacity: 1800,
    registrationDeadline: new Date('2025-06-08'),
    eventType: "Executive Summit",
    avgOverallRating: 4.7,
    avgNetworkingRating: 4.9,
    avgContentRating: 4.6,
    avgROIRating: 4.8,
    totalRatings: 287
  },

  {
    name: "Retail Media Summit 2025",
    description: "Explore the explosive growth of retail media networks. Learn strategies for Amazon DSP, Walmart Connect, Target Roundel, and emerging retail media opportunities.",
    website: "https://retailmediasummit.com",
    startDate: new Date('2025-07-16'),
    endDate: new Date('2025-07-17'),
    location: "Seattle, WA",
    venue: "Four Seasons Hotel Seattle",
    category: "SUMMIT" as const,
    industry: "ENTERTAINMENT_MEDIA",
    estimatedCost: 1600,
    attendeeCount: 800,
    isVirtual: false,
    isHybrid: true,
    organizerName: "Commerce Media Institute",
    organizerUrl: "https://commercemediainstitute.com",
    registrationUrl: "https://retailmediasummit.com/attend",
    callForSpeakers: true,
    sponsorshipAvailable: true,
    status: "PUBLISHED" as const,
    capacity: 1000,
    registrationDeadline: new Date('2025-07-10'),
    eventType: "Strategic Summit",
    avgOverallRating: 4.6,
    avgNetworkingRating: 4.7,
    avgContentRating: 4.5,
    avgROIRating: 4.6,
    totalRatings: 156
  },

  // Networking Events
  {
    name: "Media Sales Leaders Dinner - NYC",
    description: "Exclusive dinner for VP-level and above media sales executives. Intimate setting for discussing industry challenges, sharing best practices, and building meaningful professional relationships.",
    startDate: new Date('2025-04-03'),
    endDate: new Date('2025-04-03'),
    location: "New York, NY",
    venue: "The Harvard Club of New York City",
    category: "NETWORKING" as const,
    industry: "ENTERTAINMENT_MEDIA",
    estimatedCost: 200,
    attendeeCount: 45,
    isVirtual: false,
    isHybrid: false,
    organizerName: "Media Executive Network",
    callForSpeakers: false,
    sponsorshipAvailable: false,
    status: "PUBLISHED" as const,
    capacity: 50,
    registrationDeadline: new Date('2025-03-30'),
    eventType: "Executive Dinner",
    avgOverallRating: 4.8,
    avgNetworkingRating: 5.0,
    avgContentRating: 4.5,
    avgROIRating: 4.7,
    totalRatings: 28
  },

  {
    name: "Women in Media Breakfast - Los Angeles",
    description: "Monthly breakfast gathering for women professionals in media, advertising, and marketing. Focused on career development, mentorship, and building a supportive professional community.",
    startDate: new Date('2025-02-14'),
    endDate: new Date('2025-02-14'),
    location: "Los Angeles, CA",
    venue: "Soho House West Hollywood",
    category: "NETWORKING" as const,
    industry: "ENTERTAINMENT_MEDIA",
    estimatedCost: 35,
    attendeeCount: 85,
    isVirtual: false,
    isHybrid: false,
    organizerName: "Women in Media LA",
    organizerUrl: "https://womeninmediala.org",
    registrationUrl: "https://womeninmediala.org/events",
    callForSpeakers: false,
    sponsorshipAvailable: true,
    status: "PUBLISHED" as const,
    capacity: 100,
    registrationDeadline: new Date('2025-02-12'),
    eventType: "Professional Breakfast",
    avgOverallRating: 4.5,
    avgNetworkingRating: 4.7,
    avgContentRating: 4.2,
    avgROIRating: 4.3,
    totalRatings: 73
  },

  // Workshops & Training
  {
    name: "Programmatic Advertising Masterclass",
    description: "Intensive 2-day workshop covering programmatic advertising fundamentals, advanced strategies, and hands-on campaign optimization. Perfect for media planners and buyers looking to level up their skills.",
    website: "https://programmaticmasterclass.com",
    startDate: new Date('2025-05-21'),
    endDate: new Date('2025-05-22'),
    location: "Austin, TX",
    venue: "JW Marriott Austin",
    category: "MASTERCLASS" as const,
    industry: "ENTERTAINMENT_MEDIA",
    estimatedCost: 950,
    attendeeCount: 120,
    isVirtual: false,
    isHybrid: true,
    organizerName: "Digital Advertising Academy",
    organizerUrl: "https://digitaladacademy.com",
    registrationUrl: "https://programmaticmasterclass.com/register",
    callForSpeakers: false,
    sponsorshipAvailable: false,
    status: "PUBLISHED" as const,
    capacity: 150,
    registrationDeadline: new Date('2025-05-18'),
    eventType: "Hands-on Training",
    avgOverallRating: 4.4,
    avgNetworkingRating: 3.8,
    avgContentRating: 4.8,
    avgROIRating: 4.5,
    totalRatings: 89
  },

  {
    name: "Data-Driven Creative Workshop",
    description: "Learn how to leverage data insights to create more effective advertising creative. Workshop covers A/B testing, dynamic creative optimization, and performance analysis.",
    startDate: new Date('2025-08-14'),
    endDate: new Date('2025-08-14'),
    location: "San Francisco, CA",
    venue: "Google Headquarters - Amphitheater",
    category: "WORKSHOP" as const,
    industry: "ENTERTAINMENT_MEDIA",
    estimatedCost: 400,
    attendeeCount: 75,
    isVirtual: false,
    isHybrid: true,
    organizerName: "Creative Analytics Institute",
    registrationUrl: "https://creativeanalytics.institute/workshop",
    callForSpeakers: false,
    sponsorshipAvailable: true,
    status: "PUBLISHED" as const,
    capacity: 100,
    registrationDeadline: new Date('2025-08-10'),
    eventType: "Creative Workshop",
    avgOverallRating: 4.2,
    avgNetworkingRating: 3.9,
    avgContentRating: 4.4,
    avgROIRating: 4.1,
    totalRatings: 64
  },

  // Awards & Recognition
  {
    name: "Digital Marketing Awards 2025",
    description: "Celebrating excellence in digital marketing and advertising. Awards ceremony recognizing outstanding campaigns, innovative strategies, and industry leadership across all digital channels.",
    website: "https://digitalmarketingawards.com",
    startDate: new Date('2025-11-14'),
    endDate: new Date('2025-11-14'),
    location: "New York, NY",
    venue: "Rainbow Room, Rockefeller Center",
    category: "AWARDS" as const,
    industry: "ENTERTAINMENT_MEDIA",
    estimatedCost: 300,
    attendeeCount: 500,
    isVirtual: false,
    isHybrid: true,
    organizerName: "Digital Marketing Institute",
    organizerUrl: "https://digitalmarketinginstitute.com",
    registrationUrl: "https://digitalmarketingawards.com/gala",
    callForSpeakers: false,
    sponsorshipAvailable: true,
    status: "PUBLISHED" as const,
    capacity: 600,
    registrationDeadline: new Date('2025-11-10'),
    eventType: "Awards Gala",
    avgOverallRating: 4.1,
    avgNetworkingRating: 4.4,
    avgContentRating: 3.7,
    avgROIRating: 3.9,
    totalRatings: 234
  },

  // Webinars & Virtual Events
  {
    name: "Privacy-First Advertising Strategies Webinar",
    description: "Navigate the cookieless future of advertising. Learn about first-party data strategies, privacy-compliant targeting, and building sustainable audience relationships in a privacy-first world.",
    website: "https://privacyfirstadvertising.com/webinar",
    startDate: new Date('2025-03-05'),
    endDate: new Date('2025-03-05'),
    location: "Virtual Event",
    category: "WEBINAR" as const,
    industry: "ENTERTAINMENT_MEDIA",
    estimatedCost: 0,
    attendeeCount: 2500,
    isVirtual: true,
    isHybrid: false,
    organizerName: "Privacy & Advertising Council",
    organizerUrl: "https://privacyadcouncil.org",
    registrationUrl: "https://privacyfirstadvertising.com/register",
    callForSpeakers: true,
    sponsorshipAvailable: true,
    status: "PUBLISHED" as const,
    capacity: 5000,
    registrationDeadline: new Date('2025-03-04'),
    eventType: "Educational Webinar",
    avgOverallRating: 4.0,
    avgNetworkingRating: 2.8,
    avgContentRating: 4.3,
    avgROIRating: 4.2,
    totalRatings: 1456
  },

  {
    name: "Q1 2025 Media Buying Trends Webinar",
    description: "Get ahead of Q1 planning with insights into emerging media buying trends, budget allocation strategies, and platform updates that will impact your campaigns.",
    website: "https://mediabuyingtrends.com/q1-2025",
    startDate: new Date('2025-01-15'),
    endDate: new Date('2025-01-15'),
    location: "Virtual Event",
    category: "WEBINAR" as const,
    industry: "ENTERTAINMENT_MEDIA",
    estimatedCost: 0,
    attendeeCount: 1800,
    isVirtual: true,
    isHybrid: false,
    organizerName: "Media Planning Institute",
    registrationUrl: "https://mediabuyingtrends.com/register",
    callForSpeakers: false,
    sponsorshipAvailable: true,
    status: "PUBLISHED" as const,
    capacity: 3000,
    registrationDeadline: new Date('2025-01-14'),
    eventType: "Trend Analysis",
    avgOverallRating: 3.8,
    avgNetworkingRating: 2.5,
    avgContentRating: 4.1,
    avgROIRating: 4.0,
    totalRatings: 892
  }
];

async function createSampleEvents() {
  console.log('🎉 Creating sample industry events...\\n');

  try {
    // Get a sample user to create events
    const users = await prisma.user.findMany({ take: 1 });
    if (users.length === 0) {
      console.error('No users found. Please create a user first.');
      return;
    }
    const creatorId = users[0].id;

    // Create events
    for (const eventData of sampleEvents) {
      const event = await prisma.event.create({
        data: {
          ...eventData,
          createdBy: creatorId
        }
      });

      console.log(`✅ Created event: ${event.name}`);
    }

    console.log('\\n🎉 Sample events created successfully!');
    
    // Show summary
    const eventCount = await prisma.event.count();
    const eventsByCategory = await prisma.event.groupBy({
      by: ['category'],
      _count: { category: true }
    });
    
    console.log(`\\n📊 Events Summary:`);
    console.log(`- ${eventCount} total events`);
    eventsByCategory.forEach(group => {
      console.log(`- ${group.category}: ${group._count.category} events`);
    });
    
  } catch (error) {
    console.error('❌ Error creating sample events:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleEvents();