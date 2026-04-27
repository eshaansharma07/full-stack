# BudgetSense Future

Futuristic full-stack budget tracking project built with Next.js and a cinematic dashboard UI.

## Features

- Live dashboard overview for income, expenses, savings rate, and scheduled transfers
- Budget category tracking with utilization bars and trend markers
- Goal progress modules for savings planning
- REST-style API routes for budgets, goals, transactions, and dashboard data
- Local JSON-backed persistence for zero-friction setup
- Vercel-friendly Next.js App Router structure

## Local setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deploy to your friend's GitHub + Vercel

1. Push this folder to your friend's GitHub repository.
2. In Vercel, import that GitHub repo.
3. Framework preset: `Next.js`.
4. Build command: `npm run build`
5. Output setting: leave default
6. Deploy

## Deployment note

This starter uses a local JSON store for easy setup. It deploys cleanly to Vercel for demo use, but persistent production data should be moved to Postgres, Supabase, or another hosted database before real use.
