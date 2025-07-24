#!/usr/bin/env node
/**
 * Create Test User Script
 * Creates pro@dealmecca.pro user in production database
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('🔧 Creating test user...');
    
    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'pro@dealmecca.pro' }
    });
    
    if (existingUser) {
      console.log('✅ User already exists:', existingUser.email);
      console.log('   ID:', existingUser.id);
      console.log('   Role:', existingUser.role);
      console.log('   Tier:', existingUser.subscriptionTier);
      return existingUser;
    }
    
    // Create new user
    const user = await prisma.user.create({
      data: {
        email: 'pro@dealmecca.pro',
        name: 'Pro User',
        password: hashedPassword,
        role: 'ADMIN',
        subscriptionTier: 'PRO',
        subscriptionStatus: 'ACTIVE'
      }
    });
    
    console.log('✅ Test user created successfully!');
    console.log('   Email: pro@dealmecca.pro');  
    console.log('   Password: password123');
    console.log('   Role: ADMIN');
    console.log('   Tier: PRO');
    
    return user;
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser(); 