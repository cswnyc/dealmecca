// app/lib/claude-agents.ts
import { 
  claudeCodeClient, 
  tripPlanningClient, 
  propertyManagementClient,
  ClaudeCodeAgentResponse,
  handleClaudeCodeResponse 
} from './claude-code-config';
import { prisma } from './db';

export interface AgentResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export class PropertyDescriptionAgent {
  async generateDescription(listing: {
    title: string;
    bedrooms: number;
    bathrooms: number;
    sleeps: number;
    city: { name: string; state: string };
    neighborhood?: { name: string };
    amenities: { amenity: { name: string } }[];
  }): Promise<ClaudeCodeAgentResponse> {
    try {
      const amenitiesList = listing.amenities.map(a => a.amenity.name).join(', ');
      const location = `${listing.city.name}, ${listing.city.state}${
        listing.neighborhood ? ` (${listing.neighborhood.name})` : ''
      }`;

      const prompt = `You are a vacation rental copywriter with access to file operations and database tools.

**Your Task:**
1. Generate an engaging property description
2. Automatically save variations to files for A/B testing
3. Query similar properties for competitive analysis
4. Create SEO-optimized content

**Property Details:**
- Title: ${listing.title}
- Location: ${location}
- Bedrooms: ${listing.bedrooms}
- Bathrooms: ${listing.bathrooms}
- Sleeps: ${listing.sleeps}
- Amenities: ${amenitiesList}

**Available Tools:**
- file_write: Save description variations
- database_query: Find similar properties
- text_generation: Create compelling copy

**Requirements:**
- Write 2-3 engaging paragraphs (150-200 words total)
- Automatically save 3 variations to files for testing
- Include local attraction data from database
- Generate SEO keywords and meta descriptions
- End with a compelling call to action

**Format:**
Return JSON with:
{
  "description": "main property description",
  "variations": ["variation1", "variation2", "variation3"],
  "seoKeywords": ["keyword1", "keyword2"],
  "metaDescription": "SEO meta description"
}`;

      const message = await propertyManagementClient.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 800,
        messages: [{ role: 'user', content: prompt }],
      });

      const responseText = message.content[0].type === 'text' 
        ? message.content[0].text 
        : '{}';

      try {
        const parsedResponse = JSON.parse(responseText);
        
        // Auto-save functionality (simulated for now)
        try {
          const fs = require('fs');
          const path = require('path');
          const saveDir = './app/generated/descriptions';
          
          if (!fs.existsSync(saveDir)) {
            fs.mkdirSync(saveDir, { recursive: true });
          }
          
          const filename = `${Date.now()}-${listing.title.replace(/[^a-zA-Z0-9]/g, '-')}.json`;
          const filepath = path.join(saveDir, filename);
          
          fs.writeFileSync(filepath, JSON.stringify({
            listingTitle: listing.title,
            location: location,
            generatedAt: new Date().toISOString(),
            ...parsedResponse
          }, null, 2));
          
          console.log(`Auto-saved property description to: ${filepath}`);
        } catch (saveError) {
          console.warn('Could not auto-save description:', saveError);
        }

        return {
          success: true,
          data: parsedResponse,
          metadata: {
            tokensUsed: message.usage?.total_tokens || 0,
            processingTime: Date.now(),
            toolsUsed: ['text_generation', 'file_write'],
            cacheHit: false
          }
        };
      } catch (parseError) {
        return { 
          success: false,
          error: `Failed to parse enhanced description response: ${parseError}`,
          metadata: {
            tokensUsed: message.usage?.total_tokens || 0,
            processingTime: Date.now(),
            toolsUsed: ['text_generation']
          }
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to generate description with Claude Code SDK: ${error}`,
        metadata: {
          tokensUsed: 0,
          processingTime: 0,
          toolsUsed: []
        }
      };
    }
  }

  async generateSummary(description: string): Promise<AgentResponse> {
    try {
      const prompt = `Create a compelling 1-sentence summary for this vacation rental description. Make it catchy and highlight the key selling points:

${description}

Return ONLY the summary sentence, no additional text.`;

      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 100,
        messages: [{ role: 'user', content: prompt }],
      });

      const summary = message.content[0].type === 'text' 
        ? message.content[0].text 
        : '';

      return { success: true, data: summary };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to generate summary: ${error}` 
      };
    }
  }
}

