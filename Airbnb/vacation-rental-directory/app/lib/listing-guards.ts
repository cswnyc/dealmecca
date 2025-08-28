'use server';

import { requireActiveSub, getActiveSubscription } from './subscriptions';
import { prisma } from './db';
import { ListingStatus } from '@prisma/client';
import { getTierLimits } from './billing-restrictions';

export class ListingGateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ListingGateError';
  }
}

export async function requireActiveSubForListing(ownerId: string, listingId?: string): Promise<void> {
  try {
    await requireActiveSub(ownerId);
  } catch (error) {
    throw new ListingGateError('Active subscription required to activate listings. Please subscribe to continue.');
  }
}

export async function canActivateListing(ownerId: string, listingId: string): Promise<{ canActivate: boolean; reason?: string }> {
  try {
    await requireActiveSub(ownerId);
    return { canActivate: true };
  } catch (error) {
    return { 
      canActivate: false, 
      reason: 'Active subscription required to activate listings. Please subscribe to continue.' 
    };
  }
}

export async function updateListingStatus(
  ownerId: string, 
  listingId: string, 
  status: ListingStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    // Only require subscription for ACTIVE status
    if (status === 'ACTIVE') {
      await requireActiveSubForListing(ownerId, listingId);
    }
    
    // Update the listing status
    await prisma.listing.update({
      where: { 
        id: listingId,
        ownerId // Ensure owner can only update their own listings
      },
      data: { status }
    });
    
    return { success: true };
  } catch (error) {
    console.error('Failed to update listing status:', error);
    
    if (error instanceof ListingGateError) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Failed to update listing status. Please try again.' };
  }
}

export async function getOwnerListingLimits(ownerId: string): Promise<{
  maxListings: number;
  currentListings: number;
  canCreateMore: boolean;
  hasActiveSub: boolean;
}> {
  try {
    const [subscription, currentListings] = await Promise.all([
      getActiveSubscription(ownerId),
      prisma.listing.count({ where: { ownerId } })
    ]);
    
    const limits = getTierLimits(subscription?.tier || null);
    
    return {
      maxListings: limits.maxListings,
      currentListings,
      canCreateMore: limits.maxListings === -1 || currentListings < limits.maxListings,
      hasActiveSub: !!subscription
    };
  } catch (error) {
    const currentListings = await prisma.listing.count({
      where: { ownerId }
    });
    
    return {
      maxListings: 0,
      currentListings,
      canCreateMore: false,
      hasActiveSub: false
    };
  }
}