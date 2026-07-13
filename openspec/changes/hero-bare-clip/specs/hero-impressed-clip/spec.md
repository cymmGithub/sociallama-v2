# hero-impressed-clip

## MODIFIED Requirements

### Requirement: Wide right-anchored framing for bare compositing
The desktop hero clip SHALL use the wide reference composition: the llama's head and neck right-of-center with the torso entering from the bottom edge, and a generous flat plum field on the left of the frame where the headline overflows. The final frame geometry SHALL match the reference clip's effective aspect (~1.27:1, e.g. 1370×1080). The clip SHALL NOT use the tight head-and-chest 4:3 crop (that framing belonged to the retired TV shell).

#### Scenario: Headline landing zone
- **WHEN** the hero renders at desktop widths with the nowrap headline overflowing its column
- **THEN** the overflow lands on the clip's empty flat-background region, not on the llama

#### Scenario: Hero-scale presence
- **WHEN** the clip renders right-anchored at hero height
- **THEN** the llama reads as the hero's subject at full scale, comparable to the reference implementation

### Requirement: Head-turn arc with tail-trimmed impressed ending
The clip SHALL show the llama slowly turning its head screen-left — eyeline clearly exiting the frame toward the headline — for roughly the first 70% of the clip, followed by an impressed reaction (ears up, mouth opening). The committed clip SHALL be tail-trimmed so the maximal-hold portion of the reaction is cut: the final frame is the impressed profile at the beat, not a long-held theatrical pose. The sunglasses SHALL stay on throughout, and the torso SHALL stay comparatively static (the head carries the motion).

*(History: a neck-only/subtle-beat regeneration was specified, generated — job `69914070`, 45 credits — and passed its checklist, but was rejected by the user on feel; the user directed reuse of the 2026-07-12 take — job `0f18d4c8` — trimmed at t=4.0s. A 3.5s trim was tried and judged over-trimmed.)*

#### Scenario: Beat readable at the hold
- **WHEN** the scrub parks on the clip's final frame during the hold phase
- **THEN** the llama reads as impressed (profile toward the headline, ears up, mouth open) without the trimmed-away maximal hold

#### Scenario: Eyeline sells the object of attention
- **WHEN** the turn completes
- **THEN** the llama is unambiguously looking out of the frame toward the viewer's left, where the headline sits

#### Scenario: Brand continuity
- **WHEN** any frame of the clip is inspected
- **THEN** the llama wears the sunglasses and beige shirt with no accessories removed and no wardrobe drift

### Requirement: Scrub-ready encoding with seamless-composite gate
The committed clip SHALL be trimmed to 4 seconds, color-graded so its flat background renders as exactly the `#892f53` token, then encoded h264, 24fps, all-intra (every frame an I-frame), at most ~5MB, with explicit colorspace tags matching the encode's actual YUV matrix (shipped: smpte170m). The final encode SHALL pass `verify-clip-bg.ts` against `#892f53` — the hero clip's exemption from the seamless-composite convention is revoked — AND the match SHALL be confirmed against browser-rendered pixels (screenshot sampling), since the ffmpeg-side gate and the browser can disagree on the YUV→RGB matrix. The committed poster SHALL be extracted from frame 0 of the final (tinted) encode. The background grade SHALL be a global color pass; if the required shift exceeds ~10 per RGB channel, the take SHALL be regenerated instead of graded harder.

#### Scenario: Gate passes on the final encode
- **WHEN** `verify-clip-bg.ts <clip> '#892f53'` runs on the committed clip
- **THEN** it passes (every corner within ±3/channel or ΔE < 3)

#### Scenario: Browser-rendered match
- **WHEN** the hero renders in the browser and page-vs-video background pixels are sampled from a screenshot
- **THEN** the sampled values match within the clip's own spatial variance (no matrix-level shift)

#### Scenario: Keyframe verification
- **WHEN** the encoded clip is inspected with ffprobe
- **THEN** every video frame reports pict_type I

#### Scenario: Poster matches frame 0
- **WHEN** the hero renders before video data is available
- **THEN** the poster is pixel-identical to the clip's first frame, so scrub start is seamless and the poster inherits the gate's guarantee

#### Scenario: Oversized grade rejected
- **WHEN** matching the take's background to the token would require more than ~10 per RGB channel
- **THEN** the take is rejected and regenerated rather than heavily graded (a large global shift visibly tints the white fur)

### Requirement: Generation acceptance loop
Each generated take SHALL be reviewed against the framing, motion, and continuity requirements before further credits are spent, with a budget of 2–4 takes (hard ceiling: remaining credit balance). Review SHALL happen at rendered hero size, and background flatness SHALL be checked (corner samples agreeing within gate tolerance) before a take is accepted for the post-pipeline. Checklist acceptance is necessary but NOT sufficient: the user's judgment of the clip in motion is the final acceptance authority.

#### Scenario: Take rejection
- **WHEN** a take fails the checklist (body moves with the neck, beat too theatrical or unreadable, eyeline wrong, framing lacks the left plum field, background not flat, or wardrobe drift)
- **THEN** the take is rejected with the specific failure noted, and the prompt is adjusted before the next generation

#### Scenario: Credits respected
- **WHEN** four takes have been rejected
- **THEN** generation pauses for a user decision (adjust approach or accept the best take) instead of spending further credits
