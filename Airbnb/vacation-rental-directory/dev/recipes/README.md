# Development Recipes

This folder contains short, focused task prompts for systematic feature development. Each recipe includes:

- Clear task description
- Checklist of implementation steps  
- Technical implementation notes
- Key considerations and best practices

## Usage

1. Pick a recipe based on priority/roadmap
2. Create a feature branch: `git checkout -b feature/owner-billing`
3. Follow the recipe's task checklist
4. Test thoroughly and write tests
5. Create PR with clean diff for review

## Available Recipes

- **add-owner-billing.md** - Stripe billing, subscription tiers, upgrade CTAs
- **programmatic-seo.md** - SEO landing pages, sitemaps, structured data
- **add-reviews-system.md** - Guest reviews, ratings, photo uploads, moderation
- **add-booking-calendar.md** - Interactive calendar, availability, pricing
- **add-messaging-system.md** - Real-time messaging between guests and owners
- **add-payment-processing.md** - Stripe Connect, payments, payouts, refunds

## Recipe Format

Each recipe follows this structure:
```markdown
# Feature Name
Brief description of the feature

## Tasks
- [ ] Task 1
- [ ] Task 2

## Implementation Notes
- Technical considerations
- Library recommendations
- Architecture decisions
```