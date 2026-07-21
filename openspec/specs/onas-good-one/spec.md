# onas-good-one Specification

## Purpose
TBD - created by archiving change onas-good-one-orbit. Update Purpose after archive.
## Requirements
### Requirement: Good One group section
The /o-nas page SHALL present a "JESTEŚMY CZĘŚCIĄ GOOD ONE" section showing the Good One group as a hub-and-spoke wheel: a central Good One mark, six child companies (Good One PR, Social Lama, Diea, TymKor media, Folks, SEOFLY) each with its specialty label, arranged around a dotted ring, alongside the intro copy.

#### Scenario: Section content
- **WHEN** the /o-nas page renders the Good One section
- **THEN** the central hub and all six child companies with their specialty labels are present, next to the group intro heading and copy

### Requirement: Desktop orbiting wheel
At and above the desktop breakpoint, the wheel SHALL be a positioned DOM component whose six child logos revolve around the fixed central hub as a perpetual slow rotation. The dotted ring track and the six orange spoke dots SHALL co-rotate in lockstep with the logos — same period and phase — so each dot remains on the spoke inboard of its logo. Each child logo SHALL counter-rotate so it stays upright and readable throughout the revolution. The central hub SHALL NOT move.

#### Scenario: Children orbit, logos upright
- **WHEN** the section is in view on a desktop-width viewport
- **THEN** the six logos revolve around the stationary hub, each staying upright, with each orange dot tracking on the spoke beneath its logo

#### Scenario: No clipped dots
- **WHEN** the ring rotates through any angle
- **THEN** every orange spoke dot renders as a full circle (the ring is not clipped at its edge)

### Requirement: Mobile static fallback
Below the desktop breakpoint, the section SHALL render the existing static wheel image (`good-one-wheel.png`) with no orbit animation and no positioned-DOM rebuild, preserving the current readable layout of all six logos and labels.

#### Scenario: Phone-width rendering
- **WHEN** the section renders below the desktop breakpoint
- **THEN** the single static wheel image is shown, all six logos and labels legible, with no revolving elements

### Requirement: Motion safety
The orbit animation SHALL run only while the section is in the viewport, and SHALL be disabled under `prefers-reduced-motion: reduce`, resolving to a static presentation (no revolving elements).

#### Scenario: Reduced motion
- **WHEN** the user has `prefers-reduced-motion: reduce`
- **THEN** the wheel is presented without any revolving motion

#### Scenario: Offscreen
- **WHEN** the section is scrolled out of view
- **THEN** the orbit animation is not running

