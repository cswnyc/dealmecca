'use client'

import Link from 'next/link'
import { LogoWithIcon } from '@/components/brand/Logo'
import { Heart, Mail, Shield } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 mt-auto transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <LogoWithIcon size="sm" />
            <p className="text-slate-600 dark:text-slate-300 text-sm">
              Intelligence that closes. The premier platform for media sales professionals.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/organizations" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                  Organizations
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/forum" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                  Forum
                </Link>
              </li>
              <li>
                <a href="#features" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:support@getmecca.com" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Us
                </a>
              </li>
              <li>
                <Link href="/settings" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                  Settings
                </Link>
              </li>
              <li>
                <a href="#" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200 dark:border-slate-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            © 2024 DealMecca. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center">
              Made with <Heart className="w-4 h-4 mx-1 text-red-500" /> for media sales teams
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
} 