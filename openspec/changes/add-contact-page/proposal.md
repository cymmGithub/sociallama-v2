## Why

The header CTAs (`POROZMAWIAJMY O TWOIM BIZNESIE` / `NAPISZ DO NAS`) and the legacy `/kontakt` URL currently just smooth-scroll to the footer, which only lists an email, phone, and address — there is no way to actually send a message from the site. We want a dedicated contact page that turns those clicks into real inbound leads delivered to an inbox, styled 1-to-1 with the Brightscout contact vibe the team signed off on (dark canvas, oversized marquee, numbered underline form, one bright accent band).

## What Changes

- **New `/kontakt` route** — a dedicated dark-canvas contact page: reused homepage `<Marquee>` hero (`Porozmawiajmy` / `o Twoim biznesie`, bold orange-fill over outline-stroke), a low-friction numbered underline form, and an orange metrics band with real numbers (500 000 fanów · 528 kampanii · 80 klientów · 7 000 000 zasięgu).
- **Low-friction form** — four fields only: `Imię`, `E-mail`, optional service tags (`Social media / Kampanie / Wideo / Strategia / Współpraca`), `Wiadomość`. No budget, no company, no last name — the team's goal is to maximize inquiries. Composes the existing `components/ui/form` kit.
- **Real email delivery** — submissions are emailed to the Social Lama inbox via **nodemailer over the existing Google Workspace SMTP** (`smtp.gmail.com`), reusing the existing `runFormAction` rate-limit + Zod harness and Cloudflare Turnstile spam check. The submitter's address is set as `Reply-To` so the team can reply straight from the inbox. **NEW dependency + env vars.**
- **Header CTAs repointed** — `nav.cta.href` moves from `/#kontakt` to `/kontakt`. (site-nav)
- **Legacy redirect retired** — the generated `/kontakt → /#kontakt` 301 is repointed to serve the real page instead, via its generator script. (seo-url-parity)
- **Routing guard** — `'kontakt'` added to `RESERVED_SLUGS` so a Payload post can never shadow the route.

## Capabilities

### New Capabilities
- `contact-page`: The `/kontakt` page — its layout/marquee/metrics structure, the contact form fields and validation, spam protection, and email delivery of submissions to the Social Lama inbox.

### Modified Capabilities
- `site-nav`: The primary CTA now links to the dedicated `/kontakt` page instead of the `/#kontakt` footer anchor.
- `seo-url-parity`: The legacy `/kontakt` URL is now served by a real page rather than 301-redirecting to `/#kontakt`.

## Impact

- **New code**: `app/(frontend)/kontakt/page.tsx` + section components + scoped CSS module; `lib/integrations/email/` (nodemailer transport + `sendContactEmail` server action + Zod schema); `lib/content/contact.ts` (all copy — components never hardcode strings).
- **Modified code**: `lib/content/home.ts` (`nav.cta.href`); `lib/payload/reserved-slugs.ts` (`+ 'kontakt'`); `lib/scripts/generate-wp-redirects.ts` + regenerated `lib/wp-redirects.ts` (drop the `/kontakt` anchor redirect).
- **Reused**: `components/ui/marquee`, `components/ui/form` (+ fields), `lib/utils/form-action.ts`, `lib/integrations/turnstile`, `lib/types/form.ts`.
- **New dependency**: `nodemailer` (+ `@types/nodemailer` dev).
- **New env vars**: `SMTP_HOST` (`smtp.gmail.com`), `SMTP_PORT` (`587`), `SMTP_USER` (Google Workspace sender), `SMTP_PASS` (app password — requires 2FA on that account), `CONTACT_INBOX` (destination, may equal the sender) — the page renders without them but cannot deliver until they are set.
- **Tests/gates**: URL-parity gate must be updated to expect `/kontakt` → `200` instead of `301`.
