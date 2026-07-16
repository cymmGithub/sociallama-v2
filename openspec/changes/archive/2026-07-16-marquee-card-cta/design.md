# Design: marquee-card-cta

## Context

`app/(home)/sections/client-logos/` renders the "ZAUFALI NAM" sand belt: a paused-on-hover marquee of 13 grayscale logos where hovering a logo spotlights it and fades in a cream quote card above it (`role="tooltip"`, `pointer-events: none`). Cards are pure presentation — the cursor can never enter them. Edge cards are nudged back into the viewport by a `--shift` custom property set from a `mouseenter` handler; a caret counter-shifts to stay over the logo. The whole interaction is gated to `(hover: hover) and (pointer: fine)`.

The accepted mock (see proposal) adds an author-photo footer and a "Case study →" CTA whose click pops a transient "waiting for case study :)" bubble. That makes the card interactive, which is the load-bearing shift.

## Goals / Non-Goals

**Goals:**
- Card = quote → footer (avatar + name/company) → CTA row, per the accepted mock. No brand logo in the card.
- The CTA is actually clickable with a mouse: the cursor can travel logo → card without the card closing.
- Clients without a delivered portrait render an initials placeholder — no broken images, no fake faces.
- Keep the marquee engine, spotlight, edge-shift and pause-on-hover behavior untouched.

**Non-Goals:**
- No case-study pages or routes — the CTA deliberately navigates nowhere.
- No touch/keyboard path to open cards (existing gate stays; revisit when case studies are real).
- No new portraits beyond the three already shipped for the testimonial rail.

## Decisions

### 1. Hover persistence via a bridge pseudo-element, not delay timers

The card sits `22px` above the logo. To keep it open while the cursor crosses that gap, the card gets a `::before` strip spanning the gap height, and the open condition becomes "logo hovered OR card hovered" (`.item:hover .card, .item .card:hover`). Since the card is a child of the `.item`, `:hover` on the card already bubbles to the item — enabling `pointer-events: auto` on the open card plus the bridge is sufficient; no JS timers.

*Why not a grace-period timer?* CSS-only keeps the existing declarative open/close model; timers add state for no gain here.

### 2. `role="tooltip"` is dropped, not swapped for heavy popover machinery

Interactive content in a tooltip violates ARIA tooltip semantics. But the full popover pattern (focus trap, `aria-expanded` trigger, Escape handling) is unearned while the card is mouse-reachable only. The card becomes a plain `div` (the quote/author content is already duplicated per-logo and hidden from AT by the marquee's aria-hidden clones); the JS `querySelector('[role="tooltip"]')` in `keepCardOnScreen` switches to a class selector.

### 3. Click-tooltip as component state, CSS for presentation

Clicking "Case study →" sets a per-card "tip shown" state (React state holding the client name, or a data-attribute toggle) that reveals an ink bubble above the button and clears on a ~2 s timeout. Timeout is cleared/restarted on repeat clicks. Copy is the user's verbatim string: `waiting for case study :)`.

### 4. Avatar placeholder derives initials from the author name

Entries whose `testimonial.image` is absent render a plum-gradient circle with the author's initials (computed from the `author` string at render, e.g. "Imię Nazwisko" → "IN"). No placeholder image assets needed; visually matches the services-stage plum placeholder language and the mock. The three delivered portraits (`testimonial-nartowska.jpg`, `testimonial-gosiewska.jpg`, `testimonial-treszczotko.jpg`) are referenced from the matching client entries.

### 5. Marquee clone buttons stay inert

The `Marquee` component duplicates the track (`repeat={2}`) with `aria-hidden` clones. Buttons inside the clone would double-fire handlers on the same visual position's card only if hovered — each clone carries its own card, so per-card state must live per-DOM-node (data-attribute/CSS approach) or be keyed so both copies behave identically. Keying by client name is acceptable: both copies showing the tip simultaneously is invisible in practice (the clone is a belt-width away).

## Risks / Trade-offs

- [Cards linger while sweeping the belt] → The bridge + hoverable card keep cards open longer than today. `pauseOnHover` already freezes the belt on entry, so cards don't drift while open; acceptable.
- [English tooltip copy on a Polish page] → User decision, kept verbatim ("waiting for case study :)"). One string, trivially localized later.
- [CTA does nothing real] → Interim by design; the tooltip is the affordance. Same launch-gate category as the 9 lorem quotes already flagged in `home.ts`.
- [10 of 13 cards show initials placeholders] → Consistent with the site's placeholder-until-delivered pattern; portraits swap in via content file only.
