import { NextRequest, NextResponse } from 'next/server';

// Predefined topics that users can mention
const PREDEFINED_TOPICS = [
  { id: 'programmatic', name: 'Programmatic', description: 'Automated digital advertising' },
  { id: 'ctv', name: 'CTV', description: 'Connected TV advertising' },
  { id: 'attribution', name: 'Attribution', description: 'Marketing attribution models' },
  { id: 'data-storytelling', name: 'Data Storytelling', description: 'Using data to tell compelling stories' },
  { id: 'retail-media', name: 'Retail Media', description: 'Advertising within retail environments' },
  { id: 'streaming', name: 'Streaming', description: 'Video streaming platforms' },
  { id: 'upfront', name: 'Upfront', description: 'TV advertising upfront season' },
  { id: 'in-housing', name: 'In-Housing', description: 'Bringing media capabilities in-house' },
  { id: 'consolidation', name: 'Consolidation', description: 'Agency/account consolidation' },
  { id: 'measurement', name: 'Measurement', description: 'Campaign measurement and analytics' },
  { id: 'privacy', name: 'Privacy', description: 'Data privacy and compliance' },
  { id: 'cookie-deprecation', name: 'Cookie Deprecation', description: 'End of third-party cookies' },
  { id: 'first-party-data', name: 'First-Party Data', description: 'Customer owned data strategies' },
  { id: 'ai-creative', name: 'AI Creative', description: 'AI-generated creative content' },
  { id: 'budget-allocation', name: 'Budget Allocation', description: 'Media budget distribution' },
  { id: 'brand-safety', name: 'Brand Safety', description: 'Brand safety and suitability' },
  { id: 'performance-marketing', name: 'Performance Marketing', description: 'ROI-focused marketing campaigns' },
  { id: 'omnichannel', name: 'Omnichannel', description: 'Multi-channel marketing approach' },
  { id: 'video-advertising', name: 'Video Advertising', description: 'Video-based advertising formats' },
  { id: 'social-commerce', name: 'Social Commerce', description: 'Shopping on social platforms' }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase() || '';

    if (query.length < 2) {
      return NextResponse.json({ topics: [] });
    }

    // Filter topics based on query
    const filteredTopics = PREDEFINED_TOPICS
      .filter(topic => 
        topic.name.toLowerCase().includes(query) ||
        topic.description.toLowerCase().includes(query)
      )
      .slice(0, 8) // Limit to 8 results
      .map(topic => ({
        id: topic.id,
        name: topic.name,
        displayName: topic.name,
        description: topic.description,
        type: 'topic'
      }));

    return NextResponse.json({ topics: filteredTopics });
  } catch (error) {
    console.error('Error searching topics:', error);
    return NextResponse.json({ error: 'Failed to search topics' }, { status: 500 });
  }
}