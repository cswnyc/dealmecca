import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkContactDuties() {
  const contactId = 'qn6ukugyvw1iek5y5b22ttzm';

  // Fetch contact with duties
  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
    include: {
      ContactDuty: {
        include: {
          duty: true
        }
      }
    }
  });

  console.log('\n=== Contact Info ===');
  console.log('ID:', contact?.id);
  console.log('Name:', contact?.fullName);
  console.log('Email:', contact?.email);

  console.log('\n=== ContactDuty Records ===');
  console.log('Count:', contact?.ContactDuty?.length || 0);

  if (contact?.ContactDuty && contact.ContactDuty.length > 0) {
    console.log('\nDuties:');
    contact.ContactDuty.forEach(cd => {
      console.log(`  - ${cd.duty.name} (${cd.duty.category})`);
    });
  } else {
    console.log('No duties found for this contact');
  }

  await prisma.$disconnect();
}

checkContactDuties().catch(console.error);
