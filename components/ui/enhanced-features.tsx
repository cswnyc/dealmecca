'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  Database,
  BarChart3,
  Target,
  Users,
  Zap,
  Shield,
  TrendingUp,
  Globe,
  MessageSquare,
  Building2,
  Bell,
  Eye
} from 'lucide-react';

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
  delay: number;
}

function FeatureCard({ icon: Icon, title, description, gradient, delay }: FeatureCardProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      className="group relative bg-white dark:bg-slate-950 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300"
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
    >
      {/* Gradient Background */}
      <div className={`absolute inset-0 ${gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />

      {/* Icon */}
      <motion.div
        className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
        style={{background: 'var(--gradient-accent)'}}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.5, delay: delay + 0.1 }}
      >
        <Icon className="w-7 h-7 text-white" />
      </motion.div>

      {/* Content */}
      <motion.h3
        className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5, delay: delay + 0.2 }}
      >
        {title}
      </motion.h3>

      <motion.p
        className="text-slate-600 dark:text-slate-300 leading-relaxed"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5, delay: delay + 0.3 }}
      >
        {description}
      </motion.p>

      {/* Hover effect line */}
      <motion.div
        className={`absolute bottom-0 left-0 h-1 ${gradient} rounded-b-2xl`}
        initial={{ width: 0 }}
        whileHover={{ width: '100%' }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}

export function EnhancedFeatures() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  const features = [
    {
      icon: Target,
      title: 'Verified Contacts',
      description: 'Direct emails & phone numbers. 98% accuracy rate.',
      gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-600'
    },
    {
      icon: Building2,
      title: 'Live Org Charts',
      description: 'Real-time decision-maker mapping. Instant personnel alerts.',
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-600'
    },
    {
      icon: Users,
      title: 'Deal Insights',
      description: 'AI-powered opportunities. Community intelligence network.',
      gradient: 'bg-gradient-to-br from-purple-500 to-purple-600'
    }
  ];

  return (
    <section ref={ref} className="py-24 bg-slate-50 dark:bg-slate-950" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h2
            className="heading-section text-slate-900 dark:text-slate-100 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Everything you need to dominate
            <span className="block text-gradient-primary">
              media sales
            </span>
          </motion.h2>
          <motion.p
            className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Get the intelligence, contacts, and insights that close bigger deals faster.
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              gradient={feature.gradient}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// Highlighted Feature Sections (Forum & Org Charts)
export function HighlightedFeatures() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section ref={ref} className="py-20 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h2
            className="heading-section text-slate-900 dark:text-slate-100 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Connect and discover with
            <span className="block text-gradient-primary">
              built-in community tools
            </span>
          </motion.h2>
          <motion.p
            className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Access real-time industry discussions and comprehensive organization data.
          </motion.p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Forum Feature */}
          <motion.div
            className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-600 hover:shadow-xl transition-all duration-300 group"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            whileHover={{ y: -4 }}
          >
            <div className="flex items-center space-x-4 mb-6">
              <motion.div
                className="w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                style={{background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)'}}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <MessageSquare className="w-7 h-7 text-white" />
              </motion.div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">Media Industry Forum</h3>
                <span className="bg-orange-100 dark:bg-orange-800 text-orange-800 dark:text-orange-200 text-xs font-medium px-3 py-1 rounded-full">
                  Active
                </span>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-300 mb-6 text-lg leading-relaxed">
              Connect with media professionals, share hot opportunities, and get industry insights.
              Real-time discussions about deals, RFPs, and account intelligence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <motion.a
                href="/auth/signup"
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started - Join Discussions
                <motion.div
                  className="ml-2"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.div>
              </motion.a>
              <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                <Users className="w-4 h-4 mr-1" />
                <span>11 active discussions • 7 categories</span>
              </div>
            </div>
          </motion.div>

          {/* Org Charts Feature */}
          <motion.div
            className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-600 hover:shadow-xl transition-all duration-300 group"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ y: -4 }}
          >
            <div className="flex items-center space-x-4 mb-6">
              <motion.div
                className="w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                style={{background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'}}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Building2 className="w-7 h-7 text-white" />
              </motion.div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">Organization Directory</h3>
                <span className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs font-medium px-3 py-1 rounded-full">
                  New
                </span>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-300 mb-6 text-lg leading-relaxed">
              Access comprehensive org charts for major media agencies and holding companies.
              Find the right contacts with verified professional information and company hierarchies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <motion.a
                href="/auth/signup"
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started - Explore Organizations
                <motion.div
                  className="ml-2"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                >
                  →
                </motion.div>
              </motion.a>
              <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                <Building2 className="w-4 h-4 mr-1" />
                <span>9 companies • 8 verified contacts</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}