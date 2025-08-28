'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { ListingStatus } from '@prisma/client';
import { checkListingLimit, isBillingRestrictionError } from '../../lib/billing-restrictions';
import { prisma } from '../../lib/db';

// Mock owner ID for demo - in real app, get from session
const DEMO_OWNER_ID = 'demo-owner-1';

const updateStatusSchema = z.object({
  listingId: z.string(),
  status: z.enum(['DRAFT', 'PENDING', 'ACTIVE', 'SUSPENDED']),
});

export async function updateListingStatusAction(
  listingId: string,
  status: string
): Promise<{ success: boolean; error?: string; needsUpgrade?: boolean; requiredTier?: string }> {
  try {
    const validated = updateStatusSchema.parse({ listingId, status });
    
    // If activating a listing, check billing limits
    if (validated.status === 'ACTIVE') {
      const activeListings = await prisma.listing.count({
        where: {
          ownerId: DEMO_OWNER_ID,
          status: 'ACTIVE',
          id: { not: validated.listingId }, // Exclude the current listing being activated
        },
      });
      
      await checkListingLimit(DEMO_OWNER_ID, activeListings);
    }
    
    // Update the listing status
    await prisma.listing.update({
      where: { id: validated.listingId },
      data: { status: validated.status as ListingStatus },
    });
    
    revalidatePath('/owner/listings');
    
    return { success: true };
  } catch (error) {
    console.error('Failed to update listing status:', error);
    
    if (isBillingRestrictionError(error)) {
      return { 
        success: false, 
        error: error.message,
        needsUpgrade: true,
        requiredTier: error.requiredTier,
      };
    }
    
    return { 
      success: false, 
      error: 'Failed to update listing status. Please try again.' 
    };
  }
}

const createListingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  bedrooms: z.number().min(0),
  bathrooms: z.number().min(0),
  sleeps: z.number().min(1),
  priceMin: z.number().min(0),
  priceMax: z.number().min(0),
});

export async function createListingAction(
  formData: FormData
): Promise<{ success: boolean; error?: string; listingId?: string; needsUpgrade?: boolean; requiredTier?: string }> {
  try {
    // Check current listing count before creating
    const currentListingCount = await prisma.listing.count({
      where: {
        ownerId: DEMO_OWNER_ID,
      },
    });
    
    await checkListingLimit(DEMO_OWNER_ID, currentListingCount);
    
    // Validate form data
    const validated = createListingSchema.parse({
      title: formData.get('title'),
      description: formData.get('description'),
      bedrooms: Number(formData.get('bedrooms')),
      bathrooms: Number(formData.get('bathrooms')),
      sleeps: Number(formData.get('sleeps')),
      priceMin: Number(formData.get('priceMin')),
      priceMax: Number(formData.get('priceMax')),
    });
    
    // Create the listing
    const listing = await prisma.listing.create({
      data: {
        ...validated,
        ownerId: DEMO_OWNER_ID,
        cityId: 'default-city', // Replace with actual city selection
        status: 'DRAFT',
        slug: `${validated.title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      },
    });
    
    revalidatePath('/owner/listings');
    
    return { success: true, listingId: listing.id };
  } catch (error) {
    console.error('Failed to create listing:', error);
    
    if (isBillingRestrictionError(error)) {
      return { 
        success: false, 
        error: error.message,
        needsUpgrade: true,
        requiredTier: error.requiredTier,
      };
    }
    
    return { 
      success: false, 
      error: 'Failed to create listing. Please try again.' 
    };
  }
}