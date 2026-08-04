# services-autoplay-tabs Specification

## Purpose
TBD - created by archiving change services-autoplay-tabs. Update Purpose after archive.
## Requirements
### Requirement: Autoplay tabs layout and loop
The Services section SHALL render one shared 16:9 stage above three tab columns (CONTENT, SPRZEDAŻ, KREACJE I WIDEO) on desktop. Exactly one tab SHALL be active at a time; the active tab's stage layer is visible and others hidden, crossfading on switch (~0.3s opacity). While the section is on screen and motion is allowed, the active tab SHALL auto-advance to the next (wrapping) after its dwell — 6s by default, overridable per tab via `dwellMs` (KREACJE I WIDEO holds 11s so the clips get watch time) — and each tab column SHALL show a progress bar filling linearly from 0% to 100% over the active tab's dwell. Each tab column SHALL be clickable as a whole; clicking switches to that tab immediately and restarts the dwell cycle from it.

#### Scenario: Auto-advance loop
- **WHEN** the section is visible and the active tab's dwell elapses
- **THEN** the next tab (wrapping to the first after the last) becomes active, its stage layer crossfades in, and its progress bar restarts from 0%

#### Scenario: Click to switch
- **WHEN** the user clicks an inactive tab column
- **THEN** that tab becomes active immediately, the previous progress bar resets, and the loop continues from the clicked tab with a full dwell

#### Scenario: Off-screen pause
- **WHEN** the section leaves the viewport during the loop
- **THEN** auto-advance stops and the active progress bar pauses at its current fill; **WHEN** the section re-enters **THEN** the loop resumes from where it paused

### Requirement: Live grain-gradient stage background
The stage SHALL render a live layered background in brand tokens with no WebGL and no baked background images: (1) a plum→orange base gradient (`--color-plum` → `--color-orange`), (2) slowly drifting blurred gradient blobs animated via GPU-composited CSS transforms (~20–30s cycle), and (3) a static SVG `feTurbulence` grain overlay blended with `mix-blend-mode: soft-light` covering the entire stage **including the media panels**, so all per-tab media shares one film grain.

#### Scenario: Continuous light animation
- **WHEN** the section is on screen with motion allowed
- **THEN** the background's light blobs drift continuously regardless of which tab is active, and the grain overlay is visible over both the gradient and the panels

#### Scenario: Grain does not obscure content
- **WHEN** a screenshot panel with small text renders under the grain overlay
- **THEN** the text remains legible at 100% zoom (grain opacity tuned low, ~0.3–0.4)

### Requirement: Per-tab stage media from typed descriptors
Each service item in `lib/content/home.ts` SHALL declare its stage media as a typed union — `panels` (list of image panels, each optionally framed as a device: laptop, phone, or tablet), `video` (list of framed clips), or `placeholder` — and the stage SHALL render each kind accordingly: unframed panels as floating rounded/shadowed cards DOM-positioned over the gradient with a staggered entrance on tab activation; device-framed panels inside CSS-built device bezels sharing the same positioning and stagger vocabulary; video as phone-framed 9:16 `Video` primitives centered in the stage (alternating tilts) with `autoPlay` bound to the tab's active state; placeholder as the styled gradient stage with no media and no reserved empty panel space.

The video rail SHALL play exactly one clip at a time: the clip at index `floor(count / 2)` by default (the middle clip; with four clips, the third), while every non-playing clip renders dimmed with a centered play badge and a full-card button labelled from the localized `playLabel` plus the clip's alt text. Tapping a non-playing clip SHALL make it the playing clip; the previously playing clip SHALL freeze on its current frame (not snap back to its poster) and SHALL resume from that position if re-selected. The playing clip SHALL render no button and no dimming.

#### Scenario: Content tab panels
- **WHEN** the CONTENT tab activates
- **THEN** its seven 4:5 brand creatives (Burger King hero, Social Lama × DPD, Breville, pracuj.pl/iRobot/Vobis, Laurastar, Easy Egg, Kohersen — served from `public/assets/content-*.jpg`) enter as individually positioned floating panels with a visible stagger, in a seven-slot collage tuned for the uniform 4:5 ratio (center hero, inner flanks, corner slots; the low-res Kohersen occupies the smallest slot); on mobile only the first three (Burger King, DPD, Breville) render

#### Scenario: One clip plays while its tab is active
- **WHEN** the KREACJE I WIDEO tab is active with motion allowed on desktop/tablet
- **THEN** the rail shows four clips and only the default clip plays muted and looping while the other three sit dimmed behind play badges; **WHEN** another tab activates **THEN** no clip plays

#### Scenario: Four clips fit the rail at every desktop width
- **WHEN** the KREACJE I WIDEO tab renders at any viewport at or above the desktop breakpoint
- **THEN** all four phone frames fit inside the stage side by side without horizontal overflow or aspect-ratio distortion, keeping the alternating tilt rhythm across all four frames

#### Scenario: Tap switches the playing clip
- **WHEN** the user taps a dimmed clip's play button
- **THEN** that clip undims and plays, the previously playing clip dims and freezes on its current frame, and re-selecting the frozen clip later resumes it from that frame

