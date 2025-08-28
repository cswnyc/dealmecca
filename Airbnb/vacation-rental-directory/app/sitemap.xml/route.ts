import { prisma } from '../lib/db';

export async function GET() {
  // Get all cities that have SEO pages
  const cities = await prisma.city.findMany({
    where: {
      seoPages: {
        some: {
          indexed: true
        }
      }
    },
    select: {
      slug: true,
      name: true,
      _count: {
        select: {
          seoPages: {
            where: {
              indexed: true
            }
          }
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  });
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap-main.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  ${cities.map(city => `
  <sitemap>
    <loc>${baseUrl}/sitemaps/${city.slug}.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`).join('')}
</sitemapindex>`;

  return new Response(sitemapIndex, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400', // Cache for 1 hour, stale-while-revalidate for 1 day
    },
  });
}