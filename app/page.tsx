'use client';

import { useState, useEffect, useRef } from 'react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Users, Database, MessageSquare, Smartphone, Zap, ArrowRight, Star, Shield, Target, BarChart3, Building2, Lock, LogOut, ChevronDown, TrendingUp, Eye, Clock, Award } from "lucide-react";
import Link from "next/link";
import { Logo, LogoWithIcon } from "@/components/brand/Logo";
import { Tagline, TaglineHero, RotatingTagline } from "@/components/brand/Tagline";
import { brandConfig } from "@/lib/brand-config";
import AuthHeader from "@/components/navigation/AuthHeader";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { AnimatedText } from "@/components/ui/animated-text";
import { EnhancedFeatures, HighlightedFeatures } from "@/components/ui/enhanced-features";
import { useAuth } from "@/lib/auth/firebase-auth";
import { useUserRole } from "@/hooks/useUserRole";

export default function Home() {
  const { user, loading, signOut } = useAuth();
  const { isAdmin, isRegularUser, loading: roleLoading } = useUserRole();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const forumRef = useRef<HTMLElement>(null);
  const orgChartsRef = useRef<HTMLElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Determine redirect URL based on user role
  const getRedirectUrl = () => {
    if (isAdmin) {
      return '/admin';
    }
    return '/forum';
  };

  // Determine button text based on user role
  const getButtonText = () => {
    if (isAdmin) {
      return 'Go to Admin';
    }
    return 'Go to Forum';
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut();
      setShowDropdown(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Smooth scroll to sections
  const scrollToSection = (ref: React.RefObject<HTMLElement>) => {
    ref.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  return (
    <div className="min-h-screen">
      {/* Premium Header */}
      <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 transition-colors duration-300">
        <div className="container-premium">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/">
              <LogoWithIcon 
                size="md" 
                className="cursor-pointer"
              />
            </Link>
            
            {/* Navigation Links */}
            <nav className="hidden md:flex space-x-8">
              {user ? (
                <>
                  <Link href="/forum" className="nav-link flex items-center space-x-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>Forum</span>
                    <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">Active</span>
                  </Link>
                  <Link href="/organizations" className="nav-link flex items-center space-x-1">
                    <Building2 className="w-4 h-4" />
                    <span>Org Charts</span>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">New</span>
                  </Link>
                </>
              ) : (
                <>
                  <button
                    onClick={() => scrollToSection(forumRef)}
                    className="nav-link flex items-center space-x-1 cursor-pointer hover:text-primary transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Forum</span>
                  </button>
                  <button
                    onClick={() => scrollToSection(orgChartsRef)}
                    className="nav-link flex items-center space-x-1 cursor-pointer hover:text-primary transition-colors"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Org Charts</span>
                  </button>
                </>
              )}
              <a href="#features" className="nav-link">Features</a>
              <a href="#pricing" className="nav-link">Pricing</a>
            </nav>

            {/* Right side controls */}
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Welcome back!
                  </span>
                  <div className="relative" ref={dropdownRef}>
                    <Button
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
                      disabled={roleLoading}
                    >
                      <span>{roleLoading ? 'Loading...' : getButtonText()}</span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>

                    {showDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-950 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 z-50">
                        <Link href={getRedirectUrl()}>
                          <button
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-t-lg transition-colors"
                            onClick={() => setShowDropdown(false)}
                          >
                            {roleLoading ? 'Loading...' : getButtonText()}
                          </button>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-b-lg transition-colors flex items-center space-x-2"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <Link href="/auth/firebase-signin">
                    <Button variant="ghost" className="text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary font-medium">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Clean Hero Section with White Background */}
      <section className="relative pt-20 pb-32 overflow-hidden min-h-[90vh] flex items-center bg-white dark:bg-slate-950">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-grid-slate-100/30 dark:bg-grid-slate-800/25 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]"></div>


        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="text-center">
            {/* Animated Hero Title */}
            <div className="mb-8">
              <h1 className="heading-display text-slate-900 dark:text-white mb-6">
                Deal<span className="text-gradient-primary">Mecca</span>
              </h1>
              <AnimatedText
                text="Close More Deals With Insider Intelligence"
                highlightWord="Close"
                typewriterWords={["Intelligence"]}
                className="text-xl md:text-2xl text-slate-700 dark:text-slate-200 max-w-3xl mx-auto leading-relaxed"
                highlightClassName="font-bold text-slate-900 dark:text-white"
              />
            </div>

            {/* Clean CTA Button */}
            <div className="flex justify-center items-center mb-16">
              <Link href="/auth/signup">
                <Button className="font-bold text-lg px-12 py-5 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 min-w-[280px]" style={{background: 'var(--gradient-accent)', color: 'white'}}>
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>

            {/* Minimal Social Proof */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2 text-sm bg-slate-100 dark:bg-slate-950 px-4 py-2 rounded-full">
                <Shield className="w-4 h-4" />
                <span>Enterprise Security</span>
              </div>
              <div className="flex items-center gap-2 text-sm bg-slate-100 dark:bg-slate-950 px-4 py-2 rounded-full">
                <Users className="w-4 h-4" />
                <span>500+ Sales Teams</span>
              </div>
              <div className="flex items-center gap-2 text-sm bg-slate-100 dark:bg-slate-950 px-4 py-2 rounded-full">
                <BarChart3 className="w-4 h-4" />
                <span>30% Faster Closure</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlighted Features */}
      <HighlightedFeatures />

      {/* Forum Showcase Section */}
      <section ref={forumRef} className="py-24 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Content */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl" style={{background: 'var(--gradient-accent)'}}>
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <span className="bg-orange-100 text-orange-800 text-sm font-semibold px-3 py-1 rounded-full">Most Active</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
                Connect with 15,000+
                <span className="block text-gradient-primary">
                  Media Sales Pros
                </span>
              </h2>

              <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                Stop going it alone. Get real-time insights from the largest community of media sales professionals.
                Share strategies, discover opportunities, and learn from deals worth millions.
              </p>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Live Deal Alerts</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Real-time opportunities</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Market Intel</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Competitor insights</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Expert Network</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Industry veterans</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Proven Strategies</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">7-figure playbooks</div>
                  </div>
                </div>
              </div>

              <Link href="/auth/signup">
                <Button className="text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group" style={{background: 'var(--gradient-accent)'}}>
                  Join the Community
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Right Column - Visual */}
            <div className="relative">
              <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* Mock Forum Header */}
                <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-6 h-6" />
                    <span className="font-semibold">DealMecca Forum</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm">2,847 online</span>
                  </div>
                </div>

                {/* Mock Forum Posts */}
                <div className="p-4 space-y-4">
                  <div className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full" style={{background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}}></div>
                      <span className="font-medium text-slate-900 dark:text-white">Sarah M.</span>
                      <span className="text-sm text-slate-500">• 3min ago</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 text-sm">🔥 Just closed a $2.8M radio package using the org chart strategy from last week's thread. Game changer!</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span>👍 47</span>
                      <span>💬 12 replies</span>
                    </div>
                  </div>

                  <div className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full" style={{background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'}}></div>
                      <span className="font-medium text-slate-900 dark:text-white">Mike K.</span>
                      <span className="text-sm text-slate-500">• 12min ago</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 text-sm">Anyone have contacts at MediaCorp's new LA office? Hearing they're expanding digital ad spend by 40%...</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span>👍 23</span>
                      <span>💬 8 replies</span>
                    </div>
                  </div>

                  <div className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full" style={{background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}}></div>
                      <span className="font-medium text-slate-900 dark:text-white">Lisa R.</span>
                      <span className="text-sm text-slate-500">• 28min ago</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 text-sm">📊 Q4 programmatic rates are up 15% across all verticals. Perfect time to pitch premium inventory...</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span>👍 61</span>
                      <span>💬 24 replies</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Stats */}
              <div className="absolute -top-6 -right-6 bg-white dark:bg-slate-950 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-4">
                <div className="text-center">
                  <div className="text-2xl font-black text-slate-900 dark:text-white">15.2K</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Active Members</div>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-950 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-4">
                <div className="text-center">
                  <div className="text-2xl font-black text-slate-900 dark:text-white">$840M</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Deals Shared</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Grid */}
      <EnhancedFeatures />

      {/* Org Charts Showcase Section */}
      <section ref={orgChartsRef} className="py-24 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Visual */}
            <div className="relative">
              <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* Mock Org Chart Header */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-700 text-white p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-6 h-6" />
                    <span className="font-semibold">MediaCorp Organization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Updated 2hrs ago</span>
                  </div>
                </div>

                {/* Mock Org Chart */}
                <div className="p-6">
                  {/* CEO Level */}
                  <div className="text-center mb-6">
                    <div className="inline-block bg-white dark:bg-slate-950 border-2 border-slate-900 rounded-lg p-4 shadow-lg">
                      <div className="w-12 h-12 rounded-full mx-auto mb-2" style={{background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)'}}></div>
                      <div className="font-bold text-slate-900 dark:text-white text-sm">Jennifer Walsh</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">CEO</div>
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">📧 Available</div>
                    </div>
                  </div>

                  {/* VP Level */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-600 rounded-lg p-3 shadow">
                      <div className="w-10 h-10 rounded-full mx-auto mb-2" style={{background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'}}></div>
                      <div className="font-bold text-slate-900 dark:text-white text-xs text-center">Mike Chen</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 text-center">VP Sales</div>
                      <div className="text-xs text-amber-600 dark:text-amber-400 text-center mt-1">📧 Premium contact</div>
                    </div>
                    <div className="bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-600 rounded-lg p-3 shadow">
                      <div className="w-10 h-10 rounded-full mx-auto mb-2" style={{background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}}></div>
                      <div className="font-bold text-slate-900 dark:text-white text-xs text-center">Sarah Kim</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 text-center">VP Marketing</div>
                      <div className="text-xs text-red-600 dark:text-red-400 text-center mt-1">🔒 Contact needed</div>
                    </div>
                  </div>

                  {/* Director Level */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded p-2">
                      <div className="w-8 h-8 rounded-full mx-auto mb-1 bg-slate-400"></div>
                      <div className="text-xs font-medium text-slate-900 dark:text-white text-center">Alex Rivera</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 text-center">Digital Sales Dir.</div>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded p-2">
                      <div className="w-8 h-8 rounded-full mx-auto mb-1 bg-slate-400"></div>
                      <div className="text-xs font-medium text-slate-900 dark:text-white text-center">Tom Wilson</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 text-center">Radio Sales Dir.</div>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded p-2">
                      <div className="w-8 h-8 rounded-full mx-auto mb-1 bg-slate-400"></div>
                      <div className="text-xs font-medium text-slate-900 dark:text-white text-center">Lisa Park</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 text-center">Brand Partnerships</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Insights */}
              <div className="absolute -top-6 -left-6 bg-white dark:bg-slate-950 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-4">
                <div className="text-center">
                  <div className="text-2xl font-black text-slate-900 dark:text-white">98%</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Accuracy Rate</div>
                </div>
              </div>

              <div className="absolute -bottom-6 -right-6 bg-white dark:bg-slate-950 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-4">
                <div className="text-center">
                  <div className="text-2xl font-black text-slate-900 dark:text-white">24hr</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Update Cycle</div>
                </div>
              </div>
            </div>

            {/* Right Column - Content */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl" style={{background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'}}>
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">New Feature</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
                Navigate Any Organization
                <span className="block text-gradient-primary">
                  Like an Insider
                </span>
              </h2>

              <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                Stop guessing who makes decisions. Get real-time org charts with direct contact information,
                decision-making power levels, and recent changes that give you the edge.
              </p>

              <div className="grid grid-cols-1 gap-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                    <Target className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-lg mb-2">Find the Real Decision Makers</div>
                    <div className="text-slate-600 dark:text-slate-400">Skip the gatekeepers. Know exactly who controls the budget and when they're available.</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-lg mb-2">Real-Time Updates</div>
                    <div className="text-slate-600 dark:text-slate-400">Get notified instantly when key personnel changes happen that create new opportunities.</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-lg mb-2">Verified Contact Info</div>
                    <div className="text-slate-600 dark:text-slate-400">Every email and phone number is verified within 30 days. No more bounced emails or dead ends.</div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6 mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full" style={{background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}}></div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Sarah M.</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Account Executive, Radio Network</div>
                  </div>
                </div>
                <p className="text-slate-700 dark:text-slate-300 italic">
                  "The org chart showed me that the new CMO used to work at my biggest client. One LinkedIn message later, I had a $2.8M deal in the pipeline."
                </p>
              </div>

              <Link href="/auth/signup">
                <Button className="bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group">
                  Explore Org Charts
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="heading-section text-slate-900 dark:text-slate-100 mb-6">
              Trusted by media sales
              <span className="block text-gradient-primary">
                professionals everywhere
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              See what sales teams are saying about DealMecca's impact on their success
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-950 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-slate-700 dark:text-slate-300 mb-8 text-lg leading-relaxed">
                "DealMecca has completely transformed how I prospect. The mobile app means I can research clients
                on the go, and the AI recommendations have helped me find prospects I never would have discovered."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full mr-4 flex items-center justify-center" style={{background: 'var(--gradient-accent)'}}>
                  <span className="text-white font-bold text-lg">SJ</span>
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">Sarah Johnson</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Account Executive, Radio Solutions</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-950 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-slate-700 dark:text-slate-300 mb-8 text-lg leading-relaxed">
                "Finally, a platform built for how we actually work. The pricing is fair, the data is accurate,
                and the community insights have given us a real competitive edge in our market."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full mr-4 flex items-center justify-center" style={{background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'}}>
                  <span className="text-white font-bold text-lg">MC</span>
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">Mike Chen</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Sales Director, Digital Media Group</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-950 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-slate-700 dark:text-slate-300 mb-8 text-lg leading-relaxed">
                "We switched from other platforms and immediately saved $4,000 per year while getting better features.
                The team dashboard and CRM integration have streamlined our entire sales process."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full mr-4 flex items-center justify-center" style={{background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}}>
                  <span className="text-white font-bold text-lg">LR</span>
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">Lisa Rodriguez</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">VP Sales, Podcast Network</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="heading-section text-slate-900 dark:text-slate-100 mb-6">
              Simple, transparent pricing
              <span className="block text-gradient-primary">
                that scales with you
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Choose the plan that fits your sales goals. All plans include our mobile app and core features.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className="bg-slate-50 dark:bg-slate-950/50 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 group">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Free</h3>
                <div className="text-5xl font-black text-slate-900 dark:text-slate-100 mb-2">$0</div>
                <p className="text-slate-600 dark:text-slate-400">Perfect for getting started</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">10 searches per month</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">Basic org charts</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">Community access</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">Mobile app</span>
                </li>
              </ul>
              <Link href="/auth/signup">
                <button className="w-full bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl group-hover:scale-105">
                  Get Started Free
                </button>
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-white dark:bg-slate-950 rounded-2xl p-8 border-2 border-transparent shadow-xl hover:shadow-2xl transition-all duration-300 group relative" style={{borderImage: 'var(--gradient-accent) 1'}}>
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg" style={{background: 'var(--gradient-accent)'}}>Most Popular</span>
              </div>
              <div className="text-center mb-8 pt-4">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Pro</h3>
                <div className="text-5xl font-black text-slate-900 dark:text-slate-100 mb-2">
                  $99<span className="text-xl text-slate-600 dark:text-slate-400">/mo</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400">For individual sales professionals</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">Unlimited searches</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">Advanced org charts</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">AI-powered recommendations</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">CRM integration</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">Priority support</span>
                </li>
              </ul>
              <Link href="/auth/signup">
                <button className="w-full text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl group-hover:scale-105" style={{background: 'var(--gradient-accent)'}}>
                  Start Pro Trial
                </button>
              </Link>
            </div>

            {/* Team Plan */}
            <div className="bg-slate-50 dark:bg-slate-950/50 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 group">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Team</h3>
                <div className="text-5xl font-black text-slate-900 dark:text-slate-100 mb-2">
                  $299<span className="text-xl text-slate-600 dark:text-slate-400">/mo</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400">For sales teams and agencies</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">Everything in Pro</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">Up to 10 team members</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">Team analytics dashboard</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">Advanced reporting</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">Dedicated account manager</span>
                </li>
              </ul>
              <a href="mailto:sales@dealmecca.pro?subject=Team%20Plan%20Inquiry">
                <button className="w-full bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl group-hover:scale-105">
                  Contact Sales
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-24 bg-slate-100 dark:bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="heading-section text-slate-900 dark:text-slate-100 mb-6">
            Your deal pilgrimage
            <span className="block text-gradient-primary">
              starts here
            </span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
            Get instant access to insights and opportunities in the digital advertising space.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/signup">
              <button className="px-8 py-4 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center" style={{background: 'var(--gradient-accent)'}}>
                Start Your Deal Journey <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </Link>
            <a href="mailto:demo@dealmecca.pro?subject=Demo%20Request">
              <button className="bg-transparent border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold text-lg px-8 py-4 rounded-xl transition-all duration-300">
                Schedule Demo
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 py-12 px-4 transition-colors duration-300">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-lg" style={{background: 'var(--gradient-primary)'}}></div>
                <span className="text-xl font-bold text-slate-900 dark:text-slate-100">DealMecca</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                The mecca for media deals. The ultimate destination for media sales professionals.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-slate-900 dark:text-slate-100">Product</h4>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">API</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Mobile App</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-slate-900 dark:text-slate-100">Company</h4>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-slate-900 dark:text-slate-100">Support</h4>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-700 mt-8 pt-8 text-center text-slate-500 dark:text-slate-400">
            <p>&copy; 2024 DealMecca. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}