'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  MessageSquare, 
  Search, 
  Building2, 
  Users, 
  ArrowRight, 
  Crown, 
  Calendar,
  BarChart3
} from 'lucide-react';

export default function SimpleDashboardPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-teal-50">
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-xl font-bold text-foreground">
                DealMecca
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/signin" className="text-muted-foreground hover:text-foreground">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Dashboard (Simple)
          </h1>
          <p className="text-muted-foreground mb-6">
            Simple dashboard page is temporarily disabled during deployment migration.
          </p>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            ⚠️ Dashboard functionality is temporarily disabled during deployment migration.
            Enhanced dashboard will be restored soon.
          </p>
        </div>
        
        <div className="text-center">
          <Link href="/dashboard" className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Go to Main Dashboard
          </Link>
        </div>
        
        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            ← Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}