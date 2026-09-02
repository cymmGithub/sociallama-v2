# Group affiliation mark

Source material for the footer's Good One signature — the line that sits under
the right end of the giant "SOCIAL LAMA" wordmark. The pipeline that consumes it
lives at `scripts/group-logo/pipeline.py`; run it from the repo root:

```sh
pip install pillow          # dev-machine dependency, not package.json

python3 scripts/group-logo/pipeline.py
```

It writes `public/assets/group/good-one.png` and a review sheet to
`.work/review.png` (gitignored) showing both panels on the footer's `#161216` —
source above, emitted below. **Read that sheet before committing the emitted
PNG.** Runs offline; never invoked by CI, by `next build`, or at request time.
Both the raw and the emitted PNG are committed, so it re-runs from a fresh clone
with no external access.

This is not a belt logo and does not go through
`scripts/client-logos/pipeline.py` — see that script's header for why the belt's
fixed canvas and roster-median normalisation don't apply to a single mark.

## Provenance

| key | mark | raw | source |
| --- | --- | --- | --- |
| `good-one` | Good One | `good-one.png` (266×46) | Group email-signature artwork, `stopki/v2/fig/logo_goodone_2x.png`, sourced 2026-09-02. |

**No vector was available.** 266 px is the largest copy of this mark on hand,
which fixes the footer's render at 133 px — a true 2× and no more. If an SVG or
an official dark-background variant ever surfaces in the group's brand
materials, it replaces this raw and the ink lift stops being necessary; a
brand's own dark variant always beats re-inking someone else's mark on our side.

Two other group assets are **not** candidates:

- `stopki/v2/grupa-goodone.png` — the full group lockup, six agency marks plus
  the claim, baked on a white plate with no alpha. It contains Social Lama's own
  logo, which in Social Lama's footer would print our mark twice.
- `public/o-nas/good-one/hub.png` — the stacked lockup the /o-nas orbit uses. It
  carries the same light-ground ink problem and is drawn tall, which is the
  wrong aspect for a one-line signature.

## Review criteria

- **Wordmark reads.** The source is drawn for a light ground: near-black
  `#181818` ink that disappears on `#161216`. The emitted panel must show
  "GOOD ONE" at the weight of the footer's links.
- **Sygnet is untouched.** Red, orange and yellow must be identical between the
  two panels. A global luminance lift washes them to salmon and peach; if the
  emitted sygnet differs from the source at all, the saturation split has
  drifted and `NEUTRAL_MAX_SAT` is wrong.
- **Edges stay soft.** No hard-keyed letter rims — the lift recolours by hue and
  leaves alpha alone, so the antialiasing survives and the glyphs keep their
  original weight.
