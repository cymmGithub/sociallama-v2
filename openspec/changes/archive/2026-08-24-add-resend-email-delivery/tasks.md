# Tasks: add-resend-email-delivery

## 1. Dependency and env surface

- [x] 1.1 `bun remove nodemailer @types/nodemailer && bun add resend`
- [x] 1.2 `lib/env.ts`: replace the four `SMTP_*` entries with
      `RESEND_API_KEY` + `EMAIL_FROM` (comment: Resend API, `EMAIL_FROM` must
      sit on the Resend-verified domain); `CONTACT_INBOX`/`CAREERS_INBOX`
      unchanged
- [x] 1.3 `lib/utils/validation.ts`: `emailEnvSchema` requires
      `RESEND_API_KEY`, `EMAIL_FROM`, `CONTACT_INBOX`; update its doc comment
- [x] 1.4 `lib/integrations/registry.ts`: email entry → name `Email (Resend)`,
      docsUrl `https://resend.com/docs`
- [x] 1.5 `.env.example`: rewrite the email section for Resend (API key,
      `EMAIL_FROM` on the verified domain, both inboxes; drop the Google
      app-password walkthrough)

## 2. Delivery client and actions

- [x] 2.1 Replace `lib/integrations/email/transport.ts` with `client.ts`:
      cached `getResend(): Resend | null`, `undefined`/`null` resolution
      convention and one-time warn preserved (design D2)
- [x] 2.2 `lib/integrations/email/action.ts` (`sendContactEmail`): guard on
      `resend && env.EMAIL_FROM && inbox`; send via `resend.emails.send`
      (`from: EMAIL_FROM`, `to: CONTACT_INBOX`, `replyTo` submitter); check
      the returned `error` and keep the `try/catch` (design D3)
- [x] 2.3 `lib/integrations/email/careers-action.ts`
      (`sendCareersApplication`): same swap; CV stays a Buffer attachment
      with original filename and optional `contentType`; `CAREERS_INBOX` →
      warned `CONTACT_INBOX` fallback unchanged
- [x] 2.4 Sweep for leftovers: no `nodemailer`/`SMTP_` reference remains in
      `lib/`, `app/`, `.env.example`, docs (`ARCHITECTURE.md`, `PROD-README.md`
      if they mention it)

## 3. Health probe and daily workflow

- [x] 3.1 `lib/scripts/email-health.ts`: plain-fetch probe (zero imports) —
      `GET /domains` asserts the `EMAIL_FROM` domain is `verified` (handle the
      `Name <addr>` form when extracting the domain), then `POST /emails` to
      `delivered@resend.dev`; non-zero exit + plain message per failure mode
      (design D4)
- [x] 3.2 Add `"email:health": "bun ./lib/scripts/email-health.ts"` to
      package.json scripts
- [x] 3.3 `.github/workflows/email-health.yml`: daily cron at an off-hour
      minute + `workflow_dispatch`; guard step failing loudly when
      `RESEND_API_KEY` (secret) or `EMAIL_FROM` (variable) is unset; checkout
      + setup-bun, run the probe with no `bun install`; header comment
      documents alerting, the Slack subscribe line, and the public-repo
      60-day cron-disable caveat (design D5)

## 4. Verification

- [x] 4.1 `bun run check` green (biome, tsc, tests, manifest — regenerate
      COMPONENTS.md if the manifest tracks the changed signatures)
- [x] 4.2 Boot the dev server WITHOUT Resend env: `/kontakt` and
      `/zostan-lama` render, one warn logs, submissions return the failure
      state (fail-soft spec)
- [x] 4.3 [BLOCKED: needs user secrets + verified domain]
      `RESEND_API_KEY=<full-access> bun run email:health` passes locally
      (per-command key — `.env.local` holds only the app's sending-only key)
- [x] 4.4 [BLOCKED: needs user secrets] Manual e2e: submit both forms on the
      dev server (Turnstile fail-open), confirm in the real inbox: contact
      fields + `Reply-To`, careers CV attachment, correct inbox routing
- [x] 4.5 [BLOCKED: needs GitHub secret/variable] First `workflow_dispatch`
      run of Email health green; rehearse the failure path once (dispatch
      with a bogus key or unset variable) to see the alert arrive
