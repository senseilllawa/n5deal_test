# Architecture

Prototype for the N5Deal technical assignment: a B2B marketplace connecting
Buyers, Sellers, and a Platform Manager around M&A / financial-asset listings.
Scope target: ~24h. This document explains *why*, not just *what* — see
[CLAUDE.md](CLAUDE.md) for the concrete folder layout and coding conventions.

## Stack

| Concern | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) + TypeScript | Server Components remove the need for a separate API layer for most reads; Server Actions cover mutations without hand-rolling REST endpoints. One deployable, fast to build. |
| UI | Tailwind + shadcn/ui | Copy-in components (not a npm dependency) — fast to restyle towards N5Deal's look without fighting a component library's theming API. |
| Persistence | PostgreSQL (Neon) via Prisma 7 | Relational fits the domain well (users/profiles/assets/contacts with real foreign keys and filters). Neon's serverless Postgres has a generous free tier and pairs naturally with Vercel. Satisfies "state persists after refresh" for real, not just `localStorage`. |
| Auth | iron-session, demo-account login | See below. |
| Validation | zod | One schema per mutation, shared between the Server Action and (where relevant) the client form — no drift between client and server rules. |
| i18n | next-intl (EN / UA) | "Plus" requirement; Baltic/CEE jurisdictions in the demo data make UA a realistic second market, not a token locale. |
| Testing | Vitest (unit) + Playwright (e2e) | Already scaffolded; unit tests for pure logic (validation, filtering helpers), one e2e smoke test per critical flow (publish asset, contact, moderate). |

## Auth: demo accounts, no passwords

The assignment explicitly allows a lightweight approach, and building real
auth (email verification, password reset, hashing policy) would burn a large
share of a 24h budget on something the brief doesn't ask for. Instead:

