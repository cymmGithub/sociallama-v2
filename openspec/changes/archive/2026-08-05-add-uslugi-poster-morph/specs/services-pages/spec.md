# services-pages Delta

## MODIFIED Requirements

### Requirement: Hero follows the shipped homepage treatment

Every service page hero SHALL use the site's existing minimal header, a brand-plum ground carrying that service's approved line-art poster artwork behind a legibility scrim, the service title, and an intro paragraph, with the transparent-header treatment used by media heroes. The hero copy SHALL meet WCAG AA contrast against the composited artwork-plus-scrim ground. The previously planned shared llama render SHALL NOT be part of the hero. The stale header, gradient, footer, and marquee shown in the Figma source SHALL NOT be reproduced; the shipped footer and marquee components are used instead.

#### Scenario: Poster-backed hero

- **WHEN** any service page hero renders
- **THEN** its background is that service's line-art poster on brand plum behind a scrim, the header renders transparent over it, and the page uses the shipped header, footer, and marquee components

#### Scenario: Hero copy stays legible

- **WHEN** any of the seven service heroes renders in either locale
- **THEN** the title, intro, and optional CTA meet WCAG AA contrast over the composited ground

## ADDED Requirements

### Requirement: Service heroes are poster-only

Service page heroes SHALL NOT carry a video layer. Ambient video on a service page remains the province of in-body sections (partner covers, checklist backdrops); the hero presents static-composition artwork whose only motion is the poster's own micro-motion, subject to the reduced-motion and off-screen rules of the hub posters.

#### Scenario: No hero video anywhere

- **WHEN** any of the seven service pages renders
- **THEN** the hero contains no `video` element, including on pages whose body sections carry ambient clips
