# Client belt logos

Source material for the homepage "ZAUFALI NAM" belt. The pipeline that consumes
it lives at `scripts/client-logos/pipeline.py`; run it from the repo root:

```sh
python3 scripts/client-logos/pipeline.py
```

It writes `public/assets/clients/<brand>.png` for all 31 roster brands plus a
review contact sheet at `.work/contact-sheet.png` (gitignored) rendering every
logo under the belt's resting treatment on the sand band. Review that sheet
before committing the emitted assets — a plate, residue, or washed-out mark
shows up there and nowhere else.

Look specifically for a mark whose **shape** is cut: an arc that stops mid-curve,
a letter sheared off, a stray fragment along one edge. That means the source is a
crop out of a larger layout and the artwork was already truncated before the
pipeline saw it, so no amount of padding downstream can restore it — re-source
the brand. Two repository case-study assets failed this way (`imid-cmv` carried
the tops of a maroon heading, `galeria-rondo-wiatraczna` had its lower arc cut
off) and both had to move to Drive. This cannot be checked mechanically: ink on
the source's border only means the file is tightly cropped, which is true of most
of the roster and perfectly fine.

## Where the sources come from

`raw/` holds the 32 loose files from the approved client set in gDrive,
`TOP MARKI na strone główną`. They are committed so the pipeline is re-runnable
without Drive access. To refresh them:

```sh
rclone copy --drive-root-folder-id 1i3hOxAAUdlrh3zx-G-dgRXKR4pgrCRWZ --max-depth 1 goodone-gdrive: assets-src/client-logos/raw
```

`--drive-root-folder-id` is required: the folder names in that tree have
trailing spaces, which breaks path-based rclone. `--max-depth 1` keeps the 22
case-study deck subfolders out — only the loose logos are belt material.

`raw/film skrzat.webp` is the Skrzat *movie poster*, not the client's mark, and
is never used as a source.

## Why some brands do not use Drive

Source precedence is repository-first. The case-study logos at
`public/case-studies/<slug>/<slug>-logo.png` were curated during their import,
so for 14 brands they are already de-matted and tightly cropped and beat the
Drive copy. Drive wins where the repository asset is an opaque plate, is too
small for the 280×88 output, or does not exist. The per-brand choice is recorded
in `BRANDS` in the pipeline with the reason inline.

## Adding a client

1. Drop the new logo in `raw/` (or rely on its case-study asset).
2. Add a row to `BRANDS` in the pipeline, with a `crop` span if the lockup has a
   secondary line that will not survive 44px.
3. Re-run the pipeline and review the contact sheet. Every logo's scale shifts
   slightly, because normalisation is relative to the roster median — that is
   expected, and the diff should show small changes across the set.
4. Add the brand to `CLIENT_ROSTER` in `lib/content/clients.ts`, plus its
   `numbers` copy in `home.ts` and `home.en.ts` if it has a case study.