export class InquiryResponseAgent {
  async suggestResponse(inquiry: {
    guestName?: string;
    guestEmail: string;
    message: string;
    listing: {
      title: string;
      city: { name: string };
      priceMin?: number;
      priceMax?: number;
    };
  }): Promise<AgentResponse> {
    try {
      const guestName = inquiry.guestName || 'there';
      const priceInfo = inquiry.listing.priceMin && inquiry.listing.priceMax 
        ? `$${inquiry.listing.priceMin}-${inquiry.listing.priceMax}/night`
        : 'competitive rates';

      const prompt = `You are a helpful vacation rental host assistant. Generate a warm, professional response to this guest inquiry:

**Guest Message:**
From: ${inquiry.guestName || 'Guest'} (${inquiry.guestEmail})
Message: "${inquiry.message}"

**Property:** ${inquiry.listing.title} in ${inquiry.listing.city.name}
**Pricing:** ${priceInfo}

**Response Guidelines:**
- Start with a warm greeting using their name
- Thank them for their interest
- Address their specific questions/requests
- Provide helpful information about the property and area
- Ask relevant follow-up questions
- Include next steps for booking
- End with your host name as "Sarah" (the property manager)
- Keep it friendly but professional
- 150-200 words

Return ONLY the response text, no additional formatting.`;

      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }],
      });

      const response = message.content[0].type === 'text' 
        ? message.content[0].text 
        : '';

      return { success: true, data: response };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to generate response: ${error}` 
      };
    }
  }
}

export class PricingOptimizationAgent {
  async suggestPricing(listing: {
    bedrooms: number;
    bathrooms: number;
    sleeps: number;
    city: { name: string; state: string };
    amenities: { amenity: { name: string } }[];
    tier: string;
  }): Promise<AgentResponse> {
    try {
      // Get similar listings for comparison
      const similarListings = await prisma.listing.findMany({
        where: {
          status: 'ACTIVE',
          cityId: listing.city ? undefined : undefined, // We'd need cityId here
          bedrooms: listing.bedrooms,
          sleeps: { gte: listing.sleeps - 2, lte: listing.sleeps + 2 },
        },
        select: {
          priceMin: true,
          priceMax: true,
          tier: true,
        },
        take: 10,
      });

      const avgPrices = similarListings.reduce((acc, l) => {
        if (l.priceMin && l.priceMax) {
          acc.min += l.priceMin;
          acc.max += l.priceMax;
          acc.count++;
        }
        return acc;
      }, { min: 0, max: 0, count: 0 });

      const marketAvgMin = avgPrices.count > 0 ? Math.floor(avgPrices.min / avgPrices.count) : 150;
      const marketAvgMax = avgPrices.count > 0 ? Math.floor(avgPrices.max / avgPrices.count) : 250;

      const amenitiesList = listing.amenities.map(a => a.amenity.name).join(', ');

      const prompt = `You are a vacation rental pricing expert. Analyze this property and suggest optimal pricing:

**Property Details:**
- Location: ${listing.city.name}, ${listing.city.state}
- Bedrooms: ${listing.bedrooms}, Bathrooms: ${listing.bathrooms}
- Sleeps: ${listing.sleeps}
- Tier: ${listing.tier}
- Amenities: ${amenitiesList}

**Market Data:**
- Similar properties average: $${marketAvgMin}-$${marketAvgMax}/night
- Sample size: ${avgPrices.count} comparable listings

**Analysis Needed:**
1. Suggested price range (min-max per night)
2. Key factors influencing pricing
3. Seasonal adjustment recommendations
4. Competitive advantages
5. Revenue optimization tips

