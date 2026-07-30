## 1. Content

- [ ] 1.1 Add `memberLink: { label, hrefBase }` under `whyThatWorks` in
  `lib/content/home.ts` (`WIĘCEJ`, `/o-nas`) and `lib/content/home.en.ts`
  (`MORE`, `/en/about-us`); confirm `LocalizedHome` picks it up and EN still
  compiles under `satisfies`
- [ ] 1.2 Remove the orphaned `teamCta` key from both locales (grep confirms
  no renderer references it)

## 2. Homepage tile link

- [ ] 2.1 In `why-that-works/index.tsx`, render a discrete `<Link>` in each
  tile's caption: content label + lucide `ArrowRight`, href
  `${hrefBase}?lama=${slug}#zespol` where slug = `cut` minus `.png`, accessible
  name including the member's name (e.g. `aria-label` "Więcej: Anna Ozga")
- [ ] 2.2 In `why-that-works.module.css`, style the link to house patterns:
  hidden at rest, revealed on `.tile:hover` and `.tile:focus-within`
  (opacity transition), always visible under `@media (hover: none)`; captions
  untouched in all states
- [ ] 2.3 Verify the link's color contrast on the plum tile gradient meets AA
  at its rendered size (orange on plum only passes as large text — pick
  size/color accordingly)

## 3. Slider deep-link

- [ ] 3.1 In `o-nas/sections/team/index.tsx`, add a module-scope slug helper
  (photo path → filename stem) and a null-rendering `LamaParam` child that
  calls `useSearchParams` inside `<Suspense fallback={null}>` and reports the
  `lama` value upward
- [ ] 3.2 Apply the param in an effect keyed on its value: match slug →
  `setIndex` as an instant swap (no `prev` layer, no `busyRef` lock, no enter
  class); unknown/absent slug is a no-op
- [ ] 3.3 Confirm no page-level change is needed: `o-nas/page.tsx` and
  `en/about-us/page.tsx` mount `Team` as-is, and the build raises no
  `useSearchParams` boundary error

## 4. Verification

- [ ] 4.1 Playwright (against THIS worktree's own port — the config's
  hardcoded :3000 silently tests main): homepage → click Martyna Borowik's
  "WIĘCEJ" → lands on `/o-nas`, scrolled to `#zespol`, Martyna featured (the
  order-deviation member is the regression-proof case)
- [ ] 4.2 Playwright: member A → back to homepage → member B features B
  (Activity keep-alive path); `/o-nas?lama=nie-ma-takiej-lamy` behaves as
  no-param
- [ ] 4.3 EN pass: `/en` tile shows "MORE", lands on
  `/en/about-us?lama=…#zespol` with the member featured
- [ ] 4.4 Static shell: `curl` the prerendered `/o-nas` HTML and confirm the
  team section is present and complete (no Suspense hole); run the homepage
  a11y gate (twelve distinguishable link names)
- [ ] 4.5 `bun run check` on touched files (note: 5 pre-existing Biome panics
  keep the full run red on main — compare against that baseline, don't chase
  them)
