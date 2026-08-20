# Proposal — refresh-case-study-covers

## Why

The client's 2026-08-20 review of `/case-studies` (Przemek's list, 34 numbered items) asks for a second imagery pass: most covers still come from the decks and are either pixelated, show recognisable people, or show nothing related to the brand. The listing also has two chrome defects (an undersized pracuj.pl mark, a subhead that wraps mid-"Social Lama") and one study — Adamed — that the client wants gone entirely.

## What Changes

- **pracuj.pl card logo enlarged.** The card-pass normaliser in `scripts/client-logos/pipeline.py` shrinks the navy pill to ~47% of the slot height (the belt pass already compensates with `boost: 1.35`; the card pass has no such knob). Add a per-slug boost to the card pass, regenerate, refresh the media row in place on dev and prod.
- **Listing subhead line break.** Text stays verbatim in both locales; a forced break lands before "— wybrane projekty" / "— selected", and "Social Lama" is tied with a non-breaking space so the brand name never splits across lines.
- **27 covers replaced** (unlocalized `cover` relation, one write per study):
  - 24 from **Pexels**, per-image approved from a candidate contact sheet, provenance recorded: engie, fm-logistics, julius-meinl, breville, foodsaver, polomarket, kontigo, aquael, ariadna, entelo, faktoria-win, skrzat, mazurska-manufaktura-alkoholi, kohersen, a1-karting, rabkoland, skibooking, dynamic-development, n-energia, produkty-cukiernicze-brzesc, ozgasl, personal-effect, kbp.
  - 2 from **client-supplied photos** (laurastar, mercator — 2752×1536 PNGs, resized/encoded for the cover boxes).
  - 1 **recrop** (stadler-form — crop the existing cover so no face is visible; Pexels fallback if the crop leaves no usable 1.9:1 frame).
- **Adamed removed entirely**: the case study and its media rows on dev and prod, the `health` industry's `caseStudy` proof block (the page stays — it drops to the editorial layout it already has content for), the ordering list entry, `public/case-studies/adamed/`, glossary and EN-alt entries.
- **Deferred, not in scope**: dolina-charlotty, power-elements, ed-invest covers wait for material from Emilka/Ania and follow through the same script later.

## Capabilities

### New Capabilities
- (none)

### Modified Capabilities
- `case-studies`: the listing subhead SHALL break before its dash clause and never split the brand name; stock covers are placed under the existing per-image approval + provenance rule, extended from proof surfaces to covers; a study the client withdraws SHALL be removed from every surface (DB, ordering, industry proof block, static assets).
- `branze-pages`: an industry whose featured study is withdrawn SHALL fall back to the editorial layout rather than keep a dangling `caseStudy` block (`health` goes from proof to editorial; "ten of twelve" becomes nine).

## Impact

- `scripts/client-logos/pipeline.py` (card pass boost), `public/case-studies/pracuj-pl/pracuj-pl-logo-mono.png`, `lib/payload/refresh-case-study-logos.ts` run on dev + prod.
- `lib/content/case-studies.ts`, `lib/content/case-studies.en.ts`, `app/(frontend)/case-studies/listing-view.tsx` (subhead render).
- New `lib/payload/apply-cover-refresh.ts` (cover ops, cloned from `apply-final-verification-imagery.ts`), new `scripts/case-studies/pexels_candidates.py` (reads `PEXELS_API_KEY` from `.env.local`, never committed), `openspec/changes/refresh-case-study-covers/pexels-provenance.md`, `cover-plan.md`.
- `lib/content/branze.ts`, `lib/content/branze.en.ts` (health `caseStudy` block removed), `lib/payload/order-case-studies.ts`, `public/case-studies/adamed/`, `content/posts/glossary.json`, `content/media/alts.en.json`, `content/case-studies/adamed/draft.en.json`.
- Prod: 27 cover writes + 1 study delete + 1 logo refresh, each `--prod` run individually approved; `vercel cache purge --type cdn` after media writes; Vercel Blob token required for uploads.
- Risk: after this pass ~30 of 47 covers are stock — accepted by the publisher on 2026-08-18 and reconfirmed by this list.
