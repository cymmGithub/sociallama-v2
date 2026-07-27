## Why

The homepage belt shows 12 clients, 8 of them carrying lorem-ipsum quotes that are live on the site, and its CTA never navigates — it pops a "waiting for case study :)" tooltip even for brands that now have a published case study. Meanwhile the client roster approved for the homepage lives in gDrive (`TOP MARKI na strone główną`) and barely overlaps with what the belt shows: only 4 of the 12 current brands appear there, and 22 of the approved brands already have a published case study the belt never links to.

Rebuilding the roster from the approved source turns the belt from a placeholder into real proof, and deletes every lorem-ipsum quote from production as a side effect.

## What Changes

- **BREAKING** — the marquee roster is replaced, not extended. The 8 brands absent from gDrive (Aflofarm, Aquael, Funtronic, Intrum Justitia, Kontigo, Press-Service, Uniphar, Worldline) are removed from `clients`. Their verified quotes are unaffected: all 4 already live independently in the homepage testimonial slider.
- The belt carries **31 entries**: 22 with a published case study, 9 bare logos. Dom Volvo and Volvo Car Warszawa merge into one `VOLVO` entry.
- **BREAKING** — a card is no longer required per brand. Three states replace the current "testimonial or nothing" gate:
  - has testimonial → quote card (only `irobot` qualifies)
  - no testimonial but has a case study → **numbers card**: one concise sentence built around the brand's most impressive metric
  - neither → bare logo, no card
- **BREAKING** — the "Case study" CTA becomes a real link, shown only when a case study exists. The `clientCardCta.tip` tooltip ("waiting for case study :)") and its timer state are deleted.
- All lorem-ipsum placeholder quotes are removed from `lib/content/home.ts` and `home.en.ts`.
- New **logo asset pipeline** producing all 31 belt logos to a single contract: transparent, de-matted, cropped to the primary mark, normalized by optical ink mass (not bounding box), and darkened to a contrast floor where the ink is too light to survive the belt treatment.
- Belt resting opacity rises `0.55 → 0.75` so normalized logos read on the sand band.
- Fix live data bug: `case_studies.client_name` for slug `volvo` is `"Volvo Car Warszawa & Dom VolvoS"` (trailing `S`).

## Capabilities

### New Capabilities
- `client-logo-assets`: the contract every belt logo must satisfy (transparency, optical-mass normalization, contrast floor, crop-to-primary-mark, output geometry) and the repeatable pipeline that produces them from a per-brand chosen source.

### Modified Capabilities
- `client-logos-marquee`: roster is sourced from the approved gDrive set rather than hand-curated; the "all brands carry testimonial content" requirement is replaced by a three-state card model that permits bare logos and forbids placeholder quotes; the placeholder-tooltip CTA is replaced by a real case-study link gated on `caseStudySlug`; resting logo opacity changes.

## Impact

**Content** — `lib/content/home.ts` and `lib/content/home.en.ts`: `clients` fully rewritten in both locales (parity enforced by `LocalizedHome`), `clientCardCta.tip` removed. The `testimonials` array is untouched.

**Components** — `app/(frontend)/(home)/sections/client-logos/index.tsx` (card gating, CTA branch, tooltip state removal) and `client-logos.module.css` (resting opacity). `components/ui/brand-belt` consumes the same `clients` array, so the **contact pages' belt roster changes too** — intended, but must be verified.

**Assets** — `public/assets/clients/` gains ~31 normalized logos. Six existing files must **not** be deleted despite their marquee entries going away, because the testimonial slider still references them: `irobot.svg`, `stag.svg`, `uniphar.png`, `funtronic.png`, `aquael.png`, `intrum.png`.

**Data** — one `client_name` correction on the `volvo` case study (dev + prod).

**Sources** — logo inputs come from two places: `public/case-studies/<slug>/<slug>-logo.png` where the repo asset is already clean, and the gDrive folder otherwise. gDrive's `film skrzat.webp` is a movie poster, not a logo, and must not be used.

**Out of scope** — importing the Medicover deck (it exists in gDrive and would unblock that case study, making Medicover a 23rd linked brand) and auditing the suspect case studies against their gDrive decks. Both are separate changes.