#### Scenario: Sprzedaż device-framed dashboards
- **WHEN** the SPRZEDAŻ tab activates
- **THEN** its dashboard panels render unchanged by this change (no new assets, no slot retuning)

#### Scenario: Placeholder stage kind
- **WHEN** any service declares the `placeholder` stage kind (supported for future tabs without assets)
- **THEN** the stage shows the deliberately styled gradient state with the service title as an outlined watermark (no broken/empty panel frames), and the tab participates in the autoplay loop like the others

#### Scenario: Reduced-motion rail
- **WHEN** a `prefers-reduced-motion: reduce` user views the video rail
- **THEN** every visible clip renders as an undimmed poster with no play buttons and nothing plays (four posters on desktop/tablet, three on mobile)

### Requirement: Mobile stacked fallback
Below the desktop breakpoint the section SHALL render no tab machinery: all three services appear stacked, each as its own block with title, body, and its stage media on a static (non-drifting) gradient background, with no autoplay, no timers, and no progress bars. The video block SHALL use the same one-clip-at-a-time rail as desktop but SHALL show only the first three clips — the fourth clip is desktop/tablet-only and SHALL be hidden on mobile (CSS `nth-child(n + 4)` cap, mirroring the panel trio rule). The default playing clip SHALL be one of the three visible frames.

#### Scenario: Mobile rendering
- **WHEN** the section renders below the desktop breakpoint
- **THEN** all three services are visible simultaneously, the video block shows exactly three clip frames (the fourth is hidden), plays only its default clip while in viewport with the others dimmed behind play badges, and no progress bars exist

#### Scenario: Hidden fourth clip costs nothing visually
- **WHEN** the video block renders on mobile with four clips in the data
- **THEN** the three visible frames keep the same size and spacing as today's three-clip layout, with no gap or offset left by the hidden fourth frame

### Requirement: Reduced motion
With `prefers-reduced-motion: reduce`, the background SHALL render as a static gradient (no blob drift), tab switches SHALL be instant (no crossfade), autoplay SHALL be disabled entirely (first tab open, user switches by click), and progress bars SHALL render full rather than animating.

#### Scenario: Reduced-motion visit
- **WHEN** a reduced-motion user views the section
- **THEN** nothing on the stage animates, the first tab's content is visible, and clicking another tab swaps content instantly

### Requirement: Accessible tab semantics
Each tab column's clickable element SHALL be a real `<button>` carrying `aria-expanded` (true only on the active tab) and `aria-controls` referencing its stage layer's `id`; tab switching SHALL be keyboard-operable.

#### Scenario: Keyboard and AT
- **WHEN** a keyboard user tabs to a column button and presses Enter/Space
- **THEN** that tab activates, `aria-expanded` updates on all three buttons, and the stage layer it controls is exposed via `aria-controls`

### Requirement: Real web-ready assets
The stage assets SHALL be served from `public/`: the CONTENT tab's seven brand creatives as optimized JPEGs at `public/assets/content-<brand>.jpg` (≤1080px wide, re-encoded from the marketing exports; the low-res Kohersen source is not upscaled) with descriptive Polish alts in `lib/content/home.ts` and English alts in `home.en.ts`; and the four rail clips as H.264 MP4s (~600×1066, `faststart`, target ≤3 MB each, tight ~12s loops) with extracted poster frames and explicit bt709 color tags — the new fourth clip SHALL be transcoded from its HEVC source accordingly (HEVC and VP9 sources SHALL NOT ship as-is). The replaced CONTENT panel sources under `public/case-studies/` SHALL remain untouched — they are live case-study gallery files.

#### Scenario: Video payload
- **WHEN** a Kreacje clip is requested by the browser
- **THEN** it is an H.264 MP4 of at most ~3 MB with a poster that paints before playback, and it plays in Chromium, Firefox, and Safari alike

#### Scenario: Panel image payload
- **WHEN** a CONTENT panel image is requested
- **THEN** it is a JPEG no wider than 1080px served from `public/assets/content-*.jpg`, and its declared `width`/`height` in the content data match the file's true aspect ratio

#### Scenario: Replaced sources stay
- **WHEN** the change is implemented
- **THEN** the previously referenced `public/case-studies/` panel images still exist and case-study pages referencing them are unaffected

### Requirement: Clip engagement stops auto-advance
Tapping any clip's play button SHALL disable the tab auto-advance loop — unlike the off-screen pause, the loop SHALL NOT resume on its own (viewport re-entry or timeout). Clicking a different tab column SHALL revive the loop with its existing behavior (switch immediately, restart the dwell, rotation continues); clicking the already-active tab remains a no-op, so it does not steal a playing clip.

#### Scenario: Play tap hands over control
- **WHEN** the user taps a dimmed clip's play button while the auto-advance loop is running
- **THEN** the dwell progress stops and no tab auto-advances until the user clicks another tab column, while manual tab switching keeps working

#### Scenario: Tab click revives the loop
- **WHEN** the user clicks a different tab column after tapping a clip
- **THEN** the tab switches, the dwell restarts from zero, and auto-advance resumes as before any clip engagement

#### Scenario: Tab clicks do not stop the loop
- **WHEN** the user clicks a tab column without ever tapping a clip
- **THEN** the loop continues exactly as before this change (full dwell from the clicked tab, then auto-advance)

