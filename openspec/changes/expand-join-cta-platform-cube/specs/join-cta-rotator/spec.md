## MODIFIED Requirements

### Requirement: Rotating locative heading
The join-cta heading SHALL render the static lead "POTRZEBUJESZ WSPARCIA" followed by a rotating emphasized token cycling through exactly seven platform entries in order: `NA FACEBOOKU?`, `NA INSTAGRAMIE?`, `NA TIKTOKU?`, `NA LINKEDINIE?`, `NA PINTEREŚCIE?`, `NA X (TWITTERZE)?`, `NA YOUTUBIE?`. The discipline tokens `W STRATEGII?` and `W WIDEO?` SHALL NOT appear — every token SHALL name a platform, so that each can drive a platform cube and a distinct services list. The seven tokens SHALL be exactly the seven `PlatformKey` values defined in `lib/content/uslugi.ts`, which is the single canonical platform list. The rotator SHALL keep its own established reading order (the order enumerated above), which is not that file's declaration order — `PlatformKey` declares X before LinkedIn and Pinterest. The canonical list governs *which* platforms appear, not the sequence they are read in. Each token SHALL contain its preposition and trailing question mark so the phrase stays grammatical (Polish locative case) and the `?` never detaches from the sliding word. The transition SHALL be the hero's masked vertical slide (~650ms, `expo.out`-family ease, outgoing word up / incoming word from below, non-participating words hidden by the mask), advancing every 2600ms. All copy SHALL come from `lib/content/home.ts`.

#### Scenario: Word advance
- **WHEN** the rotation interval elapses with motion allowed
- **THEN** the current token slides up out of the mask while the next token slides into place, and after the seventh token the cycle wraps to the first

#### Scenario: Layout stability
- **WHEN** any token is active
- **THEN** the heading block's size does not change between tokens (the rotator cell reserves the widest token) and no token is visibly clipped horizontally

#### Scenario: Stable accessible name
- **WHEN** assistive technology reads the section heading
- **THEN** it announces the full first-entry phrase ("POTRZEBUJESZ WSPARCIA NA FACEBOOKU?") regardless of which token is visually active, and the rotating spans are hidden from the accessibility tree

### Requirement: Looping clip media column
The join-cta media column SHALL render a **static mascot cutout** — the suited llama — as a transparent image composited onto the section's plum well by CSS; no background SHALL be baked into the asset. The well SHALL be the brand plum with a radial falloff toward the corners so the cutout reads as a photograph rather than a flat swatch. The mascot SHALL be served `unoptimized` (Next's optimizer corrupts transparent WebP colour and alpha). The mascot SHALL NOT change with the rotator — only the platform cube it holds does, per **Platform cube swap**. The mascot SHALL carry the `joinCta.llamaAlt` label.

#### Scenario: Mascot is stable
- **WHEN** the heading rotator advances between tokens
- **THEN** the llama does not change, move, or rescale — the visitor sees one continuous character

#### Scenario: Composited, not baked
- **WHEN** the section renders on the plum-deep chapter
- **THEN** no edge or rectangle of the mascot image is perceivable against the well, and the well's colour is determined entirely by the stylesheet

### Requirement: Sponsored-post chrome
The mascot SHALL be presented inside white sponsored-post chrome: a card header with the llama-logomark avatar and the `social.lama` handle linking to the real Instagram profile, a media well, and a card footer with an action row, a likes line, and a caption. The caption SHALL keep its existing joke verbatim (`joinCta.post.caption`). Post strings SHALL come from `lib/content/home.ts` (`joinCta.post`); the decorative avatar SHALL be hidden from assistive technology; the profile link SHALL carry an accessible label naming the destination.

#### Scenario: Profile link
- **WHEN** the user activates the avatar/handle in the card header
- **THEN** `https://www.instagram.com/social.lama/` opens in a new tab with `rel="noopener noreferrer"`

## ADDED Requirements

### Requirement: Platform cube swap
The media column SHALL render a platform cube as a **layer separate from the mascot**, showing the platform named by the currently active heading token, so the media column answers the question the heading asks. Cube artwork SHALL be the existing `public/assets/cube-*.png` set — the same assets that drive the platform section on `/uslugi/content` — so no new artwork is introduced and both places on the site that enumerate platforms speak one visual language.

The cube's position and size SHALL be expressed as percentages of the **mascot's own bounding box**, not of the card, so it stays aligned to the raised paw at every card width without breakpoint-specific offsets. The swap SHALL animate as a pop (scale with slight rotation, spring easing) rather than a cross-fade, matching the pose's depiction of an object being caught. All seven cube images SHALL be present in the DOM with only the active one visible.

#### Scenario: Cube follows the word
- **WHEN** the heading advances to a platform token
- **THEN** the cube for that platform becomes the visible one in the same tick — both derive from one rotator index, with no separate timer that could let them diverge

#### Scenario: Cube stays on the paw
- **WHEN** the card is rendered at any width from 360px to its maximum
- **THEN** the cube remains positioned at the mascot's raised paw, with no clipping against the top of the well

