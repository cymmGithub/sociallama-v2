# Design: testimonial-depth-rail

## Context

The testimonial section (`app/(home)/sections/testimonial/`) renders a quote stage (pull-phrase + full quote, stacked-grid layout-stable transitions) and a vertical rail of all three clients that doubles as the only navigation. Autoplay is a 7 s setTimeout chain; the progress bar is a pure CSS `scaleX` animation keyed off `aria-selected`. The rail is static flow layout: three `role="tab"` buttons, borders between rows, ~118 px per row.

The accepted design (Mock B of three live-page mocks — see proposal) turns the rail into a centered window over six entries: three full rows in the middle band, the previous/next entries whole-but-receded (scale ≈0.68, opacity ≈0.22, slight blur), the sixth hidden. One row slides per autoplay tick so the active row stays centered.

## Goals / Non-Goals

**Goals:**
- Six testimonials with the rail visibly communicating "more than three exist".
- Preserve today's middle-band emphasis, active-row treatment, progress bar, autoplay engine, touch-stop behavior, and reduced-motion handling.
- Layout-stable: rail height fixed; sliding never shifts the section or content below.

**Non-Goals:**
- No changes to the quote stage design (it just gains three slides).
- No pause-on-hover reintroduction (removed deliberately in 9ed60a5).
- No generalized carousel component — this stays a bespoke section.

## Decisions

### 1. Slot-based positioning, not a translated track

Each rail row computes a slot from its wrap-around offset to the active index: `offset = ((i - active) % 6 + 6) % 6`, remapped to `-2…+3`. Slots: `-1/0/+1` = full band (0 = active), `±2` = receded, `+3` = hidden. All six rows stack in one fixed-height viewport (CSS grid single cell or absolute), each positioned by `translateY(slot × step)` with transitions on transform/opacity/filter — rows glide to their new slots when `active` changes.

*Why not a translated track (the mock's implementation)?* A linear track needs entry clones for wrap-around cycling and re-anchoring hacks when the window passes the ends. Slot math makes wrap-around free and keeps one DOM node per testimonial (progress bar, `aria-selected`, and React keys stay trivial).

### 2. Wrap-around teleport hidden inside the hidden slot

When a row's slot jumps across the stack (e.g. `+3 → -2`), it must not visibly fly over the rail. The hidden slot renders `visibility: hidden` and rows entering or leaving it get `transition: none`, so the teleport happens while invisible. `visibility: hidden` also removes the sixth row from the a11y/focus order — the tablist exposes the five visible tabs, and the hidden entry re-enters the order as it cycles back in.

### 3. Receded rows stay interactive

The `±2` rows remain real `role="tab"` buttons: clicking one selects it and the rail recenters (existing `pick()` semantics: restart rhythm on hover devices, stop autoplay on touch). Their reduced opacity is presentation only; focus-visible lifts them to full opacity as it already does for dimmed rows.

### 4. Autoplay engine untouched

The setTimeout chain, 7 s cycle, progress-bar CSS animation, touch-stop, and reduced-motion gates all stay as-is. `COUNT` simply becomes 6. Centering falls out of the slot math — no new timer logic.

### 5. Mobile: cropped edge peeks, not depth scaling

The horizontal chip strip shows three full chips with the previous/next chips half-cropped at the strip's left/right edges (overflow window + gradient mask), same slot math on the X axis. Cropping (Mock A treatment) is used here deliberately instead of depth scaling: at chip size (~avatar + name) a 0.68-scale chip is illegibly small, while a half-cropped chip reads clearly as "more to the side".

### 6. Placeholder content pattern

The three new entries in `lib/content/home.ts` follow the existing `TODO(sign-off)` launch-blocker convention (see the Uniphar pull-quote): generic names, blurred/greyscale placeholder portraits under `public/assets/`, no logos, and a `TODO(content)` comment. Real content swaps in without touching the component.

## Risks / Trade-offs

- [Rail grows ~354 → ~511 px] → The stage column is taller than the old rail, so the section grows less than the raw delta; verify short desktop viewports (900 px) where the `data-blur-edge-gate` note says the rail sits low. If it crowds, shrink the receded scale/step before shrinking full rows.
- [CSS `filter: blur()` on moving rows costs paint] → Small area (≤2 rows × ~300 px); if transitions jank, drop the blur first — the scale + dim carry the depth reading on their own (blur is the least load-bearing cue in the mock).
- [Six tabs, five visible] → Screen-reader tab count changes as rows cycle. Acceptable: the set is announced per-tab (`aria-label` already carries "Opinia N"); keep labels indexed 1–6 regardless of slot.
- [Duplicate-looking placeholders until content lands] → Placeholder entries are visually generic (no real faces/logos), and the sign-off TODO blocks launch, same category as existing lorem blockers.

## Migration Plan

Pure front-end change, single deploy, no data or API migration. Rollback = revert commit. Note: the base `testimonial-rail` spec still lives in the unarchived `testimonial-pull-quote-rail` change; archive that change first (it shipped) so this change's deltas apply against `openspec/specs/testimonial-rail/`.

## Open Questions

- Final content for the three new testimonials: verbatim quotes, pull-phrases (+ highlight words), author photos, company logos (white-knockable SVG/PNG). **Blocking launch, not implementation.**
- Do all three new clients have logos cleared for use? (Rail rows render a logo above the name; a row without a logo is already supported — `t.logo` is optional.)
