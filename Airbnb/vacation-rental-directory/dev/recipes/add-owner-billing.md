# Add Owner Billing

Add /owner/billing pages, connect to Stripe Billing, show current tier + upgrade CTA, write tests.

## Tasks
- [ ] Create `/owner/billing` page with current subscription display
- [ ] Integrate Stripe Billing Portal for plan management
- [ ] Add tier-based feature restrictions (Basic/Pro/Premium)
- [ ] Show upgrade CTAs for higher tiers
- [ ] Add billing webhooks for subscription changes
- [ ] Write tests for billing flow and restrictions
- [ ] Add billing-related database schema updates

## Implementation Notes
- Use Stripe Customer Portal for easy plan changes
- Store subscription status in user/owner model
- Add middleware to check tier permissions
- Create reusable upgrade prompt components