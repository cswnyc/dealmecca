// app/ai-demo/page.tsx
import { Suspense } from 'react';
import { prisma } from '../lib/db';
import { PropertyDescriptionGenerator } from '../components/ai/PropertyDescriptionGenerator';
import { InquiryResponseSuggester } from '../components/ai/InquiryResponseSuggester';
import { PricingOptimizer } from '../components/ai/PricingOptimizer';
import Link from 'next/link';

export default async function AIDemoPage() {
  // Get sample data for demonstration
  const [sampleListing, sampleInquiry] = await Promise.all([
    prisma.listing.findFirst({
      where: { status: 'ACTIVE' },
      include: {
        city: true,
        neighborhood: true,
        amenities: { include: { amenity: true } }
      }
    }),
    prisma.inquiry.findFirst({
      where: { status: 'PENDING' },
      include: {
        listing: { include: { city: true } }
      }
    })
  ]);

  if (!sampleListing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-emerald-600/20"></div>
          
          <div className="relative z-10 max-w-4xl mx-auto px-6 py-20">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-black text-white mb-6">
                <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                  🤖 AI Demo
                </span>
              </h1>
              <div className="bg-yellow-500/20 backdrop-blur-md border border-yellow-300/50 rounded-2xl p-8 max-w-2xl mx-auto">
                <p className="text-yellow-100 text-lg mb-4">No sample listings found. Please run the database seeder first:</p>
                <code className="block mt-4 p-4 bg-yellow-400/30 rounded-xl text-yellow-200 font-mono">npm run seed</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-emerald-600/20"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                  🤖 AI-Powered Features Demo
                </span>
              </h1>
              <p className="text-xl text-white/90 max-w-2xl">
                Experience Claude AI integration for vacation rental management
              </p>
            </div>
            <Link 
              href="/" 
              className="px-6 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl text-white font-semibold hover:bg-white/30 transition-all duration-300"
            >
              ← Back to App
            </Link>
          </div>
          
          {!process.env.ANTHROPIC_API_KEY && (
            <div className="bg-red-500/20 backdrop-blur-md border border-red-300/50 rounded-2xl p-6">
              <p className="text-red-100 font-bold text-lg">⚠️ Configuration Required</p>
              <p className="text-red-200 text-sm mt-2">
                Add your <code className="bg-red-400/30 px-2 py-1 rounded">ANTHROPIC_API_KEY</code> to <code className="bg-red-400/30 px-2 py-1 rounded">.env.local</code> to enable AI features.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">

        {/* Sample Property Info */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-100/80 to-gray-100/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-200/50 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
          <div className="relative">
            <h2 className="text-2xl font-black text-gray-900 mb-4">Demo Property: {sampleListing.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
              <div className="space-y-3">
                <p><strong className="text-blue-600">Location:</strong> {sampleListing.city.name}, {sampleListing.city.state}</p>
                <p><strong className="text-emerald-600">Details:</strong> {sampleListing.bedrooms} bed, {sampleListing.bathrooms} bath, sleeps {sampleListing.sleeps}</p>
              </div>
              <div className="space-y-3">
                <p><strong className="text-purple-600">Price:</strong> ${sampleListing.priceMin}–${sampleListing.priceMax}/night</p>
                <p><strong className="text-orange-600">Amenities:</strong> {sampleListing.amenities.map(a => a.amenity.name).join(', ')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Property Description Generator */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-3xl transform rotate-1 group-hover:rotate-2 transition-transform duration-300"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300 space-y-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-3">1. Property Description Generator</h2>
                <p className="text-gray-700 leading-relaxed">
                  Generate engaging property descriptions and summaries using AI analysis 
                  of your listing details, amenities, and location.
                </p>
              </div>
              
              <Suspense fallback={
                <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl animate-pulse">
                  <div className="h-4 bg-blue-200 rounded mb-3"></div>
                  <div className="h-4 bg-blue-200 rounded w-3/4"></div>
                </div>
              }>
                <PropertyDescriptionGenerator
                  listingId={sampleListing.id}
                  currentDescription={sampleListing.description || undefined}
                  currentSummary={sampleListing.summary || undefined}
                />
              </Suspense>
            </div>
          </div>

          {/* Pricing Optimizer */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-3xl transform -rotate-1 group-hover:-rotate-2 transition-transform duration-300"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-emerald-200/50 shadow-lg hover:shadow-xl transition-all duration-300 space-y-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-3">2. Smart Pricing Optimizer</h2>
                <p className="text-gray-700 leading-relaxed">
                  Get AI-powered pricing recommendations based on market analysis, 
                  property features, and competitive positioning.
                </p>
              </div>
              
              <Suspense fallback={
                <div className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl animate-pulse">
                  <div className="h-4 bg-emerald-200 rounded mb-3"></div>
                  <div className="h-4 bg-emerald-200 rounded w-3/4"></div>
                </div>
              }>
                <PricingOptimizer
                  listingId={sampleListing.id}
                  currentPriceMin={sampleListing.priceMin || undefined}
                  currentPriceMax={sampleListing.priceMax || undefined}
                />
              </Suspense>
            </div>
          </div>
        </div>

        {/* Inquiry Response Assistant */}
        {sampleInquiry && (
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl transform rotate-1 group-hover:rotate-2 transition-transform duration-300"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300 space-y-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-3">3. Guest Inquiry Response Assistant</h2>
                <p className="text-gray-700 leading-relaxed">
                  Generate personalized, professional responses to guest inquiries 
                  that address their specific questions and encourage bookings.
                </p>
              </div>
              
              <Suspense fallback={
                <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl animate-pulse">
                  <div className="h-4 bg-purple-200 rounded mb-3"></div>
                  <div className="h-4 bg-purple-200 rounded w-3/4"></div>
                </div>
              }>
                <InquiryResponseSuggester
                  inquiryId={sampleInquiry.id}
                  guestName={sampleInquiry.guestName || undefined}
                  guestMessage={sampleInquiry.message}
                />
              </Suspense>
            </div>
          </div>
        )}

        {!sampleInquiry && (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200/20 to-gray-300/20 rounded-3xl"></div>
            <div className="relative bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-gray-200/50 shadow-lg">
              <h2 className="text-2xl font-black text-gray-900 mb-4">3. Guest Inquiry Response Assistant</h2>
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200/50 rounded-2xl p-6">
                <p className="text-gray-700 leading-relaxed">
                  No sample inquiries found. Create an inquiry through the 
                  <Link href={`/listing/${sampleListing.slug}`} className="text-blue-600 hover:text-blue-800 font-semibold underline decoration-2 underline-offset-2 mx-1">
                    property page
                  </Link>
                  to test this feature.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Feature Overview */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl"></div>
          <div className="relative bg-white/60 backdrop-blur-md rounded-3xl p-10 border border-white/50 shadow-xl">
            <h2 className="text-3xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-8 text-center">
              ✨ AI Features Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <h3 className="text-xl font-black text-blue-900 mb-4">For Property Owners:</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/50">
                    <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></span>
                    <span className="text-blue-800 font-medium">Auto-generate compelling property descriptions</span>
                  </div>
                  <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/50">
                    <span className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"></span>
                    <span className="text-blue-800 font-medium">Optimize pricing based on market data</span>
                  </div>
                  <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/50">
                    <span className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></span>
                    <span className="text-blue-800 font-medium">Get suggested responses to guest inquiries</span>
                  </div>
                  <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/50">
                    <span className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></span>
                    <span className="text-blue-800 font-medium">Enhance SEO with AI-generated content</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-black text-purple-900 mb-4">For Platform Growth:</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/50">
                    <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></span>
                    <span className="text-purple-800 font-medium">Improve listing quality across the platform</span>
                  </div>
                  <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/50">
                    <span className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"></span>
                    <span className="text-purple-800 font-medium">Increase booking conversion rates</span>
                  </div>
                  <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/50">
                    <span className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></span>
                    <span className="text-purple-800 font-medium">Reduce time-to-market for new listings</span>
                  </div>
                  <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/50">
                    <span className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></span>
                    <span className="text-purple-800 font-medium">Enhanced user experience with smart search</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Status */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-6 bg-white/40 backdrop-blur-sm rounded-full px-8 py-4 border border-white/30">
            <span className="text-gray-700 font-medium">Powered by Claude AI</span>
            <span className="text-gray-400">•</span>
            <Link href="/search" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-300">View Listings</Link>
            <span className="text-gray-400">•</span>
            <a 
              href="https://docs.anthropic.com/en/docs/claude-code/sdk" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-600 hover:text-purple-800 font-semibold transition-colors duration-300"
            >
              Claude Code SDK Docs
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}