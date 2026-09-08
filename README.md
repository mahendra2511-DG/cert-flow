# PrepHarbor

PrepHarbor is an original certification practice-test marketplace. Learners browse exams by provider, open a certification, inspect a practice test, purchase access in INR, sit the exam in the browser, and review explanations.

This repository currently ships the **application foundation**: app architecture, layout, navigation, design system, database schema, authentication, Razorpay configuration, SEO metadata, and working catalog routes with sample data. Full checkout, exam persistence, and question banks come next.

The product is independent. It is not affiliated with any certification vendor and does not copy third-party branding, assets, or proprietary exam content.

## Stack

- Next.js (App Router) and TypeScript
- Tailwind CSS and shadcn/ui
- PostgreSQL with Prisma
- Auth.js (NextAuth v5)
- Razorpay for Indian payments

## Run locally

```bash
npm install
cp .env.example .env.local
```

Generate an `AUTH_SECRET`:

```bash
openssl rand -base64 32
```

Start PostgreSQL (optional for browsing the sample catalog):

```bash
docker compose up -d
npx prisma migrate dev --name init
```

Then:

```bash
npm run dev
```

The app listens on [http://localhost:43145](http://localhost:43145).

Demo sign-in: `demo@prepharbor.test` / `demo`.

## Environment variables

See `.env.example`. Catalog pages run without a database. Sign-in persistence, purchases, and Razorpay orders require `DATABASE_URL` and Razorpay keys.

## Routes

| Path | Purpose |
| --- | --- |
| `/` | Home and featured catalog |
| `/certifications` | Search and browse tracks |
| `/certifications/[slug]` | Certification details |
| `/practice-tests` | Practice test catalog |
| `/practice-tests/[slug]` | Test details and purchase CTA |
| `/checkout/[slug]` | Razorpay checkout shell |
| `/library` | Purchased tests |
| `/exam/[attemptId]` | Online exam shell |
| `/results/[attemptId]` | Score and explanations shell |
| `/account` | Profile |
| `/sign-in` | Credentials sign-in |
| `/about` | Product notes |

## Folder structure

```
prisma/                 PostgreSQL schema
src/app/                Routes, SEO, API handlers
src/auth.ts             Auth.js configuration
src/components/         Layout, catalog, and shadcn primitives
src/lib/                Env, Prisma, Razorpay, catalog, SEO
```
