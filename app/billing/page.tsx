'use client'

import Link from 'next/link'
import { Receipt, CreditCard, Calendar, ArrowLeft, DollarSign, CheckCircle, Clock } from 'lucide-react'

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/forum" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Link>
              <div className="flex items-center space-x-2">
                <Receipt className="w-6 h-6 text-green-600" />
                <h1 className="text-xl font-semibold text-gray-900">Billing & Invoices</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Plan */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            Current Plan
          </h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Free Plan</h3>
                <p className="text-sm text-gray-600">Access to basic features</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">$0</div>
                <div className="text-sm text-gray-600">/month</div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/upgrade" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Upgrade Plan
            </Link>
          </div>
        </div>

        {/* Billing Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900">$0</div>
            <div className="text-sm text-gray-600">Total Spent</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <Receipt className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900">0</div>
            <div className="text-sm text-gray-600">Total Invoices</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900">Never</div>
            <div className="text-sm text-gray-600">Last Payment</div>
          </div>
        </div>

        {/* Optimization Notice */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="text-center">
            <Receipt className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Billing & Payment Center
            </h2>
            <p className="text-gray-600 mb-6">
              Manage your subscription, view invoices, and update payment methods.
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800">
              💳 Billing and payment systems are being enhanced for better security and reliability.
              Full functionality will be restored within 24-48 hours.
            </p>
          </div>

          {/* Billing Features */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 mb-3">Billing Features:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <CreditCard className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-gray-700">Payment Methods</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Receipt className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-700">Invoice History</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-500" />
                <span className="text-sm text-gray-700">Billing Schedule</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <DollarSign className="w-5 h-5 text-yellow-500" />
                <span className="text-sm text-gray-700">Usage Reports</span>
              </div>
            </div>
          </div>

          {/* Invoice History Placeholder */}
          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-3">Recent Invoices:</h3>
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No invoices yet</p>
              <p className="text-sm text-gray-500">Your billing history will appear here once you upgrade</p>
            </div>
          </div>

          <div className="text-center mt-6 space-y-3">
            <Link href="/upgrade" className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 mr-3">
              Upgrade Plan
            </Link>
            <Link href="/forum" className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Visit Community Forum
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}