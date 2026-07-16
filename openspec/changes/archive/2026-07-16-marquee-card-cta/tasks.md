## 1. Content

- [x] 1.1 Add `image` paths to the hover-card testimonials in `lib/content/home.ts` for the clients with delivered portraits (all four verified: Aquael → nartowska, Intrum → gosiewska, Funtronic → treszczotko, Uniphar → szwat); leave the rest photo-less

## 2. Card structure and interactivity

- [x] 2.1 Rework the card markup in `app/(home)/sections/client-logos/index.tsx`: drop `role="tooltip"` (update `keepCardOnScreen`'s selector), add author footer (portrait `<Image>` or initials placeholder derived from the author name) and CTA row with the "Case study →" button
- [x] 2.2 Add the click-tooltip: state + ~2 s auto-hide with timer restart on repeat clicks, bubble copy verbatim "waiting for case study :)"
- [x] 2.3 CSS in `client-logos.module.css`: footer/avatar/initials-placeholder styles, orange CTA pill, ink tooltip bubble with caret, per accepted mock (colors/radius/shadow already match production tokens)
- [x] 2.4 Make the open card reachable: `pointer-events: auto` while open, `::before` hover bridge over the logo↔card gap, open condition covers card hover → verify: cursor can travel logo → card → click CTA without the card closing

## 3. Verification

- [x] 3.1 Belt behavior unchanged: spotlight, edge-shift near viewport edges, pause-on-hover, touch devices still get the plain belt (no cards) — screenshot-sample against the user's :3000 server
- [x] 3.2 Hidden cards intercept nothing: with no logo hovered, elements behind the belt area are clickable/hoverable as before
- [x] 3.3 CTA tooltip: click shows "waiting for case study :)", auto-hides ~2 s, repeat clicks restart the timer, no navigation
- [x] 3.4 Placeholder state: a client without a portrait renders initials on plum gradient; the three with portraits render photos
- [x] 3.5 `bun run lint` + `bun run typecheck` pass (Biome format included)
