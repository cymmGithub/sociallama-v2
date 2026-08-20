# Tasks — refresh-case-study-covers

## 1. Listing chrome (code)

- [x] 1.1 `pipeline.py --case-studies`: add per-slug `boost` to the card pass (mirror the belt pass formula); set `pracuj-pl` boost, tune on `case-study-contact-sheet.png` until its ink height sits in the engie/irobot band
- [x] 1.2 Regenerate; confirm every other `public/case-studies/*/*-logo-mono.png` is byte-identical (`git status` shows only pracuj)
- [x] 1.3 Subhead: split `subhead` into `[lead, tail]` in `lib/content/case-studies.ts` + `.en.ts`, `Social Lama` in both; render `lead<br/>tail` in `listing-view.tsx`; verify at 1440 and 360 px

## 2. Adamed withdrawal (code side)

- [x] 2.1 Remove `numbers` + `caseStudy` from the `health` entry in `lib/content/branze.ts` and `branze.en.ts`; confirm `/branze/health` + `/en/industries/health` render editorial with no Adamed trace
- [x] 2.2 Remove `'adamed'` from `lib/payload/order-case-studies.ts`; delete `public/case-studies/adamed/`, `content/case-studies/adamed/draft.en.json`; drop adamed keys from `content/posts/glossary.json` and `content/media/alts.en.json`
- [x] 2.3 `grep -ri adamed` across the repo returns only archive/openspec history; `bun run check` green

## 3. Cover candidates and plan

- [x] 3.1 Receive `PEXELS_API_KEY` from the user; store in `.env.local` only (confirm it is gitignored)
- [x] 3.2 `scripts/case-studies/pexels_candidates.py`: query table (24 studies × brief), landscape only, 4 candidates each, download `w=1920` to the scratchpad
- [x] 3.3 Contact-sheet Artifact: each candidate rendered at the card (2.10) and hero (1.78) crops with study label and Pexels id; flag visible third-party marks; publish and hand the URL to the user
- [x] 3.4 Inspect the stadler-form cover; decide recrop vs Pexels fallback and record it
- [x] 3.5 Laurastar + Mercator: crop the two Downloads PNGs to 1.9:1, encode per design D4; check the Laurastar frame for softness at 1150 px
- [x] 3.6 Collect the user's picks; write `cover-plan.md` (one row per study: current file, verdict, new file, alt PL/EN) and `pexels-provenance.md` (accepted + rejected ids)

## 4. Apply on dev

- [x] 4.1 `lib/payload/apply-cover-refresh.ts`: OPS from the plan; report-first, `--apply`, `--prod` via `targetProdEnv` with blob; upload-if-missing by filename, repoint `cover`, write PL+EN alt, print old→new pairs
- [x] 4.2 Probe prod cover refs + next free `-cover-<n>` per slug before fixing filenames (dev/prod may diverge)
- [x] 4.3 Dev: report → `--apply` → re-run to zero; browser-check PL+EN listing and three heroes (card, hero, OG crops)
- [x] 4.4 `lib/payload/delete-case-study.ts`: single allow-listed slug, media by reference, refcount abort, report-first; dev report → `--apply`; listing shows 47
- [x] 4.5 `refresh-case-study-logos.ts` on dev for pracuj; check the card

## 5. Ship

- [ ] 5.1 `bun run check`, e2e locale-parity; commit on the branch; merge ff to main; deploy
- [ ] 5.2 With explicit per-run approval: `refresh-case-study-logos --prod`, `apply-cover-refresh --prod`, `delete-case-study --prod`; each re-run to zero
- [ ] 5.3 `vercel cache purge --project sociallama-v2 --type cdn -y`; verify listing + heroes + `/branze/health` in a real browser on the deployed host
- [ ] 5.4 Note the deferred trio (dolina-charlotty, power-elements, ed-invest) in the plan as pending client material
