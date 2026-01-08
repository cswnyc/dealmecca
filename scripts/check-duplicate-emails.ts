import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDuplicateEmails() {
  console.log('🔍 Checking for duplicate email addresses with different casings...\n');

  // Get all users
  const allUsers = await prisma.user.findMany({
    where: {
      email: {
        not: null
      }
    },
    select: {
      id: true,
      email: true,
      accountStatus: true,
      createdAt: true,
      firebaseUid: true
    },
    orderBy: {
      email: 'asc'
    }
  });

  console.log(`Total users with email: ${allUsers.length}\n`);

  // Group by lowercase email
  const emailGroups = new Map<string, typeof allUsers>();
  
  for (const user of allUsers) {
    if (!user.email) continue;
    
    const normalizedEmail = user.email.toLowerCase();
    if (!emailGroups.has(normalizedEmail)) {
      emailGroups.set(normalizedEmail, []);
    }
    emailGroups.get(normalizedEmail)!.push(user);
  }

  // Find duplicates
  let duplicatesFound = 0;
  
  for (const [normalizedEmail, users] of emailGroups.entries()) {
    if (users.length > 1) {
      duplicatesFound++;
      console.log(`❌ DUPLICATE FOUND: "${normalizedEmail}"`);
      console.log(`   Found ${users.length} users with this email (different casings):\n`);
      
      for (const user of users) {
        console.log(`   - ID: ${user.id}`);
        console.log(`     Email: "${user.email}" (as stored)`);
        console.log(`     Status: ${user.accountStatus || 'NULL'}`);
        console.log(`     Created: ${user.createdAt}`);
        console.log(`     FirebaseUID: ${user.firebaseUid || 'NULL'}`);
        console.log('');
      }
      console.log('---\n');
    }
  }

  if (duplicatesFound === 0) {
    console.log('✅ No duplicate emails found!\n');
  } else {
    console.log(`⚠️  Found ${duplicatesFound} email(s) with duplicates\n`);
    console.log('💡 SOLUTION: The auth flow is creating new users because of case-sensitive lookups.');
    console.log('   You may want to merge these duplicates and keep the APPROVED one.\n');
  }

  // Also check for the specific user mentioned
  console.log('🔍 Checking specific users mentioned in issue:\n');
  
  const testEmails = ['cswnyc@gmail.com', 'chris@test.com'];
  
  for (const email of testEmails) {
    const matches = await prisma.user.findMany({
      where: {
        email: {
          equals: email,
          mode: 'insensitive' // Case-insensitive search
        }
      },
      select: {
        id: true,
        email: true,
        accountStatus: true,
        createdAt: true,
        firebaseUid: true
      }
    });

    if (matches.length > 0) {
      console.log(`📧 "${email}" (case-insensitive search):`);
      for (const user of matches) {
        console.log(`   - ID: ${user.id}`);
        console.log(`     Email stored as: "${user.email}"`);
        console.log(`     Status: ${user.accountStatus || 'NULL'}`);
        console.log(`     FirebaseUID: ${user.firebaseUid || 'NULL'}`);
        console.log('');
      }
    } else {
      console.log(`📧 "${email}": Not found\n`);
    }
  }

  await prisma.$disconnect();
}

checkDuplicateEmails().catch(console.error);
