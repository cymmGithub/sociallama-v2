## Why

The team has grown — two videographers (Wojtek Sochaczyński, Aleksander Dymiński) joined and need to appear on both team surfaces. At the same time the client supplied a new portrait for Robert Sawicki and a new presentation order for the whole roster, so the grid and slider need one coordinated refresh rather than three drive-by edits.

## What Changes

- **Replace Robert Sawicki's portrait** with a new cutout produced from the supplied source photo (`~/Downloads/Firefly_Gemini_Flash-removebg.png`), optimized to the slider recipe (422x600 transparent PNG, torso bleeding off the bottom edge, head width anchored to the roster).
- **Add Wojtek Sochaczyński (Senior Videographer)** — new cutout from `~/Downloads/wojtek-poziom-removebg.png`, new PL + EN bios (craft-focused; no invented employers/credentials), entries on the homepage grid and both locale sliders.
- **Add Aleksander Dymiński (Videographer)** — same treatment, source `~/Downloads/alex_Firefly_20241118142801-removebg.png`.
- **Reorder the roster** on the homepage grid and the sliders to the client's new order: Anna, Kamil, Robert, Emilia, Paulina, Magda, Piotrek, Agnieszka, Kasia, Oliwia, Karolina, Wojtek, Aleksander, Iza, Przemek — 15 members after the mid-implementation addition of Iza Harmoza-Sochoń (HR & Administration Manager, 2026-08-04). The previous position-seniority ordering rule is replaced by this client-curated order; grid and slider now share it exactly.
- Wojtek's and Aleksander's chest-cropped sources may need outpaint-extension (Higgsfield credits) to match roster head scale — decided from a contact-sheet comparison first, and **credits are only spent after explicit per-batch user approval**.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `onas-team`: roster membership grows from 12 to 15 (Wojtek, Aleksander, Iza in; nobody out); ordering requirement changes from position-seniority-with-curated-deviation to a single client-curated order shared by grid and slider; Robert's portrait asset is replaced; bio requirements extend to the two new members in both locales.

## Impact

- `app/(frontend)/(home)/sections/why-that-works/index.tsx` — `TEAM` array: +2 entries, reorder.
- `lib/content/o-nas.ts` / `lib/content/o-nas.en.ts` — `oNasTeam.members`: +2 entries with bios, reorder.
- `public/o-nas/slider/` — `robert-sawicki.png` replaced; `wojtek-sochaczynski.png`, `aleksander-dyminski.png` added (422x600 cutouts).
- Homepage deep links (`?lama=<slug>#zespol`) pick up the new slugs automatically — keyed by filename, no code change.
- Grid layout: 14 tiles = 3×4 + 2 on desktop (incomplete final row already left-aligns by design), 7×2 on mobile.
- New `public/` files 404 on the running dev server until it restarts — restart is handed to the user, never performed by the agent.
