# Titan SteelQuote — Implementation Plan

**Repository:** `Carl-ai123/titan-steelquote`  
**Product:** Multi-tenant quotation and estimating software for UK steel fabricators  
**Delivery model:** Phased releases, with a usable and testable outcome at the end of every phase

## Product goal

Titan SteelQuote should let a UK steel fabricator receive an enquiry, build a controlled estimate using its own rates, obtain approval, issue a professional quotation, and later compare the estimate with the commercial result.

The product must earn trust through transparent calculations. AI may assist with data entry later, but it must never hide or replace the estimator's pricing logic.

## Recommended technical direction

- **Application:** Keep the existing Next.js App Router and TypeScript codebase.
- **Hosting:** Vercel, connected to the GitHub repository.
- **Database and authentication:** Supabase Postgres, Supabase Auth and row-level security.
- **File storage:** Supabase Storage, keeping application data and access policies together.
- **Validation:** Zod schemas shared by forms and server actions.
- **Forms:** React Hook Form for larger editable workflows.
- **Database changes:** Versioned SQL migrations and generated TypeScript database types.
- **Calculations:** Pure, deterministic server-side TypeScript functions with unit tests.
- **PDFs:** Server-generated quotation documents using a deterministic PDF renderer.
- **Email:** Resend after quotation generation is stable.
- **Monitoring:** Vercel logs initially; add Sentry before paid pilots.
- **Billing:** Stripe only after the pilot workflow is validated.
- **AI:** Add structured RFQ extraction only after the core quotation engine is proven.

## Product principles

1. Every record belongs to an organisation.
2. Every protected database table enforces organisation separation.
3. Prices and rates are versioned rather than silently overwritten.
4. Issued quotations are immutable snapshots.
5. Calculations are reproducible and explainable.
6. An estimator remains responsible for approving all commercial values.
7. Demonstration data is never mixed with production data.
8. Every phase has explicit acceptance criteria.

---

## Phase 0 — Stabilise the prototype

### Purpose

Turn the v0 output into a dependable development baseline without changing its visual direction.

### Work

- Resolve the inconsistent enquiry status values in the mock data and interface.
- Confirm one canonical workflow and permitted status transitions.
- Review and pin dependencies after the package safety window.
- Make the production build, lint and type checks pass.
- Add formatting and code-quality scripts.
- Add `.env.example` without secrets.
- Add a basic GitHub Actions check for pull requests.
- Replace starter metadata such as the generic package name.
- Document local setup and the Vercel preview workflow.
- Record current screens and identify inactive prototype controls.

### Exit criteria

- A clean checkout can install and build successfully.
- Type checking and linting pass.
- Pull requests run automated checks.
- The prototype has one consistent enquiry workflow.
- No secrets are committed.

---

## Phase 1 — Organisations, users and secure access

### Purpose

Create the secure multi-company foundation required for a commercial SaaS product.

### Work

- Create the Supabase project and environment configuration.
- Add organisations, profiles, memberships and invitations.
- Implement email/password or magic-link authentication.
- Add roles: Admin, Director, Estimating Manager, Senior Estimator and Estimator.
- Protect application routes and server operations.
- Add organisation onboarding and company settings.
- Implement row-level security policies.
- Add audit fields to every business record.
- Provide seed data for development only.
- Test that users from one organisation cannot read or alter another organisation's records.

### Exit criteria

- A user can register or accept an invitation and sign in.
- The user sees only their organisation.
- An administrator can invite and deactivate users.
- Cross-organisation access tests pass.
- Company settings persist.

---

## Phase 2 — Customers, contacts and enquiries

### Purpose

Replace the demonstration CRM and enquiry screens with persistent business workflows.

### Work

- Add customer and contact records.
- Add enquiries, assigned estimator, source, deadline and probability.
- Implement create, edit, archive, search, filter and pagination.
- Implement the canonical status workflow and transition rules.
- Add notes, inclusions, exclusions and assumptions.
- Add an activity timeline for important changes.
- Add enquiry number generation scoped to each organisation.
- Add validation and friendly empty/error states.
- Add dashboard statistics from real data.

### Exit criteria

- A user can create a customer, contact and enquiry.
- Changes persist after sign-out and sign-in.
- Search and filters operate on the database.
- Invalid workflow transitions are rejected server-side.
- Dashboard figures match the saved enquiry records.

---

## Phase 3 — Rate libraries and deterministic estimating

### Purpose

Build the trusted commercial engine at the centre of SteelQuote.

### Work

- Add material sections, grades, units and supplier rate records.
- Add effective dates, expiry dates and waste allowances.
- Add labour operations, setup time, unit time and hourly rates.
- Support bought-out costs: coating, subcontracting, transport and plant.
- Add material lines with length, quantity, unit weight and tonnage.
- Add labour lines with quantity, setup time and unit time.
- Calculate direct cost, overhead, contingency, margin, profit and selling price.
- Move all authoritative calculations to tested server-side functions.
- Store the inputs and result of each calculation.
- Add CSV import for material schedules after manual entry works reliably.
- Add warnings for missing, expired or overridden rates.
- Maintain a visible calculation breakdown for the estimator.

### Calculation rules to settle before implementation

- Whether overhead is applied to all direct costs or selected categories.
- Whether contingency is applied before or after overhead.
- Margin versus markup terminology and formulas.
- Rounding policy for weights, line costs and final quotation values.
- Waste calculation by percentage versus stock-length optimisation.
- Treatment of VAT and zero-rated cases.
- Permissions required to override rates and margin targets.

