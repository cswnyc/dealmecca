'use client'

import Link from 'next/link'
import { LogoWithIcon } from '@/components/brand/Logo'
import { Heart, Mail, MessageSquare, FileText, Shield, Users } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <LogoWithIcon size="sm" />
            <p className="text-gray-600 text-sm">
              Intelligence that closes. The premier platform for media sales professionals.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/search" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Search Database
                </Link>
              </li>
              <li>
                <Link href="/orgs" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Organization Charts
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Events & Conferences
                </Link>
              </li>
              <li>
                <Link href="/forum" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Community Forum
                </Link>
              </li>
              <li>
                <Link href="/intelligence" className="text-gray-600 hover:text-gray-900 transition-colors">
                  AI Intelligence
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/forum/search" className="text-gray-600 hover:text-gray-900 transition-colors flex items-center">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Help Center
                </Link>
              </li>
              <li>
                <a href="mailto:support@getmecca.com" className="text-gray-600 hover:text-gray-900 transition-colors flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Us
                </a>
              </li>
              <li>
                <Link href="/forum" className="text-gray-600 hover:text-gray-900 transition-colors flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Community
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Documentation
                </a>
              </li>
            </ul>
          </div>

          {/* Account & Legal */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Account</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/settings" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Settings
                </Link>
              </li>
              <li>
                <Link href="/upgrade" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Upgrade Plan
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © 2024 DealMecca. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <p className="text-gray-500 text-sm flex items-center">
              Made with <Heart className="w-4 h-4 mx-1 text-red-500" /> for media sales teams
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
} 