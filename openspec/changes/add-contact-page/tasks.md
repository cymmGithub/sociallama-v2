## 1. Content & configuration

- [x] 1.1 Add `lib/content/contact.ts` — marquee lines (`Porozmawiajmy` / `o Twoim biznesie`), lede, field labels/placeholders, service tags (Social media / Kampanie / Wideo / Strategia / Współpraca), submit + success/error copy, metrics (`500 000` / `528` / `80` / `7 000 000` with captions), and page metadata (title, description).
- [x] 1.2 Add `'kontakt'` to `RESERVED_SLUGS` in `lib/payload/reserved-slugs.ts`.

## 2. Email transport & server action

- [x] 2.1 Add `nodemailer` (+ `@types/nodemailer` dev) to `package.json` and install.
- [x] 2.2 Add `lib/integrations/email/transport.ts` — a nodemailer SMTP transport built from `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS`; returns `null` (and logs) when unconfigured so the action can fail gracefully.
- [x] 2.3 Add `lib/integrations/email/action.ts` — `sendContactEmail(prevState, formData)` mirroring `mailchimpContactAction`: validate Turnstile → `runFormAction` (prefix `contact-email`, Zod `contactSchema` of name/email/services[]/message) → send mail to `CONTACT_INBOX` with `replyTo` = submitter and a body listing name/email/services/message. Return `FormState` (200 success, 500 on send failure, never throw).

## 3. Contact page UI

- [x] 3.1 Create `app/(frontend)/kontakt/page.tsx` following the `zostan-lama` convention: `metadata` with canonical `/kontakt`, default export rendering `<Wrapper theme="plum-deep">` with the contact sections.
- [x] 3.2 Build the marquee hero section reusing `<Marquee>` with the homepage `BigMarquee` treatment (orange-fill line + outline-stroke line, counter-scrolling) + the `↳` lede.
- [x] 3.3 Build the form section composing `components/ui/form` (`<Form action={sendContactEmail}>`, `InputField` name/email, `CheckboxesField` service tags, `TextareaField` message, Turnstile widget, `<SubmitButton>`, `<Messages>`) in the numbered underline style.
- [x] 3.4 Build the orange metrics band (number-left / caption-right, hairline dividers) from `contact.ts` data.
- [x] 3.5 Add the scoped CSS module: near-black page ground, orange accent band, numbered underline fields, round service pills; reuse `--color-orange`/`--color-cream` tokens; respect `prefers-reduced-motion` and visible keyboard focus.

## 4. Routing & redirect wiring

- [x] 4.1 Repoint `nav.cta.href` (and the `NAPISZ DO NAS` join-CTA button) from `/#kontakt` to `/kontakt` in `lib/content/home.ts`.
- [x] 4.2 Update the `/kontakt` disposition in `lib/scripts/generate-wp-redirects.ts` (no longer redirect to `/#kontakt`) and regenerate `lib/wp-redirects.ts` — do not hand-edit the generated output.
- [x] 4.3 Update the URL-parity gate/fixtures so `/kontakt` is expected to resolve `200` (real page) instead of `301`.

## 5. Environment & docs

- [x] 5.1 Add `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `CONTACT_INBOX` to `.env.example` (with the Google Workspace app-password note) and set the real values in `.env.local` / Vercel envs.

## 6. Verification

- [x] 6.1 Typecheck + Biome clean (`bun run` project gates); no hardcoded copy in components.
- [ ] 6.2 Drive `/kontakt` in the browser: page renders 200 within site chrome, marquee animates, form validates (empty/invalid blocked), a valid submit shows success and delivers an email to `CONTACT_INBOX` with `Reply-To` set.
- [x] 6.3 Confirm graceful failure: with SMTP unset, a submit returns the error state and logs — no unhandled exception; and `/kontakt` returns 200 (no lingering 301) while the parity gate stays green.
