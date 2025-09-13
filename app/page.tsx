import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Users, Database, MessageSquare, Smartphone, Zap, ArrowRight, Star, Shield, Target, BarChart3, Building2 } from "lucide-react";
import Link from "next/link";
import { Logo, LogoWithIcon } from "@/components/brand/Logo";
import { Tagline, TaglineHero, RotatingTagline } from "@/components/brand/Tagline";
import { brandConfig } from "@/lib/brand-config";
import AuthHeader from "@/components/navigation/AuthHeader";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Premium Header */}
      <header className="nav-premium sticky top-0 z-50">
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
              <Link href="/org-charts" className="nav-link flex items-center space-x-1">
                <Building2 className="w-4 h-4" />
                <span>Org Charts</span>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">New</span>
              </Link>
              <a href="#features" className="nav-link">Features</a>
              <a href="#pricing" className="nav-link">Pricing</a>
            </nav>
            
            {/* Dynamic Auth Header */}
            <AuthHeader />
          </div>
        </div>
      </header>

      {/* Premium Hero Section */}
      <section className="section-hero bg-gradient-hero text-white relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-secondary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container-premium relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Hero Brand Name */}
            <div className="mb-12 animate-fade-in">
              <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight">
                Deal<span className="text-accent">Mecca</span>
              </h1>
              <div className="text-4xl md:text-5xl text-white font-bold tracking-tight">
                Intelligence that closes.
              </div>
            </div>
            
            {/* Primary CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-fade-in">
              <Link href="/auth/signup">
                <Button className="bg-accent hover:bg-accent-700 text-white font-bold text-lg px-8 py-4 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 min-w-[280px]">
                  Get Started at getmecca.com
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <a href="mailto:demo@getmecca.com?subject=Demo%20Request">
                <Button className="bg-white text-primary hover:bg-gray-100 font-bold text-lg px-8 py-4 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 min-w-[280px]">
                  Watch Demo
                </Button>
              </a>
            </div>
            
            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-white/80 animate-fade-in">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-secondary" />
                <span className="body-small">Enterprise-grade security</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-secondary" />
                <span className="body-small">Trusted by 500+ sales teams</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-secondary" />
                <span className="body-small">30% faster deal closure</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Features Section */}
      <section id="features" className="section-premium bg-white">
        <div className="container-premium">
          <div className="text-center mb-16">
            <h2 className="heading-section mb-6">
              Intelligence that transforms your sales process
            </h2>
            <p className="body-large max-w-3xl mx-auto">
              From fragmented data to unified insights. From missed opportunities to closed deals. 
              DealMecca turns your sales intelligence into your competitive advantage.
            </p>
          </div>

          {/* Forum Feature - Highlighted */}
          <div className="bg-gradient-to-br from-orange-50 to-red-100 rounded-xl p-8 mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <MessageSquare className="w-8 h-8 text-orange-600" />
              <h3 className="text-2xl font-bold">Media Industry Forum</h3>
              <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">Active</span>
            </div>
            <p className="text-gray-600 mb-6 text-lg">
              Connect with media professionals, share hot opportunities, and get industry insights. 
              Real-time discussions about deals, RFPs, and account intelligence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/forum">
                <Button className="bg-orange-600 hover:bg-orange-700 text-white font-medium px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                  Join Discussions
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <div className="flex items-center text-sm text-gray-600">
                <Users className="w-4 h-4 mr-1" />
                <span>11 active discussions • 7 categories</span>
              </div>
            </div>
          </div>

          {/* Org Chart Feature - Highlighted */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-8 mb-12">
            <div className="flex items-center space-x-4 mb-4">
              <Building2 className="w-8 h-8 text-blue-600" />
              <h3 className="text-2xl font-bold">Organization Directory</h3>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">New</span>
            </div>
            <p className="text-gray-600 mb-6 text-lg">
              Access comprehensive org charts for major media agencies and holding companies. 
              Find the right contacts with verified professional information and company hierarchies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/org-charts">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                  Explore Organizations
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <div className="flex items-center text-sm text-gray-600">
                <Building2 className="w-4 h-4 mr-1" />
                <span>9 companies • 8 verified contacts</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Feature 1 - Highlighted */}
            <div className="card-highlight p-8 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Database className="w-8 h-8 text-white" />
              </div>
              <h3 className="heading-subsection text-white mb-4">
                Unified Intelligence Hub
              </h3>
              <p className="body-medium text-white/90">
                Connect your CRM, ad-server, and billing data into one neural engine. 
                No more switching between systems or missing crucial signals.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card-premium p-8 text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="heading-subsection mb-4">
                Surgical Prospect Targeting
              </h3>
              <p className="body-medium">
                AI flags the ripest prospects and highest-risk accounts. 
                Spend your time on deals that matter, not chasing dead ends.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card-premium p-8 text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="w-8 h-8 text-accent" />
              </div>
              <h3 className="heading-subsection mb-4">
                Predictive Forecasting
              </h3>
              <p className="body-medium">
                Managers forecast with surgical accuracy. Real-time pipeline health, 
                deal momentum tracking, and revenue predictions you can trust.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="card-premium p-8 text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="heading-subsection mb-4">
                Real-Time Deal Alerts
              </h3>
              <p className="body-medium">
                Never miss a buying signal. Automated alerts for budget releases, 
                competitor moves, and decision-maker changes that impact your deals.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="card-premium p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Smartphone className="w-8 h-8 text-primary" />
              </div>
              <h3 className="heading-subsection mb-4">
                Mobile-First Intelligence
              </h3>
              <p className="body-medium">
                Your intelligence hub travels with you. Full functionality on mobile 
                with offline sync for when you're in the field or on the road.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="card-premium p-8 text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-accent" />
              </div>
              <h3 className="heading-subsection mb-4">
                Enterprise Security
              </h3>
              <p className="body-medium">
                Bank-level security with SOC 2 compliance. Your sales data is protected 
                with end-to-end encryption and granular access controls.
              </p>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg relative z-10 mb-20">
            <h3 className="text-2xl font-bold text-center mb-8 text-gray-900">DealMecca vs Others</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2">
                    <th className="text-left py-4 px-2 text-gray-900 font-semibold">Feature</th>
                    <th className="text-center py-4 px-2 text-primary font-bold">DealMecca</th>
                    <th className="text-center py-4 px-2 text-gray-700 font-semibold">Others</th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  <tr className="border-b">
                    <td className="py-4 px-2 font-medium text-gray-900">Annual Pricing</td>
                    <td className="py-4 px-2 text-center text-primary font-bold">$1,200 - $2,400</td>
                    <td className="py-4 px-2 text-center text-gray-700">~$5,700</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4 px-2 font-medium text-gray-900">Mobile Experience</td>
                    <td className="py-4 px-2 text-center"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></td>
                    <td className="py-4 px-2 text-center text-gray-700">Desktop Only</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4 px-2 font-medium text-gray-900">AI-Powered Search</td>
                    <td className="py-4 px-2 text-center"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></td>
                    <td className="py-4 px-2 text-center text-gray-700">Basic Search</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4 px-2 font-medium text-gray-900">Real-Time Updates</td>
                    <td className="py-4 px-2 text-center"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></td>
                    <td className="py-4 px-2 text-center text-gray-700">Manual Updates</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4 px-2 font-medium text-gray-900">CRM Integration</td>
                    <td className="py-4 px-2 text-center"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></td>
                    <td className="py-4 px-2 text-center text-gray-700">Limited</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-2 font-medium text-gray-900">Free Tier</td>
                    <td className="py-4 px-2 text-center"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></td>
                    <td className="py-4 px-2 text-center text-gray-700">None</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-gray-900 relative z-20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-200">
              Choose the plan that fits your sales goals. All plans include our mobile app and core features.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <Card className="border-2 border-gray-200 bg-white">
              <CardHeader className="text-center">
                <h3 className="text-2xl font-bold text-gray-900">Free</h3>
                <div className="text-4xl font-bold text-gray-900">$0</div>
                <p className="text-gray-600 mt-2">Perfect for getting started</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700">10 searches per month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700">Basic org charts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700">Community access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700">Mobile app</span>
                  </li>
                </ul>
                <Link href="/auth/signup">
                  <Button className="w-full bg-primary hover:bg-primary-800 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl">Get Started Free</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-2 border-primary relative bg-white">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">Most Popular</span>
              </div>
              <CardHeader className="text-center">
                <h3 className="text-2xl font-bold text-gray-900">Pro</h3>
                <div className="text-4xl font-bold text-gray-900">$99<span className="text-lg text-gray-600">/mo</span></div>
                <p className="text-gray-600 mt-2">For individual sales professionals</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700">Unlimited searches</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700">Advanced org charts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700">AI-powered recommendations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700">CRM integration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700">Priority support</span>
                  </li>
                </ul>
                <Link href="/auth/signup">
                  <Button className="w-full bg-accent hover:bg-accent-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl">Start Pro Trial</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Team Plan */}
            <Card className="border-2 border-secondary bg-white">
              <CardHeader className="text-center">
                <h3 className="text-2xl font-bold text-gray-900">Team</h3>
                <div className="text-4xl font-bold text-gray-900">$299<span className="text-lg text-gray-600">/mo</span></div>
                <p className="text-gray-600 mt-2">For sales teams and agencies</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700">Everything in Pro</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700">Up to 10 team members</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700">Team analytics dashboard</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700">Advanced reporting</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700">Dedicated account manager</span>
                  </li>
                </ul>
                <a href="mailto:sales@dealmecca.pro?subject=Team%20Plan%20Inquiry">
                  <Button className="w-full bg-secondary hover:bg-secondary-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl">Contact Sales</Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Media Sales Professionals
            </h2>
            <p className="text-xl text-gray-700">
              See what sales teams are saying about DealMecca
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 border-primary/20 shadow-xl bg-white hover:shadow-2xl transition-shadow duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-800 mb-6 text-lg leading-relaxed">
                  "DealMecca has completely transformed how I prospect. The mobile app means I can research clients 
                  on the go, and the AI recommendations have helped me find prospects I never would have discovered."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full mr-4 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">SJ</span>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Sarah Johnson</div>
                    <div className="text-sm text-gray-600">Account Executive, Radio Solutions</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-secondary/20 shadow-xl bg-white hover:shadow-2xl transition-shadow duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-800 mb-6 text-lg leading-relaxed">
                  "Finally, a platform built for how we actually work. The pricing is fair, the data is accurate, 
                  and the community insights have given us a real competitive edge in our market."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-secondary to-primary rounded-full mr-4 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">MC</span>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Mike Chen</div>
                    <div className="text-sm text-gray-600">Sales Director, Digital Media Group</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-accent/20 shadow-xl bg-white hover:shadow-2xl transition-shadow duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-800 mb-6 text-lg leading-relaxed">
                  "We switched from other platforms and immediately saved $4,000 per year while getting better features. 
                  The team dashboard and CRM integration have streamlined our entire sales process."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent to-secondary rounded-full mr-4 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">LR</span>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Lisa Rodriguez</div>
                    <div className="text-sm text-gray-600">VP Sales, Podcast Network</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gray-900 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Your Deal Pilgrimage Starts Here
          </h2>
          <p className="text-xl mb-8 text-gray-200">
            Get instant access to insights and opportunities in the digital advertising space.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/signup">
              <Button size="lg" className="px-8 bg-accent hover:bg-accent-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-lg">
                Start Your Deal Journey <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <a href="mailto:demo@dealmecca.pro?subject=Demo%20Request">
              <Button size="lg" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 font-semibold py-3 px-6 rounded-lg transition-colors">
                Schedule Demo
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-brand-blue to-brand-teal rounded-lg"></div>
                <span className="text-xl font-bold">DealMecca</span>
              </div>
              <p className="text-gray-300">
                The mecca for media deals. The ultimate destination for media sales professionals.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Mobile App</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-600">
            <p>&copy; 2024 DealMecca. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}