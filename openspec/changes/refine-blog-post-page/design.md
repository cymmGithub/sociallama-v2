## Context

Posts render at `/{slug}` through `app/(frontend)/[slug]/page.tsx`, with Lexical content converted in `rich-text.tsx` and all styling in `post.module.css`. The current template is a centred stack: meta → title → lead → cover → body (70ch) → author card. `resolvePostAuthor()` (`lib/blog/author.ts`) already normalizes person-vs-organization attribution and feeds both the presentation and the `BlogPosting` JSON-LD, so attribution logic does not need to change — only its presentation.

The plum grain stage recipe exists three times already (`services.module.css`, `why-that-works.module.css`, `how-it-works.module.css`), duplicated per house convention with a comment instructing manual sync. The homepage NewsLAMA section already wires `mailchimpSubscriptionAction` (`lib/integrations/mailchimp/action.ts`).

Direction was chosen from mocks: header treatment and CTA styling per `post-final.html`, author states per `rail-states.html`.

## Goals / Non-Goals

**Goals:**
- A post page with a grain-stage header, a sticky TOC + share rail, and brand-consistent CTA and newsletter blocks.
- A table of contents whose links can never point at anchors that don't exist.
- Reading time with no new CMS field.
- An organization-authored post that looks deliberate, since that is ~78 of 79 posts today.

**Non-Goals:**
- No cover art direction (tracked separately). No EN blog. No public author archive routes. No multiple authors per post. No analytics. No change to post URLs, metadata, or JSON-LD shape.

## Decisions

**1. The server computes every heading slug exactly once; the converter only consumes them.**
This is the load-bearing decision. The naive design has two independent slugifiers — one in the heading converter emitting `<h2 id>`, one in the TOC builder — which drift silently the moment collision handling or diacritic folding differs, producing links that scroll nowhere with no error anywhere.

Instead `buildToc(content)` walks the serialized Lexical state once and returns `{ level, text, slug }[]` in document order. The page passes that array into `PostRichText`, which holds an index counter and assigns `toc[i].slug` to the *i*-th heading it renders. The converter never calls the slugifier. Drift becomes structurally impossible rather than merely tested-against.

*Why not match on Lexical node keys:* serialized keys are not guaranteed stable across saves.
*Fallback:* if the renderer somehow emits more headings than the walk found, the surplus falls back to `slugifyHeading(text)` — a degraded anchor is better than a crash.

**2. `slugifyHeading` folds Polish diacritics and de-duplicates.**
`Co sprawdzamy?` → `co-sprawdzamy`; `Ile to kosztuje` appearing twice → `ile-to-kosztuje`, `ile-to-kosztuje-2`. NFD-normalize, strip combining marks, map `ł` explicitly (it has no combining decomposition), lowercase, collapse non-alphanumerics to `-`, trim. Only ever called from the walk.

**3. TOC includes `h2` and `h3` only.**
`h4` is rare in the imported WordPress content and a three-level rail becomes a wall. `h3` entries indent. Posts with fewer than three headings render no TOC box at all — a two-item table of contents is noise.

**4. Scroll-spy is a small client component; anchor clicks go through Lenis.**
`IntersectionObserver` over the rendered heading elements with a top root-margin equal to the header offset, marking the last heading above the fold as `aria-current="true"`. Because Lenis drives page scrolling, native hash-jump and `scroll-behavior: smooth` fight it; anchor clicks call `lenis.scrollTo(target, { offset })` and `history.replaceState` the hash instead of relying on default navigation. Headings still carry `scroll-margin-top` for no-JS and direct-URL landings.

**5. One local `.stage` class, used three times within `post.module.css`.**
The header, the mid-article CTA, and the newsletter slab all use the same recipe. Rather than adding a fourth cross-module copy of the gradient/blob/grain block, the recipe is written once inside `post.module.css` and applied to three elements. House convention (duplication across sections) is preserved at the module boundary; it is not duplicated *within* the module.

**6. The organization fallback is designed, not defaulted.**
With "named authors going forward only", the org state is the default view of the archive. The author card renders the lama mark on a plum disc with the role line "Zespół redakcyjny", so it reads as a brand byline rather than a person whose photo failed to load. `resolvePostAuthor` gains a `role?` field; the org default supplies it as a constant.

The mark is drawn as a CSS mask filled with cream, not as an image: `icon.png` is a *plum* lama on transparency, so painting it onto the plum disc would be plum-on-plum and all but vanish. Same reversed-logo technique as the footer's social row.

**6a. One attribution surface (revised 2026-07-26).**
An earlier revision of this design also put the author at the top of the rail, to make attribution a pre-read trust signal. Dropped at the user's direction: it printed the same three fields twice on one page, and on the organization default — ~78 of 79 posts — it duplicated a brand the site header already carries. The card after the body is the only place a post presents its author, so the rail is pure utility.

**7. Reading time = words / 200, minimum 1 minute.**
Walks Lexical text nodes, counts whitespace-delimited tokens. 200 wpm is a reasonable Polish prose rate. Computed at render — storing it would let it drift from edited content.

**8. Post-page queries are serialized.**
The page already loads the post; it now also needs related posts. Per the project's build-time DB constraint, these must not be `Promise.all`'d during static generation — the parallel prod Neon build times out. Related posts are fetched after the post resolves (they depend on its category anyway) and fail soft: on error, the "Czytaj dalej" section is omitted rather than failing the page.

**9. Related posts match on category, then backfill with newest.**
Three posts, current post excluded. If the category yields fewer than three, top up with the newest published posts. Mirrors the matching approach already used for service pages in `lib/payload/related-posts.ts`.

**10. Mobile drops the rail rather than shrinking it.**
Below the desktop breakpoint the layout is a single column: TOC as a collapsed `<details>` above the body, share links after the body, author card at the end as everywhere else. A 238px sticky rail has nowhere to live on a phone, and a horizontally-scrolling TOC is worse than a collapsed one.

## Risks / Trade-offs

- **Lenis vs. in-page anchors** → Anchor handling is explicit (decision 4) rather than relying on browser defaults; verify both click-through and a direct `/{slug}#heading` load.
- **Sticky rail + fixed header** → `top` must be `header-height + gap`; verify the rail doesn't slide under the header and that a rail taller than the viewport still scrolls to its end.
- **Three grain stages on one page could read as striped** → Reviewed in the mock and accepted (user decision): the CTA sits inside the text measure rather than full-bleed, and each stage's orange blob lands in a different position, so they read as rhythm. Re-check after real content lands.
- **Posts with no headings** → TOC box is omitted; the rail then holds the share links alone. With the byline gone (D6a) that column is thin, and the share row must still read as placed rather than stranded.
- **`scroll-margin-top` and the reveal animations** → the site uses scroll-reveal wrappers; a heading revealed on scroll must still be an accurate observer target. Verify spy accuracy on a long post.

## Migration Plan

Additive only: one optional Payload field plus front-end work. Deploy order is (a) add `authors.role`, push schema, regenerate types; (b) ship the template. No content migration — existing posts render with the organization fallback until an editor assigns an author. Rollback is a code revert; the `role` column can remain unused.

## Open Questions

- ~~Role strings for the team members who will be assigned as authors~~ — resolved: "Specjalista SEO, SEOFLY" for Łukasz Płociński. The seed fills a missing `role` on an existing record so the string reaches an already-seeded DB.
- Whether the mid-article CTA is editable per post or a single site-wide block. The mock shows one fixed CTA; treating it as static is the smaller change and can be revisited if editors want per-post offers.
