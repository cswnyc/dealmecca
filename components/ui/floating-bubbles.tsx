'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { shouldReduceMotion } from '@/lib/design-tokens';

interface CompanyLogo {
  name: string;
  logoPath?: string;
  fallbackIcon?: string;
  brandColor?: string;
}

interface FloatingBubbleProps {
  company: CompanyLogo;
  delay: number;
  side: 'left' | 'right';
  index: number;
}

function FloatingBubble({ company, delay, side, index }: FloatingBubbleProps) {
  const [isVisible, setIsVisible] = useState(false);
  // Always use fallback since logos don't exist yet
  const [imageError, setImageError] = useState(true);
  const reducedMotion = shouldReduceMotion();

  useEffect(() => {
    // Skip delay for reduced motion
    const timer = setTimeout(() => setIsVisible(true), reducedMotion ? 0 : delay * 1000);
    return () => clearTimeout(timer);
  }, [delay, reducedMotion]);

  const xPosition = side === 'left'
    ? `${10 + (index % 3) * 15}%`
    : `${85 - (index % 3) * 15}%`;

  return (
    <motion.div
      className={`absolute pointer-events-none z-10 ${side === 'left' ? 'left-0' : 'right-0'}`}
      style={{
        left: side === 'left' ? xPosition : 'auto',
        right: side === 'right' ? `calc(100% - ${xPosition})` : 'auto',
        top: reducedMotion ? '20%' : '50%' // Static position for reduced motion
      }}
      initial={reducedMotion ? { y: 0, opacity: 0.6, rotate: 0 } : { y: '50vh', opacity: 0, rotate: 0 }}
      animate={isVisible ? (reducedMotion ? {
        opacity: 0.6 // Just fade in, no movement
      } : {
        y: ['-30vh'],
        opacity: [0, 1, 1, 0],
        rotate: [0, 360],
        transition: {
          duration: 12,
          times: [0, 0.1, 0.8, 1],
          repeat: Infinity,
          repeatDelay: Math.random() * 2,
          ease: "linear"
        }
      }) : {}}
    >
      <div
        className="w-16 h-16 rounded-full shadow-lg border-2 border-white/50 backdrop-blur-sm flex items-center justify-center overflow-hidden"
        style={{
          backgroundColor: company.brandColor || 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(8px)'
        }}
      >
        {/* Always show fallback for now since logos don't exist */}
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">
            {company.fallbackIcon || company.name.substring(0, 2).toUpperCase()}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export function FloatingBubbles() {
  const companies: CompanyLogo[] = [
    // Agencies
    { name: 'GroupM', logoPath: '/logos/groupm.svg', brandColor: '#E31E24', fallbackIcon: 'GM' },
    { name: 'Omnicom', logoPath: '/logos/omnicom.svg', brandColor: '#FFD100', fallbackIcon: 'OM' },
    { name: 'Publicis', logoPath: '/logos/publicis.svg', brandColor: '#000000', fallbackIcon: 'PU' },
    { name: 'WPP', logoPath: '/logos/wpp.svg', brandColor: '#FF6B00', fallbackIcon: 'WP' },
    { name: 'Havas', logoPath: '/logos/havas.svg', brandColor: '#E30613', fallbackIcon: 'HA' },
    { name: 'IPG', logoPath: '/logos/ipg.svg', brandColor: '#0066CC', fallbackIcon: 'IP' },

    // Brands
    { name: 'Nike', logoPath: '/logos/nike.svg', brandColor: '#000000', fallbackIcon: 'NK' },
    { name: 'Coca-Cola', logoPath: '/logos/coca-cola.svg', brandColor: '#ED1C16', fallbackIcon: 'CC' },
    { name: 'Apple', logoPath: '/logos/apple.svg', brandColor: '#000000', fallbackIcon: 'AP' },
    { name: 'Microsoft', logoPath: '/logos/microsoft.svg', brandColor: '#00BCF2', fallbackIcon: 'MS' },
    { name: 'Amazon', logoPath: '/logos/amazon.svg', brandColor: '#FF9900', fallbackIcon: 'AM' },
    { name: 'Google', logoPath: '/logos/google.svg', brandColor: '#4285F4', fallbackIcon: 'GO' },
    { name: 'Meta', logoPath: '/logos/meta.svg', brandColor: '#1877F2', fallbackIcon: 'ME' },

    // Tech Partners
    { name: 'The Trade Desk', logoPath: '/logos/trade-desk.svg', brandColor: '#00A651', fallbackIcon: 'TD' },
    { name: 'Adobe', logoPath: '/logos/adobe.svg', brandColor: '#FF0000', fallbackIcon: 'AD' },
    { name: 'Salesforce', logoPath: '/logos/salesforce.svg', brandColor: '#00A1E0', fallbackIcon: 'SF' }
  ];

  // Split companies between left and right sides
  const leftCompanies = companies.filter((_, index) => index % 2 === 0);
  const rightCompanies = companies.filter((_, index) => index % 2 === 1);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">

      {/* Left side bubbles */}
      {leftCompanies.map((company, index) => (
        <FloatingBubble
          key={`left-${company.name}`}
          company={company}
          delay={index * 2 + Math.random() * 3}
          side="left"
          index={index}
        />
      ))}

      {/* Right side bubbles */}
      {rightCompanies.map((company, index) => (
        <FloatingBubble
          key={`right-${company.name}`}
          company={company}
          delay={index * 2.5 + Math.random() * 3}
          side="right"
          index={index}
        />
      ))}
    </div>
  );
}