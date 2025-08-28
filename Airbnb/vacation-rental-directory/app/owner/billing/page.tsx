import { Suspense } from 'react';
import { prisma } from '../../lib/db';
import { getActiveSubscription, getTierDisplayName, getTierFeatures, getTierPrice } from '../../lib/subscriptions';
import { createCheckoutSession, createPortalSession } from './actions';
import { Tier } from '@prisma/client';

// Mock owner ID for demo - in real app, get from session
const DEMO_OWNER_ID = 'demo-owner-1';

async function BillingContent() {
  const activeSubscription = await getActiveSubscription(DEMO_OWNER_ID);
  const ownerProfile = await prisma.ownerProfile.findUnique({
    where: { id: DEMO_OWNER_ID },
    include: { user: true },
  });

  if (!ownerProfile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Owner profile not found.</p>
        </div>
      </div>
    );
  }

  const tiers: { tier: Tier; popular?: boolean }[] = [
    { tier: 'BRONZE' },
    { tier: 'SILVER', popular: true },
    { tier: 'GOLD' },
    { tier: 'PLATINUM' },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        <p className="text-gray-600 mt-2">Manage your plan and billing preferences</p>
      </header>

      {/* No Active Subscription Warning */}
      {!activeSubscription && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-yellow-800">Subscription Required</h3>
              <p className="text-yellow-700 mt-1">
                Your listings are currently limited until you subscribe to a plan. Choose a plan below to activate your listings and unlock premium features.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Current Subscription Status */}
      {activeSubscription && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-green-800">
                Active Subscription: {getTierDisplayName(activeSubscription.tier)}
              </h3>
              <p className="text-green-700 mt-1">
                Status: <span className="capitalize">{activeSubscription.status}</span>
              </p>
              <p className="text-sm text-green-600 mt-2">
                {activeSubscription.start && (
                  <>Started: {activeSubscription.start.toLocaleDateString()}</>
                )}
                {activeSubscription.end && (
                  <> • Ends: {activeSubscription.end.toLocaleDateString()}</>
                )}
              </p>
            </div>
            <div className="flex space-x-3">
              <form action={createPortalSession}>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  Manage Billing
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Plans */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map(({ tier, popular }) => {
            const pricing = getTierPrice(tier);
            const features = getTierFeatures(tier);
            const isCurrentTier = activeSubscription?.tier === tier;
            
            return (
              <div
                key={tier}
                className={`relative border rounded-lg p-6 ${
                  popular
                    ? 'border-blue-500 bg-blue-50'
                    : isCurrentTier
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-3 py-1 text-sm rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                {isCurrentTier && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-600 text-white px-3 py-1 text-sm rounded-full">
                      Current Plan
                    </span>
                  </div>
                )}
                
                <div className="text-center space-y-4">
                  <h3 className="text-xl font-semibold">{getTierDisplayName(tier)}</h3>
                  
                  <div>
                    <div className="text-3xl font-bold">${pricing.annual}</div>
                    <div className="text-sm text-gray-600">per year</div>
                    <div className="text-xs text-gray-500">
                      Save ${(pricing.monthly * 12) - pricing.annual}
                    </div>
                  </div>

                  <ul className="space-y-2 text-sm text-left">
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {!isCurrentTier && (
                    <form action={createCheckoutSession.bind(null, tier)}>
                      <button
                        type="submit"
                        className={`w-full py-2 px-4 rounded font-medium ${
                          popular
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-600 text-white hover:bg-gray-700'
                        }`}
                      >
                        {activeSubscription ? 'Change Plan' : 'Subscribe'}
                      </button>
                    </form>
                  )}
                  
                  {isCurrentTier && (
                    <button
                      disabled
                      className="w-full py-2 px-4 rounded font-medium bg-green-100 text-green-700 cursor-not-allowed"
                    >
                      Current Plan
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-medium mb-2">Need Help?</h3>
        <p className="text-sm text-gray-600">
          Have questions about billing or need to change your plan? 
          <a href="mailto:support@example.com" className="text-blue-600 hover:underline ml-1">
            Contact our support team
          </a>
        </p>
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-96 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    }>
      <BillingContent />
    </Suspense>
  );
}