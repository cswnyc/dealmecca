import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const forumUsers = [
  // WPP Group users
  {
    name: 'Mark Read',
    email: 'mark.read@wpp.com',
    companyName: 'WPP Group',
    role: 'PRO',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    title: 'CEO'
  },
  {
    name: 'John Rogers',
    email: 'john.rogers@wpp.com', 
    companyName: 'WPP Group',
    role: 'PRO',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    title: 'CFO'
  },
  
  // GroupM users
  {
    name: 'Christian Juhl',
    email: 'christian.juhl@groupm.com',
    companyName: 'GroupM',
    role: 'PRO', 
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    title: 'Global CEO'
  },
  {
    name: 'Kieley Taylor',
    email: 'kieley.taylor@groupm.com',
    companyName: 'GroupM',
    role: 'PRO',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    title: 'North America CEO'
  },
  
  // Mindshare users
  {
    name: 'Adam Gerhart',
    email: 'adam.gerhart@mindshare.com',
    companyName: 'Mindshare',
    role: 'PRO',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face',
    title: 'US CEO'
  },
  
  // Omnicom users
  {
    name: 'John Wren',
    email: 'john.wren@omnicom.com',
    companyName: 'Omnicom Group',
    role: 'PRO',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
    title: 'Chairman & CEO'
  },
  
  // Create additional fictional but realistic users
  {
    name: 'Sarah Chen',
    email: 'sarah.chen@publicis.com',
    companyName: 'Publicis Groupe',
    role: 'PRO',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b69c7606?w=150&h=150&fit=crop&crop=face',
    title: 'VP Digital Strategy'
  },
  {
    name: 'Michael Rodriguez',
    email: 'michael.rodriguez@dentsu.com',
    companyName: 'Dentsu',
    role: 'PRO',
    avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face',
    title: 'Head of Programmatic'
  },
  {
    name: 'Emily Thompson',
    email: 'emily.thompson@havas.com',
    companyName: 'Havas',
    role: 'PRO',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
    title: 'Media Director'
  },
  {
    name: 'David Park',
    email: 'david.park@zenith.com',
    companyName: 'Zenith',
    role: 'PRO',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    title: 'Senior Media Planner'
  },
  {
    name: 'Jessica Williams',
    email: 'jessica.williams@mediacom.com',
    companyName: 'Mediacom',
    role: 'PRO',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    title: 'Account Director'
  },
  {
    name: 'Robert Kim',
    email: 'robert.kim@wavemaker.com',
    companyName: 'Wavemaker',
    role: 'PRO',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    title: 'Strategy Director'
  },
  {
    name: 'Amanda Foster',
    email: 'amanda.foster@starcom.com',
    companyName: 'Starcom',
    role: 'PRO',
    avatar: 'https://images.unsplash.com/photo-1509967419530-da38b4773297?w=150&h=150&fit=crop&crop=face',
    title: 'Associate Media Director'
  },
  {
    name: 'Carlos Martinez',
    email: 'carlos.martinez@omg.com',
    companyName: 'OMG',
    role: 'PRO',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    title: 'Senior VP'
  },
  
  // Add some brand-side users
  {
    name: 'Lisa Anderson',
    email: 'lisa.anderson@pg.com',
    companyName: 'Procter & Gamble',
    role: 'PRO',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
    title: 'Head of Media'
  },
  {
    name: 'James Wilson',
    email: 'james.wilson@disney.com',
    companyName: 'Disney',
    role: 'PRO',
    avatar: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=150&h=150&fit=crop&crop=face',
    title: 'SVP Media Investment'
  },
  {
    name: 'Maria Gonzalez',
    email: 'maria.gonzalez@coca-cola.com',
    companyName: 'Coca-Cola',
    role: 'PRO',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
    title: 'Global Media Director'
  },
  {
    name: 'Ryan O\'Connor',
    email: 'ryan.oconnor@nike.com',
    companyName: 'Nike',
    role: 'PRO',
    avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face',
    title: 'Media Manager'
  },
  {
    name: 'Rachel Davis',
    email: 'rachel.davis@unilever.com',
    companyName: 'Unilever',
    role: 'PRO',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    title: 'Digital Marketing Manager'
  }
];

async function createForumUsers() {
  try {
    console.log('🚀 Creating forum users with company associations...');
    
    const hashedPassword = await bcrypt.hash('test123', 12);
    
    for (const userData of forumUsers) {
      try {
        // Find the company
        const company = await prisma.company.findFirst({
          where: {
            name: {
              contains: userData.companyName.split(' ')[0] // Match first word of company name
            }
          }
        });
        
        if (!company) {
          console.log(`⚠️  Company not found: ${userData.companyName}, creating user without company`);
        }
        
        // Create or update user
        const user = await prisma.user.upsert({
          where: { email: userData.email },
          update: {
            name: userData.name,
            role: userData.role as any,
            subscriptionTier: 'PRO',
            subscriptionStatus: 'ACTIVE',
            companyId: company?.id || null,
          },
          create: {
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            role: userData.role as any,
            subscriptionTier: 'PRO',
            subscriptionStatus: 'ACTIVE',
            companyId: company?.id || null,
          }
        });
        
        console.log(`✅ Created user: ${userData.name} (${userData.companyName})`);
        
      } catch (error) {
        console.error(`❌ Failed to create user ${userData.name}:`, error);
      }
    }
    
    console.log('🎉 Finished creating forum users!');
    
  } catch (error) {
    console.error('❌ Error creating forum users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createForumUsers();