## Context

`/branze` and `/en/industries` 404. Both are linked from the overlay menu's mobile-only `more` slot, and the repo has carried the gap as explicit debt: `PENDING_PAGES` in `e2e/locale-routing.e2e.ts:30` exempts them from the chrome-link sweep, and `hasIndex: false` in `lib/i18n/slug-map.ts:57` keeps `<LocaleToggle>` from pointing at the dead pair. Both carry comments saying to remove them when the index ships.

The sibling `/uslugi` hub is already built and is the template: `app/(frontend)/uslugi/page.tsx` (38 lines), `services-index.tsx` (63 lines), `index.module.css` (119 lines), plus a 38-line EN route at `app/(frontend-en)/en/services/page.tsx`. Both routes render the same client component with locale-correct content and a `base` path.

The menu is trimmed on mobile and complete on desktop: `MOBILE_BRANZE_SLUGS` (`lib/content/home.ts:137`) keeps 5 of 12 industries, and the USŁUGI column marks 4 of its 7 items `mobileHidden`. Desktop shows all of both. So a hub page adds reach only on mobile.

The footer (`components/layout/footer/index.tsx`) renders `chrome.footer.columns` plus a hardcoded contact column, inside a grid pinned to four tracks at `--desktop` (≥800px).

## Goals / Non-Goals

**Goals:**
- `/branze` and `/en/industries` return 200 and list all 12 industries in canonical order.
- No internal chrome link 404s in either locale; the e2e sweep runs with no exemption list.
- The footer surfaces the seven service detail pages and stops surfacing hub pages.
- Hub pages remain discoverable to crawlers via the sitemap even though desktop chrome no longer links them.
- No new per-industry copy — the 12×2 industry entries are untouched.

**Non-Goals:**
- Redesigning the `/uslugi` hub or any `/branze/*` detail page.
- Adding BLOG to English chrome — `/en/blog` does not exist, and `site-i18n` explicitly requires EN chrome to omit blog surfaces.
- Adding a `/szkolenia` page (still commented out of nav, delayed launch).
- Changing the mobile menu's trimming rules or `MOBILE_BRANZE_SLUGS` membership.

## Decisions

### D1 — Promote `ServicesIndex` to a shared section-index component rather than copying it

`ServicesIndex` already takes normalized props — `chrome`, `services: {slug, label, summary}[]`, `base` — and `uslugi/page.tsx` builds that array by mapping `SERVICES`. Industries can feed the same shape by mapping `label` and `tagline`, so the industries hub needs **zero new component or CSS code**, only a different mapping and different chrome strings.

Move it to `components/sections/section-index/` as `SectionIndex`, with the item prop renamed `items` and its field `summary` kept as the generic card-body slot. Four routes consume it (PL/EN × services/industries).

*Alternative — copy `services-index.tsx` and `index.module.css` into `app/(frontend)/branze/`.* Rejected: it duplicates 119 lines of CSS to change one heading, and the two copies would drift. The house rule against premature abstraction is about speculative flexibility; this is four concrete call sites sharing an interface that is already generic.

*Trade-off:* this edits a shipped, working page. It is a pure move plus a prop rename, and the e2e chrome sweep plus a visual check on `/uslugi` and `/en/services` cover the regression risk.

### D2 — Card body copy reuses `Industry.tagline`; no new copy is written

`Industry.tagline` (`lib/content/branze.ts:147`) is the one-sentence hero lead — already approved, already translated, already parity-gated. It is the direct analogue of `Service.summary`.

Only three new strings per locale are needed, as a `chrome.index` block on the existing `chrome` export: `title`, `intro`, `cardCta`. Because `chrome` is part of `BranzeContent` (`lib/content/branze.ts:1415`), adding the block to `branze.ts` makes `branze.en.ts` fail to compile until the EN twin is added — the parity gate does the enforcement for free. EN strings follow the established EN voice (playful-but-clean, American spelling).

*Alternative — author 12 dedicated card summaries per locale.* Rejected: 24 new strings needing approval rounds, for copy that would restate the tagline.

