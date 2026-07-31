# Blog cover art library — generation brief

Provenance record for `redesign-blog-covers`. Pairs with
`content/media/cover-assignments.json` (which post gets which piece).

## Style anchor (design D2, revised 2026-07-31)

**The painted mascot cast on sociallama.pl.** The site's WordPress media library is open at
`/wp-json/wp/v2/media?search=lama` and holds the full cast: `seo_lama`, `lama_szkolenie`,
`lama_kontakt`, `lama_maratonczyk`, `lama_klient`, `zostan_lama`, `lamy_stadko`,
`lama-z-kieliszkiem`, `lama_insta-history-na-whatsup`, `lama_manifest-v2`, `mamalama`.

> **Superseded direction.** The first pass anchored on the repo's *photoreal* llamas
> (`content-llama-3f48b5.png`, `o-nas/hero-llama.png`) because the original design D2 asserted
> sociallama.pl's "only llama is the logo". That assertion was false and unverified. Four
> photoreal pieces were generated and discarded — 14 credits. See design.md D2.

The style is **painterly digital illustration**: hand-painted fleece with visible brush
direction, expressive cartoon faces with large eyes and long lashes, purple-brown hooves,
props with personality. Warm saturated cast — yellow, orange, pink, purple.

Two mascot pieces are near-literal matches for covers this library needs, and should be
treated as the closest available exemplars rather than re-invented:

- `seo_lama.png` — llama peering through a magnifying glass → the `seo-a` motif
- `lama_szkolenie.png` — llama presenting at a chart board → the `mkt-*` register

**Resolution constraint:** the mascot files top out at 500×500 (the herd is 1600×670). They
are style *anchors* for generation, not source art to composite or upscale.

## Category coding — by which llama of the cast

`lamy_stadko-www.png` (1600×670) holds all four colours in one image, painted in one
session, so crops of it are guaranteed siblings. Each crop is flattened onto plum and
uploaded as its own reference.

| Category | Llama | Reference | Higgsfield media id |
|---|---|---|---|
| `marketing` | yellow, curly forelock, blue scarf | `cast-yellow.png` | `b4882fd9-884b-4813-b21d-568a0c93bcbd` |
| `seo` | orange, top hat, moustache | `cast-orange.png` | `df3f1151-60fd-4828-a0e0-a688a6e17008` |
| `social-media` | pink, sunglasses, floral shirt | `cast-pink.png` | `d0a51f7b-495b-4ac0-83f7-8e76322c5589` |
| `reklama` | lavender-purple, jacket, striped tee | `cast-purple.png` | `cc85489a-b418-4f19-a874-3d7f5c847e6a` |
| LAMÓWKA series | the herd together | `lamy_stadko-www.png` | `5f43703c-1d97-4554-bab2-1a4991042427` |

**Colour must arrive as reference pixels, never as a prompt word.** The photoreal pilot
proved `nano_banana_pro` ignores named hex values and colour adjectives — it copied the plum
ground straight out of the reference image while disregarding every hex in the prompt. One
reference per generation carries the category colour; the prompt carries only pose, prop
and composition.

## Ground

**Soft painted plum.** Not the flat `#913155` the hero uses, and not the source art's grass
and sky either: a hand-painted plum field with gentle tonal variation and canvas texture,
matching how the mascot art itself is painted.

Rationale: the blog hub renders inside `theme="cream"`, whose `--color-primary` is sand
`#e0ddd3` (`hub-view.tsx`). Plum-family grounds pop against it. Flat colour would make a
painted mascot read as a pasted sticker; literal scenery would mean eleven environments to
keep consistent and a noisy 22-tile grid.

Brand palette for props and accents (`lib/styles/colors.ts` — nothing outside it):

```
plum       #913155   ground
plum-dark  #722341   ground shading
orange     #f09b39   props
cream      #faf9f5   props
sand       #e0ddd3   props
ink        #2b1f24   shadow / prop detail
```

Category is carried by the *llama*, so prop colour is now free — it no longer has to encode
anything, which retires the "reklama needs a fourth accent" problem.

## Format and the safe box (design D4)

Master: **16:10, ≥2048px wide.**

