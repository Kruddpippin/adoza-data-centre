# ADOZA Data Centre

Youth empowerment data platform for the **SYB Door-to-Door programme (Kogi State)** — built with **React + Vite + Tailwind CSS** on a **Supabase** (PostgreSQL + Auth + RLS) backend, following the StayFlow architecture.

## Features

- **Dashboard** — registrations, verification, beneficiaries, funds disbursed, equipment assigned; charts by LGA, status and employment.
- **Youths** — door-to-door registration with GPS capture, skills, needs assessment and consent; search & filters; CSV export.
- **Verification workflow** — verifiers approve / reject / flag registrations; committee approves beneficiaries.
- **Eligibility scoring** — computed automatically in Postgres (age, employment, skills, experience, needs, ward coverage — max 100), ported from the original ADOZA scoring engine.
- **Equipment** — inventory, assignment and delivery tracking.
- **Funding** — grants per beneficiary with disbursement status and totals.
- **Surveys** — dynamic JSON-defined templates with field responses.
- **Field Map** — Leaflet map of GPS-tagged registrations coloured by status.
- **Team** — admin role/status management (RLS-enforced).
- **Audit Log** — automatic Postgres trigger audit of every change.

## Roles

| Role | Access |
|------|--------|
| Super Admin / Campaign Admin | Everything, incl. Team & Audit |
| Enumerator | Register youths, surveys, map |
| Verifier | Verify/reject/flag registrations |
| Committee | Beneficiaries, equipment, funding |

## Demo accounts (password `Password123!`)

- admin@adoza.ng · super@adoza.ng · enumerator@adoza.ng · verifier@adoza.ng · committee@adoza.ng

## Getting started

    npm install
    cp .env.example .env   # set VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
    npm run dev

## Deployment (Vercel)

Framework preset **Vite**, build `npm run build`, output `dist`, plus the two env vars. `vercel.json` rewrites all routes to `index.html` for SPA routing.

## Architecture notes

- All data access goes through the Supabase client with **Row Level Security** on every table — the browser key is safe by design.
- Eligibility scores, audit entries and `updated_at` are maintained by Postgres triggers, so they are consistent regardless of client.
- Route-level code splitting (`React.lazy`) with vendor/charts/map/supabase chunks; TanStack Query caching for all reads.
