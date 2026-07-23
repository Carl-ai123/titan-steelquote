# Prototype control inventory

This inventory records which v0 screens are visual prototypes and which actions
still require real application behaviour. It is the baseline for Phases 1–5.

## Dashboard

- KPI cards and charts use demonstration data.
- Deadline and recent-enquiry links navigate to prototype records.

## Customers

- Directory search and filtering are client-side.
- Create customer and create enquiry actions are not connected.

## Enquiries

- List search, filtering, sorting and pagination are client-side.
- New enquiry submission redirects to a placeholder record.
- Edit and status changes are held only in browser memory.
- Activity comments are not saved.

## Documents

- File selection and upload are not connected to storage.
- Document download links do not have access controls.

## Materials and labour

- Add, edit and delete actions update local component state only.
- CSV import is not connected.
- Material weights and costs are not authoritatively recalculated on save.
- Rate-library changes are not persisted.

## Estimate

- Recalculation runs in the browser.
- Save revision and approval actions are not persisted.
- VAT uses a prototype default rather than organisation settings.

## Quotation

- Quote text edits are held in browser memory.
- PDF generation uses the browser print dialogue.
- Issue, acceptance and revision history are not persisted.

## Settings and users

- Company settings, defaults and user changes are not persisted.
- Authentication, invitations, roles and permissions are not implemented.
- Logo upload is not connected.

## Phase ownership

- Phase 1: authentication, organisations, users and settings.
- Phase 2: customers, contacts, enquiries and activity.
- Phase 3: materials, labour, rates and estimating.
- Phase 4: approvals, revisions and PDF generation.
- Phase 5: documents, email and follow-up.
