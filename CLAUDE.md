@AGENTS.md

# N5Deal Marketplace — working conventions

B2B marketplace prototype (Buyer / Seller / Platform Manager) for M&A and
financial-asset listings. Full reasoning behind the stack, auth, and data
model lives in [ARCHITECTURE.md](ARCHITECTURE.md) — this file is the
day-to-day "how do I add X here" reference.

## Stack at a glance

Next.js (App Router) + TypeScript · Tailwind + shadcn/ui (Base UI primitives,
not Radix — see "Gotchas" below) · Prisma 7 + PostgreSQL (Neon in
production, Docker locally) via `@prisma/adapter-pg` · iron-session
(demo-account login, no passwords) · zod · next-intl (`en` default, `uk`
secondary, not wired up yet) · Vitest + Playwright.

## `app/` structure

Current state (auth + `/seller` + `/buyer` + `/manager` done; only
`[locale]`/next-intl is still ahead — see ARCHITECTURE.md):

```
app/
  layout.tsx                    root layout (<html>/<body>) — still locale-less for now
  page.tsx                      placeholder landing, links to /login
  login/
    page.tsx                    demo-account picker, grouped by role (Server Component)
    login-card.tsx               'use client' — one account's form + useActionState
    actions.ts                  loginAs(userId, returnTo, prevState, formData)
  (portal)/                     route group — layout.tsx calls requireUser()
    layout.tsx                  header (identity/role badge/logout) + requireUser()
    portal-header.tsx
    actions.ts                  logout()
    seller/
      dashboard/page.tsx        overview + counts, requireUser({ role: "SELLER" })
      assets/
        page.tsx                own assets (any status — the one place status doesn't gate visibility), createdAt desc
        new/
          page.tsx               requireUser() wrapper around the form
          asset-form.tsx          'use client' — useActionState + client-side zod pre-check
          actions.ts              createAsset(prevState, formData)
      buyers/
        page.tsx                catalog (native GET-form filters — see below); default-sorts by best lib/matching.ts score against the seller's own ACTIVE assets, ?sort=updatedAt for recency
        filters.ts               parseBuyerFilters / buildBuyerWhere (Prisma hasSome on GIN indexes)
        buyer-card.tsx          shows its matchScore
        contact-buyer-dialog.tsx 'use client' — Dialog + useActionState; asset picker is a <Select> of the seller's own ACTIVE assets
      inbox/
        page.tsx                getInboxData() + <ContactInbox> — both shared, see lib/
    buyer/
      dashboard/page.tsx        overview + counts, requireUser({ role: "BUYER" })
      profile/
        page.tsx                requireUser() wrapper, fetches (or not — upsert) the BuyerProfile
        buyer-profile-form.tsx  'use client' — same useActionState + client-side zod pre-check pattern as asset-form.tsx
        actions.ts              upsertBuyerProfile(prevState, formData)
      assets/
        page.tsx                catalog (ACTIVE assets from ACTIVE sellers only — see filters.ts); scores + passes matchScore per asset
        filters.ts              parseAssetFilters / buildAssetWhere
        [id]/
          page.tsx               detail; notFound() if not ACTIVE or seller not ACTIVE; increments viewCount; shows its own matchScore
          contact-seller-dialog.tsx 'use client' — no asset picker (it's this page's asset, a hidden field)
      inbox/
        page.tsx                same getInboxData()/<ContactInbox> reuse as seller/inbox
    manager/
      dashboard/page.tsx        counts (users by role/status, assets by status) + last-5 AuditLog feed
      users/
        page.tsx                all BUYER/SELLER users (never MANAGER — see this page's doc comment); GET-form filters (role, status, search)
        filters.ts              parseUserFilters / buildUserWhere
      assets/
        page.tsx                every Asset, any status (the one place a Manager sees SUSPENDED/PENDING/SOLD too); filters (status, sector, seller name)
        filters.ts              parseAssetFilters / buildAssetWhere
proxy.ts                        role-gates /seller, /buyer, /manager (see below)
components/
  ui/                           shadcn primitives — do not hand-edit re: upstream diffs
  marketplace/                  asset-card.tsx, status-badge.tsx, match-badge.tsx, form-field.tsx, contact-inbox.tsx, data-table.tsx, moderation-dialog.tsx — cross-role presentational pieces
lib/
  matching.ts                   scoreMatch(asset, buyerProfile) — pure, no I/O; matching.test.ts covers it directly (no DB/e2e needed for the arithmetic itself)
  session.ts                    SessionData type, sessionOptions, getSession() — DB-free
  roles.ts                      ROLE_PATH_PREFIX, roleHomePath(), resolveReturnTo() — DB-free
  auth.ts                       getCurrentUser() / requireUser() — DB-aware, builds on the above
  db.ts                         Prisma client singleton (adapter-pg)
  taxonomy.ts                   SECTORS / JURISDICTIONS / CURRENCIES / DEAL_TYPES — shared by the asset form, buyer-profile form, and both filters.ts pairs
  format.ts                     formatPrice(), titleCase()
  search-params.ts              toArray/toNumber/toSingle — shared by every filters.ts (seller/buyers, buyer/assets, manager/users, manager/assets)
  inbox.ts                      getInboxData(userId) — shared by seller/inbox and buyer/inbox
  actions/
    contact-request.ts          sendContactRequest + toggleContactRead — see "cross-role Server Actions" below
    moderation.ts                suspendUser / reactivateUser / removeUser / suspendAsset / restoreAsset + shared AuditLog writer
  validations/                  zod schemas + a `*FormDataToInput()` helper per domain, shared by the client form and the Server Action; form-data.ts holds the shared blankToUndefined()
  generated/prisma/             generated client — never hand-edit
  demo-data/                    seed fixtures consumed by prisma/seed.ts
prisma/
  schema.prisma
  seed.ts
  migrations/                  one migration per schema change after init (e.g. add_audit_log) — see "Prisma 7 specifics"
e2e/
  global-setup.ts               reseeds the DB before the suite runs — see "Gotchas"
scripts/
  e2e-*.ts                      test-only DB fixture helpers, run via execSync + tsx from e2e specs — see "Gotchas" (Prisma client is ESM)
```

