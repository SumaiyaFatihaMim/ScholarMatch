# ScholarMatch — interactive Next.js MVP starter

A runnable, responsive prototype based on the accompanying ScholarMatch project plan (`docs/ORIGINAL_PROJECT_PLAN.md`). This is **not** the complete 60-day production application or even the complete seven-day demo spec. It deliberately uses fictional data unless you perform a live OpenAlex search. It does **not** send emails, store uploaded CVs, or claim admission predictions.

## Get it running

Requires Node.js 20.9+ (Node 22 recommended), npm, and internet access for the initial package install.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Before starting the app, create a PostgreSQL database named `scholarmatch`, apply `database/schema.sql`, and set `DATABASE_URL` in `.env.local`. For example, with PostgreSQL tools installed:

```powershell
createdb -U postgres scholarmatch
psql -U postgres -d scholarmatch -f database/schema.sql
```

Replace the example password in `.env.local` with your PostgreSQL password; URL-encode special characters. On Windows, if `createdb` and `psql` are not on `PATH`, run them from your PostgreSQL installation's `bin` folder (for example, `C:\Program Files\PostgreSQL\17\bin`).

Open **http://localhost:3000**, create an account at `/sign-up`, then sign in at `/sign-in`.

On Windows PowerShell, use `Copy-Item .env.example .env.local` instead of `cp`.

To create the requested local student and admin accounts after PostgreSQL is configured, run `npm run create-demo-accounts`. It creates `student@scholarmatch.local` and `admin@scholarmatch.local` with randomly generated passwords and prints them once. Save the passwords from the terminal output. This command is for development only; never run it against a production database. It stops without modifying existing accounts if either demo address is already in use.

### Admin panel setup

The admin panel is available at `/admin`. On a new database, apply the current `database/schema.sql`. To upgrade an existing PostgreSQL database, run `database/admin-panel-migration.sql` once. The demo-account command creates the admin account with administrator access already enabled.

Sign in with the generated admin account and open **Admin center** in the sidebar. Admins can manage accounts and roles; review saved CV/profile details; inspect users' tracker and outreach workspace data; manage curated professors and shared opportunities; review website routes; and download separate personal and academic CSV files. The last administrator cannot be removed or demoted. Original uploaded CV files are not retained, so the CV view contains saved profile fields rather than source documents.

Profile, tracker, and outreach data are stored in PostgreSQL. On each account's first sign-in after the upgrade, that browser's saved local workspace is copied to the account if no server workspace exists yet. The local browser copy is retained as a backup. Admins can view account workspace data, so only collect information users have agreed to share. Data from a different browser/device that never had a local copy cannot be recovered automatically.

The app stores user accounts, server-side sessions, and per-account profile/tracker/outreach workspaces in PostgreSQL. Passwords are scrypt-hashed and session cookies are HTTP-only. A browser `localStorage` backup remains available.

```bash
npm run typecheck
npm run build
```

## Working now

| Area | What you can do |
| --- | --- |
| Overview | See profile completeness, recomputed sample matches, next steps, suggested researcher cards, tracker and draft counts |
| Authentication | Register, sign in, sign out, and protect dashboard routes using PostgreSQL-backed accounts |
| Profile | Edit degree, GPA/scale, IELTS, research interests, skills, projects, targets; basic text parsing; upload and optionally AI-parse PDF/DOCX/TXT/MD |
| Opportunities | Search/filter ten explicitly fictional sample listings, inspect rule-based eligibility and four weighted score components, track items |
| Professors | Search **real publication authors** through the live OpenAlex `/works` endpoint, or add a professor privately to your account; review source-linked cards, create drafts or save to tracker |
| Outreach | Create a per-researcher first-contact email, review/approve/copy draft, remove researchers; **no actual sending** |
| Tracker | Move saved targets through five stages via selector, remove items |
| Responsive UI | Desktop sidebar, mobile bottom navigation, tablet-friendly layouts |
| Account workspace | PostgreSQL-backed profile, application tracker, and outreach drafts with a browser backup, JSON export, and reset |
| Admin center | Manage users and roles, inspect saved CV-derived profiles and workspace activity, manage professors and shared opportunities, review routes, and export separate personal/academic CSV files |

### Matching transparency

The current prototype follows your planned **35/30/15/20** weights (academic/research/skills/experience), with known sample hard-eligibility failures producing a score of 0. Missing/unknown requirements are shown as Unknown. Topic matching is a **keyword heuristic** and is **not** vector-embedding research fit, an admission likelihood, or evidence that a professor is accepting students. The default `Reach`, `Explore`, and `Match` labels are usability buckets, **not** statistically calibrated application chances.

The gap section recomputes changes against only the ten sample listings; it does **not** generalize those impacts to actual universities. Sample listings do not assert real funding or deadlines.

## Optional API integrations

### OpenAlex

The professor page can query `GET /api/openalex?q=multilingual%20NLP`, which performs a cached server-side lookup of publication metadata. It derives candidate authors from retrieved works. OpenAlex confirms authorship metadata but **does not** verify supervision availability, admissions rules, professor contact emails, or scholarships. Add `OPENALEX_API_KEY` to `.env.local` if needed for your request allowance.

### AI CV extraction

Add your own server-side key to `.env.local`:

```ini
ANTHROPIC_API_KEY=your-key-here
ANTHROPIC_MODEL=your-available-claude-model-id
```

The `POST /api/ai/extract` route sends a user-selected file to the configured Claude API only when **Extract with Claude** is clicked. It supports PDF natively and DOCX through text extraction with `mammoth`. TXT/MD inputs are read as text. Keys stay on the server. A file size limit of 5 MB applies. Structured values are validated at a basic type level; the user must review and correct extraction. The file is **not persisted** by this starter, although the external AI provider processes the file according to its terms.

