# Design — expand-join-cta-platform-carousel

Decisions from the 2026-07-28/29 exploration. Several reverse an earlier call in
the same session; those are kept with their reasoning, because the rejected
version is the one a future reader is most likely to reinvent.

## D1 — Change what the llama holds, not the llama

The section's core defect is that the media column ignores the heading. Three
ways to fix it were built and compared:

| | Assets | Machinery | Mascot |
|---|---|---|---|
| Seven costumed llamas | 7 generated mattes | generation pipeline, head anchoring, contour repair, carousel, dots, counter | seven near-strangers |
| Static llama, static cube | 1 | none | recognisable |
| **Static llama, swapping cube** | 1 + 7 existing cubes | one layer swap | recognisable |

The first was built end to end and works, but it is disproportionate: it buys a
reacting media column at the cost of an asset pipeline, and it dissolves the
mascot into seven characters the visitor never learns. The second keeps the
defect. **The third was chosen.**

It also survives a test the others do not: the supplied mascot is already
tossing a cube, with a raised paw pointing at it. The composition asks for the
cube to be the variable. Nothing has to be invented — only separated.

## D2 — The mascot separates into layers for free

The supplied PNG (928×1152 RGBA) contains exactly two connected alpha
components: the llama at 693×979 and the cube at 140×145. So splitting them is
a component extraction, not a retouch, and the seam is guaranteed clean because
there is no seam.

The llama's bounding box then becomes the layout **stage**, and the cube slot is
expressed as a percentage of it — `left 0.6%`, `top 2.4%`, `width 20.2%`. Tying
the slot to the llama rather than to the card means the cube stays at the paw at
every card width, with no breakpoint-specific offsets.

Framing: the stage is `height: 112%` of the square well at `top: 2%`, showing
the composition from just above the cube down to the lower chest. The crop is
driven by the **cube**, not the head — the cube is the top of the composition,
and an earlier framing that anchored on the llama pushed the cube out of the
frame entirely.

## D3 — The cubes already exist

`public/assets/cube-*.png` covers all seven platforms and already drives the
platform section on `/uslugi/content`. Reusing them means zero new artwork, and
it means the two places on the site that enumerate platforms speak the same
visual language.

They are, however, a different register from the small white die in the source
image: larger, brand-coloured, ringed with floating platform icons. That is an
open art-direction question, not a technical one — see the proposal.

The swap animation is a **pop** (scale and slight rotation, spring easing), not
a cross-fade. A cross-fade reads as a slide turning; this is an object being
caught and replaced, which is what the pose depicts.

## D4 — Seven platform tokens, not nine mixed ones

The shipped rotator mixes seven platforms with `W STRATEGII?` and `W WIDEO?`.
Once each token drives a platform cube, those two have no cube to show and no
platform-specific services to list — they are disciplines, and every discipline
applies to every platform. Keeping them would mean two stops where the media
column has nothing to say.

The seven that remain are not an invention: they are exactly the seven
`PlatformKey` values in `lib/content/uslugi.ts`, which already drive the
`/uslugi/content` platform section. One canonical list, two consumers.

## D5 — Services copy is derived, not written

The services lists are distilled from the client-approved platform descriptions
in `lib/content/uslugi.ts`. A section that contradicted `/uslugi/content` would
be a content bug no test would catch.

Where the repo does not support a claim, the claim is absent: LinkedIn Ads and
YouTube Ads are not offered, so those two lists carry three items instead of
four, and X carries no ads item. The asymmetry is deliberate and should not be
"fixed" by padding.

Placement remains open. Option B (second caption line) was chosen while the
carousel existed, on the argument that a carousel's caption is where per-slide
text belongs. With the carousel gone that argument is gone, and option C (chips
under the heading) both keeps the card a single coherent post and fills the left
column's dead space below the button. The mock ships both behind a toggle.

## D6 — Interaction scope

All six ship together. They are cheaper as a set than they look: heart,
double-tap and save share one state object and one toast, and share is the
smallest of them. The genuinely expensive ones are the `⋯` sheet — a modal
needing `Escape`, focus management and focus return — and the comment thread,
which is eight lines of dialogue per locale rather than any real code.

One rule governs all of them: **every gag terminates in `/kontakt`.** A filled
heart grows the payoff link, saving raises a toast with a contact button, the
thread ends by handing over to a real conversation. Without that rule the card
is a fidget toy competing with the section's own CTA.

`Send` is deliberately the one control with no joke — it really copies the link.
One honest button is what makes the other five read as intentional comedy rather
than a broken interface.

## D7 — The well is a CSS decision, permanently

The superseded clip was graded to flat `#722341` and gated by
`verify-clip-bg.ts`. That decision cannot be walked back: a baked background
fixes the artwork to one ground forever.

The mascot ships as a transparent cutout composited by CSS, so the well stays a
stylesheet choice. The chosen treatment is the brand plum with a radial falloff
toward the corners — a real photographic backdrop is never flat, and that
falloff is what makes a cutout read as a photograph rather than a sticker. A
studio-neutral well was tried and rejected: it puts a large light block on a
dark chapter and drains the brand out of the card. Per-platform tinted wells
were rejected as a parade of other companies' colours.

The hero's reason for avoiding a baked plum does not apply here — that argument
was about Safari's video colour pipeline, and this is a still.

## D8 — Reduced motion

Under `prefers-reduced-motion: reduce` the rotator already holds index 0, so the
heading and the cube both rest on Facebook and never advance. Heart fill, bloom,
burst, plane flight, sheet slide, cube pop and the typewriter thread all
collapse to their end state.

All seven services lists render in the DOM regardless of which token is active —
inactive ones visually hidden, never absent. Content that exists for 2600ms at a
time is invisible to assistive technology and to crawlers, and this section is
the only place on the homepage that says what we do per platform.

## D9 — Platform brand marks are allowed here

An earlier draft of this change carried a non-goal forbidding platform logos,
wordmarks and brand gradients in the artwork. **That was wrong and contradicted
the site's own practice**: the shipped hero look-05 wears medals bearing the
Facebook, TikTok, YouTube, LinkedIn, X and Instagram marks, the supplied mascot
tosses a die covered in them, and the `cube-*.png` set is built entirely from
them. The rule is withdrawn.

## Rejected, with what was learned

The seven-llama route was fully built before being set aside. Its findings are
worth keeping, because anything that generates a *set* of mascot images will hit
them again:

- **`soul_2` cannot be used.** It exposes no `enhance_prompt` toggle and
  silently rewrites the prompt into its own description of the reference image,
  so every result came back wearing the reference's clothes.
  `nano_banana_pro`, framed as an *image edit*, passes the prompt through.
- **Generated head scale is not stable.** Two renders from an identical prompt
  measured 207 px and 138 px across the eyes; across twelve, the
  ear-tip-to-shoulder span ranged 1132–1418 px.
- **Silhouette landmarks cannot normalise it.** Ear-tips-to-shoulder failed
  outright on tight crops; ear-tips-to-neck-minimum ranged 21.6%–54.5% of image
  height. Collars, turtlenecks and scarves move both, so such measurements track
  the costume, not the head. Muzzle template matching worked (0.97–0.98), since
  the muzzle is identical across edits of one reference and never covered.
- **The reference carries a matte artefact** — a comb of bristles off the right
  of the neck, inherited by every generation. A morphological opening removed
  the bristles and left a chewed boundary; an opening deletes what is thin and
  never restores a line. Re-deriving the contour (erode to core → per-row right
  edge → median then gaussian along y → clip → feather) fixed it.

The assets and scripts live in `assets-src/join-cta-looks/`.