> **`nano_banana_pro` cannot output 16:10.** Its ratios are 1:1, 3:2, 2:3, 4:3, 3:4, 4:5,
> 5:4, 9:16, 16:9, 21:9. Resolution: **generate 16:9, crop centrally to 16:10** — 16:9
> (1.778) is wider than 16:10 (1.600), so the crop takes 10% off the *width* and leaves
> height untouched, the safe direction for a standing subject.
>
> **Generate at 2k, not 4k.** Measured: 2k → 2752×1536, which crops to 2458×1536 — over the
> 2048 floor with room to spare. 4k → 5504×3072, twice the price for pixels that get thrown
> away (nothing on the site needs more than the 1200×630 `og` size).

Every live crop is centered, so they intersect in one box:

| Surface | Ratio | Crop of the master | Keeps |
|---|---|---|---|
| grid / popular card | 16/10 | none — full frame | 100% × 100% |
| post header | 4/3 | 2133 × 1600 | central **83.3%** of width |
| hub lead | 16/9 | 2560 × 1440 | central **90%** of height |
| OG (`media` size `og`) | 1200×630, `crop: 'center'` | 2560 × 1344 | central **84%** of height |

**Safe box = central 83% × 84%.** In the generated 16:9 frame that is central **75% of
width** × **84% of height** — prompt for the tighter number.

`227` (hub lead, `google-polaczylo-social-media-z-seo`) is the one piece whose 16/9 crop is
live: prod `blog-hub` curation is empty, so `featured` falls back to newest.

## Hard constraints on every piece

1. **No written language.** Screens blank, signage empty, newspapers and placards showing
   abstract rule-lines at most, no keyboards, no labelled charts, no numbers. English text is
   as wrong as Polish text. Note several source mascots *do* carry Polish text
   (`zostan_lama`'s banner, `lama_szkolenie`'s chart labels) — that must not come through.
2. **Ears fully visible and unobstructed** — the known failure mode of this pipeline.
3. **One llama** (except the LAMÓWKA herd), matching its reference's colour and markings.
4. **Painted ground**, no photographic backdrop, no drop-shadow onto the frame edge.
5. **Landscape composition** — these are covers, not the portrait mascots the anchors are.

## The pieces

Motifs carry the topic; the llama carries the category.

| Key | Llama | Motif |
|---|---|---|
| `seo-a` | orange | Peering through an oversized magnifying glass — the `seo_lama` pose, recomposed landscape |
| `seo-b` | orange | Placing the top block on a rising stack of unlabelled blocks |
| `mkt-a` | yellow | Raising a megaphone, concentric ripple arcs radiating into the ground |
| `mkt-b` | yellow | Leaning on an oversized target board, dart already in the bullseye, no numbers |
| `mkt-c` | yellow | Mid-stride with an armful of paper streamers trailing behind |
| `rek-a` | purple | Leaning into an empty neon rectangle sign, tube light on one cheek |
| `rek-b` | purple | Holding a blank placard at a jaunty angle |
| `sm-a` | pink | Phone at arm's length, screen a blank glow, free hoof waving |
| `sm-b` | pink | Looking up at drifting heart and speech-bubble shapes, all empty |
| `sm-c` | pink | Over-ear headphones, leaning into a ring-light halo |
| `lamowka` | the herd | Gathered around a rolled blank newspaper, empty ribbon banner across the lower third |

> **The LAMÓWKA wordmark is composited, not generated.** Design D3 permits "LAMÓWKA" in this
> piece, but image models garble tight display type and would very likely drop the acute on Ó.
> Generate the ribbon blank, then set the wordmark in post using the site's display face
> (Exo 2), inside the safe box.

## Generation settings — the working recipe

Validated 2026-07-31 on `seo-a` and `rek-a`. Follow it exactly for the remaining nine.

1. **Generate** — `nano_banana_pro`, `aspect_ratio: 16:9`, `resolution: 2k`, `count: 1`,
   framed as an image edit. Pass **two** references, in this order:
   1. the category's llama crop (carries colour + painted style)
   2. `plum-field.png`, media id `c0b40438-dfce-456f-846c-503fd969fc3d` (carries the ground)

   Prompt structure: "Redraw the llama from the FIRST reference image … BACKGROUND COLOUR IS
   CRITICAL: fill the entire frame with EXACTLY the plum colour of the SECOND reference
   image … do not darken it, do not make it wine-coloured or maroon". Then pose, then the
   no-text block. **Never write a hex value and expect it to be honoured.**