- `/login` lists the seeded demo users grouped by role ("Log in as
  *Aiva Ozola* — Buyer", "Log in as *Nordic Fintech Assets* — Seller", …).
- Picking one runs a Server Action that re-checks `user.status === ACTIVE`
  (a **SUSPENDED**/**REMOVED** demo account genuinely cannot log in — this
  makes Manager moderation observable end-to-end instead of being a no-op
  status flag) and, if it passes, seals `{ userId, role }` into an
  iron-session cookie. No email, no password, no magic link.
- The cookie is the only source of truth for identity; every Server Action
  and protected Server Component re-derives the user from it server-side
  (`getSession()` in `lib/session.ts`, wrapped by `requireUser()` in
  `lib/auth.ts`) rather than trusting anything the client sends. `proxy.ts`
  (Next.js 16 renamed `middleware.ts` to `proxy.ts` — same mechanism) does
  the coarse check on `/seller`, `/buyer`, `/manager`: no session, or a
  session whose role doesn't match the area, both redirect to `/login`
  (with `?returnTo=` so a successful login lands back where they were
  headed, and `?reason=forbidden` for the role-mismatch case specifically,
  which the login page surfaces as a banner) — cheap because the role
  already lives in the encrypted cookie payload, so proxy needs no DB
  round-trip. `requireUser()` re-checks against the DB on every protected
  page regardless, since proxy can't see a suspension that happened after
  the cookie was issued, and Next.js doesn't guarantee proxy's matcher
  covers Server Actions.
- This means the *product* still has three real, access-controlled roles;
  what's cut is only the credential-verification step, which is orthogonal
  to what the assignment is evaluating.

## Data model

Given schema (see [prisma/schema.prisma](prisma/schema.prisma)) with these
choices layered on top:

- **One `User` table for all three roles**, not per-role tables. Seller has
  no fields beyond the base user, so a separate `Seller` model would just be
  `User` again; `BuyerProfile` is 1:1 off `User` precisely because Buyer
  *does* need extra fields. Role-appropriate access (e.g. only a BUYER can
  have a `BuyerProfile`) is enforced in Server Actions, not via a DB
  constraint — Postgres has no clean "conditional FK" and it isn't worth a
  trigger for a prototype.
- **`ContactRequest` is direction-agnostic.** A Buyer messaging a Seller
  about a listing and a Seller cold-messaging a Buyer are the same shape
  (`from`, `to`, optional `asset`, `message`), so one model instead of two
  keeps the inbox/sent-items screens (and their queries) symmetric.
- **Moderation is soft-delete only.** "Remove" a User/Asset means
  `status = REMOVED` / `SUSPENDED`, never a DB delete — otherwise a removed
  Seller's past `ContactRequest`s would either cascade-delete (losing a
  Buyer's message history through no fault of their own) or dangle. Removed/
  suspended users are simply filtered out of public listings and blocked at
  login; their historical contacts and assets stay intact for whoever they
  talked to.
- **`AuditLog` (added when `/manager` was built, not in the original
  sketch) records every moderation action** — actor, action, what was
  targeted, an optional reason, when. `targetType`/`targetId` is a plain
  string pair with no foreign key: a real FK can't point at "User or Asset
  depending on a discriminator column" without either two nullable FK
  columns or a check constraint Prisma doesn't model, and — since
  moderation here only ever soft-deletes — the target row is never
  actually gone anyway. Shipped as its own migration on top of the
  original schema, not folded into `init`, so the history shows it was an
  addition, not part of the original design.
- **Indexes**: btree on every column a browse/filter screen predicates on
  (`Asset.status/sector/jurisdiction/sellerId/createdAt`,
  `User.role/status`, `ContactRequest.fromUserId/toUserId/assetId`,
  `AuditLog.actorId/targetType+targetId/createdAt`) plus GIN indexes on
  `BuyerProfile.sectors`/`jurisdictions` since those are filtered via
  array-containment (`hasSome`), which btree can't serve.
- **Table/enum names are snake_case via `@@map`** (`users`, `buyer_profiles`,
  `contact_requests`, …) while Prisma-side models stay PascalCase — keeps
  raw SQL and the Neon console readable without affecting application code.
- Small additions beyond the brief's sketch: `User.statusReason` (so a
  Manager's suspend/remove action carries a reason, shown back to the
  affected... well, they're logged out, but it's shown to the Manager and
  usable in a future "contact support" flow), `ContactRequest.isRead` (free
  unread-badge UX in the inbox), `Asset.currency` (defaults to `EUR`; the
  jurisdiction examples are EU/Baltic, and a bare `Int` price reads oddly
  without a currency next to it, even non-editable in v1).

## Persistence & "survives refresh"

Everything that constitutes application state — users, profiles, listings,
contact requests, moderation status — lives in Postgres via Prisma, so a
refresh (or a different browser) shows the same data. The only thing kept
client-side is the session cookie itself (identity, not data) and pure UI
state (e.g. a filter panel's open/closed state), which is exactly the kind
of state that *should* reset on a fresh load.

## Persistence & driver adapter

Prisma 7 has no built-in query engine for SQL providers — a driver adapter
is required. Local dev runs Postgres 16 in Docker; production targets Neon.
Rather than `@prisma/adapter-neon` (Neon's HTTP/WebSocket driver, whose main
benefit is Edge-runtime compatibility), the app uses `@prisma/adapter-pg`
(plain `pg`, standard TCP) everywhere — it works unchanged against both
Docker Postgres and Neon, so there's one code path instead of branching by
environment. This only costs something if the app later moves to Vercel's
Edge runtime; on Node.js serverless functions (the default, and what this
app uses) it's a straight simplification.

The CLI (`prisma migrate`/`db push`/`studio`) and the app's own runtime
client are deliberately wired to *different* env vars: `prisma7.config.ts`'s
`datasource.url` reads `DIRECT_URL` (migrations need a direct, non-pooled
connection — the installed `@prisma/config` has no separate `directUrl`
field to express this declaratively, so it's done by pointing its one `url`
at the direct connection), while `lib/db.ts`'s adapter reads `DATABASE_URL`
independently (Neon's **pooled** connection string in production, for the
app's normal query traffic). Locally there's no pooler, so both env vars
point at the same Docker container.

## Visual design

Styled after n5deal.com/all-listing's dark institutional fintech look:
graphite-navy surfaces (not pure black), one accent color for primary
actions, and status pills (ACTIVE/PENDING/SUSPENDED/REMOVED) that
deliberately use a *different* color family from that accent so a "this
matters" button is never visually confused with "this is what's currently
true about this row." Everything is a CSS variable in `app/globals.css`
(Tailwind v4's `@theme inline`, extending the shadcn "base-nova" preset
this project started from) — no hardcoded colors in component code, so
retheming later (a real brand pass, a light-mode toggle) is a `globals.css`
change, not a find-and-replace across every page. See CLAUDE.md "Design
tokens" for the concrete token names and the shared components
(`AssetCard`, `DataTable`, `StatusBadge`, …) that consume them, which
replaced three pages' worth of near-duplicate hand-rolled markup.

## Deployment

Vercel (Next.js) + Neon (Postgres) — both have zero-config free tiers, and
Vercel's Neon integration provisions the pooled/direct connection strings
for you (map them to `DATABASE_URL`/`DIRECT_URL` respectively, per above).

## i18n

`next-intl` with locale-prefixed routing (`/en/...`, `/uk/...`; default
locale `en` unprefixed). Scope for the prototype: UI chrome, nav, form
labels, and validation messages are translated; user-generated content
(asset descriptions, profile bios) is stored as-entered and not
auto-translated — a real MT integration is a "with more time" item.

## Buyer<->Asset matching

`lib/matching.ts`'s `scoreMatch()` is a pure, deterministic 0-100 score —
sector overlap (highest weight), jurisdiction overlap, and how well an
asset's price fits a Buyer's stated budget (smooth falloff near the edges,
not a hard cutoff). No external/AI calls; this is the rule-based baseline,
not a placeholder for one. It's what powers the "Match X%" badge on
`/buyer/assets` (against the signed-in Buyer's own profile) and the
default sort on `/seller/buyers` (against the best of the Seller's own
ACTIVE listings). A component only counts if the Buyer actually specified
something for it — an unset budget doesn't cap every match at 80. An
LLM-based version (weighting profile *text*, not just structured fields;
explaining *why* a match scored the way it did) is a natural next step,
deliberately not built yet.

## What I'd improve with more time

- Real authentication (or at least email-link login) if this were to leave
  "demo" status.
- File attachments on assets (teaser deck, financials) — currently out of
  scope, no object storage wired up.
- Real-time-ish updates for contact requests (polling or a websocket) instead
  of requiring a refresh to see a new message.
- Saved searches / alerts for Buyers ("notify me when a Fintech asset in EE
  appears").
- An audit log for Manager actions (who suspended what, when, why) beyond
  the single `statusReason` field.
- Broader automated test coverage (currently one smoke path per role rather
  than full coverage of edge cases).
- Machine translation (or a translation workflow) for user-generated content.

## AI tools used

Built with Claude Code end-to-end: architecture/schema design (this
document and the Prisma schema were drafted collaboratively and reviewed
before implementation), component and Server Action scaffolding, seed data
generation, and test-writing. Every AI-generated change was reviewed and, in
several cases, corrected by hand before being accepted (see git history) —
notably the Prisma tooling had to be pinned/patched by hand after AI-driven
setup hit a version mismatch upstream (see commit history / README).
