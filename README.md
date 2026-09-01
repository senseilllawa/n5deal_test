# N5Deal Marketplace (prototype)

**Live:** [n5deal-marketplace-delta.vercel.app](https://n5deal-marketplace-delta.vercel.app) — pick any account on `/login`, no password.

A B2B marketplace prototype for M&A / financial-asset listings — Buyer,
Seller, and Platform Manager roles, built for N5Deal's technical
assignment. Styled after [n5deal.com/all-listing](https://n5deal.com/all-listing).

Full reasoning behind the stack, auth approach, data model, and visual
design lives in **[ARCHITECTURE.md](ARCHITECTURE.md)** — this file is just
"how do I run it." Day-to-day coding conventions are in
**[CLAUDE.md](CLAUDE.md)**.

## Stack

Next.js 16 (App Router) + TypeScript · Tailwind + shadcn/ui (Base UI) ·
Prisma 7 + PostgreSQL (Neon in production, Docker locally) · iron-session
(demo-account login, no passwords) · zod · Vitest + Playwright.

## Local setup

Requires Node 20+ and Docker Desktop running.

```bash
npm install
cp .env.example .env        # if you don't already have one — see below
npm run db:up                # starts Postgres 16 in Docker (n5deal-pg)
npm run db:migrate           # applies prisma/migrations/
npm run db:seed              # seeds demo accounts, assets, contacts
npm run dev                  # http://localhost:3000
```

`.env` needs (see `.env`'s own comments for the full explanation of each):

```
DATABASE_URL="postgresql://n5deal:n5deal@localhost:55432/n5deal?schema=public"
DIRECT_URL="postgresql://n5deal:n5deal@localhost:55432/n5deal?schema=public"
SESSION_SECRET="<32+ random chars — openssl rand -base64 32>"
```

Open `/login` and pick any seeded account — there are no passwords. A few
accounts are seeded `SUSPENDED`/`REMOVED` on purpose, to demonstrate that
Manager moderation actually blocks login, not just flips a flag.

## Tests

```bash
npm run test        # Vitest — unit tests (validation, matching)
npm run test:e2e    # Playwright — full role-flow coverage, reseeds the DB first
```

## Deploying (Neon + Vercel)

1. **Neon** — [neon.tech](https://neon.tech) → New Project, region near
   wherever the Vercel deployment will run (`us-east` for Vercel's
   default). The dashboard gives you two connection strings:
   - **pooled** (host has a `-pooler` suffix) → `DATABASE_URL`
   - **direct** (no `-pooler`) → `DIRECT_URL`

   This split is load-bearing, not cosmetic: `lib/db.ts`'s runtime Prisma
   client uses the pooled URL (serverless functions open/close connections
   constantly; without PgBouncer in front you exhaust Neon's free-tier
   connection limit fast), while `prisma7.config.ts` — used only by the
   CLI for migrations — is pinned to the direct URL, since DDL can't run
   through a transaction pooler. See ARCHITECTURE.md "Persistence & driver
   adapter" for the full reasoning.

2. **Verify locally against the real database** before deploying, using
   the exact commands CI/CD would run:

   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

3. **Vercel**:

   ```bash
   npm i -g vercel   # pin a version if `latest` is broken — see note below
   vercel link
   vercel env add DATABASE_URL production      # the pooled string
   vercel env add DIRECT_URL production        # the direct string
   vercel env add SESSION_SECRET production    # openssl rand -base64 32
   vercel --prod
   ```

   No `OPENAI_API_KEY` — the "Match %" scoring (`lib/matching.ts`) is
   deterministic and rule-based, no external AI calls (see ARCHITECTURE.md
   "Buyer<->Asset matching").

   > **Notes from actually doing this:** `npm i -g vercel` failed on the
   > `latest` tag (`59.11.0` — a missing transitive dependency,
   > `@vercel/fastify@6.0.0`). `vercel@59.10.0` installed cleanly. Worth
   > checking `npm view vercel dist-tags` if `latest` misbehaves again —
   > the same thing happened with Prisma's `latest` tag earlier in this
   > project (see CLAUDE.md). Also, `vercel link`'s first run silently
   > appended a duplicate `.env*` line to `.gitignore` *after* this repo's
   > `!.env.example` exception, re-hiding that file — worth a `git status`
   > check post-link. `.vercelignore` (already in this repo) keeps `.env`
   > itself out of the deployment bundle, since a CLI-based `vercel --prod`
   > doesn't reliably mirror `.gitignore` for dotfiles the way a
   > Git-connected deployment would.

## Assumptions

- `Asset.price` is whole currency units (not cents); `BuyerProfile`'s
  budget fields are assumed EUR (that model has no `currency` field).
- A Manager "removing" a participant is a soft delete (`status =
  REMOVED`) — their past assets/messages stay intact for whoever they
  dealt with, nothing is hard-deleted. See ARCHITECTURE.md "Data model."
- A Seller stays anonymous to a browsing Buyer until the Buyer sends a
  contact message (and vice versa isn't hidden — a Seller browsing Buyers
  sees full profiles, since the assignment only asked for asset-listing
  anonymity).
- next-intl (EN/UA) was part of the original stack decision but wasn't
  implemented — every page is English-only. Everything is already
  token-driven and role-scoped in a way that shouldn't fight a locale
  pass later (see CLAUDE.md "Design tokens" and the `app/[locale]`
  migration note), but it didn't happen in the time available.

## AI tools used

Built with Claude Code throughout — architecture and schema design,
component/Server Action scaffolding, seed data, the visual design pass,
the matching algorithm, and the full test suite. See
[ARCHITECTURE.md "AI tools used"](ARCHITECTURE.md#ai-tools-used) for how
that was reviewed rather than taken as-is (several AI-driven setup steps
had to be corrected by hand — a Prisma CLI version mismatch, an npm
`latest` tag pointing at a broken package, a couple of real e2e-caught
bugs along the way).

## What I'd improve with more time

See [ARCHITECTURE.md](ARCHITECTURE.md#what-id-improve-with-more-time) for
the full list — next-intl, real auth, file attachments on assets,
real-time-ish inbox updates, an LLM-enhanced version of the match score,
broader test coverage, and an audit-log UI beyond the dashboard's last-5
feed are the standouts.
