- I am building a competitor forum to sellercrowd, I want to use claude code sdk
- # DealMecca Project - Claude Code Memory Notes

## 🎯 Project Overview
**DealMecca** is a B2B media seller intelligence platform - a competitor to SellerCrowd, ZoomInfo, and Apollo specifically optimized for advertising/marketing industry professionals.

**Current Status**: 95% complete, production-ready system with bulk import capability built
**Goal**: Scale from 17 seeded companies to 1000+ companies, then optimize and enhance

---

## 🏗️ System Architecture

### **Tech Stack**
- **Framework**: Next.js 15 with React 18 and TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: firebase with role-based access
- **Styling**: Tailwind CSS + shadcn/ui components
- **Deployment**: Vercel (production) + Neon PostgreSQL

### **Key URLs**

- **Production**: https://www.getmecca.com
- **Local Dev**: http://localhost:3002
- **Admin Panel**: /admin (admin@dealmecca.pro / password123)
- **Bulk Import**: /admin/bulk-import
- **Org Charts**: /orgs

### **Authentication Accounts**
- **Admin**: admin@dealmecca.pro / password123
- **Pro User**: pro@dealmecca.pro / test123

---

## 📊 Database Schema & Key Models

### **Core Models (Prisma)**
```prisma
- User (authentication, roles: FREE/PRO/ADMIN/TEAM)
- Company (business entities with 5-tier quality scoring)
- Contact (individuals linked to companies with lead scoring)
- SavedSearch (user saved searches with alerts)
- ContactInteraction (tracking emails, calls, meetings)
- ContactNote (private notes with privacy controls)
- ViewedContact (activity tracking)
- ContactStatus (lead pipeline management)
```

### **Data Quality System**
5-tier verification levels:
1. **Basic** (0-20 points)
2. **Verified** (21-40 points) 
3. **Premium Verified** (41-60 points)
4. **Expert Verified** (61-80 points)
5. **Platform Verified** (81-100 points)

---

## 🎯 Industry Focus & Target Users

### **Primary Industry**: Advertising & Marketing
- Agencies (creative, media, digital)
- Brands (in-house marketing teams)  
- Vendors (ad tech, mar tech, services)
- Holding companies (WPP, Publicis, IPG, etc.)

### **Key User Personas**
- **Media Sellers**: Selling ad space, media services
- **Agency Business Development**: New client acquisition
- **Vendor Sales**: Selling to agencies and brands
- **Marketing Professionals**: Finding contacts for partnerships

### **Common Search Patterns**
- Role-based searches (CMO, Media Director, etc.)
- Seniority filtering (C-Level, Director, Manager)
- Company type filtering (Agency, Brand, Vendor)
- Geographic targeting (city, state, region)
- Industry specialization (automotive, healthcare, etc.)

---

## 🎨 UI/UX Design Principles

### **Design Philosophy**
- **Mobile-first**: Responsive design with mobile optimization
- **Professional**: Clean, modern interface for business users
- **Fast**: Sub-3 second page loads, <1 second search responses
- **Intuitive**: Easy navigation, clear information hierarchy

### **Key Design Elements**
- **Gradient avatars**: Professional profile images
- **Card-based layout**: Clean contact and company cards
- **Action buttons**: Email, Phone, LinkedIn, View Profile
- **Quality indicators**: Verification badges and scores
- **Breadcrumb navigation**: Clear user journey tracking

### **Mobile Features**
- **Swipeable contact cards**: Gesture-based interactions
- **Bottom navigation**: Core functions easily accessible
- **Pull-to-refresh**: Native mobile behaviors
- **Touch-optimized**: Proper button sizes and spacing

---

## 🚀 Current System Capabilities

### **✅ Working Features**
- Complete authentication system with role-based access
- Organization charts with 17+ companies seeded
- Individual contact profiles with professional details
- Search functionality across companies and contacts
- Admin panel with bulk import system built
- Mobile-responsive interface throughout
- Contact action buttons (email, phone, LinkedIn)
- Company profile pages with verification badges

### **🎯 Competitive Advantages vs SellerCrowd**
- **Modern tech stack** vs outdated competitor platform
- **Mobile-first design** vs desktop-only competitor
- **Industry specialization** for advertising/marketing
- **Real-time performance** vs slow page reloads
- **Professional UI/UX** with better user experience
- **5-tier data quality** system vs basic verification

