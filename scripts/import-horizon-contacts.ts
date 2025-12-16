import { PrismaClient } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';

const prisma = new PrismaClient();

// Raw pasted data from SellerCrowd
const rawData = `
Natalyah Morgam
Supervisor, Business Solutions @ Horizon Media NY

Spectrum Brands
nmorgan@horizon-next.com
nmorgan@horizonmedia.com
Last activity: 51 mins

1


Kristen Milea
VP, Integrated Investment @ Horizon Media NY

Capital One
KMilea@horizonmedia.com
Last activity: 9 hrs

1


Kate Monaghan
EVP, Integrated Investment & Retail Partnerships @ Horizon Media NY
KMonaghan@horizonmedia.com
Last activity: 2 days

1


Angela Lanza
VP, Digital @ Horizon Media NY
ALanza@horizonmedia.com
Last activity: 2 days

3


Amanda Skondras
Manager of Programmatic Partnerships @ Horizon Media NY
askondras@horizonmedia.com
Last activity: 2 days

4


Evanne Abneri
Director of Programmatic Partnerships and Product Development @ Horizon Media NY
eabneri@horizonmedia.com
Last activity: 2 days

5


Gabrielle Taragano
VP OOH @ Horizon Media NY

Bob's Discount Furniture

Fanduel

Redfin
Handles:
OOH
Planning
DOOH
Strategy
Buying
+1 duty
gtaragano@horizonmedia.com
Last activity: 3 days

3


John Cappabianca
Supervisor @ Horizon Media NY

Bob's Discount Furniture

Fanduel
Handles:
Buying
Casinos
DOOH
OOH
Planning
jcappabianca@horizonmedia.com
Last activity: 3 days

3


Christopher Rynn
Supervisor, Programmatic @ Horizon Media NY

Sleep Number Corporation

The Goddard School

Atlantis Bahamas
+7 teams
Handles:
Programmatic
crynn@horizonmedia.com
Last activity: 10 days

5


Madinah Patterson
Associate Director, Programmatic Investment @ Horizon Media NY

Rover.com

eHarmony

Leaf Home Solutions
+6 teams
Handles:
Buying
Planning
Programmatic
Spectrum
mapatterson@horizonmedia.com
Last activity: 13 days

3


Truman Imbo
Assistant Strategist OOH @ Horizon Media NY

SquareSpace

Bob's Discount Furniture

Redfin
+1 team
Handles:
Buying
Casinos
DOOH
OOH
Planning
timbo@horizonmedia.com
Last activity: 14 days

1


Jillian Mizner
VP, Director, Business Solutions - AMCN @ Horizon Media NY

AMC Networks
Handles:
Digital
jmizner@horizonmedia.com
Last activity: 15 days
`;

interface ParsedContact {
  fullName: string;
  firstName: string;
  lastName: string;
  title: string;
  companyName: string;
  emails: string[];
  clients: string[];
  duties: string[];
}

