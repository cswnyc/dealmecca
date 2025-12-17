# DealMecca

The modern platform for media sales professionals. A competitive alternative to SellerCrowd with 50-60% lower pricing, mobile-first design, and AI-powered features.

## 🚀 Features

- **Comprehensive Database**: Access 2,700+ agencies and 5,000+ advertisers
- **Mobile-First Design**: Perfect for field sales teams
- **AI-Powered Search**: Intelligent prospect recommendations
- **Anonymous Community**: Connect with 7,000+ media sales professionals
- **Real-Time Updates**: Automated tracking of job changes and company moves
- **CRM Integration**: Seamless integration with Salesforce, HubSpot, and more

## 🎯 Competitive Advantages

- **50-60% lower pricing** than SellerCrowd ($1,200-2,400/year vs ~$5,700/year)
- **Mobile-first design** (competitors are desktop-focused)
- **AI-powered search and recommendations**
- **Real-time data updates** and automated scraping
- **Multi-platform integrations** (CRM, email, Slack)
- **Freemium model** with generous free tier

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with shadcn/ui patterns
- **Icons**: Lucide React
- **Authentication**: NextAuth.js (planned)
- **State Management**: Zustand (planned)
- **Database**: PostgreSQL with Prisma ORM (planned)
- **Deployment**: Vercel (planned)

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dealmecca
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Visit [http://localhost:3000](http://l\calhost:3000) to see the application.

## 📁 Project Structure

```
website/
├── app/                    # Next.js App Router pages
│   ├── globals.css         # Global styles with Tailwind
│   ├── layout.tsx          # Root layout component
│   └── page.tsx           # Homepage/landing page
├── components/
│   └── ui/                # Reusable UI components
│       ├── button.tsx     # Button component with variants
│       └── card.tsx       # Card components
├── lib/
│   └── utils.ts           # Utility functions
├── public/                # Static assets (planned)
├── next.config.mjs        # Next.js configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies and scripts
```

## 🎨 Design System

### Colors
- **Primary Blue**: `#2575FC` - Trust and reliability
- **Accent Violet**: `#8B5CF6` - Call-to-action buttons and highlights
- **Brand Ink**: `#162B54` - Headings and dark text

### Typography
- **Font**: Inter (Google Fonts)
- **Headings**: Bold, modern hierarchy
- **Body**: Readable, accessible text

### Components
- Built with accessibility in mind
- Mobile-first responsive design
- Dark mode support (configured)
- Consistent spacing and sizing

## 📱 Planned Features (MVP - Phase 1)

### User Authentication & Profiles
- [ ] Email/password and Google OAuth
- [ ] User roles: Free, Pro, Team Admin
- [ ] Profile with sales experience, territory, media types

### Agency/Advertiser Database
- [ ] Company profiles with contact information
- [ ] Org charts with decision makers
- [ ] Advanced search and filter functionality
- [ ] Mobile-responsive database views

### Community Forum
- [ ] Anonymous posting with usernames
- [ ] Categories: Account Moves, RFPs, Industry News, Q&A
- [ ] Upvoting/downvoting system
- [ ] Real-time notifications

### Freemium Pricing Model
- [ ] Free: 10 searches/month, basic org charts
- [ ] Pro ($99/month): Unlimited searches, advanced features
- [ ] Team ($299/month): Multiple users, admin dashboard

## 🚀 Phase 2 Features

- [ ] AI-powered prospect recommendations
- [ ] CRM integrations (Salesforce, HubSpot)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics and reporting
- [ ] Email sequence templates

## 📊 Performance Goals

- **Page Load Time**: < 2 seconds
- **Mobile Performance**: 90+ Lighthouse score
- **Search Speed**: < 500ms response time
- **Uptime**: 99.9% availability

## 🔒 Security Considerations

- Data encryption at rest and in transit
- Rate limiting to prevent scraping abuse
- User authentication and authorization
- GDPR and privacy compliance
- Regular security audits

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 📞 Contact

For questions about development or business inquiries, please contact the development team.

---

Built with ❤️ for media sales professionals who deserve better tools. 