## ADDED Requirements

### Requirement: The listing subhead breaks before its dash clause
The `/case-studies` subhead SHALL render as two lines in both locales, the second line beginning at the dash clause ("— wybrane projekty…" / "— selected…"), and the brand name "Social Lama" SHALL be bound with a non-breaking space so it never splits across a line end at any viewport width.

#### Scenario: Two lines at desktop
- **WHEN** `/case-studies` renders at 1440 px
- **THEN** the subhead's second line starts with the em dash, and "Social Lama" sits whole on one line

#### Scenario: Brand name survives a narrow wrap
- **WHEN** `/case-studies` renders at 360 px
- **THEN** "Social" and "Lama" are on the same line

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

#### Scenario: Listing and routes forget the study
- **WHEN** `/case-studies`, `/en/case-studies`, the sitemap and the industry pages render after the change
- **THEN** none of them link to `/case-studies/adamed` or `/en/case-studies/adamed`, and both detail routes return 404

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
