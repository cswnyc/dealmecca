// This uses simple keyword extraction - you can enhance with actual AI later
export function generateSmartTags(title: string, content: string): string[] {
  const text = `${title} ${content}`.toLowerCase();
  
  // Media types
  const mediaTypes = ['tv', 'television', 'radio', 'digital', 'print', 'streaming', 'podcast', 'social', 'programmatic', 'ooh', 'out-of-home', 'display', 'video', 'audio', 'mobile', 'desktop', 'tablet'];
  const foundMediaTypes = mediaTypes.filter(type => text.includes(type.replace('-', ' ')));
  
  // Deal types
  const dealTypes = ['rfp', 'proposal', 'budget', 'campaign', 'buy', 'buying', 'media-buy', 'sponsorship', 'partnership', 'collaboration', 'advertising', 'marketing', 'promotion'];
  const foundDealTypes = dealTypes.filter(type => text.includes(type.replace('-', ' ')));
  
  // Industries
  const industries = ['automotive', 'retail', 'healthcare', 'finance', 'cpg', 'tech', 'gaming', 'sports', 'entertainment', 'food', 'beverage', 'fashion', 'beauty', 'travel', 'education', 'real-estate', 'insurance', 'pharma', 'telecommunications'];
  const foundIndustries = industries.filter(industry => text.includes(industry.replace('-', ' ')));
  
  // Event types
  const eventTypes = ['conference', 'summit', 'workshop', 'webinar', 'networking', 'tradeshow', 'expo', 'meetup', 'panel', 'launch'];
  const foundEventTypes = eventTypes.filter(type => text.includes(type));
  
  // Content types
  const contentTypes = ['video', 'podcast', 'article', 'infographic', 'whitepaper', 'case-study', 'report', 'survey', 'interview', 'review'];
  const foundContentTypes = contentTypes.filter(type => text.includes(type.replace('-', ' ')));
  
  // Job roles
  const jobRoles = ['cmo', 'vp', 'director', 'manager', 'coordinator', 'specialist', 'analyst', 'executive', 'buyer', 'planner'];
  const foundJobRoles = jobRoles.filter(role => text.includes(role));
  
  // Urgency indicators
  const urgencyWords = ['urgent', 'asap', 'deadline', 'rush', 'immediate', 'priority', 'time-sensitive'];
  const hasUrgency = urgencyWords.some(word => text.includes(word.replace('-', ' ')));
  
  // Location indicators
  const locationWords = ['local', 'national', 'regional', 'global', 'international', 'domestic'];
  const foundLocationTypes = locationWords.filter(word => text.includes(word));
  
  // Combine all suggested tags
  const suggestedTags: string[] = [
    ...foundMediaTypes,
    ...foundDealTypes,
    ...foundIndustries,
    ...foundEventTypes,
    ...foundContentTypes,
    ...foundJobRoles,
    ...foundLocationTypes
  ];
  
  if (hasUrgency) {
    suggestedTags.push('urgent');
  }
  
  // Remove duplicates and limit to 10 tags
  return [...new Set(suggestedTags)].slice(0, 10);
}

