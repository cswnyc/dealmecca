'use client';

import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, DollarSign, Calendar, Target, Zap, Layers } from 'lucide-react';
import { shouldReduceMotion } from '@/lib/design-tokens';

interface FloatingDashboardProps {
  className?: string;
  delay?: number;
}

export function PipelineDashboard({ className = '', delay = 0 }: FloatingDashboardProps) {
  const reducedMotion = shouldReduceMotion();

  return (
    <motion.div
      className={`bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 w-80 ${className}`}
      initial={{ opacity: 0, y: reducedMotion ? 0 : 20, rotate: reducedMotion ? 0 : -5 }}
      animate={reducedMotion ? {
        opacity: 1,
        y: 0,
        rotate: 0
      } : {
        opacity: 1,
        y: 0,
        rotate: -3,
        x: [0, 5, 0],
        y: [0, -8, 0]
      }}
      transition={reducedMotion ? {
        duration: 0,
        delay: 0
      } : {
        initial: { duration: 0.8, delay },
        animate: {
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">Deal Pipeline</h3>
        <BarChart3 className="w-5 h-5 text-emerald-600" />
      </div>

      <div className="space-y-3">
        {[
          { label: 'Qualified Leads', value: '$2.4M', color: 'bg-blue-500' },
          { label: 'Proposal Sent', value: '$890K', color: 'bg-yellow-500' },
          { label: 'Negotiating', value: '$1.2M', color: 'bg-orange-500' },
          { label: 'Closed Won', value: '$650K', color: 'bg-emerald-500' }
        ].map((item, index) => (
          <motion.div
            key={item.label}
            className="flex items-center justify-between"
            initial={{ opacity: 0, x: reducedMotion ? 0 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: reducedMotion ? 0 : delay + 0.2 + index * 0.1 }}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${item.color}`} />
              <span className="text-sm text-slate-600 dark:text-slate-300">{item.label}</span>
            </div>
            <span className="font-medium text-slate-900 dark:text-slate-100">{item.value}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export function AnalyticsDashboard({ className = '', delay = 0 }: FloatingDashboardProps) {
  const reducedMotion = shouldReduceMotion();

  return (
    <motion.div
      className={`bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 w-72 ${className}`}
      initial={{ opacity: 0, y: reducedMotion ? 0 : 20, rotate: reducedMotion ? 0 : 5 }}
      animate={reducedMotion ? {
        opacity: 1,
        y: 0,
        rotate: 0
      } : {
        opacity: 1,
        y: 0,
        rotate: 4,
        x: [0, -3, 0],
        y: [0, 6, 0]
      }}
      transition={reducedMotion ? {
        duration: 0,
        delay: 0
      } : {
        initial: { duration: 0.8, delay },
        animate: {
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">Revenue Analytics</h3>
        <TrendingUp className="w-5 h-5 text-emerald-600" />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600 dark:text-slate-300">This Month</span>
          <span className="text-2xl font-bold text-emerald-600">$420K</span>
        </div>

        <div className="h-20 flex items-end space-x-1">
          {[40, 65, 30, 80, 45, 90, 70, 85, 60, 95, 75, 100].map((height, index) => (
            <motion.div
              key={index}
              className="bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-sm flex-1"
              style={{ height: reducedMotion ? `${height}%` : undefined }}
              initial={{ height: reducedMotion ? `${height}%` : 0 }}
              animate={{ height: `${height}%` }}
              transition={{ delay: reducedMotion ? 0 : delay + 0.5 + index * 0.05 }}
            />
          ))}
        </div>

        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Jan</span>
          <span>Dec</span>
        </div>
      </div>
    </motion.div>
  );
}

export function CRMIntegration({ className = '', delay = 0 }: FloatingDashboardProps) {
  const reducedMotion = shouldReduceMotion();

  return (
    <motion.div
      className={`bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 w-64 ${className}`}
      initial={{ opacity: 0, y: reducedMotion ? 0 : 20, rotate: reducedMotion ? 0 : -3 }}
      animate={reducedMotion ? {
        opacity: 1,
        y: 0,
        rotate: 0
      } : {
        opacity: 1,
        y: 0,
        rotate: -2,
        x: [0, 4, 0],
        y: [0, -5, 0]
      }}
      transition={reducedMotion ? {
        duration: 0,
        delay: 0
      } : {
        initial: { duration: 0.8, delay },
        animate: {
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">CRM Sync</h3>
        <Layers className="w-5 h-5 text-emerald-600" />
      </div>

      <div className="space-y-3">
        {[
          { name: 'Salesforce', status: 'Connected', icon: '☁️' },
          { name: 'HubSpot', status: 'Connected', icon: '🟠' },
          { name: 'Pipedrive', status: 'Syncing...', icon: '🔄' }
        ].map((item, index) => (
          <motion.div
            key={item.name}
            className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-700"
            initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: reducedMotion ? 0 : delay + 0.3 + index * 0.15 }}
          >
            <div className="flex items-center space-x-2">
              <span>{item.icon}</span>
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{item.name}</span>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              item.status === 'Connected'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
            }`}>
              {item.status}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export function ForecastDashboard({ className = '', delay = 0 }: FloatingDashboardProps) {
  const reducedMotion = shouldReduceMotion();

  return (
    <motion.div
      className={`bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 w-76 ${className}`}
      initial={{ opacity: 0, y: reducedMotion ? 0 : 20, rotate: reducedMotion ? 0 : 2 }}
      animate={reducedMotion ? {
        opacity: 1,
        y: 0,
        rotate: 0
      } : {
        opacity: 1,
        y: 0,
        rotate: 3,
        x: [0, -2, 0],
        y: [0, 4, 0]
      }}
      transition={reducedMotion ? {
        duration: 0,
        delay: 0
      } : {
        initial: { duration: 0.8, delay },
        animate: {
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">Q4 Forecast</h3>
        <Target className="w-5 h-5 text-emerald-600" />
      </div>

      <div className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">94%</div>
          <div className="text-sm text-slate-600 dark:text-slate-300">Confidence Score</div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-300">Target</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">$2.5M</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-300">Projected</span>
            <span className="font-medium text-emerald-600">$2.35M</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full"
              initial={{ width: reducedMotion ? '94%' : 0 }}
              animate={{ width: '94%' }}
              transition={{ delay: reducedMotion ? 0 : delay + 0.5, duration: reducedMotion ? 0 : 1 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function FloatingDashboards() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Top right area */}
      <PipelineDashboard
        className="absolute top-20 right-10 hidden lg:block"
        delay={1.2}
      />

      {/* Top left area */}
      <AnalyticsDashboard
        className="absolute top-32 left-16 hidden xl:block"
        delay={1.8}
      />

      {/* Bottom right area */}
      <CRMIntegration
        className="absolute bottom-40 right-24 hidden lg:block"
        delay={2.4}
      />

      {/* Bottom left area */}
      <ForecastDashboard
        className="absolute bottom-20 left-20 hidden xl:block"
        delay={3.0}
      />
    </div>
  );
}