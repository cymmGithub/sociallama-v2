## ADDED Requirements

### Requirement: Scroll-synced service wardrobe
The hero's word rotator and the llama's outfit SHALL both be driven by the hero scrub progress and advance in lockstep. The five offer words (STRATEGY, CONTENT, SPRZEDAŻ, KREACJE, WIDEO) SHALL map one-to-one, in order, to five equal blocks of the frame runway, and the llama SHALL wear the outfit themed to the currently-active word. The active word index SHALL be derived from scrub progress as `floor(progress × 5)` clamped to the last word, updated together with the frame draw so the word and the visible outfit never disagree. The rotator SHALL NOT advance on a timer while the hero is scroll-scrubbed. The accessible name of the headline SHALL remain a single stable string regardless of the active word.

#### Scenario: Word and outfit advance together on scroll
- **WHEN** scrub progress crosses a 1/5 boundary (0.2, 0.4, 0.6, 0.8)
- **THEN** the active word advances to the next offer word AND the visible outfit changes to that word's themed outfit, within the same frame update

#### Scenario: One word per outfit block
- **WHEN** the hero is scrubbed from top to bottom of the runway
- **THEN** each of the five words is shown while, and only while, its own themed-outfit frame block is on screen, in the order STRATEGY → CONTENT → SPRZEDAŻ → KREACJE → WIDEO

#### Scenario: No timed cycling
- **WHEN** the visitor holds the hero on screen without scrolling
- **THEN** neither the word nor the outfit changes on their own (no timer-driven rotation)

#### Scenario: Reduced motion / no runway rests on the first look
- **WHEN** `prefers-reduced-motion: reduce` is set, or the hero renders without a scrub runway (mobile/poster)
- **THEN** the hero shows the first word (STRATEGY) with the first outfit statically, and no word/outfit cycling occurs

#### Scenario: Stable accessible name
- **WHEN** assistive technology reads the hero headline at any scrub position
- **THEN** it announces one stable headline string, not a per-frame changing word
