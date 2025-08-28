import { Suspense } from 'react';
import Link from 'next/link';
import { TripPlannerWizard } from '../components/ai/TripPlannerWizard';

export default function TripPlannerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header with Modern Gradients */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-emerald-600/20"></div>
        
        <div className="relative z-10 mx-auto max-w-6xl px-6 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                  ✈️ AI Trip Planner
                </span>
              </h1>
              <p className="text-xl text-white/90 max-w-2xl">
                Create personalized itineraries with Claude AI-powered recommendations
              </p>
            </div>
            <Link 
              href="/" 
              className="px-6 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl text-white font-semibold hover:bg-white/30 transition-all duration-300"
            >
              ← Back to Home
            </Link>
          </div>
          
          {!process.env.ANTHROPIC_API_KEY && (
            <div className="mt-6 bg-red-500/20 backdrop-blur-md border border-red-300/50 rounded-2xl p-6">
              <p className="text-red-100 font-bold text-lg">⚠️ Configuration Required</p>
              <p className="text-red-200 text-sm mt-2">
                Add your <code className="bg-red-400/30 px-2 py-1 rounded">ANTHROPIC_API_KEY</code> to <code className="bg-red-400/30 px-2 py-1 rounded">.env.local</code> to enable trip planning.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-6 py-12">
        <Suspense 
          fallback={
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
                  <div className="space-y-4">
                    <div className="h-12 bg-gray-200 rounded"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          }
        >
          <TripPlannerWizard />
        </Suspense>
      </div>

      {/* Features Section with Modern Design */}
      <div className="bg-gradient-to-r from-white via-slate-50 to-white border-t border-gray-200/50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
              Why Use Our AI Trip Planner?
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Powered by Claude AI, our trip planner creates personalized itineraries 
              and matches you with the perfect accommodations from our platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-3xl transform rotate-1 group-hover:rotate-2 transition-transform duration-300"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300 text-center space-y-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">🧠</span>
                </div>
                <h3 className="text-xl font-black text-gray-900">AI-Powered Intelligence</h3>
                <p className="text-gray-700 leading-relaxed">
                  Claude AI analyzes your preferences to create detailed, personalized 
                  itineraries with local insights and insider tips.
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-3xl transform -rotate-1 group-hover:-rotate-2 transition-transform duration-300"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-emerald-200/50 shadow-lg hover:shadow-xl transition-all duration-300 text-center space-y-6">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">🏠</span>
                </div>
                <h3 className="text-xl font-black text-gray-900">Perfect Accommodation Matches</h3>
                <p className="text-gray-700 leading-relaxed">
                  Automatically find and recommend vacation rentals from our platform 
                  that match your trip dates, budget, and preferences.
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl transform rotate-1 group-hover:rotate-2 transition-transform duration-300"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300 text-center space-y-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">⚡</span>
                </div>
                <h3 className="text-xl font-black text-gray-900">Instant Customization</h3>
                <p className="text-gray-700 leading-relaxed">
                  Don't like something? Give feedback and watch your itinerary 
                  update in real-time with new recommendations.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl"></div>
            <div className="relative bg-white/60 backdrop-blur-md rounded-3xl p-10 border border-white/50 shadow-xl">
              <div className="max-w-3xl mx-auto text-center space-y-6">
                <h3 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Ready to Plan Your Perfect Trip?
                </h3>
                <p className="text-xl text-gray-800 leading-relaxed">
                  Join thousands of travelers who have discovered amazing destinations 
                  and found their perfect accommodations through our AI-powered platform.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-8 text-gray-700">
                  <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-full px-6 py-3 border border-white/50">
                    <span className=\"w-3 h-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full\"></span>
                    <span className=\"font-semibold\">Personalized itineraries</span>
                  </div>
                  <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-full px-6 py-3 border border-white/50">
                    <span className=\"w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full\"></span>
                    <span className=\"font-semibold\">Local accommodations</span>
                  </div>
                  <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-full px-6 py-3 border border-white/50">
                    <span className=\"w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full\"></span>
                    <span className=\"font-semibold\">Budget optimization</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with Modern Design */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-slate-900 to-gray-900"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20"></div>
        
        <div className="relative z-10 mx-auto max-w-6xl px-6 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <span className="text-2xl font-black bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">Local Stays</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-300 font-medium">AI-Powered Trip Planning</span>
            </div>
            <div className="flex items-center space-x-8 text-sm">
              <Link href="/search" className="text-gray-400 hover:text-white font-medium transition-colors duration-300">Browse Listings</Link>
              <Link href="/ai-demo" className="text-gray-400 hover:text-white font-medium transition-colors duration-300">Other AI Features</Link>
              <a 
                href="https://docs.anthropic.com/en/docs/claude-code/sdk" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white font-medium transition-colors duration-300"
              >
                Powered by Claude
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}