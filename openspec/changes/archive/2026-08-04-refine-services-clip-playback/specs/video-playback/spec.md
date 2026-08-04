# video-playback — delta

## MODIFIED Requirements

### Requirement: Video UI component
The system SHALL provide `@/components/ui/video` accepting `src`, `poster`, and optional `mobileSrc`/`posterMobile` props, rendering a muted, inline, looping video that does not download media until needed (`preload="none"`, poster paints first).

The component SHALL additionally accept an optional controlled `playing?: boolean` prop. When omitted, playback follows viewport visibility exactly as before. When provided, playback requires both viewport visibility and `playing !== false`; setting `playing` to `false` SHALL pause the mounted `<video>` in place — the current frame stays visible, the playback position is retained, and setting `playing` back to `true` resumes from that position. A controlled video that has never played SHALL show its poster and download nothing.

#### Scenario: Lazy playback
- **WHEN** the video element enters the viewport
- **THEN** playback starts; **WHEN** it leaves the viewport **THEN** playback pauses

#### Scenario: Controlled freeze-frame pause
- **WHEN** a playing video's `playing` prop flips to `false`
- **THEN** the element pauses on its current frame without unmounting or reverting to the poster; **WHEN** `playing` flips back to `true` while in viewport **THEN** playback resumes from the retained position

#### Scenario: Controlled video defers download
- **WHEN** a video mounts with `playing={false}` and is never selected
- **THEN** it renders its poster and requests no media bytes

#### Scenario: Responsive source
- **WHEN** the viewport matches the mobile breakpoint at mount and `mobileSrc` is provided
- **THEN** the mobile source and mobile poster are used instead of the desktop ones

#### Scenario: Reduced motion
- **WHEN** the user has `prefers-reduced-motion: reduce`
- **THEN** the component renders the poster through `@/components/ui/image` and no video element is created

#### Scenario: Storybook coverage
- **WHEN** `bun storybook` runs
- **THEN** a `Video` story exists demonstrating poster, playback, reduced-motion, and controlled freeze-frame states
