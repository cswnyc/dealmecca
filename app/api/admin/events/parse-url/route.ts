import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/server/requireAdmin';

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (admin instanceof NextResponse) return admin;

    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Fetch the URL and extract metadata
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; EventParser/1.0)'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch URL');
    }

    const html = await response.text();

    // Extract Open Graph and meta tags
    const extractedData: any = {
      website: url
    };

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const ogTitleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i);
    extractedData.name = ogTitleMatch?.[1] || titleMatch?.[1] || '';

    // Extract description
    const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i);
    const ogDescMatch = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i);
    extractedData.description = ogDescMatch?.[1] || descMatch?.[1] || '';

    // Extract image
    const ogImageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i);
    if (ogImageMatch?.[1]) {
      extractedData.imageUrl = ogImageMatch[1];
    }

    // Extract event-specific metadata (schema.org)
    const schemaMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i);
    if (schemaMatch) {
      try {
        const schema = JSON.parse(schemaMatch[1]);

        if (schema['@type'] === 'Event' || schema.event) {
          const eventData = schema['@type'] === 'Event' ? schema : schema.event;

          if (eventData.name) extractedData.name = eventData.name;
          if (eventData.description) extractedData.description = eventData.description;
          if (eventData.startDate) extractedData.startDate = eventData.startDate;
          if (eventData.endDate) extractedData.endDate = eventData.endDate;

          // Location data
          if (eventData.location) {
            if (typeof eventData.location === 'string') {
              extractedData.location = eventData.location;
            } else if (eventData.location.name) {
              extractedData.location = eventData.location.name;
              if (eventData.location.address) {
                const addr = eventData.location.address;
                if (typeof addr === 'string') {
                  extractedData.location = addr;
                } else if (addr.addressLocality && addr.addressRegion) {
                  extractedData.location = `${addr.addressLocality}, ${addr.addressRegion}`;
                }
              }
            }

            // Venue name
            if (eventData.location.name && eventData.location.name !== extractedData.location) {
              extractedData.venue = eventData.location.name;
            }
          }

          // Organizer
          if (eventData.organizer) {
            if (typeof eventData.organizer === 'string') {
              extractedData.organizerName = eventData.organizer;
            } else if (eventData.organizer.name) {
              extractedData.organizerName = eventData.organizer.name;
              if (eventData.organizer.url) {
                extractedData.organizerUrl = eventData.organizer.url;
              }
            }
          }

          // Image
          if (eventData.image) {
            extractedData.imageUrl = typeof eventData.image === 'string'
              ? eventData.image
              : eventData.image.url || eventData.image[0];
          }
        }
      } catch (e) {
        console.error('Error parsing schema.org data:', e);
      }
    }

    // Try to extract dates from common patterns if not found in schema
    if (!extractedData.startDate) {
      // Look for date patterns in the HTML
      const datePatterns = [
        /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/g, // ISO datetime
        /(\d{1,2})\/(\d{1,2})\/(\d{4})/g, // MM/DD/YYYY
        /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2}),?\s+(\d{4})/gi // Month DD, YYYY
      ];

      for (const pattern of datePatterns) {
        const match = html.match(pattern);
        if (match) {
          try {
            const date = new Date(match[0]);
            if (!isNaN(date.getTime())) {
              extractedData.startDate = date.toISOString();
              break;
            }
          } catch (e) {
            // Continue to next pattern
          }
        }
      }
    }

    // Try to detect location from common patterns if not found
    if (!extractedData.location) {
      const locationPatterns = [
        /<meta[^>]*name="geo\.placename"[^>]*content="([^"]+)"/i,
        /<meta[^>]*property="event:location"[^>]*content="([^"]+)"/i
      ];

      for (const pattern of locationPatterns) {
        const match = html.match(pattern);
        if (match) {
          extractedData.location = match[1];
          break;
        }
      }
    }

    // Fallback: Try to find common location city names in the HTML
    if (!extractedData.location) {
      const cityMatch = html.match(/(New York|Los Angeles|Chicago|Houston|Phoenix|Philadelphia|San Antonio|San Diego|Dallas|San Jose|Austin|San Francisco|Seattle|Denver|Boston|Portland|Las Vegas|Miami|Atlanta|Washington|London|Paris|Berlin|Tokyo|Sydney)/i);
      if (cityMatch) {
        extractedData.location = cityMatch[0];
      }
    }

    return NextResponse.json(extractedData);

  } catch (error) {
    console.error('Error parsing URL:', error);
    return NextResponse.json(
      {
        error: 'Failed to parse URL',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
