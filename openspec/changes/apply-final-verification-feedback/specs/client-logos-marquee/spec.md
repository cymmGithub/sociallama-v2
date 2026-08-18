# client-logos-marquee — delta

## MODIFIED Requirements

### Requirement: Roster sourced from the approved client set
The belt roster SHALL be exactly the brands approved for the homepage in the `TOP MARKI na strone główną` source, and SHALL NOT include brands absent from it. Brands whose separate marks share a single case study SHALL be merged into one belt entry. A brand serviced only through a sub-brand or dealer entity SHALL display that entity's own annotated mark rather than the parent brand's global mark, so the belt does not overstate the engagement. Removing a brand from the roster SHALL NOT remove its testimonial from the homepage testimonial slider, which carries its own independent entries.

#### Scenario: Brand absent from the approved set
- **WHEN** the belt renders
- **THEN** no brand outside the approved client set appears in it

#### Scenario: Retired brand keeps its slider testimonial
- **WHEN** a brand with a verified quote is removed from the belt roster
- **THEN** its quote still appears in the homepage testimonial slider

#### Scenario: Two marks, one case study
- **WHEN** the approved set contains separate Dom Volvo and Volvo Car Warszawa marks that share the `volvo` case study
- **THEN** the belt shows a single entry rendering the annotated "Dom Volvo" mark, linking to that study

#### Scenario: Sub-brand engagement is not upgraded to the parent mark
- **WHEN** the agency serviced a dealer or sub-brand account rather than the parent brand
- **THEN** the belt entry's logo is the sub-brand's annotated mark, not the parent brand's plain global logo

## ADDED Requirements

### Requirement: Marks reflect the brand's current identity
A belt logo SHALL be the brand's current mark; when a client rebrands, the belt asset SHALL be regenerated from the new mark through the logo pipeline rather than continuing to show the retired identity.

#### Scenario: Rebranded client shows the new mark
- **WHEN** ENGIE's post-rebrand logo replaces the 2018 logotype in the pipeline sources
- **THEN** the belt and the case-study card render assets generated from the new mark