**Format:**
Return as JSON with this structure:
{
  "suggestedMin": number,
  "suggestedMax": number,
  "factors": ["factor1", "factor2"],
  "seasonalTips": "advice",
  "competitiveAdvantages": ["advantage1", "advantage2"]
}`;

      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      });

      const responseText = message.content[0].type === 'text' 
        ? message.content[0].text 
        : '{}';

      try {
        const pricingData = JSON.parse(responseText);
        return { success: true, data: pricingData };
      } catch (parseError) {
        // Fallback if JSON parsing fails
        return { 
          success: true, 
          data: {
            suggestedMin: marketAvgMin,
            suggestedMax: marketAvgMax,
            factors: ['Market analysis', 'Property features'],
            seasonalTips: 'Monitor local events and seasonal demand',
            competitiveAdvantages: ['Direct booking', 'No platform fees']
          }
        };
      }

    } catch (error) {
      return { 
        success: false, 
        error: `Failed to analyze pricing: ${error}` 
      };
    }
  }
}

export class SearchEnhancementAgent {
  async enhanceSearchQuery(query: string, userIntent?: string): Promise<AgentResponse> {
    try {
      const prompt = `You are a vacation rental search expert. Enhance this search query to help users find better results:

**Original Query:** "${query}"
**User Context:** ${userIntent || 'General search'}

**Task:**
Suggest 3-5 alternative search terms or phrases that might help the user find relevant vacation rentals.

**Consider:**
- Location synonyms and nearby areas
- Property type variations
- Amenity-focused searches
- Experience-based searches
- Local attractions and landmarks

**Format:**
Return as JSON array of suggestions:
["suggestion1", "suggestion2", "suggestion3"]

Return ONLY the JSON array, no additional text.`;

      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }],
      });

      const responseText = message.content[0].type === 'text' 
        ? message.content[0].text 
        : '[]';

      try {
        const suggestions = JSON.parse(responseText);
        return { success: true, data: suggestions };
      } catch (parseError) {
        return { 
          success: true, 
          data: [
            `${query} vacation rental`,
            `${query} short term rental`,
            `Near ${query} attractions`
          ]
        };
      }

    } catch (error) {
      return { 
        success: false, 
        error: `Failed to enhance search: ${error}` 
      };
    }
  }
}

// Trip Planning Data Types
export interface TripPlanRequest {
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: { min: number; max: number };
  interests: string[];
  accommodationType: 'any' | 'house' | 'apartment' | 'condo';
}

export interface DayPlan {
  day: number;
  date: string;
  theme: string;
  morning: string;
  afternoon: string;
  evening: string;
  meals: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
  };
  tips: string[];
}

export interface AccommodationSuggestion {
  type: string;
  area: string;
  priceRange: string;
  features: string[];
  platformListings?: any[];
}

export interface TripPlan {
  overview: string;
  bestTimeToVisit: string;
  duration: number;
  itinerary: DayPlan[];
  accommodations: AccommodationSuggestion[];
  restaurants: Array<{
    name: string;
    type: string;
    priceRange: string;
    specialties: string[];
  }>;
  activities: Array<{
    name: string;
    category: string;
    duration: string;
    cost: string;
  }>;
  transportation: {
    gettingThere: string[];
    gettingAround: string[];
  };
  budget: {
    accommodation: { min: number; max: number };
    food: { min: number; max: number };
    activities: { min: number; max: number };
    transportation: { min: number; max: number };
    total: { min: number; max: number };
  };
  localTips: string[];
  weather: string;
}

export class TripPlanningAgent {
  async generateTripPlan(request: TripPlanRequest): Promise<ClaudeCodeAgentResponse> {
    try {
      const duration = this.calculateDuration(request.startDate, request.endDate);
      const interestsList = request.interests.join(', ');

      const prompt = `You are an expert travel planner with access to comprehensive tools for trip planning.

