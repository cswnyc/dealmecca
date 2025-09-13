#!/usr/bin/env npx tsx
/**
 * Update existing users to have alphanumeric usernames instead of real names
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const USERNAME_MAPPINGS = [
  { oldName: "Sarah Johnson", newName: "techfounder2024" },
  { oldName: "Michael Chen", newName: "ecomexpert" },
  { oldName: "Jessica Martinez", newName: "consultingpro" },
  { oldName: "David Kim", newName: "fintechdave" },
  { oldName: "Emma Thompson", newName: "healthinnovator" },
  { oldName: "Robert Williams", newName: "siliconinvestor" },
  { oldName: "Lisa Anderson", newName: "angellisa" },
  { oldName: "James Rodriguez", newName: "pejames" },
  { oldName: "Amanda Davis", newName: "salesace" },
  { oldName: "Chris Wilson", newName: "marketingguru" },
  { oldName: "Rachel Green", newName: "socialmediarace" },
  { oldName: "Mark Johnson", newName: "propertydealer" },
  { oldName: "Jennifer Liu", newName: "commercialjen" },
  { oldName: "Steve Miller", newName: "webdesignsteve" },
  { oldName: "Maria Garcia", newName: "legaleagle" },
  { oldName: "Tom Brown", newName: "numberscruncher" },
  { oldName: "Kelly White", newName: "hrkelly" },
  { oldName: "Alex Taylor", newName: "designalex" },
  { oldName: "Nicole Davis", newName: "contentqueen" },
  { oldName: "Ryan Martinez", newName: "codeconsultant" },
  { oldName: "Dr. Patricia Wilson", newName: "biotechdoc" },
  { oldName: "Carlos Rodriguez", newName: "manufacturingcarlos" },
  { oldName: "Ashley Kim", newName: "retailash" },
  { oldName: "Brian Thompson", newName: "logisticsbrian" },
  { oldName: "Diana Foster", newName: "financeguru" },
  { oldName: "Kevin Park", newName: "insuranceexpert" },
  { oldName: "Samantha Lee", newName: "energypro" },
  { oldName: "Andrew Johnson", newName: "foodbusiness" },
  { oldName: "Monica Rodriguez", newName: "fashionmonica" },
  { oldName: "Tyler Smith", newName: "automotivetyler" },
  { oldName: "Lauren Davis", newName: "traveldeals" },
  { oldName: "Nathan Wilson", newName: "sportsbusiness" },
  { oldName: "Olivia Martinez", newName: "eventplanner" },
  { oldName: "Brandon Kim", newName: "mediabrandon" },
  { oldName: "Victoria Brown", newName: "nonprofitvic" },
  { oldName: "Jordan Taylor", newName: "govcontractor" },
  { oldName: "Stephanie White", newName: "edutech" },
  { oldName: "Marcus Johnson", newName: "constructionmarcus" },
  { oldName: "Isabella Garcia", newName: "agribusiness" },
  { oldName: "Cameron Davis", newName: "telecameron" },
  { oldName: "Alexis Thompson", newName: "chemicalexpert" },
  { oldName: "Trevor Martinez", newName: "miningtrevor" },
  { oldName: "Brittany Lee", newName: "utilitiesexpert" },
  { oldName: "Zachary Wilson", newName: "wastemanagement" },
  { oldName: "Hannah Rodriguez", newName: "recyclehannah" },
  { oldName: "Austin Kim", newName: "renewableaustin" },
  { oldName: "Megan Brown", newName: "watertreatment" },
  { oldName: "Caleb Taylor", newName: "transportcaleb" },
  { oldName: "Sydney White", newName: "aviationsydney" },
  { oldName: "Ian Johnson", newName: "maritimeian" },
  { oldName: "Chloe Garcia", newName: "railwayexpert" },
  { oldName: "Ethan Davis", newName: "pipeethan" },
  { oldName: "Grace Thompson", newName: "powerplant" }
];

async function updateUsernames() {
  try {
    console.log('🔄 Starting username updates...');
    
    let updatedCount = 0;
    
    for (const mapping of USERNAME_MAPPINGS) {
      try {
        const existingUser = await prisma.user.findFirst({
          where: { name: mapping.oldName }
        });
        
        if (existingUser) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { name: mapping.newName }
          });
          
          console.log(`✅ Updated: "${mapping.oldName}" → "${mapping.newName}"`);
          updatedCount++;
        } else {
          console.log(`⚠️  User not found: "${mapping.oldName}"`);
        }
      } catch (error) {
        console.error(`❌ Error updating ${mapping.oldName}:`, error);
      }
    }
    
    console.log(`\n🎉 Username Update Complete!`);
    console.log(`📊 Updated ${updatedCount} users`);
    
    // Verify the changes
    const allUsers = await prisma.user.findMany({
      select: { name: true, email: true },
      orderBy: { name: 'asc' }
    });
    
    console.log('\n👥 Current users:');
    allUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.email})`);
    });
    
  } catch (error) {
    console.error('❌ Error updating usernames:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  updateUsernames()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { updateUsernames };