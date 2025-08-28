'use client';

import { useState } from 'react';
import { optimizeListingPricing } from '../../actions/claude-agents';

interface PricingOptimizerProps {
  listingId: string;
  currentPriceMin?: number;
  currentPriceMax?: number;
  onPricingUpdate?: (min: number, max: number) => void;
}

interface PricingData {
  suggestedMin: number;
  suggestedMax: number;
  factors: string[];
  seasonalTips: string;
  competitiveAdvantages: string[];
}

export function PricingOptimizer({
  listingId,
  currentPriceMin,
  currentPriceMax,
  onPricingUpdate
}: PricingOptimizerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pricingData, setPricingData] = useState<PricingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await optimizeListingPricing(listingId);
      
      if (result.success && result.data) {
        setPricingData(result.data);
        setIsExpanded(true);
      } else {
        setError(result.error || 'Failed to analyze pricing');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyPricing = () => {
    if (pricingData && onPricingUpdate) {
      onPricingUpdate(pricingData.suggestedMin, pricingData.suggestedMax);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-purple-50">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-purple-900">AI Pricing Optimizer</h4>
          <p className="text-sm text-purple-700">
            Get market-based pricing recommendations
          </p>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="px-3 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 disabled:opacity-50"
        >
          {isAnalyzing ? 'Analyzing...' : '💰 Analyze Pricing'}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Current Pricing */}
      {(currentPriceMin || currentPriceMax) && (
        <div className="text-sm text-gray-600">
          <strong>Current pricing:</strong> ${currentPriceMin || 0}–${currentPriceMax || 0}/night
        </div>
      )}

      {/* AI Analysis Results */}
      {pricingData && (
        <div className="space-y-4">
          {/* Price Comparison */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-white rounded border">
              <div className="text-sm text-gray-600">Suggested Range</div>
              <div className="text-lg font-semibold text-purple-800">
                ${pricingData.suggestedMin}–${pricingData.suggestedMax}
              </div>
              <div className="text-xs text-gray-500">per night</div>
            </div>
            
            <div className="p-3 bg-white rounded border">
              <div className="text-sm text-gray-600">Potential Increase</div>
              <div className="text-lg font-semibold text-green-600">
                {currentPriceMin && pricingData.suggestedMin > currentPriceMin 
                  ? `+$${pricingData.suggestedMin - currentPriceMin}`
                  : currentPriceMin && pricingData.suggestedMin < currentPriceMin
                  ? `-$${currentPriceMin - pricingData.suggestedMin}`
                  : 'New pricing'}
              </div>
              <div className="text-xs text-gray-500">vs current min</div>
            </div>
          </div>

          {/* Apply Pricing Button */}
          {onPricingUpdate && (
            <button
              onClick={handleApplyPricing}
              className="w-full py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
            >
              Apply Suggested Pricing
            </button>
          )}

          {/* Detailed Analysis */}
          <div className="space-y-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-purple-600 hover:text-purple-800"
            >
              {isExpanded ? '▼ Hide' : '▶ Show'} detailed analysis
            </button>

            {isExpanded && (
              <div className="space-y-3 bg-white p-3 rounded border">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Key Pricing Factors:</h5>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {pricingData.factors.map((factor, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-purple-500 mr-2">•</span>
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Seasonal Recommendations:</h5>
                  <p className="text-sm text-gray-700">{pricingData.seasonalTips}</p>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Your Competitive Advantages:</h5>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {pricingData.competitiveAdvantages.map((advantage, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        {advantage}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}