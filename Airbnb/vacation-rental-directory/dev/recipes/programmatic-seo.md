# Programmatic SEO

Add SeoPage builder CLI + sitemaps; index pages; canonical tags.

## Tasks
- [ ] Create CLI tool for generating SEO landing pages
- [ ] Build programmatic city/neighborhood landing pages
- [ ] Generate XML sitemaps for all routes
- [ ] Add canonical tags to prevent duplicate content
- [ ] Create structured data (JSON-LD) for listings
- [ ] Add meta descriptions and Open Graph tags
- [ ] Build location-based search landing pages

## Implementation Notes
- Use Next.js generateStaticParams for static generation
- Create templates for city pages: "/stays/[city]"
- Generate pages for city+amenity combinations
- Use sitemap.xml and robots.txt
- Add breadcrumb structured data
- Monitor Core Web Vitals and page speed