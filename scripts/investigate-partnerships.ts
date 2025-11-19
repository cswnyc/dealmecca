#!/usr/bin/env npx tsx
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function investigate() {
  // Get all partnerships for Horizon Media LA with creation dates
  const horizonLA = await prisma.company.findFirst({
    where: { name: { contains: 'Horizon Media LA', mode: 'insensitive' } },
    select: { id: true, name: true }
  });

  if (!horizonLA) {
    console.log('Horizon Media LA not found');
    return;
  }

  const partnerships = await prisma.companyPartnership.findMany({
    where: { agencyId: horizonLA.id },
    include: { advertiser: { select: { name: true, createdAt: true } } },
    orderBy: { createdAt: 'asc' },
    take: 10
  });

  console.log('🔍 First 10 partnerships for Horizon Media LA (by creation date):');
  console.log('');
  partnerships.forEach((p, i) => {
    console.log(`${i + 1}. ${p.advertiser.name}`);
    console.log(`   Partnership created: ${p.createdAt}`);
    console.log(`   Advertiser created: ${p.advertiser.createdAt}`);
    console.log(`   Source: ${p.source || 'unknown'}`);
    console.log('');
  });

  // Check if there's a pattern in creation dates
  const allPartnerships = await prisma.companyPartnership.findMany({
    where: { agencyId: horizonLA.id },
    select: { createdAt: true }
  });

  const dateGroups: Record<string, number> = {};
  allPartnerships.forEach(p => {
    const date = p.createdAt.toISOString().split('T')[0];
    dateGroups[date] = (dateGroups[date] || 0) + 1;
  });

  console.log('📅 Partnership creation date distribution:');
  Object.entries(dateGroups).sort().forEach(([date, count]) => {
    console.log(`   ${date}: ${count} partnerships`);
  });

  await prisma.$disconnect();
}

investigate().catch(console.error);
