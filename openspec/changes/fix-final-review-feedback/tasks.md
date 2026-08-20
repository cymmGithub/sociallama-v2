# Tasks: fix-final-review-feedback

## 1. Orbit overlap fix (branże pages)

- [ ] 1.1 Reproduce the overlap: load a branże page at ~1100px viewport width, screenshot the "DLACZEGO TO DZIAŁA" orbit; identify why the hub kicker and the "Personal branding ekspertów" node stack (breakpoint band vs. z-index vs. geometry) — `app/(frontend)/branze/[slug]/industry-page.tsx:484`, `industry.module.css` orbit vars (~:894)
- [ ] 1.2 Fix the layout per design D1 (geometry, not `display:none`); verify at mobile (flat kicker), the failing band, and full desktop with before/after screenshots

## 2. Careers page (zostan-lama)

- [ ] 2.1 Remove the benefits section: delete `careers-benefits.tsx`, its mount in `careers-page.tsx`, its content blocks in `zostan-lama.ts` + `zostan-lama.en.ts`, and any styles/types orphaned by this deletion only
- [ ] 2.2 Replace the hero lede in `zostan-lama.ts:207-208` with "Chcesz zdobywać nowe umiejętności w świecie social mediów? Aplikuj do Social Lamy" (review whether the "Aplikuj śmiało i kreatywnie" heading still reads right next to it; heading stays unless it clashes) and translate the lede in `zostan-lama.en.ts`
- [ ] 2.3 Run locale-parity + unit tests; verify the page renders hero → roles → form with nothing between roles and form

## 3. O-nas copy

- [ ] 3.1 Convert the 5 duration bios in `lib/content/o-nas.ts` per design D3 ("Od 5 lat"→"od 2021 roku" :277, "od ponad 4 lat"→"od 2022 roku" :284, "od ponad 12 lat"→"od 2014 roku" :263, "od ponad 10 lat"→"od 2016 roku" :291, "od ponad piętnastu lat"→"od 2011 roku" :329); mirror in `o-nas.en.ts` ("since 2021" etc.)
- [ ] 3.2 Replace the "Coś o Lamie" body in `o-nas.ts` with the Google Doc "Pod www" first-person version, rendering "ponad 13 lat" as "od 2013 roku" (design D4); translate for `o-nas.en.ts`
- [ ] 3.3 Run locale-parity tests; eyeball both o-nas pages

## 4. Contact stats

- [ ] 4.1 In `lib/content/contact.ts:129-132` set fans `500 000` → `514 000` and reach `7 000 000` → `7 260 000` (keep 528 and 80); mirror exact digits in `contact.en.ts`; verify the kontakt metrics section renders and any count-up animation still works

## 5. Case-study content (Payload, dev DB — scripts must be idempotent and log every write)

- [ ] 5.1 Volvo: determine whether "DOM VOLVO" comes from `client.name` or the logo asset (design D6); update `client.name` to "Volvo Car Warszawa & Dom Volvo" via a `payload run` script (fall back to `assets/volvo-title.png` only if the string is baked into the logo image); verify on the CS card + detail page
- [ ] 5.2 Pracuj-pl: null `cover` and every pillar/gallery media reference via the Payload API; check each detached media row for other references and delete only true orphans (design D7); verify the CS page renders acceptably with no images
- [ ] 5.3 iRobot: upload `assets/irobot-cover-roomba.png` as the new `cover`; upload `assets/irobot-humor-parrot.png` and re-point the "#HUMOR / Podkreślenie korzyści i wygody" pillar media at it, replacing all current photos in that pillar; delete orphaned old media (design D8); verify listing card + detail page
- [ ] 5.4 Breville: upload `assets/breville-logo.jpg` (convert to transparent PNG/webp first if the white JPEG box clashes with the card background — design D9) and re-point `client.logo`; delete the orphaned old logo media; verify the listing card
- [ ] 5.5 Run orphan-coverage + full test suite after all CS edits

## 6. Verify, report, close

- [ ] 6.1 Full gate: `bun run lint`, `bun run test`, production build; Playwright screenshots of every touched surface (branże orbit, zostan-lama, o-nas, kontakt stats, 4 CS pages)
- [ ] 6.2 Draft an Asana reply for Przemek to review before posting (never post without approval): what was fixed, the two flagged deviations — "od 2013 roku" instead of the doc's "ponad 13 lat" (D4), and the bio year mapping (D3) — for Ania's sign-off; note prod reseed of CS content is a separate approved step
