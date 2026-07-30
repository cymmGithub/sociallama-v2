# join-cta-rotator

## Purpose

Define the join-cta section: the rotating locative heading over seven platform tokens, the static mascot cutout composited onto a CSS-owned plum well, the platform cube that swaps with the heading so the media column answers the question the heading asks, the per-platform services copy that keeps the section honest against `/uslugi/content`, and the sponsored-post chrome whose action row is made of real, keyboard-operable controls.
## Requirements
### Requirement: Rotating locative heading
The join-cta heading SHALL render the static lead "POTRZEBUJESZ WSPARCIA" followed by a rotating emphasized token cycling through exactly seven platform entries in order: `NA FACEBOOKU?`, `NA INSTAGRAMIE?`, `NA TIKTOKU?`, `NA LINKEDINIE?`, `NA PINTEREŚCIE?`, `NA X (TWITTER)?`, `NA YOUTUBIE?`. The X token drops its Polish locative inflection ("Twitterze" → "Twitter"), matching the un-inflected form the English copy already uses (`ON X (TWITTER)?`); every other token keeps its inflected form. The discipline tokens `W STRATEGII?` and `W WIDEO?` SHALL NOT appear — every token SHALL name a platform, so that each can drive a platform cube and a distinct services list. The seven tokens SHALL be exactly the seven `PlatformKey` values defined in `lib/content/uslugi.ts`, which is the single canonical platform list. The rotator SHALL keep its own established reading order (the order enumerated above), which is not that file's declaration order — `PlatformKey` declares X before LinkedIn and Pinterest. The canonical list governs *which* platforms appear, not the sequence they are read in. Each token SHALL contain its preposition and trailing question mark so the phrase stays grammatical and the `?` never detaches from the sliding word. The transition SHALL be the hero's masked vertical slide (~650ms, `expo.out`-family ease, outgoing word up / incoming word from below, non-participating words hidden by the mask), advancing every 2600ms. All copy SHALL come from `lib/content/home.ts`.

#### Scenario: Word advance
- **WHEN** the rotation interval elapses with motion allowed
- **THEN** the current token slides up out of the mask while the next token slides into place, and after the seventh token the cycle wraps to the first

#### Scenario: Layout stability
- **WHEN** any token is active
- **THEN** the heading block's size does not change between tokens (the rotator cell reserves the widest token) and no token is visibly clipped horizontally

#### Scenario: Stable accessible name
- **WHEN** assistive technology reads the section heading
- **THEN** it announces the full first-entry phrase ("POTRZEBUJESZ WSPARCIA NA FACEBOOKU?") regardless of which token is visually active, and the rotating spans are hidden from the accessibility tree

#### Scenario: X token is un-inflected
- **WHEN** the X token is compared to the other six
- **THEN** it reads `NA X (TWITTER)?` rather than a locative form, while the other six keep their inflected Polish grammar

### Requirement: Mascot media column
The join-cta media column SHALL render a **static mascot cutout** — the suited llama — as a transparent image composited onto the section's plum well by CSS; no background SHALL be baked into the asset. The well SHALL be the brand plum with a radial falloff toward the corners so the cutout reads as a photograph rather than a flat swatch. The mascot SHALL be served `unoptimized` (Next's optimizer corrupts transparent WebP colour and alpha). The mascot SHALL NOT change with the rotator — only the platform cube it holds does, per **Platform cube swap**. The mascot SHALL carry the `joinCta.llamaAlt` label.

#### Scenario: Mascot is stable
- **WHEN** the heading rotator advances between tokens
- **THEN** the llama does not change, move, or rescale — the visitor sees one continuous character

#### Scenario: Composited, not baked
- **WHEN** the section renders on the plum-deep chapter
- **THEN** no edge or rectangle of the mascot image is perceivable against the well, and the well's colour is determined entirely by the stylesheet

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

### Requirement: Sponsored-post chrome
The mascot SHALL be presented inside white sponsored-post chrome: a card header with the llama-logomark avatar and the `social.lama` handle linking to the real Instagram profile, a media well, and a card footer with an action row, a likes line, and a caption. The caption SHALL keep its existing joke verbatim (`joinCta.post.caption`). Post strings SHALL come from `lib/content/home.ts` (`joinCta.post`); the decorative avatar SHALL be hidden from assistive technology; the profile link SHALL carry an accessible label naming the destination.

#### Scenario: Profile link
- **WHEN** the user activates the avatar/handle in the card header
- **THEN** `https://www.instagram.com/social.lama/` opens in a new tab with `rel="noopener noreferrer"`

### Requirement: Interactive post controls
The card's action controls SHALL be real controls, not decoration: they SHALL be `button` elements with accessible labels, visible focus indicators, keyboard activation, and `aria-pressed` where they express a toggled state. The likes line SHALL be announced on change via a polite live region. The save toast and the `⋯` menu SHALL each terminate in a route to `/kontakt`, so the card converts rather than merely entertaining; the like and the comment thread SHALL NOT add one, leaving the card two contact routes beside the section's own button.

