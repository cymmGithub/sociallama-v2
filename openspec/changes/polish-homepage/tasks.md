## 1. Socials — data, assets, order

- [ ] 1.1 Create `public/assets/icon-youtube.svg` and `public/assets/icon-pinterest.svg` as single-color mask silhouettes matching the existing `icon-*.svg` viewBox/padding (they render via CSS `mask-image`)
- [ ] 1.2 In `lib/content/home.ts`, rewrite the `socials` array to the order IG, FB, TikTok, X, LinkedIn, YouTube, Pinterest with real destinations (IG `social.lama`, FB `agencjasociallama`, TikTok `@social_lama`, X `SocialLamaPL`, LinkedIn `company/sociallama`, YouTube `@GOODONEGROUP`, Pinterest `social__lama`) and the two new `icon` paths — no `#` placeholders remain
- [ ] 1.3 Verify each social link opens in a new tab with `rel="noopener noreferrer"` and carries an accessible per-platform label (in the components that render `socials`, no shared-primitive edits)

## 2. USŁUGI menu

- [ ] 2.1 In `lib/content/home.ts` `menu`, extend the USŁUGI column to: Strategia (`/uslugi/strategia`), Content, Sprzedaż, Kreacje & Wideo, Audyt i konsultacje (`/uslugi/audyt-i-konsultacje`), Influencer marketing (`/uslugi/influencer-marketing`), Szkolenia i kursy — on-page Services list untouched

## 3. Glyph kerning

- [ ] 3.1 In `app/(frontend)/(home)/sections/big-marquee/big-marquee.module.css:18`, relax the `-0.02em` tracking until T‑H‑A no longer collide in "THAT WORKS WITH SOCIAL LAMA"
- [ ] 3.2 In `components/layout/footer/footer.module.css:66`, relax the SVG-text `-0.03em` tracking until the "A" in the footer "SOCIAL LAMA" wordmark clears, keeping the wordmark visually tight

## 4. Verify (dev server :3000, Playwright)

- [ ] 4.1 Desktop 1440 + mobile 390: hero and footer show all seven icons in order, no overflow/wrap on mobile
- [ ] 4.2 Open the menu overlay: USŁUGI shows all seven items, each navigating to its slug
- [ ] 4.3 Screenshot the big marquee and footer wordmark — confirm both glyph overlaps are gone at desktop and mobile
- [ ] 4.4 Run the repo's Biome + TypeScript checks; confirm clean
