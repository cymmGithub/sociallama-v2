# Proposal — refresh-case-study-pillar-creatives

## Why

Emilia's review of 2026-08-20, plus her later comment on Mazurska and Las Vegans ("CS grafy i check", Drive folder
`19Ti6Y3DOf7kZraG95q1AVb14TqtN1b33`) rejects most of the approach-pillar
creatives that survived the 08-19 imagery audit: nearly every image she strikes
shows a creator's or a client employee's face, and she supplied 98 replacement
files (raw Instagram exports and post screenshots) across 18 brand folders. The
covers from the same doc are already live; this change is the remainder: the
pillar creatives, the removals with no replacement, and two cover corrections
she made after the cover pass (Pracuj blur, FM Logistic employer branding).

## What Changes

- **Replace pillar creatives on 16 studies** from the Drive folders, keyed by
  pillar tag, using the mapping reviewed in the comparison sheet
  (`https://claude.ai/code/artifact/11c448c2-b04e-484b-9872-a6e328e431d4`):
  a1-karting, ariadna, breville, dynamic-development, engie, entelo,
  foodsaver, kohersen, laurastar, mercator, personal-effect, power-elements,
  stadler-form, vobis, volvo. 87 new media documents; every displaced
  creative is detached (never deleted while referenced).
- **Detach without replacement** on mazurska-manufaktura-alkoholi (1, the Pudelek clipping), las-vegans (6 of 10 screenshots, keeping the four legible ones and cropping two of them to the article), asus (4), kontigo (1), dolina-charlotty
  (1), ed-invest (1), kbp (2), engie #PERSONALBRANDING (1), power-elements
  #COMMUNITY (1), a1-karting #VIDEO (1), stadler-form and vobis #MODERACJA (3),
  mercator #MODERACJA (1), ariadna duplicates (2). Five pillars end up with no
  media and render through the existing `pillarSolo` branch.
- **Crop to the graphic** where the doc asks for it and no replacement exists:
  fm-logistics (3), entelo gallery-5, dolina-charlotty gallery-3/4/5. The FB /
  LinkedIn post chrome around the creative is cut away and the bytes refreshed
  in place on the existing media row.
- **Two cover corrections**: `pracuj-pl` cover ← Drive `pracuj/blur 2`
  (the stronger blur of the same frame); `fm-logistics` #EMPLOYERBRANDING
  slot ← a licensed stock photograph of a man in a suit (Pexels, approved per
  image in the plan, provenance recorded) replacing the warehouse portrait.
- **Out of scope, recorded as such**: the doc's stock-cover links (done);
  iRobot and IMID (owner's call); Breville logo swap (own pipeline,
  `refresh-case-study-logos`, no file supplied); Polo "powiększyć" (layout);
  rabkoland, getaway, skibooking (no source files); ozgasl, mmhygienic (pending Anna Ozga); Mazurska's "grafika główna do zmiany" (cover, no source supplied); skrzat (pending legal).
- **Open conflict, not applied**: Pracuj `EDU 2` / `FUNNY 1-3` (Drive, 08-17)
  vs Ania's 08-19 ruling that no Pracuj creative is Social Lama's work
  (`strip-pracuj-creatives.ts`). Pillars stay empty until one of them rules.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `case-studies`: the per-image review plan gains a recorded source for each
  replacement (Drive file id or stock URL), and a pillar whose last creative is
  removed SHALL render its text without a media strip rather than be deleted or
  refilled with stock by default.

## Impact

- Database only (dev, then prod): `media` documents and `case-studies.approach[].media`
  in both locales. No schema change, no migration.
- `public/case-studies/<slug>/` gains the encoded replacement files (source of
  truth for re-uploads, as today).
- One new script `lib/payload/apply-pillar-refresh.ts` on `media-ops.ts`
  (`begin → uploadMedia / repointRelation → finish`); the guard test forbids
  any other path.
- Caches: `finish()` revalidates `case-studies` + `case-study:<slug>` and
  purges the CDN; no deploy needed.
- Cost: the 87 Drive files are flat captures, not device mockups, so they skip
  `mockup_cutout.py` and take `.shot`'s CSS radius; the work is encoding,
  alt text in two locales, and six hand crops.
