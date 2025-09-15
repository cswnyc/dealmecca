'use client';

import { motion } from 'framer-motion';

interface LogoPlaceholderProps {
  className?: string;
  delay?: number;
}

interface LogoGridProps {
  title: string;
  logos: Array<{
    name: string;
    placeholder: string;
    color: string;
  }>;
  className?: string;
  delay?: number;
}

export function LogoGrid({ title, logos, className = '', delay = 0 }: LogoGridProps) {
  return (
    <motion.div
      className={`bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-6 w-80 ${className}`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        x: [0, 3, 0],
        y: [0, -5, 0]
      }}
      transition={{
        initial: { duration: 0.8, delay },
        animate: {
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }}
    >
      <div className="text-center mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{title}</h3>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {logos.map((logo, index) => (
          <motion.div
            key={logo.name}
            className={`${logo.color} rounded-lg p-3 flex items-center justify-center h-16 shadow-sm`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: delay + 0.1 + index * 0.05,
              duration: 0.4
            }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-center">
              <div className="text-lg font-bold text-white/90 mb-1">
                {logo.placeholder}
              </div>
              <div className="text-xs text-white/70 font-medium">
                {logo.name}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 text-center">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Trusted by leading {title.toLowerCase()}
        </span>
      </div>
    </motion.div>
  );
}

export function AgencyLogos({ className = '', delay = 0 }: LogoPlaceholderProps) {
  const agencies = [
    { name: 'GroupM', placeholder: 'GM', color: 'bg-gradient-to-br from-blue-500 to-blue-600' },
    { name: 'Omnicom', placeholder: 'OM', color: 'bg-gradient-to-br from-purple-500 to-purple-600' },
    { name: 'WPP', placeholder: 'WPP', color: 'bg-gradient-to-br from-red-500 to-red-600' },
    { name: 'Publicis', placeholder: 'PUB', color: 'bg-gradient-to-br from-green-500 to-green-600' },
    { name: 'IPG', placeholder: 'IPG', color: 'bg-gradient-to-br from-orange-500 to-orange-600' },
    { name: 'Havas', placeholder: 'HAV', color: 'bg-gradient-to-br from-teal-500 to-teal-600' }
  ];

  return (
    <LogoGrid
      title="Media Agencies"
      logos={agencies}
      className={className}
      delay={delay}
    />
  );
}

export function BrandLogos({ className = '', delay = 0 }: LogoPlaceholderProps) {
  const brands = [
    { name: 'Nike', placeholder: '✓', color: 'bg-gradient-to-br from-gray-800 to-gray-900' },
    { name: 'Coca-Cola', placeholder: 'CC', color: 'bg-gradient-to-br from-red-600 to-red-700' },
    { name: 'Apple', placeholder: '', color: 'bg-gradient-to-br from-gray-700 to-gray-800' },
    { name: 'McDonald\'s', placeholder: 'M', color: 'bg-gradient-to-br from-yellow-500 to-yellow-600' },
    { name: 'BMW', placeholder: 'BMW', color: 'bg-gradient-to-br from-blue-600 to-blue-700' },
    { name: 'Samsung', placeholder: 'SS', color: 'bg-gradient-to-br from-indigo-600 to-indigo-700' }
  ];

  return (
    <LogoGrid
      title="Brands"
      logos={brands}
      className={className}
      delay={delay}
    />
  );
}

export function AdditionalAgencies({ className = '', delay = 0 }: LogoPlaceholderProps) {
  const agencies = [
    { name: 'Zenith', placeholder: 'ZEN', color: 'bg-gradient-to-br from-cyan-500 to-cyan-600' },
    { name: 'Mindshare', placeholder: 'MS', color: 'bg-gradient-to-br from-pink-500 to-pink-600' },
    { name: 'OMD', placeholder: 'OMD', color: 'bg-gradient-to-br from-emerald-500 to-emerald-600' },
    { name: 'Starcom', placeholder: 'SC', color: 'bg-gradient-to-br from-violet-500 to-violet-600' },
    { name: 'MediaCom', placeholder: 'MC', color: 'bg-gradient-to-br from-rose-500 to-rose-600' },
    { name: 'Wavemaker', placeholder: 'WM', color: 'bg-gradient-to-br from-amber-500 to-amber-600' }
  ];

  return (
    <LogoGrid
      title="Agency Partners"
      logos={agencies}
      className={className}
      delay={delay}
    />
  );
}

export function TechBrands({ className = '', delay = 0 }: LogoPlaceholderProps) {
  const brands = [
    { name: 'Google', placeholder: 'G', color: 'bg-gradient-to-br from-blue-500 to-green-500' },
    { name: 'Microsoft', placeholder: 'MS', color: 'bg-gradient-to-br from-blue-600 to-cyan-600' },
    { name: 'Meta', placeholder: 'M', color: 'bg-gradient-to-br from-blue-700 to-purple-700' },
    { name: 'Amazon', placeholder: 'A', color: 'bg-gradient-to-br from-orange-500 to-yellow-500' },
    { name: 'Netflix', placeholder: 'N', color: 'bg-gradient-to-br from-red-600 to-red-700' },
    { name: 'Spotify', placeholder: 'S', color: 'bg-gradient-to-br from-green-600 to-green-700' }
  ];

  return (
    <LogoGrid
      title="Tech Partners"
      logos={brands}
      className={className}
      delay={delay}
    />
  );
}

export function LogoPlaceholders() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Top left area - Agency logos */}
      <AgencyLogos
        className="absolute top-16 left-8 hidden xl:block"
        delay={1.2}
      />

      {/* Top right area - Brand logos */}
      <BrandLogos
        className="absolute top-20 right-12 hidden lg:block"
        delay={1.8}
      />

      {/* Bottom left area - Additional agencies */}
      <AdditionalAgencies
        className="absolute bottom-32 left-12 hidden xl:block"
        delay={2.4}
      />

      {/* Bottom right area - Tech brands */}
      <TechBrands
        className="absolute bottom-24 right-8 hidden lg:block"
        delay={3.0}
      />
    </div>
  );
}