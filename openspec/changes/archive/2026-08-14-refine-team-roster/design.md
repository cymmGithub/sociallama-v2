## Context

The roster is defined in three code locations sharing one asset set: the homepage `TEAM` array (`app/(frontend)/(home)/sections/why-that-works/index.tsx`), and `oNasTeam.members` in `lib/content/o-nas.ts` + `lib/content/o-nas.en.ts`. All reference 422x600 transparent PNG cutouts in `public/o-nas/slider/`, produced to the established recipe: torso bleeds off the bottom edge, no limb terminates mid-frame, head width anchored across the roster, ~300 KB optimized. Homepage tiles deep-link into the slider by cutout filename stem.

Source material supplied by the client (all with real alpha channels):

| Person | Source | Geometry | Subject bbox |
|---|---|---|---|
| Robert Sawicki (replacement) | `~/Downloads/Firefly_Gemini_Flash-removebg.png` | 1792x2400 portrait | 1670x2251, bleeds off bottom |
| Wojtek Sochaczyński (new) | `~/Downloads/wojtek-poziom-removebg.png` | 1920x1080 landscape | 674x973 — shoulders-up headshot |
| Aleksander Dymiński (new) | `~/Downloads/alex_Firefly_20241118142801-removebg.png` | 6321x4096 landscape | 3355x3136 — chest-up |

The client also dictated a new 14-member presentation order (2026-08-04): Anna, Kamil, Robert, Emilia, Paulina, Magda, Piotrek, Agnieszka, Kasia, Oliwia, Karolina, Wojtek, Aleksander, Przemek.

## Goals / Non-Goals

**Goals:**
- Three production cutouts to the existing recipe; Robert's replaces in place (same filename), two new slugs added.
- Roster of 14 in the client's order, identical on the homepage grid and both locale sliders.
- PL + EN bios for the two videographers in the house voice, inside the roster's length band.

**Non-Goals:**
- No layout/CSS changes — the grid already handles an incomplete final row; the slider is roster-agnostic.
- No changes to the deep-link mechanism, certificate chips, or personal-link rows (neither new member declares either).
- No touch to the `oNasGoodOne` section or the "support" copy from commit 28cd3283.

## Decisions

**D1 — Robert's cutout is a straight crop; the two new sources go through a contact-sheet gate before any generative step.** Robert's source is a portrait-orientation torso shot that already bleeds off the bottom — crop to 422:600, resize, optimize; no credits, no generation. Wojtek's and Aleksander's sources are chest-up: at roster framing their heads may render visibly larger than teammates'. First produce naive crops and a plum contact sheet next to 3–4 existing cutouts (head-width measured, per the established recipe). Only if the sheet shows a mis-scale is outpaint-extension (Higgsfield) considered — and credits are spent only after showing the sheet and getting explicit per-batch approval. Alternative rejected: outpainting up front — spends credits that the contact sheet may prove unnecessary.

**D2 — Bios are craft-focused and contain no invented facts.** No employers, client names, year counts, or credentials will be fabricated. Wojtek's bio covers what a senior videographer owns end-to-end (concept → shoot → edit → grade/sound, formats that perform in social); Aleksander's covers production and editing craft with a distinct angle so the two don't read as clones. Third person, PL with ` ` non-breaking spaces after single-letter words, length inside the roster's band. EN versions carry the same substance in the established EN voice (playful-but-clean, American spelling). Alternative rejected: fact-rich bios like the rest of the roster — no facts were supplied; plausible-sounding fabrications about real people are worse than generic craft copy. If the client later supplies facts, bios get a content-only follow-up.

**D3 — One shared order replaces the position-seniority rule.** The old spec ordered by seniority with a curated slider deviation; the client has now dictated a single explicit order. Both surfaces (and both locales) carry it verbatim — no deviation between grid and slider remains. This is recorded as a REMOVED + ADDED requirement pair rather than a MODIFIED, because the ordering *principle* changed, not its parameters.

**D4 — Slugs are full-name kebab-case with diacritics stripped:** `wojtek-sochaczynski.png`, `aleksander-dyminski.png`, matching the existing convention (`przemyslaw-swiercz.png`). Display names use the site's formal spellings — the client's shorthand ("kasia", "oliwka", "aleks") refers to existing members and does not change their on-site names.

**D5 — "SOCHACZYŃSKI" becomes the roster's longest surname (12 characters, vs "MARCINOWSKA" at 11).** The slider's name-treatment requirement makes longest-surname fit normative at every viewport including >1700px, so verification must feature Wojtek explicitly at 390 / 768 / 1280 / 1920 / >1700px. No pre-emptive CSS change — check first, adjust only if it clips.

## Risks / Trade-offs

- [Head-scale mismatch on the two chest-up sources] → contact-sheet gate before shipping (D1); outpaint fallback behind explicit credit approval.
- [Wojtek's usable subject is only 674×973 px] → target is 422×600, so no upscaling is needed; but there is zero headroom for a tighter crop — if the contact sheet demands a larger head-relative frame, the crop window shrinks below output size and the source needs upscaling first (adds a step, still credit-free via local tools).
- [New `public/` files 404 on the running dev server] → hand the restart to the user; never kill/spawn worktree servers from the agent.
- [Generic bios read thinner than the fact-rich roster] → accepted consciously (D2); follow-up path documented.
- [Robert's photo replaced under the same filename → Next image cache may serve the stale one] → after replacing, clear `.next/dev/cache/images` (known behavior, established remedy).

## Open Questions

None blocking. If the user supplies real bio facts for Wojtek or Aleksander before implementation reaches the bio task, fold them in.
