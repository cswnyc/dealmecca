'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { TrendingUp, Users, Target, Zap, DollarSign, BarChart3 } from 'lucide-react';

interface StatCardProps {
  icon: React.ElementType;
  value: string;
  label: string;
  description: string;
  delay: number;
}

function StatCard({ icon: Icon, value, label, description, delay }: StatCardProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      className="text-center group"
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      <motion.div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300"
        style={{background: 'var(--gradient-accent)'}}
        initial={{ scale: 0.8 }}
        animate={isInView ? { scale: 1 } : { scale: 0.8 }}
        transition={{ duration: 0.5, delay: delay + 0.1 }}
      >
        <Icon className="w-8 h-8 text-white" />
      </motion.div>

      <motion.div
        className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-2"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.5, delay: delay + 0.2 }}
      >
        {value}
      </motion.div>

      <motion.h3
        className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5, delay: delay + 0.3 }}
      >
        {label}
      </motion.h3>

      <motion.p
        className="text-slate-600 dark:text-slate-400 text-sm"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5, delay: delay + 0.4 }}
      >
        {description}
      </motion.p>
    </motion.div>
  );
}

export function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  const stats = [
    {
      icon: Users,
      value: '500+',
      label: 'Sales Teams',
      description: 'Media companies trust our platform'
    },
    {
      icon: TrendingUp,
      value: '30%',
      label: 'Faster Closure',
      description: 'Average deal acceleration rate'
    },
    {
      icon: DollarSign,
      value: '$50M+',
      label: 'Revenue Tracked',
      description: 'Monthly pipeline value managed'
    },
    {
      icon: Target,
      value: '94%',
      label: 'Forecast Accuracy',
      description: 'AI-powered prediction precision'
    },
    {
      icon: Zap,
      value: '2.5x',
      label: 'Productivity Boost',
      description: 'Improvement in sales efficiency'
    },
    {
      icon: BarChart3,
      value: '15+',
      label: 'CRM Integrations',
      description: 'Connected sales platforms'
    }
  ];

  return (
    <section ref={ref} className="py-20 bg-white dark:bg-slate-950">
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
            Trusted by media sales leaders
            <span className="block text-gradient-primary">
              driving real results
            </span>
          </motion.h2>
          <motion.p
            className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Join hundreds of media companies who've transformed their sales performance with DealMecca's intelligence platform.
          </motion.p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <StatCard
              key={stat.label}
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
              description={stat.description}
              delay={index * 0.1}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <motion.p
            className="text-slate-600 dark:text-slate-400 mb-6"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            Ready to join them?
          </motion.p>
          <motion.a
            href="#pricing"
            className="inline-flex items-center text-white font-medium px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            style={{background: 'var(--gradient-accent)'}}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Your Free Trial
            <motion.div
              className="ml-2"
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.div>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}

// Integration Partners Section
export function IntegrationsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  const integrations = [
    { name: 'Salesforce', logo: '☁️', description: 'Complete CRM sync' },
    { name: 'HubSpot', logo: '🟠', description: 'Marketing & sales alignment' },
    { name: 'Pipedrive', logo: '🔄', description: 'Pipeline automation' },
    { name: 'Microsoft Dynamics', logo: '🔷', description: 'Enterprise integration' },
    { name: 'Zoho CRM', logo: '🟡', description: 'Small business friendly' },
    { name: 'Monday.com', logo: '💜', description: 'Project management sync' },
    { name: 'Slack', logo: '💬', description: 'Team notifications' },
    { name: 'Teams', logo: '🟦', description: 'Microsoft ecosystem' }
  ];

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
            Seamless integrations with
            <span className="block text-emerald-600 dark:text-emerald-400">
              your favorite tools
            </span>
          </motion.h2>
          <motion.p
            className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Connect DealMecca with your existing workflow. No disruption, just enhanced intelligence.
          </motion.p>
        </motion.div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {integrations.map((integration, index) => (
            <motion.div
              key={integration.name}
              className="bg-white dark:bg-slate-950 rounded-xl p-6 text-center shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 group"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                {integration.logo}
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {integration.name}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {integration.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Integration CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Don't see your tool? We can build custom integrations.
          </p>
          <a
            href="mailto:integrations@getmecca.com"
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium"
          >
            Request Integration →
          </a>
        </motion.div>
      </div>
    </section>
  );
}