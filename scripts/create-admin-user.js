#!/usr/bin/env node
/**
 * Create Admin User Script
 * Creates admin@dealmecca.pro user with ADMIN role
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('🔧 Creating admin user...');
    
    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    // Check if admin user exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@dealmecca.pro' }
    });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.email);
      console.log('   ID:', existingAdmin.id);
      console.log('   Role:', existingAdmin.role);
      
      // Update to ADMIN role if needed
      if (existingAdmin.role !== 'ADMIN') {
        const updatedUser = await prisma.user.update({
          where: { email: 'admin@dealmecca.pro' },
          data: { role: 'ADMIN' }
        });
        console.log('✅ Updated user role to ADMIN');
        return updatedUser;
      }
      
      return existingAdmin;
    }
    
    // Create new admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@dealmecca.pro',
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
        subscriptionTier: 'PRO',
        subscriptionStatus: 'ACTIVE'
      }
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('   Email: admin@dealmecca.pro');  
    console.log('   Password: password123');
    console.log('   Role: ADMIN');
    
    return adminUser;
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function upgradeExistingUser() {
  try {
    console.log('🔧 Upgrading existing pro@dealmecca.pro to ADMIN role...');
    
    const existingPro = await prisma.user.findUnique({
      where: { email: 'pro@dealmecca.pro' }
    });
    
    if (existingPro) {
      const updatedUser = await prisma.user.update({
        where: { email: 'pro@dealmecca.pro' },
        data: { role: 'ADMIN' }
      });
      
      console.log('✅ Upgraded pro@dealmecca.pro to ADMIN role');
      console.log('   Email: pro@dealmecca.pro');  
      console.log('   Password: test123');
      console.log('   Role: ADMIN');
      
      return updatedUser;
    } else {
      console.log('❌ User pro@dealmecca.pro not found');
    }
  } catch (error) {
    console.error('❌ Error upgrading user:', error);
  }
}

async function main() {
  console.log('🚀 Admin User Setup');
  console.log('==================');
  
  // Option 1: Create dedicated admin user
  await createAdminUser();
  
  // Option 2: Upgrade existing pro user
  await upgradeExistingUser();
  
  console.log('\n🎉 Admin setup complete!');
  console.log('\nTry these credentials:');
  console.log('1. admin@dealmecca.pro / password123');
  console.log('2. pro@dealmecca.pro / test123 (now ADMIN role)');
}

main(); 