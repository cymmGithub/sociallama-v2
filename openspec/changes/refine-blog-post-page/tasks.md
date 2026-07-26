## 1. Author data model

- [ ] 1.1 Add an optional `role` field (text, label "Rola / stanowisko") to `lib/payload/collections/authors.ts`, with an admin description explaining it appears in the post rail and on the author card.
- [ ] 1.2 Push the schema and regenerate `payload-types.ts`; confirm `Author.role` exists.
- [ ] 1.3 Extend `ResolvedAuthor` in `lib/blog/author.ts` with `role?`; carry `author.role` through for people, and supply a constant house role ("Zespół redakcyjny") for the `SOCIAL_LAMA` default.

## 2. Table of contents and anchors

- [ ] 2.1 Create `lib/blog/heading-slug.ts` exporting `slugifyHeading(text, seen)`: NFD-normalize, strip combining marks, map `ł`→`l` explicitly, lowercase, collapse non-alphanumerics to `-`, trim, and de-duplicate against `seen` with a numeric suffix.
- [ ] 2.2 Create `lib/blog/toc.ts` exporting `buildToc(content)`: walk the serialized Lexical state in document order, collect `h2`/`h3` nodes, and return `{ level, text, slug }[]`. This is the only caller of `slugifyHeading`.
- [ ] 2.3 Extend `PostRichText` (`app/(frontend)/[slug]/rich-text.tsx`) to accept the `toc` array, hold a per-render heading index, and add a `heading` converter that assigns `toc[i].slug` as the element `id`. Surplus headings fall back to computing a slug from their own text.
- [ ] 2.4 Verify on a real post that every emitted heading `id` has exactly one matching TOC entry and vice versa.

## 3. Reading time

- [ ] 3.1 Create `lib/blog/reading-time.ts`: walk Lexical text nodes, count whitespace-delimited tokens, divide by 200 words/minute, round, clamp to a minimum of 1.
- [ ] 3.2 Render the result in the header meta with a clock icon (lucide) beside the publish date.

## 4. Post rail

- [ ] 4.1 Build the client `Toc` component: renders the entry list, indents `h3` entries, tracks the active section with `IntersectionObserver` using a top root-margin equal to the header offset, and marks the active entry `aria-current="true"`.
- [ ] 4.2 Route anchor activation through Lenis — `lenis.scrollTo(target, { offset })` plus `history.replaceState` — rather than native hash navigation, so in-page jumps don't fight the smooth-scroll driver. Keep `scroll-margin-top` on headings for no-JS and direct-anchor landings.
- [ ] 4.3 Build `PostRail`: author block (avatar, name, role), the `Toc` (omitted entirely when fewer than three entries), and share links for LinkedIn, Facebook, and copy-link — lucide icons, each with an accessible name.
- [ ] 4.4 Style the rail sticky at `header-height + gap`; confirm it never slides under the fixed header and that a rail taller than the viewport scrolls to its end.

## 5. Template and stage treatment

- [ ] 5.1 Define the plum grain stage recipe once in `post.module.css` (plum-dark→plum gradient, orange radial blob, feTurbulence grain at `.38 soft-light`, contents lifted above the grain), matching the homepage stage modules.
- [ ] 5.2 Rebuild the header as a stage: breadcrumb, title, lead, meta on the left; cover contained on the right, bleeding to the stage's bottom edge. Handle the no-cover case with no empty media box.
- [ ] 5.3 Rebuild the article layout: rail column plus body column, centred as a block, body measure ~68ch.
- [ ] 5.4 Add the in-article CTA card on the stage treatment, sized to the text measure rather than full-bleed.
- [ ] 5.5 Add the newsletter slab on the stage treatment, wired to `mailchimpSubscriptionAction`; render success and error states, preserving the entered address on failure.
- [ ] 5.6 Update `AuthorCard` to show the role line; render the organization mark contained on a plum disc rather than cover-cropped.
- [ ] 5.7 Mobile layout: no rail — byline under the title, TOC as a collapsed `<details>` above the body, share links after the body.

## 6. Related posts

- [ ] 6.1 Add a related-posts query: up to three published posts sharing the current post's category, excluding the current post, topped up with newest published posts when the category is sparse.
- [ ] 6.2 Fetch it after the post resolves — not in a `Promise.all` with other Payload reads — per the project's build-time DB concurrency constraint, and fail soft by omitting the section on error.
- [ ] 6.3 Render the "Czytaj dalej" section using the existing card language.

## 7. Verify

- [ ] 7.1 `bunx biome check --write` on changed files and `bunx tsc --noEmit`; both clean (filter Biome's known `module_resolver` panic with `--diagnostic-level=error`).
- [ ] 7.2 Click every TOC entry on a long post and confirm each lands on its heading clear of the fixed header; then load `/{slug}#heading` directly and confirm the same.
- [ ] 7.3 Scroll a long post and confirm the active TOC entry tracks the section actually on screen.
- [ ] 7.4 Screenshot-verify against the agreed mock (`post-final.html`) at desktop and mobile widths, including a post with no cover and a post with fewer than three headings.
- [ ] 7.5 Confirm an unauthored post shows the organization rail state as designed (`rail-states.html`, right column) — contained lama mark on a plum disc, house role line.
- [ ] 7.6 Confirm `BlogPosting` JSON-LD is unchanged for both a person-authored and an organization-authored post.
- [ ] 7.7 Verify reduced-motion and keyboard paths: visible focus on rail links and TOC entries, and no motion-dependent behaviour required to read the article.
