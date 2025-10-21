import { prisma } from '../lib/prisma';
import { randomBytes } from 'crypto';

// Generate a unique ID for events
function generateEventId() {
  return randomBytes(16).toString('hex').substring(0, 24);
}

const MOCK_EVENTS = [
  {
    name: 'Advertising Week New York 2025',
    description: 'The world\'s premier advertising and marketing event, bringing together industry leaders, brands, agencies, and technology providers for five days of networking, learning, and inspiration.',
    website: 'https://advertisingweek.com/new-york',
    startDate: new Date('2025-10-20T09:00:00Z'),
    endDate: new Date('2025-10-24T18:00:00Z'),
    location: 'New York, NY',
    venue: 'Multiple venues across NYC (Times Square, Hudson Yards, etc.)',
    category: 'CONFERENCE',
    industry: 'ENTERTAINMENT_MEDIA',
    estimatedCost: 1500,
    attendeeCount: 120000,
    isVirtual: false,
    isHybrid: true,
    organizerName: 'Stillwell Partners',
    organizerUrl: 'https://stillwellpartners.com',
    registrationUrl: 'https://advertisingweek.com/new-york/registration',
    callForSpeakers: true,
    sponsorshipAvailable: true,
    status: 'PUBLISHED',
    capacity: 130000,
    registrationDeadline: new Date('2025-10-15T23:59:59Z'),
    eventType: 'Multi-day Conference',
    avgOverallRating: 4.3,
    avgNetworkingRating: 4.6,
    avgContentRating: 4.1,
    avgROIRating: 4.0,
    totalRatings: 1847
  },
  {
    name: 'IAB NewFronts 2025',
    description: 'The premier showcase of digital video programming and advertising opportunities from leading publishers and platforms. Essential for media buyers and advertisers planning their digital video investments.',
    website: 'https://www.iab.com/newfronts',
    startDate: new Date('2025-05-05T09:00:00Z'),
    endDate: new Date('2025-05-09T17:00:00Z'),
    location: 'New York, NY',
    venue: 'PlayStation Theater & Virtual Events',
    category: 'CONFERENCE',
    industry: 'ENTERTAINMENT_MEDIA',
    estimatedCost: 950,
    attendeeCount: 5000,
    isVirtual: false,
    isHybrid: true,
    organizerName: 'Interactive Advertising Bureau',
    organizerUrl: 'https://www.iab.com',
    registrationUrl: 'https://www.iab.com/newfronts/register',
    callForSpeakers: false,
    sponsorshipAvailable: true,
    status: 'PUBLISHED',
    capacity: 6000,
    registrationDeadline: new Date('2025-04-30T23:59:59Z'),
    eventType: 'Multi-day Conference',
    avgOverallRating: 4.1,
    avgNetworkingRating: 4.4,
    avgContentRating: 4.2,
    avgROIRating: 4.0,
    totalRatings: 623
  },
  {
    name: 'Programmatic I/O 2025',
    description: 'The leading event for programmatic advertising professionals, featuring deep-dive sessions on ad tech, data-driven marketing, and the future of automated media buying.',
    website: 'https://www.adexchanger.com/programmatic-io',
    startDate: new Date('2025-03-18T09:00:00Z'),
    endDate: new Date('2025-03-19T18:00:00Z'),
    location: 'San Francisco, CA',
    venue: 'Yerba Buena Center for the Arts',
    category: 'CONFERENCE',
    industry: 'TECHNOLOGY_SOFTWARE',
    estimatedCost: 1200,
    attendeeCount: 2500,
    isVirtual: false,
    isHybrid: false,
    organizerName: 'AdExchanger',
    organizerUrl: 'https://www.adexchanger.com',
    registrationUrl: 'https://www.adexchanger.com/programmatic-io/register',
    callForSpeakers: true,
    sponsorshipAvailable: true,
    status: 'PUBLISHED',
    capacity: 3000,
    registrationDeadline: new Date('2025-03-15T23:59:59Z'),
    eventType: 'Two-day Conference',
    avgOverallRating: 4.5,
    avgNetworkingRating: 4.3,
    avgContentRating: 4.7,
    avgROIRating: 4.4,
    totalRatings: 412
  },
  {
    name: 'NAB Show 2025',
    description: 'The National Association of Broadcasters Show is the world\'s largest convention for professionals in media, entertainment, and technology. Showcasing cutting-edge products, technologies, and services.',
    website: 'https://nabshow.com',
    startDate: new Date('2025-04-12T09:00:00Z'),
    endDate: new Date('2025-04-17T17:00:00Z'),
    location: 'Las Vegas, NV',
    venue: 'Las Vegas Convention Center',
    category: 'TRADE_SHOW',
    industry: 'ENTERTAINMENT_MEDIA',
    estimatedCost: 800,
    attendeeCount: 65000,
    isVirtual: false,
    isHybrid: true,
    organizerName: 'National Association of Broadcasters',
    organizerUrl: 'https://www.nab.org',
    registrationUrl: 'https://nabshow.com/register',
    callForSpeakers: true,
    sponsorshipAvailable: true,
    status: 'PUBLISHED',
    capacity: 70000,
    registrationDeadline: new Date('2025-04-10T23:59:59Z'),
    eventType: 'Trade Show',
    avgOverallRating: 4.2,
    avgNetworkingRating: 4.5,
    avgContentRating: 4.0,
    avgROIRating: 4.1,
    totalRatings: 2134
  },
  {
    name: 'SXSW 2025',
    description: 'South by Southwest is the premier destination for discovery, covering music, film, interactive media, and convergence culture. An unparalleled gathering of creative professionals.',
    website: 'https://www.sxsw.com',
    startDate: new Date('2025-03-07T09:00:00Z'),
    endDate: new Date('2025-03-16T23:00:00Z'),
    location: 'Austin, TX',
    venue: 'Austin Convention Center & Various Venues',
    category: 'CONFERENCE',
    industry: 'ENTERTAINMENT_MEDIA',
    estimatedCost: 1795,
    attendeeCount: 400000,
    isVirtual: false,
    isHybrid: false,
    organizerName: 'SXSW, LLC',
    organizerUrl: 'https://www.sxsw.com',
    registrationUrl: 'https://www.sxsw.com/attend',
    callForSpeakers: true,
    sponsorshipAvailable: true,
    status: 'PUBLISHED',
    capacity: 450000,
    registrationDeadline: new Date('2025-03-01T23:59:59Z'),
    eventType: 'Festival',
    avgOverallRating: 4.4,
    avgNetworkingRating: 4.7,
    avgContentRating: 4.3,
    avgROIRating: 4.2,
    totalRatings: 5621
  },
  {
    name: 'CES 2025',
    description: 'The Consumer Electronics Show is the world\'s gathering place for all those who thrive on the business of consumer technologies. Showcasing next-generation innovations.',
    website: 'https://www.ces.tech',
    startDate: new Date('2025-01-07T09:00:00Z'),
    endDate: new Date('2025-01-10T18:00:00Z'),
    location: 'Las Vegas, NV',
    venue: 'Las Vegas Convention Center',
    category: 'TRADE_SHOW',
    industry: 'TECHNOLOGY_SOFTWARE',
    estimatedCost: 1200,
    attendeeCount: 170000,
    isVirtual: false,
    isHybrid: true,
    organizerName: 'Consumer Technology Association',
    organizerUrl: 'https://www.cta.tech',
    registrationUrl: 'https://www.ces.tech/register',
    callForSpeakers: true,
    sponsorshipAvailable: true,
    status: 'PUBLISHED',
    capacity: 180000,
    registrationDeadline: new Date('2025-01-05T23:59:59Z'),
    eventType: 'Trade Show',
    avgOverallRating: 4.6,
    avgNetworkingRating: 4.7,
    avgContentRating: 4.5,
    avgROIRating: 4.6,
    totalRatings: 8234
  },
  {
    name: 'Cannes Lions 2025',
    description: 'The International Festival of Creativity is the must-attend event for advertising and creative communications professionals worldwide. Celebrating excellence in creativity.',
    website: 'https://www.canneslions.com',
    startDate: new Date('2025-06-16T09:00:00Z'),
    endDate: new Date('2025-06-20T18:00:00Z'),
    location: 'Cannes, France',
    venue: 'Palais des Festivals',
    category: 'AWARDS',
    industry: 'ENTERTAINMENT_MEDIA',
    estimatedCost: 3500,
    attendeeCount: 15000,
    isVirtual: false,
    isHybrid: false,
    organizerName: 'Ascential Events',
    organizerUrl: 'https://www.ascentialevents.com',
    registrationUrl: 'https://www.canneslions.com/register',
    callForSpeakers: false,
    sponsorshipAvailable: true,
    status: 'PUBLISHED',
    capacity: 16000,
    registrationDeadline: new Date('2025-06-10T23:59:59Z'),
    eventType: 'International Festival',
    avgOverallRating: 4.7,
    avgNetworkingRating: 4.8,
    avgContentRating: 4.6,
    avgROIRating: 4.5,
    totalRatings: 3421
  },
  {
    name: 'dmexco 2025',
    description: 'Digital Marketing Exposition & Conference - Europe\'s leading digital marketing and tech event. Where the digital industry meets to drive business forward.',
    website: 'https://dmexco.com',
    startDate: new Date('2025-09-17T09:00:00Z'),
    endDate: new Date('2025-09-18T18:00:00Z'),
    location: 'Cologne, Germany',
    venue: 'Koelnmesse',
    category: 'CONFERENCE',
    industry: 'TECHNOLOGY_SOFTWARE',
    estimatedCost: 850,
    attendeeCount: 40000,
    isVirtual: false,
    isHybrid: true,
    organizerName: 'Koelnmesse GmbH',
    organizerUrl: 'https://www.koelnmesse.com',
    registrationUrl: 'https://dmexco.com/register',
    callForSpeakers: true,
    sponsorshipAvailable: true,
    status: 'PUBLISHED',
    capacity: 45000,
    registrationDeadline: new Date('2025-09-15T23:59:59Z'),
    eventType: 'Two-day Conference & Expo',
    avgOverallRating: 4.3,
    avgNetworkingRating: 4.5,
    avgContentRating: 4.2,
    avgROIRating: 4.3,
    totalRatings: 1876
  },
  {
    name: 'Ad:Tech New York 2025',
    description: 'Where marketing, technology, and media converge. Focusing on the latest trends in digital marketing, advertising technology, and data-driven strategies.',
    website: 'https://www.adtechconf.com',
    startDate: new Date('2025-11-12T09:00:00Z'),
    endDate: new Date('2025-11-13T18:00:00Z'),
    location: 'New York, NY',
    venue: 'Javits Center',
    category: 'CONFERENCE',
    industry: 'TECHNOLOGY_SOFTWARE',
    estimatedCost: 995,
    attendeeCount: 8000,
    isVirtual: false,
    isHybrid: true,
    organizerName: 'dmg events',
    organizerUrl: 'https://www.dmgevents.com',
    registrationUrl: 'https://www.adtechconf.com/register',
    callForSpeakers: true,
    sponsorshipAvailable: true,
    status: 'PUBLISHED',
    capacity: 9000,
    registrationDeadline: new Date('2025-11-10T23:59:59Z'),
    eventType: 'Two-day Conference',
    avgOverallRating: 4.0,
    avgNetworkingRating: 4.2,
    avgContentRating: 4.1,
    avgROIRating: 3.9,
    totalRatings: 745
  },
  {
    name: 'Possible Conference 2025',
    description: 'Exploring the intersection of marketing, technology, and innovation. Featuring thought leaders discussing the future of brands in a digital world.',
    website: 'https://www.possibleconf.com',
    startDate: new Date('2025-04-22T09:00:00Z'),
    endDate: new Date('2025-04-24T17:00:00Z'),
    location: 'Miami, FL',
    venue: 'Fontainebleau Miami Beach',
    category: 'CONFERENCE',
    industry: 'ENTERTAINMENT_MEDIA',
    estimatedCost: 1100,
    attendeeCount: 3500,
    isVirtual: false,
    isHybrid: false,
    organizerName: 'Worldwide Partners Inc.',
    organizerUrl: 'https://www.worldwidepartnersusa.com',
    registrationUrl: 'https://www.possibleconf.com/register',
    callForSpeakers: true,
    sponsorshipAvailable: true,
    status: 'PUBLISHED',
    capacity: 4000,
    registrationDeadline: new Date('2025-04-20T23:59:59Z'),
    eventType: 'Three-day Conference',
    avgOverallRating: 4.2,
    avgNetworkingRating: 4.4,
    avgContentRating: 4.0,
    avgROIRating: 4.1,
    totalRatings: 512
  }
];