Once next-intl is added, everything under `app/` except the true root
`layout.tsx`/`not-found.tsx` moves under `app/[locale]/`; `proxy.ts`'s path
matching (`pathname.split("/")[1]`) and `lib/roles.ts`'s prefixes will need
a locale-aware adjustment at that point — flagged here so it isn't a
surprise later.

**Cross-role Server Actions go in `lib/actions/`, not colocated.**
`sendContactRequest`/`toggleContactRead` are used by both `/seller/*` and
`/buyer/*` — ContactRequest is symmetric by direction (see its doc comment
in schema.prisma), so there's one action, not two copies, branching
internally on `requireUser().role` where the two directions actually
differ (who the counterpart/attachable-asset must be). The "colocate next
to the page that uses it" rule below is for actions used by exactly one
route tree; once a second, unrelated route needs the same action, move it
to `lib/actions/` rather than importing across route trees or duplicating.
Same idea applies to data fetching: `lib/inbox.ts`'s `getInboxData()` and
`components/marketplace/contact-inbox.tsx` are what both `/seller/inbox`
and `/buyer/inbox` are built from.

**File convention note:** this is Next.js **16**, where `middleware.ts` was
renamed to **`proxy.ts`** (same behavior, new file/export name — see
`node_modules/next/dist/docs/.../proxy.md`). Don't reintroduce a
`middleware.ts`; it won't run.

