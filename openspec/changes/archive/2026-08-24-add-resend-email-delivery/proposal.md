# Proposal: add-resend-email-delivery

## Why

Both site forms (`/kontakt` contact + `/zostan-lama` careers) are fully built —
validation, Turnstile, rate limiting, CV attachment — but deliver nothing: the
nodemailer SMTP transport was written for a Google Workspace app-password setup
that was never provisioned, so every production submission would fail. A Resend
account now exists (user decision 2026-08-06) and becomes the delivery
provider; the swap also adds the one thing the current design lacks entirely —
a daily automated check that delivery still works.

## What Changes

- Replace the nodemailer SMTP transport with the official `resend` SDK, keeping
  the exact fail-soft contract (unconfigured → `null` + one warn, pages render,
  actions return a failure state).
- Both server actions (`sendContactEmail`, `sendCareersApplication`) switch
  `transport.sendMail(...)` → `resend.emails.send(...)`; the CV keeps flowing
  as a Buffer attachment, the submitter stays in `Reply-To`.
- Env surface shrinks: `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS` are
  replaced by `RESEND_API_KEY` + `EMAIL_FROM` (an address on the
  Resend-verified domain). `CONTACT_INBOX`/`CAREERS_INBOX` are unchanged.
- Dependencies: `nodemailer` + `@types/nodemailer` removed, `resend` added.
- New probe script `lib/scripts/email-health.ts` (plain fetch, zero imports):
  asserts the `EMAIL_FROM` domain is `verified` in Resend, then sends one test
  email to Resend's official sink `delivered@resend.dev`. Doubles as the manual
  smoke test and the CI check.
- New lightweight daily workflow `.github/workflows/email-health.yml` (variant
  A decision: separate cron; the heavy `Monitor` workflow stays manual-only).
- Deliberately NOT included (decisions made in discussion): the Vercel
  Marketplace Resend integration (a second, Vercel-billed account when one
  already exists), Resend's SMTP bridge (keeps nodemailer for zero gain), and
  daily form-level e2e (production Turnstile is fail-closed by design — a
  daily bot submit is exactly what it blocks). The form path is verified once,
  manually, end to end.

## Capabilities

### New Capabilities

- `email-delivery`: how form submissions become delivered email — the Resend
  client, sender identity (`EMAIL_FROM` on the verified domain), inbox routing
  (contact vs careers), the fail-soft unconfigured contract, and error
  reporting on failed sends.
- `email-health-monitoring`: the daily delivery health check — what the probe
  asserts (domain verification + a real send to the test sink), where it runs
  (own scheduled workflow, manual dispatch), and how failures reach a human
  (GitHub's scheduled-run failure email).

### Modified Capabilities

- `careers-application-form`: the "Delivery failure is reported, never masked"
  requirement names the SMTP transport; it is reworded to the provider-neutral
  delivery client so the requirement (fail the submission, never fake success)
  carries over Resend unchanged.

## Impact

- **Code**: `lib/integrations/email/transport.ts` (→ Resend client),
  `action.ts`, `careers-action.ts`, `lib/env.ts`, `lib/utils/validation.ts`
  (`emailEnvSchema`), `lib/integrations/registry.ts` (email entry),
  `.env.example`; new `lib/scripts/email-health.ts`,
  `.github/workflows/email-health.yml`.
- **Dependencies**: −`nodemailer`, −`@types/nodemailer`, +`resend`.
- **Tests**: none mock the transport (`careers-schema.test.ts` is Zod-only), so
  no test rewrites; the health probe is its own verification.
- **Ops / user-side prerequisites**: `sociallama.pl` verified in Resend
  (DKIM/SPF DNS records), API key created; secrets set in `.env.local` +
  Vercel (`RESEND_API_KEY`, `EMAIL_FROM`, `CONTACT_INBOX`, optional
  `CAREERS_INBOX`) and GitHub (`RESEND_API_KEY` secret, `EMAIL_FROM` repo
  variable). Known constraint: GitHub disables crons in public repos after 60
  days without activity (already documented in `monitor.yml`).
