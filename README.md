# Certiva

Certiva is a certification practice-test marketplace. **Practice. Prepare. Certify.** Learners browse exams by provider, open a certification, inspect a practice test, purchase access in INR, sit a timed exam in the browser, and review explanations.

The product is independent. It is not affiliated with any certification vendor and does not copy third-party branding, assets, or proprietary exam content.

## Stack

- Next.js (App Router) and TypeScript
- Tailwind CSS and shadcn/ui
- PostgreSQL with Prisma (optional locally; required for durable production data)
- Auth.js (NextAuth v5) with credentials, JWT sessions, and protected routes
- Razorpay for Indian payments (test keys first; the secret stays on the server)

---

## 1. Project structure

```
prisma/                     Schema, migrations, seed
docker-compose.yml          Local PostgreSQL
src/app/                    App Router pages, loading/error/404, API routes
src/app/api/payments/       Razorpay order, verify, fail, cancel, simulate, webhook
src/app/api/admin/          Admin-only question import
src/auth.ts                 Auth.js (Node: credentials + bcrypt). Never import from Edge.
src/auth.config.ts          Edge-safe session callbacks and route protection
src/proxy.ts                Auth.js gate for dashboard, checkout, admin, /api/admin
src/components/             Layout, catalog, exam, dashboard, admin, payments, shadcn
src/lib/admin/              Live catalog overlay, import validation, admin actions
src/lib/auth/               User store, password reset, session helpers
src/lib/catalog/            Seeded catalog
src/lib/commerce/           Orders, purchases, unlocks
src/lib/exam/               Timed engine, snapshots, scoring
src/lib/payments/           Razorpay client, HMAC verify (secret never returned)
src/lib/env.ts              Server-only env parse (throws if imported in the browser)
src/lib/site-url.ts         Public site URL from NEXT_PUBLIC_APP_URL only
src/lib/http.ts             JSON API success/error helpers
src/lib/seo.ts              Metadata, robots, sitemap helpers
```

Public catalog URLs are indexable. Dashboard, checkout, admin, auth, and in-progress exam routes are noindex.

## 2. Environment variables required

Copy `.env.example` to `.env.local`. Generate `AUTH_SECRET` with `openssl rand -base64 32`.

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | Yes | Canonical origin (no trailing slash). Safe to expose. |
| `AUTH_SECRET` | Yes in production | Session signing. Never send to the client. |
| `AUTH_URL` | Recommended | Same origin as the app (Auth.js). |
| `DATABASE_URL` | Production yes | PostgreSQL. Locally optional; without it, users/orders/attempts/admin overlays persist under `/tmp` (ephemeral on serverless). |
| `RAZORPAY_KEY_ID` | Production payments | Public key id. The browser receives it only after a signed-in order is created. |
| `RAZORPAY_KEY_SECRET` | Production payments | Server-only. Used to create orders and verify signatures. Never `NEXT_PUBLIC_`. |
| `RAZORPAY_WEBHOOK_SECRET` | Optional | Required only if you enable `/api/payments/razorpay/webhook`. |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Optional | Leave empty for credentials-only sign-in. |

Do not put Razorpay, Auth, or database secrets in `NEXT_PUBLIC_*` variables.

Without Razorpay keys, **non-production** uses a local simulated checkout that still creates an order, verifies a server-side signature, writes the purchase, and unlocks the test. Simulated checkout is disabled in production.

## 3. Database setup commands

PostgreSQL is optional for local UI work. For a real database:

```bash
docker compose up -d
npx prisma migrate dev
```

`npm run build` already runs `prisma generate`. Use `npm run db:push` only when you intentionally skip migrations.

## 4. Seed commands

```bash
npm run db:seed
```

If `DATABASE_URL` is unset, the seed script exits after noting that the in-repo catalog (`src/lib/catalog/seed-catalog.ts`) still powers the UI.

Demo learner: `demo@prepharbor.test` / `demo` (purchases and attempts; cannot open `/admin`).

Demo admin: `admin@prepharbor.test` / `adminadmin`. Demo editor can be assigned from **Users** (ADMIN only). Learners who hit `/admin` are sent to `/forbidden`. Staff APIs are `/api/admin/*`; payment and user APIs stay admin-only.

