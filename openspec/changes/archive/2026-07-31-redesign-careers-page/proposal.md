# Redesign the careers page

## Why

`/zostan-lama` is the only page on the site that never got a design pass. It was
migrated from WordPress as long-form article content and still borrows the blog
post template's CSS module, which produces three problems:

1. **It is broken today.** The page applies `post.module.css`'s `.header` without
   the `.stage` class it was written to sit on. `.lead` is
   `color-mix(in srgb, var(--color-cream) 82%, transparent)` — cream text
   intended for the plum stage — so on the cream page ground the entire hook
   paragraph **and the application email address are invisible**. The same bug
   ships in the EN twin at `/en/become-a-lama`.
2. **It does not look like the rest of the site.** Every other route owns a
   scoped module and section components (`/kontakt` has seven files and 551
   lines of CSS; `/o-nas` composes six sections). `/zostan-lama` is a single
   247-line `page.tsx` with no styling of its own, so it reads as a blog post
   with a careers heading.
3. **Nothing links to it.** No header, footer, or overlay-menu entry references
   the route. It is reachable only from the sitemap, `llms.txt`, a legacy WP
   redirect, or a direct URL.

Both advertised roles are currently open, so the page is live recruitment
collateral whose only conversion path is a `mailto:` link that cannot be seen.

## What Changes

- **Rebuild `/zostan-lama` on the dark conversion layout** (reviewed direction
  C): outline/fill marquee hero, role tab panels, a full-bleed benefits band,
  and an application form as the closing section. Band order is
  `ink-deep → orange → plum-deep`, then the site footer.
- **Stop importing `post.module.css`.** The route gets its own
  `zostan-lama.module.css` and colocated section components, which removes the
  invisible-lead defect by construction in both locales.
- **Extract copy to `lib/content/zostan-lama.ts` + `.en.ts`**, matching the
  house content pattern and the translation-parity gate. Job content stops
  living as hardcoded JSX in two files kept in sync by hand.
- **Add a real application form** replacing the `mailto:` CTA: name, email,
  role select, message, CV attachment, and a recruitment consent checkbox.
  Reuses `/kontakt`'s Turnstile validation, rate limiting, and SMTP transport.
- **Deliver the CV as an email attachment** rather than introducing file
  storage — nodemailer already supports attachments and no CV needs to be
  retained server-side.
- **Raise `serverActions.bodySizeLimit`** in `next.config.ts`. The Next.js
  default is 1 MB, which would silently reject the CVs the form invites.
- **Generate a merged-union wordmark path** for the marquee, the same treatment
  `/kontakt` and the footer use, so tight Exo 2 tracking has no doubled strokes.
- **Link the page from the site footer** so it stops being an orphan.
- The page **ends on the submit button**; no sections follow the form.

Non-goals: per-role detail routes, a CMS-backed job collection, `JobPosting`
structured data, and an applicant-tracking integration. Copy stays in content
files with both roles open.

## Capabilities

### New Capabilities

- `careers-page`: the `/zostan-lama` and `/en/become-a-lama` route structure,
  section composition, band order, role panels, benefits band, and the
  requirement that the page not borrow another route's CSS module.
- `careers-application-form`: the application submission behaviour — required
  fields, role selection, CV attachment constraints, recruitment consent,
  Turnstile verification, delivery to the contact inbox, and the localized
  success/failure states.

### Modified Capabilities

- `site-footer`: the footer navigation gains a careers link, so the page is
  reachable from site chrome instead of only from the sitemap and redirects.

## Impact

**Rewritten**
- `app/(frontend)/zostan-lama/page.tsx` — recomposed from sections; drops the
  `post.module.css` import.
- `app/(frontend-en)/en/become-a-lama/page.tsx` — same, EN twin.

**New**
- `app/(frontend)/zostan-lama/zostan-lama.module.css` and colocated section
  components (hero, role panels, benefits band, application form).
- `lib/content/zostan-lama.ts`, `lib/content/zostan-lama.en.ts`.
- A careers server action alongside `lib/integrations/email/action.ts`.

**Modified**
- `next.config.ts` — `experimental.serverActions.bodySizeLimit`.
- `lib/content/home.ts` + `home.en.ts` — footer navigation entry.
- `lib/wordmark-paths.ts` and `lib/scripts/gen-wordmark.py` — new marquee path
  per locale.

**Reused unchanged**
- `lib/integrations/turnstile`, `lib/utils/form-action` (rate limit + Zod),
  `lib/integrations/email/transport.ts`, `components/ui/form`.

**Risk**
- The CV attachment is the only genuinely new server-side surface: size cap,
  MIME allowlist, and body-limit configuration all have to hold together, and
  an oversized upload must fail with a readable message rather than a generic
  action error.
- Recruitment consent is a legal requirement the current `mailto:` flow does
  not collect; its wording must be reviewed before launch.
