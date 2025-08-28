import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { createCheckoutSession, createPortalSession } from '../actions';
import { getStripe, getPriceIdForTier } from '../../../lib/stripe';
import { prisma } from '../../../lib/db';

// Mock modules
jest.mock('../../../lib/stripe', () => ({
  getStripe: jest.fn(),
  getPriceIdForTier: jest.fn(),
}));

jest.mock('../../../lib/db', () => ({
  prisma: {
    ownerProfile: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

const mockGetStripe = getStripe as jest.MockedFunction<typeof getStripe>;
const mockGetPriceIdForTier = getPriceIdForTier as jest.MockedFunction<typeof getPriceIdForTier>;

describe('Billing Actions', () => {
  let mockStripe: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockStripe = {
      customers: {
        create: jest.fn(),
      },
      checkout: {
        sessions: {
          create: jest.fn(),
        },
      },
      billingPortal: {
        sessions: {
          create: jest.fn(),
        },
      },
    };

    mockGetStripe.mockReturnValue(mockStripe);
  });

  describe('createCheckoutSession', () => {
    test('creates checkout session for new customer', async () => {
      // Mock owner profile without Stripe customer
      (prisma.ownerProfile.findUnique as jest.Mock).mockResolvedValue({
        id: 'owner1',
        stripeCustomerId: null,
        businessName: 'Test Business',
        user: {
          email: 'test@example.com',
          name: 'Test User',
        },
      });

      mockGetPriceIdForTier.mockResolvedValue('price_123');
      
      mockStripe.customers.create.mockResolvedValue({
        id: 'cus_123',
      });

      mockStripe.checkout.sessions.create.mockResolvedValue({
        url: 'https://checkout.stripe.com/session',
      });

      await expect(createCheckoutSession('GOLD')).rejects.toThrow(); // Will throw due to redirect

      expect(mockStripe.customers.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'Test User',
        metadata: {
          ownerId: 'owner1',
        },
      });

      expect(prisma.ownerProfile.update).toHaveBeenCalledWith({
        where: { id: 'demo-owner-1' }, // Note: using demo ID
        data: { stripeCustomerId: 'cus_123' },
      });

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith({
        customer: 'cus_123',
        payment_method_types: ['card'],
        line_items: [
          {
            price: 'price_123',
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: expect.stringContaining('/owner/billing/success'),
        cancel_url: expect.stringContaining('/owner/billing'),
        metadata: {
          ownerId: 'demo-owner-1',
          tier: 'GOLD',
        },
        subscription_data: {
          metadata: {
            ownerId: 'demo-owner-1',
            tier: 'GOLD',
          },
        },
      });
    });

    test('uses existing Stripe customer', async () => {
      // Mock owner profile with existing Stripe customer
      (prisma.ownerProfile.findUnique as jest.Mock).mockResolvedValue({
        id: 'owner1',
        stripeCustomerId: 'cus_existing',
        businessName: 'Test Business',
        user: {
          email: 'test@example.com',
          name: 'Test User',
        },
      });

      mockGetPriceIdForTier.mockResolvedValue('price_123');
      
      mockStripe.checkout.sessions.create.mockResolvedValue({
        url: 'https://checkout.stripe.com/session',
      });

      await expect(createCheckoutSession('SILVER')).rejects.toThrow(); // Will throw due to redirect

      expect(mockStripe.customers.create).not.toHaveBeenCalled();
      expect(prisma.ownerProfile.update).not.toHaveBeenCalled();

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: 'cus_existing',
        })
      );
    });

    test('throws error for invalid tier', async () => {
      await expect(createCheckoutSession('INVALID_TIER' as any))
        .rejects.toThrow();
    });

    test('throws error when owner profile not found', async () => {
      (prisma.ownerProfile.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(createCheckoutSession('BRONZE'))
        .rejects.toThrow('Owner profile not found');
    });

    test('throws error when checkout session creation fails', async () => {
      (prisma.ownerProfile.findUnique as jest.Mock).mockResolvedValue({
        id: 'owner1',
        stripeCustomerId: 'cus_123',
        user: { email: 'test@example.com' },
      });

      mockGetPriceIdForTier.mockResolvedValue('price_123');
      mockStripe.checkout.sessions.create.mockResolvedValue({ url: null });

      await expect(createCheckoutSession('BRONZE'))
        .rejects.toThrow('Failed to create checkout session');
    });
  });

  describe('createPortalSession', () => {
    test('creates portal session for existing customer', async () => {
      (prisma.ownerProfile.findUnique as jest.Mock).mockResolvedValue({
        id: 'owner1',
        stripeCustomerId: 'cus_123',
      });

      mockStripe.billingPortal.sessions.create.mockResolvedValue({
        url: 'https://billing.stripe.com/session',
      });

      await expect(createPortalSession()).rejects.toThrow(); // Will throw due to redirect

      expect(mockStripe.billingPortal.sessions.create).toHaveBeenCalledWith({
        customer: 'cus_123',
        return_url: expect.stringContaining('/owner/billing'),
      });
    });

    test('throws error when no Stripe customer found', async () => {
      (prisma.ownerProfile.findUnique as jest.Mock).mockResolvedValue({
        id: 'owner1',
        stripeCustomerId: null,
      });

      await expect(createPortalSession())
        .rejects.toThrow('No Stripe customer found. Please subscribe first.');
    });

    test('throws error when owner profile not found', async () => {
      (prisma.ownerProfile.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(createPortalSession())
        .rejects.toThrow('No Stripe customer found. Please subscribe first.');
    });
  });
});