# Design — refine-sprzedaz-purchase-journey

## Context

The services section (`app/(frontend)/(home)/sections/services/`) renders a
shared grain-gradient stage with per-tab layers. `StageMedia` switches on the
stage descriptor from `lib/content/home.ts`: `panels` (positioned image cards)
or clips (phone rail); slot geometry lives in `services.module.css` keyed by
`data-stage="<id>"` with per-`nth-child` positions and staggered entrance
delays (`.layer.isActive .panel:nth-child(n)`, 80–540 ms). Mobile (<800px)
renders a separate stacked variant that passes `limit={3}` to show the first
three media items. The SPRZEDAŻ tab currently shows six transparent-PNG device
mockups of analytics dashboards.

The approved visual target is the reviewed mock (variant A + copy System 1):
five UI vignette cards on a dashed SVG path, each with a step chip (01–05) and
a plum caption strip naming the agency's role.

## Goals / Non-Goals

**Goals:**

- Replace the SPRZEDAŻ stage content with the five-step journey collage on
  desktop and a condensed three-step version on mobile.
- Keep every string in the content layer (PL + EN), every icon lucide-react,
  and the only raster asset the two Pexels crops.
- Reuse the existing stage machinery: layer crossfade, staggered entrance,
  autoplay dwell, reveal, reduced-motion neutralization.

**Non-Goals:**

- No changes to the CONTENT or KREACJE tabs, the tab loop mechanics, dwell
  timing, or the stage backdrop recipe.
- No sequencer/timeline animation (that was variant B — rejected for cost).
- No changes to `/uslugi/sprzedaz` (the service subpage keeps its own content).

## Decisions

1. **New `journey` stage kind, not a `panels` reuse.** `panels` items are
   images; the vignettes are live HTML (text, buttons, icons) and must stay
   HTML for localization and crispness. The stage union in
   `lib/content/home.ts` gains a `journey` descriptor holding the five steps'
   strings (post handle/caption/pill/headline, CTA label, shop URL text,
   product name/price, cart and receipt lines, per-step role captions and
   step labels for a11y). `StageMedia` narrows with an `'in'` check like the
   existing branches. Rendering lives in a new `JourneyStage` component in the
   services section file (house style: section-local, no premature extraction).

2. **Cards keep the `.panel`-equivalent entrance contract.** The five cards
   are absolutely positioned children of a `data-stage="sprzedaz"` container
   and reuse the existing stagger vocabulary (opacity/transform transition +
   per-`nth-child` delays) so the funnel visibly plays 01→05 on each tab
   activation. Slot geometry replaces the current six device slots in
   `services.module.css`; positions follow the mock (post far left, CTA chip
   below-right of it, browser center hero, cart right-lower, receipt far
   right).

3. **Flow path as inline SVG under the cards.** One dashed cubic path +
   endpoint dot, `viewBox` with `preserveAspectRatio="none"`, z-indexed
   between backdrop and cards, `aria-hidden`. It is decorative; no per-step
   anchoring logic. If card slots move, the path is retuned by hand (same
   practice as slot geometry).

4. **Mobile shows steps 01, 03, 05 — not "first three".** The stacked mobile
   stage would cut the story at the shop page under the existing
   `limit={3}` rule. `JourneyStage` accepts a `condensed` flag (mobile) and
   renders post → strona produktu → zamówienie so the arc completes. The
   generic `limit` prop stays untouched for the other tabs.

5. **One photo, two pre-cropped assets.** Download Pexels 20336139 at source
   resolution and commit two crops: `sprzedaz-journey-post.jpg` (4:5, full
   composition) and `sprzedaz-journey-packshot.jpg` (square, text-free
   product region). Pre-cropping beats CSS `object-position` because the two
   crops serve different aspect boxes and the post card must never re-crop
   under the text overlays. Served via the `Image` primitive like the content
   panels. JPEG (Payload media is not involved; these are static assets like
   the existing `content-*.jpg`).

6. **Copy is content data, captions included.** The verb strips (TWORZYMY /
   CELUJEMY / PROWADZIMY / DOMYKAMY / MIERZYMY + tails) and all vignette
   strings live in the SPRZEDAŻ item's stage descriptor with EN twins in
   `home.en.ts` (EN voice: playful-but-clean, American spelling — e.g. WE
   CREATE / WE TARGET / WE DRIVE / WE CLOSE / WE MEASURE). The tab `body`
   copy is rewritten in both locales. The locale-parity test must pass, which
   keeps the two descriptors structurally identical.

7. **Fictional shop stays fictional.** Brand handle `twojamarka`, domain text
   `twojamarka.pl/mydla`, price `59 zł` (EN: keep zł — the shop depicted is
   Polish; revisit only if the EN site swaps the whole vignette). No real
   client brand appears in this stage (Laurastar direction was reviewed and
   rejected: ad-as-packshot duplication and palette clash).

## Risks / Trade-offs

- [Five text-bearing cards at small sizes may be illegible on narrow desktop
  widths] → height-driven slot sizing with vw caps like the content collage;
  verify at 800px, 1280px, 1440px, 1600px+ during implementation; captions
  have a minimum readable font floor (~9px equivalent at 1440px stage).
- [Dashed path can collide with cards after slot retunes] → path is decorative
  and z-indexed under cards; screenshot verification at the standard widths
  (settled state — reveal wipes can hide overflow issues from rect checks).
- [Pexels photo could disappear upstream] → asset is committed to the repo;
  licence requires no attribution; note source photo id in the content
  comment.
- [Story cut on mobile trio] → resolved by decision 4 (01/03/05 subset).
- [Removing `sprzedaz-*.png` could break other references] → grep confirms
  usage only in `lib/content/home.ts` / `home.en.ts` before deletion; removal
  happens in the same commit as the content swap.

## Open Questions

_None — visual target, copy system, and asset source were approved in the
mock review (2026-08-10)._
