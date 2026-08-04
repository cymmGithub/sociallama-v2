# Design: morph-team-grid-transition

## Context

The homepage `why-that-works` grid deep-links each teammate tile to
`/o-nas?lama=<slug>#zespol` (EN: `/en/about-us?…`). Today's arrival sequence,
in order:

1. Custom `<Link>` navigates with `scroll={false}`; pathname commits. Both
   pages stay mounted across the nav (Next 16 Activity cache).
2. `/o-nas` streams behind its loading shell because the page root awaits
   `getLatestPost()` (a Payload→Neon query) for the NewsLama band at the
   very bottom of the page.
3. `ScrollReset` (post-paint `useEffect`) rAF-polls until `#zespol` exists,
   then `lenis.scrollTo(el, { immediate: true })` — the hard jump.
4. The Team slider reads `?lama=` through a null-rendering `LamaParam` child
   (Suspense-isolated `useSearchParams`), which `setState`s twice — the
   featured member swaps one-to-two effect ticks after mount.
5. The slider's `data-reveal-style="wipe"` entrance plays.

Home already solved the streaming half of this: `HomeNews` isolates the same
query behind `Suspense`, and `getLatestPost` is `use cache` +
`cacheLife('max')`, so home prerenders fully (true PPR). `/o-nas` never got
that pattern.

Next 16.2's view-transition support: `ViewTransition` imports from `react`,
route navigations activate it automatically, matching `name` props across
routes produce a shared-element morph, and `Link` accepts `transitionTypes`.
Whether an `experimental.viewTransition` next.config flag is still required
must be confirmed in the spike.

House constraints that shape this design (all previously bitten):

- Activity cache: previous pages stay mounted — no pathname-keyed effects
  that assume unmount, no `:has()` page CSS.
- Lenis owns scrolling; Next's own scroll handling is disabled at the Link
  level.
- The wipe reveal keeps a border-box `clip-path` after settling, and clips
  overflowing children.
- `useSearchParams` in a rendering component punches a CSR hole in the
  prerendered shell unless Suspense-isolated — the reason `LamaParam` exists.

## Goals / Non-Goals

**Goals:**

- Kill the hard jump: arriving from a grid tile reads as one continuous
  motion — the clicked cutout morphs into the slider's featured slot, the
  rest of the page crossfades.
- Make the arrival state render-synchronous (right member, right scroll
  position in the first painted frame) — valuable even where the morph
  doesn't run.
- Make `/o-nas` / `/en/about-us` fully prerenderable; no loading shell on
  client navigation.
- Degrade cleanly: unsupported browsers and `prefers-reduced-motion` get an
  instant (but now correctly sequenced) swap; a plain crossfade is the
  accepted fallback whenever the shared element can't participate.

**Non-Goals:**

- No view transitions for any other route pair (this is not a site-wide
  transition system; the wiring must not leak beyond the two surfaces plus
  the pinned header).
- No URL-state sync while stepping the slider (the `lama` param stays an
  entry point only, per the existing onas-team spec).
- No redesign of either surface's layout, imagery, or reveal system beyond
  suppressing the wipe on morphing arrivals.
- No MPA/cross-document view transitions.

## Decisions

**D1 — Spike before build, with a kill criterion.** The whole morph rests on
one unverified sequencing assumption: that a scroll performed inside the
navigation commit (layout effect, before paint) is captured by the browser's
new-state snapshot, so the morph targets the featured slot at its on-screen
position. The spike wires a minimal throwaway version (tile name → featured
name, layout-effect scroll, no polish) and answers: (a) does the new
snapshot see the scrolled viewport; (b) does Lenis tolerate a programmatic
jump inside the commit, or must the spike fall back to `window.scrollTo`
with a Lenis resync; (c) is a config flag needed; (d) do the custom
`Image`/`Link` wrappers pass what's needed. Kill criterion: if after a
time-boxed effort the morph still animates toward an off-screen target or
double-fires with Lenis, the change is descoped to the prerender + arrival
fixes (which stand alone) and the morph is abandoned — a morph that flies to
nowhere is worse than the current cut. Alternative considered: designing the
full implementation first and treating the scroll as an implementation
detail — rejected because every downstream task's shape depends on this
answer.

**D2 — Prerender `/o-nas` by copying the `HomeNews` pattern verbatim.** An
async `ONasNews` child awaits `getLatestPost()` behind `Suspense` with a
skeleton fallback; the page component becomes sync. Same for
`/en/about-us`. Rationale: the pattern is already proven on home (including
the `use cache`/`cacheLife('max')` query, so the news bakes into the static
shell), and it's the smallest change that puts `#zespol` in the DOM at
navigation commit. Alternative considered: keeping the page dynamic and
morphing only on warm Activity-cache revisits — rejected; first-time
visitors are the ones the transition should impress, and the prerender is an
independent LCP win (home's comment records ~4.5s LCP delay from the same
root-await shape).

