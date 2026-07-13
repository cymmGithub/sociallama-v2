## 1. Content

- [x] 1.1 Extend the `Client` type in `lib/content/home.ts` with `testimonial?: { quote: string; author: string; company: string }`
- [x] 1.2 Populate all 13 client entries: 4 verified quotes verbatim from the content export (Funtronic — Piotr Treszczotko, Intrum Justitia — Katarzyna Gosiewska, Uniphar — Marta Szwat, Aquael — Beata Nartowska) and 9 lorem placeholders attributed to "Imię Nazwisko, {company}", each preceded by `// TODO: placeholder — replace before launch`

## 2. Hero + belt share the first viewport

- [x] 2.1 Restructure chapter 1 in `app/(home)/page.tsx`: wrap `<Hero />` + `<ClientLogos />` in a `100svh` flex-column so the hero takes `flex: 1` and the belt pins to the bottom
- [x] 2.2 Remove `min-height: 100svh` from `hero.module.css` (the wrapper owns viewport height) and add a `min-height` floor to hero content so short viewports (~660px) push the belt below the fold instead of crushing the headline
- [x] 2.3 Verify no ancestor of the belt (wrapper, `Chapters`) introduces y-axis `overflow: hidden`/`clip` that would decapitate the cards; verify layout at ≥800px and ~660px heights

## 3. Hover behavior in client-logos

- [x] 3.1 Enable `pauseOnHover` on the `<Marquee>` in `app/(home)/sections/client-logos/index.tsx`
- [x] 3.2 Add spotlight dimming CSS: `.track:has(.item:hover)` dims non-hovered logos hard, hovered logo goes to full opacity; keep the white-silhouette filter untouched; gate to `@media (hover: hover) and (pointer: fine)`
- [x] 3.3 Convert `ClientLogos` to a client component and render the testimonial card (quote, author, company, down-caret) inside each logo `<li>`
- [x] 3.4 Style the card: absolutely positioned above the logo, fade-and-rise transition, `pointer-events: none` and hidden at rest, revealed on `.item:hover` (fine pointers only), stacked above the belt's edge fades
- [x] 3.5 Port the `keepCardOnScreen` edge-shift handler from the reference: on `li` mouseenter, measure the card rect and set `--shift` so the card stays inside the viewport with a safe margin; caret counter-shifts (`clamp`) to stay over the logo
- [x] 3.6 Raise the client-logos section's `z-index` above the hero so open cards render on top of hero copy/video

## 4. Verification

- [x] 4.1 Desktop mouse: belt pauses on hover, spotlight dims the rest, cards open with caret aligned; edge logos keep their cards fully on-screen
- [x] 4.2 All 13 logos show a card: 4 real quotes render verbatim, 9 lorem placeholders render and each has a grep-able TODO in `lib/content/home.ts`
- [x] 4.3 Touch emulation: no spotlight/cards, belt scrolls continuously; screen reader tree exposes each client once (duplicate marquee copy aria-hidden); reduced-motion behavior is no worse than before
- [x] 4.4 `pnpm` typecheck + Biome pass; visual check of first viewport at standard and short heights
