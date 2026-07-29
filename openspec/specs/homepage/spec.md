# homepage

## Purpose

Define the Social Lama homepage: the three-chapter scroll narrative, hero, typed content sourcing, and section motion behaviors.
## Requirements
### Requirement: Three-chapter scroll narrative
The homepage SHALL render as three sequential chapters — `plum` (nav, hero, client logos), `cream` (why-that-works, services, how-it-works, big marquee), `plum-deep` (testimonial, CTA, NewsLAMA, footer) — with the page background animating smoothly between chapter theme backgrounds as the user scrolls.

#### Scenario: Background morph on chapter change
- **WHEN** the scroll position crosses into a new chapter (center-of-viewport heuristic)
- **THEN** the page background transitions to the new chapter's theme background over ~0.9s

#### Scenario: Reduced motion
- **WHEN** the user has `prefers-reduced-motion: reduce`
- **THEN** chapter backgrounds change without animated transition and scroll-scrubbed effects render in their final state

### Requirement: Hero with choreographed video
The hero SHALL display the three-line headline ("STRATEGY / THAT WORKS / WITH SOCIAL LAMA") in the left column and the llama hero video composited bare and right-anchored directly onto the section background of exactly `#892f53` (no framing device; the clip's flat background renders as the token per the seamless-composite convention, see `hero-impressed-clip`). The clip SHALL render at reference scale: anchored to the hero's bottom edge and right edge, spanning the hero's height except for a top clearance that keeps the llama clear of the fixed header's CTA/menu pills. The hero video SHALL NOT autoplay or loop on either breakpoint: it is scrubbed by scroll while the hero and client-logos belt stay pinned — head-turn on desktop, upward glance on mobile (see `hero-scroll-scrub`). The nowrap headline MAY overflow its column onto the clip's empty background half — the composite makes the overlap seamless. The headline lines SHALL stagger in via GSAP on first paint, independent of video time.

#### Scenario: Entrance animation
- **WHEN** the hero first mounts (motion allowed)
- **THEN** the headline lines animate in staggered once and do not re-animate, regardless of video state or scroll position

#### Scenario: Video not yet loaded
- **WHEN** the video data has not arrived (slow network or reduced motion)
- **THEN** the poster is visible in the same bottom-right-anchored box (composited seamlessly against `#892f53`), and the headline entrance still runs on mount

#### Scenario: Scroll reveals the llama's reaction
- **WHEN** the visitor scrolls through the pinned hero
- **THEN** the llama turns toward the headline in step with scroll, ending on its final impressed profile for the hold phase

#### Scenario: Hero-scale llama with header clearance
- **WHEN** the hero renders at desktop widths (including short viewports at the hero's 620px floor)
- **THEN** the llama reads at hero scale (clip bottom flush with the hero's bottom edge) and no part of it overlaps the header's CTA or Menu pills

#### Scenario: No visible clip boundary
- **WHEN** the hero renders at desktop widths (motion allowed or reduced)
- **THEN** no edge or rectangle of the video/poster is perceivable against the section background

### Requirement: Content sections from typed data
All section copy (nav, hero, services, steps, client names, featured testimonial, footer, contact) SHALL come from `lib/content/home.ts`; components SHALL contain no hardcoded copy. Non-services copy SHALL match the verified content export verbatim; the three service bodies are instead trimmed to one short sentence each (~20 words) for the autoplay-tabs layout, with the original long-form texts preserved in the content module (commented or exported separately) for future `/uslugi/*` pages. FAQ and multi-post blog grid are excluded from v1. The NewsLAMA section is the exception to static sourcing: it SHALL render the latest published post fetched server-side from Payload's Local API (cover, category, `pl-PL`-formatted date, title, excerpt, link to the root-level post URL), with only its static labels (heading, read label) sourced from `lib/content/home.ts`; the hardcoded post object is removed from the content module. When no published post exists, the NewsLAMA section SHALL render nothing rather than a broken or placeholder card.

The how-it-works `steps` surface SHALL additionally carry, per step, the proof copy the process section presents: a headline, a supporting sentence split so its figures can be accented, and a case-study path. This proof content SHALL live in the same typed content module as the rest of the homepage copy and SHALL NOT be sourced from Payload. The five step sentences themselves SHALL remain verbatim.

#### Scenario: Content fidelity
- **WHEN** the homepage renders
- **THEN** the five how-it-works steps, 13 client names, featured iRobot testimonial (Małgorzata Radomska), and footer contact details match the export exactly

#### Scenario: Trimmed service bodies
- **WHEN** the services section renders
- **THEN** each of the three service descriptions is a single short sentence sourced from `lib/content/home.ts`, and the original long-form texts remain available in the content module

#### Scenario: Proof copy is typed content, not CMS content
- **WHEN** the how-it-works section renders its per-step proof
- **THEN** every headline, sentence, label and link path comes from the typed content module, and no query is made to Payload to render the section

### Requirement: Section motion behaviors
The homepage SHALL implement: client-logo marquee and full-bleed "THAT WORKS / WITH SOCIAL LAMA" marquee via `<Marquee>`; the why-that-works heading scrubbed word-by-word by scroll progress with its lead and paragraphs scrubbing as manifesto text (words fill from faint to full via `ProgressText`); how-it-works pinned via `<Fold>` with the five steps activating sequentially by scroll progress, each activation swapping the copy presented beside the step rail; below-fold sections other than services revealing on first viewport entry via `useReveal` — the services section's motion is owned by the autoplay-tabs component (see `services-autoplay-tabs`). Every "THAT WORKS" occurrence on the homepage SHALL render bold in the orange accent, mirroring the hero headline (user decision, 2026-07-13) — except the why-that-works heading, where "THAT WORKS" fills with the static orange-dominant grain-gradient (gggrain variant: base `#f09b39`, `#892f53` falloff, `feTurbulence` 0.55, soft-light) clipped to the letters, and "WHY" fills to the ink text color (user decisions, 2026-07-13). The big marquee's filled row remains flat orange.

#### Scenario: Pinned how-it-works scrub
- **WHEN** the user scrolls through the how-it-works section
- **THEN** the section content stays pinned while steps 01–05 activate in order tied to scroll progress, and unpins after the last step

#### Scenario: Each activation changes what is shown
- **WHEN** a step becomes active during the pinned scrub
- **THEN** the copy beside the rail changes to that step's headline, sentence and link, so each scroll beat reveals content rather than only changing a highlight

### Requirement: Homepage replaces the Satus manual
`app/page.tsx` SHALL render the Social Lama homepage; the Satus onboarding manual page and its assets SHALL be removed from the route.

#### Scenario: Root route
- **WHEN** a visitor opens `/`
- **THEN** the Social Lama homepage renders with metadata (title, description, OG image) for Social Lama, not Satus

### Requirement: Progressive bottom blur
The site layout SHALL render a fixed progressive blur strip at the viewport's bottom edge (stacked `backdrop-filter` layers with increasing radii and staggered masks) so departing content melts into frost, and SHALL hide it (fade) while any `[data-blur-edge-gate]` element intersects the viewport. The client-logos belt carries the gate attribute so the brand marquee is never frosted at page start (user decision, 2026-07-13).

#### Scenario: Marquee never frosted
- **WHEN** the page loads at the top with the client-logos belt on screen
- **THEN** the blur strip is fully transparent; **WHEN** the user scrolls past the belt **THEN** the blur fades in and bottom-edge content blurs progressively

#### Scenario: Pointer transparency
- **WHEN** the blur strip overlays interactive content near the viewport bottom
- **THEN** it never intercepts pointer events

### Requirement: Resting-state text contrast
Homepage text that is meant to be readable without scroll interaction — section eyebrows, subheads, card meta/identity lines — SHALL meet WCAG AA contrast (≥4.5:1 small text, ≥3:1 large text) in its resting (pre-scroll) state, measured against the chapter ground behind it when the element is in view. Scroll-scrubbed ghost/progress text whose unlit form is intentionally decorative MAY rest below AA only when it conveys no information exclusively in the dim state. Two documented exceptions MAY stay below AA: the orange "…THAT WORKS"/"…IT WORKS" display headlines (brand rule, user decision 2026-07-14; adjacent Polish subheads carry the information) and the testimonial queue's dimmed upcoming cards (full content reaches AA contrast when the card becomes active).

#### Scenario: Static-read text at rest
- **WHEN** the homepage loads and no scrolling has occurred
- **THEN** eyebrows, subheads, and the sponsored-card identity line each meet their WCAG AA contrast threshold against their rendered background

#### Scenario: Ghost text remains scrubbed
- **WHEN** the user scrolls through a progress-text section
- **THEN** the dim-to-lit scrub effect still plays and the lit state meets AA contrast

### Requirement: Deterministic homepage a11y gate
The homepage Playwright smoke SHALL assert zero serious or critical axe violations and pass deterministically: the test settles the page into its final visual state before scanning (instant scroll through the document under reduced-motion emulation), paints each scroll chapter with its own theme ground so contrast is measured against the in-view background, and excludes only the documented decorative/brand-exception selectors (progress-text ghosts, orange display headlines, testimonial queue), each with the design rationale in the test.

#### Scenario: Gate passes on a clean homepage
- **WHEN** `bun run test:e2e` runs against the current homepage
- **THEN** the axe assertion reports zero serious/critical violations and the test passes repeatably

#### Scenario: Gate catches a real regression
- **WHEN** a change introduces a serious contrast violation in settled, non-excluded content
- **THEN** the a11y assertion fails

