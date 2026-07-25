## Why

The client delivered copy documents for three of the six services on 2026-07-25. Those pages currently ship assistant-drafted copy and compositions invented in the absence of a brief — `add-services-pages` archived with its entire copy-review section unfinished precisely because this input did not exist yet.

Two of the three are not merely mis-worded, they are mis-shaped. The client's wireframes ask for page structures the current section-primitive union cannot express (a process timeline, a deliverables checklist, a platform logo strip, a highlighted offer band). Audyt i konsultacje is the sharpest case: the document describes a **productized, purchasable service** — a fixed deliverable list, a 45-minute consultation with a named specialist, a booking step — where the live page describes a generic "we'll look at your profiles" audit. That is a different offer, not a rephrasing.

## What Changes

- **Strategia — rebuilt to the client's wireframe.** Sections become `hero → triptych(4 benefits) → checklist(+graphic) → timeline(4 steps) → banner → posts`. The `proof` section is **cut**: the client's wireframe omits case studies entirely, and this resolves a standing defect — Volvo was duplicated verbatim as the proof case on both Strategia and Audyt (open question O2 from `add-services-pages`, never resolved). Volvo stays on Audyt.
- **Audyt i konsultacje — reshaped as a productized service.** The invented triptych is **deleted** in favour of the client's 6-item deliverables checklist. Adds a platform logo strip (Facebook, Instagram, LinkedIn, TikTok, Pinterest, YouTube) and a highlighted booking banner. The hero gains a CTA button.
- **Influencer marketing — copy only, zero structural change.** Hero intro and Folks partner copy come from the document, adding the Good One group framing and the closing "Jeden partner. Wiele kompetencji. BETTER WORKS." line.
- **Five new section kinds**: `checklist` (media optional — serves Strategia's "Co zawiera strategia?" with a graphic and Audyt's "Co obejmuje usługa?" without), `timeline`, `banner` (double duty: Strategia's standalone-strategy offer and Audyt's booking band), `logoStrip`, and `posts` (blog links matched by category).
- **Two extensions to existing primitives**: `triptych` gains an N-column grid (currently hard-coded `repeat(3, 1fr)`, which would render Strategia's four benefit tiles as 3 + 1 orphan), and `hero` gains an optional CTA.
- **The documents are compressed, not imported.** Each PDF carries roughly three times the prose the page should hold; each also ends with the client's own `SZKIELET` wireframe, which is the concise version. Copy is written to the wireframe's slots, using the prose as source.
- **Booking is a CTA, not an integration.** The Audyt document asks for a calendar and a specialist picker; the repo's HubSpot integration is forms-only. Per user decision the banner links to `/kontakt`. A real scheduler is a later change if wanted.
- **Partner case studies are omitted.** The Influencer document asks for Folks case studies; none were supplied, and `proof` links only into our own case-study collection. The section is left out rather than stubbed, matching how the Folks partner block already degrades.

Explicitly **not** in scope: Content, Kreacje & Wideo, Sprzedaż, and the `/uslugi` index. The client has no copy document for them, and their shipped text stands as accepted.

## Capabilities

### New Capabilities

None. This change reshapes an existing capability rather than introducing one.

### Modified Capabilities

- `services-pages`: the section-kind union grows from six kinds to eleven; the per-service compositions for Strategia and Audyt i konsultacje change (one section cut, one deleted, four added); copy provenance for three services becomes client-supplied rather than drafted.

## Impact

- **Content**: `lib/content/uslugi.ts` + `uslugi.en.ts` — section-descriptor union extended, three services' `sections` arrays rewritten, PL copy replaced, EN translated to the established locale voice. `Localized` parity must stay compiling.
- **Components**: `app/(frontend)/uslugi/[slug]/service-page.tsx` — five new section renderers plus two extensions; `service.module.css` — new section styles, `triptych` grid delinearized.
- **Data**: one read-only Payload query for posts-by-category, wrapped in React `cache()` per the established use-cache rule. No schema change, no new collection. PL only — the blog is PL-only, so the EN Strategia page omits the `posts` section.
- **Assets**: none to source. All six platform icons already exist at `public/assets/icon-*.svg`. Strategia's "Co zawiera strategia?" graphic is the one open asset slot; `checklist` renders media-less until it lands.
- **Specs**: delta to `services-pages`.
- **Ops**: shares one worktree with `add-seo-performance-page` and runs first — both changes edit the same four files, so parallel worktrees would conflict on the core of each.

## Risks / Trade-offs

- **Deleting Audyt's triptych removes live content.** Justified: the client's checklist covers the same ground more concretely, and keeping both would say the same thing twice on one page.
- **Blog category matching is unverified.** `posts` assumes the taxonomy (`SEO`, `Marketing`, `Reklama`, `Social media`) yields matches for Strategia. Same graceful-omission rule as platform related-posts, so a miss degrades to an absent section rather than an empty heading — but it should be checked against the prod database, where the real posts live.
- **Five new section kinds is real surface growth.** Mitigated by `banner` and `checklist` each serving two pages; none is single-use except `timeline` and `logoStrip`.
