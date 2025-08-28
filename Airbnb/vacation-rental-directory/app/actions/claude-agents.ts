'use server';

import { prisma } from '../lib/db';
import { 
  PropertyDescriptionAgent,
  InquiryResponseAgent, 
  PricingOptimizationAgent,
  SearchEnhancementAgent,
  TripPlanningAgent,
  TripPlanRequest,
  ClaudeCodeAgentResponse
} from '../lib/claude-agents';
import { validateClaudeCodeConfig } from '../lib/claude-code-config';

export async function generatePropertyDescription(listingId: string) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return { 
        success: false, 
        error: 'ANTHROPIC_API_KEY not configured' 
      };
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        city: true,
        neighborhood: true,
        amenities: {
          include: { amenity: true }
        }
      }
    });

    if (!listing) {
      return { success: false, error: 'Listing not found' };
    }

    const agent = new PropertyDescriptionAgent();
    const descriptionResult = await agent.generateDescription(listing);
    
    if (!descriptionResult.success) {
      return descriptionResult;
    }

    const summaryResult = await agent.generateSummary(descriptionResult.data);

    // Update the listing with AI-generated content
    await prisma.listing.update({
      where: { id: listingId },
      data: {
        description: descriptionResult.data,
        summary: summaryResult.success ? summaryResult.data : undefined,
      }
    });

    return {
      success: true,
      data: {
        description: descriptionResult.data,
        summary: summaryResult.data
      }
    };

  } catch (error) {
    return { 
      success: false, 
      error: `Failed to generate description: ${error}` 
    };
  }
}

export async function suggestInquiryResponse(inquiryId: string) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return { 
        success: false, 
        error: 'ANTHROPIC_API_KEY not configured' 
      };
    }

    const inquiry = await prisma.inquiry.findUnique({
      where: { id: inquiryId },
      include: {
        listing: {
          include: { city: true }
        }
      }
    });

    if (!inquiry) {
      return { success: false, error: 'Inquiry not found' };
    }

    const agent = new InquiryResponseAgent();
    return await agent.suggestResponse({
      guestName: inquiry.guestName || undefined,
      guestEmail: inquiry.guestEmail,
      message: inquiry.message,
      listing: {
        title: inquiry.listing.title,
        city: inquiry.listing.city,
        priceMin: inquiry.listing.priceMin || undefined,
        priceMax: inquiry.listing.priceMax || undefined,
      }
    });

  } catch (error) {
    return { 
      success: false, 
      error: `Failed to generate response suggestion: ${error}` 
    };
  }
}

export async function optimizeListingPricing(listingId: string) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return { 
        success: false, 
        error: 'ANTHROPIC_API_KEY not configured' 
      };
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        city: true,
        amenities: {
          include: { amenity: true }
        }
      }
    });

    if (!listing) {
      return { success: false, error: 'Listing not found' };
    }

    const agent = new PricingOptimizationAgent();
    return await agent.suggestPricing({
      bedrooms: listing.bedrooms,
      bathrooms: listing.bathrooms,
      sleeps: listing.sleeps || 0,
      city: listing.city,
      amenities: listing.amenities,
      tier: listing.tier || 'BRONZE'
    });

  } catch (error) {
    return { 
      success: false, 
      error: `Failed to optimize pricing: ${error}` 
    };
  }
}

export async function enhanceSearchQuery(query: string, context?: string) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return { 
        success: false, 
        error: 'ANTHROPIC_API_KEY not configured' 
      };
    }

    const agent = new SearchEnhancementAgent();
    return await agent.enhanceSearchQuery(query, context);

  } catch (error) {
    return { 
      success: false, 
      error: `Failed to enhance search: ${error}` 
    };
  }
}

// Bulk operation for property owners to enhance all their listings
export async function generateAllPropertyDescriptions(ownerId: string) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return { 
        success: false, 
        error: 'ANTHROPIC_API_KEY not configured' 
      };
    }

    const listings = await prisma.listing.findMany({
      where: { ownerId },
      select: { id: true, title: true }
    });

    const results = [];
    const agent = new PropertyDescriptionAgent();

    for (const listing of listings) {
      try {
        const result = await generatePropertyDescription(listing.id);
        results.push({
          listingId: listing.id,
          title: listing.title,
          success: result.success,
          error: result.error
        });
        
        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        results.push({
          listingId: listing.id,
          title: listing.title,
          success: false,
          error: String(error)
        });
      }
    }

    return { success: true, data: results };

  } catch (error) {
    return { 
      success: false, 
      error: `Failed to generate descriptions: ${error}` 
    };
  }
}

export async function generateTripPlan(request: TripPlanRequest): Promise<ClaudeCodeAgentResponse> {
  try {
    // Validate Claude Code SDK configuration
    if (!validateClaudeCodeConfig()) {
      return { 
        success: false, 
        error: 'Claude Code SDK not properly configured - check environment variables',
        metadata: {
          tokensUsed: 0,
          processingTime: 0,
          toolsUsed: []
        }
      };
    }

    // Validate request
    if (!request.destination || !request.startDate || !request.endDate) {
      return {
        success: false,
        error: 'Missing required fields: destination, startDate, endDate',
        metadata: {
          tokensUsed: 0,
          processingTime: 0,
          toolsUsed: []
        }
      };
    }

    // Check if dates are valid
    const startDate = new Date(request.startDate);
    const endDate = new Date(request.endDate);
    
    if (startDate >= endDate) {
      return {
        success: false,
        error: 'End date must be after start date',
        metadata: {
          tokensUsed: 0,
          processingTime: 0,
          toolsUsed: []
        }
      };
    }

    if (startDate < new Date()) {
      return {
        success: false,
        error: 'Start date cannot be in the past',
        metadata: {
          tokensUsed: 0,
          processingTime: 0,
          toolsUsed: []
        }
      };
    }

    // Create directories for file operations
    try {
      const fs = require('fs');
      const path = './app/generated/trip-plans';
      if (!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true });
      }
    } catch (dirError) {
      console.warn('Could not create trip plans directory:', dirError);
    }

    const agent = new TripPlanningAgent();
    const result = await agent.generateTripPlan(request);

    // Log usage statistics for monitoring
    if (result.success && result.metadata) {
      console.log(`Trip plan generated: ${result.metadata.tokensUsed} tokens, ${result.metadata.processingTime}ms, tools: ${result.metadata.toolsUsed.join(', ')}`);
    }

    return result;

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

export async function enhanceItinerary(planData: any, feedback: string) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return { 
        success: false, 
        error: 'ANTHROPIC_API_KEY not configured' 
      };
    }

    if (!feedback || feedback.trim().length === 0) {
      return {
        success: false,
        error: 'Feedback is required to enhance the itinerary'
      };
    }

    const agent = new TripPlanningAgent();
    const result = await agent.enhanceItinerary(planData, feedback);

    return result;

  } catch (error) {
    return { 
      success: false, 
      error: `Failed to enhance itinerary: ${error}` 
    };
  }
}