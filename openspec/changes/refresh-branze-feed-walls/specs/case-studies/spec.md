## ADDED Requirements

### Requirement: EN pillar media mirrors PL pillar media
For every published case study, each approach pillar's `media` relationship in the EN locale SHALL reference the same media documents, in the same order, as the corresponding pillar in the PL locale. Pillar text and tags stay locale-authored. A study whose locales diverge on pillar media SHALL be repaired by a script that copies PL's media ids onto EN pillar-by-pillar, guarded by equal pillar counts and matching pillar tags, idempotent, dry-run by default, and revalidating the case-study cache after a write. The script SHALL abort a study, with the tag diff printed, rather than guess when pillar counts or tags do not line up.

#### Scenario: Diverged study is synced
- **WHEN** the sync script runs with `--apply` against a study whose EN pillar 2 references media the PL pillar 2 no longer does
- **THEN** EN pillar 2 references exactly PL pillar 2's media ids afterwards, EN heading, body and tag are unchanged, and a re-run reports the study already done

#### Scenario: Misaligned pillars are refused
- **WHEN** a study has five PL pillars and four EN pillars, or a PL pillar tag with no EN counterpart at the same index
- **THEN** the script writes nothing for that study and prints which pillars did not line up

#### Scenario: PL-empty pillar empties EN
- **WHEN** a PL pillar has no media and its EN counterpart still references the pre-review creatives
- **THEN** after `--apply` the EN pillar has no media and the pillar's copy remains
