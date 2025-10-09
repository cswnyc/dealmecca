import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Firebase Admin
if (getApps().length === 0) {
  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}'
  );

  initializeApp({
    credential: cert(serviceAccount),
  });
}

const auth = getAuth();

async function createTestUsers() {
  const users = [
    {
      email: 'admin@dealmecca.pro',
      password: 'password123',
      displayName: 'Admin User',
    },
    {
      email: 'pro@dealmecca.pro',
      password: 'test123',
      displayName: 'Pro User',
    },
  ];

  for (const userData of users) {
    try {
      // Try to get existing user
      let user;
      try {
        user = await auth.getUserByEmail(userData.email);
        console.log(`✅ User ${userData.email} already exists`);

        // Update password
        await auth.updateUser(user.uid, {
          password: userData.password,
          displayName: userData.displayName,
        });
        console.log(`✅ Updated password for ${userData.email}`);
      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
          // Create new user
          user = await auth.createUser({
            email: userData.email,
            password: userData.password,
            displayName: userData.displayName,
            emailVerified: true,
          });
          console.log(`✅ Created user ${userData.email}`);
        } else {
          throw error;
        }
      }

      console.log(`   UID: ${user.uid}`);
      console.log(`   Email: ${userData.email}`);
      console.log(`   Password: ${userData.password}`);
      console.log('');
    } catch (error) {
      console.error(`❌ Error with ${userData.email}:`, error);
    }
  }
}

createTestUsers()
  .then(() => {
    console.log('✅ Test users setup complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