---

## 📈 Development Roadmap & Priorities

### **Current Phase: Data Scaling**
- ✅ Bulk import system built at `/admin/bulk-import`
- 🎯 Scale from 17 to 1000+ companies via CSV import
- 🎯 Monitor performance and optimize for scale
- 🎯 Use real data to identify optimization needs

### **Next Priorities (After Scaling)**
1. **Performance Optimization**: Database queries, search speed
2. **Enhanced Search**: Auto-complete, advanced filtering
3. **Role-Based Features**: Differentiate Pro vs Free users
4. **Mobile Polish**: Gesture improvements, PWA features
5. **Analytics Dashboard**: Usage tracking and insights
6. **Forum Integration**: Community features linking

---

## 🔧 Development Guidelines

### **Code Standards**
- **TypeScript**: Strict typing throughout
- **Component Architecture**: Reusable shadcn/ui components
- **API Design**: RESTful endpoints with proper error handling
- **Database**: Prisma with optimized queries and indexes
- **Performance**: Monitor page load times and search responses

### **Key Patterns to Follow**
- Use existing Prisma models and schema
- Maintain mobile-first responsive design
- Preserve authentication and role-based access
- Keep data quality scoring system
- Follow existing UI component patterns

### **Testing Requirements**
- All new features must work on mobile
- Maintain sub-3 second page load times
- Search responses must stay under 1 second
- Preserve all existing functionality during changes
- Test with both admin and regular user accounts

---

## 🎯 Success Metrics

### **Performance Targets**
- **Page Load Time**: <3 seconds
- **Search Response**: <1 second
- **Mobile Experience**: Fully functional on all screen sizes
- **Data Volume**: Support 1000+ companies smoothly
- **Uptime**: 99.9% availability in production

### **User Experience Goals**
- **Intuitive Navigation**: Users find contacts within 30 seconds
- **Complete Profiles**: All contacts have professional details
- **Action Integration**: Easy email/call/LinkedIn actions
- **Mobile Parity**: Full features available on mobile
- **Data Quality**: High verification scores and accurate info

---

## 🚨 Critical Deployment Rules

### **ALWAYS Use OAuth-Safe Deployment**
**CRITICAL**: OAuth integrations (LinkedIn, Google, Stripe) require consistent domains

**✅ CORRECT Production Deployment:**
```bash
vercel --prod --alias getmecca.com
# OR use the npm script:
npm run deploy:prod
```

**❌ NEVER Use Random Vercel URLs:**
```bash
vercel --prod  # Creates random URLs that break OAuth
```

**Why This Matters:**
- LinkedIn OAuth only works on `getmecca.com` (registered redirect URI)
- Stripe webhooks are configured for specific domains
- Random Vercel URLs like `dealmecca-abc123.vercel.app` will cause authentication failures
- OAuth providers require pre-registered redirect URIs for security

**OAuth Redirect URIs Currently Registered:**
- `https://getmecca.com/api/linkedin/callback`
- `https://getmecca.com/api/stripe/webhook`
- `http://localhost:3000/api/linkedin/callback` (development)

---

## 💡 Common Development Scenarios

### **Adding New Features**
1. Check existing patterns in codebase
2. Maintain mobile responsiveness
3. Preserve authentication requirements
4. Update relevant API endpoints
5. Test with real user accounts

### **Database Changes**
1. Use Prisma migrations
2. Maintain existing relationships  
3. Preserve data quality scoring
4. Consider performance impact
5. Test with bulk data

### **UI/UX Changes**
1. Follow shadcn/ui component library
2. Maintain mobile-first approach
3. Preserve accessibility features
4. Keep professional design aesthetic
5. Test across different screen sizes

---

## 🚨 Important Notes

### **Never Break These**
- Existing authentication system
- Mobile responsiveness  
- Current user accounts and data
- Production database schema
- Role-based access control

### **Always Remember**
- DealMecca is B2B, not B2C - professional audience
- Mobile experience is critical for field sales use
- Data quality and verification are key differentiators
- Performance matters - users expect fast responses
- Industry focus on advertising/marketing professionals

### **Current Blockers/Issues**
- None currently - system is stable and ready for scaling
- Main focus is data volume scaling and performance optimization

---

*Last Updated: Current development phase*
*Status: Ready for bulk data import and scaling phase*