#!/usr/bin/env npx tsx

import { PrismaClient } from '@prisma/client';
import * as readline from 'readline';

const prisma = new PrismaClient();

// Create readline interface for user confirmation
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
}

async function cleanupTestData() {
  console.log('🧹 DATABASE CLEANUP SCRIPT');
  console.log('=' .repeat(60));
  console.log('\n⚠️  WARNING: This will permanently delete test data!\n');

  // Check for --force flag
  const forceMode = process.argv.includes('--force');

  try {
    // Step 1: Show current state
    console.log('📊 Current Database State:');
    const [users, forumPosts, companies, contacts, events] = await Promise.all([
      prisma.user.count(),
      prisma.forumPost.count(),
      prisma.company.count(),
      prisma.contact.count(),
      prisma.event.count(),
    ]);

    console.log(`   Users: ${users} (WILL BE KEPT)`);
    console.log(`   Forum Posts: ${forumPosts} (WILL BE DELETED)`);
    console.log(`   Companies: ${companies} (WILL BE DELETED)`);
    console.log(`   Contacts: ${contacts} (WILL BE DELETED)`);
    console.log(`   Events: ${events} (WILL BE DELETED)`);
    console.log(`   Total records to delete: ${forumPosts + companies + contacts + events}\n`);

    // Step 2: Ask for confirmation (unless --force is used)
    console.log('🔍 What will be deleted:');
    console.log('   ✓ All forum posts');
    console.log('   ✓ All companies (test data)');
    console.log('   ✓ All contacts (test data)');
    console.log('   ✓ All events (test data)');
    console.log('\n🛡️  What will be preserved:');
    console.log('   ✓ All user accounts\n');

    if (!forceMode) {
      const confirmation = await askQuestion(
        `Type "DELETE ALL TEST DATA" to proceed (or anything else to cancel): `
      );

      if (confirmation !== 'DELETE ALL TEST DATA') {
        console.log('\n❌ Cleanup cancelled. No data was deleted.');
        rl.close();
        await prisma.$disconnect();
        process.exit(0);
      }
    } else {
      console.log('🚀 Running in --force mode, skipping confirmation...');
    }

    console.log('\n🚀 Starting cleanup...\n');

    // Step 3: Delete in correct order (respecting foreign key constraints)

    // Delete forum-related data
    console.log('1️⃣  Deleting forum post interactions...');
    const deletedCommentVotes = await prisma.forumCommentVote.deleteMany();
    const deletedComments = await prisma.forumComment.deleteMany();
    const deletedVotes = await prisma.forumVote.deleteMany();
    const deletedBookmarks = await prisma.forumBookmark.deleteMany();
    const deletedPollVotes = await prisma.pollVote.deleteMany();
    console.log(`   ✅ Deleted ${deletedCommentVotes.count} comment votes, ${deletedComments.count} comments, ${deletedVotes.count} votes, ${deletedBookmarks.count} bookmarks, ${deletedPollVotes.count} poll votes`);

    // Delete forum posts
    console.log('2️⃣  Deleting forum posts...');
    const deletedPosts = await prisma.forumPost.deleteMany();
    console.log(`   ✅ Deleted ${deletedPosts.count} forum posts`);

    // Delete event-related data
    console.log('3️⃣  Deleting event-related data...');
    const deletedRatings = await prisma.eventRating.deleteMany();
    const deletedAttendees = await prisma.eventAttendee.deleteMany();
    console.log(`   ✅ Deleted ${deletedRatings.count} ratings and ${deletedAttendees.count} attendees`);

    // Delete events
    console.log('4️⃣  Deleting events...');
    const deletedEvents = await prisma.event.deleteMany();
    console.log(`   ✅ Deleted ${deletedEvents.count} events`);

    // Delete contact-related data
    console.log('5️⃣  Deleting contact-related data...');
    const deletedContactInteractions = await prisma.contactInteraction.deleteMany();
    const deletedContactNotes = await prisma.contactNote.deleteMany();
    const deletedContactStatuses = await prisma.contactStatus.deleteMany();
    const deletedContactMentions = await prisma.contactMention.deleteMany();
    const deletedViewedContacts = await prisma.viewedContact.deleteMany();
    console.log(`   ✅ Deleted ${deletedContactInteractions.count} interactions, ${deletedContactNotes.count} notes, ${deletedContactStatuses.count} statuses`);

    // Delete contacts
    console.log('6️⃣  Deleting contacts...');
    const deletedContacts = await prisma.contact.deleteMany();
    console.log(`   ✅ Deleted ${deletedContacts.count} contacts`);

    // Delete company-related data
    console.log('7️⃣  Deleting company-related data...');
    const deletedCompanyFollows = await prisma.companyFollow.deleteMany();
    const deletedCompanyInsights = await prisma.companyInsight.deleteMany();
    const deletedCompanyMentions = await prisma.companyMention.deleteMany();
    const deletedCompanyPartnerships = await prisma.companyPartnership.deleteMany();
    console.log(`   ✅ Deleted ${deletedCompanyFollows.count} follows, ${deletedCompanyInsights.count} insights, ${deletedCompanyMentions.count} mentions`);

    // Delete companies
    console.log('8️⃣  Deleting companies...');
    const deletedCompanies = await prisma.company.deleteMany();
    console.log(`   ✅ Deleted ${deletedCompanies.count} companies`);

    // Step 4: Verify cleanup
    console.log('\n🔍 Verifying cleanup...');
    const [
      remainingUsers,
      remainingPosts,
      remainingCompanies,
      remainingContacts,
      remainingEvents,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.forumPost.count(),
      prisma.company.count(),
      prisma.contact.count(),
      prisma.event.count(),
    ]);

    console.log('\n📊 Final Database State:');
    console.log(`   Users: ${remainingUsers} ✅`);
    console.log(`   Forum Posts: ${remainingPosts} ${remainingPosts === 0 ? '✅' : '❌'}`);
    console.log(`   Companies: ${remainingCompanies} ${remainingCompanies === 0 ? '✅' : '❌'}`);
    console.log(`   Contacts: ${remainingContacts} ${remainingContacts === 0 ? '✅' : '❌'}`);
    console.log(`   Events: ${remainingEvents} ${remainingEvents === 0 ? '✅' : '❌'}`);

    const totalDeleted =
      deletedCommentVotes.count +
      deletedComments.count +
      deletedVotes.count +
      deletedBookmarks.count +
      deletedPollVotes.count +
      deletedPosts.count +
      deletedRatings.count +
      deletedAttendees.count +
      deletedEvents.count +
      deletedContactInteractions.count +
      deletedContactNotes.count +
      deletedContactStatuses.count +
      deletedContactMentions.count +
      deletedViewedContacts.count +
      deletedContacts.count +
      deletedCompanyFollows.count +
      deletedCompanyInsights.count +
      deletedCompanyMentions.count +
      deletedCompanyPartnerships.count +
      deletedCompanies.count;

    console.log('\n✅ Cleanup completed successfully!');
    console.log(`📊 Total records deleted: ${totalDeleted}`);
    console.log(`👥 User accounts preserved: ${remainingUsers}`);
    console.log('\n🎉 Database is now clean and ready for real production data!');

    // Step 5: Show preserved users
    console.log('\n👥 Preserved User Accounts:');
    const preservedUsers = await prisma.user.findMany({
      select: {
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    preservedUsers.forEach((user) => {
      console.log(`   - ${user.email} (${user.role})`);
    });

  } catch (error) {
    console.error('\n❌ Cleanup failed:', error);
    throw error;
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanupTestData()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
