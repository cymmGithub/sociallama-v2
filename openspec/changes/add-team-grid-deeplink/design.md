## Context

Two team surfaces exist: the homepage `why-that-works` grid (hardcoded `TEAM`
array, 12 tiles, always-visible name+role captions, no links) and the `/o-nas`
"NASZE LAMY" slider (`oNasTeam.members`, `useState(0)`, prev/next with
wrap-around and crossfade). They share the cutout assets
(`/public/o-nas/slider/<slug>.png`) but deliberately disagree on order —
Martyna Borowik is 2nd in the grid and 11th in the slider (curated deviation,
recorded in the `onas-team` spec). `home.ts` carries an orphaned `teamCta` key
(`/o-nas#zespol`) that no component renders.

Cross-page hash scrolling is already solved: `ScrollReset`
(`components/layout/scroll-reset/index.tsx`) detects a hash on pathname change
and Lenis-scrolls to the anchor after a deferred frame — its own doc comment
names `/o-nas#zespol` as the motivating case. The scroll half of this feature
requires zero new code.

## Goals / Non-Goals

**Goals:**

- A discrete "WIĘCEJ" link per homepage team tile, landing on `/o-nas` (EN:
  `/en/about-us`) with that member already featured in the slider.
- Shareable, order-independent URLs: `?lama=<slug>#zespol`.
- Static HTML for both pages unchanged in substance (no CSR bailout, no
  Suspense fallback swallowing the team section — the no-JS shell stays whole).

**Non-Goals:**

- No change to caption presentation (names/roles stay always visible — user
  decision 2026-07-30).
- No slider URL write-back: stepping the slider does not update `?lama=`. The
  param is an entry point, not synced state.
- No content/schema changes to `oNasTeam.members`; identity is derived from the
  existing photo filenames.

## Decisions

**D1 — Slug is the cutout filename; matching is by slug, never index.**
`TEAM[].cut` is `<slug>.png` and `members[].photo` is
`/o-nas/slider/<slug>.png`, so both surfaces already share a stable key with
zero new content fields. Index-based linking was rejected: the surfaces'
orders differ by design, and the "order mirrors" comment in `o-nas.ts` is
stale. The slider derives slug per member with a basename helper at module
scope.

**D2 — URL shape: `?lama=<slug>#zespol`.** Query param carries selection, hash
carries scroll target — each mechanism does the job the platform (and the
existing `ScrollReset`) already gives it. Alternatives rejected:
`#zespol-<slug>` (breaks the existing anchor and needs custom scroll code);
sessionStorage (not shareable, fragile under Activity keep-alive).

**D3 — Param is read by a null-rendering child behind Suspense, not by `Team`
itself.** `useSearchParams` directly in `Team` would force a Suspense boundary
*around the whole section*, and its fallback would hole the static shell
(regression of the no-JS work). Instead `Team` mounts
`<Suspense fallback={null}><LamaParam onSlug={...}/></Suspense>` where
`LamaParam` calls `useSearchParams`, resolves `lama` and reports it upward.
The static HTML is byte-identical to today; both pages (`o-nas/page.tsx`,
`en/about-us/page.tsx`) need no structural change.

**D4 — Selection applies as an instant swap keyed on the param value.** The
handler matches slug → index and calls `setIndex` directly (the reduced-motion
path of `go()`): no crossfade, no `prev` layer, no arrow lock. The effect keys
on the param value so it re-fires when Next 16 Activity keeps `/o-nas` mounted
across navigations and the user clicks a different member from the homepage.
Unknown or absent slug → no-op (slider stays where it is; first member on a
fresh mount). Known edge, accepted: same member clicked twice with manual
stepping in between won't re-fire (param value unchanged).

**D5 — The whole tile is the link; a bottom-right lucide arrow is the only
affordance** (user decision 2026-07-30, revising the earlier "discrete link,
not whole-tile link" call made the same day). The `<Link>` is an
`inset: 0` overlay *sibling* of the caption, not a wrapper around it: wrapping
would compute the accessible name from the tile's text ("Anna Ozga Head of
Social Media") and nest copy inside an anchor for no reason, while an overlay
gets the same click target and leaves the caption's layout untouched — the
name and role do not move by a pixel. `.caption` is already
`pointer-events: none`, so the overlay above it captures cleanly.

Reveal via `.tile:hover` / `.tile:focus-within` opacity transition, inside
`@media (hover: hover)` so touch devices get it always-visible by default —
with no label, the arrow is the tile's only cue that it leads somewhere. Arrow
is lucide `ArrowRight` (house rule: never glyph arrows). Each link's accessible
name carries the member ("Więcej: Anna Ozga") — twelve unlabelled arrows with
different destinations would otherwise be indistinguishable and trip the
homepage a11y gate.

Dropping the visible label also settles the contrast question the label version
could not: measured over the twelve cutouts, brand orange runs 3.20–8.90:1
against the composited caption scrim. As 9.6px copy that failed AA (4.5:1) on
seven tiles; as a graphical object it answers to WCAG 1.4.11's 3:1, and
measured across the pixels the arrow actually paints it holds 3.88:1 at worst.
Brand orange stays.

**D6 — Copy and hrefs live in content, `teamCta` dies.** New key under
`whyThatWorks` (`memberLink: { label, hrefBase }`; PL `/o-nas`, EN
`/en/about-us`); the component assembles `${hrefBase}?lama=${slug}#zespol`.
`label` is sentence case ("Więcej" / "More") because after D5 it is never
displayed — it exists only to lead the accessible name. The orphaned `teamCta`
is removed from both locales in the same commit — this feature is its
successor. `LocalizedHome` derives from the PL const, so the type updates
itself; EN must satisfy it or the build fails.

## Risks / Trade-offs

- [Pre-hydration flash: static HTML features member #1, param applies
  after hydration] → Accepted; the visitor also only *arrives* at `#zespol`
  via the same post-hydration `ScrollReset` frame, so the swap happens
  off-screen or at worst within the same beat. No crossfade means no
  half-faded ghost.
- [`ScrollReset` scrolls before the slider has applied the param] → Irrelevant:
  scroll targets the section element, whose geometry doesn't depend on which
  member is featured (desktop height is stage-governed and identical across
  members; mobile reserves the tallest member's floor).
- [Activity keep-alive: `/o-nas` restored from cache with a new param] →
  Covered by D4's value-keyed effect; verify explicitly with Playwright
  (homepage → member A → back → member B).
- [e2e from a worktree silently tests main's :3000] → Known trap
  (playwright.config hardcodes the port); run verification against the
  worktree's own dev server port or on main after merge.
- [`useSearchParams` build error if D3 is bypassed] → The Suspense wrapper
  lives *inside* `Team`, so future refactors can't accidentally mount the
  hook unwrapped without the build failing loudly — acceptable guard.

## Open Questions

None — wording ("WIĘCEJ"/"MORE"), param name (`lama`), reveal behavior and
link discreteness were all settled with the user on 2026-07-30.
