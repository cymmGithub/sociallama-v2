## Why

Łukasz Płociński writes the blog's SEO posts and already exists in the CMS as
`authors` #1 with a portrait, a role and a bio — but he appears nowhere on the
two surfaces that present the people behind Social Lama. The client wants him
shown as part of the group, so the roster grows from 15 to 16.

The obstacle is the photograph. Every copy of him is a downsampled crop of one
studio frame (384x384 in `public/authors/`, 300x300 on seofly.pl, 240x240 in
Downloads) and no original is obtainable. The roster frame is 422x600 with the
head anchored to ~0.369 of the frame width and the body bleeding off the bottom
edge, so a third of that frame contains no photograph at all — this is a
reconstruction, not an upscale, and it needs to be measured before it is
generated.

## What Changes

- **Add Łukasz Płociński as the 16th roster member**, inserted immediately
  before Przemysław Świercz in the single client-curated order. `oNasTeamGrid`
  is derived from `oNasTeam.members`, so the homepage grid, the `/o-nas`
  slider and the `?lama=lukasz-plocinski#zespol` deep link all follow from that
  one insertion — no component or routing change.
- **Role keeps the partner-agency credit** (user decision, 2026-08-14):
  `Specjalista SEO, SEOFLY` / `SEO Specialist, SEOFLY`. He is the roster's only
  non-social-media role and the only member from a partner company, and the
  team surfaces say so rather than implying he is staff.
- **New PL and EN bios** in the roster's established length band. His author
  bio is roughly half a roster bio and purely professional, so it is extended,
  not copied — and the two locales carry the same substance, as the existing
  EN-parity requirement demands.
- **A `link` to his SEOFLY profile** — `{ label: 'seofly.pl', href:
  'https://seofly.pl/zespol/lukasz-plocinski/' }` — reusing the optional field
  Przemysław already uses for `imcurious.how`. This makes the partner
  relationship a disclosed fact in the slider rather than a subtlety of the
  role label. *Proposed, pending confirmation.*
- **Reconstruct the 422x600 cutout from the seofly.pl 300x300 source**, not
  from the larger `public/authors/` avatar. Measured against the roster's real
  framing anchor, the seofly crop leaves **34%** of the frame to be generated
  versus **46%** for the repo avatar, because it is the same frame cropped
  wider — mid-chest, both arms, full vest pattern — which also gives the model
  real garment structure to continue. It costs a ~1.3x upsample, which an
  upscale pass absorbs. Generation credits were approved on 2026-08-14.
- **Remove the homepage CTA tile** ("Dowiedz się więcej" / "Learn more", user
  decision 2026-08-14). The desktop grid is four columns and currently holds 15
  members plus the CTA as a deliberate 4x4 rectangle; a 16th member would make
  17 cells and orphan the CTA onto its own row. Sixteen member tiles close the
  rectangle exactly. **This removes the section's only route to
  `/o-nas#o-lamie`** — the member tiles all target `?lama=<slug>#zespol`, so
  the CTA was not a duplicate link.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `onas-team`: roster membership grows from 15 to 16 (Łukasz Płociński in,
  nobody out) and the curated order gains one position before Przemysław
  Świercz; the homepage grid's required cell set drops the CTA tile, so the
  grid is 16 member tiles rather than 15 members plus a CTA; the portrait
  requirement gains a provenance rule for reconstructed cutouts, since a third
  of this one is generated rather than photographed.

## Impact

- `lib/content/o-nas.ts` — one member entry inserted before Przemysław Świercz.
- `lib/content/o-nas.en.ts` — the same entry with EN role and bio; guarded by
  `lib/content/locale-parity.test.ts`, which asserts both files list identical
  photos in identical order.
- `public/o-nas/slider/lukasz-plocinski.png` — new 422x600 transparent cutout.
  Note the distinct existing file `public/authors/lukasz-plocinski.png` (the
  384x384 blog avatar); different directory, and it is not replaced.
- `app/(frontend)/(home)/sections/why-that-works/index.tsx` — CTA tile markup
  removed.
- `app/(frontend)/(home)/sections/why-that-works/why-that-works.module.css` —
  `.moreTile`, `.moreLink`, `.moreLabel`, `.moreArrow` and their hover /
  reduced-motion blocks removed as orphans.
- `lib/content/home.ts` / `lib/content/home.en.ts` — `moreCard` removed as an
  orphan of the tile deletion.
- Higgsfield credits: approximately three (one upscale, one 2:3 reconstruction
  edit), plus a retake if the likeness misses.
- New `public/` files 404 on a running dev server until it restarts; the
  restart is handed to the user, never performed by the agent.

**Sequencing prerequisite.** `refine-team-roster` (18/18) and
`add-team-rail-mobile` (10/10) are both fully implemented but never archived,
so `openspec/specs/onas-team/spec.md` still describes a 12-person roster
including two members removed weeks ago, and still mandates the CTA tile as a
required cell. This change's deltas are authored against the *effective* spec —
published text plus those two pending deltas — and both must be archived before
this one, or the `MODIFIED` blocks will not match the text they replace.