The model ID must be one available to your account. If no API key is configured, use the manual editor or the basic text extractor. The prototype does not yet have a multi-vendor AI adapter, retry policies, or an evaluation set.

## Important: demonstration vs production

**Not included yet:** Verified and timely scholarships, full official admissions requirement parsing, citations for parsed admissions rules, true vector similarity, university comparison, SOP editing, Gmail/Outlook OAuth, contact discovery, real campaign sending/reply synchronization, scheduled alerts, push/PWA offline caching, and advanced application permission controls.

**Do not use this version to make actual application or eligibility decisions.** Verify all requirements and deadlines from official institutions, and never send an AI draft without reviewing it. OpenAlex searches may be rate-limited or temporarily unavailable.

**Privacy note:** Credentials, sessions, profiles, projects, tracker items, and outreach drafts are stored in PostgreSQL. Admins can view account workspaces and delete accounts. Do not upload private materials on a shared computer. Before launching for real users, add consent and retention policies, rate limiting, and a privacy notice.

## Project structure

```text
app/
  page.tsx                         Redirects to /dashboard
  sign-in/page.tsx                 Account sign-in
  sign-up/page.tsx                 Account registration
  api/auth/                        PostgreSQL-backed registration, sign-in and sign-out
  api/admin/                       Admin-only user and catalog management
  api/workspace/                   Per-account workspace synchronization
  (admin)/admin/                   Role-protected admin routes
  dashboard/
    layout.tsx                     Authenticated dashboard shell and state provider
    page.tsx                       Overview
    profile/page.tsx               Student profile
    opportunities/page.tsx         Browse opportunities
    opportunities/[id]/page.tsx    Opportunity detail URL
    professors/page.tsx            Search researchers
    professors/[id]/page.tsx       Researcher detail URL
    outreach/page.tsx              Outreach drafts
    applications/page.tsx          Application tracker
    settings/page.tsx              Settings
  api/openalex/route.ts            Live research metadata lookup
  api/ai/extract/route.ts          Optional Claude CV parser
components/scholarmatch/
  dashboard-shell.tsx              Persistent sidebar, top bar, mobile nav
  provider.tsx                     Shared state, storage, actions
  routes.ts                        Canonical path mapping
  ui.tsx                           Shared score, form and nav elements
  screens/                         Separate UI component for each page
components/admin/
  admin-panel.tsx                  Account, project, role, and catalog controls
lib/
  auth.ts                          Password hashing and PostgreSQL sessions
  catalog.ts                       Shared database-backed opportunity and researcher catalog
  db.ts                            PostgreSQL connection pool
  data.ts                          Fictional example data and types
  matching.ts                      Sample matching logic
database/
  schema.sql                       PostgreSQL accounts, sessions, workspaces, and platform catalog
  admin-panel-migration.sql        Upgrade an existing PostgreSQL database for admin features
```

## Suggested next implementation milestones

1. Add consent, retention, and audit policies for PostgreSQL-backed profile, tracker, and outreach data.
2. Build an authenticated data ingestion pipeline using legal/authorized data sources. Store source URLs, dates, evidence and verification status.
3. Implement structured and auditable admissions requirement checks; only classify verified hard criteria as met/not met.
4. Create a provider-independent AI layer with typed schemas and an evaluation set; introduce embeddings/pgvector after accuracy testing.
5. Add Gmail OAuth, scope review, verified email addresses, user-specific draft approval, send caps, thread sync, unsubscribe/do-not-contact handling, and errors. Nothing should send without explicit per-draft approval.
6. Add production logging, tests, backoff/queues, data lifecycle policies, accessibility checks, and pilot feedback.

These steps track the phases in your original plan; the original full timeline is about 60 working days for one developer under its stated assumptions.

## Verification status

`npm run typecheck` and `npm run build` pass. Local PostgreSQL is installed and running; set valid PostgreSQL credentials in `.env.local` and apply `database/schema.sql` before running the app.


## Next.js App Router (multi-page update, 2026-11-13)

All main navigation entries now use **real URLs** through `next/link`; route changes no longer depend on changing the `view` state inside one page. `/` redirects to `/dashboard`.

| Page | URL |
| --- | --- |
| Dashboard | `/dashboard` |
| Student profile | `/profile` |
| Opportunity listing | `/opportunities` |
| Individual opportunity | `/opportunities/o1` (example) |
| Professors | `/professors` |
| Individual professor | `/professors/p1` (example) |
| Outreach drafts | `/outreach` |
| Application tracker | `/applications` |
| Settings | `/settings` |

- Legacy `/dashboard/...` URLs redirect to their root-level routes. Authentication and the shared sidebar, header, and mobile navigation are in `app/(protected)/layout.tsx` and `components/scholarmatch/dashboard-shell.tsx`.
- Each page is a separate App Router `page.tsx` that renders its screen component from `components/scholarmatch/screens/`.
- `components/scholarmatch/provider.tsx` shares profile/tracker state across routes and saves to the browser's local storage. OpenAlex results are cached in session storage.
- Demo limitations are unchanged: scholarship listings are fictional samples, AI extraction requires a separately configured Claude API key, and Gmail sending is not implemented.
- Change the nav URL mapping in `components/scholarmatch/routes.ts` and the nav items in `components/scholarmatch/ui.tsx`.

**Note:** This update changes client-side navigation and adds detail pages; it does not add production backend features or Gemini API support.
hm