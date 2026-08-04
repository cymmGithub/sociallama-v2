# Design: morph-branze-poster-cards

## Context

`/branze` renders `SectionIndex` — the hub layout shared by four routes
(PL/EN × services/industries) — as white text cards (label, tagline, CTA)
on cream. Every industry page opens with `IndustryHero`: a full-bleed
`/branze/<id>/hero.jpg` poster carrying the LCP, a `preload="none"` video
loop that fades in over it once playing, and a scrim. All 12 industries have
posters; `/branze/[slug]` is fully static (`generateStaticParams`, content
modules, zero CMS queries), so the destination exists in full at navigation
commit — no streaming problem, no anchor problem (the hero is the page top).

Decisions already made by the user (2026-08-04, from the A/B mock —
https://claude.ai/code/artifact/80efff10-ea72-43bf-af12-ba7cddf14615):
Variant A (poster + label + CTA, no tagline), CTA "Więcej", services hubs
stay text-only.

`morph-team-grid-transition` (worktree :3004) lands the shared machinery:
view-transition enablement, the header's own transition name, the pre-paint
scroll path in `ScrollReset`, wrapper passthrough, and the spike verdict on
the one real unknown — whether a scroll inside the navigation commit is
captured by the new-state snapshot.

## Goals / Non-Goals

**Goals:**

- Hub cards become the industry posters — a visual index built from assets
  that already exist, no new copy or artwork.
- Card → industry-page navigation morphs the poster into the hero on
  capable browsers; everyone else keeps an instant, correct navigation.
- Label + CTA stay legible over all 12 photographs, including future poster
  swaps.
- Services hubs pixel-identical to today.

**Non-Goals:**

- No tagline on the poster card (Variant B was reviewed and rejected).
- No service posters, no uslugi changes beyond the untouched default of the
  shared component's new optional slot.
- No video on cards — the poster only; the loop belongs to the destination.
- No re-derivation of the morph machinery — this change consumes what
  `morph-team-grid-transition` lands, it does not fork it.

## Decisions

**D1 — Optional image slot on `SectionIndex`, not a fork.** `SectionIndex`
gains an optional `image` per item; an item with an image renders the poster
card (full-bleed cover, bottom scrim, cream label, orange "Więcej" CTA), an
item without renders today's text card. The services hubs pass nothing and
hit the text branch untouched. Rationale: the shared layout is the point of
the component (one hub pattern, four routes); a branze-only fork would
duplicate the hero band and grid for one presentational branch. Alternative
considered: a separate `PosterIndex` component — rejected as a copy of 80%
of the file.

**D2 — Card geometry 3:2, scrim follows the copy.** Variant A as mocked:
`aspect-ratio: 3/2` (close to the hero band's own proportions, so the morph
travels crop → crop with minimal reframing), scrim as a bottom gradient
sized to the label + CTA block only — the house recipe from the uslugi
covers — never a full-card wash. Label keeps the display face with the
orange dot; CTA is "Więcej" + lucide arrow.

**D3 — CTA copy changes in content, not in the component.** "Więcej" (PL) /
"More" (EN) replace "Zobacz branżę" / its EN twin in
`chrome.index.cardCta` of the branze modules. The component keeps reading
`chrome.index.cardCta` — no hardcoded copy, per the existing hub spec. The
services modules keep their own CTA copy untouched.

**D4 — Morph pair: card poster ⇄ hero poster, named `branza-<id>`.** The
transition name goes on the poster media on both sides — the card's image
and `HeroMedia`'s poster `Image` — not on the card or hero containers, so
scrims, labels, and the video element stay out of the snapshot pair and
simply crossfade with the root. The video layer needs no special handling:
it fades in only after `onPlaying`, which is after arrival; the poster is
the stable shared layer. Cards on the hub each carry a unique id-derived
name, mirroring the team-grid pattern.

**D5 — Pre-paint landing generalizes to `scrollTo(0)`.** The hub is always
scrolled below its own hero when a card is clicked, and Lenis keeps that
offset across navs, so the new page would snapshot mid-scroll without a
reset inside the commit. `ScrollReset`'s pre-paint path (built for hash
targets in the team change) extends to the no-hash case: pathname commit →
scroll to 0 inside the commit using the mechanism the spike validated. The
post-paint path remains for anything the pre-paint path can't serve.

**D6 — Image weight discipline.** Cards render via the house `Image` with
card-sized `sizes` (~33vw desktop, ~90vw mobile) — never the hero's 100vw
variant. The morph does not require equal resolutions on both sides; the
browser scales snapshots. Hub LCP becomes a poster image; the first row's
cards get priority treatment, the rest lazy-load as today.

**D7 — Reveal entrance stays, morph exit needs no suppression.** The hub's
existing stagger reveal animates cards *in* on scroll; the morph happens on
the way *out*, so the two never overlap — unlike the team slider, nothing
needs suppressing on the destination either (the hero has no wipe). If the
spike-landed machinery shows the reveal's settled transform interfering
with snapshot geometry, the fix is scoping the reveal's settled state, not
dropping the entrance.

## Risks / Trade-offs

- [Team-morph spike fails → no morph mechanism] → poster cards ship anyway
  (groups 1–2 stand alone); only the transition group is struck. The hub
  redesign was chosen on its own merits from the mock.
- [Label legibility varies across 12 arbitrary photos] → the scrim is
  normative (spec scenario), and posters are already graded for cream hero
  copy on the destination pages — the same treatment the card reuses.
- [12 posters inflate the hub] → D6 sizes discipline; verify with the
  house image-weight measurement before merge (homepage lesson: `sizes`,
  not count).
- [Shared-component regression on services hubs] → the no-image branch is
  byte-identical markup; spec scenario pins services hubs unchanged, and
  the locale-parity test covers both hub pairs.
- [Reverse morph (industry page → hub) quality unknown] → observed, not
  built; acceptable either way since names match symmetrically.

## Open Questions

- The exact pre-paint scroll mechanism is whatever the team-morph spike
  validates (Lenis immediate vs native + resync) — inherited, not re-asked.
- ~~Whether the first-row poster cards should be `preload` (LCP candidates)
  or whether the hub hero's copy remains the LCP — measure on the branch.~~
  **Resolved 2026-08-04:** measured with a PerformanceObserver on the branch —
  the hub LCP is a first-row poster on both viewports (desktop: automotive,
  mobile: the first card in view), arriving well after the hero-lead text
  candidate while lazy. The first three cards (the desktop first row, a
  superset of mobile's) now get `preload`; the rest stay lazy. Cards serve
  the `w=640` bucket (~14–24 KB each) — never the hero's 100vw variant.
