## MODIFIED Requirements

### Requirement: Per-tab stage media from typed descriptors
Each service item in `lib/content/home.ts` SHALL declare its stage media as a typed union — `panels` (list of image panels, each optionally framed as a device: laptop, phone, or tablet), `video` (list of framed clips), or `placeholder` — and the stage SHALL render each kind accordingly: unframed panels as floating rounded/shadowed cards DOM-positioned over the gradient with a staggered entrance on tab activation; device-framed panels inside CSS-built device bezels sharing the same positioning and stagger vocabulary; video as phone-framed 9:16 `Video` primitives centered in the stage (opposite tilts when paired) with `autoPlay` bound to the tab's active state; placeholder as the styled gradient stage with no media and no reserved empty panel space.

#### Scenario: Content tab panels
- **WHEN** the CONTENT tab activates
- **THEN** its seven case-study creative panels (Volvo, Pracuj.pl, and iRobot campaign creatives drawn from `public/case-studies/`) enter as individually positioned floating panels with a visible stagger; on mobile only the first three render

#### Scenario: Video plays only while its tab is active
- **WHEN** the KREACJE I WIDEO tab is active with motion allowed
- **THEN** the framed clips (Burger King BTS, DPD event) play muted and looping; **WHEN** another tab activates **THEN** the clips stop playing

#### Scenario: Sprzedaż device-framed dashboards
- **WHEN** the SPRZEDAŻ tab activates
- **THEN** exactly three results dashboards enter with the panel stagger, each inside a CSS-built device frame: Meta Ads Manager in a laptop, Instagram Insights in a phone, and YouTube Studio in a tablet — with no baked-in mattes, window chrome, or bezels visible inside any screen

#### Scenario: Placeholder stage kind
- **WHEN** any service declares the `placeholder` stage kind (supported for future tabs without assets)
- **THEN** the stage shows the deliberately styled gradient state with the service title as an outlined watermark (no broken/empty panel frames), and the tab participates in the autoplay loop like the others

### Requirement: Real web-ready assets
The stage assets SHALL be served from `public/`: the CONTENT tab's seven case-study creatives referenced from the existing `public/case-studies/` files; the SPRZEDAŻ tab's three dashboard images cropped to pure screen content (no baked mattes, browser chrome, or device bezels — device presentation comes exclusively from CSS frames); and the two clips (Burger King BTS, DPD event) transcoded from HEVC `.mov` sources to H.264 MP4 (~600×1066, `faststart`, target ≤3 MB each, trimmed to tight ~12s loops) with extracted poster frames. Replaced or unused stage assets (the six own-profile screenshots and the uncropped/unused dashboard files) SHALL be deleted after a repo-wide reference check.

#### Scenario: Video payload
- **WHEN** a Kreacje clip is requested by the browser
- **THEN** it is an H.264 MP4 of at most ~3 MB with a poster that paints before playback

#### Scenario: Dashboard screens are pure content
- **WHEN** a SPRZEDAŻ dashboard image is rendered inside its CSS device frame
- **THEN** the image contains only dashboard UI — no baked white/blue matte, no baked browser window, no baked phone bezel

#### Scenario: Legacy stage assets removed
- **WHEN** the change is implemented
- **THEN** the replaced profile screenshots and unused dashboard originals no longer exist under `public/assets/`, and no code references them
