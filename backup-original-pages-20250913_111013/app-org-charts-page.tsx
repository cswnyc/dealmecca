import { Metadata } from 'next';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { EnhancedOrgCharts } from '@/components/org-charts/EnhancedOrgCharts';
import { ForumLayout } from '@/components/layout/ForumLayout';

export const metadata: Metadata = {
  title: 'Organization Charts - Media Industry Directory',
  description: 'Explore organizational hierarchies and leadership structures across media agencies, holding companies, and brands.',
};

export default function OrgChartsPage() {
  return (
    <ForumLayout>
      <Suspense fallback={
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-12 bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-1 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6 border">
                  <div className="flex space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      }>
        <EnhancedOrgCharts />
      </Suspense>
    </ForumLayout>
  );
}