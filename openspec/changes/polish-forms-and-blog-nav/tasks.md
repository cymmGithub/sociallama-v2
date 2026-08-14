# Tasks — polish-forms-and-blog-nav

## 1. Blog post back link

- [ ] 1.1 Add back-link copy (label + aria) to `lib/content/blog.ts` and `lib/content/blog.en.ts`, and back-link hub hrefs where the post content/config is assembled (PL `/blog`, EN `/en/blog`)
- [ ] 1.2 Render the back link in `app/(frontend)/[slug]/post-article.tsx` as the first element inside the header stage, above the breadcrumb nav: `next/link` + lucide `ArrowLeft` + label (no raw `←` glyph)
- [ ] 1.3 Style it in `app/(frontend)/[slug]/post.module.css` — crumbs-like uppercase recipe at full-strength cream, left-aligned; verify it doesn't collide with the breadcrumbs on mobile widths
- [ ] 1.4 Verify on dev: a PL post (root-level slug) links to `/blog`, the same post at `/en/blog/{slug}` links to `/en/blog`, breadcrumbs unchanged

## 2. Shared ConsentField extraction

- [ ] 2.1 Move the careers `ConsentField` (`app/(frontend)/zostan-lama/careers-form.tsx:83-135`) to `components/ui/form/consent-field.tsx`, parametrized by className hooks (group/box/label/error) — keep the `setFieldValidity` rationale comment with it
- [ ] 2.2 Swap the careers form to the shared import (both usages: required consent + optional marketing consent); no behavior change — verify `/zostan-lama` submits exactly as before

## 3. Contact form consent

- [ ] 3.1 Add consent label + error copy to `lib/content/contact.ts` (derive from the existing `privacyNote` RODO text) and `lib/content/contact.en.ts` (clean legal EN, not playful); remove the `privacyNote` key if nothing else consumes it
- [ ] 3.2 Extend `buildContactSchema` in `lib/integrations/email/action.ts` with `consent: z.literal('on')` + per-locale error message (mirror `careers-schema.ts:73`)
- [ ] 3.3 Render the required `ConsentField` in `app/(frontend)/kontakt/contact-form.tsx`, replacing the static privacy paragraph at :177-183; add consent styles to `kontakt.module.css` mirroring `zostan-lama.module.css:582-649`
- [ ] 3.4 Verify both directions on dev: unchecked box blocks submit with the localized error (PL and EN pages); checked box submits; a curl/manual server-action payload without `consent=on` is rejected server-side

## 4. Contact form step-number visibility

- [ ] 4.1 Change `.formShell .field label` color in `app/(frontend)/kontakt/kontakt.module.css` (:160-167) from `var(--muted)` to `color-mix(in srgb, var(--color-cream) 72%, transparent)`; confirm the `::before` counter inherits and the orange asterisk is untouched
- [ ] 4.2 Screenshot the form on the plum stage and eyeball number legibility against the careers form's labels

## 5. Tests & verification

- [ ] 5.1 Update the kontakt e2e spec to tick the consent checkbox in its submit flow; add an assertion that submit is blocked while unchecked (don't confuse a consent failure with the standing :55 CI flake)
- [ ] 5.2 Run the locale-parity test — new content keys must exist in both locales for blog and contact
- [ ] 5.3 Full check: `bun run check` + e2e from the worktree; visually verify in WebKit as well as Chromium (Safari is not optional)