**Route groups & guards.** Everything a logged-in user sees lives under the
`(portal)` group (doesn't affect the URL — `/seller/dashboard` etc. stay as
written) so `layout.tsx` can call `requireUser()` once for the header and
to guarantee "someone is logged in, active"; role-specific pages call
`requireUser({ role: "SELLER" })` (etc.) themselves on top of that — the
group layout alone does not guarantee "the right someone." `proxy.ts` does
the cheap version of the same check (redirect on `/seller|buyer|manager`
mismatch to `/login?returnTo=...&reason=forbidden`) purely from the sealed
cookie, without a DB round trip. Both layers matter: `proxy.ts` is fast but
can't see a status change since the cookie was issued and Next.js doesn't
guarantee its matcher covers Server Actions (see next section); the
`requireUser()` calls in layouts/pages always re-read the DB and are the
real boundary, not a UX nicety.

## Server Actions vs. Route Handlers

**Default to Server Actions**, colocated as `actions.ts` next to the
page(s) that use them. Every action:

1. Re-derives the session server-side (`requireUser()`) — never trusts a
   role/userId passed in from the client.
2. Parses input with a zod schema from `lib/validations/*` (the *same*
   schema a client form uses for inline validation, imported from the same
   file — no duplicated rules).
3. Does the Prisma call.
4. Calls `revalidatePath` for the affected page(s).
5. Returns a typed result — `{ ok: true, data } | { ok: false, error }` —
   never throws past its own boundary, so forms can render inline errors via
   `useActionState`.

**Use a Route Handler (`app/api/**/route.ts`) only when there's no form to
attach a Server Action to** — i.e. a client component calling `fetch`
directly. In this project that's just:

- Live filter/search panels that re-fetch JSON as the user types/toggles a
  filter *without* a full navigation. Prefer updating the URL's
  `searchParams` and letting the Server Component re-render instead (keeps
  filters shareable/bookmarkable/back-button-friendly) — reach for a Route
  Handler only where that round-trip is visibly too slow.
- The optional AI suggestion endpoint, since it's invoked ad hoc from a
  client component and may want to stream.

## Naming

- Files: kebab-case (`asset-card.tsx`), matching the existing shadcn output
  under `components/ui/`.
- Components: PascalCase export matching the file, e.g. `asset-card.tsx` →
  `export function AssetCard`.
- Server Actions: camelCase verb phrases — `createAsset`, `sendContactRequest`,
  `suspendUser` — never generic `create`/`update`.
- Zod schemas: `createAssetSchema`, inferred type `CreateAssetInput = z.infer<typeof createAssetSchema>`.
- Prisma: PascalCase singular models, camelCase fields (as given in the
  schema); snake_case tables/enums in Postgres via `@@map` — see
  ARCHITECTURE.md.
- Route segments: kebab-case; plural nouns for collections (`assets`,
  `buyers`, `contacts`), singular for a user's own resource (`profile`).
- Tests: `*.test.ts(x)` colocated for Vitest; `e2e/*.spec.ts` for Playwright
  (already wired up — see `vitest.config.ts` / `playwright.config.ts`).

## Design tokens

Dark institutional fintech theme, applied unconditionally (`className="dark"`
on `<html>` in `app/layout.tsx` — not a toggle, not `prefers-color-scheme`;
see [ARCHITECTURE.md](ARCHITECTURE.md)). Everything lives in
`app/globals.css` as CSS variables, wired into Tailwind v4's `@theme
inline` block — **never hardcode a color in JSX/className** (no
`bg-[#...]`, no raw `bg-gray-900`/`bg-red-500`/etc. Tailwind palette
classes). A `grep` for that pattern across `app/` and `components/` should
always come back empty; if a new component needs a color that doesn't
exist yet, add a token to `globals.css`, not a one-off in the component.

- **`--background` / `--card` / `--popover` / etc.** — the standard shadcn
  token set, overridden in `.dark` with a graphite-navy palette (hue ~255,
  never chroma 0 — "not pure black") where `--card` sits visibly lighter
  than `--background` (an "elevated surface," not just a border).
