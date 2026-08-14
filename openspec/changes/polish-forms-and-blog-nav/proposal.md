# polish-forms-and-blog-nav

## Why

Three small UX/compliance gaps reported by the user (2026-08-14): blog posts have breadcrumbs but no quick "back to the hub" affordance; the contact form collects personal data with only a passive RODO paragraph — no explicit, required consent action (the careers form already has one, the contact form does not); and the contact form's step numbers (`01 —`, `02 —` …) render in muted mauve `#8f838b` on the dark plum stage, too low-contrast to read as the wayfinding device they are.

## What Changes

- **Blog post back link**: every blog post page gets a "← Blog" back link in the top-left of the header stage, above/alongside the existing breadcrumbs (which stay). It lands in the shared `PostArticle` component, so both locales get it: PL links to `/blog`, EN to `/en/blog`, with locale-appropriate copy from the existing content files.
- **Contact form consent checkbox**: the contact form (`/kontakt`, `/en/contact`) gets a required consent checkbox following the pattern already proven in the careers form (`ConsentField`, `z.literal('on')` server-side). Submission fails validation — client and server — unless it is checked. The existing static `privacyNote` paragraph is replaced by (or folded into) the checkbox label. The careers form is **out of scope**: it already enforces required consent.
- **Contact form step-number visibility**: the CSS-counter field labels in the contact form switch from `--muted` (`#8f838b`) to cream (`var(--color-cream)`-based), matching how the careers form and other dark-stage sections color their labels.

## Capabilities

### New Capabilities
- `contact-form`: the `/kontakt` + `/en/contact` contact form — required consent to submit, and legible (cream) numbered field labels on the plum stage. (The form pre-exists but had no spec; this creates one scoped to these requirements.)

### Modified Capabilities
- `blog-post-page`: new requirement — the post header carries a locale-aware "← Blog" back link to the blog hub, in addition to the breadcrumbs.

## Impact

- `app/(frontend)/[slug]/post-article.tsx` + `post.module.css` — back link markup/styles (shared by PL root-level posts and `/en/blog/[slug]`); copy additions in `lib/content/blog.ts` / `blog.en.ts`.
- `app/(frontend)/kontakt/contact-form.tsx` — consent checkbox (careers `ConsentField` pattern), replacing the static privacy paragraph at :177-183.
- `lib/integrations/email/action.ts` — extend `buildContactSchema` with `consent: z.literal('on')` + per-locale error message.
- `lib/content/contact.ts` / `contact.en.ts` — consent label + error copy (reuse/adapt the careers wording from `lib/content/zostan-lama.ts`).
- `app/(frontend)/kontakt/kontakt.module.css` — label color at :160-167 (and consent checkbox styles, mirroring `zostan-lama.module.css:582-649`).
- No schema/DB changes, no new dependencies, no breaking changes. Existing kontakt e2e spec (`e2e`) may need the consent checkbox ticked in its submit flow.
