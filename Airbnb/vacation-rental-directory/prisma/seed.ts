// prisma/seed.ts
import { PrismaClient, Role, Tier, ListingStatus, AvailabilityStatus } from '@prisma/client';

const prisma = new PrismaClient();

// ---------- helpers ----------
const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: T[]) => arr[rnd(0, arr.length - 1)];
const pickMany = <T>(arr: T[], n: number) => {
  const copy = [...arr];
  const out: T[] = [];
  while (out.length < n && copy.length) {
    const i = rnd(0, copy.length - 1);
    out.push(copy.splice(i, 1)[0]);
  }
  return out;
};
const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

const today = new Date();
const daysFromNow = (d: number) => new Date(today.getTime() + d * 24 * 60 * 60 * 1000);
const daysAgo = (d: number) => new Date(today.getTime() - d * 24 * 60 * 60 * 1000);

// ---------- seed data ----------
const citiesData = [
  {
    name: 'Palm Springs',
    state: 'CA',
    slug: 'palm-springs',
    neighborhoods: ['Movie Colony', 'Twin Palms', 'Racquet Club Estates', 'Deepwell Estates'],
  },
  {
    name: 'Big Bear Lake',
    state: 'CA',
    slug: 'big-bear-lake',
    neighborhoods: ['Fox Farm', 'Moonridge', 'Boulder Bay', 'Fawnskin'],
  },
  {
    name: 'Redondo Beach',
    state: 'CA',
    slug: 'redondo-beach',
    neighborhoods: ['South Redondo', 'North Redondo', 'The Avenues', 'Hollywood Riviera'],
  },
  {
    name: 'La Quinta',
    state: 'CA',
    slug: 'la-quinta',
    neighborhoods: ['PGA West', 'La Quinta Cove', 'The Citrus', 'Santa Rosa Cove'],
  },
  {
    name: 'Joshua Tree',
    state: 'CA',
    slug: 'joshua-tree',
    neighborhoods: ['Village', 'Hidden Rivers', 'Friendly Hills', 'Sunfair'],
  },
  {
    name: 'Santa Monica',
    state: 'CA',
    slug: 'santa-monica',
    neighborhoods: ['Ocean Park', 'North of Montana', 'Sunset Park', 'Pico District'],
  },
];

const amenitiesData = [
  ['pool', 'Pool'],
  ['hot_tub', 'Hot Tub'],
  ['pet_friendly', 'Pet Friendly'],
  ['beachfront', 'Beachfront'],
  ['ocean_view', 'Ocean View'],
  ['mountain_view', 'Mountain View'],
  ['fire_pit', 'Fire Pit'],
  ['bbq_grill', 'BBQ Grill'],
  ['ev_charger', 'EV Charger'],
  ['fast_wifi', 'Fast Wi-Fi'],
  ['air_conditioning', 'Air Conditioning'],
  ['washer_dryer', 'Washer / Dryer'],
  ['parking', 'Parking'],
  ['gym', 'Gym'],
  ['accessible', 'Accessible'],
  ['workstation', 'Workstation'],
  ['game_room', 'Game Room'],
  ['pool_table', 'Pool Table'],
  ['ping_pong', 'Ping Pong'],
  ['near_hiking', 'Near Hiking'],
] as const;

const adjectives = [
  'Modern',
  'Cozy',
  'Luxury',
  'Sunny',
  'Spacious',
  'Designer',
  'Boho',
  'Chic',
  'Retro',
  'Minimal',
];
const types = ['Bungalow', 'Villa', 'Cottage', 'Condo', 'House', 'Retreat', 'Loft', 'Cabin'];