#### Scenario: Decorative to assistive technology
- **WHEN** assistive technology traverses the media well
- **THEN** the cube images are hidden from it — the platform is already announced by the heading, and repeating it would be noise

### Requirement: Per-platform services copy
The section SHALL display, for the currently active platform, a short list of what we do on it. Copy SHALL be derived from the platform descriptions in `lib/content/uslugi.ts` so the section cannot contradict `/uslugi/content`, and SHALL NOT claim services we do not offer — LinkedIn and YouTube carry no advertising item, and X carries none either. **All seven lists SHALL be present in the DOM** regardless of which is active, inactive ones visually hidden rather than absent, because content that exists for 2600ms at a time is unreachable by assistive technology and by crawlers, and this section is the only place on the homepage stating what we do per platform.

#### Scenario: Copy matches the services pages
- **WHEN** a platform's services list is compared with that platform's entry in `lib/content/uslugi.ts`
- **THEN** the two describe the same work, and the section makes no claim the services pages do not support

#### Scenario: Reachable without motion
- **WHEN** a screen reader traverses the section, or a crawler renders the page
- **THEN** all seven platform services lists are present in the markup, not only the active one

### Requirement: Interactive post controls
The card's action controls SHALL be real controls, not decoration: they SHALL be `button` elements with accessible labels, visible focus indicators, keyboard activation, and `aria-pressed` where they express a toggled state. The likes line SHALL be announced on change via a polite live region. The save toast and the `⋯` sheet SHALL each terminate in a route to `/kontakt`, so the card converts rather than merely entertaining; the like and the comment thread SHALL NOT add one, leaving the card two contact routes beside the section's own button.

- **Like** SHALL begin partially filled, SHALL require four activations to reach full, and on completion SHALL increment the likes count and swap the header's meta note. It SHALL NOT add a contact link to the caption — the caption stays one line carrying one joke, and the section's own button sits beside it. The heart SHALL animate on **every** activation, including activations after it is already full; a beat tied to the fill step alone goes dead the moment the fill tops out. The activation that *completes* the fill SHALL additionally emit a small particle burst, and only that activation — the burst is the payoff for four deliberate presses, so repeating it on every later press would spend it.
- **Double-tap or double-click on the image** SHALL bloom a heart and complete the like immediately; this gesture SHALL NOT be the only route to that state.
- **Share** SHALL genuinely share or copy the page link and SHALL carry no joke — it is the honest control that makes the others read as deliberate comedy rather than a broken interface.
- **Save** SHALL toggle a filled state and raise a toast carrying a contact call to action.
- **Comment** SHALL append a real client objection and our answer to it, and the control SHALL then retire. One exchange is enough — the card is a post, not a transcript, and it ends on the answer rather than on a sign-off line.
- **The `⋯` menu** SHALL open a dialog of ad-menu options, one of which answers honestly what the section is and why it is shown.

#### Scenario: Like requires repeated intent
- **WHEN** the visitor activates the like control fewer than four times
- **THEN** the fill advances a step and the likes count does not change

#### Scenario: Like completion
- **WHEN** the like reaches full by either clicks or double-tap
- **THEN** the likes count increments once and the meta note changes, and the caption is left alone

#### Scenario: The heart keeps responding once full
- **WHEN** the visitor activates a like control that is already full
- **THEN** the heart plays its beat again, and the likes count does not increment a second time

#### Scenario: Menu is a dialog
- **WHEN** the `⋯` menu is open
- **THEN** it exposes a dialog role, `Escape` closes it, and focus returns to the control that opened it

#### Scenario: Motion is optional
- **WHEN** the user has `prefers-reduced-motion: reduce`
- **THEN** the heading and cube rest on the first platform and do not advance, and the heart burst, image bloom, share flight, sheet slide, cube pop and typewriter effect are all suppressed in favour of their end states

## REMOVED Requirements

### Requirement: Prepared clip asset
**Reason**: The section no longer renders a video. The looping clip was already replaced by its first frame as a stopgap on 2026-07-22, and this change replaces the media column with a static mascot cutout plus a swapping cube. The grading, ping-pong loop, corner-sampling gate and colour-tag rules all described a video asset that is no longer wired in.

**Migration**: `public/clips/cta-llama-work.mp4` and `cta-llama-work-poster.jpg` remain in the repository, unreferenced, as the fallback if this change is reverted. `lib/scripts/verify-clip-bg.ts` stays — other clips still use it. The "no perceivable edge against the section background" obligation is carried forward by the composited-not-baked scenario in **Looping clip media column**, which achieves the same outcome without fixing a background into the asset.

### Requirement: Poster fallback
**Reason**: The poster existed to stand in for a `<video>` before hydration and under reduced motion. With a still mascot there is no video to stand in for — the image renders server-side on the normal path, so the pre-hydration and reduced-motion cases collapse into it.

**Migration**: Covered by the reduced-motion scenario in **Interactive post controls** (heading and cube rest on the first platform) and by the standard image render. No separate poster asset is required.
