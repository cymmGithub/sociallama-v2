# Delta: onas-team

## ADDED Requirements

### Requirement: Bios state tenure as a start year, never as a duration

Member bios SHALL express experience or tenure as an absolute start year
("od 2021 roku…", EN "since 2021…") and SHALL NOT use duration phrasing
("od 5 lat…", "od ponad 12 lat…", "X lat doświadczenia"). Durations go stale
every January and force a full-roster copy audit; start years stay true
forever. When converting an existing "ponad N lat" phrase, the start year
SHALL be computed as the current year minus N — the latest plausible year,
which keeps the claim a safe lower bound.

#### Scenario: No duration phrasing in the roster

- **WHEN** `oNasTeam.members` bios (PL and EN) are inspected
- **THEN** no bio contains a "lat"/"years" duration claim of experience or
  tenure; every tenure claim names a calendar year

#### Scenario: Converted years are lower-bound safe

- **WHEN** a bio previously claiming "od ponad 12 lat" (as of 2026) is read
- **THEN** it claims "od 2014 roku" (or an earlier, client-confirmed year),
  never a later year
