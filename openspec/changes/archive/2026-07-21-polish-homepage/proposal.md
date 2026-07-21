## Why

Three concrete homepage-batch polish items surfaced from a live review: the social row is incomplete (missing YouTube/Pinterest, most links are `#` placeholders, order isn't Meta-first), the USŁUGI menu is missing three offered services, and the display-type wordmarks collide glyphs (T‑H‑A in the big marquee, the "A" in the footer "SOCIAL LAMA") because of over-tight negative tracking.

## What Changes

- **Socials** — rewrite the site-wide `socials` set: new order **IG, FB, TikTok, X, LinkedIn, YouTube, Pinterest**; wire real destinations for all seven (Facebook, TikTok, Instagram, LinkedIn were `#` placeholders); add two new platforms (YouTube, Pinterest) with matching monochrome mask SVGs. Consumed site-wide (header overlay, footer, o-nas hero, contact, blog), so the update propagates everywhere — intended.
- **USŁUGI menu** — extend the overlay's USŁUGI column to seven items, adding **Strategia**, **Audyt i konsultacje**, **Influencer marketing** under the `/uslugi/<slug>` pattern. Menu-column only; the on-page Services section list is unchanged, and the new routes may 404 until their pages exist (explicitly deferred).
- **Glyph kerning** — relax negative `letter-spacing` on `--font-display` at display sizes in two spots so glyphs stop overlapping: the homepage big marquee and the footer SVG wordmark. Implementation-level tuning, no behavioral spec change.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `site-nav`: the Menu-overlay requirement gains an enumerated, ordered social-links set with real destinations and two new platforms (YouTube, Pinterest), and the USŁUGI column grows from four to seven items (adds Strategia, Audyt i konsultacje, Influencer marketing).

## Impact

- **Code**: `lib/content/home.ts` (`socials`, `menu`); `app/(frontend)/(home)/sections/big-marquee/big-marquee.module.css`; `components/layout/footer/footer.module.css`.
- **Assets**: two new mask SVGs — `public/assets/icon-youtube.svg`, `public/assets/icon-pinterest.svg` — matching the existing `icon-*.svg` set (rendered via CSS `mask-image`).
- **Shared-surface ownership (parallel-safety)**: this change runs in a worktree alongside a separate `polish-o-nas` change. `polish-homepage` **exclusively owns** `components/layout/footer` and `lib/content/home.ts` this round. The parallel change MUST NOT edit the footer, `home.ts`, or the shared `socials`/`menu`. Out of scope here: the testimonial section (owned by in-flight `feat/testimonial-pull-quote-rail`), and any shared `ui/image` / `ui/link` primitive or `global.css` token.
