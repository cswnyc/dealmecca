import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Users, Database, MessageSquare, Smartphone, Zap, ArrowRight, Star, Shield, Target, BarChart3, Building2 } from "lucide-react";
import Link from "next/link";
import { Logo, LogoWithIcon } from "@/components/brand/Logo";
import { Tagline, TaglineHero, RotatingTagline } from "@/components/brand/Tagline";
import { brandConfig } from "@/lib/brand-config";
import AuthHeader from "@/components/navigation/AuthHeader";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { AnimatedText } from "@/components/ui/animated-text";
import { LogoPlaceholders } from "@/components/ui/logo-placeholders";
import { EnhancedFeatures, HighlightedFeatures } from "@/components/ui/enhanced-features";
import { StatsSection } from "@/components/ui/stats-section";

export default function Home() {
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
              <a href="#features" className="nav-link">Features</a>
              <a href="#pricing" className="nav-link">Pricing</a>
            </nav>

            {/* Right side controls */}
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link href="/auth/firebase-signin">
                <Button variant="ghost" className="text-gray-700 hover:text-primary font-medium">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/firebase-signin">
                <Button className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Clean Hero Section with White Background */}
      <section className="relative pt-20 pb-32 overflow-hidden min-h-[90vh] flex items-center bg-white dark:bg-slate-900">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-grid-slate-100/30 dark:bg-grid-slate-800/25 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]"></div>

        {/* Logo Placeholder Elements */}
        <LogoPlaceholders />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="text-center">
            {/* Animated Hero Title */}
            <div className="mb-8">
              <h1 className="heading-display text-slate-900 dark:text-white mb-6">
                Deal<span className="text-gradient-primary">Mecca</span>
              </h1>
              <AnimatedText
                text="Intelligence that closes deals faster"
                highlightWord="closes"
                typewriterWords={["deals", "faster"]}
                className="text-xl md:text-2xl text-slate-700 dark:text-slate-200 max-w-3xl mx-auto leading-relaxed"
                highlightClassName="font-bold text-slate-900 dark:text-white"
              />
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mt-4">
                The modern CRM built for media sales teams.
              </p>
            </div>

            {/* Clean CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link href="/auth/signup">
                <Button className="font-bold text-lg px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 min-w-[240px]" style={{background: 'var(--gradient-accent)', color: 'white'}}>
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <a href="mailto:demo@getmecca.com?subject=Demo%20Request">
                <Button variant="outline" className="border-2 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-lg px-8 py-4 rounded-xl transition-all duration-300 min-w-[240px]">
                  Watch Demo
                </Button>
              </a>
            </div>

            {/* Minimal Social Proof */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2 text-sm bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full">
                <Shield className="w-4 h-4" />
                <span>Enterprise Security</span>
              </div>
              <div className="flex items-center gap-2 text-sm bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full">
                <Users className="w-4 h-4" />
                <span>500+ Sales Teams</span>
              </div>
              <div className="flex items-center gap-2 text-sm bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full">
                <BarChart3 className="w-4 h-4" />
                <span>30% Faster Closure</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlighted Features */}
      <HighlightedFeatures />

      {/* Enhanced Features Grid */}
      <EnhancedFeatures />

      {/* Stats & Metrics Section */}
      <StatsSection />

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white dark:bg-slate-800">
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
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 group">
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
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border-2 border-transparent shadow-xl hover:shadow-2xl transition-all duration-300 group relative" style={{borderImage: 'var(--gradient-accent) 1'}}>
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
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 group">
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

      {/* Testimonials Section */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
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
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 group">
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

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 group">
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

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 group">
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

      {/* CTA Section */}
      <section className="py-24 bg-slate-100 dark:bg-slate-800">
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