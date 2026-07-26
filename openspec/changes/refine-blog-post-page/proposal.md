## Why

The post template renders as a single centred column: meta, title, lead, a wide cover, a 70ch body, and an author card at the very bottom (`app/(frontend)/[slug]/page.tsx`, `post.module.css`). It reads as a document, not as a publication. Three things are missing that every editorial site the user benchmarked against provides: **orientation** (no table of contents, so a 9-minute post gives no map), **attribution up front** (the author is revealed only after the read, so it can't function as a trust signal), and **brand presence** (the page uses none of the plum grain stage language that carries the rest of the site).

Design direction was settled from mocks reviewed with the user (2026-07-26); the chosen post page is `post-final.html` in the session mock set, with the two author states in `rail-states.html`.

## What Changes

- **Header becomes a plum grain stage** — the homepage stage recipe (plum-dark→plum gradient, orange glow blob, feTurbulence grain at `.38 soft-light`), holding the breadcrumb, title, lead, and meta, with the cover image bleeding to the stage's bottom edge.
- **Sticky left rail** carrying the resolved author (avatar, name, role), a **table of contents** with scroll-spy, and share links. Desktop only; on mobile the TOC collapses above the body and the byline sits inline under the title.
- **Headings gain stable `id`s** and the TOC is built from the Lexical content server-side, so anchors and rail entries can never disagree.
- **Reading time** computed from the post content at render — no CMS field.
- **`authors` gains an optional `role`** (e.g. "Social media strategist"), shown in the rail and on the bottom card. Posts with no author keep resolving to the Social Lama organization, which renders as the lama mark on a plum disc labelled "Zespół redakcyjny" — a deliberate brand state, not a missing photo.
- **Mid-article CTA card** and a **newsletter slab**, both on the grain stage; the newsletter reuses the existing `mailchimpSubscriptionAction`.
- **"Czytaj dalej"** — three category-matched related posts at the end of the article.
- Post-page Payload reads are **serialized**, not parallelized, per the project's build-time DB concurrency constraint.

## Capabilities

### New Capabilities
<!-- none — this reshapes existing blog capabilities -->

### Modified Capabilities
- `blog-post-page`: the template gains the stage header, the sticky rail, the table of contents, reading time, the mid-article CTA, the newsletter slab, and related posts; the Lexical converter requirement is extended so headings carry anchors.
- `blog-authors`: authors gain an optional `role`; author identity is presented at the top of the post (rail) as well as the bottom card, and the organization fallback gains an explicit presented role.

## Impact

- **Payload**: one additive optional field (`authors.role`). Schema push + `payload-types.ts` regeneration. No post data migration.
- **New code**: `lib/blog/heading-slug.ts` (shared slugifier), `lib/blog/toc.ts` (Lexical heading walk), `lib/blog/reading-time.ts`, a client `Toc` component with scroll-spy, a `PostRail`, a related-posts query.
- **Modified**: `app/(frontend)/[slug]/page.tsx`, `rich-text.tsx` (heading converter), `post.module.css`, `author-card.tsx`, `lib/blog/author.ts` (carry `role`), `lib/payload/collections/authors.ts`.
- **Scope**: Polish only — the blog is not in the EN tree. No public author archive routes. Single author per post, unchanged.
- **Risk surface**: anchor/TOC drift (removed by construction, see design), Lenis fighting native in-page anchor scrolling, and the sticky rail's interaction with the fixed header offset.
