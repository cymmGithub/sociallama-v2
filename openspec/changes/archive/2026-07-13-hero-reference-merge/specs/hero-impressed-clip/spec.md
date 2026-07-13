# hero-impressed-clip

## ADDED Requirements

### Requirement: Committed clip is the 2026-07-08 reference take
The committed desktop hero clip SHALL be the reference build's 2026-07-08 take (`../sociallama/public/clips/hero.mp4`: 3s, 1370×1080, 24fps — head-turn screen-left ending on the impressed profile), used at its full duration with no trim, and processed through the post-pipeline (tint + encode + gate) before commit. The pre-tint reference file SHALL be the pipeline's source — the pipeline SHALL NOT re-grade an already-tinted encode.

*(History: the 2026-07-12 take — job `0f18d4c8`, tail-trimmed at 4.0s — shipped with `hero-bare-clip`; the user then directed reverting to the 2026-07-08 reference take at reference presentation scale, 2026-07-13.)*

#### Scenario: Source fidelity
- **WHEN** the committed clip is compared frame-for-frame with the reference take
- **THEN** it contains the same 72 frames (no trim, no retime), differing only by the global background grade and encode

#### Scenario: Motion arc preserved
- **WHEN** the clip is scrubbed start to end
- **THEN** the llama turns its head screen-left toward the headline and the final frame is the impressed profile, matching the reference build's arc

## REMOVED Requirements

### Requirement: Head-turn arc with tail-trimmed impressed ending
**Reason**: The committed clip reverts to the 2026-07-08 reference take (user decision, 2026-07-13); the 2026-07-12 take and its 4.0s tail-trim no longer describe the shipped asset.
**Migration**: The arc and no-trim policy for the committed take are stated in the new "Committed clip is the 2026-07-08 reference take" requirement. The framing, encoding/gate, and acceptance-loop requirements continue to govern any *future* regeneration.

## MODIFIED Requirements

### Requirement: Scrub-ready encoding with seamless-composite gate
The committed clip SHALL retain its source take's full duration (3s for the committed reference take), color-graded so its flat background renders as exactly the `#892f53` token, then encoded h264, 24fps, all-intra (every frame an I-frame), at most ~5MB, with explicit colorspace tags matching the encode's actual YUV matrix (shipped: smpte170m). The final encode SHALL pass `verify-clip-bg.ts` against `#892f53` AND the match SHALL be confirmed against browser-rendered pixels (screenshot sampling), since the ffmpeg-side gate and the browser can disagree on the YUV→RGB matrix. The committed poster SHALL be extracted from frame 0 of the final (tinted) encode. The background grade SHALL be a global color pass; if the required shift exceeds ~10 per RGB channel, the take SHALL be rejected (regenerated, or the mismatch surfaced to the user) instead of graded harder.

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
- **THEN** the take is rejected rather than heavily graded (a large global shift visibly tints the white fur)
