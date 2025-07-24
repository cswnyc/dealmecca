export const brandConfig = {
  // Core Brand Identity
  name: 'DealMecca',
  domain: 'getmecca.com',
  taglines: {
    primary: 'Intelligence that closes.',
    secondary: 'Smarter signals. Faster closes.',
    alternative: 'Data-driven deals, delivered.',
    full: 'DealMecca—revenue meets insight.',
    options: [
      'Intelligence that closes.',
      'Where every deal finds its data.',
      'Turn pipeline into pay-line.',
      'DealMecca—revenue meets insight.',
      'Smarter signals. Faster closes.',
      'All roads lead to better deals.',
      'Real-time intel for real-world wins.',
      'Your selling sanctuary.',
      'From prospect to profit, intelligently.',
      'Data-driven deals, delivered.'
    ]
  },
  
  // Brand Story
  elevator_pitch: 'DealMecca is the intelligence hub for media-sales teams. We plug your CRM, ad-server, and billing data into one neural engine, flagging the ripest prospects and the riskiest gaps—so reps close faster and managers forecast with surgical accuracy.',
  
  // Value Propositions
  value_props: [
    'Real-time intel for real-world wins',
    'Turn pipeline into pay-line',
    'From prospect to profit, intelligently',
    'Your selling sanctuary',
    'Intelligence that closes deals',
    'Data-driven revenue acceleration'
  ],
  
  // Brand Personality
  tone: {
    primary: 'confident',
    secondary: 'data-savvy', 
    tertiary: 'action-oriented',
    description: 'Salesforce Trailblazer energy with Bloomberg Terminal sophistication'
  },
  
  // Visual Identity
  colors: {
    primary: '#0f172a',     // Deep midnight blue (trust)
    secondary: '#0891b2',   // Vibrant teal (insight)
    accent: '#ea580c',      // Electric orange (action)
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
      900: '#0f172a'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #0f172a 0%, #0891b2 100%)',
      accent: 'linear-gradient(135deg, #0891b2 0%, #ea580c 100%)',
      hero: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0891b2 100%)'
    }
  },
  
  // Typography
  fonts: {
    headline: ['Inter', 'Poppins', 'system-ui', 'sans-serif'],
    body: ['Roboto', 'Open Sans', 'system-ui', 'sans-serif'],
    display: ['Inter', 'system-ui', 'sans-serif']
  },
  
  // Messaging Framework
  messaging: {
    problems: [
      'Scattered sales data across multiple systems',
      'Missed opportunities due to poor visibility',
      'Inaccurate forecasting and pipeline management',
      'Manual processes slowing down sales cycles'
    ],
    solutions: [
      'Unified intelligence hub for all sales data',
      'AI-powered prospect identification and scoring',
      'Real-time pipeline insights and forecasting',
      'Automated workflows and intelligent alerts'
    ],
    outcomes: [
      'Faster deal closure rates',
      'More accurate revenue forecasting',
      'Increased sales team productivity',
      'Better decision-making with data insights'
    ]
  },
  
  // Target Audience
  audience: {
    primary: 'Media sales teams and managers',
    secondary: 'Revenue operations professionals',
    tertiary: 'Sales directors and VPs',
    personas: [
      {
        role: 'Sales Rep',
        pain_points: ['Finding qualified prospects', 'Prioritizing leads', 'Tracking deal progress'],
        value_props: ['Smarter prospect identification', 'Clear priority scoring', 'Real-time deal insights']
      },
      {
        role: 'Sales Manager',
        pain_points: ['Forecasting accuracy', 'Team performance visibility', 'Resource allocation'],
        value_props: ['Surgical forecasting accuracy', 'Complete team visibility', 'Data-driven decisions']
      },
      {
        role: 'Revenue Leader',
        pain_points: ['Revenue predictability', 'Sales process optimization', 'ROI measurement'],
        value_props: ['Predictable revenue growth', 'Optimized sales processes', 'Clear ROI metrics']
      }
    ]
  },
  
  // Content Guidelines
  content: {
    voice: 'Professional, confident, and data-driven',
    tone_words: ['intelligent', 'precise', 'actionable', 'sophisticated', 'results-focused'],
    avoid_words: ['simple', 'basic', 'easy', 'cheap', 'quick-fix'],
    writing_style: 'Clear, authoritative, and outcome-focused with specific metrics where possible'
  }
} as const;

export type BrandConfig = typeof brandConfig;

// Utility functions for brand consistency
export const getBrandColor = (colorName: keyof typeof brandConfig.colors) => {
  if (colorName === 'neutral') return brandConfig.colors.neutral[500];
  if (colorName === 'gradients') return brandConfig.colors.gradients.primary;
  return brandConfig.colors[colorName as keyof Omit<typeof brandConfig.colors, 'neutral' | 'gradients'>];
};

export const getBrandFont = (fontType: keyof typeof brandConfig.fonts) => {
  return brandConfig.fonts[fontType].join(', ');
};

export const getRandomTagline = () => {
  const taglines = brandConfig.taglines.options;
  return taglines[Math.floor(Math.random() * taglines.length)];
}; 