#!/usr/bin/env npx tsx
/**
 * Update All Users to Reddit-Style Usernames
 * Applies the generated Reddit usernames to the database
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function updateUsersToRedditNames() {
  try {
    console.log('🚀 Starting Reddit username update process...');

    // Load the generated mappings
    const mappingsPath = './scripts/reddit-username-mappings.json';
    
    if (!fs.existsSync(mappingsPath)) {
      console.error('❌ Reddit username mappings file not found!');
      console.log('   Please run: npx tsx scripts/reddit-username-generator.ts first');
      return;
    }

    const mappings = JSON.parse(fs.readFileSync(mappingsPath, 'utf8'));
    console.log(`📊 Loaded ${mappings.length} username mappings`);

    let updateCount = 0;
    let errorCount = 0;

    console.log('\n🔄 Updating usernames...');
    console.log('================================');

    for (const mapping of mappings) {
      try {
        // Verify user exists and update
        const existingUser = await prisma.user.findUnique({
          where: { id: mapping.id }
        });

        if (existingUser) {
          await prisma.user.update({
            where: { id: mapping.id },
            data: { name: mapping.newName }
          });

          console.log(`✅ ${mapping.oldName} → ${mapping.newName}`);
          updateCount++;
        } else {
          console.log(`⚠️  User not found: ${mapping.oldName} (ID: ${mapping.id})`);
          errorCount++;
        }
      } catch (error) {
        console.error(`❌ Error updating ${mapping.oldName}:`, error);
        errorCount++;
      }
    }

    console.log('\n🎉 Reddit Username Update Complete!');
    console.log(`📈 Results:`);
    console.log(`   • Successfully updated: ${updateCount} users`);
    console.log(`   • Errors: ${errorCount} users`);

    // Verify the changes
    console.log('\n🔍 Verification - Current usernames:');
    const updatedUsers = await prisma.user.findMany({
      select: { name: true, email: true },
      orderBy: { name: 'asc' },
      take: 20
    });

    updatedUsers.forEach(user => {
      const isRedditStyle = user.name.includes('u/') || 
                           /\d/.test(user.name) || 
                           ['CTV', 'DSP', 'SSP', 'RTB', 'CPC', 'CPM'].some(term => 
                             user.name.toUpperCase().includes(term)
                           );
      const indicator = isRedditStyle ? '✅' : '❌';
      console.log(`   ${indicator} ${user.name}`);
    });

    if (updatedUsers.length < mappings.length) {
      console.log(`   ... and ${mappings.length - updatedUsers.length} more users`);
    }

    // Summary statistics
    const allUsers = await prisma.user.findMany({
      select: { name: true }
    });

    const withUPrefix = allUsers.filter(u => u.name.startsWith('u/')).length;
    const withNumbers = allUsers.filter(u => /\d/.test(u.name)).length;
    const withAdTech = allUsers.filter(u => 
      ['CTV', 'DSP', 'SSP', 'RTB', 'CPC', 'CPM', 'DMP', 'CDP'].some(term => 
        u.name.toUpperCase().includes(term)
      )
    ).length;

    console.log('\n📊 Final Statistics:');
    console.log(`   • Total users: ${allUsers.length}`);
    console.log(`   • With "u/" prefix: ${withUPrefix}`);
    console.log(`   • With numbers: ${withNumbers}`);
    console.log(`   • Ad tech themed: ${withAdTech}`);

    return { updateCount, errorCount };

  } catch (error) {
    console.error('❌ Error updating usernames:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  updateUsersToRedditNames()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { updateUsersToRedditNames };