export function extractCompanyNames(text: string): string[] {
  // Enhanced company name extraction with more brands
  const companies = [
    // Tech giants
    'Apple', 'Microsoft', 'Google', 'Amazon', 'Meta', 'Facebook', 'Netflix', 'Tesla', 'Uber', 'Airbnb', 'Spotify', 'TikTok', 'Snapchat', 'Twitter', 'X', 'LinkedIn', 'Instagram',
    
    // Traditional media
    'Disney', 'Warner Bros', 'NBCUniversal', 'Fox', 'CBS', 'ABC', 'CNN', 'ESPN', 'HBO', 'Paramount', 'Sony', 'Universal', 'Viacom', 'Discovery', 'A&E', 'History Channel',
    
    // Automotive
    'Ford', 'Toyota', 'BMW', 'Mercedes', 'Audi', 'Honda', 'Volkswagen', 'Nissan', 'Hyundai', 'Chevrolet', 'Jeep', 'Lexus', 'Porsche', 'Volvo', 'Subaru', 'Mazda',
    
    // Retail & Consumer
    'Walmart', 'Target', 'Costco', 'Home Depot', 'Lowe\'s', 'Best Buy', 'Macy\'s', 'Nordstrom', 'Gap', 'Old Navy', 'H&M', 'Zara', 'Uniqlo', 'IKEA',
    
    // Food & Beverage
    'McDonald\'s', 'Burger King', 'KFC', 'Taco Bell', 'Pizza Hut', 'Domino\'s', 'Starbucks', 'Dunkin\'', 'Subway', 'Chipotle', 'Coca-Cola', 'Pepsi', 'Budweiser', 'Miller', 'Corona',
    
    // CPG & Beauty
    'Nike', 'Adidas', 'Under Armour', 'Lululemon', 'Procter & Gamble', 'Unilever', 'Johnson & Johnson', 'L\'Oreal', 'Estee Lauder', 'Sephora', 'Ulta',
    
    // Airlines & Travel
    'American Airlines', 'Delta', 'United', 'Southwest', 'JetBlue', 'Alaska Airlines', 'Marriott', 'Hilton', 'Hyatt', 'Airbnb', 'Expedia', 'Booking.com',
    
    // Financial Services
    'JPMorgan', 'Bank of America', 'Wells Fargo', 'Chase', 'Citi', 'Goldman Sachs', 'Morgan Stanley', 'American Express', 'Visa', 'Mastercard', 'PayPal', 'Venmo',
    
    // Telecom
    'Verizon', 'AT&T', 'T-Mobile', 'Sprint', 'Comcast', 'Charter', 'Dish', 'DirecTV'
  ];
  
  return companies.filter(company => 
    text.toLowerCase().includes(company.toLowerCase())
  );
}

export function detectLocation(text: string): string | null {
  // Enhanced location detection with more cities and regions
  const locations = [
    // Major US cities
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Washington DC', 'Boston', 'El Paso', 'Nashville', 'Detroit', 'Oklahoma City', 'Portland', 'Las Vegas', 'Memphis', 'Louisville', 'Baltimore', 'Milwaukee', 'Albuquerque', 'Tucson', 'Fresno', 'Sacramento', 'Mesa', 'Kansas City', 'Atlanta', 'Long Beach', 'Colorado Springs', 'Raleigh', 'Miami', 'Virginia Beach', 'Omaha', 'Oakland', 'Minneapolis', 'Tulsa', 'Arlington', 'Tampa', 'New Orleans',
    
    // US States
    'California', 'Texas', 'Florida', 'New York', 'Pennsylvania', 'Illinois', 'Ohio', 'Georgia', 'North Carolina', 'Michigan', 'New Jersey', 'Virginia', 'Washington', 'Arizona', 'Massachusetts', 'Tennessee', 'Indiana', 'Missouri', 'Maryland', 'Wisconsin', 'Colorado', 'Minnesota', 'South Carolina', 'Alabama', 'Louisiana', 'Kentucky', 'Oregon', 'Oklahoma', 'Connecticut', 'Utah', 'Iowa', 'Nevada', 'Arkansas', 'Mississippi', 'Kansas', 'New Mexico', 'Nebraska', 'West Virginia', 'Idaho', 'Hawaii', 'New Hampshire', 'Maine', 'Montana', 'Rhode Island', 'Delaware', 'South Dakota', 'North Dakota', 'Alaska', 'Vermont', 'Wyoming',
    
    // Regions
    'Northeast', 'Southeast', 'Southwest', 'Northwest', 'Midwest', 'West Coast', 'East Coast', 'South', 'North', 'Central',
    
    // International
    'Canada', 'Mexico', 'UK', 'London', 'Paris', 'Germany', 'Japan', 'Tokyo', 'Australia', 'Sydney', 'Brazil', 'India', 'China', 'Toronto', 'Vancouver', 'Montreal',
    
    // Abbreviations
    'NYC', 'LA', 'SF', 'DC', 'ATL', 'CHI', 'BOS', 'SEA', 'DEN', 'MIA', 'LAS', 'PHX', 'DFW', 'SAN', 'PDX', 'MSP', 'DTW', 'ORD', 'LAX', 'JFK', 'LGA'
  ];
  
  for (const location of locations) {
    if (text.toLowerCase().includes(location.toLowerCase())) {
      return location;
    }
  }
  
  return null;
}

