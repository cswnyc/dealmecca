#!/usr/bin/env npx tsx
/**
 * Enhanced Forum User Creation Script
 * Creates diverse, realistic users for forum deployment
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface UserTemplate {
  name: string;
  email: string;
  role: 'FREE' | 'PRO' | 'ADMIN';
  subscriptionTier: 'FREE' | 'PRO' | 'TEAM';
  industry?: string;
  location?: string;
  anonymousHandle?: string;
}

// Diverse user personas for the business/deal forum
const USER_TEMPLATES: UserTemplate[] = [
  // Entrepreneurs & Business Owners
  { name: "Sarah Johnson", email: "sarah.j@techstartup.co", role: "PRO", subscriptionTier: "PRO", industry: "Technology", location: "San Francisco", anonymousHandle: "TechFounder2024" },
  { name: "Michael Chen", email: "mike.chen@ecommerce.biz", role: "FREE", subscriptionTier: "FREE", industry: "E-commerce", location: "New York", anonymousHandle: "EcomExpert" },
  { name: "Jessica Martinez", email: "j.martinez@consulting.pro", role: "PRO", subscriptionTier: "PRO", industry: "Consulting", location: "Austin", anonymousHandle: "ConsultingPro" },
  { name: "David Kim", email: "david@fintech.startup", role: "PRO", subscriptionTier: "TEAM", industry: "FinTech", location: "Seattle", anonymousHandle: "FintechDave" },
  { name: "Emma Thompson", email: "emma.t@healthtech.co", role: "FREE", subscriptionTier: "FREE", industry: "Healthcare", location: "Boston", anonymousHandle: "HealthInnovator" },

  // Investors & VCs
  { name: "Robert Williams", email: "r.williams@vcfund.com", role: "PRO", subscriptionTier: "TEAM", industry: "Venture Capital", location: "Palo Alto", anonymousHandle: "SiliconInvestor" },
  { name: "Lisa Anderson", email: "lisa@angelgroup.net", role: "PRO", subscriptionTier: "PRO", industry: "Angel Investing", location: "Chicago", anonymousHandle: "AngelLisa" },
  { name: "James Rodriguez", email: "james.r@peequity.fund", role: "PRO", subscriptionTier: "TEAM", industry: "Private Equity", location: "Miami", anonymousHandle: "PEJames" },

  // Sales & Marketing Professionals  
  { name: "Amanda Davis", email: "a.davis@salesforce.expert", role: "FREE", subscriptionTier: "FREE", industry: "Sales", location: "Denver", anonymousHandle: "SalesAce" },
  { name: "Chris Wilson", email: "chris.w@digitalmarketing.co", role: "PRO", subscriptionTier: "PRO", industry: "Marketing", location: "Portland", anonymousHandle: "MarketingGuru" },
  { name: "Rachel Green", email: "rachel@socialmedia.agency", role: "FREE", subscriptionTier: "FREE", industry: "Social Media", location: "Los Angeles", anonymousHandle: "SocialMediaRach" },

  // Real Estate & Property
  { name: "Mark Johnson", email: "mark.j@realestate.pro", role: "PRO", subscriptionTier: "PRO", industry: "Real Estate", location: "Phoenix", anonymousHandle: "PropertyDealer" },
  { name: "Jennifer Liu", email: "jennifer@commercialre.com", role: "PRO", subscriptionTier: "TEAM", industry: "Commercial Real Estate", location: "Dallas", anonymousHandle: "CommercialJen" },

  // Service Providers
  { name: "Steve Miller", email: "steve@webdesign.studio", role: "FREE", subscriptionTier: "FREE", industry: "Web Design", location: "Nashville", anonymousHandle: "WebDesignSteve" },
  { name: "Maria Garcia", email: "maria@legalservices.law", role: "PRO", subscriptionTier: "PRO", industry: "Legal Services", location: "San Diego", anonymousHandle: "LegalEagle" },
  { name: "Tom Brown", email: "tom.b@accounting.firm", role: "FREE", subscriptionTier: "FREE", industry: "Accounting", location: "Atlanta", anonymousHandle: "NumbersCruncher" },
  { name: "Kelly White", email: "kelly@hrConsulting.biz", role: "PRO", subscriptionTier: "PRO", industry: "Human Resources", location: "Minneapolis", anonymousHandle: "HRKelly" },

  // Freelancers & Consultants
  { name: "Alex Taylor", email: "alex.taylor@freelance.design", role: "FREE", subscriptionTier: "FREE", industry: "Graphic Design", location: "Remote", anonymousHandle: "DesignAlex" },
  { name: "Nicole Davis", email: "nicole@contentcreator.co", role: "FREE", subscriptionTier: "FREE", industry: "Content Creation", location: "Remote", anonymousHandle: "ContentQueen" },
  { name: "Ryan Martinez", email: "ryan@devConsultant.tech", role: "PRO", subscriptionTier: "PRO", industry: "Software Development", location: "Remote", anonymousHandle: "CodeConsultant" },

  // Industry Specialists
  { name: "Dr. Patricia Wilson", email: "p.wilson@biotech.research", role: "PRO", subscriptionTier: "TEAM", industry: "Biotechnology", location: "San Diego", anonymousHandle: "BiotechDoc" },
  { name: "Carlos Rodriguez", email: "carlos@manufacturing.co", role: "PRO", subscriptionTier: "PRO", industry: "Manufacturing", location: "Detroit", anonymousHandle: "ManufacturingCarlos" },
  { name: "Ashley Kim", email: "ashley@retailchain.com", role: "FREE", subscriptionTier: "FREE", industry: "Retail", location: "Las Vegas", anonymousHandle: "RetailAsh" },
  { name: "Brian Thompson", email: "brian@logistics.express", role: "PRO", subscriptionTier: "PRO", industry: "Logistics", location: "Memphis", anonymousHandle: "LogisticsBrian" },

  // Additional Diverse Users
  { name: "Priya Patel", email: "priya@edutech.startup", role: "FREE", subscriptionTier: "FREE", industry: "Education Technology", location: "Raleigh", anonymousHandle: "EdTechPriya" },
  { name: "Mohammed Al-Rashid", email: "mohammed@energyventures.sa", role: "PRO", subscriptionTier: "TEAM", industry: "Energy", location: "Houston", anonymousHandle: "EnergyExpert" },
  { name: "Sophie Dubois", email: "sophie@luxurybrand.fr", role: "PRO", subscriptionTier: "PRO", industry: "Luxury Goods", location: "Miami", anonymousHandle: "LuxurySophie" },
  { name: "Hiroshi Tanaka", email: "hiroshi@robotics.jp", role: "PRO", subscriptionTier: "TEAM", industry: "Robotics", location: "San Jose", anonymousHandle: "RoboticsHiro" },

  // More entrepreneurs across different sectors
  { name: "Victoria Adams", email: "victoria@foodtech.startup", role: "FREE", subscriptionTier: "FREE", industry: "Food Technology", location: "Portland", anonymousHandle: "FoodTechVic" },
  { name: "Daniel Murphy", email: "daniel@cryptotrading.io", role: "PRO", subscriptionTier: "PRO", industry: "Cryptocurrency", location: "Miami", anonymousHandle: "CryptoDan" },
  { name: "Isabella Santos", email: "isabella@socialimpact.org", role: "FREE", subscriptionTier: "FREE", industry: "Social Impact", location: "Washington DC", anonymousHandle: "ImpactBella" },
  { name: "Noah Johnson", email: "noah@gamestudio.dev", role: "PRO", subscriptionTier: "PRO", industry: "Gaming", location: "Seattle", anonymousHandle: "GameDevNoah" },

  // More service providers
  { name: "Grace Lee", email: "grace@publicrelations.agency", role: "PRO", subscriptionTier: "PRO", industry: "Public Relations", location: "New York", anonymousHandle: "PRGrace" },
  { name: "Ethan Clark", email: "ethan@cybersecurity.expert", role: "PRO", subscriptionTier: "TEAM", industry: "Cybersecurity", location: "Austin", anonymousHandle: "CyberEthan" },
  { name: "Mia Rodriguez", email: "mia@eventplanning.co", role: "FREE", subscriptionTier: "FREE", industry: "Event Planning", location: "Las Vegas", anonymousHandle: "EventPlannerMia" },
  { name: "Lucas Brown", email: "lucas@supplychain.optimize", role: "PRO", subscriptionTier: "PRO", industry: "Supply Chain", location: "Atlanta", anonymousHandle: "SupplyChainLuc" },

  // International users
  { name: "Emma Clarke", email: "emma@londontech.uk", role: "PRO", subscriptionTier: "PRO", industry: "Technology", location: "London", anonymousHandle: "LondonTechEmma" },
  { name: "Pierre Dubois", email: "pierre@parisventures.fr", role: "PRO", subscriptionTier: "TEAM", industry: "Venture Capital", location: "Paris", anonymousHandle: "ParisVCPierre" },
  { name: "Anna Müller", email: "anna@berlinStartup.de", role: "FREE", subscriptionTier: "FREE", industry: "Technology", location: "Berlin", anonymousHandle: "BerlinTechAnna" },
  { name: "Raj Kumar", email: "raj@mumbaifintech.in", role: "PRO", subscriptionTier: "PRO", industry: "FinTech", location: "Mumbai", anonymousHandle: "FintechRaj" },

  // Additional professionals
  { name: "Samantha Wilson", email: "sam@sustainabletech.eco", role: "FREE", subscriptionTier: "FREE", industry: "Sustainability", location: "San Francisco", anonymousHandle: "EcoSam" },
  { name: "Tyler Martinez", email: "tyler@sportsbusiness.pro", role: "PRO", subscriptionTier: "PRO", industry: "Sports Business", location: "Denver", anonymousHandle: "SportsBizTyler" },
  { name: "Chloe Anderson", email: "chloe@fashiontech.style", role: "FREE", subscriptionTier: "FREE", industry: "Fashion Technology", location: "New York", anonymousHandle: "FashionTechChloe" },
  { name: "Mason Davis", email: "mason@constructiontech.build", role: "PRO", subscriptionTier: "PRO", industry: "Construction Technology", location: "Dallas", anonymousHandle: "ConTechMason" },

  // More diverse professionals
  { name: "Zoe Thompson", email: "zoe@traveltech.explore", role: "FREE", subscriptionTier: "FREE", industry: "Travel Technology", location: "Miami", anonymousHandle: "TravelTechZoe" },
  { name: "Jordan Kim", email: "jordan@musictech.sound", role: "PRO", subscriptionTier: "PRO", industry: "Music Technology", location: "Nashville", anonymousHandle: "MusicTechJordan" },
  { name: "Ruby Singh", email: "ruby@agritech.farm", role: "FREE", subscriptionTier: "FREE", industry: "Agriculture Technology", location: "Sacramento", anonymousHandle: "AgriTechRuby" },
  { name: "Flynn O'Brien", email: "flynn@maritimetech.sea", role: "PRO", subscriptionTier: "PRO", industry: "Maritime Technology", location: "Seattle", anonymousHandle: "MaritimeFlyn" },

  // Final batch of diverse users
  { name: "Luna Garcia", email: "luna@spacetech.cosmos", role: "PRO", subscriptionTier: "TEAM", industry: "Space Technology", location: "Los Angeles", anonymousHandle: "SpaceTechLuna" },
  { name: "River Johnson", email: "river@greentech.renewable", role: "FREE", subscriptionTier: "FREE", industry: "Green Technology", location: "Portland", anonymousHandle: "GreenTechRiver" },
  { name: "Phoenix Lee", email: "phoenix@quantumtech.future", role: "PRO", subscriptionTier: "TEAM", industry: "Quantum Technology", location: "Boston", anonymousHandle: "QuantumPhoenix" },
  { name: "Sage Miller", email: "sage@wellness.mindful", role: "FREE", subscriptionTier: "FREE", industry: "Wellness Technology", location: "Boulder", anonymousHandle: "WellnessSage" }
];

// Additional anonymous handles for variety
const ADDITIONAL_ANONYMOUS_HANDLES = [
  "DealHunter2024", "NetworkingNinja", "BusinessBuilder", "StartupSage", "InvestorInsight",
  "DealMaker", "BusinessBeast", "VentureVoyager", "TradeTitan", "MarketMover",
  "ProfitPioneer", "RevenueRocket", "GrowthGuru", "ScaleSeeker", "DealDetective",
  "BusinessBrain", "StartupStar", "InvestmentIQ", "CommercialChamp", "TradeTracker",
  "DealDigger", "BusinessBuddy", "VentureVanguard", "ProfitPro", "MarketMaster",
  "GrowthGenius", "ScaleSpecialist", "RevenueRanger", "DealDynamo", "BusinessBolt",
  "StartupSavvy", "InvestorEdge", "CommercialCrafter", "TradeTopgun", "DealDriven",
  "BusinessBlitz", "VentureViking", "ProfitPilot", "MarketMagician", "GrowthGladiator"
];

async function createForumUsers() {
  try {
    console.log('🚀 Starting Forum User Creation...');
    console.log(`📊 Will create ${USER_TEMPLATES.length} users`);
    
    const createdUsers = [];
    let skipCount = 0;
    
    for (let i = 0; i < USER_TEMPLATES.length; i++) {
      const template = USER_TEMPLATES[i];
      
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: template.email }
      });
      
      if (existingUser) {
        console.log(`⏭️  Skipping existing user: ${template.email}`);
        skipCount++;
        continue;
      }
      
      // Hash password (same for all test users for convenience)
      const hashedPassword = await bcrypt.hash('password123', 12);
      
      // Create user
      const user = await prisma.user.create({
        data: {
          name: template.name,
          email: template.email,
          password: hashedPassword,
          role: template.role,
          subscriptionTier: template.subscriptionTier,
          subscriptionStatus: 'ACTIVE',
          searchesUsed: Math.floor(Math.random() * 5), // Vary usage
          searchesThisMonth: Math.floor(Math.random() * 10),
          dashboardVisits: Math.floor(Math.random() * 20),
          achievementPoints: Math.floor(Math.random() * 100),
          annualEventGoal: Math.floor(Math.random() * 20) + 5,
          annualNetworkingGoal: Math.floor(Math.random() * 100) + 25,
          annualRevenueGoal: template.subscriptionTier === 'FREE' ? null : Math.floor(Math.random() * 1000000) + 100000,
          lastDashboardVisit: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)), // Within last week
          searchResetDate: new Date(),
          searchesResetAt: new Date(),
          lastSearchLimitCheck: new Date(),
          cancelAtPeriodEnd: false,
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)), // Created within last month
        }
      });
      
      createdUsers.push({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscriptionTier: user.subscriptionTier,
        anonymousHandle: template.anonymousHandle,
        industry: template.industry,
        location: template.location
      });
      
      console.log(`✅ Created user: ${user.name} (${user.email}) - ${user.role}/${user.subscriptionTier}`);
    }
    
    console.log('\n🎉 User Creation Complete!');
    console.log(`📈 Statistics:`);
    console.log(`   - Created: ${createdUsers.length} users`);
    console.log(`   - Skipped: ${skipCount} existing users`);
    console.log(`   - Total: ${USER_TEMPLATES.length} users processed`);
    
    // Role breakdown
    const roleBreakdown = createdUsers.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log(`\n👥 Role Distribution:`);
    Object.entries(roleBreakdown).forEach(([role, count]) => {
      console.log(`   - ${role}: ${count} users`);
    });
    
    // Tier breakdown  
    const tierBreakdown = createdUsers.reduce((acc, user) => {
      acc[user.subscriptionTier] = (acc[user.subscriptionTier] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log(`\n💎 Subscription Tier Distribution:`);
    Object.entries(tierBreakdown).forEach(([tier, count]) => {
      console.log(`   - ${tier}: ${count} users`);
    });
    
    console.log('\n🔑 Login Info for Testing:');
    console.log('   - Email: Any of the emails above');
    console.log('   - Password: password123');
    
    console.log('\n✨ Anonymous Handles Ready:');
    createdUsers.slice(0, 10).forEach(user => {
      if (user.anonymousHandle) {
        console.log(`   - ${user.name} → "${user.anonymousHandle}"`);
      }
    });
    
    return createdUsers;
    
  } catch (error) {
    console.error('❌ Error creating forum users:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  createForumUsers()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { createForumUsers, USER_TEMPLATES, ADDITIONAL_ANONYMOUS_HANDLES };