2. **Crop 16:9 → 16:10** — `-crop 2458x1536+147+0` on the 2752×1536 output, then resize to
   2560×1600.

3. **Fit the subject** — the model ignores every instruction about scale and margins, so do
   it in post:

   ```
   convert master.png -virtual-pixel edge -filter Lanczos \
     -distort SRT '1280,800 0.85 0 1280,800' final.png
   ```

   `-virtual-pixel edge` is the important part: it replicates the border outward, so effects
   that legitimately run to the frame edge (a spotlight beam, a glow) keep running. A flat
   `-extent` pad instead leaves a visible rectangle where the effect stops. Tune the scale
   factor per piece — 0.84–0.87 covered both test pieces.

4. **Verify** — measure, do not eyeball:

   ```
   convert final.png -fuzz 18% -transparent '#913155' -format '%@' info:
   ```

   Needs ≥8% top and bottom, ≥8.5% left and right. Note this measures *any* non-ground pixel,
   so a deliberate edge-reaching effect reads as 0% — check those by eye against the drawn
   safe box.

One session per batch; outliers regenerated individually, each retry batch carrying its own
explicit user OK.

### Post-processing: what NOT to do

Two attempts to nudge composition in post both had to be reverted. Recorded because both
looked reasonable and both shipped visible damage:

| attempt | result |
|---|---|
| scale down with `-virtual-pixel edge` | replicates boundary pixels outward. Invisible on soft content (a spotlight beam), but drags **hard-edged content into vertical streaks** — it wrecked `mkt-b`'s target rings and `sm-a`'s shirt. |
| scale down, pad with the ground colour | clean edge, but a **visible rectangular seam**. The grounds are hand-painted with deliberate tonal variation, so no single pad colour matches along the whole boundary. Unfixable in principle, not a tuning problem. |
| **ship the master full-bleed** | **correct.** No scaling at all. |

The safe box exists so the *focal subject* is not amputated — not so nothing touches the
frame. Of the four live surfaces only two crop vertically: the 16/10 card uses the full
frame and the 4/3 post header crops width only. Content reaching the frame edge is
therefore invisible on the two surfaces readers see most, and reads as ordinary editorial
cropping on the other two. Verified at the harshest crop (1200×630) on the four tightest
pieces: an ear tip or a decorative star grazes the edge, nothing breaks.

**Ground colour is still worth correcting in post** — a masked shift toward `#913155`,
feathered by distance from the sampled ground so it does not touch the subject, rescued
three pieces whose ground drifted (`t-231`, `t-233`, `rek-b`). That is a colour change, not
a geometry change, which is why it is safe where the scaling was not.

### Icon compositing

The 12 social motifs were generated as **one sheet** on a flat `#00B140` green key, cut by
grid cell and keyed out with a despill pass — zero measurable green spill on any of the 12.
The cut set is committed at `content/media/cover-art/icons/` so future covers reuse it
instead of regenerating.

Placement is computed, never hand-tuned (`lib/scripts/bake-icons.py` — committed, because
the first version lived in the gitignored staging directory and was lost with it): build a
mask of "is this pixel the flat ground", then accept only a slot whose whole footprint
**plus a margin** is ground.
An icon therefore cannot land on a llama, a prop or the ribbon. Slots are scored by
*proximity to the subject centroid* — scoring by distance from centre instead pins every
icon to a safe-box corner and reads as UI chrome bolted on. Where a busy composition leaves
no room, the icon shrinks (168 → 142 → 118px) rather than the ground tolerance loosening,
because loosening it is exactly what would let an icon land on a pale part of the llama.

### Two lessons that cost credits

- **Colour arrives as pixels, never as words.** Every hex value and colour adjective in a
  prompt was ignored across six generations. A reference image with the colour in it works
  first time. This is why the plum swatch exists and why category colour is a reference crop.
- **Composition scale cannot be prompted.** Explicit "leave 15% empty above the ear tips"
  instructions were ignored twice. It is free to fix in post and pointless to pay for.

### Revising a piece — the character and anatomy rules (added 2026-07-31)

`t-227` and `t-235` shipped defective and were redrawn. Both failures trace to the same
root: the SCENE block was the only thing that varied between the four bespoke `seo` pieces,
and it was carrying weight it could not hold.

