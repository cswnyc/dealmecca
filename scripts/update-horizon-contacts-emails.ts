import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Generate email: first initial + last surname part @ horizonmedia.com
// Examples:
// - Caroline Wilkinson → cwilkinson@horizonmedia.com
// - Maura Vananzo Abdulkarim → mabdulkarim@horizonmedia.com
// - Jocelyn C. Rodenstein → jrodenstein@horizonmedia.com
const generateEmail = (firstName: string, lastName: string): string => {
  const firstInitial = firstName[0].toLowerCase();
  // For compound last names like "Vananzo Abdulkarim", use the LAST part
  const lastNameParts = lastName.split(' ');
  const finalLastName = lastNameParts[lastNameParts.length - 1].toLowerCase().replace(/[^a-z]/g, '');
  return `${firstInitial}${finalLastName}@horizonmedia.com`;
};

async function main() {
  // Find Horizon Media NY
  const horizonNY = await prisma.company.findFirst({
    where: { name: 'Horizon Media NY' }
  });

  if (!horizonNY) {
    console.log('Horizon Media NY not found');
    return;
  }

  console.log('Found Horizon Media NY: ' + horizonNY.id);

  // Get all contacts at Horizon Media NY without an email
  const contacts = await prisma.contact.findMany({
    where: {
      companyId: horizonNY.id,
      OR: [
        { email: null },
        { email: '' }
      ]
    }
  });

  console.log('Contacts without email: ' + contacts.length);

  let updated = 0;
  for (const contact of contacts) {
    if (!contact.firstName || !contact.lastName) {
      console.log('  Skipping (missing name): ' + contact.fullName);
      continue;
    }

    const email = generateEmail(contact.firstName, contact.lastName);

    // Check if email already exists
    const existing = await prisma.contact.findFirst({
      where: { email }
    });

    if (existing) {
      console.log('  Email already exists: ' + email);
      continue;
    }

    await prisma.contact.update({
      where: { id: contact.id },
      data: { email }
    });

    console.log('  ' + contact.fullName + ' → ' + email);
    updated++;
  }

  console.log('\nUpdated ' + updated + ' contacts with emails');

  // Show all contacts now
  const allContacts = await prisma.contact.findMany({
    where: { companyId: horizonNY.id },
    select: {
      fullName: true,
      email: true
    },
    orderBy: { fullName: 'asc' }
  });

  console.log('\n=== All Horizon Media NY Contacts ===');
  for (const c of allContacts) {
    console.log(c.fullName + ': ' + (c.email || '(no email)'));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
