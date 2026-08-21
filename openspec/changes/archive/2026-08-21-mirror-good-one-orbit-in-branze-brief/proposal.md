## Why

On Mac Safari the under-hero brief on `/branze/[slug]` renders its three pillar chips stacked on the hub instead of on the ring. The GOOD ONE wheel on `/o-nas`, which the brief was modelled on, renders correctly on the same machine. A first fix (`ffb12999`, swapping a `display: contents` `<ul>` for a positioned one) is live and the user still sees the collapse. Rather than guess a third time at which Safari quirk is responsible, make the brief orbit structurally the same as the wheel that works.

## What Changes

- Pillar chips become direct children of `.briefOrbit`, exactly as `.logo` is a direct child of `.orbit` in `o-nas/sections/good-one/index.tsx`. The intermediate `.orbitItems` `<ul>` goes away; list semantics move to `role="list"` on the orbit box and `role="listitem"` on each chip.
- `--orbit` is computed with the same formula shape as the wheel (`calc(<fraction> * min(1240px, 100vw - 2 * var(--safe)))`) instead of `min(26rem, 36vw)`, tuned so the desktop size is visually unchanged.
- `text-wrap: balance` is dropped from the chip (the only property there the wheel does not use).
- Dots, track, hub, `--spin`, the IntersectionObserver gate and the mobile chip list are untouched.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `branze-pages`: adds a requirement that the desktop brief orbit shares the GOOD ONE wheel's DOM/CSS structure and renders its chips on the ring in WebKit as well as Chromium.

## Impact

- `app/(frontend)/branze/[slug]/industry-page.tsx` (`IndustryBrief` markup)
- `app/(frontend)/branze/[slug]/industry.module.css` (`.briefOrbit`, `.orbitItems`, `.orbitItem`)
- Any e2e/a11y test that queries the brief chips as `ul > li` (check `tests/`).
- No schema, DB, or content change. Deploy is the normal ff push to main.
