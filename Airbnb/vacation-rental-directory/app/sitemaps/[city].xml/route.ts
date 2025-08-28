import { NextRequest } from 'next/navigation';
import { prisma } from '../../lib/db';
import { notFound } from 'next/navigation';

export async function GET(
  request: NextRequest,
  { params }: { params: { city: string } }
) {
  const citySlug = params.city;
  
  // Verify city exists and get SEO pages
  const city = await prisma.city.findUnique({
    where: { slug: citySlug },
    include: {
      seoPages: {
        where: {
          indexed: true
        },
        select: {
          slug: true,
          updatedAt: true,
        },
        orderBy: {
          slug: 'asc'
        }
      }
    }
  });
  
  if (!city) {
    notFound();
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  // Build XML sitemap for this city's SEO pages
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${city.seoPages.map(seoPage => `
  <url>
    <loc>${baseUrl}/${seoPage.slug}</loc>
    <lastmod>${seoPage.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${seoPage.slug === citySlug ? '0.9' : '0.7'}</priority>
  </url>`).join('')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400', // Cache for 1 hour, stale-while-revalidate for 1 day
    },
  });
}

export async function generateStaticParams() {
  // Generate static params for all cities that have SEO pages
  const cities = await prisma.city.findMany({
    where: {
      seoPages: {
        some: {
          indexed: true
        }
      }
    },
    select: {
      slug: true
    }
  });

  return cities.map((city) => ({
    city: city.slug,
  }));
}