function parseContacts(data: string): ParsedContact[] {
  const contacts: ParsedContact[] = [];

  // Split by double newlines to separate contact blocks
  const blocks = data.trim().split(/\n\n+/);

  let currentContact: Partial<ParsedContact> | null = null;
  let inHandles = false;

  for (const block of blocks) {
    const lines = block.trim().split('\n').map(l => l.trim()).filter(l => l);

    for (const line of lines) {
      // Skip activity lines and numbers
      if (line.startsWith('Last activity:') || /^\d+$/.test(line)) {
        continue;
      }

      // Check for name and title line (contains @)
      if (line.includes('@') && !line.includes('@horizonmedia') && !line.includes('@horizon-next')) {
        // This is a "Title @ Company" line
        const match = line.match(/^(.+?)\s*@\s*(.+)$/);
        if (match) {
          // Save previous contact if exists
          if (currentContact && currentContact.fullName) {
            contacts.push(currentContact as ParsedContact);
          }

          // Start new contact - but we need the name from previous line
          // Actually the name comes before this line in the block
          const nameIndex = lines.indexOf(line) - 1;
          const nameLine = nameIndex >= 0 ? lines[nameIndex] : '';

          const nameParts = nameLine.split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';

          currentContact = {
            fullName: nameLine,
            firstName,
            lastName,
            title: match[1].trim(),
            companyName: match[2].trim(),
            emails: [],
            clients: [],
            duties: []
          };
          inHandles = false;
        }
      }
      // Email line
      else if (line.includes('@horizonmedia.com') || line.includes('@horizon-next.com')) {
        if (currentContact) {
          currentContact.emails = currentContact.emails || [];
          currentContact.emails.push(line.toLowerCase());
        }
        inHandles = false;
      }
      // Handles section
      else if (line === 'Handles:') {
        inHandles = true;
      }
      // Duty (if in handles section)
      else if (inHandles && currentContact && !line.startsWith('+') && !line.startsWith('Last')) {
        currentContact.duties = currentContact.duties || [];
        currentContact.duties.push(line);
      }
      // Client company (not a name line, not in handles)
      else if (currentContact && !inHandles && !line.startsWith('+') && !line.match(/^[A-Z][a-z]+ [A-Z][a-z]+$/)) {
        // Check if this looks like a company name (not a person name)
        if (line.includes(' ') || line.includes("'") || line.length > 15) {
          currentContact.clients = currentContact.clients || [];
          if (!currentContact.clients.includes(line)) {
            currentContact.clients.push(line);
          }
        }
      }
    }
  }

  // Save last contact
  if (currentContact && currentContact.fullName) {
    contacts.push(currentContact as ParsedContact);
  }

  return contacts;
}

// Better parser - line by line approach
function parseContactsV2(data: string): ParsedContact[] {
  const contacts: ParsedContact[] = [];
  const lines = data.trim().split('\n').map(l => l.trim());

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Look for pattern: Name on one line, "Title @ Company" on next
    if (i + 1 < lines.length && lines[i + 1].includes(' @ ')) {
      const nameLine = line;
      const titleLine = lines[i + 1];

      // Skip if this looks like an email or activity
      if (nameLine.includes('@') || nameLine.startsWith('Last') || /^\d+$/.test(nameLine)) {
        i++;
        continue;
      }

      const match = titleLine.match(/^(.+?)\s*@\s*(.+)$/);
      if (match) {
        const nameParts = nameLine.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        const contact: ParsedContact = {
          fullName: nameLine,
          firstName,
          lastName,
          title: match[1].trim(),
          companyName: match[2].trim(),
          emails: [],
          clients: [],
          duties: []
        };

        // Now scan forward for emails, clients, duties
        i += 2;
        let inHandles = false;

        while (i < lines.length) {
          const nextLine = lines[i];

          // Stop if we hit another name/title pattern
          if (i + 1 < lines.length && lines[i + 1].includes(' @ ') &&
              !nextLine.includes('@') && !nextLine.startsWith('Last') && !/^\d+$/.test(nextLine)) {
            break;
          }

          // Email
          if (nextLine.includes('@horizonmedia.com') || nextLine.includes('@horizon-next.com')) {
            contact.emails.push(nextLine.toLowerCase());
            inHandles = false;
          }
          // Handles section start
          else if (nextLine === 'Handles:') {
            inHandles = true;
          }
          // Skip these
          else if (nextLine.startsWith('Last activity:') || /^\d+$/.test(nextLine) ||
                   nextLine.startsWith('+') || nextLine === '') {
            if (nextLine.startsWith('+')) inHandles = false;
          }
          // Duty
          else if (inHandles) {
            contact.duties.push(nextLine);
          }
          // Client (company name)
          else if (!inHandles && nextLine.length > 0) {
            contact.clients.push(nextLine);
          }

          i++;
        }

        contacts.push(contact);
        continue;
      }
    }

    i++;
  }

  return contacts;
}

// Infer seniority from title
function inferSeniority(title: string): string {
  const titleLower = title.toLowerCase();

  if (titleLower.includes('evp') || titleLower.includes('executive vice president') ||
      titleLower.includes('chief') || titleLower.includes('ceo') || titleLower.includes('cmo') ||
      titleLower.includes('cfo') || titleLower.includes('coo') || titleLower.includes('president')) {
    return 'C_LEVEL';
  }

  if (titleLower.includes('svp') || titleLower.includes('senior vice president')) {
    return 'SVP';
  }

  if (titleLower.includes('vp') || titleLower.includes('vice president')) {
    return 'VP';
  }

  if (titleLower.includes('director')) {
    return 'DIRECTOR';
  }

  if (titleLower.includes('manager') || titleLower.includes('supervisor') ||
      titleLower.includes('lead') || titleLower.includes('senior')) {
    return 'MANAGER';
  }

  if (titleLower.includes('associate director')) {
    return 'DIRECTOR';
  }

  if (titleLower.includes('coordinator')) {
    return 'COORDINATOR';
  }

  if (titleLower.includes('specialist') || titleLower.includes('senior specialist')) {
    return 'SPECIALIST';
  }

  if (titleLower.includes('associate') || titleLower.includes('assistant') ||
      titleLower.includes('analyst') || titleLower.includes('strategist')) {
    return 'COORDINATOR';
  }

  return 'MANAGER'; // Default
}

async function main() {
  console.log('Parsing contact data...\n');

  const contacts = parseContactsV2(rawData);

  console.log(`Found ${contacts.length} contacts to import:\n`);

  // Preview contacts
  for (const contact of contacts) {
    console.log(`- ${contact.fullName}`);
    console.log(`  Title: ${contact.title}`);
    console.log(`  Company: ${contact.companyName}`);
    console.log(`  Emails: ${contact.emails.join(', ')}`);
    console.log(`  Clients: ${contact.clients.join(', ') || 'None'}`);
    console.log(`  Duties: ${contact.duties.join(', ') || 'None'}`);
    console.log('');
  }

  // Find Horizon Media NY
  const horizonNY = await prisma.company.findFirst({
    where: { name: 'Horizon Media NY' }
  });

  if (!horizonNY) {
    console.error('Horizon Media NY not found!');
    return;
  }

  console.log(`\nImporting to: ${horizonNY.name} (${horizonNY.id})\n`);

  // Get all duties for mapping
  const duties = await prisma.duty.findMany();
  const dutyMap = new Map(duties.map(d => [d.name.toLowerCase(), d.id]));

  // Get all companies for client matching
  const companies = await prisma.company.findMany({
    select: { id: true, name: true }
  });

  let created = 0;
  let skipped = 0;

  for (const contact of contacts) {
    // Check if contact already exists by email
    const existingByEmail = contact.emails.length > 0
      ? await prisma.contact.findFirst({
          where: { email: { in: contact.emails } }
        })
      : null;

    if (existingByEmail) {
      console.log(`SKIP: ${contact.fullName} (email already exists)`);
      skipped++;
      continue;
    }

    // Check by name
    const existingByName = await prisma.contact.findFirst({
      where: {
        fullName: contact.fullName,
        companyId: horizonNY.id
      }
    });

    if (existingByName) {
      console.log(`SKIP: ${contact.fullName} (name already exists)`);
      skipped++;
      continue;
    }

    try {
      // Create contact
      const seniority = inferSeniority(contact.title);
      const newContact = await prisma.contact.create({
        data: {
          id: createId(),
          firstName: contact.firstName,
          lastName: contact.lastName,
          fullName: contact.fullName,
          title: contact.title,
          email: contact.emails[0] || null,
          companyId: horizonNY.id,
          verified: true,
          seniority: seniority as any,
          updatedAt: new Date(),
        }
      });

      console.log(`CREATED: ${newContact.fullName} (${newContact.id})`);

      // Create ContactDuty records
      for (const dutyName of contact.duties) {
        const dutyId = dutyMap.get(dutyName.toLowerCase());
        if (dutyId) {
          try {
            await prisma.contactDuty.create({
              data: {
                contactId: newContact.id,
                dutyId: dutyId
              }
            });
            console.log(`  + Duty: ${dutyName}`);
          } catch (e) {
            // Duty might not exist
          }
        }
      }

      created++;
    } catch (error: any) {
      console.error(`ERROR: ${contact.fullName} - ${error.message}`);
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Created: ${created}`);
  console.log(`Skipped: ${skipped}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
