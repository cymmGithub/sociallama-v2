# join-cta-rotator (delta)

## ADDED Requirements

### Requirement: Looping clip media column
The join-cta media column SHALL render a single square video clip of the multi-arm llama via the `components/ui/video` primitive — muted, inline, looping, poster-first (`preload="none"`), playing only while in the viewport. The clip SHALL run on its own loop clock with no synchronization to the heading rotator. The video SHALL be exposed to assistive technology with the existing `joinCta.llamaAlt` label. Clip and poster paths SHALL come from `lib/content/home.ts` (`joinCta.clip`, `joinCta.poster`), and the `rotator` entries SHALL carry tokens only (no per-entry image field).

#### Scenario: Independent playback
- **WHEN** the heading rotator advances between tokens
- **THEN** the video's playback is unaffected — no seek, restart, or visibility change is driven by rotation state

#### Scenario: Plays only in view
- **WHEN** the section scrolls out of the viewport
- **THEN** the video pauses, and it resumes when the section re-enters the viewport

### Requirement: Prepared clip asset
The shipped clip SHALL be derived from the lama-showcase source (`work.mp4`) by: square crop containing the llama and all six props, color grade toward plum-deep `#722341`, an edge-feathered blend to exactly flat `#722341` at the frame boundary, and ping-pong concatenation (forward + reversed) so the loop point is seamless. The final encode MUST pass the corner-sampling gate (`bun lib/scripts/verify-clip-bg.ts <clip> '#722341'`) and SHALL weigh no more than ~3 MB, in family with the other `public/clips/*.mp4` assets. The theme token SHALL NOT be adjusted to match the asset; if grading cannot pass the gate without visibly degrading the llama, the clip SHALL be regenerated on a flat `#722341` background instead.

#### Scenario: Gate enforcement
- **WHEN** the final clip's four corner samples deviate from `#722341` beyond the gate tolerance (±3 per RGB channel or ΔE ≥ 3)
- **THEN** the asset is rejected and re-graded or regenerated before being wired into the section

#### Scenario: No visible boundary or loop jump
- **WHEN** the section renders on the plum-deep chapter and the clip completes a full cycle
- **THEN** no edge or rectangle of the clip is perceivable against the section background, and no frame jump is perceivable at the loop point

### Requirement: Poster fallback
A poster JPG SHALL be exported from the first frame of the final processed clip (pixel-identical to frame 0) and SHALL satisfy the same `#722341` corner gate, including when served through the Next image optimizer at the section's rendered widths. Server-side rendering, pre-hydration, and `prefers-reduced-motion: reduce` SHALL all render the poster still in the same layout box as the video (no shift when the video mounts).

#### Scenario: Reduced motion
- **WHEN** the user has `prefers-reduced-motion: reduce`
- **THEN** no `<video>` element is created and the poster still renders in its place permanently

#### Scenario: Pre-hydration render
- **WHEN** the section renders before hydration (or with JavaScript disabled)
- **THEN** the poster is visible and the layout matches the playing state's layout (no shift on hydration)

### Requirement: Sponsored-post chrome
The clip SHALL be presented inside white sponsored-post chrome (user pick 2026-07-17): a card header with the llama-logomark avatar and the `social.lama` handle linking to the real Instagram profile, and a card footer with decorative action icons, a likes line, and a caption. Post strings SHALL come from `lib/content/home.ts` (`joinCta.post`). Decorative chrome (icons, avatar) SHALL be hidden from assistive technology; the video SHALL keep its `llamaAlt` label; the profile link SHALL carry an accessible label naming the destination.

#### Scenario: Profile link
- **WHEN** the user activates the avatar/handle in the card header
- **THEN** `https://www.instagram.com/social.lama/` opens in a new tab with `rel="noopener noreferrer"`

## REMOVED Requirements

### Requirement: Word-synchronized image stack
**Reason**: The media column is now a single continuously-looping clip; a nine-image crossfade synchronized to the heading no longer exists, and no word↔media synchronization remains by design (user decision 2026-07-17).
**Migration**: Delete the nine `public/clips/cta-*.jpg` assets, the `rotator[].image` content fields, and the stack/crossfade markup and CSS in `app/(home)/sections/join-cta/`.

### Requirement: Seamless-composite image assets
**Reason**: The nine generated stills are deleted along with the stack. The seamless-composite convention itself carries over to the clip and poster via the "Prepared clip asset" and "Poster fallback" requirements.
**Migration**: The `#722341` corner gate now applies to `cta-llama-work.mp4` and its poster instead of the nine JPGs.

### Requirement: Static fallback replaces the CTA clip
**Reason**: Reversed — the section ships a video again (user decision 2026-07-17). The reduced-motion and pre-hydration guarantees are preserved by the "Poster fallback" requirement; the first-entry heading behavior is unchanged under the still-active "Rotating locative heading" requirement.
**Migration**: New assets are named `cta-llama-work.mp4` / `cta-llama-work-poster.jpg` — the retired `cta-llama.mp4` / `cta-llama-poster.jpg` names stay retired.