### Exit criteria

- The same inputs always produce the same result.
- Unit tests cover normal, boundary and invalid calculations.
- Users can explain every value in the selling price.
- Expired rates cannot be used silently.
- Estimate results persist as revisions.

---

## Phase 4 — Approvals, revisions and quotation PDFs

### Purpose

Turn an internal estimate into a controlled customer-facing quotation.

### Work

- Add estimate revision creation and comparison.
- Add submit, approve, reject and return-for-changes actions.
- Add approval thresholds based on role, margin or quotation value.
- Freeze approved/issued revisions as immutable snapshots.
- Generate organisation-scoped quotation numbers.
- Build a branded PDF using saved company settings.
- Include price, scope, inclusions, exclusions, assumptions, validity and terms.
- Store generated PDFs and provide secure downloads.
- Add quotation issue, accepted, declined, superseded and withdrawn states.
- Record who approved and issued each quotation.
- Add a safe reissue/amendment workflow.

### Exit criteria

- An estimator can submit a revision for approval.
- An authorised user can approve or reject it.
- An approved revision produces a repeatable branded PDF.
- Issued quotation data cannot be silently changed.
- All actions appear in the audit timeline.

---

## Phase 5 — Documents, communication and follow-up

### Purpose

Keep the RFQ evidence and commercial conversation attached to the enquiry.

### Work

- Upload drawings, specifications, bills of materials and correspondence.
- Enforce organisation-aware storage permissions.
- Add file type, size and malware-risk controls.
- Add document categories and version metadata.
- Send quotations by email through the application.
- Record recipients, subject, time sent and delivery outcome.
- Add scheduled follow-up dates and reminders.
- Add comments and internal mentions.
- Add a clear data-retention and deletion process.

### Exit criteria

- Authorised users can upload and retrieve enquiry documents.
- Unauthorised download attempts fail.
- A quotation can be emailed and its issue record is stored.
- Users can see which quotations need follow-up.

---

## Phase 6 — Commercial reporting

### Purpose

Show management whether estimating activity converts into profitable work.

### Work

- Report quote volume, value and response time.
- Report win rate by customer, estimator, work type and value band.
- Record structured loss reasons.
- Show pipeline value weighted by probability.
- Add estimator workload and approaching deadlines.
- Add CSV export.
- Add actual-versus-estimated job feedback when source data becomes available.
- Define dashboard metrics precisely to prevent misleading totals.

### Exit criteria

- Dashboard figures can be traced to underlying records.
- Management can identify overdue quotes and loss patterns.
- Exports respect current organisation and user permissions.

---

## Phase 7 — Pilot readiness and first customers

### Purpose

Prepare a stable, supportable product for controlled UK fabrication pilots.

### Work

- Complete accessibility, responsive and browser testing.
- Add error monitoring and operational alerts.
- Add backups and a restore procedure.
- Add privacy policy, terms, subprocessor list and data-processing information.
- Complete GDPR data export and deletion workflows.
- Add onboarding checklists and rate-import assistance.
- Add a product feedback mechanism.
- Run security review and permission tests.
- Create a demo organisation that cannot expose production data.
- Pilot with two or three fabricators using real historical quotations.
- Measure quote time, corrections, adoption and user confidence.

### Exit criteria

- No critical security or data-loss issues remain.
- A new pilot company can be onboarded predictably.
- Each pilot successfully recreates historical quotations.
- Pilot results provide measurable commercial evidence.

---

## Phase 8 — AI-assisted RFQ intake

### Purpose

Reduce data entry only after the underlying workflow and calculations are trusted.

### Work

- Extract customer, project, dates and scope from RFQ emails and documents.
- Extract proposed material lines from supported schedules.
- Show confidence and source references for every extracted field.
- Require estimator confirmation before saving.
- Log model, prompt version, source documents and user corrections.
- Prevent prompt content from controlling application permissions or calculations.
- Measure extraction accuracy and time saved.
- Keep manual entry fully available.

### Exit criteria

- AI creates a draft, never an unreviewed final quotation.
- Every extracted value is traceable to a source.
- Failed or uncertain extraction is obvious to the user.
- The feature demonstrates measured time savings during pilots.

---

## Recommended delivery cadence

Each phase should use a short-lived branch and a draft pull request. Work should be split into small issues with one observable outcome each. A phase is complete only after its acceptance criteria pass in a Vercel preview and the corresponding pull requests are merged.

For the initial build, complete Phases 0–4 before adding broad reporting, billing or AI. This produces the smallest product that a real fabricator can use to create and issue a controlled quotation.

## Initial decisions required

Before Phase 1 is merged, confirm:

- Supabase region and account ownership.
- Authentication method for pilot users.
- Whether companies self-register or are invited by Titan.
- Data retention expectations.
- Required user roles and approval thresholds.

Before Phase 3 is merged, confirm the calculation rules listed in that phase with at least one experienced steel estimator.

## Definition of done for every issue

- Acceptance criteria are written before implementation.
- Organisation permissions are considered.
- Server-side validation is present.
- Happy path and failure states are tested.
- Relevant documentation is updated.
- The production build passes.
- The change is reviewed in a Vercel preview.
- No secrets or customer data are committed.
