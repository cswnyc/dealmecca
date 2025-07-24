import { Suspense } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ContactCSVImport } from '@/components/admin/ContactCSVImport';
import { FileText, Upload, Users, ArrowLeft } from 'lucide-react';
import { Breadcrumb } from '@/components/admin/Breadcrumb';

function LoadingSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
      <div className="bg-white rounded-lg h-96 animate-pulse"></div>
    </div>
  );
}

export default function ContactImportPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="space-y-2">
          <Link href="/admin/orgs/contacts" className="inline-flex items-center text-blue-600 hover:text-blue-700">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Contacts
          </Link>
          <Breadcrumb items={[
            { label: 'Organizations', href: '/admin/orgs' },
            { label: 'Contacts', href: '/admin/orgs/contacts', icon: Users },
            { label: 'Import Contacts', icon: Upload }
          ]} />
        </div>

        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Upload className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Import Contacts</h1>
              <p className="text-gray-600">Upload CSV files to bulk import contact data</p>
            </div>
          </div>
        </div>

        {/* Instructions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              CSV Import Instructions
            </CardTitle>
            <CardDescription>
              Follow these guidelines to ensure successful data import
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Required Columns</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <code className="bg-gray-100 px-1 rounded">firstName</code> - Contact's first name</li>
                  <li>• <code className="bg-gray-100 px-1 rounded">lastName</code> - Contact's last name</li>
                  <li>• <code className="bg-gray-100 px-1 rounded">email</code> - Professional email address</li>
                  <li>• <code className="bg-gray-100 px-1 rounded">companyName</code> - Company name</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Optional Columns</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <code className="bg-gray-100 px-1 rounded">title</code> - Job title</li>
                  <li>• <code className="bg-gray-100 px-1 rounded">phone</code> - Phone number</li>
                  <li>• <code className="bg-gray-100 px-1 rounded">department</code> - Department</li>
                  <li>• <code className="bg-gray-100 px-1 rounded">seniority</code> - Seniority level</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Import Component */}
        <ContactCSVImport />
      </div>
    </Suspense>
  );
} 