**Available Tools & Permissions:**
- file_read/write: Save trip plans and load destination data
- database_query: Access platform accommodations and local data
- web_search: Get real-time weather, events, and attraction info
- geolocation_search: Find precise location data and nearby points of interest
- api_calls: Access weather, maps, and travel APIs

**Trip Details:**
- Destination: ${request.destination}
- Dates: ${request.startDate} to ${request.endDate} (${duration} days)
- Travelers: ${request.travelers} people
- Budget: $${request.budget.min}-$${request.budget.max} per person
- Interests: ${interestsList}
- Accommodation Type: ${request.accommodationType}

**Your Tasks:**
1. **Automatically save** this trip plan to files for future reference
2. **Query database** for available platform accommodations matching criteria
3. **Search web** for current events, weather, and seasonal attractions
4. **Generate comprehensive itinerary** with real-time data
5. **Create budget analysis** with current pricing data
6. **Save alternative plans** for user customization

**Enhanced Requirements:**
- Use geolocation_search to find exact coordinates and local insights
- Query platform database for accommodation matches
- Include real-time weather data via weather APIs
- Save trip plan variations to files automatically
- Generate local business recommendations via search APIs
- Create downloadable itinerary files (PDF/JSON)

**Tool Configuration:**
- Auto-save trip plans to: ./app/generated/trip-plans/
- Database access: full read access to listings, cities, amenities
- API access: weather, maps, local business data
- File operations: create shareable trip documents

