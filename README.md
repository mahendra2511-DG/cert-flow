# PrepHarbor

PrepHarbor is an original certification practice-test marketplace. Learners browse exams by provider, open a certification, inspect a practice test, purchase access in INR, sit the exam in the browser, and review explanations.

The product is independent. It is not affiliated with any certification vendor and does not copy third-party branding, assets, or proprietary exam content.

## Stack

- Next.js (App Router) and TypeScript
- Tailwind CSS and shadcn/ui
- PostgreSQL with Prisma (optional)
- Auth.js (NextAuth v5) with credentials, JWT sessions, and protected routes
- Razorpay for Indian payments (test keys first; secret stays on the server)

## Run locally

```bash
npm install
cp .env.example .env.local
```

Generate an `AUTH_SECRET`:

```bash
openssl rand -base64 32
```

Start PostgreSQL (optional — catalog, auth, and the dashboard work without it):

```bash
docker compose up -d
npx prisma migrate dev --name init
npm run db:seed
```

Then:

```bash
npm run dev
```

The app listens on [http://localhost:43145](http://localhost:43145).

Demo sign-in: `demo@prepharbor.test` / `demo`. That account includes sample purchases, orders, and attempts. It cannot open `/admin`.

Admin sign-in: `admin@prepharbor.test` / `adminadmin`. Staff routes and `/api/admin/*` require this role. Learners who visit `/admin` are sent to `/forbidden`.

Password reset does not send email in this environment. Request a link from `/forgot-password` and use the demo inbox URL on the success screen.

## Environment variables

See `.env.example`. Catalog, sign-up, login, and dashboard data persist to `/tmp` when `DATABASE_URL` is unset.

Put **Razorpay test** `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` in `.env.local` (never in source). The browser only receives the public key id after you sign in and create an order. Without keys, non-production uses a local test checkout that still creates an order, verifies a server-side signature, writes the purchase, and unlocks the test.

With PostgreSQL running, payment orders and purchases are stored in Prisma (`PaymentOrder`, `Purchase`). The same records are mirrored to the file store so the dashboard works if the database is down.

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

Dashboard, checkout, and admin routes are noindex. Public catalog URLs are indexable.

## SEO

Public pages emit a unique title, meta description, canonical URL, Open Graph, and Twitter tags. `/robots.txt` allows the catalog and disallows dashboard, admin, checkout, auth, and in-progress exam routes. `/sitemap.xml` lists home, static guides, published vendors, exams, and practice-test URLs (`/certifications/[vendor]/[exam]` and `/practice-test/[vendor]/[exam]`).

Catalog pages include BreadcrumbList JSON-LD. Exam and practice-test pages add Course/Product and FAQ structured data. Search and paginated filter views canonicalise to the clean catalog URL and are marked noindex so they do not compete with provider and exam pages.

## Payments API

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/payments/razorpay/order` | Create a Razorpay order (auth) |
| POST | `/api/payments/razorpay/verify` | Verify signature and unlock (auth) |
| POST | `/api/payments/razorpay/fail` | Record a failed payment (auth) |
| POST | `/api/payments/razorpay/cancel` | Record a cancelled checkout (auth) |
| GET | `/api/payments/purchase-status?slug=` | Owned or not (auth) |
| POST | `/api/payments/razorpay/webhook` | Optional `payment.captured` (webhook secret) |

## Folder structure

```
prisma/                 PostgreSQL schema
src/app/                Routes, SEO, API handlers
src/auth.ts             Auth.js (Node: credentials + bcrypt)
src/auth.config.ts      Edge-safe session config and route protection
src/proxy.ts              Protects /dashboard, /account, /library, /checkout, /admin
src/lib/payments/         Razorpay order create, signature verify, webhooks
src/lib/commerce/         Orders, purchases, unlocks
src/components/         Layout, catalog, dashboard, exam, shadcn primitives
src/lib/                Auth, commerce, exam, catalog, env
```
