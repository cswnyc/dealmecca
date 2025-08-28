'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { updateListingStatus } from '../../lib/listing-guards';
import { ListingStatus } from '@prisma/client';

// Mock owner ID for demo - in real app, get from session
const DEMO_OWNER_ID = 'demo-owner-1';

const updateStatusSchema = z.object({
  listingId: z.string(),
  status: z.enum(['DRAFT', 'PENDING', 'ACTIVE', 'SUSPENDED']),
});

export async function updateListingStatusAction(
  listingId: string,
  status: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const validated = updateStatusSchema.parse({ listingId, status });
    
    const result = await updateListingStatus(
      DEMO_OWNER_ID,
      validated.listingId,
      validated.status as ListingStatus
    );
    
    if (result.success) {
      revalidatePath('/owner/listings');
    }
    
    return result;
  } catch (error) {
    console.error('Failed to update listing status:', error);
    return { 
      success: false, 
      error: 'Failed to update listing status. Please try again.' 
    };
  }
}