- **Like** SHALL begin partially filled, SHALL require four activations to reach full, and on completion SHALL increment the likes count and swap the header's meta note. It SHALL NOT add a contact link to the caption — the caption stays one line carrying one joke, and the section's own button sits beside it. The heart SHALL animate on **every** activation, including activations after it is already full; a beat tied to the fill step alone goes dead the moment the fill tops out. The activation that *completes* the fill SHALL additionally emit a small particle burst, and only that activation — the burst is the payoff for four deliberate presses, so repeating it on every later press would spend it.
- **Double-tap or double-click on the image** SHALL bloom a heart and complete the like immediately; this gesture SHALL NOT be the only route to that state.
- **Share** SHALL genuinely share or copy the page link and SHALL carry no joke — it is the honest control that makes the others read as deliberate comedy rather than a broken interface.
- **Save** SHALL toggle a filled state and raise a toast carrying a contact call to action.
- **Comment** SHALL append a real client objection and our answer to it, and the control SHALL then retire. One exchange is enough — the card is a post, not a transcript, and it ends on the answer rather than on a sign-off line.
- **The `⋯` menu** SHALL open a **non-modal dropdown** of ad-menu options anchored to its trigger, one of which answers honestly what the section is and why it is shown. It SHALL NOT be a modal dialog: no `aria-modal`, no scrim and no focus trap. Selecting an option SHALL reveal that option's answer **in place, beneath the option, leaving the option list mounted** — the list SHALL NOT be replaced by the answer. Replacing it unmounts the control holding focus, which strands focus outside the menu and is the cause of the observed Safari/iOS unreliability; keeping the list mounted removes that failure mode rather than compensating for it.

#### Scenario: Like requires repeated intent
- **WHEN** the visitor activates the like control fewer than four times
- **THEN** the fill advances a step and the likes count does not change

#### Scenario: Like completion
- **WHEN** the like reaches full by either clicks or double-tap
- **THEN** the likes count increments once and the meta note changes, and the caption is left alone

#### Scenario: The heart keeps responding once full
- **WHEN** the visitor activates a like control that is already full
- **THEN** the heart plays its beat again, and the likes count does not increment a second time

#### Scenario: Menu is a dismissible dropdown
- **WHEN** the `⋯` menu is open
- **THEN** its trigger reports the expanded state, `Escape` closes it, a pointer press outside it closes it, and focus returns to the trigger on close

#### Scenario: Menu is not modal
- **WHEN** the `⋯` menu is open
- **THEN** no scrim covers the page, the rest of the page stays reachable, and `Tab` is not trapped inside the menu

#### Scenario: An answer opens without unmounting the list
- **WHEN** the visitor selects one of the menu options
- **THEN** that option's answer appears beneath it, the full option list is still present, and the control that was activated still holds focus

#### Scenario: Menu still routes to contact
- **WHEN** an option's answer is open
- **THEN** a link to `/kontakt` is reachable from the menu

#### Scenario: Motion is optional
- **WHEN** the user has `prefers-reduced-motion: reduce`
- **THEN** the heading and cube rest on the first platform and do not advance, and the heart burst, image bloom, share flight, dropdown reveal, cube pop and typewriter effect are all suppressed in favour of their end states

### Requirement: No rotator token overlaps the post card
The heading and the sponsored-post card SHALL never overlap. The constraint SHALL be satisfied for the **widest** token in the set at every viewport, not merely for whichever token happens to be active — the tokens differ in width by more than 200px, so a layout tuned to the active word fails the moment the rotator advances.

The token line SHALL clear the card's column by a visible gutter rather than merely touching it. Where the heading's display scale cannot satisfy this at a given viewport, the scale SHALL be reduced until it does; the heading may not be allowed to render over the card on the grounds that the card is decorative.

This SHALL hold at the laptop widths where the failure was measured — 1024, 1152, 1280, 1366, 1440, 1512, 1600 and 1680 px — as well as at wider and narrower viewports.

#### Scenario: Widest token clears the card
- **WHEN** the longest rotator token is the active word, at any viewport from 1024px upward
- **THEN** its rendered text ends left of the post card's column with a gutter, and no glyph is drawn over the card

#### Scenario: Every token clears, not just the active one
- **WHEN** each token in turn is measured at a given viewport
- **THEN** all of them clear the card's column, so advancing the rotator can never produce an overlap

#### Scenario: Reserved space follows the widest token
- **WHEN** the token mask's own box is measured
- **THEN** it lies entirely within the copy column, so the mask cannot overhang the card even before a word animates

#### Scenario: Overlap is a layout failure, not a z-order choice
- **WHEN** a token would otherwise cross the card
- **THEN** the heading scale is reduced so it does not, rather than the text being layered above or below the card

