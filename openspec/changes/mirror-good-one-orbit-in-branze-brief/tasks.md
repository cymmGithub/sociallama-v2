## 1. Markup

- [ ] 1.1 In `IndustryBrief` (`industry-page.tsx`), remove the `<ul className={s.orbitItems}>` wrapper; render each pillar as `<div role="listitem" className={s.orbitItem} style={{'--base': …}}>` directly inside `.briefOrbit`, after `.orbitTrack` and before `.orbitHub`, matching the child order in `o-nas/sections/good-one/index.tsx`.
- [ ] 1.2 Add `role="list"` to `.briefOrbit`; ensure the track/svg/dots carry `aria-hidden` and decide whether the hub `<p>` sits inside the list (keep it readable; see design).
- [ ] 1.3 Update the comment above `IndustryBrief` to name the wheel as the structural reference.

## 2. CSS

- [ ] 2.1 Delete `.orbitItems` and its explanatory comment; replace with a two-line note pointing at `good-one.module.css` `.orbit`/`.logo`.
- [ ] 2.2 Change `--orbit` on `.briefOrbit` to the wheel's formula shape (`calc(<fraction> * min(1240px, 100vw - 2 * var(--safe)))`); measure `.briefOrbit` width at 1024/1280/1440 before and after and keep the delta under a few px.
- [ ] 2.3 Remove `text-wrap: balance` from `.orbitItem`; leave the rest of its declarations untouched.

## 3. Verification

- [ ] 3.1 Playwright chromium + webkit: load `/branze/elektronika-i-agd` at 1280×800 and 1440×900, read `getBoundingClientRect` for each `.orbitItem` and `.orbitHub`; assert distinct chip centres at ~`--item-r` from the hub. Save screenshots to the scratchpad.
- [ ] 3.2 Grep `tests/` for selectors on the brief chips (`orbitItem`, `ul`/`li` under the brief) and update them.
- [ ] 3.3 `bun run check` green (biome, tsc, unit tests).
- [ ] 3.4 After the ff push, ask the user to confirm on Mac Safari and report the Safari version; if it still collapses, capture Computed `--orbit`/`--item-r`/`transform` from Web Inspector before any further change.
