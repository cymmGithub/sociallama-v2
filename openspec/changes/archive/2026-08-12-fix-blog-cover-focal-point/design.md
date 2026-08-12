# fix-blog-cover-focal-point — design

## Context

The post header (`app/(frontend)/[slug]/post-article.tsx` + `post.module.css` `.cover`) crops every cover into a 4:3 `object-fit: cover` box with the default `object-position` (50% 50%). Hub surfaces (featured lead, cards, popular rail) crop the same covers at other ratios, also centered. Payload's media collection has focal-point support on (payload-types carries `focalX`/`focalY`; the admin shows the picker), but no render site reads it — editor intent goes nowhere.

The `Image` wrapper (`components/ui/image/index.tsx`) merges a caller `style` after its own `objectFit`, so `style={{ objectPosition }}` flows to the underlying `<img>` with no component change.

The cover library itself is the other half of the context. The 73 covers behind the 79 published posts are mostly WordPress imports at whatever ratio the original post shipped with — from 1.00:1 to 3.38:1, median **1.50:1** — alongside the newer 2560×1600 brand covers composed to this spec. Measuring every master against every live box (see D3) showed the failure is one-directional: a header at 4:3 is narrower than nearly the whole library, so it crops **62 of 73** covers horizontally, and horizontal is exactly where the meaning sits — captions, wordmarks, before/after sequences. Vertical crops take sky and floor, and nobody notices.

## Goals / Non-Goals

**Goals:**

- No published post header cuts its cover's subject.
- An editor-set focal point steers the crop on every blog cover surface, both locales.
- Covers with no explicit focal point render exactly as today (50/50).
- The remaining miscropped post headers are fixed by setting focal points in the admin, and the adjustments are recorded in the image audit artifact.

**Non-Goals:**

- No change to the hub's ratios — the card stays 16:10, the lead and video frame stay 16:9. Only the post header's box moves (D3).
- No `Image` component API change and no new helper abstraction beyond a small shared mapper if more than two call sites want it.
- No focal-point support for non-blog imagery (case studies, static content) — their imagery is art-directed per slot already.
- No re-upload or recomposition of cover masters. With D3 in place none is needed.

## Decisions

### D1 — Pass focal point as `object-position` at the call sites

`objectPosition: `${focalX}% ${focalY}%`` computed from the resolved media, guarded so null/undefined focal values fall back to omitting the style (browser default = 50% 50%). Four call sites: post header, hub featured, post card, popular rail. A one-line `focalPosition(media)` helper in `lib/payload/queries.ts` (next to `resolveMedia`) keeps the null-guard in one place.

*Alternative considered:* teach the `Image` component a `media` prop that derives both `src`/`alt`/`objectPosition`. Rejected — bigger API surface than the problem, and `Image` deliberately knows nothing about Payload shapes.

### D2 — Fix the offending covers with focal points, not new masters

The `blog-cover-art` spec's existing rule (compose masters to survive the live crops) remains the standard for *new* library covers; the focal point is the repair tool for existing art whose subject sits off-center. The editorial pass audits rendered headers, sets focal points in the admin for offenders only, and logs each adjustment in the image audit artifact — that log is the rollback record, since media rows have no git history.

### D3 — Move the post header box from 4:3 to 16:10

**This decision reverses an alternative D2 originally rejected, and it is worth being explicit about why**, because the rejection rested on two claims that the audit disproved:

- *"It reflows the whole header grid for every post."* It does not. `.cover` (`post.module.css`) is a self-contained block that deliberately bleeds past the stage's bottom edge; its `aspect-ratio` governs its own height and nothing else. The change is one declaration.
- *"The hub crops would still miscrop."* They largely do not. 64 of 73 covers survive all three live ratios untouched; the hub's 16:10 and 16:9 boxes were never the problem. The 4:3 header was.

Measured across the whole library, per candidate ratio:

| box | crops horizontally | worst width kept | crops vertically | worst height kept | mean area kept |
|---|---|---|---|---|---|
| 4:3 | **62 / 73** | 39% | 11 | 75% | 84% |
| **16:10** | 14 | 47% | 59 | 62% | **91%** |
| 16:9 | 6 | 53% | 67 | **56%** | 84% |

16:9 is the obvious-looking pick and the wrong one. It does not discard *less* than 4:3 — the mean retention is identical — it discards in a direction nobody reads. 16:10 gets almost all of that benefit (14 horizontal casualties instead of 62) while keeping the most image overall and taking the least height off the square-ish masters, which is precisely where faces and speech bubbles sit. It also collapses two coincidences into one system: it is the ratio `blog-cover-art` already mandates for every master, and the ratio the hub card already renders, so header and card finally show the same window and one focal point tunes both.

The ratio and the focal point are complementary, not alternatives, and one cover proves it: `2020-03-br-1.png` is a 613×603 square whose top speech bubble survives 4:3, is clipped at 16:10 and vanishes entirely at 16:9. Widening the box is what costs it, and a focal point is what buys it back. Conversely three covers had *no* focal point that saved them at 4:3 — a full-width caption loses one end whichever end you choose — and need no adjustment at all at 16:10.

*Alternative considered:* 16:9 everywhere, unifying all four surfaces on one ratio. Rejected — it is the harshest option for the 11 masters narrower than 4:3, and flattening the hub's deliberate card/lead hierarchy is a redesign this change has no mandate for.

## Risks / Trade-offs

- [The header gets shorter on every post, cover or not] → the box loses a fifth of its height (4:3 → 16:10 at fixed width). It is the stage's closing element and bleeds off its bottom edge, so the change reads as proportion, not as a hole; verify one long and one short post before merging.
- [Widening the box costs height on square masters] → 11 covers are narrower than 4:3 and give up more height than they do today. One of them (`br-1`) is a genuine casualty and is repaired by focal point in the same pass; the rest were measured and hold.
- [The derived `og` file does **not** follow a focal point set through the Local API] → measured, not assumed: after writing 20/50 to media 297 its `sizes.og` came back byte-identical (77 411 B, same filename). Payload's resizer only runs when an upload carries `uploadEdits`, and `payload.update({ data: { focalX } })` has no file, so the resize block is skipped entirely. `crop: 'center'` on the size is a red herring — `getImageResizeAction` never consults it once a focal point exists, but that code path is not reached here. Consequence: the live surfaces re-crop immediately (they read `object-position` at render time) while the share image keeps its centered crop until regenerated on purpose. Only rows that *have* an og size are affected; a master smaller than 1200×630 has none.
- [Hub crops and header crops share one focal point per image] → after D3 the header and the hub card render the *same* 16:10 window, so a point tuned on the header is exactly right on the card and directionally right on the 16:9 lead; verify the hub lead for any adjusted cover that is also the lead.
- [Admin writes are unversioned] → the image audit artifact records every adjustment (existing bookkeeping requirement), and focal values are trivially re-settable.

## Open Questions

None.
