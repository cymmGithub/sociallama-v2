## Context

Both orbits drive a registered `<angle>` `--spin` through a keyframe and place each revolving element with `translate(-50%,-50%) rotate(base+spin) translateY(-r) rotate(-(base+spin))`. The shipped CSS is near identical. What still differs on the branże side:

| | GOOD ONE (`/o-nas`) | branże brief |
|---|---|---|
| revolving element | `<div class=logo>`, direct child of `.orbit` | `<li>` inside a positioned `<ul class=orbitItems>` |
| `--orbit` | `calc(.44 * min(1240px, 100vw - 2 * var(--safe)))` | `min(26rem, 36vw)` |
| `text-wrap: balance` | no | yes |

The earlier fix assumed Safari failed to inherit custom properties through `display: contents`. The symptom persists on the reporter's Mac after that fix, so the real trigger is one of the rows above. We cannot reproduce locally (Playwright WebKit tracks recent Safari; the comment in the CSS already notes recent WebKit never showed it).

## Goals / Non-Goals

**Goals:**
- Zero structural difference between the two orbits apart from content (logos vs text chips) and sizing constants.
- Desktop rendering in Chromium unchanged to the eye.
- Keep list semantics for screen readers.

**Non-Goals:**
- Finding the exact Safari bug. If the user wants the root cause afterwards, that is a separate probe with their Safari version.
- Touching the mobile fallback list or the hub.
- Sharing code between the two orbits. Two copies stay; the wheel's markup is the template, not a dependency.

## Decisions

- **Chips as direct children.** `.briefOrbit` gets `role="list"`; each chip is `<div role="listitem" class=orbitItem style="--base">`. The old `.orbitItems` rule and its long explanatory comment are removed; a two-line comment points at the wheel as the reference structure.
- **`--orbit` formula.** Today's value is `min(26rem, 36vw)`; the brief column is ~44.5vw until the 1240px container caps it. Use `calc(0.36 * min(1240px, 100vw - 2 * var(--safe)))` capped by `min(26rem, …)` only if the measured size at 1440 otherwise exceeds today's 26rem. Implementer measures `.briefOrbit` width at 1024/1280/1440 before and after and keeps the delta under a few px.
- **Drop `text-wrap: balance`.** Cosmetic only; removed so the chip's declaration list is a subset of what the wheel already proves in Safari.
- **Verification.** Screenshot + `getBoundingClientRect` of each chip and the hub in Chromium and WebKit (Playwright). Chips must have distinct centres at ~`--item-r` from the hub centre. Final confirmation is the user's Mac Safari after deploy; that is the only environment that showed the bug.

## Risks / Trade-offs

- The collapse could be a Safari-version parse issue unrelated to all three rows (e.g. `@property` missing in Safari < 16.4). Then the wheel would break too; the user says it does not, so this is unlikely, and the change is still a strict reduction of differences.
- `role="list"` on a `<div>` with `position: relative` children: VoiceOver in Safari announces div lists fine when every child is a `listitem`; the track `<div>`, SVG and hub `<p>` are also children, so they get `aria-hidden` (track/svg already) or sit outside the list. Decide per element during implementation; the hub kicker must stay readable.
