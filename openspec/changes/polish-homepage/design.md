## Context

Three polish items batched onto the homepage, but two touch site-wide surfaces: `socials` and `menu` are defined in `lib/content/home.ts` yet consumed by the shared header overlay, footer, o-nas hero, contact, and blog. This change runs in a git worktree in parallel with a separate `polish-o-nas` change, so file ownership must be explicit to avoid merge conflicts.

## Goals / Non-Goals

**Goals:**
- One canonical, correctly-ordered social set with real destinations + two new platforms (YouTube, Pinterest), rendered identically everywhere.
- Seven USŁUGI menu items with ready `/uslugi/<slug>` routes.
- No glyph collisions in the big marquee or footer wordmark.

**Non-Goals:**
- Creating the `/uslugi/strategia`, `/uslugi/audyt-i-konsultacje`, `/uslugi/influencer-marketing` destination pages (menu links only; may 404).
- Any change to the on-page Services section list, the testimonial section, or shared `ui/*` primitives / `global.css` tokens.

## Decisions

- **New icons as monochrome mask SVGs.** The footer/hero render social icons via CSS `mask-image` against the existing `/assets/icon-*.svg` set, so `icon-youtube.svg` and `icon-pinterest.svg` must be single-color silhouettes with the same viewBox/padding conventions — not multicolor brand logos and not lucide components. Rationale: they inherit color from the mask consumer exactly like the existing five; anything else renders wrong. (This is the brand-social icon set, distinct from the lucide UI-icon rule.)
- **Kerning tuned against the live render, not a magic number.** Both overlaps come from negative `letter-spacing` on `--font-display` at display sizes (`-0.02em` marquee, `-0.03em` footer). Relax toward zero only as far as needed to clear T‑H‑A and the LAMA "A", re-screenshotting each — over-loosening reads as a different wordmark. Alternative considered (a global `--font-display` tracking token) rejected: it would ripple into every display headline site-wide, out of scope and risky.
- **Fix the `#` placeholder links in the same pass.** Adding YouTube/Pinterest with real URLs next to `#`-stubbed Facebook/TikTok/Instagram/LinkedIn would look half-broken; the spec's "no placeholder links" scenario formalizes this.

## Risks / Trade-offs

- **Seven icons may overflow the 390px hero/footer row** → verify both at mobile width via Playwright; if tight, reduce icon size or gap within the existing row component (no shared-primitive edit).
- **Parallel `polish-o-nas` edits a shared file** → mitigation is ownership, not merge-fixing: `polish-homepage` exclusively owns `home.ts` and `components/layout/footer`; o-nas must not touch either. o-nas *reads* the new socials and inherits them after both merge (visual dependency, not a conflict).
- **Dead `/uslugi/*` routes 404 until pages exist** → accepted and explicit; slugs are final so the later pages drop in without menu changes.

## Migration Plan

Pure additive content/CSS change; no data migration. Rollback is a git revert of the branch.

## Open Questions

None — all destinations, order, slugs, and scope confirmed with the user.
