# hero-impressed-clip

## Purpose

Define the generated desktop hero clip: head-and-chest 4:3 framing for the TV screen, the motion arc ending on an impressed reaction, scrub-ready all-intra encoding, and the generation acceptance loop.

## Requirements

### Requirement: Head-and-chest framing for the TV screen
The desktop hero clip SHALL be framed as a head-and-chest shot of the llama filling the TV's landscape ~4:3 screen, generated image-to-video from a 4:3 crop of the current clip's frame 0, so the llama keeps hero-scale presence inside the shell.

#### Scenario: Screen fill
- **WHEN** the clip plays inside the TV screen
- **THEN** the llama occupies the frame as its clear subject, with no large empty background region

### Requirement: Motion arc with impressed ending
The clip SHALL show the llama slowly turning its head screen-left — eyeline clearly exiting the frame toward the headline — for approximately the first 75% of the clip, with the final ~25% selling an impressed reaction: ears snapping straight/perked, mouth dropping open, a slight head pull-back, and eyebrows rising above the sunglass frames. The sunglasses SHALL stay on throughout.

#### Scenario: Emotion beat placement
- **WHEN** the clip is scrubbed to its final 25% of frames
- **THEN** the impressed reaction (ears, mouth, eyebrows, pull-back) is clearly readable, so the pose visitors park on during the scrub's hold phase is the impressed one

#### Scenario: Eyeline sells the object of attention
- **WHEN** the turn completes
- **THEN** the llama is unambiguously looking out of the screen toward the viewer's left, where the headline sits

#### Scenario: Brand continuity
- **WHEN** any frame of the clip is inspected
- **THEN** the llama wears the sunglasses and beige shirt with no accessories removed and no wardrobe drift; the background stays stable and non-distracting (exact color match to the page is NOT required — the TV shell absorbs drift)

### Requirement: Scrub-ready encoding
The committed clip SHALL be h264, 24fps, encoded all-intra (every frame an I-frame), in a 4:3 frame matching the TV screen (e.g. 1440×1080), and SHALL be at most ~5MB. The committed poster SHALL be extracted from the clip's frame 0.

#### Scenario: Keyframe verification
- **WHEN** the encoded clip is inspected with ffprobe
- **THEN** every video frame reports pict_type I

#### Scenario: Instant seeking
- **WHEN** the scrub seeks to an arbitrary time
- **THEN** the frame displays without decode-ahead stutter

#### Scenario: Poster matches frame 0
- **WHEN** the hero renders before video data is available
- **THEN** the poster shown inside the TV screen is pixel-identical to the clip's first frame, so scrub start is seamless

### Requirement: Generation acceptance loop
Each generated take SHALL be reviewed against the framing, emotion, and continuity requirements before further credits are spent, with a budget of 2–4 takes; timing language in the generation prompt SHALL be derived from the shipped scrub's runway and hold constants, and framing from the shipped TV screen's aspect.

#### Scenario: Take rejection
- **WHEN** a take fails the checklist (reaction not readable in final 25%, eyeline wrong, framing doesn't fill the screen, or wardrobe drift)
- **THEN** the take is rejected with the specific failure noted, and the prompt is adjusted before the next generation

#### Scenario: Sequencing gate
- **WHEN** clip generation begins
- **THEN** the scroll-scrub and TV shell are already merged with settled runway/hold constants and screen aspect
