'use client';

import Link from 'next/link';

export default function CompanyRedesignPrototype() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="text-sm text-gray-500 mb-2">
            Home › Advertisers › -800-Flowers
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Header with Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-red-500 rounded-lg flex items-center justify-center text-white font-bold text-2xl">
                    8F
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-2xl font-bold text-gray-900">-800-Flowers</h1>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                        Verified
                      </span>
                    </div>
                    <p className="text-gray-600">Advertiser • New York, NY</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                    Follow
                  </button>
                  <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Edit Company
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <div className="text-2xl font-bold text-gray-900">3</div>
                  <div className="text-sm text-gray-500">Partnerships</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">45</div>
                  <div className="text-sm text-gray-500">Contacts</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">8</div>
                  <div className="text-sm text-gray-500">Teams</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">2 hrs</div>
                  <div className="text-sm text-gray-500">Last activity</div>
                </div>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="border-b border-gray-200 px-6">
                <nav className="-mb-px flex gap-8">
                  <button className="pb-4 px-1 border-b-2 border-blue-500 text-blue-600 font-medium text-sm">
                    Overview
                  </button>
                  <button className="pb-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm">
                    Teams (8)
                  </button>
                  <button className="pb-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm">
                    People (45)
                  </button>
                  <button className="pb-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm">
                    Partnerships (3)
                  </button>
                  <button className="pb-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm">
                    Activity (23)
                  </button>
                </nav>
              </div>

              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Overview</h2>
                <p className="text-gray-700 leading-relaxed">
                  1-800-Flowers.com, Inc. is a leading provider of gifts designed to help customers express, connect and celebrate. The Company's e-commerce business platform features an all-star family of brands.
                </p>
              </div>
            </div>

            {/* What does this company do? - Teams Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">What does -800-Flowers do? (8 teams)</h2>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View all →
                </button>
              </div>

              <div className="space-y-4">
                {/* Team 1 */}
                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center text-blue-600 text-sm font-medium">
                      📊
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">E-commerce & Digital</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex -space-x-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 border-2 border-white"></div>
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 border-2 border-white"></div>
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 border-2 border-white"></div>
                        </div>
                        <span className="text-sm text-gray-600">Sarah Johnson, Mike Chen +8 people</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Online Sales</span>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Website</span>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Mobile App</span>
                        <span className="text-xs text-gray-500">+4 more</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Team 2 */}
                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center text-purple-600 text-sm font-medium">
                      🎨
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">Creative & Brand</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex -space-x-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-red-400 border-2 border-white"></div>
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 border-2 border-white"></div>
                        </div>
                        <span className="text-sm text-gray-600">Jessica Lee, Tom Brown +5 people</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Brand Design</span>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Photography</span>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Video Production</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Team 3 */}
                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center text-green-600 text-sm font-medium">
                      📱
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">Digital Marketing</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex -space-x-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 border-2 border-white"></div>
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 border-2 border-white"></div>
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 border-2 border-white"></div>
                        </div>
                        <span className="text-sm text-gray-600">Amanda White, Chris Davis +12 people</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">SEO</span>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Social Media</span>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Email Marketing</span>
                        <span className="text-xs text-gray-500">+3 more</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Contact Cards */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">People (45)</h2>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search people..."
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Add Contact
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {/* Contact Card 1 */}
                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                        TN
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">Thomas Nelson</h3>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                            ✓ Verified
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Senior Marketing Director</p>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200">
                            🏢 Digital Marketing team
                          </span>
                          <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded border border-purple-200">
                            VP Level
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm text-gray-600">
                            📧 thomas.nelson@1800flowers.com
                          </div>
                          <div className="text-sm text-gray-600">
                            📧 tnelson@corporate.com
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Last activity: 2 hours ago
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">✓ 5</span>
                      <button className="p-2 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100">
                        ✏️
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 rounded hover:bg-red-50">
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>

                {/* Contact Card 2 */}
                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-semibold">
                        VG
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">Victoria Garcia</h3>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                            ✓ Verified
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Associate Creative Director</p>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded border border-purple-200">
                            🏢 Creative & Brand team
                          </span>
                          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200">
                            Director Level
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm text-gray-600">
                            📧 victoria.garcia@1800flowers.com
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Last activity: 7 days ago
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">✓ 6</span>
                      <button className="p-2 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100">
                        ✏️
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 rounded hover:bg-red-50">
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <button className="w-full mt-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
                View all 45 contacts →
              </button>
            </div>

            {/* Activity Feed */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Latest Activity (23 items)</h2>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    🔄
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-semibold">Sarah Lee</span> joined the Marketing team
                    </p>
                    <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                    👤
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-semibold">John Smith</span> left this company to join <span className="text-blue-600">WPP Media LA</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    ✏️
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      Contact updated: <span className="font-semibold">Mike Johnson</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">by Admin • 3 days ago</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    🤝
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      New partnership: Added agency <span className="font-semibold">New Engen NY</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">by Chris Wong • 5 days ago</p>
                  </div>
                </div>
              </div>

              <button className="w-full mt-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
                View all activity →
              </button>
            </div>
          </div>

          {/* Right Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Suggest Edits Panel */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Suggest an edit for this company 💡</h3>

              <div className="space-y-2 mb-4">
                <label className="flex items-start gap-2 text-sm">
                  <input type="checkbox" className="mt-0.5" />
                  <span className="text-gray-700">Should we add or remove people?</span>
                </label>
                <label className="flex items-start gap-2 text-sm">
                  <input type="checkbox" className="mt-0.5" />
                  <span className="text-gray-700">Are any teams no longer active?</span>
                </label>
                <label className="flex items-start gap-2 text-sm">
                  <input type="checkbox" className="mt-0.5" />
                  <span className="text-gray-700">Are there other agencies we should add?</span>
                </label>
              </div>

              <textarea
                placeholder="Write your suggestion here..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                rows={3}
              />

              <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium mb-3">
                Submit
              </button>

              <p className="text-xs text-gray-600 text-center">
                Share information with the community and obtain rewards when you do.
              </p>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Contact Info</h3>

              <div className="space-y-3">
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">Address</div>
                  <div className="text-sm text-gray-900">
                    1 Old Country Road, Suite 500<br />
                    Carle Place, NY 11514
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">Email</div>
                  <div className="text-sm text-blue-600">info@1800flowers.com</div>
                </div>

                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">Phone</div>
                  <div className="text-sm text-gray-900">1 (800) 356-9377</div>
                </div>

                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">Website</div>
                  <a href="#" className="text-sm text-blue-600 hover:underline">
                    www.1800flowers.com →
                  </a>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  Contact information last updated 5 days ago
                </div>
              </div>
            </div>

            {/* Location Branches */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Locations</h3>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm p-2 rounded hover:bg-gray-50">
                  <span className="text-gray-900">📍 New York (HQ)</span>
                  <span className="text-gray-500">25 people</span>
                </div>
                <div className="flex items-center justify-between text-sm p-2 rounded hover:bg-gray-50">
                  <span className="text-gray-900">📍 Chicago</span>
                  <span className="text-gray-500">12 people</span>
                </div>
                <div className="flex items-center justify-between text-sm p-2 rounded hover:bg-gray-50">
                  <span className="text-gray-900">📍 Los Angeles</span>
                  <span className="text-gray-500">8 people</span>
                </div>
              </div>

              <button className="w-full mt-3 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
                View all 15 locations →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Back to real page button */}
      <div className="fixed bottom-6 right-6">
        <Link
          href="/admin/orgs/companies"
          className="px-4 py-3 bg-gray-900 text-white rounded-lg shadow-lg hover:bg-gray-800 text-sm font-medium"
        >
          ← Back to actual company page
        </Link>
      </div>
    </div>
  );
}
