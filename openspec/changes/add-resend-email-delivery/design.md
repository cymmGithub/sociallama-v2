# Design: add-resend-email-delivery

## Context

`lib/integrations/email/` holds a complete two-form delivery pipeline that has
never sent a real email: `transport.ts` builds a cached nodemailer SMTP
transport from `SMTP_*` env vars that were planned for Google Workspace and
never set. Everything around it is live and tested — Turnstile validation,
per-form rate-limit budgets, per-locale Zod schemas, the CV streamed from
`FormData` into the message and never persisted. A Resend account now exists.
The nodemailer surface is exactly three files (`transport.ts` + the two
actions) plus the registry entry; no test mocks it.

## Goals / Non-Goals

**Goals:**

- Deliver both forms through the Resend API, preserving every behavioral
  contract the actions already document: fail-soft when unconfigured, failure
  state on any undelivered submission, `Reply-To` = submitter, CV as
  attachment, careers → `CAREERS_INBOX` with warned fallback to
  `CONTACT_INBOX`.
- A daily, alert-on-failure signal that the delivery config (key, domain DNS,
  API) still works, without sending anything to a human inbox.
- Shrink config: one secret (`RESEND_API_KEY`) + one address (`EMAIL_FROM`)
  instead of four SMTP vars.

**Non-Goals:**

- No Vercel Marketplace Resend integration — the user's standalone account is
  the account of record; Marketplace `add` would provision a second,
  Vercel-billed one.
- No Resend SMTP bridge — it exists for codebases with legacy transport to
  protect; ours has none worth protecting (three files, zero test coverage of
  the transport itself).
- No daily form-level e2e — production Turnstile is fail-closed by design; a
  scheduled bot submitting the real form is the attack it exists to block.
  The full form path is verified once, manually, at rollout.
- No email templates/React Email, no inbound webhooks, no send analytics —
  two transactional mails a day do not justify them.

## Decisions

### D1 — SDK over SMTP bridge

`resend.emails.send()` replaces `transport.sendMail()`. The call shapes are
nearly isomorphic (`from`/`to`/`replyTo`/`subject`/`text`/`attachments` with
Buffer content), so the swap is mechanical. Chosen over the SMTP bridge
because the bridge's only virtue is not touching code — but the code needed
touching anyway (`from: env.SMTP_USER` would break: Resend's SMTP username is
the literal string `resend`, not an address). Dropping nodemailer also removes
a heavyweight dependency kept alive for two emails a month.

### D2 — `transport.ts` becomes `client.ts` with the same fail-soft contract

A cached module-level `Resend | null | undefined` getter (`getResend()`),
mirroring the current `undefined` = unresolved / `null` = unconfigured
convention and the one-time warn. The actions' guard changes from
`!(transport && inbox)` to `!(resend && from && inbox)` — `EMAIL_FROM` joins
the required set because Resend rejects sends from unverified domains, and a
missing `from` must fail the submission, not silently fall back.

### D3 — SDK errors are checked, not only caught

Resend's SDK returns `{ data, error }` instead of throwing on API-level
failures. Each send checks `error` and returns the 500 failure state (keeping
the existing `try/catch` for transport-level throws). Without this check a
rejected send would read as success — violating the careers spec's "never
masked" requirement.

### D4 — Health probe is one dependency-free script, used by hand and by cron

`lib/scripts/email-health.ts` uses plain `fetch` against the Resend REST API
(no `resend` import): (1) `GET /domains` → the domain of `EMAIL_FROM` must
have `status: "verified"` — catches revoked keys and DNS drift without
sending anything; (2) `POST /emails` to `delivered@resend.dev` — Resend's
official test sink: proves the send path, spams nobody, never touches domain
reputation, costs 1 of the 100/day free quota. Non-zero exit with a plain
message on any failure. Zero imports means the CI job needs checkout + bun
but **no `bun install`** — the run stays in seconds. Locally `bun
lib/scripts/email-health.ts` picks up `.env.local` automatically (Bun loads
env files itself).

### D5 — Separate lightweight workflow, not a Monitor extension (variant A)

`.github/workflows/email-health.yml`: daily cron at an off-the-hour minute
(Actions congestion, same reasoning as `monitor.yml`), plus
`workflow_dispatch` for manual runs and alert rehearsal. `RESEND_API_KEY` is
a repo **secret**; `EMAIL_FROM` a repo **variable** (an address is not a
secret, and variables are visible for triage). A guard step fails loudly when
either is unset, mirroring `monitor.yml`'s `MONITOR_BASE_URL` guard.
Explicitly chosen over re-enabling Monitor's commented-out schedule: that
workflow crawls the full sitemap for up to an hour and was made manual-only
by user decision 2026-08-01; a 2-minute email check must not resurrect it.
Alerting = GitHub's built-in failure email for scheduled runs (and the
already-documented `/github subscribe` Slack bridge, which matches on
workflow name).

### D6 — Registry and docs follow the provider

`integrations.email` becomes `Email (Resend)` with `https://resend.com/docs`;
`emailEnvSchema` requires `RESEND_API_KEY` + `EMAIL_FROM` + `CONTACT_INBOX`,
so `isConfigured('email')` and the doctor keep working unchanged. The
`.env.example` email section drops the Google app-password walkthrough for a
Resend one (key, from-on-verified-domain, both inboxes).

## Risks / Trade-offs

- [Domain never verified / DNS records later removed] → the probe's domain
  check fails the daily run before any real submission is lost; `EMAIL_FROM`
  on the verified domain is a documented prerequisite in `.env.example`.
- [SDK error-shape drift on major upgrades] → the `{ error }` check is
  asserted in the health probe path too (a failed send exits non-zero), so a
  silently changed contract surfaces within a day, not on a lost lead.
- [Public-repo cron auto-disabled after 60 days of inactivity] → accepted;
  already documented for Monitor, restated in the new workflow's header. Any
  push resets the clock.
- [Free-tier limits (100/day, 3 000/month)] → two forms + one daily probe are
  orders of magnitude below both; rate limiting on the actions already caps
  abuse before it reaches Resend.
- [Probe consumes quota with a real send] → deliberate: a domains-only check
  cannot prove the send path; `delivered@resend.dev` keeps the send free of
  side effects.

## Migration Plan

1. Land the code swap (no secrets present → both forms keep failing soft,
   exactly as today).
2. User: verify `sociallama.pl` in Resend, create the API key, set
   `.env.local` + Vercel env (`RESEND_API_KEY`, `EMAIL_FROM`,
   `CONTACT_INBOX`, optional `CAREERS_INBOX`) and GitHub secret/variable.
3. Run the probe by hand (`bun lib/scripts/email-health.ts`) — proves
   key+domain before any form is touched.
4. Manual end-to-end: submit both forms on the dev server (Turnstile is
   fail-open in dev), confirm both mails in the real inbox — contact fields +
   Reply-To, careers CV attachment.
5. First `workflow_dispatch` run of Email health green → done; rollback is
   `git revert` of one commit (the old SMTP path needed no secrets that
   would linger).

## Open Questions

- `EMAIL_FROM` final value (`halohalo@sociallama.pl` vs a dedicated
  `formularz@…`) — user decision at secret-setting time; code treats it as
  opaque.
- Does a dedicated `CAREERS_INBOX` mailbox exist yet? Unset, the warned
  fallback to `CONTACT_INBOX` (existing behavior) covers the gap.
