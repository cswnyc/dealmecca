import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting ADT team data import...');

  // 1. Find or create ADT
  let adt = await prisma.company.findFirst({
    where: { name: { contains: 'ADT', mode: 'insensitive' } }
  });

  if (!adt) {
    console.log('ADT not found, creating...');
    adt = await prisma.company.create({
      data: {
        id: `adt-${Date.now()}`,
        name: 'ADT',
        slug: 'adt',
        companyType: 'ADVERTISER',
        verified: true,
        updatedAt: new Date()
      }
    });
  }
  console.log(`✓ ADT found/created: ${adt.id}`);

  // 2. Find or create Horizon Media NY
  let horizonMedia = await prisma.company.findFirst({
    where: {
      OR: [
        { name: 'Horizon Media NY' },
        { name: { contains: 'Horizon Media', mode: 'insensitive' }, city: 'New York' }
      ]
    }
  });

  if (!horizonMedia) {
    console.log('Horizon Media NY not found, creating...');
    horizonMedia = await prisma.company.create({
      data: {
        id: `horizon-media-ny-${Date.now()}`,
        name: 'Horizon Media NY',
        slug: 'horizon-media-ny',
        companyType: 'AGENCY',
        agencyType: 'MEDIA_BUYING',
        city: 'New York',
        state: 'NY',
        verified: true,
        updatedAt: new Date()
      }
    });
  }
  console.log(`✓ Horizon Media NY found/created: ${horizonMedia.id}`);

  // 3. Find or create Horizon Next NY
  let horizonNext = await prisma.company.findFirst({
    where: {
      OR: [
        { name: 'Horizon Next NY' },
        { name: { contains: 'Horizon Next', mode: 'insensitive' } }
      ]
    }
  });

  if (!horizonNext) {
    console.log('Horizon Next NY not found, creating...');
    horizonNext = await prisma.company.create({
      data: {
        id: `horizon-next-ny-${Date.now()}`,
        name: 'Horizon Next NY',
        slug: 'horizon-next-ny',
        companyType: 'AGENCY',
        agencyType: 'CREATIVE_SPECIALIST',
        city: 'New York',
        state: 'NY',
        verified: true,
        updatedAt: new Date()
      }
    });
  }
  console.log(`✓ Horizon Next NY found/created: ${horizonNext.id}`);

  // 4. Create or find partnerships
  let horizonMediaPartnership = await prisma.companyPartnership.findFirst({
    where: {
      agencyId: horizonMedia.id,
      advertiserId: adt.id
    }
  });

  if (!horizonMediaPartnership) {
    console.log('Creating Horizon Media <> ADT partnership...');
    horizonMediaPartnership = await prisma.companyPartnership.create({
      data: {
        id: `partnership-horizon-adt-${Date.now()}`,
        agencyId: horizonMedia.id,
        advertiserId: adt.id,
        relationshipType: 'AGENCY_CLIENT',
        isAOR: false,
        services: 'Programmatic, Digital Investment, Media Buying',
        isActive: true,
        startDate: new Date('2020-01-01')
      }
    });
  }
  console.log(`✓ Horizon Media partnership: ${horizonMediaPartnership.id}`);

  let horizonNextPartnership = await prisma.companyPartnership.findFirst({
    where: {
      agencyId: horizonNext.id,
      advertiserId: adt.id
    }
  });

  if (!horizonNextPartnership) {
    console.log('Creating Horizon Next <> ADT partnership...');
    horizonNextPartnership = await prisma.companyPartnership.create({
      data: {
        id: `partnership-horizon-next-adt-${Date.now()}`,
        agencyId: horizonNext.id,
        advertiserId: adt.id,
        relationshipType: 'AGENCY_CLIENT',
        isAOR: false,
        services: 'Video Production, Creative',
        isActive: true,
        startDate: new Date('2020-01-01')
      }
    });
  }
  console.log(`✓ Horizon Next partnership: ${horizonNextPartnership.id}`);

  // 5. Create ADT in-house contacts
  const adtInHouseContacts = [
    {
      firstName: 'Nick',
      lastName: 'Holmes',
      title: 'Sr. Director Performance Marketing',
      email: 'nholmes@adt.com',
      department: 'DIGITAL_MARKETING',
      seniority: 'SENIOR_DIRECTOR',
      primaryRole: 'STRATEGIST'
    },
    {
      firstName: 'Casey',
      lastName: 'Blair',
      title: 'Advertising & Organic Manager',
      email: 'cblair@adt.com',
      department: 'MARKETING',
      seniority: 'MANAGER',
      primaryRole: 'MEDIA_BUYER'
    },
    {
      firstName: 'Michael',
      lastName: 'Reeder',
      title: 'Sr. Managing & Executive Creative Director',
      email: 'mreeder@adt.com',
      department: 'CREATIVE_SERVICES',
      seniority: 'SENIOR_DIRECTOR',
      primaryRole: 'CREATIVE'
    },
    {
      firstName: 'DeLu',
      lastName: 'Jackson',
      title: 'Executive VP and Chief Marketing Officer',
      email: 'djackson@adt.com',
      department: 'LEADERSHIP',
      seniority: 'EVP',
      primaryRole: 'DECISION_MAKER'
    },
    {
      firstName: 'Mayra',
      lastName: 'Robson',
      title: 'Director of Customer Experience Marketing',
      email: 'mrobson@adt.com',
      department: 'MARKETING',
      seniority: 'DIRECTOR',
      primaryRole: 'STRATEGIST'
    },
    {
      firstName: 'Nikki',
      lastName: 'Devasingh',
      title: 'Sr. Manager, Digital Marketing Analytics',
      email: 'ndevasingh@adt.com',
      department: 'ANALYTICS_INSIGHTS',
      seniority: 'SENIOR_MANAGER',
      primaryRole: 'ANALYST'
    },
    {
      firstName: 'Jonathan',
      lastName: 'Looney',
      title: 'Director - Health Operations',
      email: 'jlooney@adt.com',
      department: 'OPERATIONS',
      seniority: 'DIRECTOR',
      primaryRole: 'PROJECT_MANAGER'
    }
  ];

  console.log('\nCreating ADT in-house contacts...');
  for (const contactData of adtInHouseContacts) {
    let contact = await prisma.contact.findFirst({
      where: {
        firstName: contactData.firstName,
        lastName: contactData.lastName,
        companyId: adt.id
      }
    });

    if (!contact) {
      contact = await prisma.contact.create({
        data: {
          id: `contact-${contactData.firstName.toLowerCase()}-${contactData.lastName.toLowerCase()}-${Date.now()}`,
          ...contactData,
          fullName: `${contactData.firstName} ${contactData.lastName}`,
          companyId: adt.id,
          verified: true,
          isActive: true,
          updatedAt: new Date()
        }
      });
      console.log(`  ✓ Created: ${contact.fullName}`);
    } else {
      console.log(`  - Already exists: ${contact.fullName}`);
    }
  }

  // 6. Create Horizon Media contacts
  const horizonMediaContacts = [
    {
      firstName: 'Madlneh',
      lastName: 'Patterson',
      title: 'Associate Director, Programmatic Investment',
      email: 'mpatterson@horizonmedia.com',
      department: 'PROGRAMMATIC',
      seniority: 'DIRECTOR',
      primaryRole: 'MEDIA_BUYER',
      responsibilities: 'Programmatic Investment, ADT account lead'
    },
    {
      firstName: 'Eric',
      lastName: 'Mui',
      title: 'Associate Director, Integrated Investment',
      email: 'emui@horizonmedia.com',
      department: 'MEDIA_BUYING',
      seniority: 'DIRECTOR',
      primaryRole: 'MEDIA_BUYER',
      responsibilities: 'Digital investment strategy'
    },
    {
      firstName: 'F. Scott',
      lastName: 'Barron',
      title: 'Associate Director, Programmatic Investment',
      email: 'sbarron@horizonmedia.com',
      department: 'PROGRAMMATIC',
      seniority: 'DIRECTOR',
      primaryRole: 'MEDIA_BUYER',
      responsibilities: 'Programmatic campaign management'
    },
    {
      firstName: 'Jaime',
      lastName: 'McCamy',
      title: 'Supervisor Programmatic',
      email: 'jmccamy@horizonmedia.com',
      department: 'PROGRAMMATIC',
      seniority: 'MANAGER',
      primaryRole: 'MEDIA_BUYER',
      responsibilities: 'Programmatic execution and optimization'
    },
    {
      firstName: 'Nicole',
      lastName: 'Cohen',
      title: 'Director, Programmatic Investment',
      email: 'ncohen@horizonmedia.com',
      department: 'PROGRAMMATIC',
      seniority: 'DIRECTOR',
      primaryRole: 'MEDIA_BUYER',
      responsibilities: 'Multi-account programmatic oversight',
      isPrimary: true
    },
    {
      firstName: 'Greyse',
      lastName: 'McFadden',
      title: 'Programmatic Investment Associate',
      email: 'gmcfadden@horizonmedia.com',
      department: 'PROGRAMMATIC',
      seniority: 'SPECIALIST',
      primaryRole: 'MEDIA_BUYER',
      responsibilities: 'Programmatic campaign support'
    },
    {
      firstName: 'Anne',
      lastName: 'Skarys',
      title: 'Digital Strategy & Buying',
      email: 'askarys@horizonmedia.com',
      department: 'DIGITAL_MARKETING',
      seniority: 'MANAGER',
      primaryRole: 'STRATEGIST',
      responsibilities: 'Digital strategy and media buying'
    },
    {
      firstName: 'Selina',
      lastName: 'Bhagwandin Kartra',
      title: 'Director, Audio',
      email: 'sbhagwandin@horizonmedia.com',
      department: 'MEDIA_BUYING',
      seniority: 'DIRECTOR',
      primaryRole: 'MEDIA_BUYER',
      responsibilities: 'Podcast and streaming audio'
    }
  ];

  console.log('\nCreating Horizon Media contacts and linking to partnership...');
  for (const contactData of horizonMediaContacts) {
    const { responsibilities, isPrimary, ...contactFields } = contactData;

    let contact = await prisma.contact.findFirst({
      where: {
        firstName: contactData.firstName,
        lastName: contactData.lastName,
        companyId: horizonMedia.id
      }
    });

    if (!contact) {
      contact = await prisma.contact.create({
        data: {
          id: `contact-${contactData.firstName.toLowerCase().replace(/[^a-z]/g, '')}-${contactData.lastName.toLowerCase().replace(/[^a-z]/g, '')}-${Date.now()}`,
          ...contactFields,
          fullName: `${contactData.firstName} ${contactData.lastName}`,
          companyId: horizonMedia.id,
          verified: true,
          isActive: true,
          updatedAt: new Date()
        }
      });
      console.log(`  ✓ Created: ${contact.fullName}`);
    } else {
      console.log(`  - Already exists: ${contact.fullName}`);
    }

    // Link to partnership via PartnershipContact
    const existingLink = await prisma.partnershipContact.findUnique({
      where: {
        partnershipId_contactId: {
          partnershipId: horizonMediaPartnership.id,
          contactId: contact.id
        }
      }
    });

    if (!existingLink) {
      await prisma.partnershipContact.create({
        data: {
          partnershipId: horizonMediaPartnership.id,
          contactId: contact.id,
          role: contactData.title,
          responsibilities: responsibilities || null,
          isPrimary: isPrimary || false
        }
      });
      console.log(`    → Linked to ADT partnership`);
    }
  }

  // 7. Create Horizon Next contact
  const horizonNextContact = {
    firstName: 'Amanda',
    lastName: 'Bergmann',
    title: 'Assistant Video Director',
    email: 'abergmann@horizonnext.com',
    department: 'CREATIVE_SERVICES',
    seniority: 'MANAGER',
    primaryRole: 'CREATIVE',
    responsibilities: 'Video production and creative direction'
  };

  console.log('\nCreating Horizon Next contact and linking to partnership...');
  const { responsibilities: nextResp, ...nextContactFields } = horizonNextContact;

  let nextContact = await prisma.contact.findFirst({
    where: {
      firstName: horizonNextContact.firstName,
      lastName: horizonNextContact.lastName,
      companyId: horizonNext.id
    }
  });

  if (!nextContact) {
    nextContact = await prisma.contact.create({
      data: {
        id: `contact-amanda-bergmann-${Date.now()}`,
        ...nextContactFields,
        fullName: `${horizonNextContact.firstName} ${horizonNextContact.lastName}`,
        companyId: horizonNext.id,
        verified: true,
        isActive: true,
        updatedAt: new Date()
      }
    });
    console.log(`  ✓ Created: ${nextContact.fullName}`);
  } else {
    console.log(`  - Already exists: ${nextContact.fullName}`);
  }

  // Link to partnership
  const existingNextLink = await prisma.partnershipContact.findUnique({
    where: {
      partnershipId_contactId: {
        partnershipId: horizonNextPartnership.id,
        contactId: nextContact.id
      }
    }
  });

  if (!existingNextLink) {
    await prisma.partnershipContact.create({
      data: {
        partnershipId: horizonNextPartnership.id,
        contactId: nextContact.id,
        role: horizonNextContact.title,
        responsibilities: nextResp,
        isPrimary: true
      }
    });
    console.log(`    → Linked to ADT partnership`);
  }

  console.log('\n✅ ADT team data import complete!');
  console.log(`\nSummary:`);
  console.log(`- ADT: ${adt.id}`);
  console.log(`- In-house contacts: 7`);
  console.log(`- Horizon Media NY: ${horizonMedia.id} (8 contacts linked)`);
  console.log(`- Horizon Next NY: ${horizonNext.id} (1 contact linked)`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