**D3 — Render-synchronous featured member, without breaking the static
shell.** The slider derives its initial `index` from `?lama=` at first
client render instead of the `LamaParam` → `setLama` → `setIndex` effect
chain. The constraint is the existing spec requirement that reading the
param must not swallow the team section's prerendered HTML. Approach: keep
the Suspense-isolated read, but make it drive the *initial* state before
paint (the param value is available synchronously during client-side
navigation renders; the prerendered/no-JS path keeps member 0, which is
correct — a URL param can never influence static HTML). The Activity-cache
repeat-visit path (`lama` changes while the page stays mounted) must keep
working; it may remain effect-driven since a revisit has no first-paint
problem when the correct member is already featured — but it must not
crossfade (existing spec: instant swap). Alternative considered: reading
`searchParams` in the server page — rejected, it would make the page dynamic
again, defeating D2.

**D4 — Anchor landing moves pre-paint on the fast path; polling stays as
fallback.** `ScrollReset` gains a layout-effect path: when the pathname
commits and the hash target already exists in the DOM (true once D2 lands),
scroll immediately — inside the commit, so the transition snapshot captures
the landed state. When the target doesn't exist (any still-streaming page,
e.g. other routes' hash navs), the existing post-paint rAF-polling path
handles it unchanged. Whether the pre-paint scroll goes through Lenis or
through `window.scrollTo` + Lenis resync is a spike finding, not a design
commitment. Alternative considered: replacing the polling path entirely —
rejected; other routes still stream and the poll is the documented fix for
a real 2026-08-04 bug.

**D5 — Name only the pair that morphs; suppress competitors.**
`ViewTransition name={'team-' + slug}` wraps each grid tile's image; the
slider names only the *featured* slot with the active member's slug — never
the peer slots, whose members' names would collide with live tiles during
the snapshot and silently disable the morph. The fixed header gets its own
`ViewTransition` name so the root crossfade doesn't double-draw it. On a
morphing arrival the slider's wipe entrance is suppressed (the morph *is*
the entrance); the wipe still plays for scroll-into-view on direct visits.
The cover→contain crop difference between tile and featured slot is tuned
with `::view-transition-old/new` CSS (object-fit trick) only if the default
scale-crossfade visibly squishes — measured in the spike, not assumed.

**D6 — Fallback is the absence of the feature, not a parallel system.** No
JS feature-detection branches: React's `<ViewTransition>` no-ops where the
API is missing, `prefers-reduced-motion` is enforced in CSS on the
`::view-transition` pseudos, and the D3/D4 arrival fixes are what those
users experience. Back-navigation home reverse-morphs for free if the
Activity-cached grid tile still carries its name — verified, not built.

## Risks / Trade-offs

- [Snapshot misses the scroll; morph flies off-viewport] → the D1 spike
  gates the whole change; kill criterion descopes to prerender + arrival
  fixes.
- [Experimental-surface churn: React `ViewTransition` semantics or Next's
  activation may shift in minor versions] → wiring is confined to two
  surfaces + header + one config line; removal is a small, mechanical
  revert. Accepted trade-off for shipping on current Next 16.
- [Activity cache interactions: both pages mounted during the transition;
  duplicate `team-*` names across *live* pages would break snapshots] → the
  hidden page's content is not painted, so names on it don't participate;
  verified in the spike on the home ⇄ o-nas round trip specifically.
- [Lenis fights the pre-paint scroll (momentum, smoothing, resync)] →
  spike question (b); fallback is native scroll + explicit Lenis sync,
  the pattern `ScrollReset` already uses for the poll path.
- [Wipe suppression regresses the direct-visit entrance] → suppression is
  keyed to morphing arrivals only (presence of the `lama` param on a client
  nav), and the settled-clip-path lesson says to screenshot the settled
  state both ways.
- [Crop pop (cover tile → contain slot) reads as squish] → tune with
  view-transition pseudo CSS; if it stays ugly, name the tile's *image* only
  or drop to crossfade for the image and keep the positional morph — spike
  decides which.
- [`/o-nas` prerender surfaces a new build-time DB query] → `getLatestPost`
  is already `use cache`/`cacheLife('max')` and built for home; no new
  concurrency (house rule: no parallel Payload queries at build).

## Open Questions

- Does Next 16.2 still require `experimental.viewTransition` in
  `next.config.ts`? (One-line check during the spike; docs excerpts show
  none.)
- Does the reverse morph (o-nas → home) come for free with acceptable
  quality, or does it need explicit gating? Spike observation, not a
  requirement.
- EN surface parity: `/en/about-us` shares components, but the spike runs on
  PL only; EN is wired in the build phase and verified, not re-spiked.
