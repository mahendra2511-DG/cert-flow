# PrepHarbor

PrepHarbor is an original certification practice-test marketplace. Learners browse exams by provider, open a certification, inspect a practice test, purchase access in INR, sit the exam in the browser, and review explanations.

The product is independent. It is not affiliated with any certification vendor and does not copy third-party branding, assets, or proprietary exam content.

## Stack

- Next.js (App Router) and TypeScript
- Tailwind CSS and shadcn/ui
- PostgreSQL with Prisma (optional)
- Auth.js (NextAuth v5) with credentials, JWT sessions, and protected routes
- Razorpay for Indian payments (checkout is stubbed until keys are set)

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

Demo sign-in: `demo@prepharbor.test` / `demo`. That account includes sample purchases, orders, and attempts.

Password reset does not send email in this environment. Request a link from `/forgot-password` and use the demo inbox URL on the success screen.

## Environment variables

See `.env.example`. Catalog, sign-up, login, and dashboard data persist to `/tmp` when `DATABASE_URL` is unset. Razorpay checkout still needs keys.

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
| `/sign-in` | Log in |
| `/sign-up` | Create an account |
| `/forgot-password` | Request a reset link |
| `/reset-password` | Choose a new password |
| `/dashboard` | Welcome, stats, purchases, attempts, recommendations |
| `/dashboard/tests` | Purchased tests |
| `/dashboard/attempts` | Attempt history |
| `/dashboard/orders` | Orders and receipts |
| `/dashboard/profile` | Name, email, password, settings |
| `/checkout/[slug]` | Razorpay checkout shell |
| `/library` | Redirects to `/dashboard/tests` |
| `/account` | Redirects to `/dashboard/profile` |

Dashboard routes require a signed-in session.

## Folder structure

```
prisma/                 PostgreSQL schema
src/app/                Routes, SEO, API handlers
src/auth.ts             Auth.js (Node: credentials + bcrypt)
src/auth.config.ts      Edge-safe session config and route protection
src/middleware.ts       Protects /dashboard, /account, /library
src/components/         Layout, catalog, dashboard, exam, shadcn primitives
src/lib/                Auth, commerce, exam, catalog, env
```
