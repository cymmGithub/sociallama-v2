## 1. Share the section-index component

- [ ] 1.1 Move `app/(frontend)/uslugi/services-index.tsx` and `index.module.css` to `components/sections/section-index/`, renaming the export `ServicesIndex` → `SectionIndex` and the prop `services` → `items`; keep the item shape `{ slug, label, summary }` as the generic card contract
- [ ] 1.2 Generalize the `Chrome` prop type so it accepts any locale module whose `chrome` carries `sectionLabel` plus `index: { title, intro, cardCta }` — do not import `LocalizedUslugi` from the shared component
- [ ] 1.3 Update `app/(frontend)/uslugi/page.tsx` and `app/(frontend-en)/en/services/page.tsx` to import `SectionIndex` from its new home; leave their card mapping and metadata untouched
- [ ] 1.4 Verify `/uslugi` and `/en/services` render byte-identically to before the move (screenshot both at 1280px and compare against the pre-move state)

## 2. Industries index content

- [ ] 2.1 Add an `index: { title, intro, cardCta }` block to the `chrome` export in `lib/content/branze.ts`, matching the tone of the `uslugi.ts` index block
- [ ] 2.2 Add the English twin to `lib/content/branze.en.ts` in the established EN voice (playful-but-clean, American spelling); confirm `bun run typecheck` fails before this step and passes after, proving the parity gate is live
- [ ] 2.3 Confirm no per-industry copy was added — `INDUSTRIES` entries in both modules are unchanged in the diff

## 3. Industries index routes

- [ ] 3.1 Create `app/(frontend)/branze/page.tsx`: PL metadata (title, description, OG, canonical `/branze`, alternates to `/en/industries`, `x-default` → `/branze`), mapping `INDUSTRIES` to `{ slug, label, summary: tagline }` and rendering `SectionIndex` inside `<Wrapper theme="plum">` with `base="/branze"`
- [ ] 3.2 Create `app/(frontend-en)/en/industries/page.tsx` as the EN mirror, with `base="/en/industries"` and reversed alternates
- [ ] 3.3 Add a `line-clamp` to the card body in `section-index/index.module.css` so a long tagline cannot break card alignment; verify against the longest tagline in each locale
- [ ] 3.4 Confirm both routes return 200 and list 12 cards in canonical order, and that every card link resolves

## 4. Footer restructure

- [ ] 4.1 In `lib/content/home.ts`, remove `{ label: 'USŁUGI', href: '/uslugi' }` from the footer NAWIGACJA column and insert a new USŁUGI column between NAWIGACJA and OFERTA listing the seven service detail routes in canonical order
- [ ] 4.2 Mirror the same restructure in `lib/content/home.en.ts` — remove `SERVICES → /en/services` from NAVIGATION, add a SERVICES column of the seven `/en/services/<slug>` routes; NAVIGATION still carries no BLOG link
- [ ] 4.3 Update `components/layout/footer/footer.module.css`: replace the single `--desktop` grid rule with a two-band layout — `repeat(2, minmax(0, 1fr))` from 800px, and `1.2fr 0.9fr 0.9fr 1.5fr 1.1fr` from 1200px
- [ ] 4.4 Verify OFERTA keeps its `data-cols="2"` sub-grid in both bands (12 links still trips the `>= 9` threshold in `components/layout/footer/index.tsx`)
- [ ] 4.5 Screenshot the footer at 375px, 800px, 1024px, 1280px and 1600px in both locales; confirm no horizontal overflow and no orphaned track

## 5. Clear the pending-page bookkeeping

- [ ] 5.1 Flip `hasIndex` to `true` for the `/branze` ↔ `/en/industries` pair in `lib/i18n/slug-map.ts` and delete the "no index pair yet" comment
- [ ] 5.2 Add `{ path: '/branze', priority: 0.8 }` and `{ path: '/en/industries', priority: 0.8 }` to the industry block in `app/sitemap.ts`, matching how the services block lists its index
- [ ] 5.3 Update `lib/i18n/slug-map.test.ts`: `sectionFor('/branze').hasIndex` is now `true`, `counterpartPath('/branze')` is `/en/industries`, and `counterpartPath('/en/industries')` is `/branze`
- [ ] 5.4 Delete `PENDING_PAGES` and its comment block from `e2e/locale-routing.e2e.ts`, remove the `PENDING_PAGES.has(target)` skip, and add `{ from: '/branze', to: '/en/industries' }` to the locale-toggle pair list

## 6. Verification

- [ ] 6.1 Run `bun run check` (biome + tsc + bun test + manifest) and confirm it passes clean
- [ ] 6.2 Run `bun run test:e2e -- locale-routing` and confirm the chrome sweep passes in both locales with no exemptions
- [ ] 6.3 Walk the mobile overlay menu on a real viewport in both locales and confirm both "more" links resolve
- [ ] 6.4 Confirm no footer link in either locale resolves to `/uslugi`, `/en/services`, `/branze` or `/en/industries`
- [ ] 6.5 Review the diff for an unrelated copyright-year bump in `lib/content/home.ts` (known `bun run build` side effect) and revert it if present

## 7. Follow-ups to raise, not fix here

- [ ] 7.1 Flag the pre-existing drift between the `site-nav` menu-overlay spec text and the shipped menu — the spec lists `Szkolenia i kursy (/szkolenia)`, which is commented out of `lib/content/home.ts`, and omits Kampanie reklamowe, which ships. Carried over verbatim in this change's delta rather than silently rewritten; needs its own change
