import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // ------------------------------------------------------------
        // Flokana-inspired design tokens (scoped via CSS variables)
        // Use by wrapping a subtree in `.flk` (see app/design-system/flokana/flokana.css)
        // ------------------------------------------------------------
        flk: {
          bg: 'rgb(var(--flk-bg) / <alpha-value>)',
          surface: 'rgb(var(--flk-surface) / <alpha-value>)',
          'surface-subtle': 'rgb(var(--flk-surface-subtle) / <alpha-value>)',
          'text-primary': 'rgb(var(--flk-text-primary) / <alpha-value>)',
          'text-secondary': 'rgb(var(--flk-text-secondary) / <alpha-value>)',
          'text-muted': 'rgb(var(--flk-text-muted) / <alpha-value>)',
          'text-inverse': 'rgb(var(--flk-text-inverse) / <alpha-value>)',
          'border-subtle': 'rgb(var(--flk-border-subtle) / <alpha-value>)',
          'border-strong': 'rgb(var(--flk-border-strong) / <alpha-value>)',
          primary: 'rgb(var(--flk-primary) / <alpha-value>)',
          'primary-hover': 'rgb(var(--flk-primary-hover) / <alpha-value>)',
          'primary-active': 'rgb(var(--flk-primary-active) / <alpha-value>)',
          'primary-soft-bg': 'rgb(var(--flk-primary-soft-bg) / <alpha-value>)',
          'primary-soft-text': 'rgb(var(--flk-primary-soft-text) / <alpha-value>)',
          'accent-violet': 'rgb(var(--flk-accent-violet) / <alpha-value>)',
          'accent-pink': 'rgb(var(--flk-accent-pink) / <alpha-value>)',
          'status-success': 'rgb(var(--flk-status-success) / <alpha-value>)',
          'status-warning': 'rgb(var(--flk-status-warning) / <alpha-value>)',
          'status-danger': 'rgb(var(--flk-status-danger) / <alpha-value>)',
          'status-info': 'rgb(var(--flk-status-info) / <alpha-value>)',
          'brand-ink': 'rgb(var(--flk-brand-ink) / <alpha-value>)',
        },
        // DealMecca Premium Brand Colors
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        // shadcn/ui compatible colors
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      fontFamily: {
        flk: [
          'Helvetica Neue',
          'Inter',
          'DM Sans',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Arial',
          'sans-serif',
        ],
        headline: ['Inter', 'Poppins', 'system-ui', 'sans-serif'],
        body: ['Roboto', 'Open Sans', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'flk-display-xl': ['64px', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'flk-display-l': ['56px', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'flk-h1': ['44px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'flk-h2': ['36px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'flk-h3': ['28px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'flk-h4': ['22px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'flk-body-l': ['18px', { lineHeight: '1.55' }],
        'flk-body-m': ['16px', { lineHeight: '1.55' }],
        'flk-body-s': ['14px', { lineHeight: '1.55' }],
        'flk-caption': ['12px', { lineHeight: '1.55' }],
        hero: ['4rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        display: ['3rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        heading: ['2rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        subheading: ['1.5rem', { lineHeight: '1.4', letterSpacing: '-0.01em' }],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #0f172a 0%, #0891b2 100%)',
        'gradient-accent': 'linear-gradient(135deg, #0891b2 0%, #ea580c 100%)',
        'gradient-hero': 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0891b2 100%)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      boxShadow: {
        'flk-card': '0 10px 30px -20px rgba(15, 23, 42, 0.18)',
        'flk-card-hover': '0 18px 44px -22px rgba(15, 23, 42, 0.22)',
        'flk-floating': '0 24px 60px -30px rgba(15, 23, 42, 0.28)',
        'flk-focus': '0 0 0 4px rgba(37, 117, 252, 0.20)',
        'flk-card-dark': '0 10px 30px -20px rgba(0, 0, 0, 0.55)',
        'flk-card-hover-dark': '0 18px 44px -22px rgba(0, 0, 0, 0.62)',
        'flk-floating-dark': '0 24px 60px -30px rgba(0, 0, 0, 0.70)',
        'flk-focus-dark': '0 0 0 4px rgba(91, 141, 255, 0.22)',
        // Premium shadows
        premium: '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'premium-lg': '0 20px 40px -12px rgba(0, 0, 0, 0.15), 0 8px 16px -4px rgba(0, 0, 0, 0.08)',
        'premium-xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 12px 24px -8px rgba(0, 0, 0, 0.12)',
        'inner-premium': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        // Enhanced glow effects
        glow: '0 0 20px rgba(8, 145, 178, 0.3), 0 0 40px rgba(8, 145, 178, 0.1)',
        'glow-lg': '0 0 30px rgba(8, 145, 178, 0.4), 0 0 60px rgba(8, 145, 178, 0.2)',
        // Card shadows
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      spacing: {
        18: '4.5rem',
        88: '22rem',
        128: '32rem',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        'flk-xs': '8px',
        'flk-sm': '10px',
        'flk-md': '14px',
        'flk-lg': '18px',
        'flk-xl': '24px',
        'flk-pill': '999px',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        // Accordion animations
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        // Fade animations
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-down': {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // Slide animations
        'slide-in': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // Scale animations
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'bounce-in': {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)' },
        },
        // Utility animations
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      animation: {
        // Accordion
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        // Fade
        'fade-in': 'fadeIn 0.6s ease-out',
        'fade-up': 'fade-up 0.5s ease-out',
        'fade-down': 'fade-down 0.5s ease-out',
        // Slide
        'slide-in': 'slide-in 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'slide-in-left': 'slideInLeft 0.4s ease-out',
        'slide-in-down': 'slideInDown 0.3s ease-out',
        // Scale
        'scale-in': 'scaleIn 0.3s ease-out',
        'bounce-in': 'bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        // Utility
        'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
      transitionDuration: {
        400: '400ms',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
