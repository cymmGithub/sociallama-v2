# homepage

## MODIFIED Requirements

### Requirement: Hero with choreographed video
The hero SHALL display the three-line headline ("STRATEGY / THAT WORKS / WITH SOCIAL LAMA") in the left column and the llama hero video composited bare and right-anchored directly onto the section background of exactly `#892f53` (no framing device; the clip's flat background renders as the token per the seamless-composite convention, see `hero-impressed-clip`). The desktop video SHALL NOT autoplay or loop: it is scrubbed by scroll while the hero and client-logos belt stay pinned (see `hero-scroll-scrub`). The nowrap headline MAY overflow its column onto the clip's empty background half — the composite makes the overlap seamless. The headline lines SHALL stagger in via GSAP on first paint, independent of video time.

#### Scenario: Entrance animation
- **WHEN** the hero first mounts (motion allowed)
- **THEN** the headline lines animate in staggered once and do not re-animate, regardless of video state or scroll position

#### Scenario: Video not yet loaded
- **WHEN** the video data has not arrived (slow network or reduced motion)
- **THEN** the poster is visible in the same right-anchored box (composited seamlessly against `#892f53`), and the headline entrance still runs on mount

#### Scenario: Scroll reveals the llama's reaction
- **WHEN** the visitor scrolls through the pinned hero
- **THEN** the llama's neck turns toward the headline in step with scroll, ending on the subtle impressed pose for the hold phase

#### Scenario: No visible clip boundary
- **WHEN** the hero renders at desktop widths (motion allowed or reduced)
- **THEN** no edge or rectangle of the video/poster is perceivable against the section background
