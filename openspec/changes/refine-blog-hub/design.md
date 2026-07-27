## Context

`/blog` renders through `BlogListing` (`app/(frontend)/blog/listing.tsx`), which is shared by three routes: the hub (`app/(frontend)/blog/page.tsx`), paginated pages (`app/(frontend)/blog/page/[number]/page.tsx`), and category pages (`app/(frontend)/category/[category]/page.tsx`). It renders a heading, category pills, a `PostCard` grid, and `Pagination`. The `posts` collection has no notion of prominence, and there is no analytics pipeline anywhere in the repo.

`app/(frontend)/blog/page.tsx:13` currently runs `Promise.all([getPostsPage(1), getCategories()])`, which conflicts with the project's build-time DB concurrency constraint (parallel Payload reads during static generation time out against the production Neon instance).

Direction was chosen from `listing-curated.html` in the session mock set, with the video treatment settled as the single-spotlight shape from `video-spotlight.html`.

## Goals / Non-Goals

**Goals:**
- Let an editor say what matters, in one place, without touching individual posts.
- A hub whose first screen carries editorial signal instead of reverse-chronological order.
- Surface the YouTube channel without paying for an embedded player.
- Make 79 posts findable without building search infrastructure.

**Non-Goals:**
- No analytics-driven "popular". No embedded video player. No cover art direction. No EN blog. No change to category pages, pagination rules, post URLs, or the sitemap. No new routes.

## Decisions

**1. One global, not flags on posts.**
The four editorial slots live on a `blog-hub` Payload global rather than as booleans on `posts`. Flags on posts make it possible to mark three posts as featured with nothing to arbitrate, give no control over ordering, require scanning all posts to answer "what is featured right now", and push hub concerns into every post's edit form. A global gives ordering for free (array position), makes conflicting states unrepresentable, and puts curation on one screen.

*Superseded:* an earlier working note proposed a `popular` boolean on `posts`. Once the hub needed four coordinated slots, that shape stopped holding.

**2. Every slot fails soft, and the hub is always correct.**
Editors will leave slots empty — on day one, all of them.

| Slot | Empty behaviour |
|---|---|
| `featured` | Falls back to the newest published post |
| `picks` | Falls back to the next four newest, excluding whatever is featured |
| `popular` | The most-read block is omitted; the short list beside it widens |
| `video` | The whole spotlight section is omitted |

A stale or broken slot is worse than an absent one, so nothing renders a placeholder.

**3. No duplicate suppression between the slots and the grid.**
The featured, picked, and most-read posts still appear in "Wszystkie wpisy". Excluding them would make page 1 hold a different number of posts than every other page, break the pagination arithmetic, and mean a post silently vanishes from the archive when an editor features it. The benchmark repeats them too. The grid is the complete archive; the slots are a reading order laid over it.

**4. Search is a client-side filter over a shipped index.**
79 posts of `{ slug, title, excerpt, category }` is roughly 16KB — smaller than a single cover thumbnail. A backend search index, a search route, or a third-party service would all cost more than the problem.

Matching folds diacritics on both sides (NFD-normalize, strip combining marks, map `ł` explicitly), so `wpisow` matches `wpisów` and `lodz` matches `Łódź`. While a query is active the grid shows all matches with pagination hidden — paginating a filtered result set means either re-deriving page boundaries client-side or navigating, and neither earns its complexity at this scale. Clearing the query restores page 1.

**5. `BlogListing` splits by responsibility, not by flag.**
The magazine furniture is specific to `/blog` page 1. Rather than threading a `variant` prop through the shared component, the existing component keeps its job as the plain grid listing (used by category pages and paginated pages), and `/blog` composes the hub from sections plus that same listing for its grid. Passing a mode flag would make one component responsible for two unrelated layouts.

**6. The video spotlight links out and says so.**
No iframe: the section is a poster, a play badge, copy, and an outbound link. This keeps the hub free of third-party requests and YouTube cookies, and avoids the consent question entirely. Because activating it leaves the site, the affordance is explicit — a play badge on the poster, an external-link icon on the action, and `target="_blank" rel="noopener"`.

Posters are uploaded to Payload rather than pulled from `i.ytimg.com`. It costs the editor one extra step per video but keeps art control over a prominent block, and avoids depending on `maxresdefault.jpg`, which is not always present and fails silently when absent.

*Accepted trade-off:* this is the one section on the hub that sends readers away from the blog. Raised during review and chosen deliberately — surfacing the channel is the point.

**7. Hub reads are serialized and the existing `Promise.all` goes.**
The hub needs the global, the featured/picks/popular posts, the first page of posts, and the categories. Under the project's build-time DB constraint these must run in sequence during static generation. The pre-existing `Promise.all` in `app/(frontend)/blog/page.tsx` is removed as part of this work rather than left as a latent build failure that the extra queries would make more likely.

**8. Nothing about SEO changes.**
`/blog` keeps its canonical URL, metadata, and indexability. The featured post is a link to the same `/{slug}` as its grid card. The video spotlight links off-site and needs no schema. Search is a client-side filter with no crawlable URLs, so no new indexable surface is created.

## Risks / Trade-offs

- **Editors never fill the slots** → The hub still renders correctly by decision 2, but it also reverts to looking chronological. Mitigation: the admin screen groups all four slots together with descriptions, so the curation surface is obvious.
- **The featured cover exposes cover-photo inconsistency** → Known and accepted; the featured slot enlarges one migrated stock photo, and the grid below has no shared visual language. Tracked as separate cover art-direction work; the hub does not depend on it.
- **Search index grows with the catalogue** → 79 posts is comfortable; a few hundred still is. If the catalogue ever reaches a scale where the payload matters, the filter becomes a route. Not designed for now.
- **A stale video spotlight** → A prominent block pointing at old content is worse than no block. Mitigation: the field is optional and the section disappears when cleared, so removing it is a one-click editorial action.
- **The global is a single point of failure for the hub** → Mitigation: the fallbacks in decision 2 mean a failed or empty global degrades the hub to today's chronological behaviour rather than breaking the page.

## Migration Plan

Additive: one new global plus front-end work. Deploy order is (a) add the `blog-hub` global, push schema, regenerate types; (b) ship the hub. The hub renders correctly against an unpopulated global from the moment it deploys, so there is no window where content must exist before code. Editors populate the slots afterwards at their own pace. Rollback is a code revert; the global can remain unused.

## Open Questions

- ~~Copy for the promo strip (the mock shows a budget calculator that does not exist).~~ **Resolved 2026-07-27:** the strip points at `/case-studies` — "we don't just write about it, we do it" — with hardcoded copy. Chosen over a `/kontakt` CTA (the hub already asks for an email in the newsletter slab, so a third ask stacks up) and over making it an editable CMS slot (one more optional field for editors to leave empty, for copy that will rarely change). The destination already exists, so nothing about the section is speculative.
- Whether the "most read" pick should be revisited on a schedule, and by whom. Not a code question, but an empty slot stays empty until someone owns it.