async function seedEvents() {
  try {
    console.log('🌱 Starting to seed events...');

    // First, get or create an admin user to be the creator
    let adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!adminUser) {
      console.log('⚠️  No admin user found. Creating a default admin user for event creation...');
      adminUser = await prisma.user.create({
        data: {
          email: 'admin@dealmecca.pro',
          name: 'DealMecca Admin',
          role: 'ADMIN',
          firebaseUid: 'admin-default-uid',
          isActive: true
        }
      });
      console.log('✅ Created admin user:', adminUser.email);
    }

    console.log(`📌 Using admin user: ${adminUser.name} (${adminUser.email})`);

    // Check if events already exist
    const existingCount = await prisma.event.count();
    if (existingCount > 0) {
      console.log(`⚠️  Database already has ${existingCount} events. Skipping seed to avoid duplicates.`);
      console.log('   To re-seed, delete existing events first.');
      return;
    }

    // Create events
    let created = 0;
    for (const eventData of MOCK_EVENTS) {
      try {
        await prisma.event.create({
          data: {
            ...eventData,
            id: generateEventId(),
            createdBy: adminUser.id,
            updatedAt: new Date()
          }
        });
        created++;
        console.log(`✅ Created event: ${eventData.name}`);
      } catch (error) {
        console.error(`❌ Failed to create event: ${eventData.name}`, error);
      }
    }

    console.log(`\n🎉 Successfully seeded ${created} events!`);

    // Show stats
    const stats = await Promise.all([
      prisma.event.count(),
      prisma.event.count({ where: { status: 'PUBLISHED' } }),
      prisma.event.count({ where: { category: 'CONFERENCE' } }),
      prisma.event.count({ where: { category: 'TRADE_SHOW' } }),
      prisma.event.count({ where: { category: 'AWARDS' } })
    ]);

    console.log('\n📊 Event Statistics:');
    console.log(`   Total Events: ${stats[0]}`);
    console.log(`   Published: ${stats[1]}`);
    console.log(`   Conferences: ${stats[2]}`);
    console.log(`   Trade Shows: ${stats[3]}`);
    console.log(`   Awards: ${stats[4]}`);

  } catch (error) {
    console.error('❌ Error seeding events:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedEvents()
  .then(() => {
    console.log('\n✅ Seed completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  });
