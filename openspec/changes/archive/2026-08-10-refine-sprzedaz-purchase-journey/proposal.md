# Refine SPRZEDAŻ stage: purchase-journey collage

## Why

The SPRZEDAŻ tab of the homepage services section currently shows six analytics
dashboards in device frames — a collage that says "we measure growth", not "we
sell". The team wants the tab to explain the actual selling process the agency
runs for clients. A mock (variant A, "journey collage") was reviewed and
approved on 2026-08-10: five UI vignettes — social post → link click → product
page → cart → order confirmation — connected by a drawn path, each carrying a
verb-led caption naming the agency's role in that step.

## What Changes

- Replace the SPRZEDAŻ stage's six device-mockup panels with a five-step
  purchase-journey collage of code-built UI vignette cards:
  1. **Post** — Instagram-style post card with a real product photo and HTML
     text overlays ("NOWOŚĆ" pill, "CZYSTY SKŁAD" headline)
  2. **Klik** — zoomed "KUP TERAZ" CTA chip with cursor + tap ripple
  3. **Strona produktu** — mini browser window (fictional shop
     `twojamarka.pl/mydla`) with a square packshot, product name, price, and
     "DODAJ DO KOSZYKA" button
  4. **Koszyk** — cart chip with badge and line item
  5. **Zamówienie** — confirmation receipt with check badge and order lines
- Cards are connected by a dashed SVG flow path rendered under them and enter
  with the stage's existing staggered entrance, so the funnel plays in order
  on every tab activation.
- Copy System 1 ("pięć czasowników"): each card carries a plum caption strip —
  TWORZYMY / CELUJEMY / PROWADZIMY / DOMYKAMY / MIERZYMY — naming the agency's
  role at that step. Numbered step chips 01–05 mark the sequence.
- All vignette text is real HTML (localizable, crisp), icons are lucide-react;
  the only raster asset is one generic Pexels photo (photo 20336139, free
  licence, no attribution required — natural soap on burnt-orange background,
  no visible brand) used in two crops: 4:5 for the post, square for the
  packshot.
- The SPRZEDAŻ tab column body copy is rewritten to close the loop:
  "Prowadzimy Twojego klienta od posta do zamówienia: kreacja, klik, sklep,
  koszyk. Sprzedaż jest dla nas jednym z najważniejszych mierników
  skuteczności." (EN twin in the same voice.) The closing sentence keeps
  sprzedaż as *one* measure rather than dismissing reach outright — the
  framing `bodyLong` already uses on the same item.
- Mobile stack stage shows a condensed three-step journey — post (01), strona
  produktu (03), zamówienie (05) — so the story still completes instead of
  cutting off mid-funnel (the previous "first three items" rule would strand
  the story at the shop page).
- The six dashboard exports (`public/assets/sprzedaz-*.png`) **stay**. The
  grep that was meant to clear them for deletion found a second consumer:
  `/uslugi/sprzedaz` reuses all six as its platform dashboards
  (`lib/content/uslugi.ts` + `uslugi.en.ts`, "O1: reuse of the homepage's six
  sprzedaż dashboard panels"), and that page is an explicit non-goal here. The
  homepage stage simply stops referencing them.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `services-autoplay-tabs`: the per-tab stage media union gains a `journey`
  stage kind (typed step content rendered as positioned vignette cards with a
  connecting path), and the SPRZEDAŻ scenarios change from "device-framed
  dashboards render unchanged" to the five-step purchase-journey collage with
  role captions, desktop slot geometry, and the condensed mobile subset.

## Impact

- `lib/content/home.ts` / `lib/content/home.en.ts` — SPRZEDAŻ item: new
  `journey` stage descriptor (step labels, captions, product strings, alt
  texts) and new `body` copy; must satisfy the locale-parity test.
- `lib/content/home` types — stage union widened with the `journey` kind.
- `app/(frontend)/(home)/sections/services/index.tsx` — new journey stage
  renderer branch (cards + SVG path), desktop and mobile variants.
- `app/(frontend)/(home)/sections/services/services.module.css` — sprzedaż
  slot geometry replaced with journey card slots; existing stagger vocabulary
  reused.
- `public/assets/` — two new crops of the Pexels photo added
  (`sprzedaz-journey-post.jpg`, `sprzedaz-journey-packshot.jpg`); the six
  `sprzedaz-*.png` device mockups stay (still used by `/uslugi/sprzedaz`).
- `lib/content/locale-parity.test.ts` — the stage-media comparison learns the
  `journey` kind (crops, step order, and the fictional shop's identity).
- Reference mock: session artifact "SPRZEDAŻ stage — 3 kierunki" (variant A,
  copy System 1, Pexels product) — the approved visual target.
