'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { generateTripPlan } from '../../actions/claude-agents';
import { TripPlanRequest } from '../../lib/claude-agents';
import { TripPlanDisplay } from './TripPlanDisplay';

const INTERESTS = [
  'Culture & Museums',
  'Food & Dining', 
  'Nightlife & Entertainment',
  'Outdoor Adventures',
  'Beach & Water Sports',
  'Shopping',
  'History & Architecture',
  'Art & Music',
  'Nature & Parks',
  'Local Experiences'
];

const ACCOMMODATION_TYPES = [
  { value: 'any', label: 'Any Type' },
  { value: 'house', label: 'Entire House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'condo', label: 'Condo' }
];

export function TripPlannerWizard() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [tripPlan, setTripPlan] = useState(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<TripPlanRequest>({
    destination: '',
    startDate: '',
    endDate: '',
    travelers: 2,
    budget: { min: 100, max: 300 },
    interests: [],
    accommodationType: 'any'
  });

  // Auto-fill form from URL parameters
  useEffect(() => {
    const destination = searchParams.get('destination');
    const guests = searchParams.get('guests');
    const budget = searchParams.get('budget');
    const bedrooms = searchParams.get('bedrooms');
    
    if (destination || guests || budget) {
      setFormData(prev => ({
        ...prev,
        destination: destination || prev.destination,
        travelers: guests ? parseInt(guests) : prev.travelers,
        budget: budget ? { min: 50, max: parseInt(budget) } : prev.budget,
        // Use bedroom count to suggest accommodation type
        accommodationType: bedrooms && parseInt(bedrooms) >= 3 ? 'house' : prev.accommodationType
      }));
      
      // If we have destination, skip to step 2 or auto-generate
      if (destination) {
        setStep(2);
      }
    }
  }, [searchParams]);

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent as keyof TripPlanRequest] as any, [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateTripPlan(formData);
      
      if (result.success && result.data) {
        setTripPlan(result.data);
        setStep(4); // Go to results step
      } else {
        setError(result.error || 'Failed to generate trip plan');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  if (step === 4 && tripPlan) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Your Trip Plan</h2>
          <button
            onClick={() => {
              setStep(1);
              setTripPlan(null);
              setError(null);
            }}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Plan Another Trip
          </button>
        </div>
        <TripPlanDisplay tripPlan={tripPlan} originalRequest={formData} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Progress Bar */}
      <div className="flex items-center justify-between">
        {[1, 2, 3].map((stepNum) => (
          <div key={stepNum} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              stepNum <= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {stepNum}
            </div>
            {stepNum < 3 && (
              <div className={`w-16 h-1 mx-2 ${
                stepNum < step ? 'bg-blue-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
        {/* Step 1: Destination & Dates */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Where & When</h2>
              <p className="text-gray-600">Tell us about your destination and travel dates</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Destination
                </label>
                <input
                  type="text"
                  value={formData.destination}
                  onChange={(e) => handleInputChange('destination', e.target.value)}
                  placeholder="e.g., Palm Springs, CA or Austin, Texas"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Number of Travelers
                </label>
                <select
                  value={formData.travelers}
                  onChange={(e) => handleInputChange('travelers', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'person' : 'people'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={nextStep}
                disabled={!formData.destination || !formData.startDate || !formData.endDate}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next: Preferences
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Interests & Budget */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Interests</h2>
              <p className="text-gray-600">What would you like to experience on your trip?</p>
              
              {/* Quick generate option if coming from homepage */}
              {searchParams.get('destination') && (
                <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                  <p className="text-sm text-purple-700 mb-3">
                    ✨ Ready to generate your trip plan for <strong>{searchParams.get('destination')}</strong>?
                  </p>
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50 transition-all"
                  >
                    {isGenerating ? 'Generating...' : '⚡ Quick Generate Trip Plan'}
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-4">
                Select Your Interests (choose any that appeal to you)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {INTERESTS.map(interest => (
                  <label key={interest} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.interests.includes(interest)}
                      onChange={() => handleInterestToggle(interest)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{interest}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Budget per Person (USD per day)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="number"
                    value={formData.budget.min}
                    onChange={(e) => handleInputChange('budget.min', parseInt(e.target.value) || 0)}
                    placeholder="Min budget"
                    min="50"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum per day</p>
                </div>
                <div>
                  <input
                    type="number"
                    value={formData.budget.max}
                    onChange={(e) => handleInputChange('budget.max', parseInt(e.target.value) || 0)}
                    placeholder="Max budget"
                    min="50"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Maximum per day</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={prevStep}
                className="px-6 py-3 text-gray-600 font-semibold rounded-xl hover:text-gray-800"
              >
                Back
              </button>
              <button
                onClick={nextStep}
                disabled={formData.interests.length === 0}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next: Accommodation
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Accommodation & Generate */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Accommodation Preference</h2>
              <p className="text-gray-600">What type of place would you like to stay?</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-4">
                Preferred Accommodation Type
              </label>
              <div className="space-y-3">
                {ACCOMMODATION_TYPES.map(type => (
                  <label key={type.value} className="flex items-center space-x-3 cursor-pointer p-3 border border-gray-200 rounded-xl hover:bg-gray-50">
                    <input
                      type="radio"
                      name="accommodationType"
                      value={type.value}
                      checked={formData.accommodationType === type.value}
                      onChange={(e) => handleInputChange('accommodationType', e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Trip Summary */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
              <h3 className="font-semibold text-blue-900 mb-3">Trip Summary</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Destination:</strong> {formData.destination}</p>
                <p><strong>Dates:</strong> {formData.startDate} to {formData.endDate}</p>
                <p><strong>Travelers:</strong> {formData.travelers} {formData.travelers === 1 ? 'person' : 'people'}</p>
                <p><strong>Budget:</strong> ${formData.budget.min}-${formData.budget.max} per person per day</p>
                <p><strong>Interests:</strong> {formData.interests.join(', ')}</p>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-100 border border-red-300 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-between pt-4">
              <button
                onClick={prevStep}
                disabled={isGenerating}
                className="px-6 py-3 text-gray-600 font-semibold rounded-xl hover:text-gray-800 disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={handleGeneratePlan}
                disabled={isGenerating}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Your Perfect Trip...
                  </span>
                ) : (
                  '✨ Generate My Trip Plan'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}