export function detectMediaTypes(text: string): string[] {
  const mediaTypeMap = {
    'TV': ['tv', 'television', 'broadcast', 'cable', 'streaming tv', 'linear tv'],
    'RADIO': ['radio', 'podcast', 'audio', 'am/fm', 'satellite radio'],
    'DIGITAL': ['digital', 'online', 'web', 'mobile', 'app', 'social media', 'display', 'banner', 'video', 'pre-roll', 'mid-roll', 'post-roll'],
    'PRINT': ['print', 'newspaper', 'magazine', 'billboard', 'flyer', 'brochure'],
    'OOH': ['ooh', 'out-of-home', 'billboard', 'transit', 'airport', 'mall', 'street furniture', 'digital signage'],
    'STREAMING': ['streaming', 'ott', 'connected tv', 'ctv', 'hulu', 'netflix', 'prime video', 'disney+', 'paramount+', 'hbo max', 'peacock'],
    'PODCAST': ['podcast', 'audio', 'spotify', 'apple podcasts', 'google podcasts'],
    'SOCIAL': ['social', 'facebook', 'instagram', 'twitter', 'tiktok', 'snapchat', 'linkedin', 'youtube', 'pinterest'],
    'PROGRAMMATIC': ['programmatic', 'rtb', 'dsp', 'ssp', 'ad exchange', 'demand side platform', 'supply side platform']
  };
  
  const detectedTypes: string[] = [];
  const lowerText = text.toLowerCase();
  
  Object.entries(mediaTypeMap).forEach(([type, keywords]) => {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      detectedTypes.push(type);
    }
  });
  
  return detectedTypes;
}

export function detectUrgency(text: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' {
  const lowerText = text.toLowerCase();
  
  // Urgent indicators
  const urgentWords = ['urgent', 'asap', 'immediate', 'emergency', 'critical', 'rush', 'deadline today', 'need now'];
  if (urgentWords.some(word => lowerText.includes(word))) {
    return 'URGENT';
  }
  
  // High priority indicators
  const highWords = ['high priority', 'important', 'deadline', 'time-sensitive', 'priority', 'fast track'];
  if (highWords.some(word => lowerText.includes(word))) {
    return 'HIGH';
  }
  
  // Low priority indicators
  const lowWords = ['low priority', 'when possible', 'no rush', 'flexible', 'sometime'];
  if (lowWords.some(word => lowerText.includes(word))) {
    return 'LOW';
  }
  
  // Default to medium
  return 'MEDIUM';
}

export function detectDealSize(text: string): 'SMALL' | 'MEDIUM' | 'LARGE' | 'ENTERPRISE' | null {
  const lowerText = text.toLowerCase();
  
  // Look for dollar amounts
  const dollarMatches = text.match(/\$[\d,]+/g);
  if (dollarMatches) {
    const amounts = dollarMatches.map(match => {
      const cleanAmount = match.replace(/[$,]/g, '');
      return parseInt(cleanAmount);
    });
    
    const maxAmount = Math.max(...amounts);
    
    if (maxAmount >= 2000000) return 'ENTERPRISE';
    if (maxAmount >= 500000) return 'LARGE';
    if (maxAmount >= 50000) return 'MEDIUM';
    if (maxAmount > 0) return 'SMALL';
  }
  
  // Look for written indicators
  if (lowerText.includes('enterprise') || lowerText.includes('large budget') || lowerText.includes('major campaign')) {
    return 'ENTERPRISE';
  }
  
  if (lowerText.includes('mid-size') || lowerText.includes('medium budget')) {
    return 'LARGE';
  }
  
  if (lowerText.includes('small budget') || lowerText.includes('startup') || lowerText.includes('local')) {
    return 'SMALL';
  }
  
  return null;
}

export function generateMetadata(title: string, content: string) {
  const tags = generateSmartTags(title, content);
  const companies = extractCompanyNames(`${title} ${content}`);
  const location = detectLocation(`${title} ${content}`);
  const mediaTypes = detectMediaTypes(`${title} ${content}`);
  const urgency = detectUrgency(`${title} ${content}`);
  const dealSize = detectDealSize(`${title} ${content}`);
  
  return {
    tags,
    companies,
    location,
    mediaTypes,
    urgency,
    dealSize
  };
} 