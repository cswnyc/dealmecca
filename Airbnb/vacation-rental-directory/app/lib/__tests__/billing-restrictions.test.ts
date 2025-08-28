import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import {
  getTierLimits,
  checkListingLimit,
  checkAIFeatureAccess,
  checkAnalyticsAccess,
  checkPhotoLimit,
  requireMinimumTier,
  BillingRestrictionError,
  isBillingRestrictionError,
} from '../billing-restrictions';
import { getActiveSubscription } from '../subscriptions';

// Mock the subscriptions module
jest.mock('../subscriptions', () => ({
  getActiveSubscription: jest.fn(),
}));

const mockGetActiveSubscription = getActiveSubscription as jest.MockedFunction<typeof getActiveSubscription>;

describe('Billing Restrictions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTierLimits', () => {
    test('returns correct limits for Bronze tier', () => {
      const limits = getTierLimits('BRONZE');
      expect(limits.maxListings).toBe(3);
      expect(limits.canUseAIFeatures).toBe(false);
      expect(limits.canUseAdvancedAnalytics).toBe(false);
      expect(limits.supportLevel).toBe('basic');
    });

    test('returns correct limits for Silver tier', () => {
      const limits = getTierLimits('SILVER');
      expect(limits.maxListings).toBe(10);
      expect(limits.canUseAIFeatures).toBe(false);
      expect(limits.canUseAdvancedAnalytics).toBe(true);
      expect(limits.supportLevel).toBe('priority');
    });

    test('returns correct limits for Gold tier', () => {
      const limits = getTierLimits('GOLD');
      expect(limits.maxListings).toBe(25);
      expect(limits.canUseAIFeatures).toBe(true);
      expect(limits.canUseAdvancedAnalytics).toBe(true);
    });

    test('returns correct limits for Platinum tier', () => {
      const limits = getTierLimits('PLATINUM');
      expect(limits.maxListings).toBe(-1); // unlimited
      expect(limits.canUseAIFeatures).toBe(true);
      expect(limits.canUseCustomBranding).toBe(true);
      expect(limits.supportLevel).toBe('24/7');
    });

    test('returns restricted limits for no subscription', () => {
      const limits = getTierLimits(null);
      expect(limits.maxListings).toBe(0);
      expect(limits.canUseAIFeatures).toBe(false);
      expect(limits.maxInquiriesPerMonth).toBe(5);
    });
  });

  describe('checkListingLimit', () => {
    test('allows listing creation within Bronze limit', async () => {
      mockGetActiveSubscription.mockResolvedValue({
        id: 'sub1',
        tier: 'BRONZE',
        status: 'active',
        start: null,
        end: null,
        stripeSubscriptionId: null,
        stripeCustomerId: null,
      });

      await expect(checkListingLimit('owner1', 2)).resolves.not.toThrow();
    });

    test('throws error when Bronze listing limit exceeded', async () => {
      mockGetActiveSubscription.mockResolvedValue({
        id: 'sub1',
        tier: 'BRONZE',
        status: 'active',
        start: null,
        end: null,
        stripeSubscriptionId: null,
        stripeCustomerId: null,
      });

      await expect(checkListingLimit('owner1', 3)).rejects.toThrow(BillingRestrictionError);
    });

    test('allows unlimited listings for Platinum tier', async () => {
      mockGetActiveSubscription.mockResolvedValue({
        id: 'sub1',
        tier: 'PLATINUM',
        status: 'active',
        start: null,
        end: null,
        stripeSubscriptionId: null,
        stripeCustomerId: null,
      });

      await expect(checkListingLimit('owner1', 100)).resolves.not.toThrow();
    });

    test('blocks listing creation without subscription', async () => {
      mockGetActiveSubscription.mockResolvedValue(null);

      await expect(checkListingLimit('owner1', 0)).rejects.toThrow(BillingRestrictionError);
    });
  });

  describe('checkAIFeatureAccess', () => {
    test('allows AI features for Gold tier', async () => {
      mockGetActiveSubscription.mockResolvedValue({
        id: 'sub1',
        tier: 'GOLD',
        status: 'active',
        start: null,
        end: null,
        stripeSubscriptionId: null,
        stripeCustomerId: null,
      });

      await expect(checkAIFeatureAccess('owner1', 'Property descriptions')).resolves.not.toThrow();
    });

    test('blocks AI features for Bronze tier', async () => {
      mockGetActiveSubscription.mockResolvedValue({
        id: 'sub1',
        tier: 'BRONZE',
        status: 'active',
        start: null,
        end: null,
        stripeSubscriptionId: null,
        stripeCustomerId: null,
      });

      await expect(checkAIFeatureAccess('owner1', 'Property descriptions'))
        .rejects.toThrow(BillingRestrictionError);
    });
  });

  describe('checkAnalyticsAccess', () => {
    test('allows analytics for Silver tier and above', async () => {
      mockGetActiveSubscription.mockResolvedValue({
        id: 'sub1',
        tier: 'SILVER',
        status: 'active',
        start: null,
        end: null,
        stripeSubscriptionId: null,
        stripeCustomerId: null,
      });

      await expect(checkAnalyticsAccess('owner1')).resolves.not.toThrow();
    });

    test('blocks analytics for Bronze tier', async () => {
      mockGetActiveSubscription.mockResolvedValue({
        id: 'sub1',
        tier: 'BRONZE',
        status: 'active',
        start: null,
        end: null,
        stripeSubscriptionId: null,
        stripeCustomerId: null,
      });

      await expect(checkAnalyticsAccess('owner1')).rejects.toThrow(BillingRestrictionError);
    });
  });

  describe('requireMinimumTier', () => {
    test('allows access for exact tier match', async () => {
      mockGetActiveSubscription.mockResolvedValue({
        id: 'sub1',
        tier: 'GOLD',
        status: 'active',
        start: null,
        end: null,
        stripeSubscriptionId: null,
        stripeCustomerId: null,
      });

      await expect(requireMinimumTier('owner1', 'GOLD', 'Custom feature'))
        .resolves.not.toThrow();
    });

    test('allows access for higher tier', async () => {
      mockGetActiveSubscription.mockResolvedValue({
        id: 'sub1',
        tier: 'PLATINUM',
        status: 'active',
        start: null,
        end: null,
        stripeSubscriptionId: null,
        stripeCustomerId: null,
      });

      await expect(requireMinimumTier('owner1', 'GOLD', 'Custom feature'))
        .resolves.not.toThrow();
    });

    test('blocks access for lower tier', async () => {
      mockGetActiveSubscription.mockResolvedValue({
        id: 'sub1',
        tier: 'BRONZE',
        status: 'active',
        start: null,
        end: null,
        stripeSubscriptionId: null,
        stripeCustomerId: null,
      });

      await expect(requireMinimumTier('owner1', 'GOLD', 'Custom feature'))
        .rejects.toThrow(BillingRestrictionError);
    });
  });

  describe('BillingRestrictionError', () => {
    test('creates error with correct properties', () => {
      const error = new BillingRestrictionError(
        'Test message',
        'GOLD',
        'BRONZE',
        'Test feature'
      );

      expect(error.message).toBe('Test message');
      expect(error.requiredTier).toBe('GOLD');
      expect(error.currentTier).toBe('BRONZE');
      expect(error.feature).toBe('Test feature');
      expect(error.name).toBe('BillingRestrictionError');
    });

    test('isBillingRestrictionError identifies correct error type', () => {
      const billingError = new BillingRestrictionError('Test', 'GOLD', 'BRONZE', 'Feature');
      const regularError = new Error('Regular error');

      expect(isBillingRestrictionError(billingError)).toBe(true);
      expect(isBillingRestrictionError(regularError)).toBe(false);
      expect(isBillingRestrictionError('string')).toBe(false);
      expect(isBillingRestrictionError(null)).toBe(false);
    });
  });
});