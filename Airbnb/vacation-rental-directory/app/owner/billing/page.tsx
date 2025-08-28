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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header with Modern Gradients */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-emerald-600/20"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                💳 Billing & Subscription
              </span>
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Manage your plan and unlock premium features
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">

        {/* No Active Subscription Warning with Modern Design */}
        {!activeSubscription && (
          <div className="relative overflow-hidden bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl p-8 border border-yellow-200/50 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10"></div>
            <div className="relative flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black text-gray-900 mb-2">🚀 Subscription Required</h3>
                <p className="text-gray-700 leading-relaxed">
                  Your listings are currently limited until you subscribe to a plan. Choose a plan below to activate your listings and unlock premium features.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Current Subscription Status with Modern Design */}
        {activeSubscription && (
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-8 border border-emerald-200/50 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/10"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 mb-1">
                    ✨ Active: {getTierDisplayName(activeSubscription.tier)}
                  </h3>
                  <p className="text-gray-700 font-medium">
                    Status: <span className="capitalize text-emerald-600">{activeSubscription.status}</span>
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
                    {activeSubscription.start && (
                      <span className="bg-white/60 backdrop-blur-sm rounded-full px-3 py-1 border border-white/50">
                        📅 Started: {activeSubscription.start.toLocaleDateString()}
                      </span>
                    )}
                    {activeSubscription.end && (
                      <span className="bg-white/60 backdrop-blur-sm rounded-full px-3 py-1 border border-white/50">
                        ⏰ Ends: {activeSubscription.end.toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                <form action={createPortalSession}>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    🔧 Manage Billing
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Plans with Modern Design */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              💎 Choose Your Plan
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Unlock more listings, features, and premium support
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {tiers.map(({ tier, popular }) => {
              const pricing = getTierPrice(tier);
              const features = getTierFeatures(tier);
              const isCurrentTier = activeSubscription?.tier === tier;
              
              // Gradient colors for each tier
              const tierGradients = {
                BRONZE: 'from-orange-50 to-amber-50 border-orange-200/50',
                SILVER: 'from-gray-50 to-slate-50 border-gray-200/50',
                GOLD: 'from-yellow-50 to-orange-50 border-yellow-200/50',
                PLATINUM: 'from-purple-50 to-pink-50 border-purple-200/50'
              };

              const tierIconGradients = {
                BRONZE: 'from-orange-500 to-amber-600',
                SILVER: 'from-gray-500 to-slate-600',
                GOLD: 'from-yellow-500 to-orange-600',
                PLATINUM: 'from-purple-500 to-pink-600'
              };
              
              return (
                <div
                  key={tier}
                  className={`relative group overflow-hidden bg-gradient-to-br ${tierGradients[tier]} rounded-3xl p-8 border shadow-lg hover:shadow-2xl transition-all duration-300 ${
                    popular ? 'scale-105' : ''
                  } ${isCurrentTier ? 'ring-2 ring-emerald-500' : ''}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${tierIconGradients[tier]}/10 group-hover:${tierIconGradients[tier]}/20 transition-all duration-300`}></div>
                  
                  {popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 text-sm font-bold rounded-full shadow-lg">
                        ⭐ Most Popular
                      </span>
                    </div>
                  )}
                  {isCurrentTier && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <span className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-4 py-2 text-sm font-bold rounded-full shadow-lg">
                        ✅ Current Plan
                      </span>
                    </div>
                  )}
                
                  <div className="relative text-center space-y-6">
                    {/* Tier Icon */}
                    <div className={`w-16 h-16 bg-gradient-to-br ${tierIconGradients[tier]} rounded-full flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <span className="text-2xl text-white">
                        {tier === 'BRONZE' && '🥉'}
                        {tier === 'SILVER' && '🥈'} 
                        {tier === 'GOLD' && '🥇'}
                        {tier === 'PLATINUM' && '💎'}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-2xl font-black text-gray-900 mb-2">{getTierDisplayName(tier)}</h3>
                      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/50">
                        <div className="text-4xl font-black text-gray-900">${pricing.annual}</div>
                        <div className="text-sm font-medium text-gray-600">per year</div>
                        <div className="text-xs text-gray-500 mt-1">
                          💰 Save ${(pricing.monthly * 12) - pricing.annual}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-3 bg-white/40 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/50">
                          <div className={`w-6 h-6 bg-gradient-to-br ${tierIconGradients[tier]} rounded-full flex items-center justify-center flex-shrink-0`}>
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-gray-800 font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {!isCurrentTier && (
                      <form action={createCheckoutSession.bind(null, tier)}>
                        <button
                          type="submit"
                          className={`w-full py-4 px-6 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 ${
                            popular
                              ? `bg-gradient-to-r ${tierIconGradients[tier]} text-white hover:scale-105`
                              : `bg-gradient-to-r ${tierIconGradients[tier]} text-white hover:scale-105`
                          }`}
                        >
                          {activeSubscription ? '🔄 Change Plan' : '🚀 Subscribe Now'}
                        </button>
                      </form>
                    )}
                    
                    {isCurrentTier && (
                      <button
                        disabled
                        className="w-full py-4 px-6 rounded-2xl font-bold bg-gradient-to-r from-emerald-500 to-green-500 text-white cursor-not-allowed opacity-75"
                      >
                        ✅ Current Plan
                      </button>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

        {/* Help Section with Modern Design */}
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-slate-50 rounded-3xl p-8 border border-gray-200/50 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-slate-500/5"></div>
          <div className="relative text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-slate-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-3">💬 Need Help?</h3>
            <p className="text-gray-700 leading-relaxed">
              Have questions about billing or need to change your plan? 
              <a href="mailto:support@localstays.com" className="text-blue-600 hover:text-blue-800 font-semibold underline decoration-2 underline-offset-2 ml-1">
                Contact our support team
              </a>
            </p>
          </div>
        </div>
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