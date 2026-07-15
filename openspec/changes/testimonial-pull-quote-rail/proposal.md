# Proposal: testimonial-pull-quote-rail

## Why

The current testimonial section is a dot-navigation carousel: one centered quote at display size, two invisible siblings behind anonymous dots, ghost arrows. The user's verdict: "from the previous century". The full 300–500-character quotes can't carry display type, and the dots hide that iRobot, Uniphar, and STAG all vouch for the agency — the strongest part of the section.

Redesign to the approved "pull-quote + client rail" direction (Makieta 1, user-approved mock: https://claude.ai/code/artifact/8ec92feb-a5f3-4386-92c1-121da81f08a5): a short pull-phrase in display type with an orange highlight, the full quote below at reading size, and all three clients permanently visible in a rail that doubles as navigation, with autoplay cycling through all testimonials.

## What Changes

- Replace the centered carousel layout in `app/(home)/sections/testimonial/` with an asymmetric grid: quote stage (pull-phrase + full quote + byline) on the left, client rail on the right.
- Each testimonial gains a **pull-phrase**: a short key sentence rendered in Exo 2 display type, with its key words highlighted in orange (`mark` treatment: orange text + translucent orange underline band).
- The full quote renders below the pull-phrase at reading size (~1rem Manrope), no longer as display type.
- The client rail shows all three clients at once — avatar, white-knocked logo, author name — replacing dots and arrows entirely. The active row is bright with an orange edge bar; inactive rows are dimmed. Clicking a row selects that testimonial.
- **Autoplay**: the slider advances every 7 s, cycling through all testimonials; a thin orange progress bar fills along the active rail row (same rhythm family as the services autoplay tabs). Hover pauses timer + bar; manual selection restarts the rhythm from the chosen testimonial; on touch (no hover), any manual selection stops autoplay permanently; `prefers-reduced-motion` disables autoplay.
- Slide transitions are directional (exit left / enter right) instead of a static cross-fade.
- Mobile (≤ 820 px): the rail becomes a horizontal 3-chip row (avatar + name, orange top bar on active) above the quote stage; logos hidden in chips.
- Swipe support is retained on mobile.

## Capabilities

### New Capabilities

- `testimonial-rail`: the testimonial section's presentation and interaction contract — pull-phrase + full-quote hierarchy, always-visible client rail as navigation, autoplay rhythm with progress indication and its pause/stop rules, transitions, and responsive behavior.

### Modified Capabilities

<!-- none — homepage's requirements (three-chapter theming, copy sourced from lib/content/home.ts verbatim) are unchanged; this change must comply with them, see Impact -->

## Impact

- **Code**: `app/(home)/sections/testimonial/index.tsx` and `testimonial.module.css` rewritten; `lib/content/home.ts` `Testimonial` interface gains pull-phrase fields (content addition, no breaking shape change for other consumers).
- **Content / client relations**: pull-phrases are new display copy derived from client quotes. Full quotes remain verbatim (complies with the homepage verbatim-copy requirement). Pull-phrases must be verbatim excerpts of the quote wherever possible; any rephrased excerpt (currently the Uniphar one) needs sign-off before launch, same category as the existing lorem-testimonial launch blockers.
- **Blur-edge gate**: the section keeps `data-blur-edge-gate` — on short desktop viewports the byline/rail sit near the viewport bottom and must not be frosted.
- **Unchanged**: chapter theming (plum-deep ground), reveal-on-scroll behavior, `useReveal`, content sourcing from `lib/content/home.ts`, services autoplay-tabs spec (referenced as a pattern, not modified).
