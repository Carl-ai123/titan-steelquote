# Phase 1 secure access setup

Phase 1 makes SteelQuote invitation-only and organisation-scoped. There is no
demonstration authentication bypass. Until Supabase is configured, deployed
business routes show the safe `setup-required` page.

## Pilot defaults

- Authentication: Supabase email magic links.
- Company creation: invite-only; no public company registration.
- Roles: Admin, Director, Estimating Manager, Senior Estimator and Estimator.
- User administration: Admin only.
- Organisation settings: Admin and Director.
- Hosting: Vercel.
- Database location: must be selected and owned by Titan before Phase 1 is
  approved.

## 1. Create and own the Supabase project

Create the project in the Titan-owned Supabase account. Record the selected
region and recovery owners in the company password manager. Do not create the
production project in a contractor's personal account.

In Supabase Authentication settings:

1. Disable open user registration.
2. Keep email authentication enabled.
3. Add the Vercel production URL and preview URL pattern to allowed redirects.
4. Configure a company-owned SMTP service before inviting pilot customers.

## 2. Apply the database

Apply migrations in timestamp order from `supabase/migrations`. For a local
Supabase environment, run the migration and then the development-only
`supabase/seed.sql`.

The Phase 1 migration creates organisations, profiles, memberships, invitations,
append-only audit events, role helpers and row-level security policies.

The RLS acceptance test is `supabase/tests/phase_1_rls.sql`. It proves that
members of one organisation cannot read or update another organisation.

## 3. Create the first administrator

Because company self-registration is disabled, bootstrap the first organisation
deliberately:

1. Invite the first Titan administrator from the Supabase Auth dashboard.
2. Copy that Auth user's UUID.
3. Insert the production organisation using the real registered details.
4. Insert an active `Admin` membership for that user and organisation.

All later users must be invited from SteelQuote's **Settings → Users & Roles**
screen.

## 4. Configure local and Vercel environments

Copy `.env.example` to `.env.local` and populate:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`

Use Vercel environment variables for hosted deployments. The service-role key is
server-only and must never use a `NEXT_PUBLIC_` prefix.

## 5. Acceptance checks

Before Phase 1 is merged:

- an invited user receives and uses a magic link;
- an uninvited email cannot create an account;
- protected routes redirect signed-out users;
- a deactivated membership loses access;
- Admin can invite and deactivate a non-Admin user;
- Director can save company settings but cannot manage users;
- company settings persist after sign-out and sign-in;
- the RLS cross-organisation test passes;
- GitHub and Vercel checks pass.

## Decisions still requiring Titan approval

- Supabase production region.
- Named Supabase account owners and recovery process.
- Pilot-user data retention period.
- Production SMTP provider and sender domain.
- Whether a future Titan support role may access customer organisations.