**Output Format:**
Return comprehensive JSON with all trip plan data plus:
{
  "tripPlan": { /* detailed plan */ },
  "savedFiles": ["path1", "path2"],
  "accommodationMatches": [/* platform listings */],
  "realTimeData": {
    "weather": "current forecast",
    "events": ["local events"],
    "pricing": "current market rates"
  }
}`;

      const message = await tripPlanningClient.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 3000,
        messages: [{ role: 'user', content: prompt }],
      });

      const responseText = message.content[0].type === 'text' 
        ? message.content[0].text 
        : '{}';

      try {
        const parsedResponse = JSON.parse(responseText);
        
        // Auto-save trip plan functionality
        try {
          const fs = require('fs');
          const path = require('path');
          const saveDir = './app/generated/trip-plans';
          
          if (!fs.existsSync(saveDir)) {
            fs.mkdirSync(saveDir, { recursive: true });
          }
          
          const filename = `${Date.now()}-${request.destination.replace(/[^a-zA-Z0-9]/g, '-')}-${request.startDate}-${request.endDate}.json`;
          const filepath = path.join(saveDir, filename);
          
          const tripPlanWithMetadata = {
            request: request,
            generatedAt: new Date().toISOString(),
            tripPlan: parsedResponse.tripPlan || parsedResponse,
            savedFiles: [filepath],
            realTimeData: {
              weather: "Enhanced weather data would be available with Claude Code SDK",
              events: ["Local events would be fetched in real-time"],
              pricing: "Current market rates would be analyzed"
            }
          };
          
          fs.writeFileSync(filepath, JSON.stringify(tripPlanWithMetadata, null, 2));
          console.log(`Auto-saved trip plan to: ${filepath}`);
          
          // Enhance with platform accommodation matches (existing functionality)
          const enhancedPlan = await this.enhanceWithPlatformListings(
            parsedResponse.tripPlan || parsedResponse, 
            request
          );
          
          return {
            success: true,
            data: {
              ...tripPlanWithMetadata,
              tripPlan: enhancedPlan
            },
            metadata: {
              tokensUsed: message.usage?.total_tokens || 0,
              processingTime: Date.now(),
              toolsUsed: ['text_generation', 'file_write', 'database_query'],
              cacheHit: false
            }
          };
        } catch (saveError) {
          console.warn('Could not auto-save trip plan:', saveError);
          // Still return the trip plan even if saving fails
          const enhancedPlan = await this.enhanceWithPlatformListings(
            parsedResponse.tripPlan || parsedResponse, 
            request
          );
          
          return {
            success: true,
            data: enhancedPlan,
            metadata: {
              tokensUsed: message.usage?.total_tokens || 0,
              processingTime: Date.now(),
              toolsUsed: ['text_generation', 'database_query']
            }
          };
        }
      } catch (parseError) {
        return { 
          success: false,
          error: `Failed to parse trip plan: ${parseError}. Raw response: ${responseText.slice(0, 500)}...`,
          metadata: {
            tokensUsed: message.usage?.total_tokens || 0,
            processingTime: Date.now(),
            toolsUsed: ['text_generation']
          }
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to generate trip plan with Claude Code SDK: ${error}`,
        metadata: {
          tokensUsed: 0,
          processingTime: 0,
          toolsUsed: []
        }
      };
    }
  }

  private calculateDuration(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private async enhanceWithPlatformListings(tripPlan: TripPlan, request: TripPlanRequest): Promise<TripPlan> {
    try {
      // Search for matching accommodations in the destination
      const citySlug = request.destination.toLowerCase().replace(/[^a-z0-9]/g, '-');
      
      const matchingListings = await prisma.listing.findMany({
        where: {
          status: 'ACTIVE',
          city: {
            slug: { contains: citySlug }
          },
          sleeps: { gte: request.travelers },
          ...(request.accommodationType !== 'any' && {
            propertyType: request.accommodationType
          })
        },
        include: {
          city: true,
          photos: { take: 1, orderBy: { order: 'asc' } },
          amenities: { include: { amenity: true } }
        },
        take: 6,
        orderBy: [
          { featured: 'desc' },
          { createdAt: 'desc' }
        ]
      });

      // Add platform listings to accommodation suggestions
      if (matchingListings.length > 0 && tripPlan.accommodations) {
        tripPlan.accommodations = tripPlan.accommodations.map(acc => ({
          ...acc,
          platformListings: matchingListings.map(listing => ({
            id: listing.id,
            title: listing.title,
            slug: listing.slug,
            priceMin: listing.priceMin,
            priceMax: listing.priceMax,
            bedrooms: listing.bedrooms,
            bathrooms: listing.bathrooms,
            sleeps: listing.sleeps,
            city: listing.city.name,
            photo: listing.photos[0]?.url,
            amenities: listing.amenities.map(a => a.amenity.name).slice(0, 4)
          }))
        }));
      }

      return tripPlan;
    } catch (error) {
      // Return original plan if enhancement fails
      console.error('Failed to enhance with platform listings:', error);
      return tripPlan;
    }
  }

  async enhanceItinerary(plan: TripPlan, userFeedback: string): Promise<AgentResponse> {
    try {
      const prompt = `You are a travel planning assistant. The user has feedback about their trip plan. Update the itinerary based on their preferences:

**Current Trip Overview:**
${plan.overview}

**User Feedback:**
"${userFeedback}"

**Task:**
Provide specific recommendations to address their feedback. Focus on:
- Alternative activities or attractions
- Different restaurant suggestions
- Modified daily schedule
- Budget adjustments
- Additional local tips

**Format:**
Return as JSON with this structure:
{
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "modifiedDays": [{"day": 1, "changes": "description of changes"}],
  "alternativeActivities": [{"activity": "name", "reason": "why this fits better"}],
  "additionalTips": ["tip1", "tip2"]
}

Return ONLY the JSON object.`;

      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 800,
        messages: [{ role: 'user', content: prompt }],
      });

      const responseText = message.content[0].type === 'text' 
        ? message.content[0].text 
        : '{}';

      try {
        const enhancements = JSON.parse(responseText);
        return { success: true, data: enhancements };
      } catch (parseError) {
        return { 
          success: false,
          error: `Failed to parse enhancement suggestions: ${parseError}`
        };
      }

    } catch (error) {
      return { 
        success: false, 
        error: `Failed to enhance itinerary: ${error}` 
      };
    }
  }
}