- **A recurring character arrives as pixels too.** The face was specified only in words
  ("neat dark brown beard … long muzzle") against a *generic* llama crop plus a photoreal
  photo of the author. Two of four pieces drifted off-model — `t-227` came back with a
  short bulbous muzzle and a big lash-heavy eye instead of the slender muzzle and browed
  brown eye of its siblings. **Fix: pass an already-correct piece as the character
  reference** (`t-233` was used) and drop the human photo, whose interpretation varies per
  generation. Add "copy ONLY the character — not its props or composition", or the
  reference's magnifying glass follows the character into the new scene.
- **Limb count must be stated explicitly.** Nothing in the original prompts constrained
  stance. `t-235`'s "reaches up with one hoof" left the model free to keep a quadruped on
  all fours *and* grow an arm for the switch — six limbs. The pieces that came out right
  did so by luck of their phrasing ("holds up", "both front hooves pressed"). Every prompt
  now carries:

  > ANATOMY, STRICTLY: exactly four limbs and no more — two hind legs and two front legs.
  > It stands UPRIGHT ON ITS TWO HIND LEGS like a person; its two front legs are its arms.
  > Do NOT draw a fifth or sixth limb. Do NOT draw it standing on four legs while also
  > reaching up with an arm.

- **A reference carries its ground drift too.** `t-233`'s own ground is `#A54B6E`, well off
  brand plum, so both redraws inherited it. The masked shift in post (below) corrects it;
  measure the corners rather than trusting the plum swatch to win.

Ground correction as used on both redraws — colour only, never geometry. Sample the ground
from a border ring, then shift toward `#913155` with a smoothstep weight on distance from
that sampled colour, so the subject is untouched (measured: ground moved ~27 levels,
subject mean change 0.1):

```python
dist = np.sqrt(((a - src) ** 2).sum(axis=2))
t = np.clip((dist - 38.0) / (78.0 - 38.0), 0.0, 1.0)
w = (1.0 - (t * t * (3.0 - 2.0 * t)))[..., None]
out = np.clip(a + w * (TARGET - src), 0, 255)
```

- **A redraw is not finished until the icons are re-baked.** Every piece carries one or two
  social motifs composited *after* generation, so a freshly generated master is missing
  them and reads as the odd tile out in the hub grid. Both redraws shipped once without
  them before this was caught. Re-bake with the same icons the piece carried before:
  `python3 lib/scripts/bake-icons.py content/media/cover-art/t-227.jpg share star`.

**Publishing a revision:** `payload:relink:cover-art --prod --only t-227,t-235 --apply`,
then `POST /api/revalidate?tag=blog-hub&tag=posts&tag=post:<slug>` with
`x-revalidate-secret` — a script writing straight to the production database runs outside
any Next request scope, so the pages keep serving the old cache until the tags are
expired. The first request after expiry still serves stale (SWR); check twice.

Without `--only` the script re-uploads every in-use piece, which is right for the first
publish and wrong for a revision — it would mint sixteen new media rows and repoint every
post at art that did not change.

## Spend log

| Batch | Direction | Pieces | Credits | Outcome |
|---|---|---|---|---|
| 2026-07-31 pilot | photoreal (wrong anchor) | `mkt-a`, `seo-a`, `lamowka` @4k | 12 | discarded |
| 2026-07-31 retry | photoreal (wrong anchor) | `seo-a` @2k | 2 | discarded — but measured 2k = 2752×1536 |
| 2026-07-31 paint 1 | painted cast, no plum ref | `seo-a`, `rek-a` @2k | 4 | discarded — grounds `#6A213F` / `#3F1226`, far apart |
| 2026-07-31 paint 2 | painted cast + plum ref | `seo-a`, `rek-a` @2k | 4 | **KEEP** — grounds `#943157` / `#923157` |
| 2026-07-31 paint 3 | painted cast + plum ref | remaining 9 @2k | 18 | **KEEP** — 8 of 9 first time |
| 2026-07-31 retry | painted cast + plum ref | `rek-b` @2k | 2 | **KEEP** — v1 body dissolved, ears rabbit-shaped |
| 2026-07-31 author | + author photo ref | `seo-a`, `seo-b`, `mkt-d` @2k | 6 | **KEEP** — Łukasz Płociński's pieces |
| 2026-07-31 icons | icon sheet on green key | 12 motifs, one sheet | 2 | **KEEP** — cut set committed |
| 2026-07-31 topic test | topic-specific concepts | 5 posts @2k | 10 | 2 kept, 3 below the hybrid line |
| 2026-07-31 hybrid | topic-specific concepts | 6 more @2k | 12 | **KEEP** — hub ranks 1–8 |
| 2026-07-31 retry | topic-specific concepts | `t-237` @2k | 2 | **KEEP** — v1 built on a blank card |
| | | | **76 spent** | balance 101.01 → **25.01** |
| 2026-07-31 redraw | `t-233` as character ref + anatomy clause | `t-227`, `t-235` @2k | 4 | **KEEP** — both first time, no retry |
| | | | **80 spent** | balance 49.01 → **45.01** |

