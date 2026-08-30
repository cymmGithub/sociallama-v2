# Satus - AI Agent Guide

Engineering standards for this repo live in [AGENTS.md](./AGENTS.md). Read it first.

`AGENTS.md` covers: enforced rules (Biome + TypeScript CI), house style conventions, code patterns, React 19 / Next.js 16 / Tailwind v4 specifics, integrations, and commands.

Shared flows — worktree handoff and closing, migration rules, git/deploy
hygiene — live in the parent guide (`../CLAUDE.md`). This file holds only
sociallama-specific facts.

## Project facts

- Local Postgres runs in the `sociallama-postgres` container on **:5434**;
  the shared dev database is `sociallama_dev`.
- Isolated worktree DBs are seeded by the four scripts listed in the
  `"worktree"` config in `package.json` (base content, case studies, social
  platforms, authors).

## Case-study content lives only in the database

The Polish drafts that seeded the 48 studies are gitignored and no longer on
disk, so image/text edits are **Payload scripts, not file edits**, and have no
`git revert` — the script's own dry-run output is the rollback instruction.
Rules every such script follows (see `lib/payload/detach-comment-screenshots.ts`
for the reference shape):

- **Key on filename, never media id.** Ids are per-database: dev id 1 is
  `tiktok.png`, prod id 1 is `blog-1.png`.
- **Write both locales.** `approach` is localized as a whole array; PL and EN
  carry separate copies of the pillars pointing at the same media.
- **Use the pillar tag as a guard, not a selector.** Finding the file under an
  unexpected tag means the content moved — abort, don't write.
- **Dry-run by default, `--apply` to write, `--prod` via `targetProdEnv()`.**
  Re-run after applying until it reports zero pending.
- **Never write to prod without explicit per-run approval** — an approved plan
  is not approval to fire `--prod`.

## Creative corner radius

`.shot`'s `border-radius: 18px` is the page's only radius; `.pillarsRecut` /
`RECUT_STUDIES` are gone. A phone-mockup cutout carries its corner **baked in
its alpha channel** (`scripts/case-studies/mockup_cutout.py`), which scales with
the image where CSS does not — the two agree only at the 240px `.shotPortrait`
render width.

The baked radius is a **per-file judgement, not a target**. The split is by
what the creative IS, not which study owns it: a **flat app capture** (a
LinkedIn/Instagram/comment card filling the frame) is cut to 18px, while a
**phone mockup** (visible device body around the screen) keeps the ~38px
corner, because there the corner IS the phone and 18px squares it off. irobot
proves the split runs through a single study: its #HUMOR mockups are 38px,
its flat `edukacja-2` capture is 18px. Never sweep the collection with
`SHOT_RADIUS_CSS_PX`. The 37 `trim`-mode cutouts can never be
re-radiused at all: under their corner is the flood-filled plate, and a smaller
radius uncovers it. Measure before assuming a defect — read the alpha
(`m + sqrt(m)` on row 0) *and* `getComputedStyle` on the live page; a "too
round" report can be the site default.

## Replacing media bytes on prod

`lib/payload/refresh-case-study-creatives.ts <paths…>` updates the existing
media rows in place (never delete+recreate — pillars reference by id). A deploy
alone has never been enough: the bytes ship `max-age=31536000` and
`/_next/image` keeps variants built from them for a year.

**Do not reach for `vercel cache purge` here — it is the wrong tool now.**
Media is served straight from the Vercel Blob store's own CDN
(`<store>.public.blob.vercel-storage.com`, see `lib/blob-store.ts`), and that
purge only clears *this project's* CDN. There is no purge for a blob URL; the
only thing that reaches an already-cached copy is a different URL, which is
Vercel's own documented answer for updated blob content.

So the URL carries the version: the media collection's `afterRead` hook stamps
`?v=<filesize>` on `url`, `thumbnailURL` and every `sizes[*].url`. Replacing
bytes changes the filesize, which changes the URL, which nothing has cached —
for the direct fetch and for `/_next/image` alike. Nothing to run afterwards.
**Verify by reading the version in the rendered `src`**: an unchanged `?v=`
means the upload did not land, and no amount of purging would have fixed that.

Two things this does *not* cover:

- **Assets under `public/`** (the branże walls, client logos on the marquee)
  are still served by this project's CDN. They keep the old contract: bump
  `?v=N` in the source **and** `vercel cache purge --project sociallama-v2
  --type cdn -y`.
- **Verification.** Always check in a real browser — bare `curl` hits a
  different Accept-negotiated cache entry than Chrome and reports false
  success.
