import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '../../lib/db';
import { scoreListing } from '../../lib/ranking';
import { ListingGrid } from '../../components/ListingCard';
import { 
  parseSlugToParams, 
  normalizeSlug, 
  buildListingWhereClause, 
  getCanonicalUrl 
} from '../../lib/seo-utils';

interface SeoPageProps {
  params: Promise<{ slug: string[] }>;
}

async function getSeoPage(slug: string[]) {
  const slugString = slug.join('/');
  
  // Try to find exact match first
  const seoPage = await prisma.seoPage.findUnique({
    where: { slug: slugString }
  });
  
  if (seoPage) {
    return { seoPage, isCanonical: true };
  }
  
  // If not found, check if we need to normalize the slug
  const normalizedSlug = normalizeSlug(slug);
  if (normalizedSlug !== slugString) {
    // Look for the normalized version
    const normalizedPage = await prisma.seoPage.findUnique({
      where: { slug: normalizedSlug }
    });
    
    if (normalizedPage) {
      return { seoPage: normalizedPage, isCanonical: false, canonicalSlug: normalizedSlug };
    }
  }
  
  return { seoPage: null, isCanonical: false };
}

export async function generateMetadata({ params }: SeoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { seoPage, isCanonical, canonicalSlug } = await getSeoPage(slug);
  
  if (!seoPage) {
    return {
      title: 'Page Not Found',
      description: 'The requested page could not be found.',
    };
  }
  
  const canonicalUrl = getCanonicalUrl(canonicalSlug || seoPage.slug);
  
  const metadata: Metadata = {
    title: seoPage.title,
    description: seoPage.metaDescription || seoPage.description,
    alternates: {
      canonical: canonicalUrl,
    },
  };
  
  // Add noindex if page is marked as not indexed
  if (!seoPage.indexed) {
    metadata.robots = {
      index: false,
      follow: true,
    };
  }
  
  return metadata;
}

export default async function SeoPage({ params }: SeoPageProps) {
  const { slug } = await params;
  const { seoPage, isCanonical, canonicalSlug } = await getSeoPage(slug);
  
  if (!seoPage) {
    notFound();
  }
  
  // Redirect to canonical URL if this isn't the canonical version
  if (!isCanonical && canonicalSlug) {
    redirect(`/${canonicalSlug}`);
  }
  
  // Parse params from the SEO page to build listing query
  let listingParams;
  try {
    listingParams = JSON.parse(seoPage.params);
  } catch (error) {
    console.error('Failed to parse SEO page params:', error);
    notFound();
  }
  
  // Build where clause for listings
  const where = buildListingWhereClause(listingParams);
  
  // Fetch matching listings
  const listings = await prisma.listing.findMany({
    where,
    include: {
      city: true,
      neighborhood: true,
      photos: { orderBy: { order: 'asc' }, take: 1 },
      reviews: { select: { rating: true } },
      amenities: {
        include: {
          amenity: true
        }
      }
    },
    take: 60,
  });
  
  // Rank listings
  const ranked = listings
    .map((l) => ({ l, s: scoreListing(l) }))
    .sort((a, b) => b.s - a.s)
    .map((x) => x.l);
  
  // Update view count
  await prisma.seoPage.update({
    where: { id: seoPage.id },
    data: {
      views: { increment: 1 },
      lastViewed: new Date(),
    },
  });
  
  return (
    <main className="mx-auto max-w-6xl p-6 space-y-6">
      {/* Page Header */}
      <header className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          {seoPage.h1 || seoPage.title}
        </h1>
        <p className="text-lg text-gray-700 leading-relaxed">
          {seoPage.description}
        </p>
      </header>
      
      {/* Results Summary */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="text-sm text-gray-600">
          {ranked.length === 0 
            ? 'No properties found' 
            : ranked.length === 1
            ? '1 property found'
            : `${ranked.length} properties found`
          }
        </div>
        
        {ranked.length > 0 && (
          <div className="text-sm text-gray-500">
            Sorted by relevance and quality
          </div>
        )}
      </div>
      
      {/* Listings Grid */}
      {ranked.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">No properties match your criteria</h3>
            <p className="text-gray-600">
              Try adjusting your search or check back soon as new properties are added regularly.
            </p>
            <div className="pt-2">
              <a
                href="/search"
                className="inline-block bg-black text-white px-4 py-2 rounded hover:opacity-90"
              >
                Browse All Properties
              </a>
            </div>
          </div>
        </div>
      ) : (
        <ListingGrid listings={ranked} />
      )}
      
      {/* Content Section */}
      {seoPage.content && (
        <section className="prose prose-gray max-w-none pt-8 border-t border-gray-200">
          <div className="text-gray-700 leading-relaxed whitespace-pre-line">
            {seoPage.content}
          </div>
        </section>
      )}
      
      {/* Breadcrumbs for SEO */}
      <nav className="text-sm text-gray-500 pt-4 border-t border-gray-100">
        <ol className="flex items-center space-x-2">
          <li>
            <a href="/" className="hover:text-gray-700">
              Home
            </a>
          </li>
          <li>
            <span className="mx-2">/</span>
            <span>
              {listingParams.city ? (
                <a href={`/${listingParams.city}`} className="hover:text-gray-700 capitalize">
                  {listingParams.city.replace(/-/g, ' ')}
                </a>
              ) : (
                'Search Results'
              )}
            </span>
          </li>
          {listingParams.bedrooms && (
            <>
              <li>
                <span className="mx-2">/</span>
                <span>{listingParams.bedrooms} Bedroom</span>
              </li>
            </>
          )}
        </ol>
      </nav>
    </main>
  );
}