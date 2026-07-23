## 1. Worktree & environment

- [ ] 1.1 Create git worktree `sl-onas-polish` (branch `sl-onas-polish`) as a sibling dir → verify `git worktree list` shows it
- [ ] 1.2 `bun install` in the worktree (no symlinked node_modules) and set `PORT=3001` → verify deps resolve
- [ ] 1.3 Point the worktree at Docker Postgres `:5434`, boot dev on `:3001` → verify `/o-nas` renders the current placeholder page

## 2. Portrait cutouts (8 new members)

- [ ] 2.1 Inspect the 8 raws vs the 3 existing `/public/o-nas/slider/*.png` for target crop/orientation/scale → note per-photo framing plan
- [ ] 2.2 Background-remove all 8 (bria-rmbg + decontam), export transparent PNG → verify alpha channel present, no halo
- [ ] 2.3 Crop/scale each to match the existing 3's head+torso framing; optimize to ~300 KB → verify file sizes and dimensions in range
- [ ] 2.4 Write outputs to `/public/o-nas/slider/{emilia-metryka,paulina-hildebrand,magda-rokicka,oliwia-witewska,martyna-borowik,kornelia-orlik,katarzyna-kaptur,agnieszka-klajbert}.png`

## 3. Team content (PL)

- [ ] 3.1 Expand `oNasTeam.members` in `lib/content/o-nas.ts` to all 11, ordered per the homepage `why-that-works` `TEAM` array
- [ ] 3.2 Fill real bios from the bio doc (trim over-long ones to slider length); remove the `LOREM` usage for members
- [ ] 3.3 Set `role` per member, reconciling doc-vs-site conflicts to the site wording; wire each `photo` path (existing 3 + new 8)
- [ ] 3.4 Verify order matches the homepage grid exactly (spec: onas-team)

## 4. Team content (EN)

- [ ] 4.1 Mirror the 11 members + order in `o-nas.en.ts` with translated bios (EN locale voice) → `satisfies LocalizedONas` compiles
- [ ] 4.2 Verify PL/EN member arrays are structurally identical (same members, same order)

## 5. Projects section — content + component

- [ ] 5.1 Extend `oNasProjects.items` shape with `image` + `href`; fill iRobot / Pracuj.pl / Volvo (name, year, client, image path, `/case-studies/<slug>`)
- [ ] 5.2 Pick one hero image per study from `/public/case-studies/<slug>/` and confirm the choice with the user (screenshot-sample)
- [ ] 5.3 Mirror in `o-nas.en.ts`: English copy + `/en/case-studies/<slug>` hrefs → `satisfies LocalizedONas` compiles
- [ ] 5.4 Update `app/(frontend)/o-nas/sections/projects/index.tsx`: render `item.image` via `next/image`, wrap each card in a link to `item.href` (preserve reveal animation + list semantics)
- [ ] 5.5 Confirm/resolve the open project-year values with the user

## 6. Verification

- [ ] 6.1 `bun run` Biome + TypeScript checks → both green (filter Biome module_resolver panics with `--diagnostic-level=error`)
- [ ] 6.2 Playwright on `:3001`: team slider shows all 11, cycles correctly, no bio overflow (desktop + mobile); cutouts read as one consistent set
- [ ] 6.3 Playwright: project cards show real images and navigate to the correct `/case-studies/<slug>` (PL) and `/en/case-studies/<slug>` (EN)
- [ ] 6.4 Ask the user for visual sign-off on team + projects before considering done (per "verify and ask before shipping")
