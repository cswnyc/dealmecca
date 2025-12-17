'use client';

import * as React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { Shield, Users, Linkedin } from 'lucide-react';
import { useTheme } from '@/lib/theme-context';

interface AuthShellProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  leftPanelTitle?: string;
  leftPanelSubtitle?: string;
  showTrustIndicators?: boolean;
  altPageText?: string;
  altPageHref?: string;
  altPageLinkText?: string;
}

export function AuthShell({
  children,
  title,
  subtitle,
  leftPanelTitle = 'Join the Media Sales Community',
  leftPanelSubtitle = 'Access verified org charts, decision-maker contacts, and exclusive seller intel.',
  showTrustIndicators = true,
  altPageText,
  altPageHref,
  altPageLinkText,
}: AuthShellProps): JSX.Element {
  const { theme } = useTheme();

  return (
    <div className="flk min-h-screen bg-flk-bg flex">
      {/* Left Panel - Brand Content (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Gradient Background */}
        <div 
          className="absolute inset-0 opacity-95"
          style={{
            background: 'linear-gradient(135deg, #162B54 0%, #2575FC 50%, #8B5CF6 100%)',
          }}
        />

        {/* Subtle pattern overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.15) 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          {/* Logo */}
          <div>
            <div className="flex items-center gap-2">
              <svg
                viewBox="0 0 100 100"
                width={40}
                height={40}
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="auth-logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="rgba(255, 255, 255, 0.9)" />
                  </linearGradient>
                </defs>
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.8)"
                  strokeWidth={4}
                  strokeDasharray="8 4"
                >
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 50 50"
                    to="360 50 50"
                    dur="10s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle
                  cx="50"
                  cy="50"
                  r="22"
                  fill="url(#auth-logo-gradient)"
                />
                <text
                  x="50"
                  y="58"
                  fontFamily="system-ui, -apple-system, sans-serif"
                  fontSize="24"
                  fill="#2575FC"
                  textAnchor="middle"
                  fontWeight="800"
                >
                  M
                </text>
              </svg>
              <span className="font-bold font-display text-2xl text-white">
                Deal<span className="text-white/90">Mecca</span>
              </span>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-md">
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              {leftPanelTitle}
            </h1>
            <p className="text-lg text-white/90 mb-8 leading-relaxed">
              {leftPanelSubtitle}
            </p>

            {/* Benefits */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold mb-1">Sellers Only</div>
                  <div className="text-sm text-white/80">
                    No buyers, no recruiters. Just media sales professionals.
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                  <Linkedin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold mb-1">LinkedIn Verified</div>
                  <div className="text-sm text-white/80">
                    All members verify with LinkedIn to maintain quality.
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold mb-1">Secure & Private</div>
                  <div className="text-sm text-white/80">
                    Enterprise-grade security. Your data stays protected.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Quote/Testimonial */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-flk-lg p-6">
            <p className="text-sm text-white/90 italic mb-3">
              &quot;DealMecca helped us close more deals by giving us the right contacts at the right time.&quot;
            </p>
            <div className="text-xs text-white/70 font-medium">
              Sarah Chen, VP Sales
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form Content */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-flk-bg">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Logo size="md" dark={theme === 'dark'} />
          </div>

          {/* Card Container */}
          <div className="bg-flk-surface border border-flk-border-subtle rounded-flk-xl p-8 shadow-flk-floating dark:shadow-flk-floating-dark">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-flk-h2 font-bold text-flk-text-primary mb-2">
                {title}
              </h2>
              <p className="text-flk-body-m text-flk-text-secondary">
                {subtitle}
              </p>
            </div>

            {/* Form Content */}
            {children}

            {/* Alt Page Link */}
            {altPageText && altPageHref && altPageLinkText && (
              <div className="mt-8 text-center">
                <p className="text-flk-body-s text-flk-text-secondary">
                  {altPageText}{' '}
                  <Link href={altPageHref} className="text-flk-primary hover:text-flk-primary-hover font-medium">
                    {altPageLinkText}
                  </Link>
                </p>
              </div>
            )}

            {/* Trust Indicators */}
            {showTrustIndicators && (
              <div className="mt-6 pt-6 border-t border-flk-border-subtle">
                <div className="flex items-center justify-center flex-wrap gap-4 text-flk-caption text-flk-text-muted">
                  <div className="flex items-center space-x-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    <span>SSL Encrypted</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>Sellers Only</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Linkedin className="w-3.5 h-3.5" />
                    <span>LinkedIn Required</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
