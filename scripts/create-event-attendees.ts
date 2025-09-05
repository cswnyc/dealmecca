import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createEventAttendees() {
  console.log('👥 Creating sample event attendees and ratings...\\n');

  try {
    // Get all events and the user
    const events = await prisma.event.findMany();
    const users = await prisma.user.findMany({ take: 1 });
    
    if (users.length === 0) {
      console.error('No users found. Please create a user first.');
      return;
    }
    
    const userId = users[0].id;

    // Clear existing data first
    await prisma.eventRating.deleteMany({ where: { userId } });
    await prisma.eventAttendee.deleteMany({ where: { userId } });
    
    console.log('🗑️  Cleared existing attendee data');

    // Create attendees and ratings for each event
    for (const event of events) {
      // Create attendee record
      const attendee = await prisma.eventAttendee.create({
        data: {
          userId: userId,
          eventId: event.id,
          status: event.endDate < new Date() ? 'ATTENDED' : 'REGISTERED',
          isGoing: true,
          hasAttended: event.endDate < new Date(), // Mark as attended if event is in the past
          connectionsIntended: Math.floor(Math.random() * 20) + 5,
          connectionsMade: Math.floor(Math.random() * 15) + 2,
          leadsGenerated: Math.floor(Math.random() * 8) + 1,
          dealsFromEvent: Math.floor(Math.random() * 3),
          revenueFromEvent: event.category === 'NETWORKING' || event.category === 'SUMMIT' ? 
            Math.floor(Math.random() * 50000) + 10000 : 
            Math.floor(Math.random() * 25000) + 5000,
          totalCost: event.estimatedCost ? event.estimatedCost + Math.floor(Math.random() * 500) : 0,
          notes: getEventNotes(event.name, event.category)
        }
      });

      // Create rating if event is completed or in the past
      if (event.endDate < new Date()) {
        const rating = await prisma.eventRating.create({
          data: {
            userId: userId,
            eventId: event.id,
            overallRating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
            networkingRating: Math.floor(Math.random() * 2) + 4,
            contentRating: Math.floor(Math.random() * 2) + 4,
            roiRating: Math.floor(Math.random() * 2) + 4,
            wouldRecommend: true,
            wouldAttendAgain: true,
            bestFor: getBestForCategory(event.category),
            review: getEventReview(event.name, event.category)
          }
        });

        console.log(`✅ Created attendee and rating for: ${event.name}`);
      } else {
        console.log(`✅ Created attendee for upcoming event: ${event.name}`);
      }
    }

    console.log('\\n👥 Event attendees and ratings created successfully!');
    
    // Show summary
    const attendeeCount = await prisma.eventAttendee.count();
    const ratingCount = await prisma.eventRating.count();
    
    console.log(`\\n📊 Summary:`);
    console.log(`- ${attendeeCount} event attendees`);
    console.log(`- ${ratingCount} event ratings`);
    
  } catch (error) {
    console.error('❌ Error creating event attendees:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function getBestForCategory(category: string): string {
  const bestForMap = {
    'CONFERENCE': 'Learning industry trends',
    'TRADE_SHOW': 'Discovering new vendors',
    'SUMMIT': 'Executive networking',
    'WORKSHOP': 'Skill development',
    'NETWORKING': 'Building relationships',
    'AWARDS': 'Industry recognition',
    'WEBINAR': 'Quick knowledge updates',
    'MASTERCLASS': 'Deep learning'
  };
  
  return bestForMap[category as keyof typeof bestForMap] || 'Professional development';
}

function getEventNotes(eventName: string, category: string): string {
  const notes = {
    'Advertising Week New York 2025': "Amazing networking opportunities. Met CMO from major CPG brand interested in programmatic solutions. Follow up scheduled for next week.",
    'IAB NewFronts 2025': "Great showcase of new inventory opportunities. Particularly interested in Roku's new ad formats and YouTube's CTV offerings.",
    'Programmatic I/O 2025': "Deep technical content on header bidding optimization. Learned about new identity solutions that could help with cookie deprecation.",
    'NAB Show 2025': "Focused on broadcast tech but found some interesting connected TV solutions. Good conversations with streaming platform reps.",
    'Digital Marketing Expo 2025': "Solid vendor showcase. Discovered new attribution platform that could solve client measurement challenges.",
    'Connected TV World Summit 2025': "Incredible content on CTV measurement and optimization. Made connections with 3 potential new clients in automotive vertical.",
    'Retail Media Summit 2025': "Essential learnings on Amazon DSP and Walmart Connect strategies. Met retail media buyers from major CPG companies.",
    'Media Sales Leaders Dinner - NYC': "Intimate setting led to great conversations about industry challenges. Discussed potential partnership opportunities.",
    'Women in Media Breakfast - Los Angeles': "Inspiring stories from female executives. Great mentorship connections made.",
    'Programmatic Advertising Masterclass': "Hands-on training was excellent. Finally understand supply path optimization strategies.",
    'Data-Driven Creative Workshop': "Practical workshop on dynamic creative optimization. Will implement learnings on current campaigns.",
    'Digital Marketing Awards 2025': "Great networking at the reception. Saw some innovative campaign examples that won awards.",
    'Privacy-First Advertising Strategies Webinar': "Timely content on cookieless targeting. Learned about new first-party data activation strategies.",
    'Q1 2025 Media Buying Trends Webinar': "Good overview of Q1 planning considerations. Helpful budget allocation frameworks."
  };
  
  return notes[eventName as keyof typeof notes] || `Great ${category.toLowerCase()} event. Made valuable connections and learned industry best practices.`;
}

function getEventReview(eventName: string, category: string): string {
  const reviews = {
    'Advertising Week New York 2025': "AW is the must-attend event for anyone serious about advertising. The networking alone justifies the investment, but the content quality has really improved. Particularly appreciated the programmatic and CTV focused sessions.",
    'IAB NewFronts 2025': "Essential for understanding the digital video landscape. Publishers do a great job showcasing their premium inventory. The networking dinners are where the real business gets done.",
    'Programmatic I/O 2025': "Best technical conference for programmatic professionals. Speakers actually work in the trenches, not just high-level strategy. The case studies were particularly valuable.",
    'Connected TV World Summit 2025': "Small but mighty event. Every conversation was valuable and relevant. The intimate setting allows for deeper discussions than larger conferences.",
    'Retail Media Summit 2025': "Perfectly timed as retail media explodes. Great mix of platform reps and advertiser case studies. Learned strategies I can implement immediately."
  };
  
  return reviews[eventName as keyof typeof reviews] || `Excellent ${category.toLowerCase()} with valuable industry insights and networking opportunities.`;
}

createEventAttendees();