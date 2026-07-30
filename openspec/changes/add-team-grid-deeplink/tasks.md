## 1. Content

- [x] 1.1 Add `memberLink: { label, hrefBase }` under `whyThatWorks` in
  `lib/content/home.ts` (`WIĘCEJ`, `/o-nas`) and `lib/content/home.en.ts`
  (`MORE`, `/en/about-us`); confirm `LocalizedHome` picks it up and EN still
  compiles under `satisfies`
- [x] 1.2 Remove the orphaned `teamCta` key from both locales (grep confirms
  no renderer references it)

## 2. Homepage tile link

- [x] 2.1 In `why-that-works/index.tsx`, make the whole tile the link: an
  `inset: 0` `<Link>` overlay sibling of the caption holding only a lucide
  `ArrowRight`, href `${hrefBase}?lama=${slug}#zespol` where slug = `cut` minus
  `.png`, accessible name naming the member (`aria-label` "Więcej: Anna Ozga")
- [x] 2.2 In `why-that-works.module.css`, style the overlay + arrow to house
  patterns: arrow bottom-right on the caption's padding line, hidden at rest,
  revealed on `.tile:hover` and `.tile:focus-within` (opacity transition),
  always visible where `hover: hover` does not apply; captions untouched and
  unshifted in all states
- [x] 2.3 Verify the arrow's contrast over all twelve cutouts. Measured under
  the pixels it actually paints: 3.88:1 worst case (tile 8), well past WCAG
  1.4.11's 3:1 for a graphical object. As a 9.6px text label the same orange
  would have failed AA on seven of twelve tiles — dropping the label is what
  let brand orange stay

## 3. Slider deep-link

- [x] 3.1 In `o-nas/sections/team/index.tsx`, add a module-scope slug helper
  (photo path → filename stem) and a null-rendering `LamaParam` child that
  calls `useSearchParams` inside `<Suspense fallback={null}>` and reports the
  `lama` value upward
- [x] 3.2 Apply the param in an effect keyed on its value: match slug →
  `setIndex` as an instant swap (no `prev` layer, no `busyRef` lock, no enter
  class); unknown/absent slug is a no-op
- [x] 3.3 Confirm no page-level change is needed: `o-nas/page.tsx` and
  `en/about-us/page.tsx` mount `Team` as-is, and the build raises no
  `useSearchParams` boundary error. Verified: build exit 0, both routes still
  `○` static, and the repo's own `check-prerender` gate reports `/`, `/en`,
  `/o-nas` pure static (revalidate: false)

## 4. Verification

- [x] 4.1 Playwright (against THIS worktree's own port 3005 — the config's
  `PLAYWRIGHT_PORT` default of :3000 silently tests main): homepage → click
  Martyna Borowik's tile → lands on `/o-nas?lama=martyna-borowik#zespol`,
  scrolled to `#zespol` (section top = 0), Martyna featured with her *slider*-
  order neighbours behind her (the order-deviation member is the
  regression-proof case)
- [x] 4.2 Playwright: member A → back to homepage → member B features B, both
  by direct load and by client-side nav (Activity keep-alive path);
  `/o-nas?lama=nie-ma-takiej-lamy` features Anna Ozga, identical to `/o-nas`
  with no param
- [x] 4.3 EN pass: twelve links on `/en` carry accessible names "More: …" and
  hrefs `/en/about-us?lama=…#zespol`; clicking lands scrolled to `#zespol`
  with the member featured
- [x] 4.4 Static shell: the prerendered `.next/server/app/o-nas.html` carries
  the team section complete (21 070 bytes, details block + aria-live region
  present). The `LamaParam` boundary is an empty request-time hole
  (`<!--$?--><template id="B:0">`) sitting *before* the header — it swallows
  nothing, and pending holes are this app's norm (`/kontakt` 1, `/` 2).
  Homepage a11y gate green with the twelve new links
  (`PLAYWRIGHT_PORT=3005 bunx playwright test e2e/home.e2e.ts` → 2 passed)
- [x] 4.5 `bun run check`: exactly the 5 pre-existing Biome panics
  (`newsletter.tsx`, `form/hook.ts`, `home.ts`, `home.en.ts`,
  `shopify/cart-context.tsx`) — the documented baseline, unchanged. The three
  warnings inside touched files sit on lines this change did not write
  (`role="group"`, two `hidden || undefined`). `tsc --noEmit` clean, 615 tests
  pass / 0 fail, `manifest:check` up to date, `bun run build` exit 0
