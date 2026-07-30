## Context

The imagery audit wrote one rule — an image must depict that study's own client — and it was the right rule for the wrong scope. Applied to 351 images it found 10 genuine defects on the proof surface. Applied to covers it passed all 48, and 12 of those covers were visibly broken anyway.

Two facts drove this amendment, both discovered after the audit shipped:

1. **The cover is rendered three times, and the audit checked none of them.** Measured on the live page: listing card 418x199, hero 1150x646, OG 1200x630 — all `objectFit: cover`. The sources were portrait or square. Nobody had written down that a cover has to survive a crop.
2. **Two studies had no compliant cover available.** Getaway's own-post frame was 468x262 against a 1150px hero. Vobis's was a Facebook screenshot. The rule said "shorter section is preferred to a substitute", but a cover cannot be shortened — an empty cover is an empty card on the listing.

## Goals / Non-Goals

**Goals:**

- The written rule matches the two stock covers that are already live, and says why they are permitted.
- The composition constraint that caused 10 of the 12 defects is written down, so the next import is judged against it.
- A later audit can tell a considered exception from an oversight.

**Non-Goals:**

- Changing any image. Every cover this describes is already deployed.
- Permitting stock anywhere except a cover.
- Fixing `n-energia` and `volvo`, which remain non-compliant on purpose.

## Decisions

### D1 — Split the surface, not the standard

The tempting fix was to weaken the rule: allow stock "where necessary". That would have made the requirement unenforceable, because necessity is always arguable.

Instead the *surface* is split. Gallery and pillar media are where a case study claims work was delivered, so the standard there is unchanged and absolute. The cover is the entry point on a listing card and a social preview — it makes no claim about delivered work, so a licensed photograph there misleads no one.

*Why this holds up:* the original rule's own justification was "a case study is a proof surface; an illustrative photograph presented among real creatives claims work that was not shown". That reasoning applies precisely to creatives shown as proof, and not at all to a thumbnail. The amendment follows the rule's own logic rather than overriding it.

### D2 — Three conditions, because a carve-out without conditions is a loophole

Stock on a cover requires client material to be genuinely unavailable, no third-party marks, and recorded provenance.

The middle condition is the one that came from experience rather than principle. Of roughly a hundred candidate photographs reviewed for the two covers, most usable ones carried someone else's logo — an HP laptop lid, a Miele oven, Samsung remotes, a Netflix screen, a Coca-Cola can. On a multi-brand retailer's case study a competitor's mark is a worse failure than a generic image, and it is the failure a hurried search produces by default.

The third condition exists because this amendment is itself evidence of the problem: the audit could not tell whether an unattributable cover was a decision or an accident, so it marked ten of them "keep-with-note" and moved on.

### D3 — Compose at 1.9:1, between the boxes rather than for one of them

The three crops span 1.78 to 2.10. Composing for either extreme means the other crop trims something: a 2.10 image loses its sides in the hero, a 1.78 image loses its top and bottom on the card.

1.9:1 sits between them, so both crops trim a few percent from a dimension the image has to spare. Combined with the requirement that the subject sit inside the area common to all three, this is what makes a single stored image safe in three boxes.

*Why not per-box art direction:* Payload generates sizes from one upload, and the render sites read `sizes.card` or the original. Supporting three hand-composed crops per study would mean three uploads and a schema change, for 48 studies, to solve a problem that one considered crop solves.

### D4 — Screenshots are disqualified as covers, by class

Kontigo's cover was a Facebook group cover with the group-name bar baked in; the card crop cut through it and rendered "ontigoCLUB". Vobis's was a post screenshot whose caption carried the joke; cropping the caption left a saw over a stadium.

Rather than case-by-case judgement, the requirement disqualifies the class: a cover may not carry platform interface around its content. The crop cuts through such furniture rather than around it, and a half-rendered UI element reads as a broken page. Screenshots remain entirely fine on the proof surface, where they are shown whole.

## Risks / Trade-offs

- **[The carve-out gets used as the easy path]** — "no client material" is cheap to assert and hard to disprove. → The condition is *checked and recorded*, not claimed: the audit tooling already reports each client's usable pool size, so an unavailability claim is falsifiable against a number.
- **[Stock covers drift into looking like the site's voice]** — enough licensed photography and the portfolio stops looking like its own work. → Two of 48 today. The requirement keeps stock off every other surface, and the recorded provenance makes the count visible rather than something to rediscover.
- **[1.9:1 is a compromise, so no box gets an ideal crop]** — nothing renders at exactly 1.9. → Accepted deliberately: the alternative is one box always losing something load-bearing. The scenarios require checking all three, which catches the cases where the compromise is not good enough.
- **[The composition rule is easy to satisfy on paper and skip in practice]** — nobody measures the three boxes by hand. → The dimensions are written into the requirement, so the check is arithmetic rather than judgement.

## Open Questions

- `n-energia` and `volvo` still have no compliant cover. Neither can be recropped, and neither deck holds a landscape photograph. They need client material, or a stock cover chosen under D2's conditions — which so far nobody has actually attempted, so the first condition is not yet met.
- Whether `seo.ogImage` should be set per study rather than inheriting the cover. Every study currently inherits, which is why the OG crop is one of the three the cover must survive. Setting it explicitly would remove one constraint from cover composition, at the cost of 48 more images.
