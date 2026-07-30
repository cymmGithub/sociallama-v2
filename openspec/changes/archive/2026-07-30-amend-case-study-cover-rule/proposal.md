## Why

The imagery audit shipped two rules, and reality has already contradicted one of them while proving a second one was missing.

**The contradiction.** The `case-studies` spec says generic stock photography SHALL NOT appear on a case study. Two covers now carry licensed Pexels photographs — Getaway and Vobis — placed there deliberately after neither client's own material could supply a usable frame. Getaway's own-post frame was 468x262 and visibly soft once the 1150x646 hero upscaled it 2.5x; Vobis's cover was a Facebook screenshot whose joke died in the crop. The spec and the site now disagree, and the disagreement is silent: the next audit reads the rule, sees stock, and reverts work that was a considered decision.

**The omission.** Ten of the twelve covers the audit had passed were still wrong, and the reason was never written down anywhere. The cover renders in three landscape boxes — the listing card at 418x199, the hero at 1150x646, the OG image at 1200x630 — all through `objectFit: cover`. The sources were portrait or square, so the crop landed wherever it landed: through the "PRZYWRÓĆ ŻYCIE" headline on Bioagris, through the Facebook group bar on Kontigo (leaving a clipped "ontigoCLUB"), past the face entirely on Adamed and Personal Effect, and away from the "Krótka piłka" punchline on Vobis, which left a saw floating over a stadium for no apparent reason.

The audit's rule could not catch any of that, because its test was subject matter and every one of these images depicted the right client. A separate rule is needed, and it is the one that governs how the cover is *composed*.

## What Changes

- **The subject-matter rule is narrowed to the proof surface.** Gallery and approach-pillar media remain strictly the client's own material — that is where a case study claims work was done. The cover is not evidence; it is the entry point on the listing card, the page hero and the social preview.
- **Licensed stock becomes permissible on a cover**, and only there, under three conditions: the client's own material genuinely cannot supply a usable frame, the photograph carries no third-party brand marks, and its provenance is recorded so a later audit can tell a decision from an accident.
- **A new requirement governs cover composition** — a cover must be composed for the landscape boxes it actually renders in, rather than handed to `objectFit: cover` and cropped blindly.

Not in scope: changing any image. The covers this amendment describes are already live on both databases; this brings the written rule into line with them.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `case-studies`: the subject-matter requirement is narrowed to gallery and pillar media, with a conditional carve-out for covers; a new requirement is added for cover composition under the three render crops.

## Impact

**Documentation only.** No database write, no image change, no code change. The requirement text moves to match what is already deployed.

**Two covers are the reason this exists**, and they stay: `getaway-cover-3.jpg` (Pexels 2007395) and `vobis-cover-3.jpg` (Pexels 6636320). Eleven others were recrops of the client's own material and were already compliant with the subject-matter rule — they violated only the composition rule this change writes down.

**Two covers remain non-compliant and stay that way knowingly.** `n-energia` and `volvo` are generic and cannot be recropped into anything better; neither client's deck holds a single landscape photograph. They are recorded as open rather than fixed, because inventing a fix would mean stock on a cover without the conditions above being met — no client material was checked as unavailable, it simply was not sourced.
