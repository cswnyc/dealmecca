'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BulkCompanyUpload } from '@/components/admin/BulkCompanyUpload';
import { DataEnrichment } from '@/components/admin/DataEnrichment';
import { 
  Upload, 
  Sparkles, 
  Database, 
  TrendingUp,
  Users,
  Building2
} from 'lucide-react';

export default function DataManagementPage() {
  const [activeTab, setActiveTab] = useState('upload');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Data Management</h1>
              <p className="text-gray-600 mt-2">
                Bulk upload companies and enhance your data with premium enrichment
              </p>
            </div>
            
            {/* Quick Stats */}
            <div className="hidden md:flex space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">12,450</div>
                <div className="text-sm text-gray-600">Total Companies</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">8,320</div>
                <div className="text-sm text-gray-600">Enriched Records</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">45,670</div>
                <div className="text-sm text-gray-600">Total Contacts</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <TabsList className="grid w-full sm:w-auto grid-cols-3 lg:grid-cols-4">
              <TabsTrigger value="upload" className="flex items-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>Bulk Upload</span>
              </TabsTrigger>
              <TabsTrigger value="enrichment" className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4" />
                <span>Data Enrichment</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Analytics</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content */}
          <TabsContent value="upload" className="space-y-6">
            <BulkCompanyUpload />
          </TabsContent>

          <TabsContent value="enrichment" className="space-y-6">
            <DataEnrichment />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Data Analytics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Upload Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Upload className="w-5 h-5 mr-2 text-blue-500" />
                    Upload Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">This Week</span>
                      <span className="font-semibold">2,450 records</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">This Month</span>
                      <span className="font-semibold">8,920 records</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Success Rate</span>
                      <span className="font-semibold text-green-600">94.2%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Enrichment Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
                    Enrichment Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Credits Used</span>
                      <span className="font-semibold">15,680</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Records Enriched</span>
                      <span className="font-semibold">8,320</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Enrichment Rate</span>
                      <span className="font-semibold text-green-600">89.1%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Data Quality */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="w-5 h-5 mr-2 text-green-500" />
                    Data Quality
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Complete Profiles</span>
                      <span className="font-semibold text-green-600">87%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Verified Companies</span>
                      <span className="font-semibold text-blue-600">72%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Duplicates Found</span>
                      <span className="font-semibold text-orange-600">3.2%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Upload Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { file: 'tech_companies_2024.csv', records: 1250, status: 'completed', time: '2 hours ago' },
                    { file: 'marketing_agencies.xlsx', records: 890, status: 'completed', time: '5 hours ago' },
                    { file: 'enterprise_clients.csv', records: 2100, status: 'processing', time: '1 day ago' },
                    { file: 'startup_directory.csv', records: 450, status: 'completed', time: '2 days ago' }
                  ].map((upload, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          upload.status === 'completed' ? 'bg-green-500' : 
                          upload.status === 'processing' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <div>
                          <p className="font-medium text-gray-900">{upload.file}</p>
                          <p className="text-sm text-gray-600">{upload.records.toLocaleString()} records</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{upload.time}</p>
                        <p className={`text-xs font-medium ${
                          upload.status === 'completed' ? 'text-green-600' : 
                          upload.status === 'processing' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {upload.status.charAt(0).toUpperCase() + upload.status.slice(1)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
