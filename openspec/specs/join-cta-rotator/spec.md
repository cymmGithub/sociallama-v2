# join-cta-rotator

## Purpose

Define the join-cta section: the rotating locative heading, the word-synchronized crossfading image stack, the seamless-composite requirements for its nine generated assets, and the static SSR/reduced-motion fallback.

## Requirements

### Requirement: Rotating locative heading
The join-cta heading SHALL render the static lead "POTRZEBUJESZ WSPARCIA" followed by a rotating emphasized token cycling through exactly nine entries in order: `W FACEBOOKU?`, `NA INSTAGRAMIE?`, `NA TIKTOKU?`, `NA LINKEDINIE?`, `NA PINTEREŚCIE?`, `NA X?`, `NA YOUTUBIE?`, `W STRATEGII?`, `W WIDEO?`. Each token SHALL contain its preposition and trailing question mark so the phrase stays grammatical (Polish locative case) and the `?` never detaches from the sliding word. The transition SHALL be the hero's masked vertical slide (~650ms, `expo.out`-family ease, outgoing word up / incoming word from below, non-participating words hidden by the mask), advancing every 2600ms. All copy SHALL come from `lib/content/home.ts`.

#### Scenario: Word advance
- **WHEN** the rotation interval elapses with motion allowed
- **THEN** the current token slides up out of the mask while the next token slides into place, and after the ninth token the cycle wraps to the first

#### Scenario: Layout stability
- **WHEN** any token is active
- **THEN** the heading block's size does not change between tokens (the rotator cell reserves the widest token) and no token is visibly clipped horizontally

#### Scenario: Stable accessible name
- **WHEN** assistive technology reads the section heading
- **THEN** it announces the full first-entry phrase ("POTRZEBUJESZ WSPARCIA W FACEBOOKU?") regardless of which token is visually active, and the rotating spans are hidden from the accessibility tree

### Requirement: Word-synchronized image stack
The join-cta media column SHALL render nine still images — one paired with each rotator entry by index — stacked in a single square cell, with exactly the active entry's image visible. On each word advance the images SHALL crossfade (opacity transition ~650ms, shared ease token) driven by the same rotation state as the heading, never by a second timer. All nine images SHALL stay mounted so swaps never show a decode flash. The stack SHALL be exposed to assistive technology as a single labelled image (container label, empty `alt` on the individual images).

#### Scenario: Synchronized swap
- **WHEN** the heading advances from entry N to entry N+1
- **THEN** image N fades out as image N+1 fades in, within the same state update — the visible image always matches the visible word

#### Scenario: No timer drift
- **WHEN** the section has been rotating for many cycles
- **THEN** word and image remain index-locked because one shared state drives both columns

### Requirement: Seamless-composite image assets
Each of the nine images SHALL be generated with `public/clips/hero-poster.jpg` as the character/style reference (same llama character, consistent framing family, one platform/offer-themed accent per entry) and SHALL have a flat background equal to the plum-deep token `#722341`, per the seamless-composite convention. Every final asset MUST pass the corner-sampling gate (`bun lib/scripts/verify-clip-bg.ts <image> '#722341'`) before being wired into the section; assets that fail SHALL be re-graded or regenerated — the theme token SHALL NOT be adjusted to match an asset.

#### Scenario: Gate enforcement
- **WHEN** a candidate image's four corner samples deviate from `#722341` beyond the gate's tolerance (±3 per RGB channel or ΔE ≥ 3)
- **THEN** the asset is rejected from the set

#### Scenario: No visible image boundary
- **WHEN** the section renders on the plum-deep chapter at any breakpoint
- **THEN** no edge or rectangle of the active image is perceivable against the section background

#### Scenario: Optimizer output verified
- **WHEN** the images are served through the Next image optimizer at the section's rendered widths
- **THEN** pixel-sampled background regions of the served variants still match `#722341` within the gate tolerance (guarding the known width-specific optimizer color corruption)

### Requirement: Static fallback replaces the CTA clip
The section SHALL NOT ship a video: `public/clips/cta-llama.mp4` and `public/clips/cta-llama-poster.jpg` are removed along with the `joinCta.clip`/`joinCta.poster` content fields. Server-side rendering SHALL output the first entry's word and image; with `prefers-reduced-motion: reduce` the rotation interval SHALL never start, leaving that first-entry state as the permanent rendering.

#### Scenario: Reduced motion
- **WHEN** the user has `prefers-reduced-motion: reduce`
- **THEN** the heading shows "POTRZEBUJESZ WSPARCIA W FACEBOOKU?" with the Facebook image visible, and no word or image transition ever occurs

#### Scenario: Pre-hydration render
- **WHEN** the section renders before hydration (or with JavaScript disabled)
- **THEN** the first entry's word and image are visible and the layout matches the hydrated first-entry state (no shift on hydration)

#### Scenario: Clip assets gone
- **WHEN** the repository is searched after the change
- **THEN** no reference to `cta-llama.mp4` or `cta-llama-poster.jpg` remains in code, content, or `public/`
