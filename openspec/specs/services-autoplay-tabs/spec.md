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
Each service item in `lib/content/home.ts` SHALL declare its stage media as a typed union — `panels` (list of image panels), `video` (list of framed clips), or `placeholder` — and the stage SHALL render each kind accordingly: panels as floating rounded/shadowed cards DOM-positioned over the gradient with a staggered entrance on tab activation; video as phone-framed 9:16 `Video` primitives centered in the stage (opposite tilts when paired) with `autoPlay` bound to the tab's active state; placeholder as the styled gradient stage with no media and no reserved empty panel space.

#### Scenario: Content tab panels
- **WHEN** the CONTENT tab activates
- **THEN** its six platform panels (Instagram, TikTok, LinkedIn, X screenshots; Pinterest and YouTube brand-referenced generations) enter as individually positioned floating panels with a visible stagger; on mobile only the first three render

#### Scenario: Video plays only while its tab is active
- **WHEN** the KREACJE I WIDEO tab is active with motion allowed
- **THEN** the framed clips (Burger King BTS, DPD event) play muted and looping; **WHEN** another tab activates **THEN** the clips stop playing

#### Scenario: Sprzedaż dashboard panels
- **WHEN** the SPRZEDAŻ tab activates
- **THEN** its six results-dashboard panels (Meta Ads Manager, Instagram Insights, YouTube Studio, X Analytics, TikTok Studio, LinkedIn Analytics — brand-consistent generations with upward-trending metrics) enter as symmetric pairs around the phone-framed Insights hero

#### Scenario: Placeholder stage kind
- **WHEN** any service declares the `placeholder` stage kind (supported for future tabs without assets)
- **THEN** the stage shows the deliberately styled gradient state with the service title as an outlined watermark (no broken/empty panel frames), and the tab participates in the autoplay loop like the others

### Requirement: Mobile stacked fallback
Below the desktop breakpoint the section SHALL render no tab machinery: all three services appear stacked, each as its own block with title, body, and its stage media on a static (non-drifting) gradient background, with no autoplay, no timers, and no progress bars.

#### Scenario: Mobile rendering
- **WHEN** the section renders below the desktop breakpoint
- **THEN** all three services are visible simultaneously, the video block uses the `Video` primitive's standard in-viewport playback, and no progress bars exist

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
The stage assets SHALL be served from `public/`: the four platform screenshots copied from the user-provided captures, eight generated panels (Pinterest and YouTube profiles referenced on the real screenshots; Meta Ads Manager, Instagram Insights, YouTube Studio, X Analytics, TikTok Studio, and LinkedIn Analytics dashboards — all nano-banana with exact Polish copy in the prompts), and the two clips (Burger King BTS, DPD event) transcoded from HEVC `.mov` sources to H.264 MP4 (~600×1066, `faststart`, target ≤3 MB each, trimmed to tight ~12s loops) with extracted poster frames. The legacy `service-*` clips and posters SHALL be deleted.

#### Scenario: Video payload
- **WHEN** a Kreacje clip is requested by the browser
- **THEN** it is an H.264 MP4 of at most ~3 MB with a poster that paints before playback

#### Scenario: Legacy clips removed
- **WHEN** the change is implemented
- **THEN** no `public/clips/service-*` files remain and nothing references them

