## 1. Worktree & environment

- [x] 1.1 Create git worktree `sl-onas-polish` (branch `sl-onas-polish`) as a sibling dir → verify `git worktree list` shows it
- [x] 1.2 `bun install` in the worktree (no symlinked node_modules) and set `PORT=3001` → verify deps resolve
- [x] 1.3 Point the worktree at Docker Postgres `:5434`, boot dev on `:3001` → verify `/o-nas` renders the current placeholder page

## 2. Portrait cutouts (8 new members)

- [x] 2.1 Inspect the 8 raws vs the 3 existing `/public/o-nas/slider/*.png` for target crop/orientation/scale → note per-photo framing plan
- [x] 2.2 Background-remove all 8 (bria-rmbg + decontam), export transparent PNG → verify alpha channel present, no halo
- [x] 2.3 Crop/scale each to match the existing 3's head+torso framing; optimize to ~300 KB → verify file sizes and dimensions in range
- [x] 2.4 Write outputs to `/public/o-nas/slider/{emilia-metryka,paulina-hildebrand,magda-rokicka,oliwia-witewska,martyna-borowik,kornelia-orlik,katarzyna-kaptur,agnieszka-klajbert}.png`

## 3. Team content (PL)

- [x] 3.1 Expand `oNasTeam.members` in `lib/content/o-nas.ts` to all 11, ordered per the homepage `why-that-works` `TEAM` array
- [x] 3.2 Fill real bios from the bio doc (trim over-long ones to slider length); remove the `LOREM` usage for members
- [x] 3.3 Set `role` per member, reconciling doc-vs-site conflicts to the site wording; wire each `photo` path (existing 3 + new 8)
- [x] 3.4 Verify order matches the homepage grid exactly (spec: onas-team)

## 4. Team content (EN)

- [x] 4.1 Mirror the 11 members + order in `o-nas.en.ts` with translated bios (EN locale voice) → `satisfies LocalizedONas` compiles
- [x] 4.2 Verify PL/EN member arrays are structurally identical (same members, same order)

## 5. Projects section — content + component

- [x] 5.1 Extend `oNasProjects.items` shape with `image` + `href`; fill iRobot / Pracuj.pl / Volvo (name, year, client, image path, `/case-studies/<slug>`)
- [x] 5.2 Pick one hero image per study from `/public/case-studies/<slug>/` and confirm the choice with the user (screenshot-sample)
- [x] 5.3 Mirror in `o-nas.en.ts`: English copy + `/en/case-studies/<slug>` hrefs → `satisfies LocalizedONas` compiles
- [x] 5.4 Update `app/(frontend)/o-nas/sections/projects/index.tsx`: render `item.image` via `next/image`, wrap each card in a link to `item.href` (preserve reveal animation + list semantics)
- [x] 5.5 Confirm/resolve the open project-year values with the user

## 6. Verification

- [x] 6.1 `bun run` Biome + TypeScript checks → both green (filter Biome module_resolver panics with `--diagnostic-level=error`)
- [x] 6.2 Playwright on `:3001`: team slider shows all 11, cycles correctly, no bio overflow (desktop + mobile); cutouts read as one consistent set
- [x] 6.3 Playwright: project cards show real images and navigate to the correct `/case-studies/<slug>` (PL) and `/en/case-studies/<slug>` (EN)
- [~] 6.4 Visual sign-off in progress — projects + reordered team approved; further visual tweaks pending from the user

## 7. Post-review adjustments (client-directed during sign-off)

- [x] 7.1 Reorder the homepage `why-that-works` `TEAM` grid to position-priority (leadership → managers → senior specialists → experts → specialist → creator); re-sync the slider to match. Homepage grid is no longer read-only but stays the ordering source of truth.
- [x] 7.2 Temporarily exclude Paulina Hildebrand + Katarzyna Kaptur from the slider (commented out in both locales, parity preserved, 9 shown) — their only source photos are low-res square crops that can't match the front-facing head+torso set. Re-enable when proper photos arrive. Rationale + re-enable steps recorded in the content files and proposal.md.
