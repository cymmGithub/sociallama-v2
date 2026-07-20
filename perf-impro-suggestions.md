# Performance Improvement Suggestions

Source: Lighthouse 13.4 runs against https://sociallama-v2.vercel.app/ on 2026-07-19
(mobile = default throttled preset, desktop = `--preset=desktop`).

## Scores

| Category       | Mobile | Desktop |
| -------------- | ------ | ------- |
| Performance    | **60** | **78**  |
| Accessibility  | 96     | 96      |
| Best Practices | 96     | 100     |
| SEO            | 100    | 100     |

Core metrics:

| Metric | Mobile | Desktop |
| ------ | ------ | ------- |
| FCP    | 2.9 s  | 0.8 s   |
| LCP    | 8.3 s  | 3.6 s   |
| TBT    | 280 ms | 30 ms   |
| CLS    | 0      | 0       |
| Speed Index | 6.2 s | 1.7 s |

CLS and TBT are healthy. The whole performance gap is **LCP**, and mobile vs
desktop fail for different reasons (see LCP breakdowns below).

---

## 1. Desktop LCP: the video swap double-loads the poster

LCP element: the hero `<video>`. Breakdown: **1.25 s resource load delay**;
discovery checklist fails "request is discoverable in initial document".

Mechanism (`app/(frontend)/(home)/sections/hero/index.tsx`): SSR renders the
*optimized* poster (`/_next/image?url=/clips/hero-poster.jpg&w=...`, preloaded).
After hydration, `setMedia('desktop')` swaps in the `<video>` whose
`poster="/clips/hero-poster.jpg"` — the **raw jpg, a different URL**. The
browser fetches it from scratch ~1.2 s in, and when that poster frame paints it
becomes a new, later LCP entry, wiping out the preload benefit.

**Fix options (pick one):**

- Point the video `poster` at the exact same URL the pre-mount `Image`
  rendered, so the swap is a cache hit and paints instantly. Since the mobile
  poster is already served `unoptimized` (color-grading), serving the desktop
  poster unoptimized too makes the URLs trivially identical.
- Or keep the optimized `Image` mounted underneath the video (video without
  `poster`), so no second paint of the same region ever happens.

## 2. Mobile LCP: image loads in 0.5 s, paints at 2.5 s

LCP element: `hero-mobile-poster.jpg`. Discovery checklist fully passes
(preloaded, `fetchpriority=high`, eager). It finishes downloading ~485 ms in,
then sits unpainted for **2.0 s of element render delay** — main-thread
contention from ~2.7 s of script work (hydration, GSAP/Lenis/tempus setup)
under Lighthouse's 4x CPU throttle. No CSS opacity gate is involved.

Related waste: on mobile **both** posters download — `hero-mobile-poster.jpg`
(48 KiB) *and* the desktop `_next/image` poster (29 KiB) — because the desktop
`Image` renders with `preload` and is merely hidden by CSS. A preloaded
high-priority request competes with the actual mobile LCP image.

**Fixes:**

- Don't `preload` the desktop poster variant on mobile (or render it only when
  `media === 'desktop'`; it's invisible pre-hydration on mobile anyway).
- Shave hydration cost (see item 4).

## 3. Initial 307 redirect (~860 ms mobile, ~310 ms desktop)

The very first request to `https://sociallama-v2.vercel.app/` returns a 307
**to the same URL** (74 bytes), then 200. curl doesn't reproduce it — likely
Vercel platform behavior on the preview domain (bot challenge / deployment
routing), not app code. Re-check with PageSpeed Insights on the real production
domain once live; if that domain adds its own redirect hop (http→https,
apex→www), it stacks on top.

## 4. Bundle and byte weight

- **5.4 MiB total on desktop**; `hero.mp4` is 3.3 MiB with `preload="auto"` —
  it downloads in full immediately and competes with the LCP poster for
  bandwidth. The scrub UX needs the full buffer eventually, but the fetch could
  start after first paint (mount with `preload="none"`, flip on
  `requestIdleCallback`/load), or the clip could be re-encoded at a lower
  bitrate.
- **Unused JS:** 225 KiB desktop / 100 KiB mobile. One 73 KiB chunk is 100%
  unused on both viewports. Source maps aren't published (`valid-source-maps`
  fails), so Lighthouse can't attribute it — run the bundle analyzer locally to
  name the culprit.

## 5. Functional bug: broken link to /uslugi/kreacje-wideo

The only console error is a 404 on the RSC prefetch of
`/uslugi/kreacje-wideo`, linked twice in `lib/content/home.ts` (lines 153 and
478). No `/uslugi` route exists and the slug doesn't resolve — users clicking
"DOWIEDZ SIĘ WIĘCEJ" get a 404. Also costs mobile its Best Practices points.

## 6. Accessibility (both viewports at 96)

- **Contrast:** the scrollytelling dimmed text in `#o-nas` (`progress-text`
  spans, `#a49e99` on `#e0ddd3`, ratio 1.94:1). Deliberate "unrevealed" state
  of the scroll effect, but in its resting state it's genuinely hard to read
  for low-vision users. A darker dimmed tone (~`#8a8378` reaches 3:1 for large
  text) keeps the effect while passing.
- **Name mismatch:** the join-CTA card's `aria-label` doesn't contain its
  visible text ("social.lama Sponsorowane…") — screen-reader users navigating
  by visible text can't target it. Include the visible string in the
  accessible name.

---

## Suggested order (impact per effort)

1. Fix the broken `/uslugi/kreacje-wideo` link (user-facing 404).
2. Desktop poster double-load — one-line URL alignment, ~1.2 s of desktop LCP.
3. Drop the desktop poster preload on mobile.
4. Defer the `hero.mp4` fetch until after first paint.
5. Mobile render delay — hardest: cumulative hydration cost of the animation
   stack; gains require trimming/deferring JS, not one targeted fix.

Verify each with a follow-up Lighthouse run after deploy.
