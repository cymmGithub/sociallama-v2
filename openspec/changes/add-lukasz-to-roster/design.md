## Context

The roster is a single TypeScript array. `oNasTeam.members` in
`lib/content/o-nas.ts` drives the `/o-nas` slider directly and the homepage
grid through `toTeamGrid()`, with `lib/content/o-nas.en.ts` mirroring it for EN
and `locale-parity.test.ts` asserting the two stay in step. Adding a member is
therefore a content edit; the work in this change is almost entirely the
portrait.

Every roster portrait is a 422x600 transparent PNG framed to one recipe: head
width anchored to a fixed fraction of the frame, head-top at 0.06H, torso
bleeding off the bottom edge, and no limb exiting a side edge above elbow
height. The shipped roster sits at head width **0.369** of frame (measured off
`przemyslaw-swiercz.png`), not the 0.42 ceiling the solver starts from.

Łukasz has no usable source for that frame. Three copies exist, all
downsampled crops of the same studio shot, and no original is obtainable:

| Source | Canvas | Scale to spec | Real content ends | Must be generated |
| --- | --- | --- | --- | --- |
| Reference (`przemyslaw-swiercz.png`) | 422x600 | — | y=599 | 0% |
| `public/authors/lukasz-plocinski.png` | 384x384 | x0.80 down | y=324 | **46%** |
| seofly.pl `Lukasz-seo-specialist.webp` | 300x300 | x1.30 up | y=396 | **34%** |

Measured by matting each with `bria-rmbg`, taking head width as the 90th
percentile row width over the top 15% of the alpha subject, scaling to the
0.369 anchor, and reading where subject alpha ends inside the frame.

## Goals / Non-Goals

**Goals:**

- Łukasz present on both team surfaces, in the client-curated order, before
  Przemysław Świercz, in both locales.
- A cutout that reads as one set with the other fifteen — same framing, same
  weight band, obeying the framing-integrity rules.
- The partner-agency relationship legible on the team surfaces, not obscured
  by the act of listing him among staff.
- The homepage desktop grid stays a closed rectangle.

**Non-Goals:**

- Changing his `authors` CMS record. His blog role, bio, `profileUrl` and
  avatar stay exactly as they are; the blog byline is unaffected.
- Replacing `public/authors/lukasz-plocinski.png`. The new cutout is a distinct
  file in a distinct directory.
- Re-cutting any other roster portrait. Karolina's and Magda's known borderline
  edge contact remains out of scope, as it was in `refine-team-slider`.
- Re-homing the `/o-nas#o-lamie` link that the CTA tile removal drops.

## Decisions

**Reconstruct from the smaller seofly source, not the larger repo avatar.**
The repo file has more pixels — enough that the recipe *downscales* it — but it
ends at the collarbone. The seofly crop is the same frame taken wider: mid-chest
with both arms and the full vest pattern in view. That cuts the generated region
from 46% to 34% and, more importantly, gives the model real garment structure to
continue rather than extrapolating a torso from a collar. The cost is a 1.3x
upsample, absorbed by an upscale pass before reconstruction. Rejected: the repo
avatar (more generation, less structural constraint); compositing the repo face
onto a seofly-derived torso (a seam through the neck for a resolution gain that
the upscale already provides).

**Reconstruct with a 2:3 image edit, never `outpaint_image`.** Outpaint on a
plum-flattened male cutout has NSFW-false-flagged deterministically on this
roster before — twice on Aleksander — and outpaint has also returned
anisotropically squeezed output (Przemysław, ~91% width compression, user
visible). A single `nano_banana_pro` edit at aspect ratio 2:3 framed as
reconstruction has produced good likeness from a 240x240 source on this roster,
handling de-grade and torso extension in one call. Where an outpaint is
unavoidable, pass explicit `width`/`height` at source resolution.

**Anchor framing on head width, solved downward.** Matching shoulder span
zooms tight crops so the head renders oversized. Start at 0.42 and solve down
until every row above the hip line clears the 422 width with ~6px margin, then
centre that span's x — the head may sit up to ±30px off-centre, as Anna's does.
After capping head drift, re-check the span still clears both edges; that cap
has silently re-introduced an edge cut before.

**Verify anisotropy by template correlation, not by ratios.** Crop the face
from the pre-reconstruction source and `cv2.matchTemplate` it across an (sx, sy)
scale grid on the result; both axes must land ≥0.99. Head-width and
subject-height ratios cannot detect a squeeze on a framed output, because the
framing solver normalises head width away.

**Remove the CTA tile rather than relocating it** (user decision). The
alternative considered and not taken: move "Dowiedz się więcej" into the
section's copy column as a plain link, which yields the same closed 4x4 while
preserving the `/o-nas#o-lamie` route. Recorded here so the trade-off is
visible if the missing route is later felt.

**Keep the SEOFLY credit in the role label** (user decision), and propose the
optional `link` to his SEOFLY profile alongside it. The member shape already
supports `link`, and Przemysław uses it for an external personal site, so this
is an established pattern rather than a new field.

## Risks / Trade-offs

- **A third of the portrait is synthesised clothing on a real person's body.**
  → The face must remain photographic and unaltered; verify likeness against
  the source before shipping, and show Łukasz his own portrait for sign-off
  before it goes live. An AI-extended likeness of an identifiable person is his
  to approve, and he is reachable — he writes for the blog.
- **1.3x upsample softens the face relative to the other fifteen.** → Upscale
  to 2K before reconstruction; compare on the plum contact sheet at slider
  scale, where softness shows first, not at grid-tile scale.
- **Generated vest pattern may not continue plausibly** (checked pattern, plaid
  shirt underneath). → Judge on the plum contact sheet alongside the roster,
  never on a checkerboard; retake if the garment reads as smeared.
- **Editing only one locale file** → `locale-parity.test.ts` fails the build;
  it asserts identical photo lists in identical order across PL and EN.
- **Both pending changes unarchived** → `MODIFIED` blocks in this change's
  delta will not match the published spec text. Archive `refine-team-roster`
  and `add-team-rail-mobile` first.
- **New `public/` file 404s on the running dev server** → hand the restart to
  the user; never kill or spawn worktree servers from the agent session.
- **Removing the CTA drops the section's only `/o-nas#o-lamie` route.** → The
  site nav still reaches `/o-nas`; the anchor specifically is lost. Accepted by
  user decision.

## Open Questions

- Confirm the proposed SEOFLY `link` on the member entry, or leave the credit
  carried by the role label and bio alone.
- Bio source: supplied by Łukasz, or drafted to the roster's length band and
  voice for approval. Roster bios are third person and run ~4 sentences with
  something personal alongside the craft; his author bio supplies only the
  professional half.
- Does Łukasz sign off on a partly reconstructed portrait of himself?
