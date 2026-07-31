## 1. Content extraction

- [x] 1.1 Create `lib/content/zostan-lama.ts` with meta, hero lede, the two open
      roles (profile / responsibilities / requirements), the benefits list, form
      labels, the recruitment-consent clause, and status messages
- [x] 1.2 Create `lib/content/zostan-lama.en.ts` with the same shape, each block
      `satisfies LocalizedCareers['<key>']`
- [x] 1.3 Register the careers content in the translation-parity gate and confirm
      a deliberately removed English key fails the check
- [x] 1.4 Write real English copy for every string — no Polish placeholders left
      to satisfy the shape (design: Risks)

## 2. Shared form kit

- [x] 2.1 Add `SelectField` to `components/ui/form/fields`, matching the existing
      fields' prop shape, label and error rendering (design D8)
- [x] 2.2 Add `FileField` with an accept allowlist and a client-side size check
      that reports a readable message before submit (design D5, layer 1)
- [x] 2.3 Cover both fields in the form-kit tests alongside the existing field
      tests

## 3. Server action and runtime limits

- [x] 3.1 Set `experimental.serverActions.bodySizeLimit` to 6 MB in
      `next.config.ts`, with a comment explaining that the 1 MB default rejects
      in-cap CVs before the action runs (design D5, layer 2)
- [x] 3.2 Create `sendCareersApplication` beside `lib/integrations/email/action.ts`:
      Turnstile first, then `runFormAction` with a careers-specific rate-limit
      key and per-locale Zod schema (design D7)
- [x] 3.3 Validate the attachment in the schema — PDF/DOCX by declared MIME and
      extension, 5 MB ceiling — with distinct type and size errors (design D5
      layer 3, D6)
- [x] 3.4 Reject submissions whose role value is not an open role or the
      spontaneous option
- [x] 3.5 Require the consent field and attribute its failure to that control
- [x] 3.6 Deliver to `CONTACT_INBOX` with the applicant as reply-to, the role in
      the subject, and the CV as a nodemailer attachment; persist nothing
      (design D4)
- [x] 3.7 Return a failure state when `getEmailTransport()` resolves to `null`,
      never a success toast (design: Risks)
- [x] 3.8 Unit-test the schema: valid application, oversized attachment, wrong
      MIME, unknown role, missing consent

## 4. Page sections

- [x] 4.1 Create `app/(frontend)/zostan-lama/zostan-lama.module.css` and delete
      the `post.module.css` import from the route (design D1)
- [x] 4.2 Build the marquee hero: `sr-only` h1, `aria-hidden` counter-scrolling
      rows, lede with the response-time promise, honouring
      `prefers-reduced-motion`
- [x] 4.3 Build the role panels — tablist semantics, one panel visible, keyboard
      operable, driven by the content file's role array
- [x] 4.4 Build the benefits band on the orange ground with lucide icons, placed
      between the role panels and the form (design D2)
- [x] 4.5 Build the application form section on the deep-plum ground, wired to
      `sendCareersApplication`, with the Turnstile widget and toast handling
      mirroring `/kontakt`
- [x] 4.6 Compose `page.tsx` from the sections; confirm the form is the last
      content section with only the footer below (design D3)

## 5. Marquee wordmark

- [x] 5.1 Generate merged-union paths for `ZOSTAŃ LAMĄ` and `BECOME A LAMA` via
      `lib/scripts/gen-wordmark.py` (design D9)
- [x] 5.2 Add both to `lib/wordmark-paths.ts` and use them for the outline row
      instead of stroked live text
- [x] 5.3 Verify at 1440px and 390px that no glyph crossing shows a doubled
      stroke

## 6. English twin

- [x] 6.1 Rewrite `app/(frontend-en)/en/become-a-lama/page.tsx` to compose the
      same sections from the English content file
- [x] 6.2 Confirm locale alternates resolve both ways via `alternatesForPath`
- [x] 6.3 Confirm the English form returns English validation and status
      messages

## 7. Verification

- [x] 7.1 Confirm no `.module.css` from another route is imported by either
      careers route
- [x] 7.2 Measure contrast on the hero lede and its links in both locales —
      at least 4.5:1, the defect this change exists to fix
- [~] 7.3 Submit end to end with a 4.9 MB PDF and confirm it arrives as an
      attachment; repeat at 5.1 MB and confirm a readable size error, not a
      runtime failure
      — 5.1 MB: readable size error, never sent. 4.9 MB: reaches the action
      (POST 200, `sendCareersApplication` entered), so the 6 MB body limit
      holds. Delivery itself is UNVERIFIED — no SMTP configured locally, so the
      action correctly returns its failure state instead. Re-run once
      SMTP_*/CONTACT_INBOX are set (task 9.2).
- [x] 7.4 Confirm the careers rate limit does not consume the contact form's
      budget from the same IP
- [x] 7.5 Add `e2e/zostan-lama.e2e.ts` alongside `e2e/kontakt.e2e.ts` covering
      role switching, validation errors, and a successful submit
- [x] 7.6 Screenshot both locales at 1440px and 390px and check band order,
      the page ending on the form, and no horizontal overflow
- [x] 7.7 Run `bun run check`

## 8. Wire-up (last)

- [x] 8.1 Add the careers entry between CASE STUDIES and KONTAKT in the footer
      NAWIGACJA column in `lib/content/home.ts` and `home.en.ts` (design D10)
- [x] 8.2 Add the careers entry to the overlay menu's utility list, directly
      after CASE STUDIES, in both locales (user decision, design D10 revised —
      supersedes "keep it out of the menus"); the header still does not link it
- [x] 8.3 Confirm `/zostan-lama` and `/en/become-a-lama` remain in the sitemap
      and `llms.txt`, and the legacy WP redirect still resolves

## 9. Before launch

- [x] 9.1 Get the recruitment-consent clause reviewed and replace the draft
      wording (design: Open Questions)
      — superseded: the client supplied both clauses verbatim (required
      contact-back consent + optional marketing consent). The drafted wording
      was replaced, not reviewed.
- [x] 9.2 Decide whether applications copy a second recipient or go to
      `CONTACT_INBOX` alone (design: Open Questions)
      — resolved: a separate `CAREERS_INBOX`, not a copy (design D14). The
      value still has to be set in Vercel; unset falls back to CONTACT_INBOX
      with a warning.
