# Design — polish-forms-and-blog-nav

## Context

Three independent quick fixes, bundled because each is too small to carry its own change:

1. Blog posts render through the shared `PostArticle` (`app/(frontend)/[slug]/post-article.tsx`), used by the PL root-level route (`BASE_PATH = ''`, hub `/blog`) and the EN route (`app/(frontend-en)/en/blog/[slug]/page.tsx`, `BASE_PATH = '/en/blog'`, hub `/en/blog`). The header stage already carries breadcrumbs (hub → category) but no dedicated back affordance.
2. The contact form (`app/(frontend)/kontakt/contact-form.tsx`, reused by `/en/contact`) submits through `sendContactEmail` (`lib/integrations/email/action.ts`) with a per-locale Zod schema. It shows a passive RODO paragraph (`form.privacyNote`, rendered at `contact-form.tsx:177-183`) but has no consent checkbox. The careers form already solved this: a local `ConsentField` (`careers-form.tsx:83-135`) wired into the form kit via `setFieldValidity` (a checkbox's FormData `value` is `"on"` regardless of checked state, so the kit's readiness gate can't see it natively), enforced server-side with `consent: z.literal('on')` (`careers-schema.ts:73`).
3. Contact-form field labels carry CSS-counter step numbers (`.formShell .field label::before` → `01 — Imię`) colored `var(--muted)` = `#8f838b` (`kontakt.module.css:19,160-171`) — low contrast on the plum stage. The careers form colors its labels `color-mix(in srgb, var(--color-cream) 72%, transparent)` (`zostan-lama.module.css:439-447`).

## Goals / Non-Goals

**Goals:**
- Locale-aware "← Blog" back link at the top-left of every post header, breadcrumbs untouched.
- Contact form cannot submit — client- or server-side — without an explicit consent tick, in both locales.
- Contact-form step numbers/labels legible (cream) on the plum stage.

**Non-Goals:**
- No careers-form behavior change (it already enforces consent). Only a mechanical import swap if `ConsentField` is extracted.
- No breadcrumb redesign, no marketing-consent (optional second checkbox) on the contact form — careers has one because job applicants opt into a talent pool; contact has no equivalent need.
- No consent persistence/audit trail beyond what the email pipeline already records.

## Decisions

**D1 — Back link renders inside `PostArticle`, driven by props already available.**
Both routes pass locale-specific `content` and a base path; the back link needs `href` (PL `/blog`, EN `/en/blog`) and a label (`Blog`) with aria copy in `lib/content/blog.ts` / `blog.en.ts`. One component change covers both locales — no route-level duplication.
*Alternative rejected:* per-route back-link markup — duplicates the template, violating the "single bespoke post template" requirement's spirit.

*Revised at implementation (user call, 2026-08-14):* it sits **above** the header card on the page's sand ground, not inside the plum stage. That reads as a page-level way out of the article rather than a second trail stacked on the first, and it leaves the card's own top-left to the breadcrumbs. Mechanically it needs a row wrapper at `width: min(100%, 85rem)` — the card's own width — because `.article` centres its children and pads by `--safe`: above 85rem the card caps and centres, so aligning to the article's padding edge would strand the link to the card's left.

**D2 — The arrow is `lucide-react` `ArrowLeft`, never a text glyph.**
House rule: no raw glyph icons (`←`). Breadcrumbs already use lucide `ChevronRight`; the back link mirrors that. On the sand ground it inherits the cream theme's ink instead of the stage's cream, and hovers to the theme's plum accent.

*Revised at implementation (user call, 2026-08-14):* the visible "Blog" label is gone — the arrow stands alone. Two consequences that are not optional. `backAria` stops being a nicety and becomes the link's only accessible name, so it must stay in both locale files. And a 12px glyph is not a control: the link is a 22px arrow centred in a 44×44 box, pulled back by `margin-inline-start: -11px` so the *arrow* keeps the flush edge with the card while the invisible target extends into the gutter. The row's own bottom margin drops to 3px to absorb the box's own 11px of slack under the glyph.

**D3 — Extract `ConsentField` into the form kit; both forms import it.**
The careers `ConsentField` already encodes the non-obvious part (checkbox validity via `setFieldValidity`, error wiring). Copying it into `kontakt/` would fork that logic. Move it to `components/ui/form/consent-field.tsx` accepting className hooks (group/box/label/error) so each page's CSS module keeps owning the look; careers switches to the import with zero behavior change, kontakt adds a required instance.
*Alternative rejected:* local duplication — two ~50-line copies of subtle form-kit glue is exactly the divergence the past simplify passes removed.

**D4 — Consent is required via `consent: z.literal('on')` in `buildContactSchema`, mirroring careers.**
Client side, the form kit's readiness gate blocks submit until the box is ticked (via `setFieldValidity`); server side the schema rejects a missing/unchecked value with a per-locale message, so the guarantee holds even without JS. The static `privacyNote` paragraph is removed and its RODO substance becomes the checkbox label (PL from existing copy in `lib/content/contact.ts:94-98`; EN adapted in `contact.en.ts` — clean, not playful: it's legal copy).

**D5 — Step-number fix is one declaration: label color moves from `--muted` to cream.**
`.formShell .field label` gets the cream; the `::before` counter inherits, so number and label brighten together. The orange required-asterisk stays.
*Alternative rejected:* coloring only the `::before` counter full cream — a bright `01 —` next to a muted label reads as a rendering artifact.

*Revised at implementation (user call, 2026-08-14):* the first pass used the careers 72% mix, but on /kontakt's near-black `--color-ink-deep` ground (darker than careers' plum) the user still read it as barely visible. The labels now take full-strength `var(--color-cream)` — the page's own text color, same as the hero lede. This deliberately diverges from the careers recipe: that form sits on the lighter plum, where 72% carries.

## Risks / Trade-offs

- [Careers form touched by the D3 extraction] → import swap only; careers e2e/visual behavior must be verified unchanged. If the extraction turns out hairier than expected (kit-version drift between forms), fall back to local duplication and note it in tasks.
- [Kontakt e2e spec submits the form] → it must now tick the consent box or the happy-path spec goes red; update the spec in the same change. (`e2e/kontakt` is a known standing lane — see the CI flake note; don't misread a consent-caused failure as that flake.)
- [Back link + breadcrumbs both point at the hub on top of each other] → accepted duplication, explicitly requested ("even that we have breadcrumbs, just add it"); aria labels keep them distinguishable.
- [Locale-parity test] → new content keys (back-link label/aria, consent label/error) must land in both `blog.ts`/`blog.en.ts` and `contact.ts`/`contact.en.ts` or the parity test fails — that test is the safety net, not a risk.

## Open Questions

None blocking. EN consent wording drafts in tasks; user reviews copy at implementation time.