Of the first 76, **20 bought nothing**: 14 on the wrong style anchor and 6 on topic pieces
that fell below the hybrid line. Both were the cost of finding out, and both are recorded
above rather than quietly rounded off. The redraw batch wasted nothing: swapping the
character reference to an already-correct piece fixed both defects on the first attempt.

### Final shape — 20 pieces, 16 in use

The library is **not** purely category-coded any more. Hub ranks 1–8 carry bespoke art drawn
for each post's own subject; everything below carries a category variant. That was a
migration-time decision, not a durable rule — "top of the hub" is a snapshot, and those posts
slide down as new ones publish. **The ongoing rule is library by default, bespoke on request**
(see the `blog-cover-art` spec).

Four pieces (`seo-a`, `seo-b`, `rek-b`, `mkt-d`) are in the library with no posts assigned:
the author's bespoke pieces displaced them. They stay for future use and are deliberately
**not uploaded**, so the media library gains no rows nothing references.

Live media ids are recorded in `cover-assignments.json` (`library[*].mediaId`), and every
superseded id is recorded in `image-audit.json`. Rollback is repointing at the old ids, all
of which are intact.

**Library complete.** The 11 masters are committed at `content/media/cover-art/*.jpg`,
2560×1600 sRGB, quality 92 with no chroma subsampling (~4.9 MB total). The generated PNGs
were converted to JPEG for size; grounds survive the conversion within 1 unit.

Measured across all 11: **zero text**, ears clear on every piece, grounds spanning
`#903154`–`#982B55` against brand plum `#913155`.

### The LAMÓWKA wordmark

Composited, not generated (design D3). The ribbon's solid band was detected at y 72.2%–84.7%
by masking bright low-saturation pixels in the lower half, and the wordmark set into its
centre:

- Exo 2, `wght` 800, tracking −0.02em — the site's display treatment, matching
  `lib/scripts/gen-wordmark.py`
- Brand plum `#913155` on the cream ribbon
- 188px cap, 949px wide, centred at x=1280 — well inside the 4/3 crop's central 83%

The font is fetched transiently (`ofl/exo2/Exo2[wght].ttf` from google/fonts) exactly as
`gen-wordmark.py` documents; nothing about it is committed.

### Motif changes made during generation

Three motifs from the original brief were replaced, all for one reason: **an empty container
reads as a missing asset.** A blank sign, an empty speech bubble or a blank phone screen looks
like the text failed to load rather than like a deliberate choice. Apply this test to any
future motif built around an empty container.

| Piece | Brief said | Shipped |
|---|---|---|
| `rek-a` | empty neon sign frame | theatrical spotlight |
| `rek-b` | blank placard | flock of paper aeroplanes |
| `sm-b` | empty speech bubbles | solid hearts and sparkles |
| `sm-a` | phone with blank screen | phone turned back-to-camera |

`lamowka`'s blank ribbon is the deliberate exception — it is blank in generation precisely so
the wordmark can be set into it afterwards.

`rek-a`'s motif changed from the original brief: the empty neon sign frame read as a missing
asset — a large blank rectangle where text would normally sit looks like a bug rather than a
choice. Replaced with a **theatrical spotlight**, which is legibly complete while carrying no
text. Apply the same test to any motif built around an empty container.

What the discarded pilot still proved, and which carries over:

- Framing the job as an **image edit** against a fixed reference holds the hard constraints —
  zero text on all four despite a text-rendering model, ears clear on all four, and every
  piece survived all three live crops.
- **Named colours are ignored; reference pixels are copied.** This is why category colour now
  arrives as its own reference image.
- 2k is sufficient; 4k is waste.
