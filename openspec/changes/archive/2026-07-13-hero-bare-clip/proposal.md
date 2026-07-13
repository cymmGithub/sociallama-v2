# Hero Bare Clip

## Why

The shipped hero clip's impressed beat is too theatrical (whole-body motion, hard mouth-drop) and the retro TV shell is being shelved as a direction — the user wants the reference's (`../sociallama`) bare, right-anchored clip presentation back, with a regenerated clip whose motion is carried by the neck alone and whose expression is subtler.

## What Changes

- **Remove the retro TV shell** entirely: `tv-shell.webp` asset, shell JSX (`role="img"` wrapper, screen rect, glass overlays) and shell CSS. The hero video composites directly onto the `#892f53` chapter background, right-anchored, as in the reference implementation.
- **The seamless-composite gate returns for the hero clip**: the shell's bezel/vignette no longer absorb background drift, so the hero clip is again subject to `verify-clip-bg.ts` against `#892f53`. Seam strategy (user decision): post-tint the winning take's flat background to render as the token, then verify — never adjust the token.
- **Regenerate the hero clip via Higgsfield** with the wide reference composition (llama right-anchored, empty plum left where the headline overflows — NOT the current tight 4:3 head-and-chest): only the neck turns screen-left, body/shoulders static, subtle impressed beat (attentive ears + slightly parted mouth at most; no theatrical mouth-drop or pull-back). *(Outcome 2026-07-13: the neck-only take passed its checklist but was rejected by the user on feel; final clip reuses the 2026-07-12 take — job `0f18d4c8` — tail-trimmed at 4.0s, which cuts the beat's maximal hold. See hero-impressed-clip delta and tasks.md annotations.)*
- **Post-pipeline gains a trim and a tint**: generate 5s → trim to 4s at review (drop the weakest second) → color-tint background to token → all-intra h264 24fps → poster from frame 0 → `verify-clip-bg.ts` gate.
- **The scroll scrub stays exactly as shipped**: track, pin, context ref, `useTempus` seek loop, constants (280vh / HOLD 0.2 / lerp 0.35 / threshold 0.02) all untouched.
- Mobile and reduced-motion paths unchanged (bare looping mobile clip; poster-only reduced motion — poster now renders bare instead of inside the shell).

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `homepage`: hero requirement — the llama video renders bare and right-anchored on the `#892f53` section (no TV shell); still scrubbed by scroll while pinned.
- `hero-impressed-clip`: framing changes to the wide reference composition; motion arc becomes neck-only with a subtle beat; post-pipeline adds the 4s trim and the tint-to-token step; the clip must pass the seamless-composite gate.

### Removed Capabilities

- `hero-tv-shell`: the entire capability (shell asset, measured screen rect, glass overlays, all-states framing, gate exemption) is removed.

## Impact

- `app/(home)/sections/hero/index.tsx` — shell JSX replaced by a bare right-anchored `<video>`/poster; scrub wiring untouched.
- `app/(home)/sections/hero/hero.module.css` — shell styles removed; media column returns to a right-anchored bare-clip layout (reference: video absolute bottom-right, full hero height); headline-overlap comment revised (text now overflows onto the clip's empty plum half, the original invisible-seam design).
- `public/assets/tv-shell.webp` — deleted. `public/clips/hero.mp4` + `hero-poster.jpg` — replaced by the new take.
- `lib/scripts/verify-clip-bg.ts` — hero exemption note removed; hero example restored.
- Higgsfield credits: ~344 available, 45/take, budget 2–4 takes.
- `openspec/specs/hero-tv-shell/` — removed on archive; `hero-scroll-scrub` capability is untouched (its requirements never referenced the shell).
- The archived change's assets (`measure-screen-rect.py`, `tv-shell-generation.md`, `tv-shell-source.png`) stay in the archive for any future shell revival.
