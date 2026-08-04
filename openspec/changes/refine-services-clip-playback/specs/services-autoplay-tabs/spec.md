# services-autoplay-tabs — delta

## MODIFIED Requirements

### Requirement: Per-tab stage media from typed descriptors
Each service item in `lib/content/home.ts` SHALL declare its stage media as a typed union — `panels` (list of image panels, each optionally framed as a device: laptop, phone, or tablet), `video` (list of framed clips), or `placeholder` — and the stage SHALL render each kind accordingly: unframed panels as floating rounded/shadowed cards DOM-positioned over the gradient with a staggered entrance on tab activation; device-framed panels inside CSS-built device bezels sharing the same positioning and stagger vocabulary; video as phone-framed 9:16 `Video` primitives centered in the stage (opposite tilts when paired) with `autoPlay` bound to the tab's active state; placeholder as the styled gradient stage with no media and no reserved empty panel space.

The video rail SHALL play exactly one clip at a time: the middle clip by default, while every non-playing clip renders dimmed with a centered play badge and a full-card button labelled from the localized `playLabel` plus the clip's alt text. Tapping a non-playing clip SHALL make it the playing clip; the previously playing clip SHALL freeze on its current frame (not snap back to its poster) and SHALL resume from that position if re-selected. The playing clip SHALL render no button and no dimming.

#### Scenario: Content tab panels
- **WHEN** the CONTENT tab activates
- **THEN** its seven case-study creative panels (Volvo, Pracuj.pl, and iRobot campaign creatives drawn from `public/case-studies/`) enter as individually positioned floating panels with a visible stagger; on mobile only the first three render

#### Scenario: One clip plays while its tab is active
- **WHEN** the KREACJE I WIDEO tab is active with motion allowed
- **THEN** only the middle clip (DPD event) plays muted and looping while the Burger King BTS and Dom Volvo clips sit dimmed behind play badges; **WHEN** another tab activates **THEN** no clip plays

#### Scenario: Tap switches the playing clip
- **WHEN** the user taps a dimmed clip's play button
- **THEN** that clip undims and plays, the previously playing clip dims and freezes on its current frame, and re-selecting the frozen clip later resumes it from that frame

#### Scenario: Sprzedaż device-framed dashboards
- **WHEN** the SPRZEDAŻ tab activates
- **THEN** exactly three results dashboards enter with the panel stagger, each inside a CSS-built device frame: Meta Ads Manager in a laptop, Instagram Insights in a phone, and YouTube Studio in a tablet — with no baked-in mattes, window chrome, or bezels visible inside any screen

#### Scenario: Placeholder stage kind
- **WHEN** any service declares the `placeholder` stage kind (supported for future tabs without assets)
- **THEN** the stage shows the deliberately styled gradient state with the service title as an outlined watermark (no broken/empty panel frames), and the tab participates in the autoplay loop like the others

#### Scenario: Reduced-motion rail
- **WHEN** a `prefers-reduced-motion: reduce` user views the video rail
- **THEN** all three clips render as undimmed posters with no play buttons and nothing plays

### Requirement: Mobile stacked fallback
Below the desktop breakpoint the section SHALL render no tab machinery: all three services appear stacked, each as its own block with title, body, and its stage media on a static (non-drifting) gradient background, with no autoplay, no timers, and no progress bars. The video block SHALL use the same one-clip-at-a-time rail as desktop (middle clip playing when in viewport, dimmed tap-to-play neighbours).

#### Scenario: Mobile rendering
- **WHEN** the section renders below the desktop breakpoint
- **THEN** all three services are visible simultaneously, the video block plays only its middle clip while in viewport with the other two dimmed behind play badges, and no progress bars exist

## ADDED Requirements

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
