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
media rows in place (never delete+recreate — pillars reference by id). After a
`--prod` run, a deploy is **not** enough: `/api/media/file/*` ships
`max-age=31536000` and `/_next/image` keeps variants built from the stale
upstream for up to a year. Finish with
`vercel cache purge --project sociallama-v2 --type cdn -y`, then verify in a
real browser — bare `curl` hits a different Accept-negotiated cache entry than
Chrome and reports false success.
