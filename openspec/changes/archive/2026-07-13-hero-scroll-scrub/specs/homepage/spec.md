# homepage

## MODIFIED Requirements

### Requirement: Hero with choreographed video
The hero SHALL display the three-line headline ("STRATEGY / THAT WORKS / WITH SOCIAL LAMA") in the left column and the llama hero video framed in a retro TV shell (see `hero-tv-shell`) in the right column, on a section background of exactly `#892f53`. The desktop video SHALL NOT autoplay or loop: it is scrubbed by scroll while the hero and client-logos belt stay pinned (see `hero-scroll-scrub`). The headline lines SHALL stagger in via GSAP on first paint, independent of video time.

#### Scenario: Entrance animation
- **WHEN** the hero first mounts (motion allowed)
- **THEN** the headline lines animate in staggered once and do not re-animate, regardless of video state or scroll position

#### Scenario: Video not yet loaded
- **WHEN** the video data has not arrived (slow network or reduced motion)
- **THEN** the poster is visible inside the TV screen, and the headline entrance still runs on mount

#### Scenario: Scroll reveals the llama's reaction
- **WHEN** the visitor scrolls through the pinned hero
- **THEN** the llama turns toward the headline in step with scroll, ending on the impressed pose for the hold phase
