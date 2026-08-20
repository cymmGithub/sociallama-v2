## ADDED Requirements

### Requirement: The listing subhead is two lines, each whole
The `/case-studies` subhead SHALL render as exactly two lines at desktop widths in both locales, its second clause opening the second line with no connecting dash, and neither the brand name "Social Lama" nor the closing phrase SHALL be broken across a line end. The header's measure SHALL be wide enough for the longer locale's second line to hold together on one line.

#### Scenario: Exactly two lines at desktop
- **WHEN** `/case-studies` renders at 1440 px
- **THEN** the subhead occupies exactly two lines, the second beginning at "Wybrane" / "Selected" and ending with the full closing phrase, and "Social Lama" sits whole on one line

#### Scenario: Brand name survives a narrow wrap
- **WHEN** `/case-studies` renders at 360 px
- **THEN** the second clause may wrap further, and "Social" and "Lama" are still on the same line

### Requirement: Stock covers follow the proof-surface stock rule
A case-study `cover` SHALL be subject to the same conditions as stock on a proof surface: explicit per-image approval recorded in the change's per-image plan, no third-party brand marks, provenance (source URL and licence) recorded alongside the change, and alt text that describes the photograph without attributing it to the client. Candidates SHALL be judged at the card and hero crops, not as uncropped thumbnails.

#### Scenario: Candidate approved at crop size
- **WHEN** a stock cover candidate is presented for approval
- **THEN** it is shown cropped to the listing-card and hero boxes, and only an approved candidate is uploaded

#### Scenario: Provenance per cover
- **WHEN** a stock cover is written to a study
- **THEN** the change's provenance file carries that cover's filename, study, source page URL and image URL

### Requirement: A withdrawn study leaves no trace on any surface
When the client withdraws a case study, the study document and every media document referenced only by it SHALL be deleted from each database, and every static reference SHALL be removed in the same change: the manual ordering list, the industry proof block that featured it, its `public/case-studies/<slug>/` assets, and its glossary and alt-translation entries. The deleting script SHALL accept exactly one allow-listed slug, SHALL list the media it will delete by reference (not filename prefix), SHALL abort when any of them has another referrer, SHALL default to reporting, and SHALL run on the development database before production.

#### Scenario: Nothing links to the withdrawn study
- **WHEN** `/case-studies`, `/en/case-studies`, the sitemap and the industry pages render after the change
- **THEN** none of them link to `/case-studies/adamed` or `/en/case-studies/adamed`, and the listing shows one fewer card in each locale

#### Scenario: Its detail routes render the not-found page
- **WHEN** `/case-studies/adamed` or `/en/case-studies/adamed` is requested directly
- **THEN** the not-found page renders instead of the study. The HTTP status is out of scope here: the route's `loading.tsx` commits a 200 before the study lookup resolves, so every unknown case-study slug already answers 200 with a not-found body — a pre-existing defect of the route, not of the withdrawal, tracked by `fix-case-study-404-status`

#### Scenario: Shared media blocks the delete
- **WHEN** a media document referenced by the withdrawn study is also referenced by another study
- **THEN** the script aborts before deleting anything and names the other referrer

#### Scenario: Report first
- **WHEN** the script runs without `--apply`
- **THEN** it prints the study and media manifest and writes nothing

### Requirement: Card logo boost is per brand and lives in the pipeline
A card-pass logo whose optical-mass correction underweights the mark SHALL be corrected by a per-slug boost in `scripts/client-logos/pipeline.py --case-studies`, never by a CSS override on the listing card, and regenerating with a boost SHALL leave every other brand's emitted PNG byte-identical.

#### Scenario: pracuj.pl reaches parity
- **WHEN** the card logos regenerate with the pracuj-pl boost
- **THEN** the pracuj-pl mark's ink height is within the band of its neighbours (engie, irobot) on the contact sheet, and no other `*-logo-mono.png` changes
