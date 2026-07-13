# homepage

## MODIFIED Requirements

### Requirement: Hero with choreographed video
The hero SHALL display the three-line headline ("STRATEGY / THAT WORKS / WITH SOCIAL LAMA") in the left column and the llama hero video composited bare and right-anchored directly onto the section background of exactly `#892f53` (no framing device; the clip's flat background renders as the token per the seamless-composite convention, see `hero-impressed-clip`). The clip SHALL render at reference scale: anchored to the hero's bottom edge and right edge, spanning the hero's height except for a top clearance that keeps the llama clear of the fixed header's CTA/menu pills. The desktop video SHALL NOT autoplay or loop: it is scrubbed by scroll while the hero and client-logos belt stay pinned (see `hero-scroll-scrub`). The nowrap headline MAY overflow its column onto the clip's empty background half — the composite makes the overlap seamless. The headline lines SHALL stagger in via GSAP on first paint, independent of video time.

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

### Requirement: Section motion behaviors
The homepage SHALL implement: client-logo marquee and full-bleed "THAT WORKS / WITH SOCIAL LAMA" marquee via `<Marquee>`; why-that-works heading fill scrubbed by scroll progress; how-it-works pinned via `<Fold>` with the five steps highlighting sequentially by scroll progress; below-fold sections revealing on first viewport entry via `useReveal`. Every "THAT WORKS" occurrence on the homepage SHALL render bold in the orange accent, mirroring the hero headline (user decision, 2026-07-13): the big marquee's filled row is orange, and the why-that-works heading fills "WHY" to plum and "THAT WORKS" to orange.

#### Scenario: Pinned how-it-works scrub
- **WHEN** the user scrolls through the how-it-works section
- **THEN** the section content stays pinned while steps 01–05 activate in order tied to scroll progress, and unpins after the last step

#### Scenario: Heading fill scrub
- **WHEN** the "WHY THAT WORKS" heading passes through the viewport
- **THEN** its fill progresses proportionally to scroll from unfilled to fully colored — "WHY" to plum, "THAT WORKS" to orange

#### Scenario: Big marquee accent
- **WHEN** the full-bleed marquee renders in the light chapter
- **THEN** the filled "THAT WORKS" row is the brand orange (not the chapter's plum contrast slot) and the outlined "WITH SOCIAL LAMA" row is unchanged

#### Scenario: Why-that-works never renders on the hero plum
- **WHEN** the user scrolls from the pinned hero into chapter 2 at any speed (including while the ~0.9s background morph is still in flight)
- **THEN** the why-that-works section shows its own sand ground continuous with the client-logos band — at no scroll position does its ink copy sit on the plum background
