import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface MentionResolution {
  type: 'company' | 'contact';
  id: string;
  name: string;
  displayName: string;
  confidence: number;
}

export async function POST(request: NextRequest) {
  try {
    const { mentions } = await request.json();

    if (!Array.isArray(mentions)) {
      return NextResponse.json(
        { error: 'Mentions must be an array' },
        { status: 400 }
      );
    }

    const resolutions: MentionResolution[] = [];

    for (const mention of mentions) {
      // Clean the mention (remove @ symbol and normalize)
      const cleanMention = mention.replace(/^@/, '').toLowerCase().trim();

      if (!cleanMention || cleanMention.length < 2) continue;

      // Search for companies first (fuzzy matching)
      const companies = await prisma.company.findMany({
        where: {
          OR: [
            { name: { contains: cleanMention, mode: 'insensitive' } },
            { slug: { contains: cleanMention, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          name: true,
          slug: true,
          verified: true,
        },
        take: 5,
      });

      // Add company matches with confidence scoring
      for (const company of companies) {
        const companyName = company.name;
        let confidence = 0;

        // Exact match gets highest confidence
        if (companyName.toLowerCase() === cleanMention) {
          confidence = 1.0;
        } else if (companyName.toLowerCase().includes(cleanMention)) {
          confidence = 0.8;
        } else if (company.slug && company.slug.toLowerCase().includes(cleanMention)) {
          confidence = 0.7;
        } else {
          confidence = 0.5;
        }

        // Boost confidence for verified companies
        if (company.verified) {
          confidence = Math.min(1.0, confidence + 0.1);
        }

        resolutions.push({
          type: 'company',
          id: company.id,
          name: mention, // Original mention text
          displayName: companyName,
          confidence,
        });
      }

      // Search for contacts if no high-confidence company match
      const bestCompanyMatch = resolutions
        .filter(r => r.name === mention && r.type === 'company')
        .sort((a, b) => b.confidence - a.confidence)[0];

      if (!bestCompanyMatch || bestCompanyMatch.confidence < 0.8) {
        const contacts = await prisma.contact.findMany({
          where: {
            OR: [
              { firstName: { contains: cleanMention, mode: 'insensitive' } },
              { lastName: { contains: cleanMention, mode: 'insensitive' } },
              { fullName: { contains: cleanMention, mode: 'insensitive' } },
            ],
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            title: true,
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          take: 3,
        });

        // Add contact matches with confidence scoring
        for (const contact of contacts) {
          const fullName = `${contact.firstName} ${contact.lastName}`.trim();
          let confidence = 0;

          // Name matching confidence
          if (fullName.toLowerCase() === cleanMention) {
            confidence = 0.9;
          } else if (fullName.toLowerCase().includes(cleanMention)) {
            confidence = 0.7;
          } else if (
            contact.firstName?.toLowerCase().includes(cleanMention) ||
            contact.lastName?.toLowerCase().includes(cleanMention)
          ) {
            confidence = 0.6;
          } else {
            confidence = 0.4;
          }

          resolutions.push({
            type: 'contact',
            id: contact.id,
            name: mention, // Original mention text
            displayName: fullName,
            confidence,
          });
        }
      }
    }

    // Sort by confidence and group by original mention
    const groupedResolutions = resolutions.reduce((acc, resolution) => {
      if (!acc[resolution.name]) {
        acc[resolution.name] = [];
      }
      acc[resolution.name].push(resolution);
      return acc;
    }, {} as Record<string, MentionResolution[]>);

    // Return the best match for each mention
    const bestResolutions: Record<string, MentionResolution | null> = {};

    for (const [mentionText, candidates] of Object.entries(groupedResolutions)) {
      const sortedCandidates = candidates.sort((a, b) => b.confidence - a.confidence);

      // Only return high-confidence matches (>= 0.5)
      if (sortedCandidates.length > 0 && sortedCandidates[0].confidence >= 0.5) {
        bestResolutions[mentionText] = sortedCandidates[0];
      } else {
        bestResolutions[mentionText] = null;
      }
    }

    return NextResponse.json({
      resolutions: bestResolutions,
    });
  } catch (error) {
    console.error('Error resolving mentions:', error);
    return NextResponse.json(
      { error: 'Failed to resolve mentions' },
      { status: 500 }
    );
  }
}