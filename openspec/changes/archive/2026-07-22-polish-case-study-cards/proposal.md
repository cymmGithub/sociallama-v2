## Why

The `/case-studies` listing cards under-sell the work. Each card names the client as a small uppercase text label (`IROBOT`, `VOLVO CAR WARSZAWA & DOM VOLVO`) and shows nothing about what the study is *about* — a visitor scanning the grid can't tell the automotive case from the recruitment case without reading each title and excerpt. Two pieces of data that would fix this are **already on the card's prop and simply unused**: `study.client.logo` (a seeded Media upload) and `study.tags` (a seeded `string[]`, e.g. Volvo → *Motoryzacja premium · Elektromobilność · Bezpieczeństwo*). The detail page already renders both; the listing throws them away.

This is a **presentation-only polish**: surface the real brand logo in place of the name text, and add the study's topic tags to each card. No schema, migration, seed, or query change — `getCaseStudies()` already runs at `depth: 2`, so the resolved logo URL and the tags array are present on every `study` the card receives.

## What Changes

- **Brand logo replaces the client-name text.** `case-study-card.tsx` renders `study.client.logo` as an `<Image>` in a fixed-height, `object-fit: contain`, left-aligned slot (so wide wordmarks and compact badges share one baseline), with `alt` = `study.client.name`. The client name is **kept as a visually-hidden span** so it stays crawlable and screen-reader-announced — replacing it with an image must not regress SEO or a11y.
- **Graceful fallback to text.** When a study has no `client.logo`, the card renders the client name as text exactly as today. Nothing breaks for a logo-less study.
- **Topic tags on the card.** The card renders `study.tags` (all of them — each study has three) as a wrapping row of pills below the excerpt, reusing the detail page's tag visual language (duplicated into the listing CSS module per the repo's per-route-module house style). The block is omitted when `tags` is empty.

Explicitly **out of scope** (see Non-Goals): the per-study detail page, the collection schema, tag filtering/interactivity, and any change to which studies appear or their order.

## Capabilities

### Modified Capabilities
- `case-studies`: The listing cards SHALL present the client's brand logo in place of the client-name text (with the name preserved as an accessible/crawlable label and a text fallback when no logo exists) and SHALL display the study's topic tags.

## Non-Goals

- **No detail-page changes.** `/case-studies/[slug]` already shows logo + tags; it is untouched.
- **No schema/seed/migration/query change.** The data is already fetched. This is purely how the card renders it.
- **No tag interactivity.** Tags are decorative labels on the card, not filters or links — no listing-level filtering is introduced.
- **No change to card selection or ordering.** The same published studies render in the same order.

## Impact

- **Modified code**:
  - `app/(frontend)/case-studies/case-study-card.tsx` — render the logo (with hidden name + text fallback) and the tag row.
  - `app/(frontend)/case-studies/case-studies.module.css` — logo-slot styles; tag-row + pill styles.
- **New code**: none (no new component or content module — copy comes from CMS data).
- **Reused**: `components/ui/image` `Image`, the existing `study` prop from `getCaseStudies()` (`depth: 2`), the detail page's tag visual pattern.
- **No new dependencies, no new env vars, no data-layer change.**
- **Verification risk to check at apply time**: the three seeded logos (iRobot, Pracuj.pl, Volvo PNGs) must read on the card surface (`--surface-2`); a white-knockout logo would vanish. Pixel-check each rendered card before sign-off. Also confirm the three mid-length Polish tags wrap cleanly on a ~33vw card without breaking the card rhythm.
- **Sequencing note**: modifies the `case-studies` capability, whose baseline spec is **already promoted** to `openspec/specs/case-studies/spec.md` (the `sl-case-studies` stream merged and archived). So this is a clean single delta — no pending baseline to reconcile, unlike the kontakt stream. File-disjoint from the two in-flight streams (hero, kontakt); no Payload schema change, so the shared dev DB is safe.
