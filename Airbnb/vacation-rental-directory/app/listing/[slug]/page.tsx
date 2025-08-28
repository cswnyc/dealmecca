// app/listing/[slug]/page.tsx
import { prisma } from '../../lib/db';
import { notFound } from 'next/navigation';
import { createInquiry } from '../../actions/inquiry';
import Link from 'next/link';

export default async function ListingPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const listing = await prisma.listing.findUnique({
    where: { slug: resolvedParams.slug },
    include: {
      city: true,
      neighborhood: true,
      photos: { orderBy: { order: 'asc' } },
      amenities: { include: { amenity: true } },
      reviews: true,
      owner: { include: { user: true } },
    },
  });

  if (!listing || listing.status !== 'ACTIVE') notFound();

  const success = resolvedSearchParams?.success === '1';
  const error = resolvedSearchParams?.error;

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-6">
      <div className="text-sm text-gray-500">
        <Link href="/search" className="underline">← Back to results</Link>
      </div>

      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">{listing.title}</h1>
        <div className="text-gray-600">
          {listing.city.name}
          {listing.neighborhood ? ` • ${listing.neighborhood.name}` : ''}
        </div>
        <div className="text-sm">
          {listing.bedrooms} bd • {listing.bathrooms} ba • Sleeps {listing.sleeps}
        </div>
        <div className="font-medium">
          ${listing.priceMin}–${listing.priceMax} / night
        </div>
      </header>

      {/* Gallery */}
      <section className="grid gap-2 md:grid-cols-3">
        {listing.photos.map((p) => (
          <img
            key={p.id}
            src={p.url}
            alt={listing.title}
            className="w-full h-60 object-cover rounded"
          />
        ))}
      </section>

      {/* Amenities */}
      <section className="space-y-2">
        <h2 className="text-lg font-medium">Amenities</h2>
        <div className="flex flex-wrap gap-2">
          {listing.amenities.map((a) => (
            <span
              key={`${listing.id}-${a.amenityId}`}
              className="text-sm bg-gray-100 px-2 py-1 rounded"
            >
              {a.amenity.name}
            </span>
          ))}
        </div>
      </section>

      {/* Reviews */}
      {listing.reviews.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-medium">Recent Reviews</h2>
          <ul className="space-y-2">
            {listing.reviews.slice(0, 4).map((r) => (
              <li key={r.id} className="border rounded p-3">
                <div className="text-sm font-medium">
                  {r.guestName || 'Guest'} — {r.rating}/5
                </div>
                {r.title && <div className="font-medium">{r.title}</div>}
                {r.body && <p className="text-sm text-gray-700">{r.body}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Inquiry Form */}
      <section className="space-y-3">
        <h2 className="text-lg font-medium">Contact the Owner</h2>

        {success && (
          <div className="rounded bg-green-50 border border-green-200 p-3 text-sm">
            ✅ Inquiry sent. The owner will reach out to you directly.
          </div>
        )}
        {error && (
          <div className="rounded bg-red-50 border border-red-200 p-3 text-sm">
            ⚠️ Please fill in required fields (email & message).
          </div>
        )}

        <form action={createInquiry} className="grid gap-3 max-w-lg">
          <input type="hidden" name="listingId" value={listing.id} />
          <input type="hidden" name="slug" value={listing.slug} />

          <label className="block">
            <span className="text-sm">Your Name (optional)</span>
            <input
              name="guestName"
              className="mt-1 w-full rounded border p-2"
              placeholder="Jane Doe"
            />
          </label>

          <label className="block">
            <span className="text-sm">Email</span>
            <input
              name="guestEmail"
              type="email"
              required
              className="mt-1 w-full rounded border p-2"
              placeholder="jane@example.com"
            />
          </label>

          <label className="block">
            <span className="text-sm">Phone (optional)</span>
            <input
              name="phone"
              className="mt-1 w-full rounded border p-2"
              placeholder="+1 555 123 4567"
            />
          </label>

          <label className="block">
            <span className="text-sm">Message</span>
            <textarea
              name="message"
              required
              rows={5}
              className="mt-1 w-full rounded border p-2"
              placeholder="Hi! I'm interested in your place from Oct 12–15 for 4 guests. Is it available?"
            />
          </label>

          <button
            type="submit"
            className="rounded bg-black text-white px-4 py-2 hover:opacity-90"
          >
            Send Inquiry
          </button>
        </form>

        <p className="text-xs text-gray-500">
          We'll forward your message directly to the owner. No booking fees.
        </p>
      </section>
    </main>
  );
}