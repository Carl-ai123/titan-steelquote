# Titan SteelQuote

Titan SteelQuote is enquiry, estimating and quotation software for UK structural
steel fabricators. The current application is a front-end prototype being
converted into a secure, multi-tenant SaaS product through the phased
[implementation plan](docs/IMPLEMENTATION_PLAN.md).

## Current phase

Phase 0 stabilises the v0 prototype. It uses demonstration data and must not be
used for live customer quotations yet.

## Requirements

- Node.js 22 or 24
- pnpm 11.9.0

## Local setup

1. Clone the repository.
2. Copy `.env.example` to `.env.local`.
3. Run `pnpm install --frozen-lockfile`.
4. Run `pnpm dev`.
5. Open `http://localhost:3000`.

No environment values are required during Phase 0.

## Validation

Run all required checks with:

```text
pnpm check
```

Pull requests run type checking, linting and a production build automatically.

## Deployment

Vercel is the deployment target. The GitHub repository should be connected to a
Vercel project so every pull request receives an isolated preview. Production
deployment occurs only from the `main` branch.

Store future secrets in `.env.local` for local development and in Vercel project
settings for hosted environments. Never commit real credentials.

## Roadmap

See [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md) and the
[master implementation tracker](https://github.com/Carl-ai123/titan-steelquote/issues/2).
