// app/page.tsx
import { prisma } from './lib/db';
import Link from 'next/link';

export default async function Landing() {
  const cities = await prisma.city.findMany({ orderBy: { name: 'asc' } });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section with Modern Gradients */}
      <div className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-emerald-600/20"></div>
        
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h1 className="text-6xl md:text-7xl font-black text-white mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                Local Stays
              </span>
            </h1>
            <div className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              <span className="font-bold text-yellow-300">Book Direct.</span> Skip platform fees. 
              <br className="hidden sm:block" />
              Message real owners. Keep your rate.
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-white/80">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span>No booking fees</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                <span>Direct communication</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                <span>AI-powered planning</span>
              </div>
            </div>
          </div>

          {/* Modern Glassmorphism Search Form */}
          <div className="relative bg-white/20 backdrop-blur-md border border-white/30 rounded-3xl p-8 shadow-2xl max-w-6xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-3xl"></div>
            <form id="searchForm" className="relative z-10 grid gap-6 md:grid-cols-2 lg:grid-cols-5 items-end">
              <div>
                <label className="block">
                  <span className="text-sm font-semibold text-white mb-2 block">Where</span>
                  <select
                    name="city"
                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-0 rounded-xl text-gray-900 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                    defaultValue=""
                  >
                    <option value="">Search destinations</option>
                    {cities.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}, {c.state}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div>
                <label className="block">
                  <span className="text-sm font-semibold text-white mb-2 block">Bedrooms</span>
                  <input
                    type="number"
                    name="minBeds"
                    min={0}
                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-0 rounded-xl text-gray-900 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                    placeholder="Any"
                  />
                </label>
              </div>

              <div>
                <label className="block">
                  <span className="text-sm font-semibold text-white mb-2 block">Guests</span>
                  <input
                    type="number"
                    name="minSleeps"
                    min={0}
                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-0 rounded-xl text-gray-900 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                    placeholder="Any"
                  />
                </label>
              </div>

              <div>
                <label className="block">
                  <span className="text-sm font-semibold text-white mb-2 block">Max Price</span>
                  <input
                    type="number"
                    name="maxPrice"
                    min={0}
                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-0 rounded-xl text-gray-900 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                    placeholder="$500"
                  />
                </label>
              </div>

              <div className="lg:col-span-1 flex flex-col gap-3">
                <button
                  type="button"
                  onClick="document.getElementById('searchForm').action='/search'; document.getElementById('searchForm').submit();"
                  className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold px-6 py-3 rounded-xl border-0 cursor-pointer shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
                >
                  🔍 Search Properties
                </button>
                <button
                  type="button"
                  onClick="generateAITripPlan()"
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold px-6 py-3 rounded-xl border-0 cursor-pointer shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
                >
                  ✨ AI Trip Plan
                </button>
              </div>
            </form>

            {/* JavaScript for AI Trip Planning */}
            <script dangerouslySetInnerHTML={{__html: `
              async function generateAITripPlan() {
                const form = document.getElementById('searchForm');
                const formData = new FormData(form);
                
                const city = formData.get('city');
                const minBeds = formData.get('minBeds');
                const minSleeps = formData.get('minSleeps');
                const maxPrice = formData.get('maxPrice');
                
                if (!city) {
                  alert('Please select a destination first!');
                  return;
                }
                
                // Create trip planning parameters
                const params = new URLSearchParams({
                  destination: city,
                  ...(minBeds && {bedrooms: minBeds}),
                  ...(minSleeps && {guests: minSleeps}),
                  ...(maxPrice && {budget: maxPrice})
                });
                
                // Redirect to trip planner with pre-filled data
                window.location.href = '/trip-planner?' + params.toString();
              }
            `}} />
          </div>
        </div>
      </div>

      {/* Testing Dashboard with Modern Gradients */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            ✨ Testing Dashboard
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore our cutting-edge features: Stripe billing, AI-powered SEO, and Claude trip planning
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Owner Features Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-8 shadow-xl border border-blue-200/50 hover:shadow-2xl transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10"></div>
            <div className="relative text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">💼</span>
              </div>
              <h3 className="text-xl font-black text-gray-900">Owner Features</h3>
              <p className="text-blue-700 text-sm mt-2 font-medium">Stripe billing & listing management</p>
            </div>
            
            <div className="relative space-y-4">
              <Link 
                href="/owner/billing" 
                className="flex items-center justify-between p-5 bg-white/60 backdrop-blur-sm rounded-2xl hover:bg-white/80 transition-all duration-300 group border border-white/50"
              >
                <div>
                  <div className="font-bold text-blue-900 group-hover:text-blue-800">💳 Billing Dashboard</div>
                  <div className="text-blue-700 text-sm font-medium">Test subscription flow</div>
                </div>
                <div className="text-blue-500 group-hover:scale-125 transition-transform duration-300">→</div>
              </Link>
              
              <Link 
                href="/owner/listings/new" 
                className="flex items-center justify-between p-5 bg-white/60 backdrop-blur-sm rounded-2xl hover:bg-white/80 transition-all duration-300 group border border-white/50"
              >
                <div>
                  <div className="font-bold text-blue-900 group-hover:text-blue-800">🏠 Create Listing</div>
                  <div className="text-blue-700 text-sm font-medium">Test listing gating</div>
                </div>
                <div className="text-blue-500 group-hover:scale-125 transition-transform duration-300">→</div>
              </Link>
            </div>
          </div>

          {/* SEO Pages Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-green-100 rounded-3xl p-8 shadow-xl border border-emerald-200/50 hover:shadow-2xl transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/10"></div>
            <div className="relative text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-xl font-black text-gray-900">SEO Pages</h3>
              <p className="text-emerald-700 text-sm mt-2 font-medium">150 generated landing pages</p>
            </div>
            
            <div className="relative space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Link 
                  href="/palm-springs" 
                  className="p-4 bg-white/60 backdrop-blur-sm rounded-xl hover:bg-white/80 transition-all duration-300 text-center group border border-white/50"
                >
                  <div className="text-lg mb-2">🌴</div>
                  <div className="text-emerald-900 font-bold text-sm group-hover:text-emerald-800">Palm Springs</div>
                </Link>
                
                <Link 
                  href="/austin" 
                  className="p-4 bg-white/60 backdrop-blur-sm rounded-xl hover:bg-white/80 transition-all duration-300 text-center group border border-white/50"
                >
                  <div className="text-lg mb-2">🎵</div>
                  <div className="text-emerald-900 font-bold text-sm group-hover:text-emerald-800">Austin</div>
                </Link>
              </div>
              
              <Link 
                href="/palm-springs/pool/2-bedroom" 
                className="flex items-center justify-between p-5 bg-white/60 backdrop-blur-sm rounded-2xl hover:bg-white/80 transition-all duration-300 group border border-white/50"
              >
                <div>
                  <div className="font-bold text-emerald-900 group-hover:text-emerald-800">🏊 Pool + 2-Bedroom</div>
                  <div className="text-emerald-700 text-sm font-medium">Filtered search page</div>
                </div>
                <div className="text-emerald-500 group-hover:scale-125 transition-transform duration-300">→</div>
              </Link>
            </div>
          </div>

          {/* Trip Planner Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-pink-100 rounded-3xl p-8 shadow-xl border border-orange-200/50 hover:shadow-2xl transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-pink-500/10"></div>
            <div className="relative text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">✈️</span>
              </div>
              <h3 className="text-xl font-black text-gray-900">AI Trip Planner</h3>
              <p className="text-orange-700 text-sm mt-2 font-medium">Claude-powered itineraries</p>
            </div>
            
            <div className="relative space-y-4">
              <Link 
                href="/trip-planner" 
                className="flex items-center justify-between p-5 bg-white/60 backdrop-blur-sm rounded-2xl hover:bg-white/80 transition-all duration-300 group border border-white/50"
              >
                <div>
                  <div className="font-bold text-orange-900 group-hover:text-orange-800">✨ Plan My Trip</div>
                  <div className="text-orange-700 text-sm font-medium">AI-powered itinerary generator</div>
                </div>
                <div className="text-orange-500 group-hover:scale-125 transition-transform duration-300">→</div>
              </Link>
              
              <div className="p-5 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/30">
                <div className="text-sm text-gray-800 mb-2">
                  <div className="font-bold text-orange-900">Features:</div>
                  <div className="text-xs text-orange-800 space-y-1 mt-2 font-medium">
                    <div>• Personalized day-by-day plans</div>
                    <div>• Budget optimization</div>
                    <div>• Platform accommodation matching</div>
                    <div>• Real-time customization</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Testing Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-violet-100 rounded-3xl p-8 shadow-xl border border-purple-200/50 hover:shadow-2xl transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-violet-500/10"></div>
            <div className="relative text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">⚙️</span>
              </div>
              <h3 className="text-xl font-black text-gray-900">System Testing</h3>
              <p className="text-purple-700 text-sm mt-2 font-medium">Sitemaps & technical features</p>
            </div>
            
            <div className="relative space-y-4">
              <Link 
                href="/sitemap.xml" 
                className="flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm rounded-2xl hover:bg-white/80 transition-all duration-300 group border border-white/50"
              >
                <div>
                  <div className="font-bold text-purple-900 group-hover:text-purple-800">🗺️ Sitemap Index</div>
                  <div className="text-purple-700 text-sm font-medium">XML sitemap structure</div>
                </div>
                <div className="text-purple-500 group-hover:scale-125 transition-transform duration-300">→</div>
              </Link>
              
              <Link 
                href="/sitemaps/palm-springs.xml" 
                className="flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm rounded-2xl hover:bg-white/80 transition-all duration-300 group border border-white/50"
              >
                <div>
                  <div className="font-bold text-purple-900 group-hover:text-purple-800">📄 City Sitemap</div>
                  <div className="text-purple-700 text-sm font-medium">Palm Springs pages</div>
                </div>
                <div className="text-purple-500 group-hover:scale-125 transition-transform duration-300">→</div>
              </Link>
              
              <Link 
                href="/ai-demo" 
                className="flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm rounded-2xl hover:bg-white/80 transition-all duration-300 group border border-white/50"
              >
                <div>
                  <div className="font-bold text-purple-900 group-hover:text-purple-800">🤖 AI Features</div>
                  <div className="text-purple-700 text-sm font-medium">Property & pricing AI</div>
                </div>
                <div className="text-purple-500 group-hover:scale-125 transition-transform duration-300">→</div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Browse Section with Modern Gradient */}
      <div className="bg-gradient-to-r from-gray-50 via-slate-50 to-gray-50 border-t border-gray-200/50">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center">
          <div className="text-xl text-gray-700">
            Or{' '}
            <Link href="/search" className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-black hover:from-purple-600 hover:to-pink-600 transition-all duration-300 underline decoration-2 underline-offset-4">
              browse all active listings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}