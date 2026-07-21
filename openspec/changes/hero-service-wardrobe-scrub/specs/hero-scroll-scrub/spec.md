## ADDED Requirements

### Requirement: Scroll-synced service wardrobe
The hero's word rotator SHALL be driven by the hero scrub progress and advance in step with the llama's outfit changes in the frame sequence. The five offer words SHALL be ordered to match the outfit order of the approved take (KREACJE, WIDEO, CONTENT, SPRZEDAŻ, STRATEGY), each outfit themed to its word (streetwear, all-black film look, cream overshirt, blazer, navy suit), and the active word SHALL flip at scrub-progress boundaries aligned to the clip's outfit cuts (not an equal grid), with the final word holding through the clip's closing profile and admiring settle. The word index SHALL update from the same scrub value the frame draw uses, so the word and the visible outfit never disagree. The rotator SHALL NOT advance on a timer while the hero is scroll-scrubbed. The accessible name of the headline SHALL remain a single stable string regardless of the active word.

#### Scenario: Word flips on outfit cuts
- **WHEN** scrub progress crosses an outfit-cut boundary of the approved take
- **THEN** the active word advances to the next offer word within the same frame update, so the word flip coincides with the visible outfit change

#### Scenario: Words follow the take's outfit order
- **WHEN** the hero is scrubbed from top to bottom of the runway
- **THEN** the words appear in the order KREACJE → WIDEO → CONTENT → SPRZEDAŻ → STRATEGY, each shown while its matching themed look is on screen

#### Scenario: No timed cycling
- **WHEN** the visitor holds the hero on screen without scrolling
- **THEN** neither the word nor the outfit changes on their own (no timer-driven rotation)

#### Scenario: Reduced motion / no runway rests on the first look
- **WHEN** `prefers-reduced-motion: reduce` is set, or the hero renders without a scrub runway (mobile/poster)
- **THEN** the hero shows the first word (KREACJE) with the first outfit statically, and no word/outfit cycling occurs

#### Scenario: Stable accessible name
- **WHEN** assistive technology reads the hero headline at any scrub position
- **THEN** it announces one stable headline string, not a per-frame changing word
