import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testEventsData() {
  console.log('🎉 Testing Events Data Setup...\\n');

  try {
    // Check events by category
    const eventsByCategory = await prisma.event.groupBy({
      by: ['category'],
      _count: { category: true },
      orderBy: { category: 'asc' }
    });
    
    console.log('📋 Events by Category:');
    eventsByCategory.forEach(group => {
      console.log(`  - ${group.category}: ${group._count.category} events`);
    });

    // Check upcoming events
    const upcomingEvents = await prisma.event.findMany({
      where: {
        startDate: { gte: new Date() }
      },
      orderBy: { startDate: 'asc' },
      take: 5
    });

    console.log(`\\n📅 Upcoming Events (${upcomingEvents.length} found):`);
    upcomingEvents.forEach(event => {
      console.log(`  - "${event.name}" - ${event.startDate.toDateString()}`);
      console.log(`    Location: ${event.location} | Category: ${event.category}`);
    });

    // Check event attendees
    const attendees = await prisma.eventAttendee.count();
    const ratings = await prisma.eventRating.count();
    
    console.log(`\\n👥 Event Participation:`);
    console.log(`  - ${attendees} total attendees`);
    console.log(`  - ${ratings} event ratings`);

    // Show some sample ratings
    const sampleRatings = await prisma.eventRating.findMany({
      take: 3,
      include: {
        event: { select: { name: true } }
      },
      orderBy: { overallRating: 'desc' }
    });

    console.log(`\\n⭐ Sample Event Ratings:`);
    sampleRatings.forEach(rating => {
      console.log(`  - "${rating.event.name}": ${rating.overallRating}/5 stars`);
      console.log(`    Best for: ${rating.bestFor}`);
      console.log(`    Review: ${rating.review?.substring(0, 80)}...`);
    });

    // Show events with highest attendance
    const eventsWithAttendance = await prisma.event.findMany({
      orderBy: { attendeeCount: 'desc' },
      take: 5,
      select: {
        name: true,
        attendeeCount: true,
        category: true,
        location: true
      }
    });

    console.log(`\\n🏆 Largest Events by Attendance:`);
    eventsWithAttendance.forEach(event => {
      console.log(`  - ${event.name}: ${event.attendeeCount?.toLocaleString()} attendees`);
      console.log(`    ${event.category} in ${event.location}`);
    });

    // Test data suggestions
    if (eventsByCategory.length === 0) {
      console.log('\\n⚠️  No events found! Run:');
      console.log('   DATABASE_URL="file:./dev.db" npx tsx scripts/create-sample-events.ts');
    }

    if (attendees === 0) {
      console.log('\\n⚠️  No attendees found! Run:');
      console.log('   DATABASE_URL="file:./dev.db" npx tsx scripts/create-event-attendees.ts');
    }

    console.log('\\n✅ Events data check complete!');

  } catch (error) {
    console.error('❌ Error checking events data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testEventsData();