Content is managed from `/admin/content` (wizard, packages, questions, papers, PDFs). Do not hard-code exams or questions in React — the admin overlay under `/tmp` (or a database in production) is the source of truth. CSV/JSON import requires a preview and **Confirm Import**. Premium PDFs are never public URLs.

Password reset does not send email here. Request a link from `/forgot-password` and use the demo inbox URL on the success screen.

## 5. Development command

```bash
npm install
cp .env.example .env.local
# set AUTH_SECRET in .env.local
npm run dev
```

The app listens on [http://localhost:43145](http://localhost:43145).

## 6. Production build command

```bash
npm run lint
npm run typecheck
npm run build
npm start
```

`npm start` serves the production build on port 43145.

## 7. Deployment instructions

1. Provision PostgreSQL and set `DATABASE_URL`.
2. Run migrations against that database (`npx prisma migrate deploy`).
3. Set `AUTH_SECRET` (long random string) and `NEXT_PUBLIC_APP_URL` / `AUTH_URL` to the public HTTPS origin.
4. Set Razorpay **test** keys first (`rzp_test_…`). Keep `RAZORPAY_KEY_SECRET` as a server env var only. Switch to live keys when you are ready to charge.
5. Deploy the Next.js app (Vercel or any Node host that can run `npm run build` then `npm start`). The app is a standard App Router project; no Docker runtime is required for the web process.
6. Optionally point Razorpay webhooks at `https://<your-domain>/api/payments/razorpay/webhook` and set `RAZORPAY_WEBHOOK_SECRET`.
7. Confirm `/robots.txt` and `/sitemap.xml` after the first deploy.

Catalog, auth, and dashboard work without Postgres in development. On Vercel and similar platforms, `/tmp` storage is not durable or shared, so production traffic should use PostgreSQL.

## Routes

| Path | Purpose |
| --- | --- |
| `/` | Home and featured catalog |
| `/certifications` | Search, filters, sorting, pagination |
| `/certifications/[vendor]` | Provider catalog |
| `/certifications/[vendor]/[exam]` | Exam details and purchase CTA |
| `/practice-test/[vendor]/[exam]` | Practice-test overview |
| `/practice-test/[vendor]/[exam]/start` | Begin or continue a sitting |
| `/practice-test/[vendor]/[exam]/question/[n]` | Timed question UI |
| `/practice-test/[vendor]/[exam]/result/[attemptId]` | Score and review |
| `/sign-in` | Log in (learner demo or admin) |
| `/forbidden` | Shown when a learner opens an admin URL |
| `/admin` | Admin dashboard (admin role only) |
| `/admin/certifications` | Vendor create, edit, delete, publish |
| `/admin/exams` | Exam catalog, SEO, price, duration |
| `/admin/tests` | Practice tests |
| `/admin/questions` | Question bank |
| `/admin/questions/import` | CSV/JSON bulk import with validation |
| `/admin/orders` | All checkout orders |
| `/admin/users` | Account roles |
| `/sign-up` | Create an account |
| `/forgot-password` | Request a reset link |
| `/reset-password` | Choose a new password |
| `/dashboard` | Welcome, stats, purchases, attempts, recommendations |
| `/dashboard/tests` | Purchased tests |
| `/dashboard/attempts` | Attempt history |
| `/dashboard/orders` | Orders and receipts |
| `/dashboard/profile` | Name, email, password, settings |
| `/checkout/[slug]` | Razorpay checkout (sign-in required) |
| `/library` | Redirects to `/dashboard/tests` |
| `/account` | Redirects to `/dashboard/profile` |

## Payments API

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/payments/razorpay/order` | Create a Razorpay order (auth) |
| POST | `/api/payments/razorpay/verify` | Verify signature and unlock (auth) |
| POST | `/api/payments/razorpay/fail` | Record a failed payment (auth) |
| POST | `/api/payments/razorpay/cancel` | Record a cancelled checkout (auth) |
| POST | `/api/payments/razorpay/simulate` | Local unlock only; 403 in production |
| GET | `/api/payments/purchase-status?slug=` | Owned or not (auth) |
| POST | `/api/payments/razorpay/webhook` | Optional `payment.captured` (webhook secret) |
