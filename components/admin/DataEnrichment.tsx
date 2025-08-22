'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, 
  Globe, 
  Users, 
  Building2, 
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Zap
} from 'lucide-react';

interface EnrichmentOptions {
  companyLogos: boolean;
  employeeCount: boolean;
  industryClassification: boolean;
  socialMediaProfiles: boolean;
  contactPhotos: boolean;
  phoneNumbers: boolean;
  companySizeMetrics: boolean;
  technographics: boolean;
  addressVerification: boolean;
  emailVerification: boolean;
}

interface EnrichmentResult {
  processed: number;
  enriched: number;
  failed: number;
  creditsUsed: number;
}

export function DataEnrichment() {
  const [options, setOptions] = useState<EnrichmentOptions>({
    companyLogos: true,
    employeeCount: true,
    industryClassification: true,
    socialMediaProfiles: false,
    contactPhotos: false,
    phoneNumbers: false,
    companySizeMetrics: true,
    technographics: false,
    addressVerification: true,
    emailVerification: false
  });

  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichmentProgress, setEnrichmentProgress] = useState(0);
  const [results, setResults] = useState<EnrichmentResult | null>(null);
  const [selectedRecords, setSelectedRecords] = useState(1250);

  const enrichmentFeatures = [
    {
      key: 'companyLogos' as keyof EnrichmentOptions,
      title: 'Company Logos',
      description: 'Auto-fetch high-quality company logos and brand assets',
      icon: Building2,
      credits: 1,
      category: 'Basic'
    },
    {
      key: 'employeeCount' as keyof EnrichmentOptions,
      title: 'Employee Count',
      description: 'Get current employee headcount and growth trends',
      icon: Users,
      credits: 1,
      category: 'Basic'
    },
    {
      key: 'industryClassification' as keyof EnrichmentOptions,
      title: 'Industry Classification',
      description: 'Standardize industry categories using NAICS codes',
      icon: Globe,
      credits: 1,
      category: 'Basic'
    },
    {
      key: 'addressVerification' as keyof EnrichmentOptions,
      title: 'Address Verification',
      description: 'Verify and standardize company addresses',
      icon: MapPin,
      credits: 1,
      category: 'Basic'
    },
    {
      key: 'socialMediaProfiles' as keyof EnrichmentOptions,
      title: 'Social Media Profiles',
      description: 'Find LinkedIn, Twitter, and other social profiles',
      icon: Mail,
      credits: 2,
      category: 'Standard'
    },
    {
      key: 'companySizeMetrics' as keyof EnrichmentOptions,
      title: 'Company Size Metrics',
      description: 'Revenue estimates, funding data, and growth metrics',
      icon: TrendingUp,
      credits: 2,
      category: 'Standard'
    },
    {
      key: 'contactPhotos' as keyof EnrichmentOptions,
      title: 'Contact Photos',
      description: 'Professional headshot images for key contacts',
      icon: Users,
      credits: 3,
      category: 'Premium'
    },
    {
      key: 'emailVerification' as keyof EnrichmentOptions,
      title: 'Email Verification',
      description: 'Verify email deliverability and find catch-all patterns',
      icon: Mail,
      credits: 3,
      category: 'Premium'
    },
    {
      key: 'phoneNumbers' as keyof EnrichmentOptions,
      title: 'Phone Numbers',
      description: 'Direct dial and mobile numbers for contacts',
      icon: Phone,
      credits: 5,
      category: 'Premium'
    },
    {
      key: 'technographics' as keyof EnrichmentOptions,
      title: 'Technographics',
      description: 'Technology stack, tools, and platform usage data',
      icon: Zap,
      credits: 5,
      category: 'Premium'
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Basic': return 'bg-green-100 text-green-700 border-green-200';
      case 'Standard': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Premium': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const totalCredits = enrichmentFeatures.reduce((total, feature) => {
    return options[feature.key] ? total + feature.credits : total;
  }, 0);

  const totalCost = totalCredits * selectedRecords;

  const handleEnrichment = async () => {
    setIsEnriching(true);
    setEnrichmentProgress(0);
    
    // Simulate enrichment process
    const interval = setInterval(() => {
      setEnrichmentProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsEnriching(false);
          
          // Simulate realistic results
          const processed = selectedRecords;
          const enriched = Math.floor(processed * 0.92);
          const failed = processed - enriched;
          
          setResults({
            processed,
            enriched,
            failed,
            creditsUsed: totalCost
          });
          return 100;
        }
        return prev + Math.random() * 2;
      });
    }, 200);
  };

  const groupedFeatures = enrichmentFeatures.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, typeof enrichmentFeatures>);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
            Data Enrichment Options
          </CardTitle>
          <p className="text-sm text-gray-600">
            Enhance your uploaded data with additional information from premium sources
          </p>
        </CardHeader>
        <CardContent>
          {/* Records Selection */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-blue-900">Records to Enrich</h4>
                <p className="text-sm text-blue-700">Select the number of records to process</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-900">{selectedRecords.toLocaleString()}</p>
                <p className="text-sm text-blue-700">companies selected</p>
              </div>
            </div>
          </div>

          {/* Enrichment Features by Category */}
          {Object.entries(groupedFeatures).map(([category, features]) => (
            <div key={category} className="mb-6">
              <div className="flex items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-900 mr-3">{category} Features</h3>
                <Badge className={getCategoryColor(category)}>
                  {category}
                </Badge>
              </div>
              
              <div className="space-y-3">
                {features.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div key={feature.key} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5 text-blue-500" />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{feature.title}</span>
                            <Badge variant="outline" className="text-xs">
                              {feature.credits} {feature.credits === 1 ? 'credit' : 'credits'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{feature.description}</p>
                        </div>
                      </div>
                      <Switch
                        checked={options[feature.key]}
                        onCheckedChange={(checked) =>
                          setOptions(prev => ({ ...prev, [feature.key]: checked }))
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Cost Summary */}
          <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-lg font-semibold text-gray-900">Total Cost Estimate</p>
                <p className="text-sm text-gray-600">
                  {totalCredits} credits per record × {selectedRecords.toLocaleString()} records
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-blue-900">
                  {totalCost.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">credits</p>
              </div>
            </div>
            
            {totalCost > 10000 && (
              <div className="flex items-start space-x-2 p-3 bg-yellow-50 rounded border border-yellow-200">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">High Credit Usage</p>
                  <p className="text-yellow-700">Consider enriching in smaller batches to manage costs effectively.</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enrichment Progress */}
      {isEnriching && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Enriching Data</span>
                <span className="text-sm text-gray-600">{Math.round(enrichmentProgress)}%</span>
              </div>
              <Progress value={enrichmentProgress} className="h-3" />
              <div className="text-sm text-gray-600 space-y-1">
                <p>• Fetching company logos and brand assets</p>
                <p>• Updating employee counts and company metrics</p>
                <p>• Standardizing industry classifications</p>
                <p>• Verifying contact information</p>
                <p className="text-orange-600 font-medium">Processing {selectedRecords.toLocaleString()} records...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enrichment Results */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              Enrichment Complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-3xl font-bold text-blue-600">{results.processed.toLocaleString()}</div>
                <div className="text-sm text-gray-600 mt-1">Records Processed</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-3xl font-bold text-green-600">{results.enriched.toLocaleString()}</div>
                <div className="text-sm text-gray-600 mt-1">Successfully Enriched</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="text-3xl font-bold text-red-600">{results.failed.toLocaleString()}</div>
                <div className="text-sm text-gray-600 mt-1">Failed to Enrich</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-3xl font-bold text-purple-600">{results.creditsUsed.toLocaleString()}</div>
                <div className="text-sm text-gray-600 mt-1">Credits Used</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900">Enrichment Successful</p>
                    <p className="text-sm text-green-700">
                      {((results.enriched / results.processed) * 100).toFixed(1)}% of records were successfully enriched with additional data.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button onClick={() => {setResults(null); setEnrichmentProgress(0);}} className="flex-1">
                  Enrich More Data
                </Button>
                <Button variant="outline" asChild>
                  <a href="/orgs/companies">View Enhanced Companies</a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {!isEnriching && !results && (
        <div className="flex space-x-3">
          <Button 
            onClick={handleEnrichment} 
            disabled={totalCredits === 0}
            className="flex-1"
            size="lg"
          >
            {totalCredits > 0 ? `Enrich ${selectedRecords.toLocaleString()} Records` : 'Select Features to Continue'}
          </Button>
          <Button variant="outline" size="lg">
            Preview Sample
          </Button>
        </div>
      )}
    </div>
  );
}
