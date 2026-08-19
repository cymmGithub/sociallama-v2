# fix-case-study-covers — tasks

Approved source files are staged at `/mnt/work/goodone/_upscales/` (raw 4K PNGs, 4–11 MB).
Delete that directory once the covers are in.

## 1. Prepare the four cover derivatives

Target: a landscape JPEG near **1.9:1**, long edge ~2400px (the largest consumer is the
2300×1292 retina hero). Do not upload the raw 4K PNGs.

- [x] 1.1 `faktoria-win` — recrop its **existing** `faktoria-win-cover.jpg` (1200×1200). No new
  pixels needed. Starting window: `(0, 158, 1200, 790)` → 1200×632 (1.90:1). Chosen by
  sweeping the band: it keeps the whole "zgrana para" headline and both faces with headroom
  while pushing the black logo badge cleanly out of frame. A band 6% higher leaves a sliver of
  the badge; 6% lower slices "zgrana". **Verify before accepting.**

  **As built: `(0, 186, 1200, 734)` → 1200×548 (2.19:1), not the proposed window.** Both
  halves of the proposal's claim failed on inspection. Measured on the source, the badge's
  pointed tip ends at row 182 and the "zgrana" x-height begins at row 198 — a 16px gap. The
  proposed top of 158 therefore leaves a 25px black wedge in the hero and og (visible in both
  renders), and pushing it to 186 to clear the badge makes the 2.10 card box eat 30 rows off
  a 1.90 crop and slice "zgrana" instead. No 1.90 full-width band satisfies both.
  Fixing the ratio instead of the band is what resolves it: at 2.19:1 the card never crops
  vertically, so the 12px of headroom the source allows is all the headline needs. Cropping
  left of the badge (938px wide) was rejected — it loses every wine bottle on a wine brand
  and pushes the retina hero to a 2.6x upscale.
- [x] 1.2 `rabkoland` — from `rabkoland-cover-4k.png` (3159×4096). Starting window: rows
  1216–2879 → 3159×1663 (1.90:1), then downscale. Ferris wheel, no text, no faces.
  **As built exactly as proposed**, downscaled to 2400×1263. Swept against bands at 700 and
  1700: 700 cuts more cabins off the top, 1700 pulls the ground buildings into frame.
- [x] 1.3 `kontigo` — from `kontigo-cover-4k.png` (4116×2160). Already **1.905:1** — no crop,
  just downscale and encode.
  **As built: bottom 35 rows trimmed first** → 4116×2125 (1.937:1), then 2400×1239. Those
  rows are a dark-green frame band with no counterpart at the top, so the hero and og — which
  crop horizontally, not vertically — would have rendered it as a lone stripe along the
  bottom edge. The card never shows it either way.
- [x] 1.4 `bioagris` — from `bioagris-cover-4k-logofixed.png` (3291×4096). This is a portrait
  poster: a 1.9:1 band cannot hold both the top logo lockup and the bottom
  "PRZYWRÓĆ ŻYCIE SWOJEJ GLEBIE" headline. Pick one deliberately. Photo-only band starts
  around rows 804–2536. If you drop the logo, note that the logo repair becomes moot for the
  rendered surfaces — it still matters for the stored master.

  **As built: photo band, rows 643–2375** → 3291×1732 (1.90:1), then 2400×1263. The band was
  raised from the suggested 804–2536 because the green panel's gradient starts bleeding in at
  row 2375, not 2534, and it renders as a dark wedge along the bottom of the hero.
  The headline band was built and compared before being rejected: it is a full-bleed
  typographic slab that reads as a banner rather than a cover next to 47 photographs — and
  `cover` is not localized, so a Polish headline would ship untranslated on /en.
  The photo band also keeps the existing alt text true. The logo repair is consequently moot
  for every rendered surface; only the stored master carries it.
- [x] 1.5 **Verify the text on every upscaled derivative against its original at 1:1** before
  going further (new spec requirement). Known-good: `rabkoland` has no text; `bioagris`
  headline and body copy are correct but the logo tagline was regenerated and has been
  repaired; `kontigo` has no in-image copy. Any garbled lettering means the file is rejected.

  **Result: nothing to reject.** Both bands that shipped are text-free — bioagris's crop sits
  below the logo lockup and above the headline panel, and kontigo's shelf, jars and glove
  mould carry no lettering in either file (compared at 1:1 against `kontigo-cover-2.jpg`).
  The one thing worth recording: rabkoland's cabin undersides carry a painted floral mark
  that the upscaler redrew as pseudo-handwriting squiggles. It is decoration, not a word, in
  both files and measures ~10px in the hero — so it falls under the "no legible lettering"
  scenario rather than the fabrication one.

## 2. Verify the compositions on the real boxes

- [x] 2.1 Composite each derivative into the three live crop windows — card **418×199**
  (2.10), hero **1150×646** (1.78), OG **1200×630** (1.90) — using clamped `object-fit: cover`
  maths, and confirm the subject survives all three. Same method as
  `2026-08-12-fix-blog-cover-focal-point` task 3.1.
  Boxes re-measured in headless Chromium against `:3014` rather than taken on trust: card
  418×199 at 1440 and hero 1150×646 both hold. **The card box is not a fixed ratio, though** —
  sweeping the viewport from 320 to 2560 puts it between 1.869 (at 2560) and 2.497 (at 800,
  where the grid is still 3-up). Every cover in the collection is graded at the audit's
  1440 reference box, and these four are held to the same standard; faktoria-win's 2.19:1 was
  additionally chosen to survive the 390 and 1024 boxes, which a 1.90:1 crop does not.
