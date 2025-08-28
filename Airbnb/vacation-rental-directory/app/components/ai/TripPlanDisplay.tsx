'use client';

import { useState } from 'react';
import { TripPlan, TripPlanRequest } from '../../lib/claude-agents';
import { enhanceItinerary } from '../../actions/claude-agents';
import Link from 'next/link';

interface TripPlanDisplayProps {
  tripPlan: TripPlan;
  originalRequest: TripPlanRequest;
}

export function TripPlanDisplay({ tripPlan, originalRequest }: TripPlanDisplayProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [feedbackMode, setFeedbackMode] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancements, setEnhancements] = useState(null);

  const handleFeedback = async () => {
    if (!feedback.trim()) return;
    
    setIsEnhancing(true);
    try {
      const result = await enhanceItinerary(tripPlan, feedback);
      if (result.success) {
        setEnhancements(result.data);
      }
    } catch (error) {
      console.error('Failed to enhance itinerary:', error);
    } finally {
      setIsEnhancing(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'itinerary', label: 'Day by Day', icon: '📅' },
    { id: 'accommodations', label: 'Where to Stay', icon: '🏠' },
    { id: 'dining', label: 'Dining', icon: '🍽️' },
    { id: 'activities', label: 'Activities', icon: '🎯' },
    { id: 'budget', label: 'Budget', icon: '💰' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8">
        <h1 className="text-3xl font-bold mb-2">
          Your Trip to {originalRequest.destination}
        </h1>
        <p className="text-blue-100 mb-4">{tripPlan.overview}</p>
        <div className="flex items-center space-x-6 text-sm">
          <span>📅 {originalRequest.startDate} - {originalRequest.endDate}</span>
          <span>👥 {originalRequest.travelers} travelers</span>
          <span>💵 ${originalRequest.budget.min}-${originalRequest.budget.max}/day</span>
          <span>⏱️ {tripPlan.duration} days</span>
        </div>
      </div>

      {/* Feedback Section */}
      {!feedbackMode ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-yellow-800 font-medium">Want to customize your plan?</p>
            <p className="text-yellow-700 text-sm">Tell us what you'd like to change or add</p>
          </div>
          <button
            onClick={() => setFeedbackMode(true)}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-medium"
          >
            Customize Plan
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold mb-3">Customize Your Trip Plan</h3>
          <div className="space-y-4">
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="e.g., 'I'd prefer more outdoor activities and fewer museums' or 'Can you suggest vegetarian restaurants?'"
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex items-center space-x-3">
              <button
                onClick={handleFeedback}
                disabled={!feedback.trim() || isEnhancing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isEnhancing ? 'Updating...' : 'Update Plan'}
              </button>
              <button
                onClick={() => {
                  setFeedbackMode(false);
                  setFeedback('');
                  setEnhancements(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhancements */}
      {enhancements && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <h3 className="font-semibold text-green-900 mb-3">✨ Updated Recommendations</h3>
          {enhancements.suggestions && (
            <div className="space-y-2 mb-4">
              {enhancements.suggestions.map((suggestion: string, index: number) => (
                <div key={index} className="flex items-start space-x-2">
                  <span className="text-green-600 mt-1">•</span>
                  <p className="text-green-800 text-sm">{suggestion}</p>
                </div>
              ))}
            </div>
          )}
          {enhancements.alternativeActivities && (
            <div className="space-y-2">
              <p className="font-medium text-green-900 text-sm">Alternative Activities:</p>
              {enhancements.alternativeActivities.map((activity: any, index: number) => (
                <div key={index} className="bg-white p-3 rounded-lg">
                  <p className="font-medium text-gray-900">{activity.activity}</p>
                  <p className="text-gray-600 text-sm">{activity.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-gray-100">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Best Time to Visit</h3>
                <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">{tripPlan.bestTimeToVisit}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Weather Expectations</h3>
                <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">{tripPlan.weather}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Local Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tripPlan.localTips.map((tip, index) => (
                  <div key={index} className="flex items-start space-x-3 bg-blue-50 p-4 rounded-lg">
                    <span className="text-blue-600 mt-0.5">💡</span>
                    <p className="text-blue-900 text-sm">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Itinerary Tab */}
        {activeTab === 'itinerary' && (
          <div className="p-8">
            <div className="space-y-6">
              {tripPlan.itinerary.map((day, index) => (
                <div key={index} className="border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Day {day.day} - {day.theme}
                    </h3>
                    <span className="text-sm text-gray-500">{day.date}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">🌅 Morning</h4>
                      <p className="text-gray-600 text-sm">{day.morning}</p>
                      {day.meals?.breakfast && (
                        <p className="text-blue-600 text-sm mt-2">🥐 {day.meals.breakfast}</p>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">☀️ Afternoon</h4>
                      <p className="text-gray-600 text-sm">{day.afternoon}</p>
                      {day.meals?.lunch && (
                        <p className="text-blue-600 text-sm mt-2">🍽️ {day.meals.lunch}</p>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">🌆 Evening</h4>
                      <p className="text-gray-600 text-sm">{day.evening}</p>
                      {day.meals?.dinner && (
                        <p className="text-blue-600 text-sm mt-2">🍷 {day.meals.dinner}</p>
                      )}
                    </div>
                  </div>
                  
                  {day.tips && day.tips.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h4 className="font-medium text-gray-700 mb-2">💡 Day Tips</h4>
                      <div className="space-y-1">
                        {day.tips.map((tip, tipIndex) => (
                          <p key={tipIndex} className="text-sm text-gray-600">• {tip}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Accommodations Tab */}
        {activeTab === 'accommodations' && (
          <div className="p-8">
            <div className="space-y-6">
              {tripPlan.accommodations.map((accommodation, index) => (
                <div key={index} className="border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {accommodation.type} in {accommodation.area}
                  </h3>
                  <p className="text-gray-600 mb-4">Budget: {accommodation.priceRange}</p>
                  
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">Features:</h4>
                    <div className="flex flex-wrap gap-2">
                      {accommodation.features.map((feature, featureIndex) => (
                        <span key={featureIndex} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Platform Listings */}
                  {accommodation.platformListings && accommodation.platformListings.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-4">🏠 Available on Our Platform:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {accommodation.platformListings.slice(0, 3).map((listing: any, listingIndex: number) => (
                          <Link key={listingIndex} href={`/listing/${listing.slug}`}>
                            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer">
                              {listing.photo && (
                                <img 
                                  src={listing.photo} 
                                  alt={listing.title}
                                  className="w-full h-32 object-cover rounded-lg mb-3"
                                />
                              )}
                              <h5 className="font-medium text-gray-900 mb-1 line-clamp-2">{listing.title}</h5>
                              <p className="text-sm text-gray-600 mb-2">
                                {listing.bedrooms} bed • {listing.bathrooms} bath • Sleeps {listing.sleeps}
                              </p>
                              {listing.priceMin && listing.priceMax && (
                                <p className="text-sm font-medium text-green-600">
                                  ${listing.priceMin}-${listing.priceMax}/night
                                </p>
                              )}
                              {listing.amenities && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {listing.amenities.slice(0, 3).map((amenity: string, amenityIndex: number) => (
                                    <span key={amenityIndex} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                      {amenity}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                      {accommodation.platformListings.length > 3 && (
                        <p className="text-sm text-gray-500 mt-2">
                          +{accommodation.platformListings.length - 3} more properties available
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dining Tab */}
        {activeTab === 'dining' && (
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tripPlan.restaurants.map((restaurant, index) => (
                <div key={index} className="border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{restaurant.name}</h3>
                  <div className="space-y-2">
                    <p className="text-gray-600 text-sm">
                      <span className="font-medium">Type:</span> {restaurant.type}
                    </p>
                    <p className="text-gray-600 text-sm">
                      <span className="font-medium">Price:</span> {restaurant.priceRange}
                    </p>
                    <div>
                      <p className="font-medium text-gray-700 text-sm mb-1">Specialties:</p>
                      <div className="flex flex-wrap gap-1">
                        {restaurant.specialties.map((specialty, specialtyIndex) => (
                          <span key={specialtyIndex} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activities Tab */}
        {activeTab === 'activities' && (
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tripPlan.activities.map((activity, index) => (
                <div key={index} className="border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{activity.name}</h3>
                  <div className="space-y-2">
                    <p className="text-gray-600 text-sm">
                      <span className="font-medium">Category:</span> {activity.category}
                    </p>
                    <p className="text-gray-600 text-sm">
                      <span className="font-medium">Duration:</span> {activity.duration}
                    </p>
                    <p className="text-gray-600 text-sm">
                      <span className="font-medium">Cost:</span> {activity.cost}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Budget Tab */}
        {activeTab === 'budget' && (
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Budget Breakdown</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">🏠 Accommodation</span>
                    <span className="text-gray-900">${tripPlan.budget.accommodation.min}-${tripPlan.budget.accommodation.max}/day</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">🍽️ Food & Dining</span>
                    <span className="text-gray-900">${tripPlan.budget.food.min}-${tripPlan.budget.food.max}/day</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">🎯 Activities</span>
                    <span className="text-gray-900">${tripPlan.budget.activities.min}-${tripPlan.budget.activities.max}/day</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">🚗 Transportation</span>
                    <span className="text-gray-900">${tripPlan.budget.transportation.min}-${tripPlan.budget.transportation.max}/day</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Total Trip Cost</h3>
                <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-xl border border-green-200">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Per Person ({tripPlan.duration} days)</p>
                    <p className="text-3xl font-bold text-green-700">
                      ${tripPlan.budget.total.min}-${tripPlan.budget.total.max}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      Total for {originalRequest.travelers} travelers:
                    </p>
                    <p className="text-xl font-semibold text-gray-900">
                      ${tripPlan.budget.total.min * originalRequest.travelers}-${tripPlan.budget.total.max * originalRequest.travelers}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium text-gray-700 mb-3">💡 Budget Tips</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Book accommodations early for better rates</li>
                    <li>• Consider cooking some meals if staying in a rental</li>
                    <li>• Look for free walking tours and local events</li>
                    <li>• Travel during shoulder season for lower costs</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Transportation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">✈️ Getting There</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {tripPlan.transportation.gettingThere.map((option, index) => (
                      <li key={index}>• {option}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">🚗 Getting Around</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {tripPlan.transportation.gettingAround.map((option, index) => (
                      <li key={index}>• {option}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}