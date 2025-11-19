#!/usr/bin/env npx tsx
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function auditAgencies() {
  console.log('🔍 COMPREHENSIVE AGENCY DATA AUDIT\n');
  console.log('=' .repeat(60));

  // Get all agencies with partnership counts
  const agencies = await prisma.company.findMany({
    where: {
      companyType: 'AGENCY',
    },
    include: {
      CompanyPartnership_agencyIdToCompany: {
        include: {
          advertiser: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  console.log(`\n📊 Total Agencies in Database: ${agencies.length}\n`);

  // Track issues
  const issues = {
    noLocation: [] as string[],
    noPartnerships: [] as string[],
    duplicateNames: new Map<string, number>(),
  };

  // Check for agencies with no location
  console.log('🚨 AGENCIES WITH MISSING LOCATION DATA:');
  console.log('-'.repeat(60));
  agencies.forEach(agency => {
    if (!agency.city || !agency.state) {
      const info = `${agency.name} (${agency.CompanyPartnership_agencyIdToCompany.length} partnerships)`;
      console.log(`   ❌ ${info}`);
      issues.noLocation.push(info);
    }
  });

  if (issues.noLocation.length === 0) {
    console.log('   ✅ All agencies have location data');
  }

  // Check for agencies with 0 partnerships
  console.log('\n\n🚨 AGENCIES WITH ZERO PARTNERSHIPS:');
  console.log('-'.repeat(60));
  agencies.forEach(agency => {
    if (agency.CompanyPartnership_agencyIdToCompany.length === 0) {
      const info = `${agency.name} (${agency.city}, ${agency.state})`;
      console.log(`   ⚠️  ${info}`);
      issues.noPartnerships.push(info);
    }
  });

  if (issues.noPartnerships.length === 0) {
    console.log('   ✅ All agencies have at least one partnership');
  }

  // Check for duplicate agency names
  console.log('\n\n🚨 DUPLICATE AGENCY NAMES:');
  console.log('-'.repeat(60));
  const nameCount = new Map<string, Array<{name: string, city: string | null, state: string | null}>>();
  agencies.forEach(agency => {
    const baseName = agency.name.replace(/ (NY|LA|SF|Chicago|Philadelphia|Denver|Boston|Atlanta|Dallas|Austin|Portland|Seattle|Miami)/i, '').trim();
    if (!nameCount.has(baseName)) {
      nameCount.set(baseName, []);
    }
    nameCount.get(baseName)!.push({
      name: agency.name,
      city: agency.city,
      state: agency.state,
    });
  });

  nameCount.forEach((locs, baseName) => {
    if (locs.length > 1) {
      console.log(`   📍 ${baseName}: ${locs.length} locations`);
      locs.forEach(loc => {
        console.log(`      - ${loc.name} (${loc.city}, ${loc.state})`);
      });
      issues.duplicateNames.set(baseName, locs.length);
    }
  });

  if (issues.duplicateNames.size === 0) {
    console.log('   ✅ No duplicate agency base names found');
  }

  // Partnership distribution
  console.log('\n\n📊 PARTNERSHIP DISTRIBUTION:');
  console.log('-'.repeat(60));
  const partnershipCounts = agencies.map(a => a.CompanyPartnership_agencyIdToCompany.length);
  const avg = partnershipCounts.reduce((a, b) => a + b, 0) / agencies.length;
  const max = Math.max(...partnershipCounts);
  const min = Math.min(...partnershipCounts);

  console.log(`   Average: ${avg.toFixed(1)} partnerships per agency`);
  console.log(`   Maximum: ${max} partnerships`);
  console.log(`   Minimum: ${min} partnerships`);
  console.log(`   Total Partnerships: ${partnershipCounts.reduce((a, b) => a + b, 0)}`);

  // Top agencies by partnership count
  console.log('\n\n🏆 TOP 10 AGENCIES BY PARTNERSHIP COUNT:');
  console.log('-'.repeat(60));
  const topAgencies = [...agencies]
    .sort((a, b) => b.CompanyPartnership_agencyIdToCompany.length - a.CompanyPartnership_agencyIdToCompany.length)
    .slice(0, 10);

  topAgencies.forEach((agency, idx) => {
    console.log(`   ${idx + 1}. ${agency.name} - ${agency.CompanyPartnership_agencyIdToCompany.length} partnerships`);
  });

  // Summary
  console.log('\n\n' + '='.repeat(60));
  console.log('📋 AUDIT SUMMARY:');
  console.log('='.repeat(60));
  console.log(`   Total Agencies: ${agencies.length}`);
  console.log(`   Agencies missing location: ${issues.noLocation.length}`);
  console.log(`   Agencies with 0 partnerships: ${issues.noPartnerships.length}`);
  console.log(`   Agency groups with multiple locations: ${issues.duplicateNames.size}`);
  console.log('='.repeat(60));

  await prisma.$disconnect();
}

auditAgencies().catch(console.error);