- [x] 2.2 Confirm no headline, wordmark or logo is sliced in any of the three boxes.

## 3. Write to the development database first

- [x] 3.1 Extend the `PLAN` in `lib/payload/apply-case-study-imagery.ts` with the four cover
  swaps. Targets are keyed by **filename, never media id** — ids differ per database. Supply
  `altPl` / `altEn` for each new row.
  Two of the four chain off an earlier pass rather than off the original: the dev and prod
  covers are `kontigo-cover-3.jpg` and `bioagris-cover-3.jpg`, not `-cover.jpg`, so those are
  the filenames the ops detach. Keying them on the original would have printed
  "already replaced" and written nothing. New files land as `faktoria-win-cover-2.jpg`,
  `rabkoland-cover-2.jpg`, `kontigo-cover-4.jpg`, `bioagris-cover-4.jpg`.
- [x] 3.2 Dry run (report-only, the script's default), review the per-image output, then
  `--apply` against the development database.
  Dry run reported exactly four pending swaps and no collateral edits; the other 35 ops
  reported "already replaced". Applied as media 687–690. `content/media/alts.en.json` was
  left untouched by design — it tracks production ids — and the English alts still went
  straight onto the media rows.
- [x] 3.3 Verify all four in the browser on `:3014` — the `/case-studies` listing cards and
  each study's own hero — before touching production.
  All four cards and all four heroes render the new files. Payload generated `og` at
  1200×630 for every one, faktoria-win's 1200×548 master included — its width is not *below*
  1200, which is what the enlargement rule tests. Blank cards on a first pass were the
  standing media rate limiter, not these files: the same run logged 93 failed requests
  spanning covers this change never touched (irobot, asus), and each of the four loads
  cleanly once the window clears.

## 4. Production

- [x] 4.1 Re-run against production with `--prod --apply`, with `BLOB_READ_WRITE_TOKEN_PROD`
  mapped onto the plugin's name for that one process. Never assign it in a `.env` file.

  **The run refuses without that token** rather than trusting the operator to remember.
  Without it the Blob plugin is simply not installed (`payload.config.ts` gates it on the
  variable), so the bytes go to local disk while the production rows it just created point at
  files that exist on one laptop — and re-running does not repair it, because the importer
  dedupes on the row. `lib/payload/prod-env.ts` (`targetProdEnv(script, { blob: true })`,
  landed on main in parallel with this change) both enforces that and maps
  `BLOB_READ_WRITE_TOKEN_PROD` onto the plugin's name itself, so the inline assignment the
  task text describes is no longer needed at the call site.

  **The run also exposed a second, quieter trap, and the filenames had to change because of
  it.** Payload does not refuse a colliding upload, it renames one — and `getSafeFileName`
  tests `staticPath` on the *local filesystem* as well as the target database, even when a
  storage adapter is sending the bytes to Vercel Blob. The development run has no token, so
  its bytes land in this worktree's `media/`; the production run minutes later found them
  there and shipped `faktoria-win-cover-3.jpg` where the plan said `-cover-2.jpg`, and
  `kontigo-cover-5.jpg` where it said `-cover-4.jpg`. The log gives no hint, because it
  prints the requested name.
  That is fatal to a plan whose only cross-database identifier is the filename, so:
  the four files and their plan entries were renamed to the generation production actually
  stored, development was rolled back and redone under those names, and `findOrCreateMedia`
  now asserts the stored filename matches the one asked for and throws if it does not.
- [x] 4.2 Re-run until it reports zero remaining changes — a long production pass keeps
  writing after its shell returns, so "Applied:" is the only proof it finished.
  Worth knowing before the next run: the plan is applied in full, not just this change's rows,
  so a first production pass also shipped `produkty-cukiernicze-brzesc-cover-3.jpg` — an op
  from the earlier imagery change that had never reached production. Its cover was already
  correct, so nothing repointed; it is one extra media row.
- [x] 4.3 Spot-check the generated `og` size on `faktoria-win`: it is the case that motivated
  recropping instead of setting a focal point, so confirm the share image now carries the new
  composition rather than the old centered crop.

## 5. Verify and close

- [x] 5.1 `bun run check` from the worktree.
  Green: biome clean, tsc clean, 671 tests pass, `COMPONENTS.md` up to date. Read the exit
  code, not the tail of the log — the chain's four `internalError/panic` files
  (`components/ui/form/hook.ts`, `lib/content/home*.ts`, `lib/content/uslugi.test.ts`) and 47
  nursery warnings are pre-existing and do not fail it.
- [x] 5.2 Re-screenshot the `/case-studies` listing and confirm the four repaired cards sit at
  the same visual quality as the rest of the page.
  All four cards render their new file and sit level with the rest of the grid. Screenshot the
  cards individually with a wait between them, not the page in one shot — a single cold load
  of the listing fires ~96 `/api/media/file` requests against a 60/min limiter, so most covers
  come back blank regardless of which ones you changed.
- [x] 5.3 `openspec archive fix-case-study-covers --yes`, then commit the archive **into the
  feature commit** — never as a separate archive commit.
