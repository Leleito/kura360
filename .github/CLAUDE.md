# KURA360 - Claude Agent Instructions

> These instructions are for Claude sessions operating on this repository.

## Project Context
KURA360 is a Campaign Compliance & Operations Platform for Kenyan elections.
- **Stack**: Next.js, React, TypeScript, Tailwind CSS, Supabase, M-Pesa/Flutterwave
- **Owner**: George LELEITO (@Leleito) — Sysmera Limited
- **Deploy**: Vercel
- **Target**: Web app for campaign managers, election observers, compliance officers

## Critical Rules

### 1. Branch Strategy
- **`master`** — Production. Protected.
- Create feature branches from `master`, name as `feature/<description>` or `fix/<description>`.
- Claude agent should create PRs to `master`.

### 2. Supabase Architecture
- Project ref: `ptsjqwcllahztycmdnpn`
- **NEVER** run `supabase config push`
- Migrations go in `supabase/migrations/` with timestamp prefix

### 3. Code Conventions
- Use conventional commits: `feat:`, `fix:`, `chore:`, `docs:`
- Mobile-responsive design required
- ECFA (Elections Campaign Financing Act) compliance is a core requirement
- All financial transactions must have audit trails
- RBAC (Role-Based Access Control) must be enforced on all routes

### 4. Before Committing
- Run `npm run build` to verify no TypeScript/build errors
- Check that no secrets (.env values, API keys) are in the diff
- Ensure RLS policies are reviewed for any schema changes

### 5. Key Domain Concepts
- **Campaigns**: Electoral campaign entities with budgets and compliance tracking
- **Expenditures**: Spending records tied to campaigns with category classification
- **Evidence**: Supporting documents (receipts, photos) for expenditures
- **Donations**: Incoming campaign contributions with M-Pesa/Flutterwave integration
- **Compliance Reports**: Auto-generated reports for ECFA submission
