# Proposal: marquee-card-cta

## Why

The marquee's hover cards are static quote tooltips — text only, nothing to act on. The accepted mock (https://claude.ai/code/artifact/edec7161-682b-4d3f-9596-0da40533e729) upgrades them into mini-testimonials with a face and a "Case study" call-to-action, priming the case-study content that doesn't exist yet without shipping dead links.

## What Changes

- The hover card gains an author-photo footer: avatar + name/company text. Real portrait where one exists in the content; an initials-on-plum-gradient placeholder for clients whose portraits haven't been delivered. **No brand logo inside the card** — the user is already hovering the brand's logo (explicit user decision).
- The card gains a CTA row with an orange pill button "Case study →". Clicking it navigates nowhere; it pops a small ink tooltip "waiting for case study :)" that auto-hides after ~2 s (user-provided copy, kept verbatim).
- The card becomes interactive: `pointer-events` enabled while open, an invisible hover bridge spans the logo↔card gap so the cursor can reach the button without the card closing, and the `role="tooltip"` semantics are replaced (interactive content in a tooltip is an ARIA anti-pattern).
- Touch and keyboard users still cannot open the cards (existing gate on `(hover: hover) and (pointer: fine)` stays). Accepted interim state — the CTA leads nowhere yet, so no reachable functionality is being withheld.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `client-logos-marquee`: the "Testimonial card on logo hover" requirement changes — card contents grow (author photo footer, CTA row), the card becomes an interactive popover (hover-persistent, clickable) instead of a passive tooltip, and a new requirement covers the CTA's placeholder tooltip behavior.

## Impact

- `app/(home)/sections/client-logos/index.tsx` — card markup (footer with avatar/placeholder, CTA row, click-tooltip state), role change, hover-bridge element or pseudo-element.
- `app/(home)/sections/client-logos/client-logos.module.css` — footer/avatar/placeholder styles, CTA pill, click-tooltip bubble, `pointer-events` + bridge, hover persistence.
- `lib/content/home.ts` — existing hover-card `Testimonial` entries gain `image` where portraits exist (Aquael/Nartowska, Intrum/Gosiewska, Funtronic/Treszczotko already in `public/assets/`); others stay photo-less and render the initials placeholder. `Testimonial.image` field already exists — no interface change.
- No new dependencies; marquee engine, spotlight, edge-shift logic untouched.