*Risk:* taglines are hero leads and may run longer than the service summaries the card was built for. Mitigate with a `line-clamp` on the card body and verify the grid at the widest tagline.

### D3 — Footer grid gets a mid-range step, not a bare 4→5 track swap

The agreed desktop layout is `1.2fr 0.9fr 0.9fr 1.5fr 1.1fr` (invite · NAWIGACJA · USŁUGI · OFERTA · KONTAKT), giving OFERTA the widest track so its `data-cols="2"` sub-grid keeps two columns.

But `--desktop` is `width >= 800px` (`lib/styles/css/root.css:8`), so that rule would engage on an 800px viewport. OFERTA's sub-grid is `repeat(auto-fill, minmax(11rem, 1fr))` (`footer.module.css:169`); at 800px its 1.5/5.6 share is roughly 190px, under one 11rem track, so it silently collapses to one column and the whole footer reads as five cramped strips.

Introduce an intermediate band instead:

| Viewport | Tracks | Result |
|---|---|---|
| < 800px | flex column (unchanged) | stacked |
| 800–1199px | `repeat(2, minmax(0, 1fr))` | 2×3 block; OFERTA keeps room for 2 sub-columns |
| ≥ 1200px | `1.2fr 0.9fr 0.9fr 1.5fr 1.1fr` | the agreed 5-track row |

*Alternative — apply the 5-track rule at 800px and accept OFERTA collapsing.* Rejected: it degrades the footer on every small laptop to fix a layout that only reads correctly on wide screens.

### D4 — Hub pages are linked from the mobile menu only

Footer NAWIGACJA drops `USŁUGI → /uslugi`; EN NAVIGATION drops `SERVICES → /en/services`. The overlay menu keeps both `more` links, which are already mobile-only by contract (`MenuItem.mobileHidden` / the `more` field comment at `lib/content/home.ts:26`).

This is coherent because desktop chrome already enumerates every child page, so nothing becomes unreachable — only the redundant summary page stops being advertised where it adds nothing.

*Trade-off:* the hubs become orphans in the desktop internal-link graph, which weakens the internal-linking signal to two pages that would otherwise be natural category landing pages. Accepted for now: both stay in the sitemap, and the site is pre-launch, so reversing this later is a one-line content edit.

### D5 — Clear the pending-page debt in the same change

Flip `hasIndex` to `true` for the industries pair, delete `PENDING_PAGES` and its comment block from the e2e file, add `/branze` and `/en/industries` to `app/sitemap.ts`, and update `slug-map.test.ts` — `sectionFor('/branze').hasIndex` becomes `true` and `counterpartPath('/branze')` becomes `/en/industries` rather than `/en`.

Leaving any of these behind would let the toggle keep dumping visitors on the locale home from a page that now exists, and would keep the e2e sweep blind to the very routes this change adds.

## Risks / Trade-offs

- **Moving `ServicesIndex` touches the live services hub** → pure file move plus prop rename; verify `/uslugi` and `/en/services` render identically before and after, and let the chrome sweep confirm routing.
- **Five footer tracks crowd small laptops** → mitigated by the 1200px step in D3; verify at 800, 1024, 1280 and 1600px.
- **Taglines overflow the card body** → `line-clamp` plus a visual check against the longest tagline in both locales.
- **Parity gate blocks the build mid-implementation** → expected and desirable; add `chrome.index` to `branze.ts` and `branze.en.ts` in the same commit.
- **Sitemap gains two URLs that desktop chrome does not link** → intentional per D4; noted so a future internal-linking audit does not read it as a bug.
- **`bun run build` dirties `lib/content/home.ts`** (known repo quirk: the styles step restamps the copyright year) → check the diff before committing so an unrelated year bump does not ride along.

## Open Questions

- Should the industries hub cards show anything beyond label + tagline (e.g. the featured case-study logo for the two proof industries)? Defaulting to parity with the services hub — label, body, CTA — unless the visual check argues otherwise.
- D1's component move is the one reversible-but-invasive call here. If the visual check shows any drift on `/uslugi`, fall back to a local copy under `app/(frontend)/branze/` and revisit sharing later.
