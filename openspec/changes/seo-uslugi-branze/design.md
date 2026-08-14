# Design: seo-uslugi-branze

## Context

v2 is pre-production, so all changes ship with launch. The services section is
driven by a canonical seven-entry list in `lib/content/uslugi.ts` (+ EN twin)
consumed by the mega-menu, homepage services tabs, the `/uslugi` index, the
`[slug]` route, and the morph-transition animation. Repo tests enforce
locale parity and orphan coverage over content modules. Legacy WP redirects
live in `lib/wp-redirects.ts` (static config consumed by `next.config.ts`).
Senuto data motivating the change is summarized in `proposal.md`.

## Goals / Non-Goals

**Goals:**

- Ship the "prowadzenie social media" landing without perturbing the
  seven-service brand architecture or its animations.
- Metadata-only sharpening of 3 service + 2 industry pages.
- One source of truth for the starting price shown in the home FAQ and the
  landing.

**Non-Goals:**

- Blog-post refreshes (separate post-launch content task, done in Payload).
- Any visual/layout redesign of existing pages.
- EN-market SEO (EN pages get parity content, not keyword targeting).
- The remaining ten industry pages.

## Decisions

- **Landing lives in a separate `seoLandings` export, not the roster.**
  Alternative considered: add an eighth roster entry with an `inNav: false`
  flag. Rejected — every roster consumer (menu, home tabs, morph transition,
  footer) would need a filter, and one missed filter leaks the landing into
  navigation. A separate export means nav surfaces cannot regress; only the
  `[slug]` route, the `/uslugi` index, and the sitemap opt in by reading
  roster ∪ landings. The landing reuses the existing section-primitive types
  so the page template needs no new rendering code.
- **Same locale-pairing mechanism as services** (`id` = PL slug, `pairSlug`
  for hreflang), so `locale-parity` and `orphan-coverage` tests extend
  naturally rather than being special-cased.
- **Price constant extracted** to a shared content module and interpolated
  into both the home FAQ answer and the landing's pricing section — the spec
  requires the figures to match, so they must be the same value, not a copy.
- **FAQ JSON-LD via the existing `FaqJsonLd` component**, fed from the same
  array that renders the visible FAQ (same pattern as the homepage).
- **Metadata edits via the existing `pairMetadata` builder** — titles and
  descriptions change in the content modules only.
- **Redirect retarget is a destination edit** in `lib/wp-redirects.ts`; the
  rule shape and the bare `/oferta` entry stay as-is.

## Risks / Trade-offs

- [Landing content is thin at launch → could rank poorly] → the cluster's
  competition is weak (no strong dedicated page in the SERP today); pricing
  concreteness + FAQ targets the `featured_answer` slot observed in the SERP.
- [Tests hardcode seven services or enumerate slugs] → extend fixtures per
  the delta specs (roster stays seven; landing asserted separately).
- [Draft copy ships unapproved] → tasks gate launch-facing copy on
  content-team approval, consistent with existing copy-approval requirements.
- [Redirecting `/oferta/*` to the landing instead of per-platform pages loses
  platform specificity] → accepted: v2 has no per-platform pages, and the
  landing is the closest topical successor; better than a homepage anchor.

## Migration Plan

Pre-production: no data migration. Rollback is a straight revert of the
change's commits. The redirect retarget only takes effect at cutover, when
the sitemap parity gate re-verifies every `/oferta/*` target resolves.

## Open Questions

- Final EN slug (`social-media-management` proposed) — confirm with content
  team alongside copy approval.