// ---------- main ----------
async function main() {
  console.log('🌱 Seeding dev database…');

  // Wipe existing dev data (safe in dev only)
  await prisma.inquiry.deleteMany();
  await prisma.review.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.amenityOnListing.deleteMany();
  await prisma.photo.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.ownerProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.neighborhood.deleteMany();
  await prisma.city.deleteMany();
  await prisma.amenity.deleteMany();
  await prisma.seoPage.deleteMany();

  // Create amenities
  const amenityRecords = [];
  for (const [key, name] of amenitiesData) {
    const a = await prisma.amenity.create({ data: { key, name } });
    amenityRecords.push(a);
  }
  console.log(`✅ Amenities: ${amenityRecords.length}`);

  // Create cities + neighborhoods
  const cityRecords = [];
  const neighborhoodRecordsByCitySlug: Record<string, { id: string; name: string }[]> = {};

  for (const c of citiesData) {
    const city = await prisma.city.create({
      data: { name: c.name, state: c.state, slug: c.slug },
    });
    cityRecords.push(city);

    const neighborhoods = [];
    for (const n of c.neighborhoods) {
      const nb = await prisma.neighborhood.create({
        data: {
          name: n,
          slug: slugify(`${c.slug}-${n}`),
          cityId: city.id,
        },
      });
      neighborhoods.push({ id: nb.id, name: nb.name });
    }
    neighborhoodRecordsByCitySlug[c.slug] = neighborhoods;
  }
  console.log(`✅ Cities: ${cityRecords.length} | Neighborhoods: ${Object.values(neighborhoodRecordsByCitySlug).flat().length}`);

  // Create 10 owners (Users + OwnerProfile + Subscription)
  const ownerProfiles = [];
  for (let i = 1; i <= 10; i++) {
    const email = `owner${i}@example.com`;
    const user = await prisma.user.create({
      data: {
        email,
        role: Role.OWNER,
      },
    });

    const owner = await prisma.ownerProfile.create({
      data: {
        userId: user.id,
        phone: `+1-555-01${String(i).padStart(2, '0')}`,
        verified: Math.random() < 0.6,
      },
    });

    const tier = [Tier.BRONZE, Tier.SILVER, Tier.GOLD, Tier.PLATINUM][rnd(0, 3)];
    const start = daysAgo(rnd(1, 120));
    const end = daysFromNow(rnd(180, 365));
    await prisma.subscription.create({
      data: {
        ownerId: owner.id,
        tier,
        start,
        end,
        status: 'active',
        stripeSubscriptionId: null, // attach real IDs when Stripe Billing is wired
        stripeCustomerId: null,
      },
    });

    ownerProfiles.push({ ...owner, currentTier: tier });
  }
  console.log(`✅ Owners: ${ownerProfiles.length} (with active subscriptions)`);

  // Build 50 listings sprinkled across cities/owners
  const listingsToCreate = 50;
  let createdListings = 0;

  for (let i = 0; i < listingsToCreate; i++) {
    const city = pick(cityRecords);
    const nbs = neighborhoodRecordsByCitySlug[city.slug];
    const neighborhood = pick(nbs);
    const owner = pick(ownerProfiles);

    const bedrooms = rnd(1, 6);
    const bathrooms = Math.max(1, Math.min(6, bedrooms - 1)) + (Math.random() > 0.5 ? 0.5 : 0);
    const sleeps = bedrooms * 2 + (Math.random() > 0.6 ? 2 : 0);

    // crude price model by city and size (whole dollars)
    const base =
      city.slug === 'palm-springs'
        ? 250
        : city.slug === 'big-bear-lake'
        ? 220
        : city.slug === 'redondo-beach'
        ? 300
        : city.slug === 'la-quinta'
        ? 240
        : city.slug === 'joshua-tree'
        ? 200
        : 320;
    const priceMin = base + bedrooms * rnd(20, 40);
    const priceMax = priceMin + rnd(50, 200);

    const adjective = pick(adjectives);
    const type = pick(types);
    const title = `${adjective} ${bedrooms}BR ${type} in ${neighborhood.name}, ${city.name}`;
    const slug = slugify(`${title}-${i + 1}-${rnd(1000, 9999)}`);

    const status = Math.random() < 0.85 ? ListingStatus.ACTIVE : ListingStatus.PENDING;

    const amenitySet = pickMany(amenityRecords, rnd(6, 10));
    const photos = Array.from({ length: rnd(4, 7) }).map((_, idx) => ({
      url: `https://picsum.photos/seed/${slug}-${idx + 1}/1200/800`,
      width: 1200,
      height: 800,
      order: idx + 1,
    }));

    // availability windows over next ~90 days
    const availBlocks = [];
    let cursor = 0;
    const blocks = rnd(3, 6);
    for (let b = 0; b < blocks; b++) {
      const startOffset = cursor + rnd(1, 12);
      const len = rnd(2, 7);
      const statusRoll = Math.random();
      const statusBlock =
        statusRoll < 0.55
          ? AvailabilityStatus.AVAILABLE
          : statusRoll < 0.85
          ? AvailabilityStatus.BOOKED
          : AvailabilityStatus.BLOCKED;

      availBlocks.push({
        startDate: daysFromNow(startOffset),
        endDate: daysFromNow(startOffset + len),
        status: statusBlock,
      });
      cursor = startOffset + len;
    }

    const reviewCount = rnd(0, 3);
    const reviews = Array.from({ length: reviewCount }).map(() => ({
      rating: rnd(4, 5),
      title: pick(['Great stay', 'Perfect weekend', 'Super clean & comfy', 'As advertised']),
      body: pick([
        'Loved the location and the amenities.',
        'Host was responsive and the house was spotless.',
        'Would definitely book again.',
      ]),
      guestName: pick(['Alex', 'Jordan', 'Taylor', 'Sam', 'Morgan']),
      source: 'manual',
      createdAt: daysAgo(rnd(1, 120)),
    }));

    await prisma.listing.create({
      data: {
        slug,
        title,
        summary:
          'Thoughtfully furnished getaway with indoor-outdoor living, fast Wi-Fi, and a fully equipped kitchen. Minutes to top attractions.',
        cityId: city.id,
        neighborhoodId: neighborhood?.id ?? null,
        bedrooms,
        bathrooms: Number(bathrooms.toFixed(1)),
        sleeps,
        priceMin,
        priceMax,
        tier: owner.currentTier as Tier,
        status,
        ownerId: owner.id,
        photos: { create: photos },
        amenities: {
          create: amenitySet.map((a) => ({
            amenityId: a.id,
            note: null,
          })),
        },
        availability: { create: availBlocks },
        reviews: { create: reviews },
      },
    });

    createdListings++;
  }

  console.log(`✅ Listings created: ${createdListings}`);

  // Example SEO pages (optional; harmless)
  const seoPages = [
    {
      slug: 'palm-springs/pet-friendly/with-pool/3-bedroom',
      title: 'Palm Springs Pet-Friendly 3BR Rentals with Pool',
      description: 'Browse pet-friendly Palm Springs vacation rentals with private pools.',
      params: { city: 'palm-springs', amenities: ['pet_friendly', 'pool'], bedrooms: 3 },
    },
    {
      slug: 'big-bear-lake/cabins/4-bedroom',
      title: 'Big Bear 4BR Cabins',
      description: 'Spacious 4-bedroom cabins near the slopes and hiking.',
      params: { city: 'big-bear-lake', type: 'cabin', bedrooms: 4 },
    },
  ];
  for (const p of seoPages) {
    await prisma.seoPage.create({
      data: {
        slug: p.slug,
        title: p.title,
        description: p.description,
        params: JSON.stringify(p.params),
      },
    });
  }
  console.log(`✅ SEO pages: ${seoPages.length}`);

  console.log('🌳 Seed complete.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });