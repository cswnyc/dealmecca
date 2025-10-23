#!/usr/bin/env tsx
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCompany() {
  const companyId = 'i7yxcmmbb6q5uk2e0xjc2iyq';

  console.log(`\n🔍 Checking company: ${companyId}\n`);
  console.log('='.repeat(80));

  try {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        parentCompany: {
          select: {
            id: true,
            name: true,
            companyType: true
          }
        },
        _count: {
          select: {
            contacts: true,
            subsidiaries: true,
            CompanyPartnership_agencyIdToCompany: true,
            CompanyPartnership_advertiserIdToCompany: true
          }
        }
      }
    });

    if (!company) {
      console.log('❌ Company not found!');
      return;
    }

    console.log('\n📊 Company Data:');
    console.log(JSON.stringify(company, null, 2));

    // Check if parent company exists if parentCompanyId is set
    if (company.parentCompanyId) {
      const parentExists = await prisma.company.findUnique({
        where: { id: company.parentCompanyId }
      });
      console.log('\n🔗 Parent Company Check:');
      console.log(`  Parent ID: ${company.parentCompanyId}`);
      console.log(`  Parent Exists: ${parentExists ? '✅ Yes' : '❌ No'}`);
      if (parentExists) {
        console.log(`  Parent Name: ${parentExists.name}`);
      }
    }

    console.log('\n='.repeat(80));

  } catch (error: any) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCompany().catch(console.error);
