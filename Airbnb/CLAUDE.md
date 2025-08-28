- # Claude Project Memory — Local Stays (Book-Direct Directory)

## Mission (what we’re building)
A local-first, **book-direct vacation rental directory** (lead-gen, not an OTA). Guests contact owners directly. No platform booking fees.

## Business model (non-negotiable)
- **Revenue:** annual owner subscriptions — Bronze/Silver/Gold/Platinum (no commissions).
- **Gatekeeping:** a listing can be set to **ACTIVE only if owner has an active Subscription**.
- **Upgrades:** search ranking is tier-weighted + behavior signals (photos, reviews, responsiveness, recency).

## Core features (v1)
- Search (city/neighborhood/price/beds/sleeps), Listing page, Inquiry (lead) flow.
- Owner dashboard (CRUD listings, iCal import later), Billing page (Stripe Billing), Admin approvals queue.
- **Programmatic SEO:** city/amenities/bedrooms landing pages + sitemaps + canonicals.

## Stack invariants (don’t change unless asked)
- Next.js 14 (App Router, TS), Tailwind + shadcn.
- Postgres + Prisma; NextAuth (later), server actions for mutations.
- Stripe Billing (annual plans) via **lookup keys** from env; webhook syncs Subscription rows.
- Resend (email) + Twilio (SMS) later; Upstash Redis for rate-limits/queues.
- Mapbox for maps; Uploads → S3/R2.
- Security: Zod validation, RBAC (guest/owner/admin), hCaptcha on public forms.

## Definition of Done (every feature)
- Small diffs + clear file tree.
- Unit test or Playwright happy-path where sensible.
- Zod validation on inputs; no secrets in client code.
- Add/Update docs in `/dev/recipes` or `/docs/runbook.md`.

## Always use Claude Code SDK + Recipes (standing rule)
Before writing code, **check `/dev/recipes`**. If none exists:
1) **Draft a recipe** (goal, files to add/modify, env needs, acceptance tests).
2) **Apply recipe with Claude Code SDK** → show diffs, do not run shell commands.
3) Print exact commands I (human) must run (migrations, seeds, webhook listen).

> If a task is fuzzy, ask for the recipe first.  
> If you need to rename or move lots of files, propose a **codemod** via recipe.

## Legal/positioning
- We are an **advertising/listing service** (lead-gen). Clearly disclose “no booking fees; direct with owners.”
- Add scam-prevention tips + compliance notes per city.

## Ranking signal (simple baseline)
`rank = tierWeight(Plat=4,Gold=3,Silver=2,Bronze=1)*100 + 20*avgReview + 5*photoCount(min 8) + recencyBoost(<=30)`

## Don’ts
- Don’t add full OTA checkout in v1.
- Don’t run shell commands; print them.
- Don’t change schema enums or stack without a migration plan + recipe.

## Useful paths
- Admin: `/admin/approvals?token=$ADMIN_BYPASS_TOKEN`
- Billing: `/owner/billing` (gate listing activation if no active sub)
- SEO pages route: `/[...slug]` under `(seo)` (canonicalize slugs)
- Pinned memory: This repo builds a book-direct directory with Stripe-gated listings and programmatic SEO. Use CLAUDE CODE SDK + recipes in /dev/recipes for every feature. Don’t run shell commands; show diffs and a file tree; print commands for me to run.
- # Runbook (Dev)
- Setup: `cp .env.example .env.local` → fill DB/Stripe keys
- Prisma: `npx prisma generate && npx prisma migrate dev --name init && npm run seed`
- Stripe seed: `npm run stripe:seed`
- SEO pages: `npx ts-node scripts/seo/buildSeoPages.ts`
- Dev: `npm run dev`