# Tasks — refine-sprzedaz-purchase-journey

## 1. Assets

- [ ] 1.1 Download Pexels photo 20336139 at source resolution (browser-UA
      trick — plain curl 403s, `api.pexels.com` needs a key) and produce two
      crops: `public/assets/sprzedaz-journey-post.jpg` (4:5, full
      composition, ~1080×1350) and `public/assets/sprzedaz-journey-packshot.jpg`
      (square, text-free product region, ~1080×1080); optimize to sane JPEG
      weights (target ≤150 KB each).
- [ ] 1.2 Grep for `sprzedaz-` asset references to confirm the six
      `public/assets/sprzedaz-*.png` mockups are used only by the SPRZEDAŻ
      stage content; delete them in the same commit as the content swap.

## 2. Content layer

- [ ] 2.1 Widen the stage union in `lib/content/home.ts` types with the
      `journey` kind: five typed steps carrying all vignette strings (post
      handle, pill, headline, caption; CTA label; shop URL text; product
      name + price; cart lines; receipt title, order line, rows) plus
      per-step role captions (verb + tail), step labels for a11y, and the two
      image srcs with alts.
- [ ] 2.2 Replace the SPRZEDAŻ item's `panels` stage with the `journey`
      descriptor in `home.ts` (PL copy from the approved mock: TWORZYMY /
      CELUJEMY / PROWADZIMY / DOMYKAMY / MIERZYMY strips, "twojamarka",
      "Mydła naturalne", 59 zł, `#8412` receipt) and update the tab `body`
      copy to the "od posta do zamówienia" framing (keep ` ` nbsp
      conventions).
- [ ] 2.3 Mirror the descriptor in `home.en.ts` in the approved EN voice
      (WE CREATE / WE TARGET / WE DRIVE / WE CLOSE / WE MEASURE, "Natural
      soaps"), keeping structure identical; run the locale-parity test and
      make it pass.

## 3. Journey stage rendering

- [ ] 3.1 Add a `JourneyStage` component in
      `app/(frontend)/(home)/sections/services/index.tsx`: five vignette
      cards (post, CTA chip, browser, cart, receipt) built from the
      descriptor with lucide icons (Heart, MessageCircle, Send, MousePointer,
      Link, Lock, ShoppingCart, Check), numbered step chips, and role caption
      strips; branch `StageMedia` on the `journey` kind via an `'in'` check.
- [ ] 3.2 Render the dashed SVG flow path (decorative, `aria-hidden`,
      `preserveAspectRatio="none"`) z-indexed between the backdrop and the
      cards, with positions matching the mock.
- [ ] 3.3 Add sprzedaż journey slot geometry to `services.module.css`
      (replacing the six device slots): five absolute slots per the mock
      (post far left, CTA chip below-right, browser center hero, cart
      right-lower, receipt far right), height-driven sizing with vw caps, and
      wire the cards into the existing staggered-entrance vocabulary so steps
      enter 01→05.
- [ ] 3.4 Implement the condensed mobile variant: `JourneyStage` with a
      `condensed` flag rendering steps 01/03/05 in the stacked stage (the
      generic `limit` prop stays untouched for other tabs).

## 4. Verification

- [ ] 4.1 `bun run check` (Biome + TypeScript) and the content test suite
      pass, including locale parity.
- [ ] 4.2 Playwright screenshot pass of the settled SPRZEDAŻ stage at 800,
      1280, 1440, and 1600+ px widths and the mobile stack: captions legible,
      no card/path collisions, no horizontal overflow, stagger plays 01→05 on
      tab activation.
- [ ] 4.3 Reduced-motion check: stage renders settled with no entrance
      animation and full progress bars, journey fully readable.
- [ ] 4.4 Production build (`bun run build`) succeeds; confirm no references
      to the deleted `sprzedaz-*.png` remain (grep + build output).
