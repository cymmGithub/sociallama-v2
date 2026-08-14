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

**The source question is closed.** This design was written around
reconstructing the lower half of the frame, because the only copies of Łukasz
available were downsampled crops that stop at the chest:

| Source | Canvas | Scale to spec | Real content ends | Must be generated |
| --- | --- | --- | --- | --- |
| Reference (`przemyslaw-swiercz.png`) | 422x600 | — | y=599 | 0% |
| `public/authors/lukasz-plocinski.png` | 384x384 | x0.80 down | y=325 | 45.9% |
| seofly.pl `Lukasz-seo-specialist.webp` | 300x300 | x1.30 up | y=327 | 45.6% |
| **Client original `PG1W4678.JPG`** | **6000x4000** | **x0.30 down** | **runs off the frame** | **0%** |

The seofly row originally read "y=396 / 34%", which is what drove the choice of
source. That was wrong: the seofly file is a **circular WordPress avatar** — a
circle at r=149 centred (149.5, 149.5) reproduces its transparency at 99.75%,
its transparent area is 22.2% against the 21.5% an inscribed circle predicts,
and its row widths peak at y=243 then shrink monotonically to a 26px stub. That
taper is the mask, not his shoulders, so "where subject alpha ends" was
measuring the bottom of a disc. **Where a source is pre-masked, the usable
extent is the last row whose silhouette is the subject's own, not the last row
carrying alpha.** Read correctly, the two small sources were level and neither
was good.

On 2026-08-14 the client supplied the 6000x4000 studio original — arms crossed,
torso running off the bottom of the frame, 24MP. Nothing needs generating, and
the rest of this document's reconstruction machinery is retained only as a
record of what was tried.

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

**Cut from the client original; no generative step.** Three
`nano_banana_pro` passes were run before the original arrived (8 credits) and
all three are discarded. What they taught, kept here so it is not re-learned:
the model *re-renders* rather than inpaints, so every pass redrew his face at
its own scale (best-fit 3.00, 2.66, 2.44 against the same source) and face
correlation fell as garment fidelity rose — 0.98 with a wrong cable-knit vest,
0.86 with the right one. Compositing the photograph back over a generated torso
failed too, anchored on the face and again on the chest: the generated anatomy
differs enough that no scale-and-shift aligns the collar and the V-neck at once,
so the seam ghosted. `outpaint_image` was reconsidered — its ban is conditioned
on *plum-flattened* cutouts and ours was on studio grey — but it takes no prompt
and centres its source, so it can be steered neither to the garment nor to the
roster geometry.

**Anchor framing on head width, solved downward — with three corrections the
implementation forced.** Matching shoulder span zooms tight crops so the head
renders oversized, so solve on head width instead. The corrections:

1. **Solve from the 0.369 anchor, not the 0.42 ceiling.** Starting at 0.42 and
   stopping at the first fit accepts the ceiling whenever the body happens to
   fit — which shipped a 0.4218 head, the widest male head in a roster whose
   median is 0.3720. 0.42 is the never-exceed bound; the anchor is the target.
2. **Fit the union span, not the widest row.** Rows peak at different x, so the
   union is wider than any single row. Testing the per-row maximum let a 408px
   "widest row" produce a 411px span that lost its margin after centring.
3. **Apply the head-drift cap inside the solve, not after it.** The measured
   roster does not hold to the ±30 guideline this document quoted: mean absolute
   drift is 18.3px and the maximum is 77.7px (Wojtek), with Anna at 38.0. Łukasz
   stands turned with his arms crossed, so centring his span throws his head
   +43.7px off centre; capping that at 30 shifted him until the body left the
   frame edge, and paying for it in head width left him floating 14px above the
   bottom. The cap is now 45 — inside every roster precedent — and it is applied
   *while* solving, so the accepted head width is the largest that survives the
   edges, the drift cap and the bottom-edge bleed together.

Also worth recording: the shipped roster does **not** keep a uniform side
margin. Seven of the fifteen touch a frame edge at 0px. That is legal — the rule
is no side contact *above elbow height* — so a solver that demands clearance
everywhere is stricter than the spec.

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

- ~~Synthesised clothing, softened face, implausible garment~~ — **all three
  retired** when the client original arrived. The shipped cutout is photographic
  end to end, so there is no likeness to verify and no generated garment to
  judge. The lesson worth keeping: ask the client for the original before
  designing a reconstruction around its absence.
- **bria-rmbg infers at 1024px internally** → matting a 6000px frame upsamples a
  coarse mask over his hair. Locate the subject on a small pass, crop the
  full-res file to him, then matte that, so the model's detail lands on the
  subject rather than on empty backdrop.
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

- ~~Confirm the proposed SEOFLY `link` on the member entry~~ — **confirmed
  2026-08-14**; the link ships. `https://seofly.pl/zespol/lukasz-plocinski/`
  verified live.
- Bio approval. Drafted and inserted from published material only (his CMS
  author bio and his own seofly.pl profile); still needs the user's sign-off.
  Roster bios are third person and run ~4 sentences with
  something personal alongside the craft; his author bio supplies only the
  professional half.
- ~~Does Łukasz sign off on a partly reconstructed portrait of himself?~~ —
  **moot.** Nothing about the portrait is generated; it is a crop of a studio
  photograph the client supplied.