- **`--primary`** is the *one* brand accent (violet, hue ~292) — every
  primary action (Publish, Contact, Save, "Apply filters") gets it for
  free via `Button`'s default variant or `buttonVariants()`, with zero
  per-page styling.
- **`--status-active` / `-pending` / `-suspended` / `-removed`** are a
  *separate* token family from `--primary`, on purpose — chosen at hues
  (green/blue/amber/gray) far from 292 specifically so a status pill is
  never confusable with "this is the important button." Consumed through
  `Badge`'s `status-*` variants (`components/ui/badge.tsx`) — always go
  through `<StatusBadge status={...} />` (`components/marketplace/`) for
  an ACTIVE/PENDING/SUSPENDED/REMOVED/SOLD value, never a bare `<Badge
  variant="destructive">` (that variant is for actually-destructive UI —
  the Suspend/Remove *buttons* in `/manager/*` correctly use it; the
  status *pill* next to them correctly doesn't, and reads amber/gray, not
  red — those are different concerns that happen to both be about
  "something bad-ish," see the screenshot review in git history for why
  this distinction matters visually, not just semantically).
- **`--match`** is a *third* separate family, for a `lib/matching.ts`
  score (`Badge`'s `match` variant, consumed via `<MatchBadge score={...}
  />`) — teal, clear of both `--primary` and every `--status-*` hue, since
  a match score is neither "the important button" nor a participant's
  status.
- **Shared cross-role visual components** live in `components/marketplace/`:
  `asset-card.tsx` (one `AssetCard` for `/seller/assets` and
  `/buyer/assets` — no seller-identity field, since `/buyer` never shows
  one anyway, and an optional `matchScore` prop that only `/buyer/*`
  passes), `match-badge.tsx`, `data-table.tsx`, `status-badge.tsx`,
  `form-field.tsx`, `contact-inbox.tsx`, `moderation-dialog.tsx`. Before
  writing a new
  card/table/pill, check here first — the recurring failure mode this
  section exists to prevent is three pages growing three slightly
  different hand-rolled versions of the same UI element (which is exactly
  what `/seller/assets`, `/buyer/assets`, and `/manager/assets` had before
  this consolidation).
- **Jurisdiction flags** are computed, not an asset: `flagEmoji()` in
  `lib/format.ts` converts a 2-letter ISO code to its flag emoji via
  Unicode code-point arithmetic — no SVG sprite/flag library. Renders as a
  real flag on macOS/iOS/most Linux; Windows Chrome falls back to showing
  the two letters as separate tiles (no color flag glyphs in its default
  emoji font) — a platform font limitation, not a bug in this code.

## Prisma 7 specifics (already applied — see `prisma7.config.ts`)

- `url` lives in `prisma7.config.ts`'s `datasource` block, **not** in
  `schema.prisma`'s (v7 change). The installed `@prisma/config` only
  supports `url`/`shadowDatabaseUrl` there — no `directUrl` field, despite
  what some docs/skill snippets show for other 7.x builds; verified against
  `node_modules/@prisma/config/dist/index.d.ts` before relying on it.
- The generated client requires a driver adapter — `@prisma/adapter-pg` in
  `lib/db.ts` — Prisma 7 has no built-in query engine binary path for SQL
  providers anymore. Plain `pg`/TCP works unchanged against local Docker
  Postgres and Neon, so one adapter covers both without env branching.
- Because config has no `directUrl`, the pooled/direct split is done by
  hand across two independent env vars: `prisma7.config.ts`'s
  `datasource.url` reads `DIRECT_URL` (the CLI — migrate/db push/studio —
  always needs a direct, non-pooled connection); `lib/db.ts`'s adapter
  reads `DATABASE_URL` separately (the app's runtime connection — Neon's
  **pooled** URL in production). Locally there's no pooler, so both env
  vars point at the same Docker container.
- Local skill references for exact CLI/API syntax live under
  `.claude/skills/prisma-*` (installed by `prisma init`) — check
  `prisma-client-api` before writing non-trivial queries and
  `prisma-upgrade-v7` if something behaves like a v6 assumption leaked in.
- **Schema changes after `init` get their own `prisma migrate dev --name
  ...`**, never a hand-edit of `init`'s migration.sql — `AuditLog` (added
  when `/manager` was built) is the current example. Adding a table with a
  FK to `User` means `prisma/seed.ts`'s wipe order needs the new table
  too, *before* `user.deleteMany()` — forgetting this surfaces as a
  `P2003` foreign key violation the next time the seed script runs, not
  at migration time, which makes it easy to miss until exactly that
  moment (see git history: this happened, once).

## Gotchas (learned building `/seller`, `/buyer`, `/manager`)

- **Base UI, not Radix.** `components.json`'s `"style": "base-nova"` means
  every shadcn primitive here wraps `@base-ui/react/*`, not Radix. Two
  differences that bite:
  - No `asChild` prop. Base UI's equivalent is `render={<Element />}` — but
    **`Button` explicitly disallows rendering an `<a>` through it** ("Links
    have their own semantics and should not be rendered as buttons" — see
    `node_modules/@base-ui/react/docs/react/components/button.md`). For a
    link styled as a button, apply `buttonVariants({...})` as the `<Link>`'s
    className directly (see `app/page.tsx`, `seller/assets/page.tsx`) —
    don't reach for `render`.
  - `Select` (and other form controls) support native `<form>` submission
    directly: give it a `name` + `defaultValue` (uncontrolled) and
    `formData.get(name)` just works on submit — no `value`/`onChange`
    plumbing needed unless the page has another reason to control it.
- **Client-validated forms need `noValidate` on the `<form>`.** Keep the
  HTML `required`/`min`/`max` attributes for semantics/autofill, but without
  `noValidate` the browser's own constraint-validation UI intercepts an
  empty/invalid submit *before* `onSubmit` ever runs — your zod-driven
  inline errors never get a chance to render. See `asset-form.tsx`.
- **zod v4, not v3.** `.min(n, "msg")` shorthand still works, but a
  *missing* field (`undefined`) hits the base type check before any `.min`
  refinement runs — so a required string field needs its own message too:
  `z.string("X is required").min(n, "...")`, not just the latter. Field
  errors come from `z.flattenError(result.error).fieldErrors`, not
  `.flatten()`/`.errors` (those are the v3 API).
- **`useActionState` result changing on success → don't `useEffect` +
  `setState`.** The `react-hooks` ESLint rule flags that as an avoidable
  extra render pass. Compare against a `useState`-held previous value
  *during render* instead (see `contact-buyer-dialog.tsx`) — React's
  documented "adjusting state when a prop changes" pattern.
- **Playwright + a real dev-mode Postgres, not a fresh DB per test.**
  `e2e/global-setup.ts` reseeds once before the whole suite runs so repeat
  runs are deterministic — tests that create data (publishing an asset,
  sending a contact request) would otherwise accumulate duplicates across
  runs and produce strict-mode-violation-style flakiness, not a real bug.
- **`Badge`'s accessible text includes any icon/button children.** A tag
  chip rendered as `<Badge>{label}<button>×</button></Badge>` has full text
  `"{label}×"`, not `label` — don't assert `getByText(label, { exact: true
  })` against it.
- **The generated Prisma client is ESM (`import.meta`) — Playwright test
  files can't import it directly.** Playwright compiles specs to CJS by
  default, which fails on `lib/db.ts` (and anything importing it) with
  `Cannot use 'import.meta' outside a module`. For test setup that needs
  direct DB access (see `e2e/buyer.spec.ts`'s "delete a seeded profile to
  test the create path"), write a small script under `scripts/` and shell
  out to it with `execSync("npx tsx scripts/whatever.ts ...")` instead of
  importing `@/lib/db` in the spec file — same reasoning as
  `e2e/global-setup.ts` reseeding via `npx prisma db seed` rather than a
  direct call. Any such script also needs its own `import "dotenv/config"`
  at the top, same as `prisma/seed.ts` — a bare `tsx` run doesn't get
  `.env` loaded automatically the way Next.js and the Prisma CLI do.
- **A successful `useActionState` submit that calls `revalidatePath` can
  warn about an uncontrolled input's `defaultValue` "changing."** Next
  re-renders the Server Component tree as part of the action's response
  (see Next's Server Actions doc, "A single response carries data and
  UI"), so a still-mounted client form receives fresh `initial` props —
  and an uncontrolled `<Input defaultValue={initial.x}>` only reads that
  at mount, so Base UI warns. Harmless here (see `buyer-profile-form.tsx`:
  the field already shows what was just typed), but a real fix would mean
  either controlling the input or remounting the form on save (which would
  also reset the "Saved." confirmation) — left as a known, non-blocking
  warning rather than adding that complexity for a cosmetic console line.
- **Every page that calls `requireUser()` is already fully dynamic — no
  route caching, and so no `revalidatePath` needed for *other* pages to
  see a moderation action's effect.** `requireUser()` reads the session
  cookie, and per Next's `cookies()` docs, "using it in a layout or page
  opts a route into dynamic rendering" — meaning `/seller/buyers` and
  `/buyer/assets` re-query the DB fresh on every single request regardless
  of caching. A Manager suspending someone in `lib/actions/moderation.ts`
  only calls `revalidatePath("/manager/users")` (so *that* page's own
  table updates immediately, the standard useActionState pattern) — not
  `/seller/buyers`, `/buyer/assets`, etc., because there's nothing to
  invalidate there. Confirmed with an actual e2e check
  (`e2e/manager.spec.ts`), not just this reasoning: suspend a Buyer as
  Manager, switch identity, and the Seller's buyer directory has already
  dropped them on the very next load.
- **e2e specs run fully parallel across files with one shared seed, not a
  fresh DB per test.** A test that edits a fixture (e.g. checking a new
  sector on a BuyerProfile) and doesn't undo it can silently break an
  *unrelated* test in a different file that assumed that fixture's
  original seeded values — this actually happened between
  `buyer.spec.ts`'s profile-edit test and `seller.spec.ts`'s
  Crypto-sector-filter test once both ran in the same full-suite pass.
  Two rules that came out of chasing it down: (1) if a test mutates a
  shared fixture as part of demonstrating something, revert the mutation
  before the test ends, unless nothing else in the suite depends on that
  fixture's original state; (2) two tests that both need "a profile that
  doesn't exist yet" (or similar) should use *different* seeded accounts,
  not the same one — deleting/recreating the same row from two files
  running concurrently races. Separately: after clicking a login button,
  `await expect(page).toHaveURL(...)` before doing anything else — the
  Server Action's `redirect()` resolves after the click, not during it,
  so a `page.goto()` fired immediately after can still be unauthenticated.
- **`vercel --prod` (CLI deploy from a local directory, not a Git-connected
  one) doesn't reliably mirror `.gitignore` for dotfiles.** The first
  production deploy bundled `.env` into the build despite it being
  gitignored — confirmed harmless *that* time (Vercel's own `vercel env
  add` values win at runtime; dotenv-style loading never overwrites an
  already-set `process.env` var, verified by hitting the live `/login`
  and seeing real Neon-seeded names render, not a crash from trying to
  reach `localhost`), but shipping real values into build output at all
  isn't something to rely on precedence rules to paper over. Fixed with a
  `.vercelignore` (`.env`, `.env.*`, `!.env.example`) — the next deploy's
  upload dropped from 1.4MB to 510 bytes and the warning disappeared.
  `npm view vercel dist-tags` is also worth checking if `npm i -g vercel`
  fails on `latest` — hit the exact same "latest tag points at a broken
  release" issue here as with Prisma earlier in this project (`59.11.0`
  was missing a transitive dependency; `59.10.0` installed clean).
