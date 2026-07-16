# Tasks: join-cta-rotator

## 1. Asset generation (Higgsfield pipeline)

- [x] 1.1 Write the nine per-slot prompts (shared base clause + one themed accent each: Facebook, Instagram, TikTok, LinkedIn, Pinterest, X, YouTube, strategia, wideo) using `public/clips/hero-poster.jpg` as character/style reference; flat `#722341` background, 1:1 aspect
- [x] 1.2 Generate 2–3 candidates per slot via Higgsfield MCP `generate_image`; curate one per slot for character consistency (reject off-character llamas)
- [x] 1.3 Post-process each pick: grade/flatten background to exact `#722341` (fallback per design D4.2: `remove_background` → composite via sharp/ImageMagick); export ~1080×1080 JPG as `public/clips/cta-<slug>.jpg`
- [x] 1.4 Gate all nine: `bun lib/scripts/verify-clip-bg.ts public/clips/cta-<slug>.jpg '#722341'` passes for every asset

## 2. Content model

- [x] 2.1 Reshape `joinCta` in `lib/content/home.ts`: `headingLead: 'POTRZEBUJESZ WSPARCIA'`, `rotator` array of nine `{ token, image, theme }` entries in spec order, keep `button`; remove `clip`/`poster` and `headingEmphasis`
- [x] 2.2 Delete `public/clips/cta-llama.mp4` and `public/clips/cta-llama-poster.jpg`; verify no remaining references (`grep -rn "cta-llama"`)

## 3. Section rework

- [x] 3.1 Convert `app/(home)/sections/join-cta/index.tsx` to a client component with the hero's `{index, prev}` interval state (2600ms), frozen under `prefers-reduced-motion`
- [x] 3.2 Heading rotator markup + CSS: masked `inline-grid` slide (650ms, existing ease token), rotating spans `aria-hidden`, stable `aria-label` with the first-entry phrase; drop the `Video` import
- [x] 3.3 Image stack: nine stacked `<Image>`s in one square grid cell, active-index opacity crossfade (650ms) off the same state; container `role="img"` + label, per-image empty `alt`
- [x] 3.4 Verify layout stability: widest token (`NA PINTEREŚCIE?`) reserves the cell, no clipping, mobile wrap acceptable

## 4. Verification

- [x] 4.1 `bun run lint` and `bun tsc --noEmit` (or repo equivalents) pass
- [x] 4.2 Browser pass on the dev server: word↔image stay index-locked over several cycles; wrap after `W WIDEO?` → `W FACEBOOKU?` is clean; no visible image boundary against the chapter
- [x] 4.3 Reduced-motion pass: first entry static, no transitions; pre-hydration/SSR shows the same first-entry state without layout shift
- [x] 4.4 Pixel-sample the optimizer-served variants at the section's rendered widths against `#722341` (known width-specific corruption guard)
