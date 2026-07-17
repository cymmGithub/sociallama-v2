## Context

The site has no working contact form — header CTAs and the legacy `/kontakt` URL smooth-scroll to a footer that only lists email/phone/address. This change adds a dedicated `/kontakt` page whose visual direction was chosen from rendered mocks: a "Brightscout vibe" dark canvas (near-black ground, oversized marquee, numbered underline form, one bright orange accent band), skinned in Social Lama's identity.

Reusable infrastructure already exists and is unused in `app/`: the `components/ui/form` kit (React 19 server actions), `components/ui/marquee` (the same `<Marquee>` powering the homepage `BigMarquee`), the `runFormAction` harness (IP rate-limit + Zod), and `lib/integrations/turnstile` (Cloudflare spam check). The only genuinely new piece is an email transport — the repo has none.

## Goals / Non-Goals

**Goals:**
- A dedicated `/kontakt` route matching the approved dark mock: bold homepage-style marquee (`Porozmawiajmy` / `o Twoim biznesie`), low-friction 4-field form, orange metrics band with the real numbers.
- Real delivery of each submission to the Social Lama inbox, with the submitter's address as `Reply-To`.
- Maximum reuse of existing form/marquee/harness/Turnstile infrastructure.
- Repoint header CTAs and retire the legacy `/kontakt` redirect so the URL serves the real page.

**Non-Goals:**
- No persistence of submissions in Payload/CRM — email notification only (can be added later).
- No budget/company/last-name fields, no multi-step flow — the goal is to maximize inquiries.
- No new theme in the global 3-theme system; the dark canvas is scoped to this page.
- No i18n — Polish only, consistent with the rest of the site.

## Decisions

### D1 — Email transport: nodemailer over Google Workspace SMTP
`sociallama.pl` mail runs on Google Workspace, and the submission is a **notification to the team's own inbox**, not outbound mail to third parties. So the deliverability edge of a managed API (Resend) is largely irrelevant here, while nodemailer + the existing Gmail SMTP costs nothing and adds no new SaaS or DNS setup.
- Transport: `smtp.gmail.com:587` STARTTLS, auth via `SMTP_USER` + an **app password** (`SMTP_PASS`).
- `from` = `SMTP_USER` (Gmail requires the from to match the authed account/alias); `to` = `CONTACT_INBOX`; `replyTo` = submitter's email.
- **Alternatives considered:** *Resend* — cleaner API + managed SPF/DKIM, but a new account, DNS verification, and unnecessary for self-notification. *Reuse `mailchimpContactAction`* — stores a Mailchimp contact note, which is not an inbox email; fails the "actual email" requirement.

### D2 — Reuse the form harness, keep Turnstile in the action body
`sendContactEmail` mirrors `mailchimpContactAction`: validate Turnstile first, then delegate to `runFormAction` (rate-limit prefix `contact-email`, a Zod `contactSchema`), and send inside the `run` callback. This inherits IP rate-limiting, Zod validation, and the `FormState` contract for free. Turnstile stays in the action body per the harness's documented convention.

### D3 — Dark canvas without touching the global theme system
The 3 themes (`plum`/`cream`/`plum-deep`) are for the homepage scroll chapters; none is near-black. Rather than add a 4th global theme, the page renders inside `<Wrapper theme="plum-deep">` (so Header/Footer get cream-on-dark chrome + Lenis for the marquee's scroll-velocity coupling) and its own **scoped CSS module** paints the near-black ground and orange band. Accent colors reuse existing tokens (`--color-orange`, `--color-cream`); the near-black ground is a page-local value.

### D4 — Reuse `<Marquee>`, not a new component
The hero is the existing `<Marquee>` component with the homepage `BigMarquee` treatment (Exo 2 @800, orange fill row + outline-stroke row, counter-scrolling), fed contact copy. This keeps the page consistent with the homepage and inherits the Lenis velocity coupling.

### D5 — Route wiring
- `app/(frontend)/kontakt/page.tsx` following the `zostan-lama` static-page convention (metadata + canonical `/kontakt`, `<Wrapper>` renders Header/Footer).
- Add `'kontakt'` to `RESERVED_SLUGS` so a Payload post can't shadow it.
- Retire the `/kontakt → /#kontakt` 301: `wp-redirects.ts` is a **generated file**, so update the disposition in `lib/scripts/generate-wp-redirects.ts` and regenerate — do not hand-edit the output.
- `nav.cta.href`: `/#kontakt` → `/kontakt` in `lib/content/home.ts`. (The `NAPISZ DO NAS` join-CTA button may follow the same repoint.)

### D6 — Copy lives in content, never in components
All strings (marquee lines, field labels, metrics, success/error messages) go in a new `lib/content/contact.ts`, matching the repo rule that components never hardcode copy.

## Risks / Trade-offs

- **Google Workspace may disable app passwords (admin policy) or the account lacks 2FA** → Mitigation: document the 2FA + app-password steps; if blocked, fall back to a dedicated sender account or OAuth2 refresh-token transport (same nodemailer, different auth). Transport is isolated in one module, so swapping is cheap.
- **Missing SMTP env vars in an environment** → the action must fail gracefully: return a `500` `FormState` with a user-facing error and log server-side, never throw an unhandled error. The page still renders.
- **SMTP handshake latency on cold starts** (vs an HTTP API) → acceptable for a contact form; Fluid Compute reuses instances so it's usually warm.
- **URL-parity gate currently asserts `/kontakt` → `301`** → must be updated to expect `200`; otherwise the parity gate goes red. Tracked as a task.
- **Turnstile requires site keys** → if unconfigured in an environment, the check should degrade to allow submission (dev) rather than hard-block, matching how the existing actions behave.

## Open Questions

- **Destination inbox** (`CONTACT_INBOX`): assume `halohalo@sociallama.pl` unless the team wants a different address (e.g. a dedicated `kontakt@`).
- **Sender account** (`SMTP_USER`): the same `halohalo@` mailbox, or a dedicated no-reply sender within the Workspace?
